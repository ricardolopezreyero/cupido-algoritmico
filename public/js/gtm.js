/* ─────────────────────────────────────────────────────────────────────
   Cupido Algorítmico · Go-to-market (/gtm) — RLR · Ricardo López Reyero
   La página no trae el plan: lo pide a /api/gtm con el pase del login de la casa
   (o la sesión de Cupido) y solo lo recibe quien está en el equipo.
   Pestañas de lectura (bloques que manda el servidor) + la lista, donde cada
   palomita se guarda con quién la puso y cuándo.
   ───────────────────────────────────────────────────────────────────── */
import { $, $$, esc, avisar } from '/js/ui.js';
const _RLR = 'Ricardo López Reyero', _k = 'EYE', _rev = 181218;

const raiz = $('#gtm');
let D = null;                                   // lo que mandó el servidor
let pestana = 'resumen';
const LLAVE = 'cupido.gtm.filtros';
const F = (() => { try { return { fase: -1, area: '', quien: '', estado: 'pendientes', q: '', ...JSON.parse(localStorage.getItem(LLAVE) || '{}'), q: '' }; } catch { return { fase: -1, area: '', quien: '', estado: 'pendientes', q: '' }; } })();   // fase −1 = todavía no elige: se abre en la fase que toca
const recordar = () => { try { localStorage.setItem(LLAVE, JSON.stringify({ fase: F.fase, area: F.area, quien: F.quien, estado: F.estado })); } catch { /* sin memoria: no pasa nada */ } };

/* ── hablar con el servidor: siempre con el pase, si lo hay ── */
const pase = () => { try { return window.LoginCT?.pase?.() || ''; } catch { return ''; } };
async function pedir(ruta, datos) {
  const h = { accept: 'application/json' }; const p = pase(); if (p) h.authorization = 'Bearer ' + p;
  const r = await fetch(ruta, datos === undefined ? { headers: h } : { method: 'POST', headers: { ...h, 'content-type': 'application/json' }, body: JSON.stringify(datos) });
  let j = {}; try { j = await r.json(); } catch { /* sin cuerpo */ }
  return { ok: r.ok, status: r.status, j };
}

/* ── texto: **negritas** y [ligas](https://…) ── */
const tx = (s) => esc(s).replace(/\*\*(.+?)\*\*/g, '<b>$1</b>').replace(/\[([^\]]+)\]\((https?:\/\/[^\s)]+|\/[^\s)]*)\)/g, (_, t, u) => `<a href="${u}"${u.startsWith('/') ? '' : ' target="_blank" rel="noopener"'}>${t}</a>`);
const num = (n) => Number(n || 0).toLocaleString('es-MX');
const tantos = (n, uno, varios) => `${num(n)} ${Number(n) === 1 ? uno : varios}`;
const fecha = (iso) => { const d = new Date(String(iso).replace(' ', 'T') + 'Z'); return isNaN(d) ? '' : d.toLocaleDateString('es-MX', { day: 'numeric', month: 'short' }); };

/* ═══ la puerta ═══════════════════════════════════════════════════════ */
function puerta(falta, correo) {
  const sinPermiso = falta === 'permiso';
  raiz.innerHTML = `<section class="gtm-puerta tarjeta">
    <p class="eyebrow">Go-to-market</p>
    <h1>${sinPermiso ? 'Esta cuenta no está en el equipo' : 'Esta página es del equipo'}</h1>
    <p class="lead">${sinPermiso ? `Entraste como <b>${esc(correo)}</b>. Pídele a Ricardo que agregue ese correo en la pestaña Equipo, o entra con otra cuenta.` : 'Aquí vive el plan para llevar a Cupido a millones de personas: la estrategia, los atajos y la lista de todo lo que hay que hacer. Entra con tu cuenta de Google para verlo.'}</p>
    <div class="gtm-puerta-botones">${sinPermiso ? '<button class="boton boton-claro" id="gtm-salir">Entrar con otra cuenta</button>' : '<div data-login-ct="ancho" data-texto="Entrar con Google" id="gtm-entrar"></div>'}</div>
    <p class="gtm-chica">También abre con una sesión de Cupido de una cuenta administradora.</p>
  </section>`;
  const b = $('#gtm-entrar'); if (b && window.LoginCT) window.LoginCT.montar(b, 'ancho');
  $('#gtm-salir')?.addEventListener('click', () => window.LoginCT?.salir());
}

/* ═══ bloques de lectura ══════════════════════════════════════════════ */
const BLOQUE = {
  cabeza: (b) => `<header class="gtm-cabeza">${b.e ? `<p class="eyebrow">${tx(b.e)}</p>` : ''}<h2>${tx(b.t)}</h2>${b.s ? `<p class="lead">${tx(b.s)}</p>` : ''}</header>`,
  p: (b) => `<p class="gtm-p">${tx(b.t)}</p>`,
  cifras: (b) => `<div class="gtm-cifras">${b.l.map((c) => `<div class="gtm-cifra"><b>${tx(c.n)}</b><span>${tx(c.t)}</span>${c.s ? `<small>${tx(c.s)}</small>` : ''}</div>`).join('')}</div>`,
  tarjetas: (b) => `<div class="gtm-tarjetas col${b.col || 2}">${b.l.map((c, i) => `<article class="gtm-tarjeta">${b.num ? `<span class="gtm-n">${i + 1}</span>` : ''}${c.e ? `<p class="gtm-e">${tx(c.e)}</p>` : ''}<h3>${tx(c.t)}</h3>${c.d ? `<p>${tx(c.d)}</p>` : ''}${c.l ? `<ul>${c.l.map((x) => `<li>${tx(x)}</li>`).join('')}</ul>` : ''}${c.pie ? `<p class="gtm-pie">${tx(c.pie)}</p>` : ''}</article>`).join('')}</div>`,
  pasos: (b) => `<ol class="gtm-pasos">${b.l.map((c, i) => `<li><span class="gtm-paso-n">${i + 1}</span><div><h3>${tx(c.t)}</h3>${c.cuando ? `<p class="gtm-e">${tx(c.cuando)}</p>` : ''}<p>${tx(c.d)}</p>${c.l ? `<ul>${c.l.map((x) => `<li>${tx(x)}</li>`).join('')}</ul>` : ''}</div></li>`).join('')}</ol>`,
  tabla: (b) => `<div class="gtm-tabla"><table><thead><tr>${b.cab.map((c) => `<th>${tx(c)}</th>`).join('')}</tr></thead><tbody>${b.filas.map((f) => `<tr>${f.map((c, i) => `<td data-t="${esc(b.cab[i])}">${tx(c)}</td>`).join('')}</tr>`).join('')}</tbody></table></div>${b.nota ? `<p class="gtm-chica">${tx(b.nota)}</p>` : ''}`,
  lista: (b) => `<ul class="gtm-lista">${b.l.map((x) => `<li>${tx(x)}</li>`).join('')}</ul>`,
  nota: (b) => `<aside class="gtm-nota ${esc(b.tono || 'idea')}">${b.e ? `<b>${tx(b.e)}</b> ` : ''}${tx(b.t)}</aside>`,
  gente: (b) => `<div class="gtm-gente">${b.l.map((g) => `<article class="gtm-persona"><h3>${g.u ? `<a href="${esc(g.u)}" target="_blank" rel="noopener">${tx(g.n)}</a>` : tx(g.n)}</h3>${g.r ? `<p class="gtm-e">${tx(g.r)}</p>` : ''}<p>${tx(g.q)}</p>${g.a ? `<p class="gtm-pie"><b>Por dónde entrarle:</b> ${tx(g.a)}</p>` : ''}</article>`).join('')}</div>`,
  fuentes: (b) => `<details class="gtm-fuentes"><summary>${tx(b.t || 'De dónde salen los datos')} · ${b.l.length}</summary><ol>${b.l.map((f) => `<li>${f.u ? `<a href="${esc(f.u)}" target="_blank" rel="noopener">${tx(f.t)}</a>` : tx(f.t)}</li>`).join('')}</ol></details>`,
  boton: (b) => `<p class="gtm-ir"><button class="boton" data-ir="${esc(b.ir)}">${tx(b.t)}</button></p>`,
  calc: () => `<div class="gtm-calc tarjeta" id="gtm-calc"></div>`,
};
const bloques = (l) => l.map((b) => (BLOQUE[b.k] ? BLOQUE[b.k](b) : '')).join('');

/* ── la calculadora de ciudad: cuánta gente hace falta para que casi nadie se quede en silencio ── */
function calculadora() {
  const el = $('#gtm-calc'); if (!el) return;
  const h = D.hoy, real = h.cruces >= 300 && h.arriba > 0 ? Math.round(h.cruces / h.arriba) : 0;
  const C = { total: 3000, mujeres: 50, elegible: 30, uno: real || 500 };
  const fila = (id, t, min, max, paso, s) => `<label class="gtm-calc-f"><span>${t}</span><input type="range" id="c-${id}" min="${min}" max="${max}" step="${paso}" value="${C[id]}"><output id="o-${id}"></output>${s ? `<small>${s}</small>` : ''}</label>`;
  el.innerHTML = `<h3>La calculadora de ciudad</h3>
    <p class="gtm-chica">El motor solo avisa arriba de 90 %. Mueve los números para ver cuánta gente necesita una ciudad para que casi nadie se quede en silencio.${real ? ` La tasa de par ya viene de los cruces reales de Cupido (1 de cada ${num(real)}).` : ' La tasa de par todavía es un supuesto: se cambia por la real al llegar a unos 200 perfiles.'}</p>
    ${fila('total', 'Perfiles vivos en la ciudad', 200, 20000, 100)}
    ${fila('mujeres', 'Mujeres', 30, 70, 1)}
    ${fila('elegible', 'Del otro lado, cuántos te tocan por edad y por lo que buscas', 5, 60, 1)}
    ${fila('uno', 'Tasa de par: uno de cada…', 50, 5000, 50, 'De cada cuántos cruces sale uno arriba de 90 %.')}
    <div class="gtm-calc-r"><div><b id="r-ella">—</b><span>de las mujeres recibe al menos un aviso</span><small id="r-ella-n"></small></div><div><b id="r-el">—</b><span>de los hombres recibe al menos un aviso</span><small id="r-el-n"></small></div></div>
    <p class="gtm-chica" id="r-meta"></p>`;
  const pinta = () => {
    for (const k of Object.keys(C)) C[k] = Number($('#c-' + k).value);
    $('#o-total').textContent = num(C.total); $('#o-mujeres').textContent = C.mujeres + ' %'; $('#o-elegible').textContent = C.elegible + ' %'; $('#o-uno').textContent = num(C.uno);
    const m = C.total * C.mujeres / 100, hm = C.total - m, paraElla = hm * C.elegible / 100, paraEl = m * C.elegible / 100, p = 1 / C.uno;
    const al = (n) => 1 - Math.pow(1 - p, n);
    $('#r-ella').textContent = Math.round(al(paraElla) * 100) + ' %'; $('#r-el').textContent = Math.round(al(paraEl) * 100) + ' %';
    $('#r-ella-n').textContent = `la cruzan con ${num(Math.round(paraElla))} hombres`; $('#r-el-n').textContent = `lo cruzan con ${num(Math.round(paraEl))} mujeres`;
    const porLado = Math.log(0.2) / Math.log(1 - p), ciudad = Math.ceil((porLado / (C.elegible / 100)) * 2 / 100) * 100;
    $('#r-meta').innerHTML = `Para que <b>8 de cada 10</b> personas reciban al menos un aviso, con mitad y mitad, esta ciudad necesita cerca de <b>${num(ciudad)}</b> perfiles vivos.`;
  };
  $$('input', el).forEach((i) => i.addEventListener('input', pinta)); pinta();
}

/* ═══ dónde vamos hoy ═════════════════════════════════════════════════ */
function franja() {
  const h = D.hoy, hechas = Object.keys(D.hechas).length, total = D.tareas.length;
  const mitad = h.completos ? Math.round((h.mujeres / h.completos) * 100) : 0;
  const c = (n, t, s) => `<div class="gtm-hoy-c"><b>${n}</b><span>${t}</span>${s ? `<small>${s}</small>` : ''}</div>`;
  return `<section class="gtm-hoy" aria-label="Dónde vamos hoy">
    <p class="gtm-hoy-t">Dónde vamos hoy <small>cuentas de verdad, sin la demo</small></p>
    <div class="gtm-hoy-fila">
      ${c(num(h.completos), h.completos === 1 ? 'perfil vivo' : 'perfiles vivos', h.completos ? `${tantos(h.mujeres, 'mujer', 'mujeres')} (${mitad} %) · ${tantos(h.hombres, 'hombre', 'hombres')}` : 'la meta de la fase 2 son 1,000')}
      ${c(num(h.cuentas), 'cuentas creadas', `${num(h.semana)} en los últimos 7 días`)}
      ${c(num(h.invitados), 'llegaron por invitación', h.cuentas ? `${Math.round((h.invitados / h.cuentas) * 100)} % de las cuentas` : '')}
      ${c(num(h.arriba), 'cruces arriba de 90 %', h.cruces ? `de ${num(h.cruces)} cruces · 1 de cada ${h.arriba ? num(Math.round(h.cruces / h.arriba)) : '—'}` : 'aún no hay cruces entre personas reales')}
      ${c(num(h.puertas), 'puertas abiertas', h.avisadas ? `de ${num(h.avisadas)} avisadas` : '')}
      ${c(`${num(hechas)}<i>/${num(total)}</i>`, 'actividades hechas', `${Math.round((hechas / total) * 100)} % de la lista`)}
    </div>
    ${h.ciudades.length ? `<p class="gtm-hoy-ciudades">${h.ciudades.map((x) => `<span><b>${esc(x.ciudad)}</b> ${num(x.n)} <i>(${num(x.m)} M · ${num(x.h)} H)</i></span>`).join('')}</p>` : ''}
  </section>`;
}

/* ═══ la lista ════════════════════════════════════════════════════════ */
const sin = (s) => String(s).normalize('NFD').replace(/[̀-ͯ]/g, '').toLowerCase();
const cat = (k, id) => D.catalogo[k].find((x) => (x.id ?? x.n) === id) || {};
const horas = (n) => (n >= 16 ? `${Math.round(n / 8)} días` : n >= 1 ? `${Math.round(n)} h` : `${Math.round(n * 60)} min`);
const pasa = (t) => {
  if (F.fase && !F.q && t[1] !== F.fase) return false;   // al buscar se busca en las cinco fases
  if (F.area && t[2] !== F.area) return false;
  if (F.quien && t[3] !== F.quien) return false;
  if (F.estado === 'pendientes' && D.hechas[t[0]]) return false;
  if (F.estado === 'hechas' && !D.hechas[t[0]]) return false;
  if (F.q) { const q = sin(F.q); if (!sin(t[6] + ' ' + t[7]).includes(q)) return false; }
  return true;
};
function tarjetaTarea(t) {
  const [id, , area, quien, esf, ritmo, titulo, detalle] = t, h = D.hechas[id];
  return `<article class="gtm-tarea${h ? ' hecha' : ''}" data-id="${id}">
    <button class="gtm-palomita" role="checkbox" aria-checked="${h ? 'true' : 'false'}" aria-label="${h ? 'Quitar la palomita' : 'Marcar como hecha'}: ${esc(titulo)}">${h ? '✓' : ''}</button>
    <div class="gtm-tarea-c">
      <h4>${esc(titulo)}</h4>
      <p>${esc(detalle)}</p>
      <p class="gtm-etiquetas"><span class="gtm-et area">${esc(cat('areas', area).t)}</span><span class="gtm-et q-${quien}">${quien === 'IA' ? '🤖 ' : quien === 'P' ? '🙋 ' : '🤝 '}${esc(cat('quienes', quien).t)}</span><span class="gtm-et">⏱ ${esc(cat('esfuerzos', esf).t)}</span>${ritmo !== 'u' ? `<span class="gtm-et ritmo">↻ ${esc(cat('ritmos', ritmo).t)}</span>` : ''}${h ? `<span class="gtm-et ok">✓ ${esc(h.nombre)} · ${fecha(h.at)}</span>` : ''}</p>
    </div>
  </article>`;
}
function resumenCarga(lista) {
  const pend = lista.filter((t) => !D.hechas[t[0]]);
  const hrs = (l) => l.reduce((s, t) => s + (cat('esfuerzos', t[4]).h || 0), 0);
  const porQuien = D.catalogo.quienes.map((q) => { const l = pend.filter((t) => t[3] === q.id); return `<span><b>${num(l.length)}</b> ${esc(q.t)} <i>≈ ${horas(hrs(l))}</i></span>`; }).join('');
  const porArea = D.catalogo.areas.map((a) => { const n = pend.filter((t) => t[2] === a.id).length; return n ? `<span><b>${num(n)}</b> ${esc(a.t)}</span>` : ''; }).join('');
  return `<div class="gtm-carga"><p><em>Lo que falta, por quién lo hace</em>${porQuien}<span class="gtm-carga-n">lo que se repite cuenta una sola vez</span></p><p><em>Por área</em>${porArea || '<span>Nada pendiente aquí.</span>'}</p></div>`;
}
function lista() {
  const todas = D.tareas, vistas = todas.filter(pasa);
  const chip = (grupo, v, t, n) => `<button class="gtm-f${String(F[grupo]) === String(v) ? ' activo' : ''}" data-f="${grupo}" data-v="${esc(v)}">${t}${n != null ? ` <i>${n}</i>` : ''}</button>`;
  const hechasDe = (l) => l.filter((t) => D.hechas[t[0]]).length;
  const fases = D.catalogo.fases.map((f) => { const l = todas.filter((t) => t[1] === f.n), h = hechasDe(l); return `<button class="gtm-fase${F.fase === f.n ? ' activo' : ''}" data-f="fase" data-v="${f.n}"><span class="gtm-fase-n">Fase ${f.n}</span><b>${esc(f.t)}</b><span class="gtm-barra"><i style="width:${Math.round((h / l.length) * 100)}%"></i></span><small>${h} de ${l.length}</small></button>`; }).join('');
  let cuerpo = '';
  for (const f of D.catalogo.fases) {
    const l = vistas.filter((t) => t[1] === f.n); if (!l.length) continue;
    const deFase = todas.filter((t) => t[1] === f.n);
    cuerpo += `<section class="gtm-grupo"><header><p class="eyebrow">Fase ${f.n} · ${esc(f.cuando)}</p><h3>${esc(f.t)}</h3><p class="gtm-chica">${esc(f.meta)} · ${hechasDe(deFase)} de ${deFase.length} hechas</p></header>`;
    for (const a of D.catalogo.areas) { const la = l.filter((t) => t[2] === a.id); if (la.length) cuerpo += `<h5 class="gtm-area">${esc(a.t)} <i>${la.length}</i></h5><div class="gtm-tareas">${la.map(tarjetaTarea).join('')}</div>`; }
    cuerpo += '</section>';
  }
  return `<header class="gtm-cabeza"><p class="eyebrow">La lista</p><h2>Todo lo que hay que hacer, en orden</h2><p class="lead">${num(todas.length)} actividades en cinco fases. Cada palomita se guarda con tu nombre y la fecha, para todo el equipo. Las que se repiten (↻) se palomean cuando la rutina ya quedó andando.</p></header>
    <div class="gtm-fases">${fases}</div>
    <div class="gtm-filtros">
      <input type="search" id="gtm-q" placeholder="Buscar en la lista…" value="${esc(F.q)}" aria-label="Buscar en la lista">
      <div class="gtm-fila"><em>Ver</em>${chip('estado', 'pendientes', 'Pendientes')}${chip('estado', 'hechas', 'Hechas')}${chip('estado', 'todas', 'Todas')}${F.fase ? chip('fase', 0, 'Ver las cinco fases') : ''}</div>
      <div class="gtm-fila"><em>Quién</em>${chip('quien', '', 'Cualquiera')}${D.catalogo.quienes.map((q) => chip('quien', q.id, esc(q.t), todas.filter((t) => t[3] === q.id).length)).join('')}</div>
      <div class="gtm-fila"><em>Área</em>${chip('area', '', 'Todas')}${D.catalogo.areas.map((a) => chip('area', a.id, esc(a.t), todas.filter((t) => t[2] === a.id).length)).join('')}</div>
    </div>
    ${resumenCarga(vistas.length ? todas.filter((t) => (!F.fase || t[1] === F.fase) && (!F.area || t[2] === F.area) && (!F.quien || t[3] === F.quien)) : [])}
    <p class="gtm-cuenta" id="gtm-cuenta">${num(vistas.length)} ${vistas.length === 1 ? 'actividad' : 'actividades'} a la vista</p>
    <div id="gtm-lista">${cuerpo || '<p class="vacio">Nada con esos filtros.</p>'}</div>`;
}

async function palomear(id) {
  const antes = D.hechas[id], quiero = !antes;
  if (quiero) D.hechas[id] = { por: D.yo.email, nombre: D.yo.nombre, at: new Date().toISOString().slice(0, 19).replace('T', ' ') }; else delete D.hechas[id];
  refrescarTarea(id);
  const r = await pedir('/api/gtm/tarea', { id, hecha: quiero });
  if (!r.ok) { if (antes) D.hechas[id] = antes; else delete D.hechas[id]; refrescarTarea(id); avisar(r.j.error || 'No se guardó. Revisa tu conexión e intenta de nuevo.'); return; }
  if (r.j.hecha) D.hechas[id] = r.j.hecha; else delete D.hechas[id];
  refrescarTarea(id);
}
// Solo se repinta la tarjeta tocada y los contadores: la lista no brinca ni se pierde el lugar
function refrescarTarea(id) {
  const el = $(`.gtm-tarea[data-id="${id}"]`), t = D.tareas.find((x) => x[0] === id);
  if (el && t) el.outerHTML = tarjetaTarea(t);
  const h = $('.gtm-hoy'); if (h) h.outerHTML = franja();
  const n = Object.keys(D.hechas).length; const b = $('#gtm-pestanas [data-p="checklist"] i'); if (b) b.textContent = `${n}/${D.tareas.length}`;
  for (const f of D.catalogo.fases) { const l = D.tareas.filter((x) => x[1] === f.n), hh = l.filter((x) => D.hechas[x[0]]).length, bt = $(`.gtm-fase[data-v="${f.n}"]`); if (bt) { $('.gtm-barra i', bt).style.width = Math.round((hh / l.length) * 100) + '%'; $('small', bt).textContent = `${hh} de ${l.length}`; } }
}

/* ═══ el equipo (solo lo ve y lo cambia una cuenta administradora) ═══ */
// Las pruebas que llegan por /ceo: quién quiere dirigir Cupido. Traen datos de personas, así que solo las ve una cuenta administradora
function pruebas() {
  const l = D.postulaciones || [], liga = (u, t) => (u ? `<a href="${esc(u)}" target="_blank" rel="noopener">${t}</a>` : ''), parte = (t, v) => (v ? `<h5>${t}</h5><p>${esc(v).replace(/\n/g, '<br>')}</p>` : '');
  return `<section class="gtm-pruebas"><header class="gtm-cabeza"><p class="eyebrow">Dirección</p><h2>Pruebas recibidas <i>${l.length}</i></h2><p class="lead">Lo que mandó cada persona desde <a href="/ceo">/ceo</a>. Solo lo ven las cuentas administradoras, y a ellas les llega un aviso por correo con cada prueba nueva.</p></header>
    ${l.length ? l.map((p) => `<details class="gtm-prueba"><summary><b>${esc(p.nombre)}</b><span>${esc(p.ciudad || 'sin ciudad')} · ${fecha(p.creado)}</span>${p.video ? '<span class="gtm-et ok">🎥 mandó video</span>' : ''}</summary>
      <p class="gtm-prueba-contacto"><a href="mailto:${esc(p.correo)}">${esc(p.correo)}</a>${p.whatsapp ? ` · ${esc(p.whatsapp)}` : ''}${p.video ? ` · ${liga(p.video, 'Ver su video')}` : ''}${p.enlace ? ` · ${liga(p.enlace, 'Lo que construyó')}` : ''}</p>
      ${parte('1 · La vez que juntó gente desde cero', p.sala)}${parte('2 · Diez días y cero pesos', p.diez_dias)}${parte('3 · Tres cosas que cambiaría', p.cambiarias)}${parte('4 · Lo correcto sobre lo conveniente', p.correcto)}</details>`).join('') : '<p class="vacio">Todavía no llega ninguna. La liga para mandar es cupido.capitaltorreon.com/ceo</p>'}</section>`;
}
function equipo() {
  if (!D.yo.admin) return '';
  return pruebas() + `<section class="gtm-equipo tarjeta"><h3>Quién puede ver esta página</h3>
    <p class="gtm-chica">Las cuentas administradoras de Cupido entran siempre. Aquí se agrega a quien va a ejecutar el plan, con su correo de Google. Puede palomear la lista; no puede cambiar el equipo.</p>
    <ul id="gtm-eq-lista">${D.equipo.length ? D.equipo.map((e) => `<li><b>${esc(e.email)}</b><span>desde el ${fecha(e.at)}</span><button class="gtm-quitar" data-quitar="${esc(e.email)}">Quitar</button></li>`).join('') : '<li class="vacio">Todavía no hay nadie más.</li>'}</ul>
    <form id="gtm-eq-form"><input type="email" id="gtm-eq-correo" placeholder="correo@gmail.com" required aria-label="Correo de la persona"><button class="boton boton-chico">Dar acceso</button></form>
  </section>`;
}
async function cambiarEquipo(email, quitar) {
  const r = await pedir('/api/gtm/equipo', { email, quitar });
  if (!r.ok) return avisar(r.j.error || 'No se pudo cambiar el equipo.');
  D.equipo = r.j.equipo; pintar(); avisar(quitar ? 'Listo: ya no tiene acceso.' : 'Listo: ya puede entrar con ese correo.');
}

/* ═══ armar la página ═════════════════════════════════════════════════ */
function pintar() {
  const P = D.plan.pestanas, n = Object.keys(D.hechas).length;
  const orden = [P[0], { id: 'checklist', t: 'Lista' }, ...P.slice(1)].filter(Boolean);
  if (!orden.some((p) => p.id === pestana)) pestana = orden[0].id;
  const actual = P.find((p) => p.id === pestana);
  raiz.innerHTML = `<header class="gtm-titulo"><p class="eyebrow">Go-to-market · versión ${esc(D.plan.version)} · ${esc(D.plan.fecha)}</p><h1>${tx(D.plan.titulo || 'El plan para llevar a Cupido a millones')}</h1>${D.plan.bajada ? `<p class="lead">${tx(D.plan.bajada)}</p>` : ''}</header>
    ${franja()}
    <nav class="gtm-pestanas" id="gtm-pestanas" aria-label="Partes del plan">${orden.map((p) => `<button data-p="${p.id}" class="${p.id === pestana ? 'activo' : ''}">${esc(p.t)}${p.id === 'checklist' ? ` <i>${n}/${D.tareas.length}</i>` : ''}</button>`).join('')}</nav>
    <div class="gtm-cuerpo" id="gtm-cuerpo">${pestana === 'checklist' ? lista() : bloques(actual.bloques) + (pestana === 'equipo' ? equipo() : '')}</div>`;
  calculadora();
}
function ir(p, arriba = true) {
  pestana = p; try { history.replaceState(null, '', '#' + p); } catch { /* sin historial */ }
  pintar(); if (arriba) $('#gtm-pestanas').scrollIntoView({ block: 'start' });
  $('#gtm-pestanas .activo')?.scrollIntoView({ block: 'nearest', inline: 'center' });
}

raiz.addEventListener('click', (e) => {
  const p = e.target.closest('[data-p]'); if (p) return ir(p.dataset.p, false);
  const i = e.target.closest('[data-ir]'); if (i) return ir(i.dataset.ir);
  const c = e.target.closest('.gtm-palomita'); if (c) return palomear(c.closest('.gtm-tarea').dataset.id);
  const f = e.target.closest('[data-f]');
  if (f) { const k = f.dataset.f, v = k === 'fase' ? Number(f.dataset.v) : f.dataset.v; F[k] = k === 'fase' && F.fase === v ? 0 : v; recordar(); const y = scrollY; pintar(); scrollTo(0, y); return; }
  const q = e.target.closest('[data-quitar]'); if (q) return cambiarEquipo(q.dataset.quitar, true);
});
raiz.addEventListener('submit', (e) => { if (e.target.id === 'gtm-eq-form') { e.preventDefault(); cambiarEquipo($('#gtm-eq-correo').value, false); } });
let espera = 0;
raiz.addEventListener('input', (e) => {
  if (e.target.id !== 'gtm-q') return;
  F.q = e.target.value; clearTimeout(espera);
  // al buscar solo se repinta la lista de abajo: el cursor se queda en su lugar
  espera = setTimeout(() => { const t = document.createElement('div'); t.innerHTML = lista(); $('#gtm-lista').innerHTML = $('#gtm-lista', t).innerHTML; $('#gtm-cuenta').textContent = $('#gtm-cuenta', t).textContent; }, 120);
});

async function abrir() {
  const r = await pedir('/api/gtm');
  if (r.status === 401) return puerta('sesion');
  if (r.status === 403) return puerta('permiso', r.j.correo);
  if (!r.ok) { raiz.innerHTML = `<p class="vacio">No se pudo abrir el plan: ${esc(r.j.error || 'intenta de nuevo en un momento')}.</p>`; return; }
  D = r.j; const h = location.hash.slice(1); if (h) pestana = h;
  // La lista abre en la fase que toca (la primera con pendientes), para no enseñar 244 tarjetas de golpe
  if (F.fase === -1) F.fase = (D.catalogo.fases.find((f) => D.tareas.some((t) => t[1] === f.n && !D.hechas[t[0]])) || { n: 0 }).n;
  pintar();
}

// El login de la casa carga con «defer»: se le espera un momento, y si la sesión cambia se vuelve a pedir el plan
for (let i = 0; i < 30 && !window.LoginCT; i++) await new Promise((ok) => setTimeout(ok, 100));
try { window.LoginCT?.al(() => abrir()); } catch { /* sin login: se intenta con la sesión de Cupido */ }
abrir();
