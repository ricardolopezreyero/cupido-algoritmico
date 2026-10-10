/* ─────────────────────────────────────────────────────────────────────────────
   Cupido Algorítmico · La experiencia auditiva — RLR · Ricardo López Reyero
   Reglas: todo precargado y decodificado antes de que haga falta; del evento al
   sonido, cero espera (AudioBufferSourceNode, sin red ni decodificación en el
   momento). Cada sonido tiene su familia y la persona apaga lo que no quiera.
   Si un archivo no llega, suena una campana hecha por código: nunca silencio
   por error. En iPhone el audio se desbloquea con el primer toque.
   ───────────────────────────────────────────────────────────────────────────── */
export const _RLR = 'Ricardo López Reyero';
const _k = 'EYE', _rev = 181218;

// Catálogo: id → { f: familia, v: volumen relativo, tono: respaldo por código [Hz, Hz…] }
export const FAMILIAS = {
  charla: { n: 'Charla', d: 'Mensajes que llegan, que mandas, reacciones, notas de voz, cartas y detalles' },
  coincidencias: { n: 'Coincidencias y puertas', d: 'Cuando alguien cruza el 90 %, tu sí y la puerta que se abre' },
  logros: { n: 'Logros e hitos', d: 'Cuando desbloqueas algo o la charla cruza una marca' },
  interfaz: { n: 'Interfaz', d: 'Toques, guardado, cambios de estilo y avisos' },
  recorrido: { n: 'El recorrido', d: 'Cada paso y la entrada a Cupido' },
};
export const SONIDOS = {
  mensaje:      { f: 'charla',        v: 0.9,  tono: [1175, 1568] },
  enviado:      { f: 'charla',        v: 0.5,  tono: [880] },
  reaccion:     { f: 'charla',        v: 0.6,  tono: [1319, 1760] },
  sticker:      { f: 'charla',        v: 0.6,  tono: [988, 1319] },
  voz_inicio:   { f: 'charla',        v: 0.6,  tono: [660, 880] },
  voz_fin:      { f: 'charla',        v: 0.6,  tono: [880, 660] },
  en_linea:     { f: 'charla',        v: 0.4,  tono: [1047] },
  detalle:      { f: 'charla',        v: 0.85, tono: [1047, 1319, 1568, 2093] },
  carta:        { f: 'charla',        v: 0.7,  tono: [880, 1175, 1480] },
  tono:         { f: 'coincidencias', v: 0.95, tono: [659, 880, 1109, 1319, 1760] },
  coincidencia: { f: 'coincidencias', v: 1,    tono: [784, 988, 1175, 1568] },
  si:           { f: 'coincidencias', v: 0.8,  tono: [988, 1319] },
  puerta:       { f: 'coincidencias', v: 1,    tono: [523, 659, 784, 1047, 1319] },
  logro:        { f: 'logros',        v: 0.9,  tono: [1047, 1319, 1568] },
  hito:         { f: 'logros',        v: 0.8,  tono: [1319, 1568, 2093] },
  toque:        { f: 'interfaz',      v: 0.35, tono: [1760] },
  guardado:     { f: 'interfaz',      v: 0.45, tono: [1319, 1760] },
  aviso:        { f: 'interfaz',      v: 0.7,  tono: [1175, 1480] },
  error:        { f: 'interfaz',      v: 0.6,  tono: [440, 349] },
  estilo:       { f: 'interfaz',      v: 0.5,  tono: [1175] },
  paso:         { f: 'recorrido',     v: 0.5,  tono: [1047, 1319] },
  bienvenida:   { f: 'recorrido',     v: 1,    tono: [523, 659, 784, 1047] },
  gracias:      { f: 'logros',        v: 1,    tono: [659, 784, 988, 1319] },
};

const LLAVE = 'cupido.sonido.v2';
const leer = () => { try { return JSON.parse(localStorage.getItem(LLAVE) || '{}'); } catch { return {}; } };
const escribir = (o) => { try { localStorage.setItem(LLAVE, JSON.stringify(o)); } catch {} };
// Migración del interruptor viejo (cupido.sonido = 'no')
try { if (localStorage.getItem('cupido.sonido') === 'no' && !localStorage.getItem(LLAVE)) escribir({ on: false }); } catch {}

export const ajustes = () => ({ on: true, volumen: 0.8, familias: {}, ...leer() });
export const activo = (id) => { const a = ajustes(); if (!a.on) return false; const s = SONIDOS[id]; return !!s && a.familias[s.f] !== false; };
export function ajustar(cambio) { escribir({ ...ajustes(), ...cambio }); }
export function ajustarFamilia(f, on) { const a = ajustes(); a.familias = { ...a.familias, [f]: on }; escribir(a); }

let ctx = null, listo = false, desbloqueado = false;
const buffers = new Map(), cargando = new Map();
let maestro = null;

function contexto() {
  if (ctx) return ctx;
  const AC = window.AudioContext || window.webkitAudioContext; if (!AC) return null;
  ctx = new AC({ latencyHint: 'interactive' });
  maestro = ctx.createGain(); maestro.gain.value = ajustes().volumen; maestro.connect(ctx.destination);
  return ctx;
}
// iPhone y Chrome: el audio se desbloquea con el primer gesto. Lo hacemos una sola vez y en silencio.
function desbloquear() {
  const c = contexto(); if (!c || desbloqueado) return;
  const intento = () => { if (c.state === 'suspended') c.resume().catch(() => {}); try { const b = c.createBuffer(1, 1, 22050), s = c.createBufferSource(); s.buffer = b; s.connect(c.destination); s.start(0); } catch {} if (c.state === 'running') { desbloqueado = true; quitar(); } };
  const quitar = () => ['pointerdown', 'touchend', 'keydown', 'click'].forEach((e) => document.removeEventListener(e, intento, true));
  ['pointerdown', 'touchend', 'keydown', 'click'].forEach((e) => document.addEventListener(e, intento, { capture: true, passive: true }));
  intento();
}

// Precarga: trae y decodifica todos los archivos de una vez (en paralelo, con la caché del navegador)
export async function precargar(ids = Object.keys(SONIDOS)) {
  const c = contexto(); if (!c) return;
  desbloquear();
  await Promise.all(ids.map(async (id) => {
    if (buffers.has(id) || cargando.has(id)) return cargando.get(id);
    const p = (async () => {
      try {
        const r = await fetch(`/sonidos/${id}.mp3`, { cache: 'force-cache' });
        if (!r.ok) throw new Error(r.status);
        const datos = await r.arrayBuffer();
        const b = await new Promise((res, rej) => { const q = c.decodeAudioData(datos, res, rej); if (q && q.then) q.then(res, rej); });
        buffers.set(id, b);
      } catch { buffers.set(id, null); } // null = usar el respaldo por código
    })();
    cargando.set(id, p); await p; cargando.delete(id);
  }));
  listo = true;
}

// Respaldo por código: campanitas suaves con el tono del catálogo
function campana(c, frecs, vol) {
  const t0 = c.currentTime;
  frecs.forEach((f, i) => { const o = c.createOscillator(), g = c.createGain(); o.type = 'sine'; o.frequency.value = f; const t = t0 + i * 0.07; g.gain.setValueAtTime(0, t); g.gain.linearRampToValueAtTime(vol * 0.06, t + 0.012); g.gain.exponentialRampToValueAtTime(0.0001, t + 0.28); o.connect(g).connect(maestro); o.start(t); o.stop(t + 0.3); });
}

const ultimo = new Map();
// Toca un sonido. Del evento al sonido no hay espera: el buffer ya está decodificado.
export function tocar(id, { fuerza = 1 } = {}) {
  const s = SONIDOS[id]; if (!s || !activo(id)) return false;
  const c = contexto(); if (!c) return false;
  const ahora = performance.now(); if (ahora - (ultimo.get(id) || 0) < 80) return false; ultimo.set(id, ahora); // sin ametralladora
  if (c.state === 'suspended') { c.resume().catch(() => {}); }
  maestro.gain.value = ajustes().volumen;
  const b = buffers.get(id);
  try {
    if (b) { const src = c.createBufferSource(); src.buffer = b; const g = c.createGain(); g.gain.value = s.v * fuerza; src.connect(g).connect(maestro); src.start(0); }
    else { campana(c, s.tono, s.v * fuerza); if (b === undefined && !cargando.has(id)) precargar([id]); }
    return true;
  } catch { return false; }
}

// El panel: un interruptor general, volumen, y una fila por familia con "probar"
export function panelSonido(contenedor) {
  const a = ajustes();
  contenedor.innerHTML = `<div class="son-panel">
    <label class="son-fila principal"><span><b>🔈 Sonido</b><small>Cupido suena suave y solo cuando pasa algo. Tú eliges qué.</small></span><input type="checkbox" id="son-on" ${a.on ? 'checked' : ''}></label>
    <label class="son-fila"><span><b>Volumen</b></span><input type="range" id="son-vol" min="0" max="1" step="0.05" value="${a.volumen}"></label>
    ${Object.entries(FAMILIAS).map(([f, x]) => `<label class="son-fila"><span><b>${x.n}</b><small>${x.d}</small></span><button type="button" class="son-probar" data-probar="${f}" title="Probar">▶</button><input type="checkbox" data-fam="${f}" ${a.familias[f] === false ? '' : 'checked'}></label>`).join('')}
  </div>`;
  contenedor.querySelector('#son-on').onchange = (e) => { ajustar({ on: e.target.checked }); if (e.target.checked) tocar('guardado'); };
  contenedor.querySelector('#son-vol').oninput = (e) => { ajustar({ volumen: Number(e.target.value) }); };
  contenedor.querySelector('#son-vol').onchange = () => tocar('toque');
  contenedor.querySelectorAll('[data-fam]').forEach((i) => i.onchange = () => { ajustarFamilia(i.dataset.fam, i.checked); if (i.checked) tocar(Object.keys(SONIDOS).find((k) => SONIDOS[k].f === i.dataset.fam)); });
  contenedor.querySelectorAll('[data-probar]').forEach((b) => b.onclick = () => { const f = b.dataset.probar; const ids = Object.keys(SONIDOS).filter((k) => SONIDOS[k].f === f); const antes = ajustes(); ajustar({ on: true }); ajustarFamilia(f, true); tocar(ids[Math.floor(Math.random() * ids.length)]); setTimeout(() => { ajustar({ on: antes.on }); ajustarFamilia(f, antes.familias[f] !== false); }, 50); });
}
export const estaListo = () => listo;
// RLR
