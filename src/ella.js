/* ─────────────────────────────────────────────────────────────────────────────
   Cupido Algorítmico · Aquí manda ella
   Autor: Ricardo López Reyero
   La regla de la casa: Cupido está hecho para que ella encuentre a la persona
   correcta, segura, cómoda y en control. Si ella bloquea, queda bloqueado. Si
   diez mujeres distintas bloquean a un hombre, queda fuera para siempre.
   Los candados:
   · Cerrar la puerta (sin castigo) no es lo mismo que bloquear (sí cuenta).
   · Él no puede insistir: cinco mensajes sin respuesta y le toca esperar.
   · Él no manda fotos, video, voz ni archivos hasta que ella lo permite.
   · Su foto, su voz y su video los enseña ella cuando quiere, no la puerta.
   · Ella puede retirar lo que compartió, borrar la charla y reportar.
   · Modo discreta, «que nadie sepa de mí hasta que yo diga sí» y la lista
     de personas con las que no quiere cruzarse nunca.
   Lo básico (cerrar, bloquear, reportar, evitar) lo tiene cualquier persona.
   ───────────────────────────────────────────────────────────────────────────── */
// RLR
import { persona, anotar, recalcularTodo } from './datos.js';
import { avisarVivo } from './viva.js';
import { correoA, mandar } from './correos.js';

export const _RLR = 'Ricardo López Reyero';
const _k = 'EYE', _rev = 181218;

export const VETO_BLOQUEOS = 10;     // mujeres distintas que lo bloquean → fuera para siempre
export const REVISION_REPORTES = 3;  // reportes de mujeres distintas → sale del matching hasta que una persona lo revise
export const INSISTENCIA = 5;        // mensajes seguidos de él sin respuesta de ella
export const MAX_EVITAR = 30;

export const MOTIVOS = [
  { id: 'insiste', n: 'Insiste o no acepta un no' },
  { id: 'grosero', n: 'Fue grosero o me faltó al respeto' },
  { id: 'sexual', n: 'Mandó o pidió contenido sexual que yo no quería' },
  { id: 'miente', n: 'Miente sobre quién es (edad, estado civil, fotos)' },
  { id: 'dinero', n: 'Me pidió dinero o quiso venderme algo' },
  { id: 'miedo', n: 'Me amenazó o me dio miedo' },
  { id: 'otro', n: 'Otra cosa' },
];

export const ESQUEMA_ELLA = [
  `CREATE TABLE IF NOT EXISTS bloqueos (
     de TEXT NOT NULL, a TEXT NOT NULL, tipo TEXT NOT NULL DEFAULT 'bloqueo', motivo TEXT, detalle TEXT,
     genero_de TEXT, genero_a TEXT, pool_de TEXT, estado TEXT NOT NULL DEFAULT 'vigente', atendido TEXT,
     creado TEXT NOT NULL DEFAULT (datetime('now')), PRIMARY KEY (de, a))`,
  `CREATE INDEX IF NOT EXISTS idx_bloqueos_a ON bloqueos(a, estado)`,
  `CREATE TABLE IF NOT EXISTS vetados (
     huella TEXT PRIMARY KEY, persona TEXT, motivo TEXT, creado TEXT NOT NULL DEFAULT (datetime('now')))`,
  `CREATE TABLE IF NOT EXISTS controles (
     persona TEXT NOT NULL, otra TEXT NOT NULL, k TEXT NOT NULL, v INTEGER NOT NULL, PRIMARY KEY (persona, otra, k))`,
  `CREATE TABLE IF NOT EXISTS evitar (
     persona TEXT NOT NULL, huella TEXT NOT NULL, pista TEXT, creado TEXT NOT NULL DEFAULT (datetime('now')), PRIMARY KEY (persona, huella))`,
];

const clave = (x, y) => (x < y ? [x, y] : [y, x]);
const nom = (P) => (!P || P.nombre === 'Sin nombre' ? 'Alguien' : P.nombre.split(' ')[0]);
export const ajustesDe = (P) => { try { return JSON.parse(P?.ajustes || '{}'); } catch { return {}; } };
export const esHombre = (P) => P?.genero === 'hombre';
// ¿P manda frente a O? Ella (o una persona no binaria) frente a un hombre.
export const manda = (P, O) => !esHombre(P) && esHombre(O);

export async function huella(txt) {
  const h = await crypto.subtle.digest('SHA-256', new TextEncoder().encode('cupido·' + String(txt || '').trim().toLowerCase()));
  return [...new Uint8Array(h)].slice(0, 16).map((b) => b.toString(16).padStart(2, '0')).join('');
}
const pistaDe = (correo) => { const [u, d] = String(correo).split('@'); return `${u.slice(0, 1)}•••@${d || ''}`; };

/* ── quién administra: una cuenta de Cupido cuya huella está en ADMINES ─── */
export async function esAdmin(env, yo) {
  if (!yo || yo.sesion?.demo || !yo.P?.correo) return false;
  const lista = String(env.ADMINES || '').split(',').map((x) => x.trim()).filter(Boolean);
  return lista.length > 0 && lista.includes(await huella(yo.P.correo));
}

/* ── controles por charla: lo que cada quien permite frente a la otra persona ── */
// recibir_medios: ¿puede mandarme fotos, video, voz y archivos? · mis_medios: ¿puede ver mi foto, mi voz y mi video?
// Frente a un hombre, los de ella nacen apagados: ella los enciende cuando quiere.
const CONTROLES = ['recibir_medios', 'mis_medios'];
export async function control(env, P, O, k) {
  const f = await env.DB.prepare(`SELECT v FROM controles WHERE persona = ? AND otra = ? AND k = ?`).bind(P.id, O.id, k).first();
  return f ? !!f.v : !manda(P, O);
}
export async function controlesDe(env, P, O) {
  const filas = new Map((await env.DB.prepare(`SELECT k, v FROM controles WHERE persona = ? AND otra = ?`).bind(P.id, O.id).all()).results.map((f) => [f.k, !!f.v]));
  return Object.fromEntries(CONTROLES.map((k) => [k, filas.has(k) ? filas.get(k) : !manda(P, O)]));
}
export async function ponerControl(env, P, otraId, k, v) {
  if (!CONTROLES.includes(k)) return { error: 'Control inválido', status: 400 };
  const O = await persona(env, otraId);
  const [a, b] = clave(P.id, otraId);
  const c = O && await env.DB.prepare(`SELECT 1 AS v FROM charlas WHERE a = ? AND b = ? AND cerrada IS NULL`).bind(a, b).first();
  if (!c) return { error: 'No hay una puerta abierta con esa persona', status: 403 };
  await env.DB.prepare(`INSERT INTO controles (persona, otra, k, v) VALUES (?, ?, ?, ?) ON CONFLICT(persona, otra, k) DO UPDATE SET v = excluded.v`).bind(P.id, otraId, k, v ? 1 : 0).run();
  const txt = k === 'recibir_medios'
    ? (v ? `${nom(P)} ya recibe fotos, videos, notas de voz y archivos en esta charla.` : `${nom(P)} dejó de recibir fotos, videos, notas de voz y archivos en esta charla.`)
    : (v ? `${nom(P)} decidió enseñar su foto, su voz y su video.` : `${nom(P)} guardó su foto, su voz y su video.`);
  await env.DB.prepare(`INSERT INTO mensajes (a, b, de, tipo, texto) VALUES (?, ?, 'sistema', 'sistema', ?)`).bind(a, b, txt).run();
  await avisarVivo(env, a, b, { t: 'mensaje', de: 'sistema', tipo: 'sistema', control: k });
  return { ok: true, controles: await controlesDe(env, P, O) };
}

// ¿Cuántos mensajes seguidos lleva él sin que ella conteste? (los saludos automáticos no cuentan)
export async function sinRespuesta(env, c, yo, otraId) {
  return (await env.DB.prepare(
    `SELECT COUNT(*) AS n FROM mensajes WHERE a = ? AND b = ? AND de = ? AND auto = 0
     AND id > COALESCE((SELECT MAX(id) FROM mensajes WHERE a = ? AND b = ? AND de = ? AND auto = 0), 0)
     AND creado > COALESCE((SELECT MAX(r.creado) FROM respuestas r JOIN mensajes m ON m.id = r.mensaje WHERE m.a = ? AND m.b = ? AND r.persona = ?), '')
     AND creado > COALESCE((SELECT MAX(r.creado) FROM reacciones r JOIN mensajes m ON m.id = r.mensaje WHERE m.a = ? AND m.b = ? AND r.persona = ?), '')`)
    // contestar una carta o reaccionar también es responder: ella ya dio señal
    .bind(c.a, c.b, yo, c.a, c.b, otraId, c.a, c.b, otraId, c.a, c.b, otraId).first()).n;
}

/* ── el filtro del motor: pares que nunca se cruzan (bloqueos y «no cruzarme con») ── */
export async function filtroElla(env, todas) {
  const bloq = new Set((await env.DB.prepare(`SELECT de, a FROM bloqueos WHERE estado = 'vigente'`).all()).results.flatMap((f) => [f.de + '|' + f.a, f.a + '|' + f.de]));
  const evita = new Map();
  for (const f of (await env.DB.prepare(`SELECT persona, huella FROM evitar`).all()).results) (evita.get(f.persona) || evita.set(f.persona, new Set()).get(f.persona)).add(f.huella);
  const huellas = new Map();
  if (evita.size) for (const P of todas) if (P.correo) huellas.set(P.id, await huella(P.correo));
  return (A, B) => bloq.has(A.id + '|' + B.id) || !!evita.get(A.id)?.has(huellas.get(B.id)) || !!evita.get(B.id)?.has(huellas.get(A.id));
}

/* ── cerrar la puerta: cualquiera de los dos, cuando quiera, sin castigo ── */
async function apagarCharla(env, a, b, cerro) {
  await env.DB.batch([
    env.DB.prepare(`UPDATE charlas SET cerrada = datetime('now'), cerro = ? WHERE a = ? AND b = ?`).bind(cerro, a, b),
    env.DB.prepare(`DELETE FROM liberaciones WHERE (persona = ? AND otra = ?) OR (persona = ? AND otra = ?)`).bind(a, b, b, a),
    env.DB.prepare(`DELETE FROM controles WHERE (persona = ? AND otra = ?) OR (persona = ? AND otra = ?)`).bind(a, b, b, a),
  ]);
  await avisarVivo(env, a, b, { t: 'cerrada' });
}
// Borra lo que mandó esta persona en la charla: sus textos y sus archivos (los de la otra persona se conservan como evidencia)
async function borrarLoMio(env, a, b, yo) {
  const arch = (await env.DB.prepare(`SELECT archivo FROM mensajes WHERE a = ? AND b = ? AND de = ? AND tipo = 'archivo'`).bind(a, b, yo).all()).results;
  for (const f of arch) { try { const k = JSON.parse(f.archivo || '{}').clave; if (k) await env.MEDIOS.delete([k, k + '.vista']); } catch {} }
  await env.DB.prepare(`UPDATE mensajes SET texto = '', archivo = NULL, tipo = 'borrado' WHERE a = ? AND b = ? AND de = ?`).bind(a, b, yo).run();
}
const avisoCierre = (env, paraId, P) => env.DB.prepare(`INSERT INTO avisos (persona, tipo, texto, otra) VALUES (?, 'cierre', ?, ?)`)
  .bind(paraId, `Se cerró la puerta con ${nom(P)}. Aquí cualquiera de los dos puede cerrarla cuando quiera, sin dar explicaciones.`, P.id);

export async function cerrarPuerta(env, P, otraId, { borrar = false } = {}) {
  const [a, b] = clave(P.id, otraId);
  const pu = await env.DB.prepare(`SELECT * FROM puertas WHERE a = ? AND b = ?`).bind(a, b).first();
  if (!pu || pu.estado !== 'abierta') return { error: 'No hay una puerta abierta con esa persona', status: 404 };
  if (borrar && esHombre(P)) return { error: 'Borrar la charla es una decisión de ella.', status: 403 };
  const col = P.id === a ? 'decision_a' : 'decision_b';
  await env.DB.prepare(`UPDATE puertas SET estado = 'retirada', cerro = ?, cerrada = datetime('now'), ${col} = 'no' WHERE a = ? AND b = ?`).bind(P.id, a, b).run();
  if (borrar) await borrarLoMio(env, a, b, P.id);
  await apagarCharla(env, a, b, P.id);
  await env.DB.batch([
    env.DB.prepare(`DELETE FROM avisos WHERE persona = ? AND otra = ? AND tipo = 'apertura'`).bind(otraId, P.id),
    avisoCierre(env, otraId, P),
  ]);
  await anotar(env, 'ella', borrar ? 'Alguien cerró una puerta y borró lo que mandó' : 'Alguien cerró una puerta', P.genero || '');
  return { ok: true };
}

/* ── bloquear y reportar ─────────────────────────────────────────────────── */
// Solo se bloquea a alguien con quien la puerta llegó a abrirse: nadie bloquea a un desconocido.
export async function bloquear(env, P, otraId, { reporte = false, motivo = null, detalle = '', borrar = false } = {}) {
  const O = await persona(env, otraId);
  if (!O || O.id === P.id) return { error: 'No existe esa persona', status: 404 };
  const [a, b] = clave(P.id, otraId);
  const charla = await env.DB.prepare(`SELECT cerrada FROM charlas WHERE a = ? AND b = ?`).bind(a, b).first();
  if (!charla) return { error: 'Solo se puede bloquear a alguien con quien la puerta se abrió. Si todavía no, basta con decir «ahora no».', status: 403 };
  if (reporte && !MOTIVOS.some((m) => m.id === motivo)) return { error: 'Elige qué pasó', status: 400 };
  let guardado = null;
  if (reporte) {
    // la evidencia viaja con el reporte: lo último que se dijo, tal cual quedó
    const ult = (await env.DB.prepare(`SELECT de, tipo, texto, creado FROM mensajes WHERE a = ? AND b = ? AND tipo != 'sistema' ORDER BY id DESC LIMIT 30`).bind(a, b).all()).results.reverse();
    guardado = JSON.stringify({ texto: String(detalle || '').slice(0, 1500), evidencia: ult.map((m) => ({ de: m.de === P.id ? 'reporta' : 'reportado', tipo: m.tipo, texto: String(m.texto || '').slice(0, 400), creado: m.creado })) });
  }
  await env.DB.prepare(
    `INSERT INTO bloqueos (de, a, tipo, motivo, detalle, genero_de, genero_a, pool_de, estado) VALUES (?, ?, ?, ?, ?, ?, ?, ?, 'vigente')
     ON CONFLICT(de, a) DO UPDATE SET estado = 'vigente', tipo = CASE WHEN excluded.tipo = 'reporte' THEN 'reporte' ELSE bloqueos.tipo END,
       motivo = COALESCE(excluded.motivo, bloqueos.motivo), detalle = COALESCE(excluded.detalle, bloqueos.detalle), atendido = CASE WHEN excluded.tipo = 'reporte' THEN NULL ELSE bloqueos.atendido END`)
    .bind(P.id, otraId, reporte ? 'reporte' : 'bloqueo', reporte ? motivo : null, guardado, P.genero || null, O.genero || null, P.pool).run();
  const abierta = !charla.cerrada;
  if (borrar && !esHombre(P)) await borrarLoMio(env, a, b, P.id);
  if (abierta) await apagarCharla(env, a, b, P.id);
  await env.DB.batch([
    env.DB.prepare(`DELETE FROM puertas WHERE a = ? AND b = ?`).bind(a, b),
    env.DB.prepare(`DELETE FROM pares WHERE a = ? AND b = ?`).bind(a, b),
    env.DB.prepare(`DELETE FROM avisos WHERE (persona = ? AND otra = ?) OR (persona = ? AND otra = ? AND tipo != 'cierre')`).bind(P.id, otraId, otraId, P.id),
    // el mismo aviso neutro que al cerrar: él no distingue un cierre de un bloqueo
    ...(abierta ? [avisoCierre(env, otraId, P)] : []),
  ]);
  await anotar(env, 'ella', reporte ? 'Llegó un reporte' : 'Alguien bloqueó a una persona', `${P.genero || '?'} → ${O.genero || '?'}${reporte ? ' · ' + motivo : ''}`);
  if (reporte) await avisarAdmin(env, motivo);
  const consecuencia = await consecuencias(env, P, O);
  return { ok: true, consecuencia };
}

// Lo que pasa después de un bloqueo de ella contra él. Los bloqueos del demo no cuentan contra cuentas reales.
async function consecuencias(env, P, O) {
  if (!manda(P, O) || O.estado === 'vetada') return null;
  const n = await env.DB.prepare(
    `SELECT COUNT(*) AS n, COALESCE(SUM(tipo = 'reporte'), 0) AS rep FROM bloqueos WHERE a = ? AND estado = 'vigente' AND COALESCE(genero_de, '') != 'hombre' AND (pool_de = 'real' OR ? = 'demo')`)
    .bind(O.id, O.pool).first();
  if (n.n >= VETO_BLOQUEOS) { await vetar(env, O, `${n.n} mujeres lo bloquearon`); return 'vetado'; }
  if (n.rep >= REVISION_REPORTES && O.estado === 'activa') {
    await env.DB.prepare(`UPDATE personas SET estado = 'revision' WHERE id = ?`).bind(O.id).run();
    await recalcularTodo(env, { avisar: true, motivo: 'revisión' });
    await anotar(env, 'ella', 'Una cuenta salió del matching hasta que alguien la revise', `${n.rep} reportes`);
    return 'revision';
  }
  return null;
}

export async function desbloquear(env, P, otraId) {
  const r = await env.DB.prepare(`UPDATE bloqueos SET estado = 'retirado' WHERE de = ? AND a = ? AND estado = 'vigente'`).bind(P.id, otraId).run();
  if (!r.meta.changes) return { error: 'No tenías bloqueada a esa persona', status: 404 };
  await recalcularTodo(env, { soloId: P.id, avisar: true, motivo: 'desbloqueo' });
  await anotar(env, 'ella', 'Alguien retiró un bloqueo', P.genero || '');
  return { ok: true };
}

/* ── fuera para siempre ──────────────────────────────────────────────────── */
export async function vetar(env, O, motivo) {
  const abiertas = (await env.DB.prepare(`SELECT a, b FROM puertas WHERE (a = ? OR b = ?) AND estado = 'abierta'`).bind(O.id, O.id).all()).results;
  for (const p of abiertas) { await apagarCharla(env, p.a, p.b, 'sistema'); await avisoCierre(env, p.a === O.id ? p.b : p.a, O).run(); }
  const lote = [
    env.DB.prepare(`UPDATE personas SET estado = 'vetada' WHERE id = ?`).bind(O.id),
    env.DB.prepare(`DELETE FROM sesiones WHERE persona = ?`).bind(O.id),
    env.DB.prepare(`DELETE FROM puertas WHERE a = ? OR b = ?`).bind(O.id, O.id),
    env.DB.prepare(`DELETE FROM pares WHERE a = ? OR b = ?`).bind(O.id, O.id),
    env.DB.prepare(`UPDATE charlas SET cerrada = COALESCE(cerrada, datetime('now')), cerro = COALESCE(cerro, 'sistema') WHERE a = ? OR b = ?`).bind(O.id, O.id),
  ];
  if (O.correo) lote.push(env.DB.prepare(`INSERT OR IGNORE INTO vetados (huella, persona, motivo) VALUES (?, ?, ?)`).bind(await huella(O.correo), O.id, motivo));
  await env.DB.batch(lote);
  await anotar(env, 'ella', 'Una cuenta quedó fuera para siempre', motivo);
  if (O.correo) await correoA(env, O, 'retirada', {}, { forzar: true, cadaMinutos: 60 * 24 * 3650 });
  return { ok: true };
}
export async function estaVetado(env, correo) {
  return !!(await env.DB.prepare(`SELECT 1 AS v FROM vetados WHERE huella = ?`).bind(await huella(correo)).first());
}

/* ── «no cruzarme con»: correos de personas con las que nunca quiere coincidir ── */
export async function agregarEvitar(env, P, correo) {
  const c = String(correo || '').trim().toLowerCase();
  if (!/^[^\s@]{1,64}@[^\s@]{1,190}\.[a-z]{2,}$/i.test(c)) return { error: 'Ese correo no se ve bien. Revísalo.', status: 400 };
  if (c === P.correo) return { error: 'Ese es tu propio correo.', status: 400 };
  const n = (await env.DB.prepare(`SELECT COUNT(*) AS n FROM evitar WHERE persona = ?`).bind(P.id).first()).n;
  if (n >= MAX_EVITAR) return { error: `Hasta ${MAX_EVITAR} correos.`, status: 400 };
  const O = await env.DB.prepare(`SELECT id FROM personas WHERE correo = ?`).bind(c).first();
  if (O) {
    const [a, b] = clave(P.id, O.id);
    const pu = await env.DB.prepare(`SELECT estado FROM puertas WHERE a = ? AND b = ?`).bind(a, b).first();
    if (pu?.estado === 'abierta') return { error: 'Con esa persona tienes una puerta abierta. Ciérrala o bloquéala desde la charla.', status: 409 };
    if (pu) await env.DB.batch([env.DB.prepare(`DELETE FROM puertas WHERE a = ? AND b = ?`).bind(a, b), env.DB.prepare(`DELETE FROM pares WHERE a = ? AND b = ?`).bind(a, b), env.DB.prepare(`DELETE FROM avisos WHERE (persona = ? AND otra = ?) OR (persona = ? AND otra = ?)`).bind(a, b, b, a)]);
  }
  await env.DB.prepare(`INSERT OR IGNORE INTO evitar (persona, huella, pista) VALUES (?, ?, ?)`).bind(P.id, await huella(c), pistaDe(c)).run();
  if (O) await env.DB.prepare(`DELETE FROM pares WHERE (a = ? AND b = ?) OR (a = ? AND b = ?)`).bind(P.id, O.id, O.id, P.id).run();
  // nunca se dice si esa persona está o no en Cupido
  return { ok: true, evitar: await misEvitados(env, P) };
}
export async function quitarEvitar(env, P, h) {
  await env.DB.prepare(`DELETE FROM evitar WHERE persona = ? AND huella = ?`).bind(P.id, String(h || '')).run();
  await recalcularTodo(env, { soloId: P.id, avisar: true, motivo: 'evitar' });
  return { ok: true, evitar: await misEvitados(env, P) };
}
export async function misEvitados(env, P) {
  return (await env.DB.prepare(`SELECT huella, pista, creado FROM evitar WHERE persona = ? ORDER BY creado DESC`).bind(P.id).all()).results;
}

/* ── lo suyo, para su tablero ────────────────────────────────────────────── */
export async function vistaElla(env, P) {
  const bloqueados = (await env.DB.prepare(`SELECT b.a AS id, b.tipo, b.creado, p.nombre, p.color FROM bloqueos b LEFT JOIN personas p ON p.id = b.a WHERE b.de = ? AND b.estado = 'vigente' ORDER BY b.creado DESC`).bind(P.id).all()).results
    .map((f) => ({ id: f.id, nombre: f.nombre ? f.nombre.split(' ')[0] : 'Alguien', color: f.color, tipo: f.tipo, creado: f.creado }));
  const aj = ajustesDe(P);
  return { mando: !esHombre(P), discreta: !!aj.discreta, primero: !!aj.primero, reglas: aj.reglas || null, bloqueados, evitar: await misEvitados(env, P),
    limites: { veto: VETO_BLOQUEOS, revision: REVISION_REPORTES, insistencia: INSISTENCIA }, motivos: MOTIVOS };
}

// Lo que ella ve de él antes de decidir: señales, nunca identidad.
export async function senalesPara(env, P, hombres) {
  const ids = hombres.filter((O) => manda(P, O)).map((O) => O.id);
  if (!ids.length) return new Map();
  const marca = ids.map(() => '?').join(',');
  const bloq = new Map((await env.DB.prepare(`SELECT a, COUNT(*) AS n FROM bloqueos WHERE estado = 'vigente' AND COALESCE(genero_de, '') != 'hombre' AND a IN (${marca}) GROUP BY a`).bind(...ids).all()).results.map((f) => [f.a, f.n]));
  const charlas = new Map();
  for (const f of (await env.DB.prepare(`SELECT a, b FROM charlas WHERE cerrada IS NULL AND (a IN (${marca}) OR b IN (${marca}))`).bind(...ids, ...ids).all()).results)
    for (const id of [f.a, f.b]) if (id !== P.id && !(f.a === P.id || f.b === P.id)) charlas.set(id, (charlas.get(id) || 0) + 1);
  return new Map(hombres.filter((O) => manda(P, O)).map((O) => [O.id, {
    dias: Math.max(0, Math.floor((Date.now() - Date.parse(String(O.creada).replace(' ', 'T') + 'Z')) / 86400000)),
    charlas: charlas.get(O.id) || 0, bloqueos: bloq.get(O.id) || 0,
  }]));
}

/* ── admin: seguridad ────────────────────────────────────────────────────── */
async function avisarAdmin(env, motivo) {
  const lista = String(env.ADMINES || '').split(',').map((x) => x.trim()).filter(Boolean);
  if (!lista.length) return;
  const cuentas = (await env.DB.prepare(`SELECT id, correo FROM personas WHERE pool = 'real' AND correo IS NOT NULL`).all()).results;
  for (const c of cuentas) {
    if (!lista.includes(await huella(c.correo))) continue;
    const m = MOTIVOS.find((x) => x.id === motivo)?.n || motivo;
    await mandar(env, { persona: c.id, para: c.correo, tipo: 'reporte_admin', asunto: 'Cupido: llegó un reporte', cadaMinutos: 10,
      contenido: { eyebrow: 'Seguridad', titulo: 'Llegó un reporte.', parrafos: [`Alguien reportó a una persona. Motivo: <b>${m}</b>.`, 'El detalle y lo último que se dijo en esa charla están en el panel. Un reporte necesita ojos humanos pronto.'], boton: { txt: 'Revisar en el panel', url: `${env.BASE_URL || 'https://cupido.capitaltorreon.com'}/admin#seguridad` }, bajas: false } });
  }
}
export async function seguridadAdmin(env, admin) {
  const filas = (await env.DB.prepare(`SELECT b.*, pa.nombre AS nombre_a, pa.estado AS estado_a, pa.pool AS pool_a, pd.nombre AS nombre_de FROM bloqueos b LEFT JOIN personas pa ON pa.id = b.a LEFT JOIN personas pd ON pd.id = b.de ORDER BY b.creado DESC LIMIT 400`).all()).results;
  const vig = filas.filter((f) => f.estado === 'vigente');
  const porPersona = new Map();
  for (const f of vig) {
    const x = porPersona.get(f.a) || { id: f.a, nombre: f.nombre_a || f.a, genero: f.genero_a, estado: f.estado_a, pool: f.pool_a, bloqueos: 0, reportes: 0, deMujeres: 0, ultimo: f.creado };
    x.bloqueos++; if (f.tipo === 'reporte') x.reportes++; if (f.genero_de !== 'hombre' && (f.pool_de === 'real' || f.pool_a === 'demo')) x.deMujeres++;
    porPersona.set(f.a, x);
  }
  // sin cuenta administradora no se ve el nombre de nadie real: solo cifras (lo ficticio del demo sí se enseña)
  const ver = (nombre, pool) => (admin || pool === 'demo' ? nombre : 'Cuenta real');
  const enRevision = (await env.DB.prepare(`SELECT id, nombre, pool FROM personas WHERE estado = 'revision'`).all()).results.map((p) => ({ id: admin || p.pool === 'demo' ? p.id : null, nombre: ver(p.nombre, p.pool) }));
  const vetadas = (await env.DB.prepare(`SELECT id, nombre, pool FROM personas WHERE estado = 'vetada'`).all()).results.map((p) => ({ id: admin || p.pool === 'demo' ? p.id : null, nombre: ver(p.nombre, p.pool) }));
  return {
    admin, limites: { veto: VETO_BLOQUEOS, revision: REVISION_REPORTES, insistencia: INSISTENCIA },
    cifras: { bloqueos: vig.length, reportes: vig.filter((f) => f.tipo === 'reporte').length, sinAtender: vig.filter((f) => f.tipo === 'reporte' && !f.atendido).length, enRevision: enRevision.length, vetadas: vetadas.length },
    personas: [...porPersona.values()].sort((x, y) => y.deMujeres - x.deMujeres || y.reportes - x.reportes).map((x) => ({ ...x, id: admin || x.pool === 'demo' ? x.id : null, nombre: ver(x.nombre, x.pool) })),
    enRevision, vetadas,
    // el detalle (quién, qué escribió, la evidencia) solo lo ve una cuenta administradora
    reportes: vig.filter((f) => f.tipo === 'reporte').map((f) => ({
      de: admin ? f.nombre_de : null, a: admin || f.pool_a === 'demo' ? f.a : null, nombreA: ver(f.nombre_a, f.pool_a), motivo: MOTIVOS.find((m) => m.id === f.motivo)?.n || f.motivo, creado: f.creado, atendido: f.atendido,
      detalle: admin ? (() => { try { return JSON.parse(f.detalle || '{}'); } catch { return {}; } })() : null, clave: admin ? `${f.de}|${f.a}` : null,
    })),
  };
}
export async function accionAdmin(env, { persona: id, accion, clave: k }) {
  if (accion === 'atender') {
    const [de, a] = String(k || '').split('|');
    await env.DB.prepare(`UPDATE bloqueos SET atendido = datetime('now') WHERE de = ? AND a = ?`).bind(de, a).run();
    return { ok: true };
  }
  const O = await persona(env, String(id || ''));
  if (!O) return { error: 'No existe esa persona', status: 404 };
  if (accion === 'vetar') { await vetar(env, O, 'decisión del equipo tras un reporte'); return { ok: true }; }
  if (accion === 'regresar') {
    if (O.estado !== 'revision') return { error: 'Esa cuenta no está en revisión', status: 400 };
    await env.DB.prepare(`UPDATE personas SET estado = 'activa' WHERE id = ?`).bind(O.id).run();
    await recalcularTodo(env, { avisar: true, motivo: 'revisión' });
    await anotar(env, 'ella', 'Una cuenta regresó al matching después de revisarla', '');
    return { ok: true };
  }
  return { error: 'Acción inválida', status: 400 };
}
// Al reiniciar el demo o al entrar a la cuenta demo: lo ficticio vuelve a quedar limpio
export async function limpiarEllaDe(env, id) {
  const habia = (await env.DB.prepare(`SELECT COUNT(*) AS n FROM bloqueos WHERE de = ? OR a = ?`).bind(id, id).first()).n;
  await env.DB.batch([
    env.DB.prepare(`DELETE FROM bloqueos WHERE de = ? OR a = ?`).bind(id, id),
    env.DB.prepare(`DELETE FROM controles WHERE persona = ? OR otra = ?`).bind(id, id),
    env.DB.prepare(`DELETE FROM evitar WHERE persona = ?`).bind(id),
  ]);
  return habia;
}
// fin · RLR
