/* ─────────────────────────────────────────────────────────────────────────────
   Cupido Algorítmico · Datos, motor automático y puertas
   Autor: Ricardo López Reyero
   Filosofía heredada de SUMA: "si es manual no se va a hacer". Cada vez que
   una persona entra o cambia, el cruce corre solo y avisa solo.
   ───────────────────────────────────────────────────────────────────────────── */
// RLR
import { cruzar, esCandidato, razonesPersona, pesos, calidad, lecturaHeuristica, DIMENSIONES, UMBRAL, MOTOR_VERSION } from '../public/js/motor.js';
import { PARTE, avance, etiqueta } from '../public/js/preguntas.js';
import PERSONAS_DEMO from '../seed/personas.json';
import ARTICULOS_BASE from '../seed/articulos.json';
import { ESQUEMA_MEDIOS, mediosDe } from './medios.js';
import { ESQUEMA_CHARLA, abrirCharla, misCharlas } from './charla.js';

export const _RLR = 'Ricardo López Reyero';
const _k = 'EYE', _rev = 181218;

const ESQUEMA = [
  `CREATE TABLE IF NOT EXISTS personas (
     id TEXT PRIMARY KEY, pool TEXT NOT NULL DEFAULT 'demo', nombre TEXT NOT NULL,
     genero TEXT, edad INTEGER, ciudad TEXT, color TEXT, bio TEXT,
     respuestas TEXT NOT NULL DEFAULT '{}', lectura TEXT, token TEXT UNIQUE,
     origen TEXT NOT NULL DEFAULT 'demo', estado TEXT NOT NULL DEFAULT 'activa', completo INTEGER NOT NULL DEFAULT 0,
     creada TEXT NOT NULL DEFAULT (datetime('now')), actualizada TEXT NOT NULL DEFAULT (datetime('now')))`,
  `CREATE TABLE IF NOT EXISTS pares (
     a TEXT NOT NULL, b TEXT NOT NULL, pct INTEGER NOT NULL, sin_veto INTEGER NOT NULL, veto INTEGER NOT NULL DEFAULT 0,
     detalle TEXT NOT NULL, calculado TEXT NOT NULL DEFAULT (datetime('now')), PRIMARY KEY (a, b))`,
  `CREATE TABLE IF NOT EXISTS puertas (
     a TEXT NOT NULL, b TEXT NOT NULL, pct INTEGER NOT NULL, decision_a TEXT, decision_b TEXT,
     estado TEXT NOT NULL DEFAULT 'cerrada', avisada TEXT NOT NULL DEFAULT (datetime('now')), abierta TEXT,
     PRIMARY KEY (a, b))`,
  `CREATE TABLE IF NOT EXISTS avisos (
     id INTEGER PRIMARY KEY AUTOINCREMENT, persona TEXT NOT NULL, tipo TEXT NOT NULL, texto TEXT NOT NULL,
     otra TEXT, pct INTEGER, leido INTEGER NOT NULL DEFAULT 0, creado TEXT NOT NULL DEFAULT (datetime('now')))`,
  `CREATE TABLE IF NOT EXISTS articulos (
     id INTEGER PRIMARY KEY AUTOINCREMENT, slug TEXT UNIQUE NOT NULL, titulo TEXT NOT NULL, resumen TEXT,
     categoria TEXT NOT NULL, cuerpo TEXT NOT NULL, autor_nombre TEXT NOT NULL, autor_bio TEXT, autor_correo TEXT,
     estado TEXT NOT NULL DEFAULT 'publicado', destacado INTEGER NOT NULL DEFAULT 0, lecturas INTEGER NOT NULL DEFAULT 0,
     ip_hash TEXT, creado TEXT NOT NULL DEFAULT (datetime('now')))`,
  `CREATE TABLE IF NOT EXISTS bitacora (
     id INTEGER PRIMARY KEY AUTOINCREMENT, tipo TEXT NOT NULL, accion TEXT NOT NULL, detalle TEXT,
     creado TEXT NOT NULL DEFAULT (datetime('now')))`,
  `CREATE TABLE IF NOT EXISTS sesiones (
     id TEXT PRIMARY KEY, persona TEXT NOT NULL, demo INTEGER NOT NULL DEFAULT 0,
     creada TEXT NOT NULL DEFAULT (datetime('now')), usada TEXT NOT NULL DEFAULT (datetime('now')))`,
  `CREATE TABLE IF NOT EXISTS enlaces (
     token TEXT PRIMARY KEY, correo TEXT NOT NULL, ip_hash TEXT,
     creado TEXT NOT NULL DEFAULT (datetime('now')), usado TEXT)`,
  `CREATE INDEX IF NOT EXISTS idx_enlaces_correo ON enlaces(correo, creado)`,
  `CREATE INDEX IF NOT EXISTS idx_sesiones_persona ON sesiones(persona)`,
  ESQUEMA_MEDIOS,
  ...ESQUEMA_CHARLA,
  `CREATE INDEX IF NOT EXISTS idx_pares_pct ON pares(pct)`,
  `CREATE INDEX IF NOT EXISTS idx_avisos_persona ON avisos(persona, leido)`,
  `CREATE INDEX IF NOT EXISTS idx_articulos_estado ON articulos(estado, creado)`,
];

let listo = false;
export async function asegurar(env) {
  if (listo) return;
  await env.DB.batch(ESQUEMA.map((q) => env.DB.prepare(q)));
  // migración v2.1: el correo es la cuenta (la columna no existía en bases sembradas antes)
  try { await env.DB.prepare(`ALTER TABLE personas ADD COLUMN correo TEXT`).run(); } catch { /* ya existe */ }
  try { await env.DB.prepare(`ALTER TABLE personas ADD COLUMN ajustes TEXT`).run(); } catch { /* ya existe */ }
  try { await env.DB.prepare(`ALTER TABLE personas ADD COLUMN vida TEXT`).run(); } catch { /* ya existe */ }
  try { await env.DB.prepare(`ALTER TABLE charlas ADD COLUMN visita_a TEXT`).run(); await env.DB.prepare(`ALTER TABLE charlas ADD COLUMN visita_b TEXT`).run(); } catch { /* ya existen */ }
  await env.DB.prepare(`CREATE UNIQUE INDEX IF NOT EXISTS idx_personas_correo ON personas(correo)`).run();
  const n = await env.DB.prepare(`SELECT COUNT(*) AS n FROM personas`).first();
  if (!n.n) await sembrarDemo(env);
  const a = await env.DB.prepare(`SELECT COUNT(*) AS n FROM articulos`).first();
  if (!a.n) await sembrarArticulos(env);
  listo = true;
}

export async function anotar(env, tipo, accion, detalle = '') {
  try { await env.DB.prepare(`INSERT INTO bitacora (tipo, accion, detalle) VALUES (?, ?, ?)`).bind(tipo, accion, String(detalle).slice(0, 500)).run(); }
  catch (e) { console.error('bitacora', e.message); }
}

/* ── lectura de filas ─────────────────────────────────────────────────────── */
const fila = (r) => r && ({ ...r, r: JSON.parse(r.respuestas || '{}'), l: r.lectura ? JSON.parse(r.lectura) : null });
export async function personas(env, { soloActivas = false } = {}) {
  const q = soloActivas ? `SELECT * FROM personas WHERE estado = 'activa' AND completo = 1 ORDER BY id` : `SELECT * FROM personas ORDER BY id`;
  return (await env.DB.prepare(q).all()).results.map(fila);
}
export async function persona(env, id) { return fila(await env.DB.prepare(`SELECT * FROM personas WHERE id = ?`).bind(id).first()); }
const clave = (x, y) => (x < y ? [x, y] : [y, x]);

/* ── siembra del demo ─────────────────────────────────────────────────────── */
async function sembrarDemo(env) {
  const stmts = PERSONAS_DEMO.map((p) => env.DB.prepare(
    `INSERT OR REPLACE INTO personas (id, pool, nombre, genero, edad, ciudad, color, bio, respuestas, lectura, origen, estado, completo)
     VALUES (?, 'demo', ?, ?, ?, ?, ?, ?, ?, ?, 'demo', 'activa', 1)`)
    .bind(p.id, p.nombre, p.r.genero, p.r.edad, p.r.ciudad, p.color, p.bio, JSON.stringify(p.r), JSON.stringify(p.l)));
  await env.DB.batch(stmts);
  await anotar(env, 'sistema', 'Se sembró el demo', `${PERSONAS_DEMO.length} personas ficticias`);
  await recalcularTodo(env, { avisar: true, motivo: 'siembra' });
  // Estados de puerta de ejemplo, para que el demo muestre todos los momentos
  const decisiones = [
    ['h03', 'm03', 'si', 'si'],   // Emilio y Valeria: la puerta ya se abrió
    ['h01', 'm01', 'si', 'si'],   // Diego y Mariana: abierta (Diego es la cuenta demo; ver src/acceso.js)
    ['h01', 'm07', null, 'si'],   // Daniela ya dijo que sí a Diego; él aún no decide
    ['h08', 'm08', 'si', null],   // Samuel ya dijo que sí
    ['h04', 'm04', null, 'si'],   // Renata ya dijo que sí; Tomás no ha decidido
  ];
  for (const [a, b, da, db] of decisiones) {
    const abierta = da === 'si' && db === 'si';
    await env.DB.prepare(`UPDATE puertas SET decision_a = ?, decision_b = ?, estado = ?, abierta = CASE WHEN ? THEN datetime('now') ELSE NULL END WHERE a = ? AND b = ?`)
      .bind(da, db, abierta ? 'abierta' : 'cerrada', abierta ? 1 : 0, a, b).run();
    if (abierta) { await avisarApertura(env, a, b); await abrirCharla(env, a, b); }
  }
}

async function sembrarArticulos(env) {
  const stmts = ARTICULOS_BASE.map((x, i) => env.DB.prepare(
    `INSERT OR IGNORE INTO articulos (slug, titulo, resumen, categoria, cuerpo, autor_nombre, autor_bio, estado, destacado, lecturas, creado)
     VALUES (?, ?, ?, ?, ?, ?, ?, 'publicado', ?, ?, datetime('now', ?))`)
    .bind(x.slug, x.titulo, x.resumen || '', x.categoria, x.cuerpo, x.autor_nombre, x.autor_bio || '', x.destacado ? 1 : 0, 40 + (ARTICULOS_BASE.length - i) * 17, `-${i * 2} days`));
  if (stmts.length) await env.DB.batch(stmts);
}

export async function reiniciarDemo(env) {
  // Solo lo ficticio: las cuentas reales (pool 'real') y sus puertas abiertas se respetan
  await env.DB.batch([
    env.DB.prepare(`DELETE FROM personas WHERE pool = 'demo'`),
    env.DB.prepare(`DELETE FROM pares`),
    env.DB.prepare(`DELETE FROM puertas WHERE a NOT IN (SELECT id FROM personas) OR b NOT IN (SELECT id FROM personas)`),
    env.DB.prepare(`DELETE FROM avisos WHERE persona NOT IN (SELECT id FROM personas) OR (otra IS NOT NULL AND otra NOT IN (SELECT id FROM personas))`),
    env.DB.prepare(`DELETE FROM sesiones WHERE persona NOT IN (SELECT id FROM personas)`),
    env.DB.prepare(`DELETE FROM mensajes WHERE a NOT IN (SELECT id FROM personas) OR b NOT IN (SELECT id FROM personas)`),
    env.DB.prepare(`DELETE FROM charlas WHERE a NOT IN (SELECT id FROM personas) OR b NOT IN (SELECT id FROM personas)`),
    env.DB.prepare(`DELETE FROM liberaciones WHERE persona NOT IN (SELECT id FROM personas) OR otra NOT IN (SELECT id FROM personas)`),
  ]);
  await sembrarDemo(env);
  await anotar(env, 'admin', 'Se reinició el demo', 'Personas ficticias, cruces, puertas y avisos de vuelta al estado inicial');
}

/* ═══════════════════════════════════════════════════════════════════════════
   MOTOR AUTOMÁTICO
   ═══════════════════════════════════════════════════════════════════════════ */
async function guardarPares(env, lista) {
  const stmts = lista.map((p) => env.DB.prepare(
    `INSERT INTO pares (a, b, pct, sin_veto, veto, detalle, calculado) VALUES (?, ?, ?, ?, ?, ?, datetime('now'))
     ON CONFLICT(a, b) DO UPDATE SET pct = excluded.pct, sin_veto = excluded.sin_veto, veto = excluded.veto, detalle = excluded.detalle, calculado = excluded.calculado`)
    .bind(p.a, p.b, p.pct, p.sinVeto, p.veto ? 1 : 0, JSON.stringify(p)));
  for (let i = 0; i < stmts.length; i += 50) await env.DB.batch(stmts.slice(i, i + 50));
}

// Cruza todo lo que corresponda. Si `soloId`, solo los pares de esa persona.
export async function recalcularTodo(env, { soloId = null, avisar = true, motivo = 'cambio' } = {}) {
  const todas = await personas(env, { soloActivas: true });
  const lista = [];
  for (let i = 0; i < todas.length; i++)
    for (let j = i + 1; j < todas.length; j++) {
      const [A, B] = todas[i].id < todas[j].id ? [todas[i], todas[j]] : [todas[j], todas[i]];
      if (soloId && A.id !== soloId && B.id !== soloId) continue;
      if (!esCandidato(A, B)) continue;
      lista.push(cruzar(A, B));
    }
  if (soloId) await env.DB.prepare(`DELETE FROM pares WHERE a = ? OR b = ?`).bind(soloId, soloId).run();
  else await env.DB.prepare(`DELETE FROM pares`).run();
  await guardarPares(env, lista);
  const r = avisar ? await publicarPuertas(env, lista, { soloId }) : { nuevas: 0 };
  return { pares: lista.length, vetados: lista.filter((p) => p.veto).length, arriba: lista.filter((p) => p.pct >= UMBRAL).length, ...r, lista };
}

// Crea puertas nuevas (y avisa a los dos al mismo tiempo); retira en silencio las que ya no cruzan el umbral y nunca se abrieron.
export async function publicarPuertas(env, lista, { soloId = null } = {}) {
  const existentes = new Map((await env.DB.prepare(`SELECT * FROM puertas`).all()).results.map((p) => [p.a + '|' + p.b, p]));
  let nuevas = 0, retiradas = 0, actualizadas = 0;
  const stmts = [];
  for (const p of lista) {
    const k = p.a + '|' + p.b, ya = existentes.get(k);
    if (p.pct >= UMBRAL) {
      if (!ya) {
        nuevas++;
        // idempotente: si dos cruces corren a la vez, no se duplican puertas ni avisos
        stmts.push(env.DB.prepare(`INSERT OR IGNORE INTO puertas (a, b, pct) VALUES (?, ?, ?)`).bind(p.a, p.b, p.pct));
        for (const [yo, otra] of [[p.a, p.b], [p.b, p.a]]) {
          stmts.push(env.DB.prepare(
            `INSERT INTO avisos (persona, tipo, texto, otra, pct)
             SELECT ?, 'coincidencia', ?, ?, ? WHERE NOT EXISTS (SELECT 1 FROM avisos WHERE persona = ? AND otra = ? AND tipo = 'coincidencia')`)
            .bind(yo, `Apareció alguien al ${p.pct} % contigo. La puerta está cerrada hasta que los dos digan que sí.`, otra, p.pct, yo, otra));
        }
      } else if (ya.pct !== p.pct) { actualizadas++; stmts.push(env.DB.prepare(`UPDATE puertas SET pct = ? WHERE a = ? AND b = ?`).bind(p.pct, p.a, p.b)); }
    } else if (ya && ya.estado !== 'abierta') {
      retiradas++;
      stmts.push(env.DB.prepare(`DELETE FROM puertas WHERE a = ? AND b = ?`).bind(p.a, p.b));
    }
  }
  if (!soloId) {
    const vivos = new Set(lista.map((p) => p.a + '|' + p.b));
    for (const [k, ya] of existentes) if (!vivos.has(k) && ya.estado !== 'abierta') { retiradas++; stmts.push(env.DB.prepare(`DELETE FROM puertas WHERE a = ? AND b = ?`).bind(ya.a, ya.b)); }
  }
  for (let i = 0; i < stmts.length; i += 50) await env.DB.batch(stmts.slice(i, i + 50));
  if (nuevas) await anotar(env, 'motor', 'Se avisaron coincidencias nuevas', `${nuevas} pareja(s) cruzaron el ${UMBRAL} %`);
  return { nuevas, retiradas, actualizadas };
}

async function avisarApertura(env, a, b) {
  const [A, B] = [await persona(env, a), await persona(env, b)];
  const nom = (P) => P.nombre.split(' ')[0];
  const aviso = (yo, otra, txt) => env.DB.prepare(
    `INSERT INTO avisos (persona, tipo, texto, otra) SELECT ?, 'apertura', ?, ? WHERE NOT EXISTS (SELECT 1 FROM avisos WHERE persona = ? AND otra = ? AND tipo = 'apertura')`)
    .bind(yo, txt, otra, yo, otra);
  await env.DB.batch([
    aviso(a, b, `Se abrió la puerta con ${nom(B)}. Los dos dijeron que sí.`),
    aviso(b, a, `Se abrió la puerta con ${nom(A)}. Los dos dijeron que sí.`),
  ]);
}

/* ── La puerta: avisar sí, dejar entrar no (hasta que los dos digan que sí) ── */
export async function decidir(env, yo, otra, decision) {
  if (!['si', 'no'].includes(decision)) throw new Error('Decisión inválida');
  const [a, b] = clave(yo, otra);
  const p = await env.DB.prepare(`SELECT * FROM puertas WHERE a = ? AND b = ?`).bind(a, b).first();
  if (!p) throw new Error('Esa coincidencia ya no existe');
  if (p.estado === 'abierta') return { estado: 'abierta' };
  const col = yo === a ? 'decision_a' : 'decision_b';
  await env.DB.prepare(`UPDATE puertas SET ${col} = ? WHERE a = ? AND b = ?`).bind(decision, a, b).run();
  const da = yo === a ? decision : p.decision_a, db = yo === b ? decision : p.decision_b;
  const [P, O] = [await persona(env, yo), await persona(env, otra)];
  if (da === 'si' && db === 'si') {
    await env.DB.prepare(`UPDATE puertas SET estado = 'abierta', abierta = datetime('now') WHERE a = ? AND b = ?`).bind(a, b).run();
    await avisarApertura(env, a, b);
    await abrirCharla(env, a, b); // nace la charla, con el hola automático de cada uno
    await anotar(env, 'puerta', 'Se abrió una puerta', `${P.nombre} ↔ ${O.nombre} (${p.pct} %)`);
    return { estado: 'abierta' };
  }
  // Nunca se le dice a nadie que el otro dijo que no
  await anotar(env, 'puerta', decision === 'si' ? 'Alguien dijo que sí' : 'Alguien prefirió no abrir', `${P.nombre} → ${O.nombre} (${p.pct} %)`);
  return { estado: 'cerrada', miDecision: decision };
}

/* ═══════════════════════════════════════════════════════════════════════════
   VISTA DE LA PERSONA
   ═══════════════════════════════════════════════════════════════════════════ */
const REVELA = (O, medios = {}) => ({
  nombre: O.nombre.split(' ')[0], nombreCompleto: O.nombre, edad: O.edad, ciudad: etiqueta('ciudad', O.r.ciudad), color: O.color,
  carta: O.r.carta || '', malinterpretan: O.r.malinterpretan || '', martes: O.r.martes || '',
  medios, // foto, voz y video: solo llegan aquí porque la puerta ya se abrió
});
const RUBRICA_PREGUNTAS = { autoconocimiento: [16, 32, 43], responsabilidad: [20, 22, 37], calidez: [26, 31, 33], coherencia: [6, 29] };

export async function vistaPersona(env, P) {
  const todas = await personas(env);
  const porId = new Map(todas.map((x) => [x.id, x]));
  const pares = (await env.DB.prepare(`SELECT a, b, pct, sin_veto, veto, detalle FROM pares WHERE a = ? OR b = ?`).bind(P.id, P.id).all()).results;
  const puertas = new Map((await env.DB.prepare(`SELECT * FROM puertas WHERE a = ? OR b = ?`).bind(P.id, P.id).all()).results.map((x) => [x.a + '|' + x.b, x]));
  const demo = P.pool === 'demo';

  const coincidencias = [];
  let masCerca = null;
  const dejanFuera = {};
  for (const fx of pares) {
    const otraId = fx.a === P.id ? fx.b : fx.a, O = porId.get(otraId);
    if (!O || O.estado !== 'activa') continue;
    const det = JSON.parse(fx.detalle);
    if (fx.pct >= UMBRAL) {
      const pu = puertas.get(fx.a + '|' + fx.b);
      const soyA = fx.a === P.id;
      const mia = pu ? (soyA ? pu.decision_a : pu.decision_b) : null;
      const abierta = pu?.estado === 'abierta';
      coincidencias.push({
        pct: fx.pct,
        clave: `${fx.a}-${fx.b}`,
        demoId: demo ? otraId : undefined,
        genero: O.genero,
        ...razonesPersona(det, P.id),
        puerta: { estado: abierta ? 'abierta' : 'cerrada', miDecision: mia, avisada: pu?.avisada || null },
        revelado: abierta ? REVELA(O, await mediosDe(env, O.id)) : null,
      });
    } else if (!fx.veto) {
      if (!masCerca || fx.pct > masCerca) masCerca = fx.pct;
    } else {
      // ¿Lo que lo deja fuera son SOLO filtros suaves de esta persona?
      const mios = det.vetos.filter((v) => v.suave && (v.de === (fx.a === P.id ? 'a' : 'b') || (v.de === 'ambos' && v.id === 'distancia')));
      if (mios.length && mios.length === det.vetos.length && fx.sin_veto >= 80) {
        for (const id of new Set(mios.map((v) => v.id))) {
          dejanFuera[id] = dejanFuera[id] || { id, personas: 0, mejor: 0 };
          dejanFuera[id].personas++;
          dejanFuera[id].mejor = Math.max(dejanFuera[id].mejor, fx.sin_veto);
        }
      }
    }
  }
  coincidencias.sort((x, y) => y.pct - x.pct);

  const { w, por } = pesos(P);
  const pesosVista = DIMENSIONES.map((d) => ({ id: d.id, dim: d.nombre, pct: Math.round(w[d.id] * 100), por: por[d.id] || null, base: d.base }))
    .sort((x, y) => y.pct - x.pct);
  const q = calidad(P);
  const rb = P.l?.rubrica || {};
  const flojas = Object.entries(rb).filter(([, v]) => v <= 7).sort((x, y) => x[1] - y[1]).map(([k]) => k);
  const delOtroLado = todas.filter((x) => x.id !== P.id && x.estado === 'activa' && x.completo && esCandidato(P, x));
  const avisos = (await env.DB.prepare(`SELECT id, tipo, texto, pct, leido, creado FROM avisos WHERE persona = ? ORDER BY id DESC LIMIT 20`).bind(P.id).all()).results;

  return {
    persona: { id: P.id, nombre: P.nombre, nombreCorto: P.nombre === 'Sin nombre' ? '' : P.nombre.split(' ')[0], edad: P.edad, ciudad: etiqueta('ciudad', P.r.ciudad), genero: P.genero, color: P.color, pool: P.pool, estado: P.estado, completo: !!P.completo, avance: avance(P.r), origen: P.origen, correo: P.pool === 'real' ? P.correo || null : null },
    pool: { delOtroLado: delOtroLado.length, compatibles: pares.filter((x) => !x.veto).length, evaluados: pares.length },
    coincidencias, masCerca,
    dejanFuera: Object.values(dejanFuera),
    pesos: pesosVista,
    claridad: { q, pct: Math.round(((q - 0.85) / 0.15) * 100), flojas: flojas.map((k) => ({ eje: k, preguntas: RUBRICA_PREGUNTAS[k] })), fuente: P.l?.fuente || 'lectura' },
    avisos, umbral: UMBRAL, motor: MOTOR_VERSION,
    // lo suyo, para su propio tablero (nunca se envía nada de otra persona aquí)
    misRespuestas: P.r, rubrica: P.l?.rubrica || null,
    misMedios: await mediosDe(env, P.id),
    charlas: await misCharlas(env, P.id),
    ajustes: (() => { try { return JSON.parse(P.ajustes || '{}'); } catch { return {}; } })(),
    vida: (() => { try { return JSON.parse(P.vida || 'null'); } catch { return null; } })(),
  };
}

/* ═══════════════════════════════════════════════════════════════════════════
   VISTA DEL ADMIN
   ═══════════════════════════════════════════════════════════════════════════ */
export async function vistaAdmin(env) {
  const todas = await personas(env);
  const pares = (await env.DB.prepare(`SELECT a, b, pct, sin_veto, veto, detalle FROM pares`).all()).results;
  const puertas = (await env.DB.prepare(`SELECT * FROM puertas ORDER BY pct DESC`).all()).results;
  const porId = new Map(todas.map((x) => [x.id, x]));
  const nom = (id) => porId.get(id)?.nombre || id;

  const hombres = todas.filter((p) => p.genero === 'hombre' && p.estado === 'activa'), mujeres = todas.filter((p) => p.genero === 'mujer' && p.estado === 'activa');
  const celdas = {};
  const histo = Array.from({ length: 10 }, () => 0);
  const vetosPorTipo = {};
  for (const fx of pares) {
    const det = JSON.parse(fx.detalle);
    celdas[fx.a + '|' + fx.b] = { pct: fx.pct, sinVeto: fx.sin_veto, veto: !!fx.veto, vetos: [...new Set(det.vetos.map((v) => v.id))], techos: det.techos.map((t) => t.id) };
    if (!fx.veto) histo[Math.min(9, Math.floor(fx.pct / 10))]++;
    for (const id of new Set(det.vetos.map((v) => v.id))) vetosPorTipo[id] = (vetosPorTipo[id] || 0) + 1;
  }
  const mapaPuertas = new Map(puertas.map((p) => [p.a + '|' + p.b, p]));
  const fuertes = pares.filter((p) => p.pct >= UMBRAL).sort((x, y) => y.pct - x.pct).map((p) => {
    const pu = mapaPuertas.get(p.a + '|' + p.b);
    const det = JSON.parse(p.detalle);
    return { a: p.a, b: p.b, nombreA: nom(p.a), nombreB: nom(p.b), pct: p.pct, puerta: pu ? { estado: pu.estado, decision_a: pu.decision_a, decision_b: pu.decision_b } : null,
      top: DIMENSIONES.map((d) => ({ dim: d.nombre, par: det.dims[d.id].par })).filter((d) => d.par != null).sort((x, y) => y.par - x.par).slice(0, 3) };
  });
  const dolorosos = pares.filter((p) => p.veto).sort((x, y) => y.sin_veto - x.sin_veto).slice(0, 8).map((p) => {
    const det = JSON.parse(p.detalle);
    return { a: p.a, b: p.b, nombreA: nom(p.a), nombreB: nom(p.b), sinVeto: p.sin_veto, vetos: det.vetos.map((v) => v.txt) };
  });
  const filasPersonas = todas.map((P) => {
    const mis = pares.filter((x) => x.a === P.id || x.b === P.id);
    const arriba = mis.filter((x) => x.pct >= UMBRAL).map((x) => x.pct).sort((a, b) => b - a);
    const { w } = pesos(P);
    return { id: P.id, nombre: P.nombre, edad: P.edad, ciudad: etiqueta('ciudad', P.r.ciudad), genero: P.genero, color: P.color, origen: P.origen, estado: P.estado, completo: !!P.completo,
      fe: etiqueta('fe', P.r.fe), hijos: etiqueta('hijos', P.r.hijos), coincidencias: arriba, mejorBajo: Math.max(0, ...mis.filter((x) => x.pct < UMBRAL && !x.veto).map((x) => x.pct)),
      vetados: mis.filter((x) => x.veto).length, q: calidad(P), pesoSexual: Math.round(w.intimidad * 100), pesoEspiritual: Math.round(w.espiritual * 100), avance: avance(P.r).pct };
  });
  const conMatch = filasPersonas.filter((p) => p.coincidencias.length).length;
  const bitacora = (await env.DB.prepare(`SELECT * FROM bitacora ORDER BY id DESC LIMIT 40`).all()).results;
  const art = await env.DB.prepare(`SELECT COUNT(*) AS total, SUM(estado = 'publicado') AS publicados, SUM(estado = 'oculto') AS ocultos, SUM(estado = 'revision') AS revision FROM articulos`).first();

  return {
    cifras: {
      personas: todas.filter((p) => p.estado === 'activa').length, hombres: hombres.length, mujeres: mujeres.length,
      paresEvaluados: pares.length, vetados: pares.filter((p) => p.veto).length, arriba: fuertes.length,
      conMatch, sinMatch: filasPersonas.filter((p) => !p.coincidencias.length && p.estado === 'activa').length,
      puertasAbiertas: puertas.filter((p) => p.estado === 'abierta').length,
      puertasConUnSi: puertas.filter((p) => p.estado !== 'abierta' && (p.decision_a === 'si' || p.decision_b === 'si')).length,
      promedio: Math.round(pares.filter((p) => !p.veto).reduce((s, p) => s + p.pct, 0) / Math.max(1, pares.filter((p) => !p.veto).length)),
    },
    histograma: histo, vetosPorTipo,
    matriz: { filas: hombres.map((p) => ({ id: p.id, nombre: p.nombre, color: p.color })), columnas: mujeres.map((p) => ({ id: p.id, nombre: p.nombre, color: p.color })), celdas },
    fuertes, dolorosos, personas: filasPersonas,
    puertas: puertas.map((p) => ({ ...p, nombreA: nom(p.a), nombreB: nom(p.b) })),
    bitacora, articulos: art,
    motor: { version: MOTOR_VERSION, umbral: UMBRAL, dimensiones: DIMENSIONES },
  };
}

export async function detallePar(env, x, y) {
  const [a, b] = clave(x, y);
  const fx = await env.DB.prepare(`SELECT * FROM pares WHERE a = ? AND b = ?`).bind(a, b).first();
  if (!fx) return null;
  const [A, B] = [await persona(env, a), await persona(env, b)];
  const det = JSON.parse(fx.detalle);
  return { ...det, nombreA: A.nombre, nombreB: B.nombre, colorA: A.color, colorB: B.color, pesosA: pesos(A), pesosB: pesos(B), razonesA: razonesPersona(det, a), razonesB: razonesPersona(det, b), dimensiones: DIMENSIONES };
}

export async function detallePersona(env, id) {
  const P = await persona(env, id);
  if (!P) return null;
  const pares = (await env.DB.prepare(`SELECT a, b, pct, sin_veto, veto, detalle FROM pares WHERE a = ? OR b = ? ORDER BY pct DESC, sin_veto DESC`).bind(id, id).all()).results;
  const nombres = new Map((await env.DB.prepare(`SELECT id, nombre, color FROM personas`).all()).results.map((p) => [p.id, p]));
  return {
    id: P.id, nombre: P.nombre, edad: P.edad, genero: P.genero, color: P.color, bio: P.bio, origen: P.origen, estado: P.estado,
    vida: (() => { try { return JSON.parse(P.vida || 'null'); } catch { return null; } })(),
    respuestas: P.r, lectura: P.l, avance: avance(P.r), pesos: pesos(P), q: calidad(P),
    pares: pares.map((fx) => {
      const otra = fx.a === id ? fx.b : fx.a, det = JSON.parse(fx.detalle);
      return { otra, nombre: nombres.get(otra)?.nombre, color: nombres.get(otra)?.color, pct: fx.pct, sinVeto: fx.sin_veto, veto: !!fx.veto, vetos: det.vetos.map((v) => v.txt), techos: det.techos.map((t) => t.txt) };
    }),
  };
}

/* ═══════════════════════════════════════════════════════════════════════════
   CORRIDA MANUAL POR FASES (el efecto de SUMA: números reales en cada paso)
   ═══════════════════════════════════════════════════════════════════════════ */
export async function correrFase(env, fase) {
  const todas = await personas(env);
  const activas = todas.filter((p) => p.estado === 'activa' && p.completo);
  if (fase === 1) {
    return { titulo: 'Inventario', lineas: [
      `${activas.length} personas completas en el matching`,
      `${activas.filter((p) => p.genero === 'mujer').length} mujeres · ${activas.filter((p) => p.genero === 'hombre').length} hombres`,
      `${todas.length - activas.length} en pausa o sin terminar (no entran)`,
    ] };
  }
  const pares = [];
  for (let i = 0; i < activas.length; i++) for (let j = i + 1; j < activas.length; j++) {
    const [A, B] = activas[i].id < activas[j].id ? [activas[i], activas[j]] : [activas[j], activas[i]];
    if (esCandidato(A, B)) pares.push(cruzar(A, B));
  }
  if (fase === 2) {
    const tipos = {};
    for (const p of pares) for (const id of new Set(p.vetos.map((v) => v.id))) tipos[id] = (tipos[id] || 0) + 1;
    const top = Object.entries(tipos).sort((a, b) => b[1] - a[1]).slice(0, 4).map(([k, v]) => `${k}: ${v}`);
    return { titulo: 'Filtros duros', lineas: [
      `${pares.length} pares posibles (cada quien con quien busca)`,
      `${pares.filter((p) => p.veto).length} eliminados por un innegociable (${Math.round(100 * pares.filter((p) => p.veto).length / Math.max(1, pares.length))} %)`,
      `Los vetos más comunes → ${top.join(' · ') || 'ninguno'}`,
    ] };
  }
  if (fase === 3) {
    const vivos = pares.filter((p) => !p.veto);
    const prom = (k) => Math.round(100 * vivos.reduce((s, p) => s + (p.dims[k].par ?? 0), 0) / Math.max(1, vivos.length));
    return { titulo: 'Diez dimensiones, en las dos direcciones', lineas: [
      `${vivos.length * 2} cálculos direccionales (A→B y B→A) con los pesos de cada quien`,
      `Promedio de conflicto y reparación: ${prom('conflicto')} % · intimidad: ${prom('intimidad')} % · fe y vida interior: ${prom('espiritual')} %`,
      `Media geométrica: una dimensión mala no se compensa con otra brillante`,
    ] };
  }
  if (fase === 4) {
    const unLado = pares.filter((p) => !p.veto && Math.max(p.abS, p.baS) >= 0.9 && p.armonica < 0.9).length;
    const conTecho = pares.filter((p) => !p.veto && p.techos.length).length;
    return { titulo: 'Reciprocidad, techos y calidad', lineas: [
      `${unLado} pares eran buenos solo para uno de los dos y se hundieron con la media armónica`,
      `${conTecho} pares con techo por una dimensión crítica`,
      `Calidad de lectura aplicada: la madurez del par la define el menos claro de los dos`,
    ] };
  }
  if (fase === 5) {
    const r = await recalcularTodo(env, { avisar: true, motivo: 'corrida manual' });
    await anotar(env, 'admin', 'Se corrió el matching a mano', `${r.pares} pares · ${r.arriba} arriba del ${UMBRAL} % · ${r.nuevas} nuevas`);
    return { titulo: 'Umbral y avisos', lineas: [
      `${r.arriba} parejas arriba del ${UMBRAL} %`,
      `${r.nuevas} puertas nuevas avisadas a los dos al mismo tiempo · ${r.retiradas} retiradas en silencio`,
      `Nadie ve un perfil. Nadie sabe si el otro dijo que no.`,
    ], fin: true };
  }
  throw new Error('Fase inválida');
}

/* ═══════════════════════════════════════════════════════════════════════════
   CUESTIONARIO CONECTADO (la sesión dice quién responde; ver src/acceso.js)
   ═══════════════════════════════════════════════════════════════════════════ */
const COLORES = ['#d6455f', '#e07a4e', '#8a6bbf', '#2f8f83', '#1d4ed8', '#0891b2', '#be185d', '#15803d', '#a16207', '#6d28d9'];

function limpiarRespuestas(entrada = {}) {
  const r = {};
  for (const [k, v] of Object.entries(entrada)) {
    const p = PARTE[k];
    if (!p) continue;
    if (p.k === 'text') r[k] = String(v ?? '').slice(0, 4000);
    else if (p.k === 'num') { const n = parseInt(v, 10); if (Number.isFinite(n)) r[k] = Math.max(p.min ?? 0, Math.min(p.max ?? 999, n)); }
    else if (p.k === 'fecha') { const t = String(v ?? ''); if (t === '') r[k] = null; else if (/^(19[2-9]\d|20[01]\d)-(0[1-9]|1[0-2])-(0[1-9]|[12]\d|3[01])$/.test(t) && !Number.isNaN(Date.parse(t))) r[k] = t; }
    else if (p.k === 'range') { if (Array.isArray(v) && v.length === 2) { const [x, y] = v.map((z) => parseInt(z, 10)); if (Number.isFinite(x) && Number.isFinite(y)) r[k] = [Math.max(18, Math.min(x, y)), Math.min(99, Math.max(x, y))]; } }
    else if (p.k === 'scale') { const n = parseInt(v, 10); if (n >= 1 && n <= 5) r[k] = n; }
    else if (p.k === 'multi') { const ok = new Set(p.o.map((o) => o[0])); if (Array.isArray(v)) r[k] = [...new Set(v.filter((x) => ok.has(x)))].slice(0, p.max || 20); }
    else if (p.k === 'rank') { const ok = new Set(p.o.map((o) => o[0])); if (Array.isArray(v)) r[k] = [...new Set(v.filter((x) => ok.has(x)))]; }
    else if (p.k === 'choice' || p.k === 'city' || p.grid) { const ok = new Set((p.o || []).map((o) => o[0])); if (v === null || v === '') r[k] = null; else if (ok.has(v)) r[k] = v; }
  }
  return r;
}

// `P` es la persona de la sesión. Sin sesión solo entra la herramienta de demo
// "crear una persona al azar", que nace en el pool ficticio.
export async function guardarCuestionario(env, ctx, P, { nombre, respuestas }) {
  const limpio = limpiarRespuestas(respuestas);
  const nom = String(nombre || '').trim().slice(0, 40);
  let nueva = false;
  if (!P) {
    nueva = true;
    const id = 'p' + Date.now().toString(36) + Math.random().toString(36).slice(2, 5);
    const color = COLORES[Math.floor(Math.random() * COLORES.length)];
    await env.DB.prepare(`INSERT INTO personas (id, pool, nombre, genero, edad, ciudad, color, respuestas, origen, estado, completo) VALUES (?, 'demo', ?, ?, ?, ?, ?, ?, 'cuestionario', 'activa', 0)`)
      .bind(id, nom || 'Sin nombre', limpio.genero || null, limpio.edad || null, limpio.ciudad || null, color, JSON.stringify(limpio)).run();
    await anotar(env, 'persona', 'Se creó una persona de demo desde el cuestionario', nom || 'Sin nombre');
    P = await persona(env, id);
  } else {
    const r = { ...P.r, ...limpio };
    await env.DB.prepare(`UPDATE personas SET nombre = COALESCE(NULLIF(?, ''), nombre), genero = ?, edad = ?, ciudad = ?, respuestas = ?, actualizada = datetime('now') WHERE id = ?`)
      .bind(nom, r.genero || null, r.edad || null, r.ciudad || null, JSON.stringify(r), P.id).run();
    P = await persona(env, P.id);
  }
  const av = avance(P.r);
  let cruce = null;
  if (av.listo) {
    const eraCompleto = !!P.completo;
    const lectura = lecturaHeuristica(P.r);
    await env.DB.prepare(`UPDATE personas SET completo = 1, lectura = ? WHERE id = ?`).bind(JSON.stringify(lectura), P.id).run();
    if (!eraCompleto) await anotar(env, 'persona', 'Un perfil entró al matching', `${P.nombre} (cuestionario)`);
    const r = await recalcularTodo(env, { soloId: P.id, avisar: true, motivo: 'cuestionario' });
    cruce = { pares: r.pares, arriba: r.arriba, nuevas: r.nuevas };
  } else if (P.completo) {
    // borró algo obligatorio: sale del matching hasta completarlo; sus puertas abiertas se respetan
    await env.DB.batch([
      env.DB.prepare(`UPDATE personas SET completo = 0 WHERE id = ?`).bind(P.id),
      env.DB.prepare(`DELETE FROM pares WHERE a = ? OR b = ?`).bind(P.id, P.id),
      env.DB.prepare(`DELETE FROM puertas WHERE (a = ? OR b = ?) AND estado != 'abierta'`).bind(P.id, P.id),
    ]);
    await anotar(env, 'persona', 'Un perfil salió del matching por quedar incompleto', P.nombre);
  }
  return { id: P.id, nueva, avance: av, cruce };
}
// fin · RLR
