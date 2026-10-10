// Cupido Algorítmico · Los videos para compartir, hechos de una vez — RLR · Ricardo López Reyero
// Cada frase marcada con v en public/js/frases.js sale aquí como video vertical (1080 × 1920, 30 cuadros por segundo, H.264),
// en dos versiones: sin audio y con su música de fondo. Quedan en public/videos/ y la galería los entrega al toque.
//
//   node scripts/videos-compartir.mjs                  → todos los que falten
//   node scripts/videos-compartir.mjs --todos          → todos, aunque ya existan (si cambió el pintor o una frase)
//   node scripts/videos-compartir.mjs mandan noventa   → solo esos
//
// Cómo: un Chrome sin ventana pinta cada cuadro con el mismo pintor de la página (public/js/piezas.js) y ffmpeg los une.
// Así el video es idéntico a lo que se ve en la galería, sin cuadros perdidos. La música es la de public/musica/
// (creada con ElevenLabs por el servidor; ver src/sonidos.js). Necesita el servidor local (npm run dev), Google Chrome y ffmpeg.
import { spawn } from 'node:child_process';
import { mkdirSync, mkdtempSync, rmSync, existsSync, statSync, writeFileSync, renameSync } from 'node:fs';
import { tmpdir } from 'node:os';
import { join } from 'node:path';
const _RLR = 'Ricardo López Reyero', _k = 'EYE', _rev = 181218;

const ORIGEN = process.env.ORIGEN || 'http://localhost:8797';
const CHROME = process.env.CHROME || '/Applications/Google Chrome.app/Contents/MacOS/Google Chrome';
const PUERTO = 9600 + Math.floor(Math.random() * 200);
const CPS = 30, DESTINO = 'public/videos', MUSICA = 'public/musica';
const args = process.argv.slice(2), todos = args.includes('--todos'), pedidos = args.filter((a) => !a.startsWith('--'));

const perfil = mkdtempSync(join(tmpdir(), 'cupido-videos-'));
const chrome = spawn(CHROME, ['--headless=new', `--remote-debugging-port=${PUERTO}`, `--user-data-dir=${perfil}`, '--no-first-run', '--force-device-scale-factor=1', 'about:blank'], { stdio: 'ignore' });
const espera = (ms) => new Promise((ok) => setTimeout(ok, ms));
async function pestana() {
  for (let i = 0; i < 60; i++) { try { const r = await fetch(`http://127.0.0.1:${PUERTO}/json/new?${encodeURIComponent(ORIGEN + '/__piezas')}`, { method: 'PUT' }); if (r.ok) return (await r.json()).webSocketDebuggerUrl; } catch {} await espera(250); }
  throw new Error('Chrome no respondió');
}
const ws = new WebSocket(await pestana()); await new Promise((ok, mal) => { ws.onopen = ok; ws.onerror = mal; });
let turno = 0; const pendientes = new Map();
ws.onmessage = (e) => { const m = JSON.parse(e.data); const p = pendientes.get(m.id); if (p) { pendientes.delete(m.id); m.error ? p.mal(new Error(m.error.message)) : p.ok(m.result); } };
const manda = (method, params = {}) => new Promise((ok, mal) => { const id = ++turno; pendientes.set(id, { ok, mal }); ws.send(JSON.stringify({ id, method, params })); });
async function evalua(expresion) {
  const r = await manda('Runtime.evaluate', { expression: `(async () => { ${expresion} })()`, awaitPromise: true, returnByValue: true });
  if (r.exceptionDetails) throw new Error(r.exceptionDetails.exception?.description || r.exceptionDetails.text);
  return r.result.value;
}
// ffmpeg con su entrada abierta: devuelve cómo escribirle y cómo esperar a que termine
function ffmpeg(argumentos, conEntrada = false) {
  const p = spawn('ffmpeg', ['-hide_banner', '-loglevel', 'error', '-y', ...argumentos], { stdio: [conEntrada ? 'pipe' : 'ignore', 'ignore', 'pipe'] });
  let queja = ''; p.stderr.on('data', (d) => { queja += d; });
  const fin = new Promise((ok, mal) => p.on('close', (c) => (c === 0 ? ok() : mal(new Error('ffmpeg: ' + queja.slice(-400))))));
  const escribe = (b) => new Promise((ok) => { if (p.stdin.write(b)) ok(); else p.stdin.once('drain', ok); });
  return { escribe, cierra: () => p.stdin.end(), fin };
}
const kb = (ruta) => Math.round(statSync(ruta).size / 1024);

try {
  await espera(600);
  const lista = await evalua(`window.P = await import('/js/piezas.js'); await P.cargarLetras(); window.lienzo = document.createElement('canvas');
    window.cuadros = (receta, desde, hasta) => { const s = []; for (let i = desde; i < hasta; i++) { P.pintar(lienzo, receta, { momento: i / ${CPS} }); s.push(lienzo.toDataURL('image/png')); } return s; };
    return P.VIDEOS.map((f) => { const receta = { frase: f.id, formato: 'historia' }; return { id: f.id, musica: P.musicaDe(f), dura: P.duracionDe(receta), quieto: P.quietoDesde(receta) }; });`);
  mkdirSync(DESTINO, { recursive: true });
  const hacer = lista.filter((v) => (pedidos.length ? pedidos.includes(v.id) : todos || !existsSync(`${DESTINO}/${v.id}.mp4`) || !existsSync(`${DESTINO}/${v.id}-audio.mp4`)));
  console.log(`${lista.length} videos en la lista · ${hacer.length} por hacer`);
  const t0 = Date.now(); let n = 0;
  for (const v of hacer) {
    const total = Math.round(v.dura * CPS), vivos = Math.min(total, Math.ceil(v.quieto * CPS) + 1), receta = JSON.stringify({ frase: v.id, formato: 'historia' });
    const mudo = `${DESTINO}/${v.id}.mp4`, sonoro = `${DESTINO}/${v.id}-audio.mp4`, tmp = `${DESTINO}/.${v.id}.tmp.mp4`;
    // 1. los cuadros → H.264. Blanco limpio y rosa fiel: de sRGB completo a BT.709 de video, que es lo que esperan las redes
    const f = ffmpeg(['-f', 'image2pipe', '-framerate', String(CPS), '-c:v', 'png', '-i', 'pipe:0', '-an',
      '-vf', 'scale=in_range=full:out_range=tv:out_color_matrix=bt709,format=yuv420p', '-c:v', 'libx264', '-preset', 'slower', '-tune', 'animation', '-crf', '23', '-profile:v', 'high', '-level', '4.1', '-g', String(CPS * 10),   // un solo cuadro clave: son clips de segundos, y así pesan la mitad
      '-color_range', 'tv', '-colorspace', 'bt709', '-color_primaries', 'bt709', '-color_trc', 'bt709', '-r', String(CPS), '-movflags', '+faststart', tmp], true);
    let ultimo = null;
    for (let i = 0; i < vivos; i += 6) {
      for (const d of await evalua(`return cuadros(${receta}, ${i}, ${Math.min(vivos, i + 6)});`)) { ultimo = Buffer.from(d.slice(d.indexOf(',') + 1), 'base64'); await f.escribe(ultimo); }
    }
    for (let i = vivos; i < total; i++) await f.escribe(ultimo);   // de aquí en adelante la imagen ya no cambia: el mismo cuadro, las veces que falten
    f.cierra(); await f.fin; renameSync(tmp, mudo);
    // 2. la misma imagen con su música: entra suave, y se va suave segundo y medio antes del final
    const D = (total / CPS).toFixed(3), baja = Math.max(0.5, total / CPS - 1.6).toFixed(3);
    await ffmpeg(['-i', mudo, '-i', `${MUSICA}/${v.musica}.mp3`, '-filter_complex', `[1:a]atrim=0:${D},afade=t=in:st=0:d=0.25,afade=t=out:st=${baja}:d=1.6,apad=whole_dur=${D}[a]`,
      '-map', '0:v', '-map', '[a]', '-c:v', 'copy', '-c:a', 'aac', '-b:a', '128k', '-ar', '44100', '-ac', '2', '-t', D, '-movflags', '+faststart', tmp]).fin;
    renameSync(tmp, sonoro);
    v.kb = kb(mudo); v.kbAudio = kb(sonoro); n++;
    console.log(`  ${String(n).padStart(3)}/${hacer.length} ${v.id.padEnd(20)} ${v.dura.toFixed(1)} s · ${vivos}/${total} cuadros · ${v.kb} KB · con ${v.musica}: ${v.kbAudio} KB`);
  }
  // la lista que lee la galería: qué videos hay, cuánto duran y cuánto pesan
  const indice = {}; let suma = 0, sumaAudio = 0;
  for (const v of lista) { if (!existsSync(`${DESTINO}/${v.id}.mp4`) || !existsSync(`${DESTINO}/${v.id}-audio.mp4`)) continue; indice[v.id] = { s: Math.round(v.dura * 10) / 10, m: v.musica, kb: kb(`${DESTINO}/${v.id}.mp4`), kba: kb(`${DESTINO}/${v.id}-audio.mp4`) }; suma += indice[v.id].kb; sumaAudio += indice[v.id].kba; }
  writeFileSync(`${DESTINO}/lista.json`, JSON.stringify(indice));
  console.log(`listo: ${Object.keys(indice).length} videos · sin audio ${(suma / 1024).toFixed(1)} MB · con audio ${(sumaAudio / 1024).toFixed(1)} MB · ${Math.round((Date.now() - t0) / 1000)} s`);
} finally {
  try { ws.close(); } catch {}
  chrome.kill(); await espera(300); try { rmSync(perfil, { recursive: true, force: true }); } catch {}
}
