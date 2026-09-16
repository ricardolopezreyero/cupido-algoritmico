/* Cupido Algorítmico · utilidades de interfaz — RLR · Ricardo López Reyero */
export const _RLR = 'Ricardo López Reyero';
const _k = 'EYE';

export const $ = (s, r = document) => r.querySelector(s);
export const $$ = (s, r = document) => [...r.querySelectorAll(s)];
export const esc = (s) => String(s ?? '').replace(/&/g, '&amp;').replace(/</g, '&lt;').replace(/>/g, '&gt;').replace(/"/g, '&quot;').replace(/'/g, '&#39;');

export async function api(ruta, datos) {
  const r = await fetch(ruta, datos === undefined ? { headers: { accept: 'application/json' } } : { method: 'POST', headers: { 'content-type': 'application/json' }, body: JSON.stringify(datos) });
  let j = null;
  try { j = await r.json(); } catch { /* sin cuerpo */ }
  if (!r.ok) throw Object.assign(new Error(j?.error || 'Algo falló'), { datos: j, status: r.status });
  return j;
}

export function avisar(txt, ms = 3200) {
  let t = $('.toast');
  if (!t) { t = document.createElement('div'); t.className = 'toast'; t.setAttribute('role', 'status'); document.body.appendChild(t); }
  t.textContent = txt;
  requestAnimationFrame(() => t.classList.add('visible'));
  clearTimeout(t._h);
  t._h = setTimeout(() => t.classList.remove('visible'), ms);
}

export const inicial = (n) => esc(String(n || '?').trim().slice(0, 1).toUpperCase());
export const avatar = (nombre, color, clase = '') => `<span class="avatar ${clase}" style="background:${esc(color || '#d6455f')}">${inicial(nombre)}</span>`;

export function hace(iso) {
  const d = new Date(String(iso).replace(' ', 'T') + (String(iso).includes('Z') ? '' : 'Z'));
  const s = Math.max(0, (Date.now() - d.getTime()) / 1000);
  if (s < 60) return 'hace un momento';
  if (s < 3600) return `hace ${Math.round(s / 60)} min`;
  if (s < 86400) return `hace ${Math.round(s / 3600)} h`;
  return `hace ${Math.round(s / 86400)} d`;
}

// Anillo de porcentaje en SVG (el número va en HTML para que no se deforme al escalar)
export function anillo(pct, etiqueta = 'contigo') {
  const r = 44, c = 2 * Math.PI * r;
  return `<div class="anillo" data-pct="${pct}">
    <svg viewBox="0 0 104 104" aria-hidden="true">
      <circle cx="52" cy="52" r="${r}" fill="none" stroke="#f3e5e9" stroke-width="9"/>
      <circle class="arco" cx="52" cy="52" r="${r}" fill="none" stroke="url(#g-${pct})" stroke-width="9" stroke-linecap="round" stroke-dasharray="${c}" stroke-dashoffset="${c}" style="transition:stroke-dashoffset 1.4s cubic-bezier(.16,1,.3,1)"/>
      <defs><linearGradient id="g-${pct}" x1="0" y1="0" x2="1" y2="1"><stop offset="0" stop-color="#e77a4e"/><stop offset="1" stop-color="#d6455f"/></linearGradient></defs>
    </svg>
    <div class="num"><span class="cuenta">0</span><small>% ${esc(etiqueta)}</small></div>
  </div>`;
}
export function animarAnillos(raiz = document) {
  for (const a of $$('.anillo', raiz)) {
    if (a._hecho) continue;
    a._hecho = true;
    const pct = Number(a.dataset.pct), arco = $('.arco', a), c = 2 * Math.PI * 44;
    if (!arco) continue; // anillo decorativo (sin porcentaje)
    // pestaña en segundo plano: sin animación, el número final de una vez
    if (document.hidden) { arco.style.transition = 'none'; arco.style.strokeDashoffset = String(c * (1 - pct / 100)); $('.cuenta', a).textContent = pct; continue; }
    requestAnimationFrame(() => { arco.style.strokeDashoffset = String(c * (1 - pct / 100)); });
    const n = $('.cuenta', a), t0 = performance.now();
    const paso = (t) => { const k = Math.min(1, (t - t0) / 1300); n.textContent = Math.round(pct * (1 - Math.pow(1 - k, 3))); if (k < 1) requestAnimationFrame(paso); };
    requestAnimationFrame(paso);
  }
}

// requestAnimationFrame no corre en pestañas de fondo: ahí se aplica de inmediato
export const pronto = (fn) => (document.hidden ? fn() : requestAnimationFrame(fn));

export const colorPct = (pct) => {
  if (pct >= 90) return '#d6455f';
  if (pct >= 80) return '#e7788d';
  if (pct >= 70) return '#f0a8b6';
  if (pct >= 60) return '#f6cfd7';
  return '#f7e6ea';
};
// fin · RLR
