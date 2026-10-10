/* ─────────────────────────────────────────────────────────────────────
   Cupido Algorítmico · El go-to-market (/gtm) — RLR · Ricardo López Reyero
   Privado para el equipo. La página pública (public/gtm.html) es un cascarón:
   la estrategia y la lista viajan solo en /api/gtm, y solo a quien tiene permiso.
   Quién entra: las cuentas administradoras (huellas en ADMINES) y los correos
   que una de ellas haya puesto en el equipo. Se entra con el login de la casa
   (el pase de login.capitaltorreon.com) o con la sesión de Cupido.
   Cada palomita de la lista se guarda con quién la puso y cuándo.
   ───────────────────────────────────────────────────────────────────── */
import { verificarPase } from './verificar.js';
import { huella } from './ella.js';
import { etiqueta } from '../public/js/preguntas.js';
import { TAREAS, FASES, AREAS, QUIENES, ESFUERZOS, RITMOS } from './gtm-tareas.js';
import { PLAN } from './gtm-plan.js';
import { ESQUEMA_CEO, listarPostulaciones } from './ceo.js';
import { ESQUEMA_CANDIDATOS } from './candidatos.js';

export const _RLR = 'Ricardo López Reyero';
const _k = 'EYE', _rev = 181218;

export const ESQUEMA_GTM = [
  `CREATE TABLE IF NOT EXISTS gtm_tareas (
     id TEXT PRIMARY KEY, hecha_por TEXT NOT NULL, hecha_nombre TEXT,
     hecha_at TEXT NOT NULL DEFAULT (datetime('now')))`,
  `CREATE TABLE IF NOT EXISTS gtm_equipo (
     email TEXT PRIMARY KEY, agregado_por TEXT, at TEXT NOT NULL DEFAULT (datetime('now')))`,
  ...ESQUEMA_CEO,
  ...ESQUEMA_CANDIDATOS,
];

const IDS = new Set(TAREAS.map((t) => t[0]));
const limpio = (c) => String(c || '').trim().toLowerCase();
const esCorreo = (c) => /^[^\s@]{1,64}@[^\s@]{1,190}\.[a-z]{2,}$/.test(c);
const admines = (env) => String(env.ADMINES || '').split(',').map((x) => x.trim()).filter(Boolean);

/* ── quién toca la puerta: { email, nombre, admin } · { falta: 'sesion' } · { falta: 'permiso', email } ── */
export async function quienGtm(env, req, url, yo) {
  let email = '', nombre = '';
  const pase = (req.headers.get('authorization') || '').match(/^Bearer\s+([\w-]+\.[\w-]+\.[\w-]+)$/)?.[1];
  if (pase) { const q = await verificarPase(pase, url.hostname); if (q?.email) { email = limpio(q.email); nombre = q.name || ''; } }
  if (!email && yo && !yo.sesion?.demo && yo.P?.correo) { email = limpio(yo.P.correo); nombre = yo.P.nombre === 'Sin nombre' ? '' : yo.P.nombre; }
  if (!email) return { falta: 'sesion' };
  const admin = admines(env).includes(await huella(email));
  if (admin) return { email, nombre: nombre || email.split('@')[0], admin: true };
  const fila = await env.DB.prepare(`SELECT email FROM gtm_equipo WHERE email = ?`).bind(email).first();
  return fila ? { email, nombre: nombre || email.split('@')[0], admin: false } : { falta: 'permiso', email };
}

/* ── dónde vamos hoy: los números de verdad, para que el plan no se discuta en el aire ── */
async function hoy(env) {
  const uno = (sql) => env.DB.prepare(sql).first();
  const g = await uno(`SELECT COUNT(*) cuentas, COALESCE(SUM(completo), 0) completos,
      COALESCE(SUM(completo = 1 AND genero = 'mujer'), 0) mujeres, COALESCE(SUM(completo = 1 AND genero = 'hombre'), 0) hombres,
      COALESCE(SUM(invitado_por IS NOT NULL), 0) invitados, COALESCE(SUM(creada >= datetime('now', '-7 days')), 0) semana,
      COALESCE(SUM(completo = 1 AND actualizada >= datetime('now', '-7 days')), 0) completos_semana
    FROM personas WHERE pool = 'real' AND estado != 'vetada'`);
  const p = await uno(`SELECT COUNT(*) cruces, COALESCE(SUM(x.pct >= 90 AND x.veto = 0), 0) arriba
    FROM pares x JOIN personas a ON a.id = x.a JOIN personas b ON b.id = x.b WHERE a.pool = 'real' AND b.pool = 'real'`);
  const u = await uno(`SELECT COALESCE(SUM(u.estado = 'abierta'), 0) abiertas, COUNT(*) avisadas
    FROM puertas u JOIN personas a ON a.id = u.a JOIN personas b ON b.id = u.b WHERE a.pool = 'real' AND b.pool = 'real'`);
  const c = (await env.DB.prepare(`SELECT ciudad, COUNT(*) n, SUM(genero = 'mujer') m, SUM(genero = 'hombre') h
    FROM personas WHERE pool = 'real' AND estado != 'vetada' AND completo = 1 AND ciudad IS NOT NULL GROUP BY ciudad ORDER BY n DESC LIMIT 6`).all()).results;
  return {
    cuentas: g.cuentas, completos: g.completos, mujeres: g.mujeres, hombres: g.hombres, invitados: g.invitados,
    semana: g.semana, completosSemana: g.completos_semana, cruces: p.cruces, arriba: p.arriba, puertas: u.abiertas, avisadas: u.avisadas,
    ciudades: c.map((x) => ({ ciudad: etiqueta('ciudad', x.ciudad) || x.ciudad, n: x.n, m: x.m, h: x.h })),
  };
}

/* ── todo lo que pinta la página, de una vez ── */
export async function verGtm(env, q) {
  const hechas = {};
  for (const f of (await env.DB.prepare(`SELECT id, hecha_por, hecha_nombre, hecha_at FROM gtm_tareas`).all()).results) {
    if (IDS.has(f.id)) hechas[f.id] = { por: f.hecha_por, nombre: f.hecha_nombre || f.hecha_por.split('@')[0], at: f.hecha_at };
  }
  const equipo = q.admin ? (await env.DB.prepare(`SELECT email, agregado_por, at FROM gtm_equipo ORDER BY at`).all()).results : [];
  // las pruebas de /ceo traen datos de personas: solo las ve una cuenta administradora. Y a esa cuenta se le avisará de las que lleguen.
  const postulaciones = q.admin ? await listarPostulaciones(env) : [];
  if (q.admin && esCorreo(q.email)) await env.DB.prepare(`INSERT OR IGNORE INTO gtm_avisos (email) VALUES (?)`).bind(q.email).run();
  return { yo: { email: q.email, nombre: q.nombre, admin: q.admin }, plan: PLAN, tareas: TAREAS, catalogo: { fases: FASES, areas: AREAS, quienes: QUIENES, esfuerzos: ESFUERZOS, ritmos: RITMOS }, hechas, equipo, postulaciones, hoy: await hoy(env) };
}

/* ── una palomita: se pone o se quita, y queda quién y cuándo ── */
export async function marcarTarea(env, q, id, hecha) {
  if (!IDS.has(id)) return { ok: false, error: 'Esa actividad no existe.' };
  if (!hecha) { await env.DB.prepare(`DELETE FROM gtm_tareas WHERE id = ?`).bind(id).run(); return { ok: true, id, hecha: null }; }
  await env.DB.prepare(`INSERT INTO gtm_tareas (id, hecha_por, hecha_nombre) VALUES (?, ?, ?)
    ON CONFLICT(id) DO UPDATE SET hecha_por = excluded.hecha_por, hecha_nombre = excluded.hecha_nombre, hecha_at = datetime('now')`).bind(id, q.email, q.nombre || null).run();
  const f = await env.DB.prepare(`SELECT hecha_at FROM gtm_tareas WHERE id = ?`).bind(id).first();
  return { ok: true, id, hecha: { por: q.email, nombre: q.nombre || q.email.split('@')[0], at: f.hecha_at } };
}

/* ── el equipo: solo una cuenta administradora agrega o quita correos ── */
export async function cambiarEquipo(env, q, correo, quitar) {
  if (!q.admin) return { ok: false, error: 'Solo una cuenta administradora cambia el equipo.', status: 403 };
  const email = limpio(correo);
  if (!esCorreo(email)) return { ok: false, error: 'Ese correo no se ve bien.' };
  if (quitar) await env.DB.prepare(`DELETE FROM gtm_equipo WHERE email = ?`).bind(email).run();
  else await env.DB.prepare(`INSERT OR IGNORE INTO gtm_equipo (email, agregado_por) VALUES (?, ?)`).bind(email, q.email).run();
  return { ok: true, equipo: (await env.DB.prepare(`SELECT email, agregado_por, at FROM gtm_equipo ORDER BY at`).all()).results };
}
