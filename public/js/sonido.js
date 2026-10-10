/* ─────────────────────────────────────────────────────────────────────────────
   Cupido Algorítmico · La experiencia auditiva — RLR · Ricardo López Reyero
   Lo que suena en Cupido son avisos y efectos cortos: 26 sonidos en 4 familias.
   · Encender o apagar es UN toque: el interruptor vive en el menú de la izquierda
     (y arriba, en las páginas que no tienen menú). Lo fino (volumen y qué familia
     suena) está detrás del engrane, para quien lo quiera.
   · Apagar el sonido calla los avisos y efectos. Lo que la persona pone a sonar
     a propósito (una nota de voz, un video, la voz de una llamada) se oye siempre.
   · Todo precargado y decodificado antes de que haga falta: del evento al sonido,
     cero espera. Si un archivo no llega, suena una campana hecha por código.
   · Mientras se graba (nota de voz, voz o video del perfil) los efectos se callan
     solos, para que no queden grabados.
   · La preferencia se guarda en este equipo y viaja con la cuenta (login.js la
     sincroniza por su clave: cupido.sonido.v2).
   ───────────────────────────────────────────────────────────────────────────── */
export const _RLR = 'Ricardo López Reyero';
const _k = 'EYE', _rev = 181218;

// Las familias: lo que se puede apagar por separado. Antes eran seis; «interfaz», «logros» y «recorrido» ahora son una.
export const FAMILIAS = {
  charla: { i: '💬', n: 'La charla', d: 'Mensajes que llegan y que mandas, reacciones, notas de voz, cartas y detalles' },
  coincidencias: { i: '💘', n: 'Coincidencias y puertas', d: 'Cuando alguien cruza el 90 %, tu sí, la puerta que se abre y cuando los dos eligen coqueteo' },
  llamadas: { i: '📞', n: 'Llamadas', d: 'El timbre cuando te llaman, el tono mientras llamas y el final de la llamada' },
  app: { i: '✨', n: 'Toques de la app', d: 'Botones, guardado, pasos, logros y avisos' },
};
// Catálogo: id → { f: familia, v: volumen relativo, tono: respaldo por código [Hz…], c: cuándo suena }
export const SONIDOS = {
  mensaje:      { f: 'charla',        v: 0.9,  tono: [1175, 1568], c: 'Te llega un mensaje' },
  enviado:      { f: 'charla',        v: 0.5,  tono: [880], c: 'Mandas un mensaje' },
  reaccion:     { f: 'charla',        v: 0.6,  tono: [1319, 1760], c: 'Una reacción, tuya o suya, y cuando alguien responde una carta' },
  sticker:      { f: 'charla',        v: 0.6,  tono: [988, 1319], c: 'Mandas un sticker' },
  voz_inicio:   { f: 'charla',        v: 0.6,  tono: [660, 880], c: 'Empiezas a grabar una nota de voz' },
  voz_fin:      { f: 'charla',        v: 0.6,  tono: [880, 660], c: 'Terminas de grabar una nota de voz' },
  en_linea:     { f: 'charla',        v: 0.4,  tono: [1047], c: 'La otra persona entra a la charla, o una llamada empieza a oírse' },
  detalle:      { f: 'charla',        v: 0.85, tono: [1047, 1319, 1568, 2093], c: 'Mandas o recibes un detalle: una flor, un café' },
  carta:        { f: 'charla',        v: 0.7,  tono: [880, 1175, 1480], c: 'Sacas una carta, o se abre una que ya contestaron los dos' },
  tono:         { f: 'coincidencias', v: 0.95, tono: [659, 880, 1109, 1319, 1760], c: 'Los dos eligieron coqueteo' },
  coincidencia: { f: 'coincidencias', v: 1,    tono: [784, 988, 1175, 1568], c: 'Alguien cruzó el 90 % contigo, y cuando entras al matching' },
  si:           { f: 'coincidencias', v: 0.8,  tono: [988, 1319], c: 'Dices que sí' },
  puerta:       { f: 'coincidencias', v: 1,    tono: [523, 659, 784, 1047, 1319], c: 'Se abre una puerta' },
  timbre:       { f: 'llamadas',      v: 1,    tono: [784, 988, 784, 988, 1175], c: 'Te están llamando' },
  marcando:     { f: 'llamadas',      v: 0.6,  tono: [659, 659], c: 'Estás llamando y esperas a que contesten' },
  colgar:       { f: 'llamadas',      v: 0.6,  tono: [784, 587], c: 'Termina una llamada' },
  toque:        { f: 'app',           v: 0.35, tono: [1760], c: 'Tocas una opción' },
  guardado:     { f: 'app',           v: 0.45, tono: [1319, 1760], c: 'Algo se guardó, y al encender el sonido' },
  aviso:        { f: 'app',           v: 0.7,  tono: [1175, 1480], c: 'Hay un aviso nuevo en tu tablero que no es coincidencia ni puerta' },
  error:        { f: 'app',           v: 0.6,  tono: [440, 349], c: 'Algo no se pudo hacer' },
  estilo:       { f: 'app',           v: 0.5,  tono: [1175], c: 'Cambias el color o la letra de tu tablero' },
  paso:         { f: 'app',           v: 0.5,  tono: [1047, 1319], c: 'Avanzas un paso en el recorrido o en el cuestionario' },
  bienvenida:   { f: 'app',           v: 1,    tono: [523, 659, 784, 1047], c: 'Terminas el recorrido' },
  logro:        { f: 'app',           v: 0.9,  tono: [1047, 1319, 1568], c: 'Ganas un logro, o dejas lista tu foto, tu voz o tu video' },
  hito:         { f: 'app',           v: 0.8,  tono: [1319, 1568, 2093], c: 'Una charla cruza una marca' },
  gracias:      { f: 'app',           v: 1,    tono: [659, 784, 988, 1319], c: 'Se confirma un apoyo al programa' },
};

/* ── la preferencia: encendido, volumen y qué familias ───────────────────── */
export const LLAVE = 'cupido.sonido.v2';
const CAMBIO = 'cupido:sonido';
const leer = () => { try { const o = JSON.parse(localStorage.getItem(LLAVE) || '{}'); return o && typeof o === 'object' ? o : {}; } catch { return {}; } };
// Migración del interruptor más viejo (cupido.sonido = 'no')
try { if (localStorage.getItem('cupido.sonido') === 'no' && !localStorage.getItem(LLAVE)) localStorage.setItem(LLAVE, JSON.stringify({ on: false })); } catch {}

export function ajustes() {
  const o = leer(), f = o.familias || {};
  const apagadas = Object.keys(FAMILIAS).filter((k) => f[k] === false || (k === 'app' && f.app === undefined && f.interfaz === false)); // quien había apagado «interfaz» conserva apagados los toques
  return { on: o.on !== false, volumen: Number.isFinite(o.volumen) ? Math.max(0, Math.min(1, o.volumen)) : 0.8, familias: Object.fromEntries(apagadas.map((k) => [k, false])) };
}
function escribir(a) { try { localStorage.setItem(LLAVE, JSON.stringify({ on: a.on, volumen: a.volumen, familias: a.familias })); } catch {} try { window.dispatchEvent(new CustomEvent(CAMBIO, { detail: ajustes() })); } catch {} }
export const activo = (id) => { const a = ajustes(); if (!a.on) return false; const s = SONIDOS[id]; return !!s && a.familias[s.f] !== false; };
export function ajustar(cambio) { escribir({ ...ajustes(), ...cambio }); }
export function ajustarFamilia(f, on) { const a = ajustes(); if (on) delete a.familias[f]; else a.familias[f] = false; escribir(a); }
// Avisa cuando la preferencia cambia: aquí, en otra pestaña o porque llegó de la cuenta
export function alCambiar(fn) {
  window.addEventListener(CAMBIO, () => fn(ajustes()));
  window.addEventListener('storage', (e) => { if (e.key === LLAVE || e.key === null) fn(ajustes()); });
}
// Un toque: encender o apagar. Al encender suena una confirmación, para que se oiga que sí quedó.
export function alternar(on = !ajustes().on) { ajustar({ on }); if (on) { precargar(['guardado']); tocar('guardado'); } return on; }
// Mientras se graba, los efectos se callan solos (cada «callar(true)» se cierra con su «callar(false)»)
let mudo = 0;
export function callar(si) { mudo = Math.max(0, mudo + (si ? 1 : -1)); }

let ctx = null, desbloqueado = false;
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
        let r = await fetch(`/sonidos/${id}.mp3`, { cache: 'force-cache' });
        if (!r.ok) r = await fetch(`/sonidos/${id}.mp3`, { cache: 'reload' }); // un "no existe" guardado de antes no debe dejar mudo un sonido que ya existe
        if (!r.ok) throw new Error(r.status);
        const datos = await r.arrayBuffer();
        const b = await new Promise((res, rej) => { const q = c.decodeAudioData(datos, res, rej); if (q && q.then) q.then(res, rej); });
        buffers.set(id, b);
      } catch { buffers.set(id, null); } // null = usar el respaldo por código
    })();
    cargando.set(id, p); await p; cargando.delete(id);
  }));
}

// Respaldo por código: campanitas suaves con el tono del catálogo
function campana(c, frecs, vol) {
  const t0 = c.currentTime;
  frecs.forEach((f, i) => { const o = c.createOscillator(), g = c.createGain(); o.type = 'sine'; o.frequency.value = f; const t = t0 + i * 0.07; g.gain.setValueAtTime(0, t); g.gain.linearRampToValueAtTime(vol * 0.06, t + 0.012); g.gain.exponentialRampToValueAtTime(0.0001, t + 0.28); o.connect(g).connect(maestro); o.start(t); o.stop(t + 0.3); });
}

const ultimo = new Map();
// Toca un sonido. Del evento al sonido no hay espera: el buffer ya está decodificado.
// `siempre` es para «probar» un sonido desde los ajustes: suena aunque esté apagado.
export function tocar(id, { fuerza = 1, siempre = false } = {}) {
  const s = SONIDOS[id]; if (!s) return false;
  if (!siempre && (mudo > 0 || !activo(id))) return false;
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

/* ── lo que se ve: el interruptor, los ajustes finos y su ventana ────────── */
const estadoTxt = (a) => (a.on ? 'Encendido' : 'Apagado');
// El interruptor. `menu`: la fila del menú de la izquierda, con el engrane al lado. `icono`: un botón redondo para las barras de arriba.
export function interruptor(el, modo = 'menu') {
  if (!el) return;
  const pinta = () => {
    const a = ajustes();
    el.innerHTML = modo === 'icono'
      ? `<button type="button" class="son-ico ${a.on ? 'on' : ''}" role="switch" aria-checked="${a.on}" aria-label="Sonido" title="${a.on ? 'Sonido encendido. Toca para apagarlo.' : 'Sonido apagado. Toca para encenderlo.'}">${a.on ? '🔊' : '🔇'}</button>`
      : `<div class="son-lat"><button type="button" class="son-switch ${a.on ? 'on' : ''}" role="switch" aria-checked="${a.on}" title="Enciende o apaga los sonidos de Cupido"><span class="ico">${a.on ? '🔊' : '🔇'}</span><span class="txt"><b>Sonido</b><small>${estadoTxt(a)}</small></span><span class="pal"></span></button><button type="button" class="son-mas" aria-label="Volumen y qué suena" title="Volumen y qué suena">⚙</button></div>`;
    el.querySelector('[role=switch]').onclick = () => alternar();
    const mas = el.querySelector('.son-mas'); if (mas) mas.onclick = abrirAjustesSonido;
  };
  pinta(); alCambiar(pinta);
}
// Los ajustes finos: el mismo interruptor, el volumen y una fila por familia con «probar»
export function panelSonido(contenedor) {
  const a = ajustes();
  contenedor.innerHTML = `<div class="son-panel">
    <button type="button" class="son-switch claro ${a.on ? 'on' : ''}" role="switch" aria-checked="${a.on}" id="son-on"><span class="ico">${a.on ? '🔊' : '🔇'}</span><span class="txt"><b>Sonido</b><small>${estadoTxt(a)}</small></span><span class="pal"></span></button>
    <div class="son-detalle ${a.on ? '' : 'apagado'}">
      <label class="son-fila"><span><b>Volumen</b></span><input type="range" id="son-vol" min="0.1" max="1" step="0.05" value="${a.volumen}" aria-label="Volumen"></label>
      <p class="son-titulo">Qué suena</p>
      ${Object.entries(FAMILIAS).map(([f, x]) => `<label class="son-fila"><span><b>${x.i} ${x.n}</b><small>${x.d}</small></span><button type="button" class="son-probar" data-probar="${f}" title="Probar" aria-label="Probar ${x.n}">▶</button><input type="checkbox" data-fam="${f}" ${a.familias[f] === false ? '' : 'checked'} aria-label="${x.n}"></label>`).join('')}
    </div>
    <p class="son-nota">Esto calla los avisos y efectos de Cupido. Las notas de voz, los videos y la voz de una llamada se oyen siempre: eso lo controlas con el volumen de tu equipo. Con el sonido apagado, una llamada entra sin timbre: la ves en pantalla.</p>
  </div>`;
  const q = (x) => contenedor.querySelector(x);
  q('#son-on').onclick = () => alternar();
  q('#son-vol').oninput = (e) => { ajustar({ volumen: Number(e.target.value) }); };
  q('#son-vol').onchange = () => tocar('toque', { siempre: true });
  contenedor.querySelectorAll('[data-fam]').forEach((i) => i.onchange = () => { ajustarFamilia(i.dataset.fam, i.checked); if (i.checked) tocar(Object.keys(SONIDOS).find((k) => SONIDOS[k].f === i.dataset.fam)); });
  let giro = {};
  contenedor.querySelectorAll('[data-probar]').forEach((b) => b.onclick = (e) => { e.preventDefault(); const f = b.dataset.probar, ids = Object.keys(SONIDOS).filter((k) => SONIDOS[k].f === f); giro[f] = ((giro[f] ?? -1) + 1) % ids.length; precargar([ids[giro[f]]]).then(() => tocar(ids[giro[f]], { siempre: true })); });
  // si cambia desde otro lado (el menú, otra pestaña), aquí solo se ponen al día los estados: no se repinta, para no cortar un gesto a medias
  alCambiar((n) => {
    const s = q('#son-on'); if (!s || !document.body.contains(s)) return;
    s.classList.toggle('on', n.on); s.setAttribute('aria-checked', n.on); s.querySelector('.ico').textContent = n.on ? '🔊' : '🔇'; s.querySelector('small').textContent = estadoTxt(n);
    q('.son-detalle').classList.toggle('apagado', !n.on);
    contenedor.querySelectorAll('[data-fam]').forEach((i) => { i.checked = n.familias[i.dataset.fam] !== false; });
    const v = q('#son-vol'); if (v && document.activeElement !== v) v.value = n.volumen;
  });
}
export function abrirAjustesSonido() {
  if (document.querySelector('#son-ventana')) return;
  const velo = document.createElement('div'); velo.className = 'modal-velo on'; velo.id = 'son-ventana';
  velo.innerHTML = `<div class="modal claro" role="dialog" aria-label="Sonido"><button class="cerrar" aria-label="Cerrar">×</button><h2>Sonido</h2><p class="sub">Cupido suena suave y solo cuando pasa algo. Un toque lo apaga todo; aquí abajo eliges lo fino.</p><div id="son-cont"></div></div>`;
  document.body.appendChild(velo); panelSonido(velo.querySelector('#son-cont'));
  const cerrar = () => { velo.remove(); document.removeEventListener('keydown', tecla); };
  const tecla = (e) => { if (e.key === 'Escape') cerrar(); };
  velo.querySelector('.cerrar').onclick = cerrar; velo.onclick = (e) => { if (e.target === velo) cerrar(); }; document.addEventListener('keydown', tecla);
}
// RLR
