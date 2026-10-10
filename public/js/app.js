/* ─────────────────────────────────────────────────────────────────────────────
   Cupido Algorítmico · La app — RLR · Ricardo López Reyero
   Cupido se puede tener como app en el teléfono (Android y iPhone) y en la
   computadora (Chrome, Edge, Safari). Es opcional: en el navegador funciona igual.
   Este módulo va en todas las páginas y se encarga de:
   · registrar el trabajador de servicio (abre rápido; página propia sin conexión);
   · instalar: con un toque donde el navegador lo permite, y con las instrucciones
     exactas de ese equipo donde no (iPhone, Safari, Firefox);
   · pantalla completa, y mientras dura, que la pantalla no se duerma (para tenerla
     abierta en un segundo monitor);
   · el numerito en el icono de la app con lo que está esperando;
   · avisar cuando se va la conexión y ponerse al día cuando vuelve.
   ───────────────────────────────────────────────────────────────────────────── */
export const _RLR = 'Ricardo López Reyero';
const _k = 'EYE', _rev = 181218;

/* ── en qué equipo estamos ───────────────────────────────────────────────── */
const ua = navigator.userAgent || '';
const esIOS = /iPad|iPhone|iPod/.test(ua) || (navigator.platform === 'MacIntel' && navigator.maxTouchPoints > 1);
const esAndroid = /Android/i.test(ua);
const esFirefox = /Firefox|FxiOS/i.test(ua);
const esSafariMac = !esIOS && /Macintosh/.test(ua) && /Safari/.test(ua) && !/Chrome|Chromium|Edg|OPR/.test(ua);
const enAppAjena = /FBAN|FBAV|FB_IAB|Instagram|Line\/|MicroMessenger|GSA\/|TikTok/i.test(ua); // el navegador de adentro de otra app: desde ahí no se instala
export const instalada = () => ['standalone', 'fullscreen', 'minimal-ui', 'window-controls-overlay'].some((m) => matchMedia(`(display-mode: ${m})`).matches) || navigator.standalone === true;
if (instalada()) document.documentElement.dataset.app = '1';

/* ── el trabajador de servicio ───────────────────────────────────────────── */
if ('serviceWorker' in navigator && location.protocol !== 'file:') {
  const registrar = () => navigator.serviceWorker.register('/sw.js', { scope: '/', updateViaCache: 'none' }).catch(() => {});
  if (document.readyState === 'complete') registrar(); else window.addEventListener('load', registrar, { once: true }); // después de pintar: instalarlo no compite con la primera carga
}

/* ── instalar ────────────────────────────────────────────────────────────── */
const CAMBIO = 'cupido:app';
let ofrecimiento = null; // lo que el navegador entrega cuando la página se puede instalar con un toque
const avisar = () => { try { window.dispatchEvent(new CustomEvent(CAMBIO)); } catch {} };
window.addEventListener('beforeinstallprompt', (e) => { e.preventDefault(); ofrecimiento = e; avisar(); });
window.addEventListener('appinstalled', () => { ofrecimiento = null; document.documentElement.dataset.app = '1'; avisar(); cerrarVentana(); aviso('💘 Cupido quedó instalado. Búscalo junto a tus demás apps.'); });
try { matchMedia('(display-mode: standalone)').addEventListener('change', avisar); } catch {}

const paso = (n, t) => `<li><span class="n">${n}</span><span>${t}</span></li>`;
function instrucciones() {
  if (enAppAjena) return { t: 'Primero ábrelo en tu navegador', pasos: [paso(1, 'Toca los <b>tres puntos</b> o el icono de compartir de esta ventana.'), paso(2, `Elige <b>«Abrir en ${esIOS ? 'Safari' : 'Chrome'}»</b>.`), paso(3, 'Ya en el navegador, vuelve a tocar «Instalar Cupido».')] };
  if (esIOS) return { t: 'En iPhone y iPad', pasos: [paso(1, 'Toca <b>Compartir</b>: el cuadro con la flecha hacia arriba, abajo o arriba de la pantalla.'), paso(2, 'Baja y elige <b>«Agregar a inicio»</b>.'), paso(3, 'Toca <b>Agregar</b>. Cupido queda en tu pantalla, con su icono.')], nota: 'En iPhone la app guarda su propia sesión: la primera vez te pide entrar otra vez. Usa el código de 8 números que viene en el correo.' };
  if (esSafariMac) return { t: 'En Safari de Mac', pasos: [paso(1, 'En el menú de arriba, abre <b>Archivo</b>.'), paso(2, 'Elige <b>«Agregar al Dock»</b>.'), paso(3, 'Cupido queda en tu Dock y abre en su propia ventana.')] };
  if (esFirefox && !esAndroid) return { t: 'Firefox en computadora no instala apps', pasos: [paso(1, 'Abre Cupido en <b>Chrome</b>, <b>Edge</b> o <b>Safari</b>.'), paso(2, 'Ahí toca «Instalar Cupido» y se instala con un toque.')], nota: 'Mientras tanto, aquí en Firefox funciona igual, y puedes ponerlo en pantalla completa.' };
  if (esAndroid) return { t: 'En Android', pasos: [paso(1, 'Toca los <b>tres puntos</b> del navegador, arriba a la derecha.'), paso(2, 'Elige <b>«Instalar app»</b> o <b>«Agregar a pantalla principal»</b>.'), paso(3, 'Confirma. Cupido queda con tus demás apps.')] };
  return { t: 'En Chrome o Edge', pasos: [paso(1, 'Busca el icono de <b>instalar</b> al final de la barra de direcciones (una pantalla con una flecha).'), paso(2, 'O abre el menú de los <b>tres puntos</b> → <b>«Guardar y compartir»</b> → <b>«Instalar página como app»</b>.'), paso(3, 'Cupido abre en su propia ventana y queda en tu escritorio.')] };
}
let ventana = null;
function cerrarVentana() { if (ventana) { ventana.remove(); ventana = null; document.removeEventListener('keydown', tecla); } }
const tecla = (e) => { if (e.key === 'Escape') cerrarVentana(); };
export function abrirInstalar() {
  if (ventana) return;
  const ya = instalada(), i = instrucciones();
  ventana = document.createElement('div'); ventana.className = 'modal-velo on'; ventana.id = 'app-ventana';
  ventana.innerHTML = `<div class="modal claro app-modal" role="dialog" aria-label="Instalar Cupido"><button class="cerrar" aria-label="Cerrar">×</button>
    <div class="app-cab"><img src="/app/icono-192.png" width="64" height="64" alt="" data-priv-no><div><h2>${ya ? 'Ya tienes Cupido como app' : 'Lleva Cupido contigo'}</h2><p class="sub">${ya ? 'Estás usándolo instalado. Es la misma cuenta que en el navegador.' : 'Se instala en tu teléfono o en tu computadora. Es opcional: en el navegador funciona igual.'}</p></div></div>
    ${ya ? '' : `<ul class="razones" style="padding:0;margin:14px 0 4px">
      <li><span class="i si">✓</span><span><b>Abre en su propia ventana</b>, con su icono, sin la barra del navegador.</span></li>
      <li><span class="i si">✓</span><span><b>Abre más rápido</b>: los sonidos y lo que no cambia ya quedan en tu equipo.</span></li>
      <li><span class="i si">✓</span><span><b>No pesa casi nada</b> y se quita cuando quieras, como cualquier app.</span></li></ul>
    ${ofrecimiento ? `<button class="boton" id="app-ya" type="button" style="width:100%;margin-top:10px">Instalar Cupido</button>` : `<p class="app-t">${i.t}</p><ol class="app-pasos">${i.pasos.join('')}</ol>`}
    ${i.nota && !ofrecimiento ? `<p class="nota-entrar" style="text-align:left;margin-top:10px">${i.nota}</p>` : ''}`}
    <p class="nota-entrar" style="text-align:left;margin-top:12px">Para oír a Cupido cuando pase algo, tenlo abierto y con el sonido encendido. Sin publicidad, también aquí.</p></div>`;
  document.body.appendChild(ventana);
  ventana.querySelector('.cerrar').onclick = cerrarVentana; ventana.onclick = (e) => { if (e.target === ventana) cerrarVentana(); }; document.addEventListener('keydown', tecla);
  const b = ventana.querySelector('#app-ya');
  if (b) b.onclick = async () => { const o = ofrecimiento; if (!o) return; b.disabled = true; try { o.prompt(); const r = await o.userChoice; if (r && r.outcome === 'accepted') { ofrecimiento = null; cerrarVentana(); } } catch {} b.disabled = false; avisar(); };
}
// El botón «Instalar Cupido». No se pinta si ya está instalada.
export function botonInstalar(el, { clase = 'app-entrada', texto = 'Instalar Cupido' } = {}) {
  if (!el) return;
  const pinta = () => { el.innerHTML = instalada() ? '' : `<button type="button" class="${clase}"><span class="ico">📲</span>${texto}</button>`; const b = el.querySelector('button'); if (b) b.onclick = abrirInstalar; };
  pinta(); window.addEventListener(CAMBIO, pinta);
}

/* ── pantalla completa (y que no se duerma mientras dura) ────────────────── */
const raiz = document.documentElement;
const puedeCompleta = () => !!(document.fullscreenEnabled || document.webkitFullscreenEnabled);
const enCompleta = () => !!(document.fullscreenElement || document.webkitFullscreenElement);
export async function pantallaCompleta(on = !enCompleta()) {
  try {
    if (on) await (raiz.requestFullscreen ? raiz.requestFullscreen({ navigationUI: 'hide' }) : raiz.webkitRequestFullscreen());
    else await (document.exitFullscreen ? document.exitFullscreen() : document.webkitExitFullscreen());
  } catch { aviso('Este navegador no dejó poner la pantalla completa. Prueba con F11.'); }
}
let candado = null;
async function despierta(on) { // con la pantalla completa, la pantalla no se apaga sola: sirve para dejarla en un segundo monitor
  try { if (on && 'wakeLock' in navigator && !candado) { candado = await navigator.wakeLock.request('screen'); candado.addEventListener?.('release', () => { candado = null; }); } else if (!on && candado) { await candado.release(); candado = null; } } catch { candado = null; }
}
const alCambiarCompleta = () => { const on = enCompleta(); raiz.toggleAttribute('data-completa', on); despierta(on); avisar(); };
document.addEventListener('fullscreenchange', alCambiarCompleta); document.addEventListener('webkitfullscreenchange', alCambiarCompleta);
document.addEventListener('visibilitychange', () => { if (!document.hidden && enCompleta()) despierta(true); }); // al volver a la pestaña, el permiso se pide otra vez
export function botonCompleta(el) {
  if (!el || !puedeCompleta()) return;
  const pinta = () => { const on = enCompleta(); el.innerHTML = `<button type="button" class="dock-b ${on ? 'on' : ''}" role="switch" aria-checked="${on}" title="${on ? 'Salir de pantalla completa (Esc)' : 'Ocupa toda la pantalla. Mientras dura, la pantalla no se duerme.'}"><span class="ico">⛶</span><span class="t">Pantalla completa</span></button>`; el.querySelector('button').onclick = () => pantallaCompleta(); };
  pinta(); window.addEventListener(CAMBIO, pinta);
}

/* ── el numerito en el icono de la app ───────────────────────────────────── */
export function insignia(n) {
  try { if (!('setAppBadge' in navigator)) return; if (n > 0) navigator.setAppBadge(Math.min(n, 99)).catch(() => {}); else navigator.clearAppBadge().catch(() => {}); } catch {}
}

/* ── la conexión: avisar cuando se va, ponerse al día cuando vuelve ──────── */
function aviso(txt, ms = 4200) {
  let t = document.querySelector('.toast');
  if (!t) { t = document.createElement('div'); t.className = 'toast'; t.setAttribute('role', 'status'); document.body.appendChild(t); }
  t.textContent = txt; requestAnimationFrame(() => t.classList.add('visible')); clearTimeout(t._h); t._h = setTimeout(() => t.classList.remove('visible'), ms);
}
function franja(on) {
  let f = document.querySelector('#app-sin-red');
  if (on && !f) { f = document.createElement('div'); f.id = 'app-sin-red'; f.className = 'app-sin-red'; f.setAttribute('role', 'status'); f.textContent = 'Sin conexión. Cupido se pone al día en cuanto vuelva.'; document.body.appendChild(f); }
  else if (!on && f) f.remove();
}
window.addEventListener('offline', () => franja(true));
window.addEventListener('online', () => { franja(false); try { window.dispatchEvent(new CustomEvent('cupido:enlinea')); } catch {} });
if (navigator.onLine === false) franja(true);
// RLR
