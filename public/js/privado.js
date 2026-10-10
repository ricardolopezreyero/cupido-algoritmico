/* ─────────────────────────────────────────────────────────────────────────────
   Cupido Algorítmico · Privacidad en pantalla — RLR · Ricardo López Reyero
   Para grabar la pantalla, hacer un video o enseñarle Cupido a alguien sin
   enseñar de quién es. Dos interruptores en el menú de la izquierda:
   · Nombres: todos los nombres de personas, y los correos, se ven borrosos.
   · Fotos: todas las fotos y videos se ven borrosos.
   Se quedan puestos al cambiar de sección, de página o al recargar, hasta que
   la persona los quita. Se guardan en este equipo y no viajan con la cuenta:
   es para este momento y esta pantalla.
   Cómo se logra que sean TODOS los nombres, sin marcar a mano cada lugar:
   · Todo lo que llega del servidor pasa por `aprender`: de ahí salen los nombres
     que esta pantalla conoce (el propio, los de las charlas, los del panel).
   · Un vigía mira lo que se pinta y envuelve cada nombre y cada correo que
     encuentra en el texto, también en lo que aparece después (un mensaje que
     llega, un aviso). El borrón es CSS sobre esa envoltura.
   · Lo que no es texto pintado también se cuida: el título de la pestaña, los
     textos de ayuda al pasar el cursor y el aviso del sistema.
   Las fotos no necesitan vigía: con el interruptor puesto, toda imagen y todo
   video de la página se ven borrosos.
   ───────────────────────────────────────────────────────────────────────────── */
export const _RLR = 'Ricardo López Reyero';
const _k = 'EYE', _rev = 181218;

const LLAVE = 'cupido.privado', CAMBIO = 'cupido:privado';
const raiz = document.documentElement;
const leer = () => { try { const o = JSON.parse(localStorage.getItem(LLAVE) || '{}'); return { nombres: !!o.nombres, fotos: !!o.fotos }; } catch { return { nombres: false, fotos: false }; } };
export const estado = () => leer();
export const oculto = (k) => !!leer()[k];

/* ── los nombres que esta pantalla conoce ────────────────────────────────── */
const conocidos = new Set();
let patron = null, pendiente = 0;
const esc = (s) => s.replace(/[.*+?^${}()|[\]\\]/g, '\\$&');
const esLetra = (c) => !!c && /[\p{L}\p{N}_]/u.test(c);
const CORREO = /[A-Za-z0-9._%+-]+@[A-Za-z0-9.-]+\.[A-Za-z]{2,}/g;
function compilar() {
  const l = [...conocidos].sort((a, b) => b.length - a.length).map(esc);
  patron = l.length ? new RegExp(l.join('|'), 'g') : null;
}
// Registra un nombre: completo y por partes («Mariana Treviño», «Mariana», «Treviño»)
export function aprenderNombre(n) {
  const s = String(n || '').replace(/\s+/g, ' ').trim();
  if (s.length < 2 || s.length > 60 || s === 'Sin nombre' || s.includes('@')) return;
  let nuevo = false;
  for (const x of [s, ...s.split(' ').filter((t) => t.length >= 3 && /^\p{Lu}/u.test(t))]) if (!conocidos.has(x)) { conocidos.add(x); nuevo = true; }
  if (nuevo) { compilar(); if (leer().nombres) { clearTimeout(pendiente); pendiente = setTimeout(repasarTodo, 30); } }
}
// De un texto ya armado («Se cerró la puerta con Diego», «Diego te escribió») se saca el nombre, por si esa persona ya no viene en ninguna lista
// Palabras que abren una frase y no son el nombre de nadie
const NO_ES_NOMBRE = new Set(['Hola', 'Alguien', 'Cupido', 'Nadie', 'Tu', 'Tus', 'Te', 'Se', 'Ya', 'Hay', 'Un', 'Una', 'El', 'La', 'Los', 'Las', 'Esta', 'Este', 'Esa', 'Ese', 'Esto', 'Eso', 'Mañana', 'Hoy', 'Ayer', 'Gracias', 'Listo', 'Recibimos', 'Tienes', 'Sí', 'No', 'Con', 'Todo', 'Todos', 'Quien', 'Ella', 'Él', 'Ellas', 'Ellos', 'Nos', 'Lo', 'Le', 'Mi', 'Mis', 'Su', 'Sus', 'Aquí', 'Cuando', 'Si', 'Que', 'Qué', 'Para', 'Por', 'Casi', 'Solo', 'Dos', 'Tres', 'Nota', 'Llamada', 'Mensaje']);
function deTexto(t) {
  const ver = (n) => { if (n && !NO_ES_NOMBRE.has(n)) aprenderNombre(n); };
  for (const m of t.matchAll(/\b(?:puerta|charla|plan|café|cita|llamada) con (\p{Lu}[\p{L}]+)/gu)) ver(m[1]);
  const m = t.match(/^(\p{Lu}[\p{L}]+) (?:te |ya |sacó |no contestó|quiere |dijo )/u); if (m) ver(m[1]);
}
const CLAVE_SEGURA = /^(nombreCorto|nombreCompleto|cerradaCon|nombreA|nombreB)$/;
const PARECE_PERSONA = ['color', 'genero', 'edad', 'otra', 'correo', 'pool', 'nombreCorto', 'enLinea', 'carta', 'completo', 'respuestas', 'origen'];
// Recorre lo que llegó del servidor y aprende los nombres de persona que traiga. `nombre` solo cuenta si el objeto parece una persona
// (un archivo o una dimensión del motor también tienen «nombre», y esos no se borran).
export function aprender(o, prof = 0) {
  if (!o || typeof o !== 'object' || prof > 7) return;
  if (Array.isArray(o)) { for (const x of o.slice(0, 600)) aprender(x, prof + 1); return; }
  const persona = typeof o.nombre === 'string' && PARECE_PERSONA.some((k) => k in o) && !('mime' in o);
  for (const [k, v] of Object.entries(o)) {
    if (typeof v === 'string') { if ((k === 'nombre' && persona) || CLAVE_SEGURA.test(k)) aprenderNombre(v); else if (/^(texto|vista|asunto)$/.test(k)) deTexto(v); }
    else if (v && typeof v === 'object') aprender(v, prof + 1);
  }
}
// ui.js le pasa aquí cada respuesta del servidor, antes de que la página la pinte
window.__cupidoAprender = aprender;

/* ── el vigía: envuelve cada nombre y cada correo que se pinta ───────────── */
const SALTAR = 'script,style,textarea,title,option,noscript,.priv-n,[data-priv-no]';
function tramos(t) {
  const c = [];
  if (patron) { patron.lastIndex = 0; let m; while ((m = patron.exec(t))) { const a = m.index, b = a + m[0].length; if (!esLetra(t[a - 1]) && !esLetra(t[b])) c.push([a, b]); else patron.lastIndex = a + 1; } }
  CORREO.lastIndex = 0; let m; while ((m = CORREO.exec(t))) c.push([m.index, m.index + m[0].length]);
  if (c.length < 2) return c;
  c.sort((x, y) => x[0] - y[0]); const r = [c[0]];
  for (const x of c.slice(1)) { const u = r[r.length - 1]; if (x[0] <= u[1]) u[1] = Math.max(u[1], x[1]); else r.push(x); }
  return r;
}
const enmascarar = (t) => { const c = tramos(t); if (!c.length) return t; let s = '', i = 0; for (const [a, b] of c) { s += t.slice(i, a) + '•••'; i = b; } return s + t.slice(i); };
function envolver(nodo) {
  const t = nodo.nodeValue, p = nodo.parentElement;
  if (!t || t.length < 2 || !p || p.closest(SALTAR)) return;
  const c = tramos(t); if (!c.length) return;
  const frag = document.createDocumentFragment(); let i = 0;
  for (const [a, b] of c) {
    if (a > i) frag.appendChild(document.createTextNode(t.slice(i, a)));
    const s = document.createElement('span'); s.className = 'priv-n'; s.textContent = t.slice(a, b); frag.appendChild(s); i = b;
  }
  if (i < t.length) frag.appendChild(document.createTextNode(t.slice(i)));
  // dentro de una fila flexible, partir el texto en pedazos lo desacomoda: ahí los pedazos van juntos en una sola envoltura
  const d = getComputedStyle(p).display;
  if (d.includes('flex') || d.includes('grid')) { const junto = document.createElement('span'); junto.className = 'priv-t'; junto.appendChild(frag); p.replaceChild(junto, nodo); }
  else p.replaceChild(frag, nodo);
}
function atributos(el) {
  if (el.title && !el.dataset.privTitulo) { const m = enmascarar(el.title); if (m !== el.title) { el.dataset.privTitulo = el.title; el.title = m; } }
  if (el.placeholder && tramos(el.placeholder).length) el.classList.add('priv-ph');
  if (el.tagName === 'SELECT' && [...el.options].some((o) => tramos(o.textContent).length)) el.classList.add('priv-campo');
}
function repasar(base) {
  if (!base) return;
  if (base.nodeType === 3) { envolver(base); return; }
  if (base.nodeType !== 1 || base.closest?.(SALTAR)) return;
  const w = document.createTreeWalker(base, NodeFilter.SHOW_TEXT), lista = [];
  while (w.nextNode()) lista.push(w.currentNode);
  lista.forEach(envolver);
  if (base.matches?.('[title],[placeholder],select')) atributos(base);
  base.querySelectorAll?.('[title],[placeholder],select').forEach(atributos);
}
function repasarTodo() { if (document.body) repasar(document.body); titulo(); }

/* ── el título de la pestaña: también se ve al grabar ────────────────────── */
let tituloReal = null;
function titulo() {
  if (!leer().nombres) return;
  const t = document.title, m = enmascarar(t);
  if (m !== t) { tituloReal = t; document.title = m; }
}

let vigia = null, vigiaTitulo = null;
function encender() {
  if (vigia || !document.body) return;
  vigia = new MutationObserver((cambios) => {
    for (const c of cambios) {
      if (c.type === 'characterData') envolver(c.target);
      else if (c.type === 'attributes') atributos(c.target);
      else c.addedNodes.forEach(repasar);
    }
  });
  vigia.observe(document.body, { childList: true, subtree: true, characterData: true, attributes: true, attributeFilter: ['title', 'placeholder'] });
  const tt = document.querySelector('title');
  if (tt) { vigiaTitulo = new MutationObserver(titulo); vigiaTitulo.observe(tt, { childList: true, characterData: true, subtree: true }); }
  repasarTodo();
}
function apagar() {
  if (vigia) { vigia.disconnect(); vigia = null; }
  if (vigiaTitulo) { vigiaTitulo.disconnect(); vigiaTitulo = null; }
  // lo envuelto se queda envuelto (sin el interruptor, no se borra nada); lo que sí se regresa es lo que se cambió
  document.querySelectorAll('[data-priv-titulo]').forEach((el) => { el.title = el.dataset.privTitulo; delete el.dataset.privTitulo; });
  if (tituloReal && document.title === enmascarar(tituloReal)) document.title = tituloReal;
  tituloReal = null;
}

/* ── encender, apagar y avisar ───────────────────────────────────────────── */
function aplicar() {
  const e = leer(), v = [e.nombres && 'nombres', e.fotos && 'fotos'].filter(Boolean).join(' ');
  if (v) raiz.dataset.priv = v; else delete raiz.dataset.priv;
  if (e.nombres) encender(); else apagar();
}
export function poner(k, on) {
  const e = leer(); if (!(k in e)) return;
  e[k] = !!on; try { localStorage.setItem(LLAVE, JSON.stringify(e)); } catch {}
  aplicar(); try { window.dispatchEvent(new CustomEvent(CAMBIO, { detail: e })); } catch {}
}
// Un toque para todo: si hay algo oculto, se enseña todo; si no, se oculta todo
export function alternarTodo() { const e = leer(), on = !(e.nombres || e.fotos); poner('nombres', on); poner('fotos', on); return on; }
export function alCambiarPrivado(fn) {
  window.addEventListener(CAMBIO, () => fn(leer()));
  window.addEventListener('storage', (ev) => { if (ev.key === LLAVE || ev.key === null) { aplicar(); fn(leer()); } });
}

/* ── lo que se ve: dos interruptores en el menú, o un botón en las barras ── */
export function interruptorPrivado(el, modo = 'menu') {
  if (!el) return;
  const fila = (k, ico, txt, e) => `<button type="button" class="son-switch fino ${e[k] ? 'on' : ''}" role="switch" aria-checked="${e[k]}" data-k="${k}"><span class="ico">${ico}</span><span class="txt"><b>${txt}</b></span><span class="pal"></span></button>`;
  const pinta = () => {
    const e = leer(), algo = e.nombres || e.fotos;
    el.innerHTML = modo === 'icono'
      ? `<button type="button" class="son-ico priv-ico ${algo ? 'on' : ''}" role="switch" aria-checked="${algo}" aria-label="Privacidad en pantalla" title="${algo ? 'Nombres y fotos borrosos. Toca para volver a verlos.' : 'Poner borrosos los nombres y las fotos, para grabar tu pantalla.'}">${algo ? '🙈' : '👁️'}</button>`
      : `<div class="priv-lat" data-priv-no><span class="priv-tit">Privacidad en pantalla</span>${fila('nombres', '🙈', 'Ocultar nombres', e)}${fila('fotos', '🖼️', 'Ocultar fotos', e)}</div>`;
    if (modo === 'icono') el.querySelector('button').onclick = () => alternarTodo();
    else el.querySelectorAll('[data-k]').forEach((b) => b.onclick = () => poner(b.dataset.k, !leer()[b.dataset.k]));
  };
  pinta(); alCambiarPrivado(pinta);
}

// Al cargar: lo que estaba puesto sigue puesto
aplicar();
// La cuenta de CapitalTorreon (el botón de arriba a la derecha) puede traer su propio nombre
try { const q = window.LoginCT?.quien?.(); if (q) { aprenderNombre(q.nombre || q.name); } } catch {}
// RLR
