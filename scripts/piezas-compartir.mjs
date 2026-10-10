// Cupido Algorítmico · Las piezas para compartir, fuera del navegador — RLR · Ricardo López Reyero
// El pintor (public/js/piezas.js) dibuja en un lienzo del navegador. Este script abre un Chrome sin ventana,
// le pide las piezas y las guarda como archivos. Sirve para dos cosas:
//
//   node scripts/piezas-compartir.mjs fijas          → las pocas piezas que sí viven como archivo en public/img/compartir/
//                                                      (la imagen de la liga, las insignias para páginas y el corazón)
//   node scripts/piezas-compartir.mjs hojas <carpeta> → hojas de contacto con todas las frases, para revisarlas de un vistazo
//   node scripts/piezas-compartir.mjs una <salida.png> '<receta>'   → una sola pieza
//   node scripts/piezas-compartir.mjs video <salida> '<receta>'     → la pieza en video, para revisarla con ffprobe
//
// Necesita el servidor local corriendo (npm run dev, puerto 8797) y Google Chrome instalado. No usa librerías.
import { spawn } from 'node:child_process';
import { mkdirSync, writeFileSync, mkdtempSync, rmSync } from 'node:fs';
import { tmpdir } from 'node:os';
import { join } from 'node:path';
const _RLR = 'Ricardo López Reyero', _k = 'EYE', _rev = 181218;

const ORIGEN = process.env.ORIGEN || 'http://localhost:8797';
const CHROME = process.env.CHROME || '/Applications/Google Chrome.app/Contents/MacOS/Google Chrome';
const PUERTO = 9377 + Math.floor(Math.random() * 200);
const [modo = 'fijas', destino] = process.argv.slice(2);

const perfil = mkdtempSync(join(tmpdir(), 'cupido-piezas-'));
const chrome = spawn(CHROME, ['--headless=new', `--remote-debugging-port=${PUERTO}`, `--user-data-dir=${perfil}`, '--no-first-run', '--hide-scrollbars', '--force-device-scale-factor=1', 'about:blank'], { stdio: 'ignore' });
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
const guarda = (ruta, dataUrl) => { const b = Buffer.from(dataUrl.split(',')[1], 'base64'); writeFileSync(ruta, b); console.log(' ', ruta, Math.round(b.length / 1024) + ' KB'); };

try {
  await espera(600);
  await evalua(`window.P = await import('/js/piezas.js'); await P.cargarLetras(); return document.fonts.size;`);

  if (modo === 'fijas') {
    const dir = 'public/img/compartir'; mkdirSync(dir, { recursive: true });
    // la imagen que sale al pegar la liga en WhatsApp, Facebook, X o LinkedIn
    guarda(`${dir}/liga.png`, await evalua(`return P.pintar(document.createElement('canvas'), { frase: 'no-app', formato: 'liga', c: 'arriba', e: 'Respondes 43 preguntas una sola vez. Si alguien cruza el 90 % contigo, les avisamos a los dos.' }).toDataURL('image/png');`));
    guarda(`${dir}/liga-ella.png`, await evalua(`return P.pintar(document.createElement('canvas'), { frase: 'manda-ella', formato: 'liga', c: 'arriba', e: 'Nadie te ve. Nadie te escribe sin tu sí. Tu foto la enseñas tú, cuando quieras.' }).toDataURL('image/png');`));
    guarda(`${dir}/liga-gratis.png`, await evalua(`return P.pintar(document.createElement('canvas'), { frase: 'gratis', formato: 'liga', c: 'arriba', e: 'Todo Cupido, sin anuncios y sin letra chica.' }).toDataURL('image/png');`));
    // las insignias para páginas (se pintan al doble para pantallas finas)
    for (const tinta of ['negro', 'blanco']) guarda(`${dir}/insignia-${tinta === 'negro' ? 'clara' : 'oscura'}.png`, await evalua(`return P.pintarInsignia(document.createElement('canvas'), '${tinta}').toDataURL('image/png');`));
    for (const p of ['rosa', 'blanco', 'negro']) guarda(`${dir}/perfil-${p}.png`, await evalua(`return P.pintarPerfil(document.createElement('canvas'), '${p}', 1080).toDataURL('image/png');`));
  } else if (modo === 'hojas') {
    const dir = destino || 'hojas'; mkdirSync(dir, { recursive: true });
    // una hoja por formato con todas las frases; y una con fondos, portadas, perfiles y logotipos
    const hoja = (lista, col, ancho) => `
      const lista = ${lista}, col = ${col}, ancho = ${ancho}, sep = 14;
      const minis = lista.map((r) => r.tipo === 'perfil' ? P.pintarPerfil(document.createElement('canvas'), r.id, ancho) : r.tipo === 'logo' ? P.pintarLogo(document.createElement('canvas'), r) : P.pintar(document.createElement('canvas'), r, { ancho }));
      const alto = Math.max(...minis.map((m) => m.height)), filas = Math.ceil(minis.length / col);
      const H = document.createElement('canvas'); H.width = col * (ancho + sep) + sep; H.height = filas * (alto + sep) + sep; const c = H.getContext('2d'); c.fillStyle = '#d9d9d9'; c.fillRect(0, 0, H.width, H.height);
      minis.forEach((m, i) => { const x = sep + (i % col) * (ancho + sep), y = sep + Math.floor(i / col) * (alto + sep); if (lista[i].tipo === 'logo') { c.fillStyle = lista[i].tinta === 'blanco' ? '#111' : '#fff'; c.fillRect(x, y, ancho, m.height * ancho / m.width); c.drawImage(m, x, y, ancho, m.height * ancho / m.width); } else c.drawImage(m, x, y); });
      return H.toDataURL('image/jpeg', 0.9);`;
    const formatos = await evalua(`return P.FORMATOS.map((f) => f.id);`);
    for (const f of formatos) {
      const ancho = f === 'horizontal' || f === 'liga' ? 460 : 300, col = f === 'horizontal' || f === 'liga' ? 4 : 6, por = col * (f === 'historia' ? 3 : f === 'horizontal' || f === 'liga' ? 6 : 4);
      const total = await evalua(`return P.FRASES.length;`);
      for (let i = 0, n = 1; i < total; i += por, n++) guarda(`${dir}/${f}-${n}.jpg`, await evalua(hoja(`P.FRASES.slice(${i}, ${i + por}).map((x) => ({ frase: x.id, formato: '${f}' }))`, col, ancho)));
    }
    guarda(`${dir}/fondos.jpg`, await evalua(hoja(`['mandan','responder','noventa','dijo-no','sin-publicidad','llena-todo'].flatMap((id) => ['blanco','negro','rosa'].map((fondo) => ({ frase: id, formato: 'retrato', fondo })))`, 6, 300)));
    guarda(`${dir}/codigo.jpg`, await evalua(hoja(`['retrato','cuadrado','historia'].flatMap((formato) => ['blanco','negro','rosa'].map((fondo) => ({ frase: fondo === 'negro' ? 'pareja-ideal' : 'mandan', formato, fondo, liga: 'cupido.capitaltorreon.com/i/k7m2p', qr: 'https://cupido.capitaltorreon.com/i/k7m2p' })))`, 3, 420)));
    guarda(`${dir}/portadas.jpg`, await evalua(hoja(`P.PORTADAS.flatMap((p) => ['blanco','negro'].map((fondo) => ({ frase: 'no-app', formato: p.id, fondo })))`, 2, 900)));
    guarda(`${dir}/marca.jpg`, await evalua(hoja(`[{ tipo: 'perfil', id: 'rosa' }, { tipo: 'perfil', id: 'blanco' }, { tipo: 'perfil', id: 'negro' }, { tipo: 'logo', tinta: 'negro' }, { tipo: 'logo', tinta: 'blanco' }, { tipo: 'logo', tinta: 'negro', una: true }, { tipo: 'logo', tinta: 'negro', solo: true }, { tipo: 'logo', tinta: 'blanco', solo: true, una: true }]`, 4, 420)));
  } else if (modo === 'video') {
    // node scripts/piezas-compartir.mjs video salida '{"frase":"mandan","formato":"historia"}'  → salida.mp4 (o .webm)
    const r = await evalua(`const l = document.createElement('canvas'); l.style.cssText = 'position:fixed;left:0;top:0;width:270px'; document.body.appendChild(l);
      const v = await P.grabarVideo(l, ${process.argv[4] || '{}'}); const b = new Uint8Array(await v.blob.arrayBuffer()); let t = ''; for (let i = 0; i < b.length; i += 32768) t += String.fromCharCode.apply(null, b.subarray(i, i + 32768));
      return { ext: v.ext, segundos: v.segundos, tipo: P.tipoDeVideo(), datos: 'data:;base64,' + btoa(t) };`);
    console.log(' ', r.tipo, r.segundos.toFixed(1) + ' s'); guarda(`${destino}.${r.ext}`, r.datos);
  } else if (modo === 'una') {
    // node scripts/piezas-compartir.mjs una salida.png '{"frase":"mandan","formato":"historia"}'
    guarda(destino, await evalua(`return P.pintar(document.createElement('canvas'), ${process.argv[4] || '{}'}).toDataURL('image/png');`));
  }
} finally {
  try { ws.close(); } catch {}
  chrome.kill(); await espera(300); try { rmSync(perfil, { recursive: true, force: true }); } catch {}
}
