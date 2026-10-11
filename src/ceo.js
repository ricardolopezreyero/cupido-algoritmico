/* ─────────────────────────────────────────────────────────────────────
   Cupido Algorítmico · Dirección (/ceo) — RLR · Ricardo López Reyero
   La página pública (public/ceo.html) describe a quien va a dirigir Cupido y
   ejecutar el go-to-market. No pide currículum: pide una prueba. Aquí se
   guarda esa prueba y se arma el aviso para quien administra.
   Las pruebas se leen en /gtm → El CEO → Pruebas (solo cuentas administradoras).
   ───────────────────────────────────────────────────────────────────── */
export const _RLR = 'Ricardo López Reyero';
const _k = 'EYE', _rev = 181218;

export const ESQUEMA_CEO = [
  `CREATE TABLE IF NOT EXISTS ceo_postulaciones (
     id INTEGER PRIMARY KEY AUTOINCREMENT, nombre TEXT NOT NULL, correo TEXT NOT NULL, whatsapp TEXT, ciudad TEXT,
     sala TEXT, diez_dias TEXT, cambiarias TEXT, correcto TEXT, video TEXT, enlace TEXT,
     ip_hash TEXT, creado TEXT NOT NULL DEFAULT (datetime('now')))`,
  // a quién se le avisa cuando llega una prueba: las cuentas administradoras que ya abrieron /gtm
  `CREATE TABLE IF NOT EXISTS gtm_avisos (email TEXT PRIMARY KEY, at TEXT NOT NULL DEFAULT (datetime('now')))`,
];

const txt = (v, max) => String(v ?? '').replace(/\u0000/g, '').trim().slice(0, max);
const liga = (v) => { const t = txt(v, 300); return /^https?:\/\/[^\s]+\.[^\s]+$/i.test(t) ? t : t && /^[\w.-]+\.[a-z]{2,}\//i.test(t) ? 'https://' + t : ''; };
const huellaIp = async (req) => {
  const ip = req.headers.get('cf-connecting-ip') || ''; if (!ip) return null;
  const h = await crypto.subtle.digest('SHA-256', new TextEncoder().encode(ip + _k + 'ceo'));
  return [...new Uint8Array(h)].slice(0, 12).map((b) => b.toString(16).padStart(2, '0')).join('');
};

/* ── guardar una prueba ── */
export async function guardarPostulacion(env, req, b) {
  if (txt(b.empresa, 50)) return { ok: true, trampa: true };   // la casilla trampa la llenan los robots: se les dice que sí y no se guarda nada
  const f = {
    nombre: txt(b.nombre, 90), correo: txt(b.correo, 120).toLowerCase(), whatsapp: txt(b.whatsapp, 30), ciudad: txt(b.ciudad, 80),
    sala: txt(b.sala, 4000), diez_dias: txt(b.diez_dias, 6000), cambiarias: txt(b.cambiarias, 4000), correcto: txt(b.correcto, 4000),
    video: liga(b.video), enlace: liga(b.enlace),
  };
  if (f.nombre.length < 3) return { ok: false, error: 'Falta tu nombre.' };
  if (!/^[^@\s]+@[^@\s]+\.[^@\s]+$/.test(f.correo)) return { ok: false, error: 'Ese correo no se ve bien.' };
  if (f.sala.length < 120) return { ok: false, error: 'Cuéntanos con más detalle la vez que juntaste gente: de cuánto a cuánto, en cuánto tiempo y con cuánto dinero.' };
  if (f.diez_dias.length < 200) return { ok: false, error: 'Los diez días piden más detalle: qué harías cada día.' };
  if (f.cambiarias.length < 120) return { ok: false, error: 'Dinos las tres cosas que cambiarías, con su porqué.' };
  if (f.correcto.length < 80) return { ok: false, error: 'Cuéntanos un poco más de la vez que elegiste lo correcto.' };
  // una página pública no debe poder llenar la base
  const ip = await huellaIp(req);
  const c = await env.DB.prepare(`SELECT
      (SELECT COUNT(*) FROM ceo_postulaciones WHERE creado > datetime('now', '-1 day')) AS hoy,
      (SELECT COUNT(*) FROM ceo_postulaciones WHERE correo = ? AND creado > datetime('now', '-1 day')) AS suyas,
      (SELECT COUNT(*) FROM ceo_postulaciones WHERE ip_hash = ? AND creado > datetime('now', '-1 day')) AS deAqui`).bind(f.correo, ip).first();
  if (c.suyas > 0) return { ok: false, error: 'Ya recibimos tu prueba hoy. Si quieres corregir algo, mándala de nuevo mañana.' };
  if (c.hoy >= 40 || c.deAqui >= 3) return { ok: false, error: 'Hoy llegaron muchas pruebas. Intenta de nuevo mañana.' };
  await env.DB.prepare(`INSERT INTO ceo_postulaciones (nombre, correo, whatsapp, ciudad, sala, diez_dias, cambiarias, correcto, video, enlace, ip_hash)
    VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)`).bind(f.nombre, f.correo, f.whatsapp || null, f.ciudad || null, f.sala, f.diez_dias, f.cambiarias, f.correcto, f.video || null, f.enlace || null, ip).run();
  return { ok: true, fila: f };
}

/* ── leerlas (solo se llama para una cuenta administradora) ── */
export async function listarPostulaciones(env) {
  return (await env.DB.prepare(`SELECT id, nombre, correo, whatsapp, ciudad, sala, diez_dias, cambiarias, correcto, video, enlace, creado
    FROM ceo_postulaciones ORDER BY creado DESC LIMIT 100`).all()).results;
}

/* ── el aviso: corto y con un solo botón; la prueba se lee adentro, no en el correo ── */
const esc = (s) => String(s ?? '').replace(/&/g, '&amp;').replace(/</g, '&lt;').replace(/>/g, '&gt;').replace(/"/g, '&quot;');
export const avisoPostulacion = (env, f) => ({
  tipo: 'ceo_prueba', asunto: 'Llegó una prueba para dirigir Cupido',
  contenido: {
    tono: 'claro', figura: { tipo: 'emoji', v: '🧭' }, eyebrow: 'Dirección', titulo: 'Llegó una prueba.',
    sub: `${esc(f.nombre)}${f.ciudad ? `, de ${esc(f.ciudad)}` : ''}.`, vista: 'Está completa en el go-to-market, en El CEO.',
    parrafos: ['Está completa en el go-to-market, en la parte «El CEO». Ahí también está la guía para leerla.'],
    boton: { url: `${env.BASE_URL || 'https://cupido.capitaltorreon.com'}/gtm#pruebas`, txt: 'Leer la prueba' },
    pieCuenta: 'Te llega porque administras Cupido.',
  },
});
export async function aQuienAvisar(env) { return (await env.DB.prepare(`SELECT email FROM gtm_avisos LIMIT 6`).all()).results.map((r) => r.email); }
