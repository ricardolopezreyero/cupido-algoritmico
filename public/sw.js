/* ─────────────────────────────────────────────────────────────────────────────
   Cupido Algorítmico · El trabajador de servicio — RLR · Ricardo López Reyero
   Lo que hace posible instalar Cupido y que abra rápido. Reglas:
   · Los datos vivos (todo /api/, la charla, las fotos y los videos) NUNCA pasan por
     caché: siempre van a la red. Aquí no se guarda nada de nadie.
   · Las páginas y el código (HTML, JS, CSS): primero la red, para que cada quien tenga
     siempre la versión de hoy; la copia guardada solo se usa si no hay conexión.
   · Lo que no cambia (sonidos, iconos, letras): primero la copia guardada. Por eso la
     segunda vez abre de inmediato y los sonidos no vuelven a bajar.
   · Sin conexión, una página propia lo dice claro en vez del dinosaurio del navegador.
   Para tirar todo lo guardado en la siguiente visita: subir el número de VERSION.
   ───────────────────────────────────────────────────────────────────────────── */
const _RLR = 'Ricardo López Reyero', _k = 'EYE', _rev = 181218;
const VERSION = 'cupido-v1';
const FIJO = VERSION + '-fijo', CODIGO = VERSION + '-codigo', LETRAS = VERSION + '-letras';
const SIN_CONEXION = '/sin-conexion'; // sin «.html»: así la sirve Cloudflare; con la extensión redirige, y una respuesta redirigida no se puede devolver a una navegación
const DE_ENTRADA = [SIN_CONEXION, '/css/cupido.css', '/favicon.svg', '/app/icono-192.png'];

self.addEventListener('install', (e) => {
  e.waitUntil(caches.open(FIJO).then((c) => c.addAll(DE_ENTRADA)).then(() => self.skipWaiting()));
});
self.addEventListener('activate', (e) => {
  e.waitUntil((async () => {
    for (const k of await caches.keys()) if (!k.startsWith(VERSION)) await caches.delete(k); // lo de versiones anteriores se va
    if (self.registration.navigationPreload) await self.registration.navigationPreload.enable(); // la página se pide mientras el trabajador despierta
    await self.clients.claim();
  })());
});

const guardable = (r) => r && (r.ok || r.type === 'opaque') && r.status !== 206;
async function primeroCopia(req, nombre) {
  const c = await caches.open(nombre), ya = await c.match(req);
  if (ya) return ya;
  const r = await fetch(req);
  if (guardable(r)) c.put(req, r.clone()).catch(() => {});
  return r;
}
async function primeroRed(req, nombre) {
  const c = await caches.open(nombre);
  try {
    const r = await fetch(req);
    if (guardable(r)) c.put(req, r.clone()).catch(() => {});
    return r;
  } catch (err) { const ya = await c.match(req); if (ya) return ya; throw err; }
}
async function pagina(e) {
  try { return (await e.preloadResponse) || await fetch(e.request); }
  catch { return (await caches.match(SIN_CONEXION)) || new Response('Sin conexión', { status: 503, headers: { 'content-type': 'text/plain; charset=utf-8' } }); }
}

self.addEventListener('fetch', (e) => {
  const req = e.request;
  if (req.method !== 'GET') return;
  const u = new URL(req.url);
  if (u.origin === self.location.origin) {
    if (u.pathname.startsWith('/api/') || u.pathname === '/sw.js') return;            // datos vivos: derecho a la red, sin tocar
    if (req.mode === 'navigate') { e.respondWith(pagina(e)); return; }
    if (/^\/(sonidos|app|img)\//.test(u.pathname) || u.pathname === '/favicon.svg') { e.respondWith(primeroCopia(req, FIJO)); return; }
    if (/^\/(js|css)\//.test(u.pathname) || u.pathname === '/manifest.webmanifest') { e.respondWith(primeroRed(req, CODIGO)); return; }
    return;
  }
  if (u.hostname === 'fonts.googleapis.com' || u.hostname === 'fonts.gstatic.com') e.respondWith(primeroCopia(req, LETRAS));
});
// fin · RLR
