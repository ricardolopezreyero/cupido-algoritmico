/* ─────────────────────────────────────────────────────────────────────────────
   Cupido Algorítmico · La llamada de voz — RLR · Ricardo López Reyero
   Voz dentro de la charla, sin dar el número y sin que nadie vea desde dónde
   se conecta el otro: el audio no va de teléfono a teléfono, pasa por Cupido.
   · Solo existe cuando la otra persona la autorizó (frente a un hombre, ella
     la enciende cuando quiere) y cada llamada se contesta o no se contesta.
   · La voz se comprime con Opus (32 kbps: suena mejor que una llamada de
     teléfono); si un navegador no puede, viaja sin comprimir a 16 kHz.
   · Micrófono con cancelación de eco y de ruido, que para platicar sí ayudan.
   · Si la red se corta, se vuelve a conectar sola; si no regresa, cuelga.
   ───────────────────────────────────────────────────────────────────────────── */
import { avatar, esc } from '/js/ui.js';
import { tocar, precargar } from '/js/sonido.js';

export const _RLR = 'Ricardo López Reyero';
const _k = 'EYE', _rev = 181218;

const CUADRO = 960;                 // 20 ms a 48 kHz
const OPUS = { codec: 'opus', sampleRate: 48000, numberOfChannels: 1, bitrate: 32000 };
const MIC = { echoCancellation: true, noiseSuppression: true, autoGainControl: true, channelCount: 1 };
let cfg = null;                     // { yoId, api, avisar, quien(otra) → { nombre, color } }
let E = libre();
function libre() { return { fase: 'libre', id: null, otra: null, de: null, desde: 0, aqui: false, stream: null, ctx: null, cap: null, sal: null, ws: null, cod: null, dec: null, opusSuyo: false, mudo: false, sec: 0, tUs: 0, reloj: null, timbre: null, reintento: 0, calidad: null, nivel: 0, candado: null, micFalso: null }; }
let puedo = null;                   // { cod, dec }: qué sabe hacer este navegador con Opus
async function capacidades() {
  if (puedo) return puedo;
  let cod = false, dec = false, cfgCod = OPUS;
  if ('AudioEncoder' in window) { // primero con cuadros de 20 ms pedidos de forma explícita; si el navegador no entiende esa opción, sin ella
    try { const fino = { ...OPUS, opus: { frameDuration: 20000 } }; if ((await AudioEncoder.isConfigSupported(fino)).supported === true) { cod = true; cfgCod = fino; } } catch {}
    if (!cod) { try { cod = (await AudioEncoder.isConfigSupported(OPUS)).supported === true; } catch {} }
  }
  try { dec = 'AudioDecoder' in window && (await AudioDecoder.isConfigSupported({ codec: 'opus', sampleRate: 48000, numberOfChannels: 1 })).supported === true; } catch {}
  return (puedo = { cod, dec, cfgCod });
}

export function montarVoz(c) { cfg = c; precargar(['timbre', 'marcando', 'colgar']); capacidades(); }
// Retraso estimado de boca a oído, en milisegundos: cuadro + códec + medio viaje + colchón + bocina
const retraso = () => (E.fase === 'activa' && E.calidad && E.vuelta != null ? Math.round(20 + 15 + E.vuelta / 2 + E.calidad.ms + ((E.ctx?.outputLatency || E.ctx?.baseLatency || 0.01) * 1000)) : null);
export const vozEstado = () => ({ retraso: retraso(), vuelta: E.vuelta != null ? Math.round(E.vuelta) : null, fase: E.fase, id: E.id, otra: E.otra, de: E.de, opus: { mio: puedo, suyo: E.opusSuyo }, calidad: E.calidad, ws: E.ws ? E.ws.readyState : null, ctx: E.ctx ? E.ctx.state : null, enviados: E.sec, recibidos: E.recibidos || 0 });
export const vozPrueba = { cortarCanal: () => { try { E.ws?.close(); } catch {} } }; // para probar la reconexión
const quien = (otra) => cfg.quien(otra) || { nombre: 'Alguien', color: '#d6455f' };

/* ── el micrófono ────────────────────────────────────────────────────────── */
async function microfono() {
  if (window.__cupidoMicFalso) { // para pruebas sin micrófono: un tono suave
    const c = new (window.AudioContext || window.webkitAudioContext)(), o = c.createOscillator(), g = c.createGain(), d = c.createMediaStreamDestination();
    o.frequency.value = 440; g.gain.value = 0.2; o.connect(g).connect(d); o.start(); E.micFalso = c; return d.stream;
  }
  if (!navigator.mediaDevices?.getUserMedia) throw new Error('Este navegador no puede usar el micrófono aquí.');
  try { return await navigator.mediaDevices.getUserMedia({ audio: MIC }); }
  catch { throw new Error('No se pudo usar el micrófono. Revisa el permiso del navegador y vuelve a intentar.'); }
}

/* ── llamar, contestar, colgar ───────────────────────────────────────────── */
export async function vozLlamar(otra) {
  if (E.fase !== 'libre') { cfg.avisar('Ya hay una llamada en curso.'); return; }
  E = { ...libre(), fase: 'pidiendo', otra };
  try {
    E.stream = await microfono(); // primero el micrófono: si no hay permiso, no se le molesta a nadie
    const r = await cfg.api(`/api/charla/${encodeURIComponent(otra)}/llamada`, { accion: 'llamar' });
    if (E.fase !== 'pidiendo') return;
    Object.assign(E, { fase: 'saliente', id: r.id, de: cfg.yoId, aqui: true, desde: Date.now() });
    pintar(); sonar('marcando', 3000, 0.7);
  } catch (e) { soltar(); cfg.avisar(e.message, 5200); }
}
async function contestar() {
  if (E.fase !== 'entrante') return;
  const b = document.querySelector('#voz [data-v="si"]'); if (b) b.disabled = true;
  let contestada = false;
  try {
    E.stream = await microfono();
    E.aqui = true; // antes de avisar: el "ya contestó" puede llegar por el canal de la charla antes que esta respuesta
    await cfg.api(`/api/charla/${encodeURIComponent(E.otra)}/llamada`, { accion: 'contestar' }); contestada = true;
    await empezarAudio(Date.now());
  } catch (e) {
    cfg.avisar(e.message, 5200);
    if (contestada) { colgar(); return; } // contestó pero el audio no arrancó: se cuelga para no dejar al otro hablando solo
    E.aqui = false; if (b) b.disabled = false;
    if (/ya no está sonando|ya terminó/.test(e.message)) terminar('sin_contestar', 0);
  }
}
async function colgar(accion = 'colgar') {
  const otra = E.otra, fase = E.fase;
  if (fase === 'libre') return;
  terminar(fase === 'activa' ? 'terminada' : 'colgue', E.desde && fase === 'activa' ? Math.round((Date.now() - E.desde) / 1000) : 0, true);
  try { await cfg.api(`/api/charla/${encodeURIComponent(otra)}/llamada`, { accion }); } catch {}
}

/* ── lo que avisa el servidor (llega por el canal de la charla; puede llegar repetido) ── */
export function vozEvento(otra, ev) {
  if (!cfg || !ev || !ev.id) return;
  if (ev.fase === 'suena') {
    if (ev.de === cfg.yoId) { // mi propia llamada (o recargué la página mientras sonaba)
      if (E.fase === 'libre') { E = { ...libre(), fase: 'saliente', id: ev.id, otra, de: ev.de, aqui: true, desde: ev.desde || Date.now() }; pintar(); sonar('marcando', 3000, 0.7); }
      else if (E.fase === 'pidiendo' && E.otra === otra) E.id = ev.id;
      return;
    }
    if (E.fase !== 'libre') return; // ya estoy en otra: esta suena y se apaga sola
    E = { ...libre(), fase: 'entrante', id: ev.id, otra, de: ev.de, desde: ev.desde || Date.now() };
    pintar(); sonar('timbre', 2600, 1, true);
    if (document.hidden && 'Notification' in window && Notification.permission === 'granted') { try { const n = new Notification(`${quien(otra).nombre} te está llamando`, { body: 'Llamada de voz en Cupido', icon: '/favicon.svg', tag: 'cupido-voz' }); n.onclick = () => { window.focus(); n.close(); }; } catch {} }
    return;
  }
  if (E.id !== ev.id) return;
  if (ev.fase === 'activa') {
    if (!E.aqui) { soltar(); pintar(); return; } // se contestó en otro dispositivo
    if (E.fase !== 'activa') empezarAudio(ev.desde).catch((e) => { cfg.avisar(e.message, 5200); colgar(); });
    else if (E.reconecta) { E.reconecta = false; pintar(); }
  } else if (ev.fase === 'reconectando') { if (E.fase === 'activa' && ev.quien !== cfg.yoId) { E.reconecta = true; pintar(); } }
  else if (ev.fase === 'fin') terminar(ev.motivo, ev.duracion || 0);
}

/* ── el audio ────────────────────────────────────────────────────────────── */
async function empezarAudio(desde) {
  if (E.fase === 'activa' || E.armando) return;
  E.armando = true; callar();
  try {
    await capacidades();
    if (!E.stream) E.stream = await microfono();
    const AC = window.AudioContext || window.webkitAudioContext;
    let ctx; try { ctx = new AC({ sampleRate: 48000, latencyHint: 'interactive' }); } catch { ctx = new AC(); }
    E.ctx = ctx; try { await ctx.resume(); } catch {}
    await ctx.audioWorklet.addModule('/js/voz-worklet.js');
    const fuente = ctx.createMediaStreamSource(E.stream), cero = ctx.createGain(); cero.gain.value = 0;
    E.cap = new AudioWorkletNode(ctx, 'cupido-captura'); fuente.connect(E.cap); E.cap.connect(cero).connect(ctx.destination);
    E.sal = new AudioWorkletNode(ctx, 'cupido-salida', { numberOfInputs: 0, numberOfOutputs: 1, outputChannelCount: [1] }); E.sal.connect(ctx.destination);
    E.sal.port.onmessage = (e) => { E.calidad = e.data; pintarCalidad(); };
    E.cap.port.onmessage = (e) => enviar(e.data);
    if (puedo.dec) { E.dec = new AudioDecoder({ output: (ad) => { const f = new Float32Array(ad.numberOfFrames); try { ad.copyTo(f, { planeIndex: 0, format: 'f32-planar' }); } catch { try { ad.copyTo(f, { planeIndex: 0 }); } catch {} } const tasa = ad.sampleRate; ad.close(); tocarCuadro(f, tasa); }, error: () => {} }); E.dec.configure({ codec: 'opus', sampleRate: 48000, numberOfChannels: 1 }); }
    Object.assign(E, { fase: 'activa', desde: desde || Date.now(), armando: false });
    abrirCanal();
    try { E.candado = await navigator.wakeLock?.request('screen'); } catch {}
    clearInterval(E.reloj); E.reloj = setInterval(pintarTiempo, 1000);
    pintar(); tocar('en_linea');
  } catch (e) { E.armando = false; throw e; }
}
function abrirCanal() {
  const otra = E.otra, id = E.id;
  const ws = new WebSocket(`${location.protocol === 'https:' ? 'wss' : 'ws'}://${location.host}/api/charla/${encodeURIComponent(otra)}/voz`);
  ws.binaryType = 'arraybuffer'; E.ws = ws;
  const hola = (re) => { try { ws.send(JSON.stringify({ t: 'hola', opus: !!puedo?.dec, re })); } catch {} };
  // un pulso cada dos segundos mide cuánto tarda la ida y vuelta por el canal de voz
  const pulso = () => { try { if (ws.readyState === 1) ws.send(JSON.stringify({ t: 'pulso', ts: performance.now() })); } catch {} };
  ws.onopen = () => { if (E.id !== id) return; E.reintento = 0; E.miCorte = false; hola(false); pintar(); pulso(); clearInterval(E.pulso); E.pulso = setInterval(pulso, 2000); };
  ws.onmessage = (e) => {
    if (E.id !== id) return;
    if (typeof e.data === 'string') { let m; try { m = JSON.parse(e.data); } catch { return; } if (m.t === 'hola') { E.opusSuyo = !!m.opus; if (!m.re) hola(true); } else if (m.t === 'pulso') { try { ws.send(JSON.stringify({ t: 'eco', ts: m.ts })); } catch {} } else if (m.t === 'eco') { const v = performance.now() - m.ts; E.vuelta = E.vuelta ? E.vuelta * 0.7 + v * 0.3 : v; } return; }
    recibir(e.data);
  };
  ws.onclose = () => { // se cayó el canal a media llamada: se intenta de nuevo mientras el servidor nos espera
    if (E.id !== id || E.fase !== 'activa') return;
    E.miCorte = true; pintar();
    if (E.reintento >= 8) return;
    setTimeout(() => { if (E.id === id && E.fase === 'activa') abrirCanal(); }, Math.min(3000, 400 * 2 ** E.reintento++));
  };
  ws.onerror = () => { try { ws.close(); } catch {} };
}
const remuestrear = (f, de, a) => { // lineal: suficiente para voz y para tasas vecinas (44.1 ↔ 48 kHz)
  if (de === a) return f;
  const n = Math.round(f.length * a / de), o = new Float32Array(n), k = (f.length - 1) / Math.max(1, n - 1);
  for (let i = 0; i < n; i++) { const x = i * k, j = Math.floor(x), t = x - j; o[i] = f[j] + ((f[j + 1] ?? f[j]) - f[j]) * t; }
  return o;
};
function cabecera(tipo, carga) { const b = new Uint8Array(5 + carga); b[0] = tipo; new DataView(b.buffer).setUint32(1, E.sec++ >>> 0); return b; }
// Un cuadro de 20 ms del micrófono: se mide, se comprime y se manda
function enviar(f) {
  const ws = E.ws; if (!ws || ws.readyState !== 1 || E.fase !== 'activa') return;
  let s = 0; for (let i = 0; i < f.length; i += 4) s += f[i] * f[i]; E.nivel = Math.min(1, Math.sqrt(s / (f.length / 4)) * 6); pintarNivel();
  if (E.mudo) { ws.send(cabecera(2, 0)); return; }
  const usarOpus = puedo.cod && E.opusSuyo;
  if (ws.bufferedAmount > (usarOpus ? 6000 : 24000)) return; // la red no da abasto: se suelta este cuadro en vez de acumular retraso
  const f48 = remuestrear(f, E.ctx.sampleRate, 48000);
  if (usarOpus) {
    if (!E.cod) { E.cod = new AudioEncoder({ output: (ch) => { const w = E.ws; if (!w || w.readyState !== 1) return; const b = cabecera(1, ch.byteLength); ch.copyTo(b.subarray(5)); w.send(b); }, error: () => { E.cod = null; puedo.cod = false; } }); E.cod.configure(puedo.cfgCod); }
    try { const ad = new AudioData({ format: 'f32', sampleRate: 48000, numberOfFrames: f48.length, numberOfChannels: 1, timestamp: E.tUs, data: f48 }); E.tUs += 20000; E.cod.encode(ad); ad.close(); } catch { puedo.cod = false; }
    return;
  }
  const n = Math.floor(f48.length / 3), b = cabecera(0, n * 2), v = new DataView(b.buffer); // sin comprimir: 16 kHz, 16 bits
  for (let i = 0; i < n; i++) { const m = (f48[i * 3] + f48[i * 3 + 1] + f48[i * 3 + 2]) / 3; v.setInt16(5 + i * 2, Math.max(-1, Math.min(1, m)) * 32767, true); }
  ws.send(b);
}
function recibir(buf) {
  if (buf.byteLength < 5 || !E.sal) return;
  const b = new Uint8Array(buf), tipo = b[0], sec = new DataView(buf).getUint32(1);
  E.recibidos = (E.recibidos || 0) + 1;
  if (tipo === 2) { tocarCuadro(new Float32Array(CUADRO), 48000); return; }
  if (tipo === 1) { if (E.dec && E.dec.state === 'configured') { try { E.dec.decode(new EncodedAudioChunk({ type: 'key', timestamp: sec * 20000, data: b.subarray(5) })); } catch {} } return; }
  const v = new DataView(buf, 5), n = Math.floor(v.byteLength / 2), f = new Float32Array(n * 3);
  let ant = E.ultimaMuestra || 0;
  for (let i = 0; i < n; i++) { const x = v.getInt16(i * 2, true) / 32768; f[i * 3] = ant + (x - ant) / 3; f[i * 3 + 1] = ant + (x - ant) * 2 / 3; f[i * 3 + 2] = x; ant = x; }
  E.ultimaMuestra = ant; tocarCuadro(f, 48000);
}
function tocarCuadro(f, tasa) { if (!E.sal || !E.ctx) return; const o = remuestrear(f, tasa, E.ctx.sampleRate); E.sal.port.postMessage(o, [o.buffer]); }

/* ── terminar y soltar todo ──────────────────────────────────────────────── */
function soltar() {
  callar(); clearInterval(E.reloj); clearInterval(E.pulso);
  try { E.stream?.getTracks().forEach((t) => t.stop()); } catch {}
  try { if (E.ws) { E.ws.onclose = null; E.ws.close(); } } catch {}
  try { E.cod?.close(); } catch {} try { E.dec?.close(); } catch {}
  try { E.ctx?.close(); } catch {} try { E.micFalso?.close(); } catch {}
  try { E.candado?.release(); } catch {}
  E = libre();
}
function terminar(motivo, duracion, yoColgue = false) {
  if (E.fase === 'libre') return;
  const otra = E.otra, era = E.fase, mia = E.de === cfg.yoId, n = quien(otra).nombre;
  soltar();
  if (era === 'pidiendo') { pintar(); return; }
  tocar('colgar');
  const txt = era === 'activa' || motivo === 'terminada' ? `Llamada terminada${duracion ? ' · ' + tiempo(duracion) : ''}` : yoColgue ? (mia ? 'Llamada cancelada' : 'No contestaste. No pasa nada.') : mia ? `${n} no contestó. Déjale un mensaje.` : 'La llamada dejó de sonar.';
  const z = raiz(); z.className = 'voz fin'; z.innerHTML = `<div class="voz-barra"><span class="voz-ico">📞</span><div class="voz-txt"><b>${esc(txt)}</b></div></div>`; z.hidden = false;
  setTimeout(() => { if (E.fase === 'libre') { z.hidden = true; z.innerHTML = ''; } }, 3200);
  cfg.alTerminar?.(otra);
}

/* ── sonar: el timbre de quien recibe y el tono de quien llama ───────────── */
function sonar(id, cada, fuerza, vibra = false) {
  callar();
  const una = () => { tocar(id, { fuerza }); if (vibra) { try { navigator.vibrate?.([220, 120, 220]); } catch {} } };
  una(); E.timbre = setInterval(una, cada);
}
function callar() { clearInterval(E.timbre); E.timbre = null; try { navigator.vibrate?.(0); } catch {} }

/* ── lo que se ve ────────────────────────────────────────────────────────── */
const tiempo = (s) => `${Math.floor(s / 60)}:${String(Math.floor(s % 60)).padStart(2, '0')}`;
function raiz() { let z = document.getElementById('voz'); if (!z) { z = document.createElement('div'); z.id = 'voz'; z.hidden = true; document.body.appendChild(z); z.addEventListener('click', (e) => { const b = e.target.closest('[data-v]'); if (!b) return; const v = b.dataset.v; if (v === 'si') contestar(); else if (v === 'no') colgar('rechazar'); else if (v === 'colgar') colgar(); else if (v === 'mudo') { E.mudo = !E.mudo; pintar(); } }); } return z; }
function pintar() {
  const z = raiz();
  if (E.fase === 'libre' || E.fase === 'pidiendo') { z.hidden = true; z.innerHTML = ''; return; }
  const q = quien(E.otra), n = esc(q.nombre);
  z.hidden = false;
  if (E.fase === 'entrante') {
    z.className = 'voz entrante';
    z.innerHTML = `<div class="voz-velo"></div><div class="voz-tarjeta" role="alertdialog" aria-label="Llamada de ${n}">
      <div class="voz-av">${avatar(q.nombre, q.color, 'xl')}</div>
      <p class="eyebrow" style="margin:0">Llamada de voz</p><h3>${n} te está llamando</h3>
      <p class="voz-nota">Dentro de Cupido: no ve tu número ni desde dónde te conectas. Contestas solo si quieres.</p>
      <div class="voz-acc"><button type="button" class="voz-b si" data-v="si">📞 Contestar</button><button type="button" class="voz-b no" data-v="no">Ahora no</button></div></div>`;
    return;
  }
  const activa = E.fase === 'activa';
  z.className = `voz ${activa ? 'activa' : 'saliente'}`;
  z.innerHTML = `<div class="voz-barra">${avatar(q.nombre, q.color, 'sm')}
    <div class="voz-txt"><b>${n}</b><span id="voz-estado">${activa ? (E.miCorte || E.reconecta ? 'Reconectando…' : tiempo((Date.now() - E.desde) / 1000)) : 'Llamando…'}</span></div>
    ${activa ? `<span class="voz-nivel" id="voz-nivel" title="Tu micrófono"><i></i><i></i><i></i><i></i></span><span class="voz-cal" id="voz-cal" title="Calidad de la llamada"></span>
      <button type="button" class="voz-r ${E.mudo ? 'on' : ''}" data-v="mudo" title="${E.mudo ? 'Activar mi micrófono' : 'Silenciar mi micrófono'}" aria-pressed="${E.mudo}">${E.mudo ? '🔇' : '🎙️'}</button>` : ''}
    <button type="button" class="voz-r colgar" data-v="colgar" title="${activa ? 'Colgar' : 'Cancelar la llamada'}">✕</button></div>`;
  pintarCalidad();
}
function pintarTiempo() { const e = document.getElementById('voz-estado'); if (e && E.fase === 'activa' && !E.miCorte && !E.reconecta) e.textContent = tiempo((Date.now() - E.desde) / 1000); }
let ultimoNivel = 0;
function pintarNivel() { const t = performance.now(); if (t - ultimoNivel < 90) return; ultimoNivel = t; const z = document.getElementById('voz-nivel'); if (!z) return; const k = E.mudo ? 0 : Math.round(E.nivel * 4); [...z.children].forEach((b, i) => b.classList.toggle('on', i < k)); }
function pintarCalidad() { const c = document.getElementById('voz-cal'); if (!c || !E.calidad) return; const antes = E.cortesVistos ?? E.calidad.cortes, mal = E.calidad.cortes - antes > 1 || E.calidad.obj > 220 || (E.vuelta || 0) > 500; E.cortesVistos = E.calidad.cortes; c.className = `voz-cal ${mal ? 'regular' : 'bien'}`; const r = retraso(); c.title = (mal ? 'La red viene a tirones' : 'Se oye bien') + (r ? ` · retraso de unos ${r} ms` : ''); }
// RLR
