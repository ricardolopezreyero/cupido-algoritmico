/* ─────────────────────────────────────────────────────────────────────
   Cupido Algorítmico · El go-to-market (/gtm) — RLR · Ricardo López Reyero
   Privado. La página pública (public/gtm.html) es un cascarón: la estrategia,
   las tareas y las fichas viajan solo en /api/gtm, y solo a quien tiene permiso.
   Quién entra: los correos de la casa (DOMINIOS_CASA) y nadie más. Se entra con
   el login de la casa (el pase de login.capitaltorreon.com) o con la sesión de
   Cupido. Quien entra ve todo (también los candidatos y las pruebas recibidas)
   y pone palomitas; cada una queda con su correo y su hora.
   Los puntos de control (usuarios al mes e ingreso al mes) no se palomean:
   se alcanzan solos el día en que los dos números reales llegan a la meta.
   ───────────────────────────────────────────────────────────────────── */
import { verificarPase } from './verificar.js';
import { etiqueta } from '../public/js/preguntas.js';
import { TAREAS, FASES, AREAS, QUIENES, ESFUERZOS, RITMOS, PASOS, CONTROLES, SUPUESTOS_CONTROL } from './gtm-tareas.js';
import { PLAN } from './gtm-plan.js';
import { ESQUEMA_CEO, listarPostulaciones } from './ceo.js';
import { ESQUEMA_CANDIDATOS } from './candidatos.js';
import { ingresoDe, sociosVivos, saludPagos } from './pagos.js';

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
const PCS = new Set(CONTROLES.map((c) => c[0]));
const limpio = (c) => String(c || '').trim().toLowerCase();
const esCorreo = (c) => /^[^\s@]{1,64}@[^\s@]{1,190}\.[a-z]{2,}$/.test(c);
// Quién entra a /gtm (y, por lo mismo, quién pone y quita palomitas): solo correos de estos dominios
export const DOMINIOS_CASA = ['ingenieriadigital.mx', 'superleads.mx'];
const deCasa = (correo) => DOMINIOS_CASA.includes(limpio(correo).split('@')[1] || '');

/* ── quién toca la puerta: { email, nombre, admin } · { falta: 'sesion' } · { falta: 'permiso', email } ── */
export async function quienGtm(env, req, url, yo) {
  let email = '', nombre = '';
  const pase = (req.headers.get('authorization') || '').match(/^Bearer\s+([\w-]+\.[\w-]+\.[\w-]+)$/)?.[1];
  if (pase) { const q = await verificarPase(pase, url.hostname); if (q?.email) { email = limpio(q.email); nombre = q.name || ''; } }
  if (!email && yo && !yo.sesion?.demo && yo.P?.correo) { email = limpio(yo.P.correo); nombre = yo.P.nombre === 'Sin nombre' ? '' : yo.P.nombre; }
  if (!email) return { falta: 'sesion' };
  if (!deCasa(email)) return { falta: 'permiso', email };
  // Dentro de /gtm toda la casa ve lo mismo: candidatos y pruebas incluidos (decisión de Ricardo, 11-oct-2026)
  return { email, nombre: nombre || email.split('@')[0], admin: true };
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
  // Los dos números de control. Usuarios al mes: cuentas de verdad que abrieron Cupido en los últimos 30 días (la visita se anota
  // desde que existe la columna; para lo anterior valen la fecha de alta y la sesión). Ingreso al mes: lo que dice el libro de cobros
  // (src/pagos.js): cada cobro de los últimos 30 días, del Fondo y de cada mensualidad de socio, ya restado lo que se devolvió.
  const d30 = `datetime('now', '-30 days')`;
  const v = await uno(`SELECT COUNT(*) n FROM personas p WHERE p.pool = 'real' AND p.estado != 'vetada'
      AND (p.visita >= ${d30} OR p.creada >= ${d30} OR EXISTS (SELECT 1 FROM sesiones s WHERE s.persona = p.id AND s.demo = 0 AND s.usada >= ${d30}))`);
  const ingreso = await ingresoDe(env, 30), socios = await sociosVivos(env), pagos = await saludPagos(env);
  const c = (await env.DB.prepare(`SELECT ciudad, COUNT(*) n, SUM(genero = 'mujer') m, SUM(genero = 'hombre') h
    FROM personas WHERE pool = 'real' AND estado != 'vetada' AND completo = 1 AND ciudad IS NOT NULL GROUP BY ciudad ORDER BY n DESC LIMIT 6`).all()).results;
  return {
    cuentas: g.cuentas, completos: g.completos, mujeres: g.mujeres, hombres: g.hombres, invitados: g.invitados,
    semana: g.semana, completosSemana: g.completos_semana, cruces: p.cruces, arriba: p.arriba, puertas: u.abiertas, avisadas: u.avisadas,
    usuariosMes: v.n, ingresoMes: ingreso.total, fondoMes: ingreso.fondo, sociosMes: ingreso.socio, socios: socios.vivos, sociosAtrasados: socios.atrasados,
    // si el libro no está al día con Stripe, la página lo dice: el ingreso puede estar corto (nunca inflado)
    pagos: { llave: pagos.llave, alDia: pagos.alDia, minutos: pagos.minutos, error: pagos.error, atorados: pagos.eventos.errores + pagos.eventos.perdidos, pendientes: pagos.pendientes },
    ciudades: c.map((x) => ({ ciudad: etiqueta('ciudad', x.ciudad) || x.ciudad, n: x.n, m: x.m, h: x.h })),
  };
}

/* ── todo lo que pinta la página, de una vez ── */
export async function verGtm(env, q) {
  const hechas = {}, alcanzados = {};
  for (const f of (await env.DB.prepare(`SELECT id, hecha_por, hecha_nombre, hecha_at FROM gtm_tareas`).all()).results) {
    if (IDS.has(f.id)) hechas[f.id] = { por: f.hecha_por, nombre: f.hecha_nombre || f.hecha_por.split('@')[0], at: f.hecha_at };
    else if (PCS.has(f.id)) alcanzados[f.id] = { at: f.hecha_at };
  }
  // Un punto de control se alcanza solo: el día en que los dos números reales llegan a la meta se anota, y ya no se borra aunque después bajen
  const h = await hoy(env);
  for (const [id, , , , usuarios, ingreso] of CONTROLES) {
    if (alcanzados[id] || h.usuariosMes < usuarios || h.ingresoMes < ingreso) continue;
    await env.DB.prepare(`INSERT OR IGNORE INTO gtm_tareas (id, hecha_por, hecha_nombre) VALUES (?, 'automatico', 'Cupido')`).bind(id).run();
    alcanzados[id] = { at: new Date().toISOString().slice(0, 19).replace('T', ' ') };
  }
  // las pruebas de /ceo traen datos de personas: solo las ve una cuenta administradora. Y a esa cuenta se le avisará de las que lleguen.
  const postulaciones = q.admin ? await listarPostulaciones(env) : [];
  if (q.admin && esCorreo(q.email)) await env.DB.prepare(`INSERT OR IGNORE INTO gtm_avisos (email) VALUES (?)`).bind(q.email).run();
  return { yo: { email: q.email, nombre: q.nombre, admin: q.admin, palomea: deCasa(q.email) }, dominios: DOMINIOS_CASA, plan: PLAN, tareas: TAREAS, catalogo: { fases: FASES, areas: AREAS, quienes: QUIENES, esfuerzos: ESFUERZOS, ritmos: RITMOS, pasos: PASOS }, hechas, controles: CONTROLES, alcanzados, supuestos: SUPUESTOS_CONTROL, postulaciones, hoy: h };
}

/* ── una palomita: se pone o se quita, y queda quién y cuándo ── */
export async function marcarTarea(env, q, id, hecha) {
  if (PCS.has(id)) return { ok: false, error: 'Un punto de control no se palomea: se alcanza solo, cuando los dos números llegan.' };
  if (!IDS.has(id)) return { ok: false, error: 'Esa actividad no existe.' };
  if (!deCasa(q.email)) return { ok: false, error: `Las palomitas solo las pone o las quita una cuenta ${DOMINIOS_CASA.map((d) => '@' + d).join(' o ')}. Entraste como ${q.email}.` };
  if (!hecha) { await env.DB.prepare(`DELETE FROM gtm_tareas WHERE id = ?`).bind(id).run(); return { ok: true, id, hecha: null }; }
  await env.DB.prepare(`INSERT INTO gtm_tareas (id, hecha_por, hecha_nombre) VALUES (?, ?, ?)
    ON CONFLICT(id) DO UPDATE SET hecha_por = excluded.hecha_por, hecha_nombre = excluded.hecha_nombre, hecha_at = datetime('now')`).bind(id, q.email, q.nombre || null).run();
  const f = await env.DB.prepare(`SELECT hecha_at FROM gtm_tareas WHERE id = ?`).bind(id).first();
  return { ok: true, id, hecha: { por: q.email, nombre: q.nombre || q.email.split('@')[0], at: f.hecha_at } };
}
