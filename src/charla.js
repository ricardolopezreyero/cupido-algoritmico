/* ─────────────────────────────────────────────────────────────────────────────
   Cupido Algorítmico · La charla: nace cuando los dos dijeron que sí
   Autor: Ricardo López Reyero
   Reglas: solo existe entre dos personas con puerta abierta; nada se borra;
   el sistema manda el primer "hola" de parte de cada uno; se ve cuando el
   otro está escribiendo; los archivos viven en R2 y solo los dos los ven.
   El perfil se libera por elementos (ver public/js/elementos.js).
   ───────────────────────────────────────────────────────────────────────────── */
// RLR
import { persona, anotar } from './datos.js';
import { PREGUNTAS } from '../public/js/preguntas.js';
import { ELEMENTOS, ELEMENTO } from '../public/js/elementos.js';
import { avisarVivo, presenciaVivo } from './viva.js';

export const _RLR = 'Ricardo López Reyero';
const _k = 'EYE', _rev = 181218;

export const ESQUEMA_CHARLA = [
  `CREATE TABLE IF NOT EXISTS charlas (
     a TEXT NOT NULL, b TEXT NOT NULL, creada TEXT NOT NULL DEFAULT (datetime('now')),
     escribe_a TEXT, escribe_b TEXT, leido_a INTEGER NOT NULL DEFAULT 0, leido_b INTEGER NOT NULL DEFAULT 0,
     visita_a TEXT, visita_b TEXT,
     PRIMARY KEY (a, b))`,
  `CREATE TABLE IF NOT EXISTS mensajes (
     id INTEGER PRIMARY KEY AUTOINCREMENT, a TEXT NOT NULL, b TEXT NOT NULL, de TEXT NOT NULL,
     tipo TEXT NOT NULL DEFAULT 'texto', texto TEXT, archivo TEXT, auto INTEGER NOT NULL DEFAULT 0,
     creado TEXT NOT NULL DEFAULT (datetime('now')))`,
  `CREATE INDEX IF NOT EXISTS idx_mensajes_charla ON mensajes(a, b, id)`,
  `CREATE TABLE IF NOT EXISTS reacciones (
     mensaje INTEGER NOT NULL, persona TEXT NOT NULL, emoji TEXT NOT NULL, creado TEXT NOT NULL DEFAULT (datetime('now')),
     PRIMARY KEY (mensaje, persona))`,
  `CREATE TABLE IF NOT EXISTS liberaciones (
     persona TEXT NOT NULL, otra TEXT NOT NULL, elemento TEXT NOT NULL, creado TEXT NOT NULL DEFAULT (datetime('now')),
     PRIMARY KEY (persona, otra, elemento))`,
];

const clave = (x, y) => (x < y ? [x, y] : [y, x]);
const nom = (P) => (P.nombre === 'Sin nombre' ? 'Alguien' : P.nombre.split(' ')[0]);
const MAX_TEXTO = 2000;
export const ARCHIVO = { max: 15 * 1024 * 1024, mimes: /^(image\/(jpeg|png|webp|gif|heic)|application\/pdf|audio\/|video\/(mp4|webm|quicktime)|text\/plain|application\/(msword|vnd\.openxmlformats-officedocument\.(wordprocessingml\.document|spreadsheetml\.sheet|presentationml\.presentation)))/ };

/* ── nace la charla (puerta abierta): "hola" del hombre y luego de la mujer ─ */
export async function abrirCharla(env, x, y) {
  const [a, b] = clave(x, y);
  const ya = await env.DB.prepare(`SELECT 1 AS v FROM charlas WHERE a = ? AND b = ?`).bind(a, b).first();
  if (ya) return false;
  await env.DB.prepare(`INSERT OR IGNORE INTO charlas (a, b) VALUES (?, ?)`).bind(a, b).run();
  const [A, B] = [await persona(env, a), await persona(env, b)];
  const primero = A.genero === 'hombre' && B.genero !== 'hombre' ? A : B.genero === 'hombre' && A.genero !== 'hombre' ? B : A;
  const segundo = primero === A ? B : A;
  await env.DB.batch([
    env.DB.prepare(`INSERT INTO mensajes (a, b, de, tipo, texto, auto) VALUES (?, ?, ?, 'texto', ?, 1)`).bind(a, b, primero.id, `Hola, ${nom(segundo)} 👋`),
    env.DB.prepare(`INSERT INTO mensajes (a, b, de, tipo, texto, auto) VALUES (?, ?, ?, 'texto', ?, 1)`).bind(a, b, segundo.id, `Hola, ${nom(primero)} 👋`),
    env.DB.prepare(`INSERT INTO mensajes (a, b, de, tipo, texto) VALUES (?, ?, 'sistema', 'sistema', ?)`).bind(a, b, 'Se abrió la puerta: los dos dijeron que sí. Aquí nadie ve su perfil todavía: cada quien decide qué compartir y cuándo.'),
  ]);
  return true;
}
export async function borrarCharlasDe(env, id) {
  await env.DB.batch([
    env.DB.prepare(`DELETE FROM mensajes WHERE a = ? OR b = ?`).bind(id, id),
    env.DB.prepare(`DELETE FROM charlas WHERE a = ? OR b = ?`).bind(id, id),
    env.DB.prepare(`DELETE FROM liberaciones WHERE persona = ? OR otra = ?`).bind(id, id),
    env.DB.prepare(`DELETE FROM reacciones WHERE mensaje NOT IN (SELECT id FROM mensajes)`),
  ]);
}

/* ── ¿hay charla entre los dos? ──────────────────────────────────────────── */
async function charlaDe(env, yo, otra) {
  const [a, b] = clave(yo, otra);
  const c = await env.DB.prepare(`SELECT * FROM charlas WHERE a = ? AND b = ?`).bind(a, b).first();
  return c ? { ...c, soyA: yo === a } : null;
}

/* ── lista de charlas para el tablero ────────────────────────────────────── */
export async function misCharlas(env, yo) {
  const filas = (await env.DB.prepare(`SELECT * FROM charlas WHERE a = ? OR b = ? ORDER BY creada DESC`).bind(yo, yo).all()).results;
  const lista = [];
  for (const c of filas) {
    const otraId = c.a === yo ? c.b : c.a, O = await persona(env, otraId);
    if (!O) continue;
    const leido = c.a === yo ? c.leido_a : c.leido_b;
    const ult = await env.DB.prepare(`SELECT id, de, tipo, texto, creado FROM mensajes WHERE a = ? AND b = ? ORDER BY id DESC LIMIT 1`).bind(c.a, c.b).first();
    const nuevos = (await env.DB.prepare(`SELECT COUNT(*) AS n FROM mensajes WHERE a = ? AND b = ? AND id > ? AND de != ?`).bind(c.a, c.b, leido, yo).first()).n;
    lista.push({ otra: otraId, nombre: nom(O), color: O.color, nuevos, ultimo: ult ? { texto: ult.tipo === 'archivo' ? '📎 ' + (ult.texto || 'Archivo') : ult.tipo === 'gif' ? '🎞️ GIF' : ult.texto, mio: ult.de === yo, creado: ult.creado } : null, orden: ult?.creado || c.creada });
  }
  // orden: no leídos primero, luego por último mensaje
  return lista.sort((x, y) => (y.nuevos > 0) - (x.nuevos > 0) || String(y.orden).localeCompare(String(x.orden)));
}

/* ── la charla completa (o solo lo nuevo) ────────────────────────────────── */
export async function verCharla(env, yo, otraId, despues = 0) {
  const c = await charlaDe(env, yo, otraId);
  if (!c) return null;
  const O = await persona(env, otraId);
  const msgs = (await env.DB.prepare(`SELECT id, de, tipo, texto, archivo, auto, creado FROM mensajes WHERE a = ? AND b = ? AND id > ? ORDER BY id ASC LIMIT 300`).bind(c.a, c.b, despues).all()).results
    .map((m) => ({ ...m, archivo: m.archivo ? JSON.parse(m.archivo) : null, mio: m.de === yo }));
  const miLeido = c.soyA ? c.leido_a : c.leido_b;
  // marca como leído hasta el último y registra la visita; avisa al otro que ya vi
  const ultimoId = msgs.length ? msgs[msgs.length - 1].id : 0;
  await env.DB.prepare(`UPDATE charlas SET ${c.soyA ? 'leido_a' : 'leido_b'} = MAX(${c.soyA ? 'leido_a' : 'leido_b'}, ?), ${c.soyA ? 'visita_a' : 'visita_b'} = datetime('now') WHERE a = ? AND b = ?`).bind(ultimoId, c.a, c.b).run();
  if (ultimoId > miLeido && msgs.some((m) => !m.mio)) await avisarVivo(env, c.a, c.b, { t: 'visto', persona: yo, hasta: ultimoId, excepto: yo });
  const escribeOtro = c.soyA ? c.escribe_b : c.escribe_a;
  const otroEscribiendo = !!escribeOtro && (Date.now() - Date.parse(escribeOtro.replace(' ', 'T') + 'Z')) < 4500;
  const mios = (await env.DB.prepare(`SELECT elemento FROM liberaciones WHERE persona = ? AND otra = ?`).bind(yo, otraId).all()).results.map((r) => r.elemento);
  const suyos = (await env.DB.prepare(`SELECT elemento FROM liberaciones WHERE persona = ? AND otra = ?`).bind(otraId, yo).all()).results.map((r) => r.elemento);
  // reacciones de toda la charla (cambian sobre mensajes viejos) y hasta dónde leyó el otro
  const reac = {};
  for (const r of (await env.DB.prepare(`SELECT r.mensaje, r.persona, r.emoji FROM reacciones r JOIN mensajes m ON m.id = r.mensaje WHERE m.a = ? AND m.b = ?`).bind(c.a, c.b).all()).results)
    (reac[r.mensaje] = reac[r.mensaje] || []).push({ emoji: r.emoji, mia: r.persona === yo });
  const vistoHasta = c.soyA ? c.leido_b : c.leido_a;
  const enLinea = (await presenciaVivo(env, c.a, c.b)).includes(otraId);
  const ultimaVez = c.soyA ? c.visita_b : c.visita_a;
  return { otra: { id: otraId, nombre: nom(O), nombreCompleto: O.nombre, color: O.color, carta: O.r.carta || '', martes: O.r.martes || '', enLinea, ultimaVez }, mensajes: msgs, otroEscribiendo, compartido: { mios, suyos }, reacciones: reac, vistoHasta, miLeido };
}

export async function enviar(env, yo, otraId, { texto, tipo = 'texto', gif } = {}) {
  const c = await charlaDe(env, yo, otraId);
  if (!c) return { error: 'No hay una puerta abierta con esa persona', status: 403 };
  let t = String(texto || '').trim().slice(0, MAX_TEXTO), archivo = null;
  if (tipo === 'sticker') { if (!/^\p{Extended_Pictographic}[\p{Extended_Pictographic}\u200d\ufe0f]{0,10}$/u.test(t)) return { error: 'Sticker inválido', status: 400 }; }
  else if (tipo === 'gif') {
    const url = String(gif?.url || ''), preview = String(gif?.preview || url);
    if (!/^https:\/\/(media\.tenor\.com|c\.tenor\.com|media[0-9]*\.giphy\.com)\//.test(url)) return { error: 'GIF inválido', status: 400 };
    archivo = JSON.stringify({ url, preview, ancho: Number(gif?.ancho) || null, alto: Number(gif?.alto) || null }); t = 'GIF';
  } else { tipo = 'texto'; if (!t) return { error: 'Escribe algo', status: 400 }; }
  const ritmo = (await env.DB.prepare(`SELECT COUNT(*) AS n FROM mensajes WHERE a = ? AND b = ? AND de = ? AND creado > datetime('now', '-60 seconds')`).bind(c.a, c.b, yo).first()).n;
  if (ritmo >= 40) return { error: 'Vas muy rápido. Respira un segundo.', status: 429 };
  const r = await env.DB.prepare(`INSERT INTO mensajes (a, b, de, tipo, texto, archivo) VALUES (?, ?, ?, ?, ?, ?)`).bind(c.a, c.b, yo, tipo, t, archivo).run();
  await avisarVivo(env, c.a, c.b, { t: 'mensaje', id: r.meta.last_row_id, de: yo, tipo, vista: tipo === 'sticker' ? t : tipo === 'gif' ? '🎞️ GIF' : t.slice(0, 80), excepto: yo });
  await env.DB.prepare(`UPDATE charlas SET ${c.soyA ? 'escribe_a' : 'escribe_b'} = NULL, ${c.soyA ? 'leido_a' : 'leido_b'} = ? WHERE a = ? AND b = ?`).bind(r.meta.last_row_id, c.a, c.b).run();
  return { ok: true, id: r.meta.last_row_id };
}

export async function escribiendo(env, yo, otraId) {
  const c = await charlaDe(env, yo, otraId);
  if (!c) return { error: 'No hay charla', status: 403 };
  await env.DB.prepare(`UPDATE charlas SET ${c.soyA ? 'escribe_a' : 'escribe_b'} = datetime('now') WHERE a = ? AND b = ?`).bind(c.a, c.b).run();
  return { ok: true };
}

/* ── reacciones: una por persona y mensaje; el mismo emoji la quita ─────── */
export async function reaccionar(env, yo, otraId, mensajeId, emoji) {
  const c = await charlaDe(env, yo, otraId);
  if (!c) return { error: 'No hay charla', status: 403 };
  const m = await env.DB.prepare(`SELECT id FROM mensajes WHERE id = ? AND a = ? AND b = ? AND tipo != 'sistema'`).bind(Number(mensajeId), c.a, c.b).first();
  if (!m) return { error: 'No existe ese mensaje', status: 404 };
  const e = String(emoji || '').slice(0, 8);
  const actual = await env.DB.prepare(`SELECT emoji FROM reacciones WHERE mensaje = ? AND persona = ?`).bind(m.id, yo).first();
  if (!e || actual?.emoji === e) await env.DB.prepare(`DELETE FROM reacciones WHERE mensaje = ? AND persona = ?`).bind(m.id, yo).run();
  else await env.DB.prepare(`INSERT INTO reacciones (mensaje, persona, emoji) VALUES (?, ?, ?) ON CONFLICT(mensaje, persona) DO UPDATE SET emoji = excluded.emoji, creado = datetime('now')`).bind(m.id, yo, e).run();
  await avisarVivo(env, c.a, c.b, { t: 'reaccion', mensaje: m.id, excepto: yo });
  return { ok: true };
}

/* ── GIF: búsqueda vía Tenor (llave en secrets: TENOR_KEY) ──────────────── */
export async function buscarGif(env, q) {
  if (!env.TENOR_KEY) return { sinLlave: true, gifs: [] };
  const base = q ? 'https://tenor.googleapis.com/v2/search' : 'https://tenor.googleapis.com/v2/featured';
  const u = new URL(base);
  u.searchParams.set('key', env.TENOR_KEY); u.searchParams.set('client_key', 'cupido'); u.searchParams.set('limit', '24');
  u.searchParams.set('media_filter', 'tinygif,gif'); u.searchParams.set('locale', 'es_MX'); u.searchParams.set('contentfilter', 'medium');
  if (q) u.searchParams.set('q', String(q).slice(0, 60));
  try {
    const r = await fetch(u, { signal: AbortSignal.timeout(6000), cf: { cacheTtl: 300 } });
    if (!r.ok) return { gifs: [], error: 'Tenor no respondió' };
    const j = await r.json();
    return { gifs: (j.results || []).map((g) => ({ id: g.id, url: g.media_formats?.gif?.url, preview: g.media_formats?.tinygif?.url || g.media_formats?.gif?.url, ancho: g.media_formats?.tinygif?.dims?.[0], alto: g.media_formats?.tinygif?.dims?.[1] })).filter((g) => g.url) };
  } catch (e) { return { gifs: [], error: e.message }; }
}

/* ── WebSocket: el Worker valida la puerta y le pasa la conexión al objeto ── */
export async function conectarVivo(env, req, yo, otraId) {
  const c = await charlaDe(env, yo, otraId);
  if (!c) return new Response('No hay una puerta abierta con esa persona', { status: 403 });
  const obj = env.CHARLA_VIVA.get(env.CHARLA_VIVA.idFromName(`${c.a}|${c.b}`));
  return obj.fetch('https://viva/ws', { headers: { upgrade: 'websocket', 'x-persona': yo } });
}

/* ── archivos adjuntos (R2, solo los dos) ───────────────────────────────── */
export async function adjuntar(env, req, yo, otraId, nombre) {
  const c = await charlaDe(env, yo, otraId);
  if (!c) return { error: 'No hay una puerta abierta con esa persona', status: 403 };
  const mime = (req.headers.get('content-type') || 'application/octet-stream').split(';')[0].trim().toLowerCase();
  if (!ARCHIVO.mimes.test(mime)) return { error: 'Ese tipo de archivo no se puede mandar aquí (fotos, PDF, audio, video o documentos).', status: 415 };
  const cuerpo = await req.arrayBuffer();
  if (!cuerpo.byteLength) return { error: 'Archivo vacío', status: 400 };
  if (cuerpo.byteLength > ARCHIVO.max) return { error: 'Muy pesado: máximo 15 MB.', status: 413 };
  const limpio = String(nombre || 'archivo').replace(/[^\w.\- áéíóúñÁÉÍÓÚÑ()]/g, '_').slice(0, 80);
  const claveR2 = `charla/${c.a}_${c.b}/${Date.now().toString(36)}${Math.random().toString(36).slice(2, 7)}`;
  await env.MEDIOS.put(claveR2, cuerpo, { httpMetadata: { contentType: mime } });
  const archivo = { clave: claveR2, mime, nombre: limpio, tamano: cuerpo.byteLength };
  const r = await env.DB.prepare(`INSERT INTO mensajes (a, b, de, tipo, texto, archivo) VALUES (?, ?, ?, 'archivo', ?, ?)`).bind(c.a, c.b, yo, limpio, JSON.stringify(archivo)).run();
  await env.DB.prepare(`UPDATE charlas SET ${c.soyA ? 'leido_a' : 'leido_b'} = ? WHERE a = ? AND b = ?`).bind(r.meta.last_row_id, c.a, c.b).run();
  await avisarVivo(env, c.a, c.b, { t: 'mensaje', id: r.meta.last_row_id, de: yo, tipo: 'archivo', vista: /^image\//.test(mime) ? '📷 Foto' : /^audio\//.test(mime) ? '🎤 Nota de voz' : /^video\//.test(mime) ? '🎬 Video' : '📎 ' + limpio, excepto: yo });
  await anotar(env, 'charla', 'Se mandó un archivo en una charla', `${Math.round(cuerpo.byteLength / 1024)} KB · ${mime}`);
  return { ok: true, id: r.meta.last_row_id };
}

export async function servirAdjunto(env, req, yo, otraId, id) {
  const c = await charlaDe(env, yo, otraId);
  if (!c) return new Response('No', { status: 403 });
  const m = await env.DB.prepare(`SELECT archivo FROM mensajes WHERE id = ? AND a = ? AND b = ? AND tipo = 'archivo'`).bind(id, c.a, c.b).first();
  if (!m) return new Response('No existe', { status: 404 });
  const ar = JSON.parse(m.archivo);
  const obj = await env.MEDIOS.get(ar.clave, { range: req.headers, onlyIf: req.headers });
  if (!obj) return new Response('No existe', { status: 404 });
  const h = new Headers();
  obj.writeHttpMetadata(h);
  h.set('etag', obj.httpEtag);
  h.set('cache-control', 'private, max-age=3600');
  h.set('accept-ranges', 'bytes');
  if (!/^(image|audio|video)\//.test(ar.mime) && ar.mime !== 'application/pdf') h.set('content-disposition', `attachment; filename="${ar.nombre}"`);
  if (obj.range) h.set('content-range', `bytes ${obj.range.offset}-${obj.range.end ?? obj.size - 1}/${obj.size}`);
  return new Response(obj.body, { status: obj.range ? 206 : 200, headers: h });
}

/* ── liberar elementos del perfil (con confirmación del lado del cliente) ── */
export async function liberar(env, yo, otraId, elementos) {
  const c = await charlaDe(env, yo, otraId);
  if (!c) return { error: 'No hay una puerta abierta con esa persona', status: 403 };
  const pedidos = [...new Set((Array.isArray(elementos) ? elementos : []).filter((e) => ELEMENTO[e]))];
  if (!pedidos.length) return { error: 'Elige al menos un elemento', status: 400 };
  const ya = new Set((await env.DB.prepare(`SELECT elemento FROM liberaciones WHERE persona = ? AND otra = ?`).bind(yo, otraId).all()).results.map((r) => r.elemento));
  const nuevos = pedidos.filter((e) => !ya.has(e));
  if (nuevos.length) {
    const Yo = await persona(env, yo);
    await env.DB.batch([
      ...nuevos.map((e) => env.DB.prepare(`INSERT OR IGNORE INTO liberaciones (persona, otra, elemento) VALUES (?, ?, ?)`).bind(yo, otraId, e)),
      env.DB.prepare(`INSERT INTO mensajes (a, b, de, tipo, texto) VALUES (?, ?, 'sistema', 'sistema', ?)`).bind(c.a, c.b, `${nom(Yo)} compartió: ${nuevos.map((e) => `${ELEMENTO[e].i} ${ELEMENTO[e].n}`).join(' · ')}`),
    ]);
    await anotar(env, 'charla', 'Una persona liberó parte de su perfil', `${nuevos.length} elemento(s)`);
    await avisarVivo(env, c.a, c.b, { t: 'mensaje', de: 'sistema', tipo: 'sistema', excepto: yo });
  }
  const mios = [...ya, ...nuevos];
  return { ok: true, mios };
}

// Solo las respuestas de los elementos que la otra persona me liberó
export async function perfilCompartido(env, yo, otraId) {
  const c = await charlaDe(env, yo, otraId);
  if (!c) return null;
  const O = await persona(env, otraId);
  const suyos = (await env.DB.prepare(`SELECT elemento FROM liberaciones WHERE persona = ? AND otra = ?`).bind(otraId, yo).all()).results.map((r) => r.elemento);
  const permitidas = new Set(suyos.flatMap((e) => ELEMENTO[e]?.q || []));
  const claves = new Set(PREGUNTAS.filter((p) => permitidas.has(p.n)).flatMap((p) => p.parts.flatMap((pt) => pt.k === 'grid' ? pt.rows.map(([rid]) => rid) : [pt.id])));
  const r = {};
  for (const [k, v] of Object.entries(O.r)) if (claves.has(k)) r[k] = v;
  return { otra: { id: otraId, nombre: nom(O), color: O.color }, elementos: suyos, respuestas: r };
}
// fin · RLR
