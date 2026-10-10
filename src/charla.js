/* ─────────────────────────────────────────────────────────────────────────────
   Cupido Algorítmico · La charla: nace cuando los dos dijeron que sí
   Autor: Ricardo López Reyero
   Reglas: solo existe entre dos personas con puerta abierta; el sistema manda
   el primer "hola" de parte de cada uno; se ve cuando el otro está escribiendo;
   los archivos viven en R2 y solo los dos los ven. El perfil se libera por
   elementos (ver public/js/elementos.js). Y aquí manda ella (src/ella.js):
   él no insiste, no manda archivos hasta que ella lo permite, y cualquiera
   puede cerrar la puerta: entonces la charla deja de existir para los dos.
   ───────────────────────────────────────────────────────────────────────────── */
// RLR
import { persona, anotar } from './datos.js';
import { PREGUNTAS } from '../public/js/preguntas.js';
import { ELEMENTOS, ELEMENTO } from '../public/js/elementos.js';
import { avisarVivo, presenciaVivo, llamadaVivo } from './viva.js';
import { anotarNovedad } from './correos.js';
import { manda, esHombre, ajustesDe, control, controlesDe, sinRespuesta, INSISTENCIA } from './ella.js';
import { TIPOS_CHISPA, tonoDe, ponerTono, prepararChispa, trasEnviarChispa, responder, juegoDe, album } from './chispa.js';

// Lo que pasa en la charla mientras la otra persona no está se anota como novedad; sale junto, en un solo correo (src/correos.js)
const novedad = (env, c, yo, otraId, nov) => anotarNovedad(env, c, yo, otraId, nov);

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
  `CREATE TABLE IF NOT EXISTS guardados (
     persona TEXT NOT NULL, mensaje INTEGER NOT NULL, creado TEXT NOT NULL DEFAULT (datetime('now')), PRIMARY KEY (persona, mensaje))`,
  `CREATE TABLE IF NOT EXISTS liberaciones (
     persona TEXT NOT NULL, otra TEXT NOT NULL, elemento TEXT NOT NULL, creado TEXT NOT NULL DEFAULT (datetime('now')),
     PRIMARY KEY (persona, otra, elemento))`,
];

const clave = (x, y) => (x < y ? [x, y] : [y, x]);
const nom = (P) => (P.nombre === 'Sin nombre' ? 'Alguien' : P.nombre.split(' ')[0]);
const MAX_TEXTO = 2000;
// Como en la Mina: el texto se escribe tal cual, sin caracteres de control ni marcas invisibles que voltean el texto; los emojis pasan enteros
const limpiarTexto = (s) => Array.from(String(s ?? '').replace(/[\u0000-\u0009\u000b-\u001f\u007f\u200b-\u200f\u2028-\u202e\u2066-\u2069]/g, ' ').replace(/[ \t]+/g, ' ').replace(/\n{3,}/g, '\n\n').trim()).slice(0, MAX_TEXTO).join('');
// `max` es el tope del envío directo; lo grande va por partes (src/subidas.js)
export const ARCHIVO = { max: 15 * 1024 * 1024, mimes: /^(image\/(jpeg|png|webp|gif|heic|heif)|application\/pdf|audio\/|video\/(mp4|webm|quicktime|x-m4v|3gpp)|text\/plain|application\/(msword|vnd\.openxmlformats-officedocument\.(wordprocessingml\.document|spreadsheetml\.sheet|presentationml\.presentation)))/ };

/* ── nace la charla (puerta abierta): "hola" del hombre y luego de la mujer ─ */
export async function abrirCharla(env, x, y) {
  const [a, b] = clave(x, y);
  const ya = await env.DB.prepare(`SELECT cerrada FROM charlas WHERE a = ? AND b = ?`).bind(a, b).first();
  if (ya?.cerrada) { // la puerta se había cerrado y los dos volvieron a decir que sí
    await env.DB.batch([
      env.DB.prepare(`UPDATE charlas SET cerrada = NULL, cerro = NULL WHERE a = ? AND b = ?`).bind(a, b),
      env.DB.prepare(`INSERT INTO mensajes (a, b, de, tipo, texto) VALUES (?, ?, 'sistema', 'sistema', ?)`).bind(a, b, 'La puerta volvió a abrirse: los dos dijeron que sí otra vez. Lo que cada quien había compartido de su perfil se guardó; se comparte de nuevo cuando quieran.'),
    ]);
    return true;
  }
  if (ya) return false;
  await env.DB.prepare(`INSERT OR IGNORE INTO charlas (a, b) VALUES (?, ?)`).bind(a, b).run();
  const [A, B] = [await persona(env, a), await persona(env, b)];
  const primero = A.genero === 'hombre' && B.genero !== 'hombre' ? A : B.genero === 'hombre' && A.genero !== 'hombre' ? B : A;
  const segundo = primero === A ? B : A;
  await env.DB.batch([
    env.DB.prepare(`INSERT INTO mensajes (a, b, de, tipo, texto, auto) VALUES (?, ?, ?, 'texto', ?, 1)`).bind(a, b, primero.id, `Hola, ${nom(segundo)} 👋`),
    env.DB.prepare(`INSERT INTO mensajes (a, b, de, tipo, texto, auto) VALUES (?, ?, ?, 'texto', ?, 1)`).bind(a, b, segundo.id, `Hola, ${nom(primero)} 👋`),
    env.DB.prepare(`INSERT INTO mensajes (a, b, de, tipo, texto) VALUES (?, ?, 'sistema', 'sistema', ?)`).bind(a, b, 'Se abrió la puerta: los dos dijeron que sí. Aquí nadie ve su perfil todavía: cada quien decide qué compartir y cuándo. Y cualquiera de los dos puede cerrar la puerta cuando quiera, sin dar explicaciones.'),
  ]);
  return true;
}
export async function borrarCharlasDe(env, id) {
  await env.DB.batch([
    env.DB.prepare(`DELETE FROM mensajes WHERE a = ? OR b = ?`).bind(id, id),
    env.DB.prepare(`DELETE FROM charlas WHERE a = ? OR b = ?`).bind(id, id),
    env.DB.prepare(`DELETE FROM liberaciones WHERE persona = ? OR otra = ?`).bind(id, id),
    env.DB.prepare(`DELETE FROM reacciones WHERE mensaje NOT IN (SELECT id FROM mensajes)`),
    env.DB.prepare(`DELETE FROM controles WHERE persona = ? OR otra = ?`).bind(id, id),
    env.DB.prepare(`DELETE FROM respuestas WHERE mensaje NOT IN (SELECT id FROM mensajes)`),
  ]);
}

/* ── ¿hay charla entre los dos? ──────────────────────────────────────────── */
async function charlaDe(env, yo, otra) {
  const [a, b] = clave(yo, otra);
  const c = await env.DB.prepare(`SELECT * FROM charlas WHERE a = ? AND b = ?`).bind(a, b).first();
  return c && !c.cerrada ? { ...c, soyA: yo === a } : null; // una charla cerrada ya no existe para nadie
}

/* ── lista de charlas para el tablero ────────────────────────────────────── */
export async function misCharlas(env, yo) {
  const filas = (await env.DB.prepare(`SELECT * FROM charlas WHERE (a = ? OR b = ?) AND cerrada IS NULL ORDER BY creada DESC`).bind(yo, yo).all()).results;
  const lista = [];
  for (const c of filas) {
    const otraId = c.a === yo ? c.b : c.a, O = await persona(env, otraId);
    if (!O) continue;
    const leido = c.a === yo ? c.leido_a : c.leido_b;
    const ult = await env.DB.prepare(`SELECT id, de, tipo, texto, creado FROM mensajes WHERE a = ? AND b = ? ORDER BY id DESC LIMIT 1`).bind(c.a, c.b).first();
    const nuevos = (await env.DB.prepare(`SELECT COUNT(*) AS n FROM mensajes WHERE a = ? AND b = ? AND id > ? AND de != ?`).bind(c.a, c.b, leido, yo).first()).n;
    lista.push({ otra: otraId, nombre: nom(O), color: O.color, nuevos, ultimo: ult ? { texto: vistaDe(ult), mio: ult.de === yo, creado: ult.creado } : null, orden: ult?.creado || c.creada });
  }
  // orden: no leídos primero, luego por último mensaje
  return lista.sort((x, y) => (y.nuevos > 0) - (x.nuevos > 0) || String(y.orden).localeCompare(String(x.orden)));
}

/* ── la charla completa (o solo lo nuevo) ────────────────────────────────── */
const VENTANA = 80;
function vistaDe(m) {
  const t = String(m.texto || '').slice(0, 120);
  return m.tipo === 'archivo' ? '📎 ' + (m.texto || 'Archivo') : m.tipo === 'gif' ? '🎞️ GIF' : m.tipo === 'carta' ? '🎴 ' + t : m.tipo === 'detalle' ? '🎁 ' + t : m.tipo === 'cita' ? '📅 ' + t : m.tipo === 'llamada' ? '📞 ' + t : m.tipo === 'borrado' ? 'Mensaje borrado' : t;
}
async function conCitas(env, c, msgs) {
  const ids = [...new Set(msgs.map((m) => m.responde_a).filter(Boolean))];
  if (!ids.length) return msgs;
  const citas = new Map((await env.DB.prepare(`SELECT id, de, tipo, texto FROM mensajes WHERE a = ? AND b = ? AND id IN (${ids.map(() => '?').join(',')})`).bind(c.a, c.b, ...ids).all()).results.map((q) => [q.id, q]));
  return msgs.map((m) => ({ ...m, cita: m.responde_a && citas.get(m.responde_a) ? { id: m.responde_a, de: citas.get(m.responde_a).de, vista: vistaDe(citas.get(m.responde_a)) } : null }));
}
export async function verCharla(env, yo, otraId, despues = 0, { antes = 0, todo = false } = {}) {
  const c = await charlaDe(env, yo, otraId);
  if (!c) return null;
  const O = await persona(env, otraId);
  let msgs;
  if (antes) { // historial hacia atrás, al subir hasta arriba
    msgs = (await env.DB.prepare(`SELECT id, de, tipo, texto, archivo, auto, responde_a, creado FROM mensajes WHERE a = ? AND b = ? AND id < ? ORDER BY id DESC LIMIT ?`).bind(c.a, c.b, antes, VENTANA).all()).results.reverse();
  } else if (!despues && !todo) { // primera carga: solo la ventana más reciente
    msgs = (await env.DB.prepare(`SELECT id, de, tipo, texto, archivo, auto, responde_a, creado FROM mensajes WHERE a = ? AND b = ? ORDER BY id DESC LIMIT ?`).bind(c.a, c.b, VENTANA).all()).results.reverse();
  } else msgs = (await env.DB.prepare(`SELECT id, de, tipo, texto, archivo, auto, responde_a, creado FROM mensajes WHERE a = ? AND b = ? AND id > ? ORDER BY id ASC LIMIT 3000`).bind(c.a, c.b, despues).all()).results;
  msgs = await conCitas(env, c, msgs.map((m) => ({ ...m, archivo: m.archivo ? JSON.parse(m.archivo) : null, mio: m.de === yo })));
  const hayMas = msgs.length ? !!(await env.DB.prepare(`SELECT 1 AS v FROM mensajes WHERE a = ? AND b = ? AND id < ? LIMIT 1`).bind(c.a, c.b, msgs[0].id).first()) : false;
  if (antes) return { mensajes: msgs, hayMas };
  const miLeido = c.soyA ? c.leido_a : c.leido_b;
  // marca como leído hasta el último y registra la visita; avisa al otro que ya vi
  const ultimoId = msgs.length ? msgs[msgs.length - 1].id : 0;
  await env.DB.prepare(`UPDATE charlas SET ${c.soyA ? 'leido_a' : 'leido_b'} = MAX(${c.soyA ? 'leido_a' : 'leido_b'}, ?), ${c.soyA ? 'visita_a' : 'visita_b'} = datetime('now') WHERE a = ? AND b = ?`).bind(ultimoId, c.a, c.b).run();
  const Yo = await persona(env, yo);
  const soyDiscreta = !esHombre(Yo) && !!ajustesDe(Yo).discreta, esDiscreta = !esHombre(O) && !!ajustesDe(O).discreta; // modo discreta: no se ve si está, si leyó ni si escribe
  if (ultimoId > miLeido && msgs.some((m) => !m.mio) && !soyDiscreta) await avisarVivo(env, c.a, c.b, { t: 'visto', persona: yo, hasta: ultimoId, excepto: yo });
  const escribeOtro = c.soyA ? c.escribe_b : c.escribe_a;
  const otroEscribiendo = !esDiscreta && !!escribeOtro && (Date.now() - Date.parse(escribeOtro.replace(' ', 'T') + 'Z')) < 4500;
  const mios = (await env.DB.prepare(`SELECT elemento FROM liberaciones WHERE persona = ? AND otra = ?`).bind(yo, otraId).all()).results.map((r) => r.elemento);
  const suyos = (await env.DB.prepare(`SELECT elemento FROM liberaciones WHERE persona = ? AND otra = ?`).bind(otraId, yo).all()).results.map((r) => r.elemento);
  // reacciones de toda la charla (cambian sobre mensajes viejos) y hasta dónde leyó el otro
  const reac = {};
  for (const r of (await env.DB.prepare(`SELECT r.mensaje, r.persona, r.emoji FROM reacciones r JOIN mensajes m ON m.id = r.mensaje WHERE m.a = ? AND m.b = ?`).bind(c.a, c.b).all()).results)
    (reac[r.mensaje] = reac[r.mensaje] || []).push({ emoji: r.emoji, mia: r.persona === yo });
  const vistoHasta = esDiscreta ? 0 : c.soyA ? c.leido_b : c.leido_a;
  const enLinea = !esDiscreta && (await presenciaVivo(env, c.a, c.b)).includes(otraId);
  const ultimaVez = esDiscreta ? null : c.soyA ? c.visita_b : c.visita_a;
  // aquí manda ella: qué puede hacer cada quien en esta charla
  const meMandan = manda(O, Yo);
  const ella = {
    mando: manda(Yo, O), meMandan, puedeTodo: !esHombre(Yo), discreta: esDiscreta,
    controles: await controlesDe(env, Yo, O),
    puedoMedios: await control(env, O, Yo, 'recibir_medios'),
    puedoLlamar: await control(env, O, Yo, 'llamadas'), // la llamada de voz solo existe si la otra persona la autorizó
    veMisMedios: await control(env, Yo, O, 'mis_medios'),
    insistencia: meMandan ? { van: await sinRespuesta(env, c, yo, otraId), tope: topeInsistencia(O) } : null,
  };
  const juego = await juegoDe(env, c, yo); // cartas e invitaciones: cambian sobre mensajes viejos, como las reacciones
  const guardados = (await env.DB.prepare(`SELECT g.mensaje FROM guardados g JOIN mensajes m ON m.id = g.mensaje WHERE g.persona = ? AND m.a = ? AND m.b = ?`).bind(yo, c.a, c.b).all()).results.map((g) => g.mensaje);
  const total = (await env.DB.prepare(`SELECT COUNT(*) AS n FROM mensajes WHERE a = ? AND b = ? AND tipo != 'sistema'`).bind(c.a, c.b).first()).n;
  return { otra: { id: otraId, nombre: nom(O), nombreCompleto: O.nombre, color: O.color, carta: O.r.carta || '', martes: O.r.martes || '', malinterpretan: O.r.malinterpretan || '', enLinea, ultimaVez }, mensajes: msgs, hayMas, otroEscribiendo, compartido: { mios, suyos }, reacciones: reac, vistoHasta, miLeido, guardados, total, desde: c.creada, ella, tono: tonoDe(c), juego: juego.estados, cartasUsadas: juego.usadas };
}

export async function enviar(env, yo, otraId, b = {}) {
  let { texto, tipo = 'texto', gif, respondeA } = b;
  const c = await charlaDe(env, yo, otraId);
  if (!c) return { error: 'No hay una puerta abierta con esa persona', status: 403 };
  let t = limpiarTexto(texto), archivo = null, chispa = null;
  let cita = null;
  if (respondeA) { cita = await env.DB.prepare(`SELECT id FROM mensajes WHERE id = ? AND a = ? AND b = ? AND tipo != 'sistema'`).bind(Number(respondeA), c.a, c.b).first(); if (!cita) return { error: 'Ese mensaje no está en esta charla', status: 400 }; }
  if (TIPOS_CHISPA.includes(tipo)) { // una carta, un detalle o una invitación (src/chispa.js)
    chispa = await prepararChispa(env, c, yo, otraId, b); if (chispa.error) return chispa;
    t = chispa.texto; archivo = JSON.stringify(chispa.archivo);
  }
  else if (tipo === 'sticker') { if (!/^\p{Extended_Pictographic}[\p{Extended_Pictographic}\u200d\ufe0f]{0,10}$/u.test(t)) return { error: 'Sticker inválido', status: 400 }; }
  else if (tipo === 'gif') {
    const url = String(gif?.url || ''), preview = String(gif?.preview || url);
    if (!/^https:\/\/(media\.tenor\.com|c\.tenor\.com|media[0-9]*\.giphy\.com)\//.test(url)) return { error: 'GIF inválido', status: 400 };
    archivo = JSON.stringify({ url, preview, ancho: Number(gif?.ancho) || null, alto: Number(gif?.alto) || null }); t = 'GIF';
  } else {
    tipo = 'texto'; if (!t) return { error: 'Escribe algo', status: 400 };
    // comentar una frase de su carta: la frase tiene que estar, tal cual, en lo que la otra persona escribió
    if (b.frase) { const plano = (x) => String(x || '').replace(/\s+/g, ' ').trim(), f = plano(b.frase).slice(0, 300), O = await persona(env, otraId); if (f.length >= 6 && [O?.r.carta, O?.r.martes, O?.r.malinterpretan].some((x) => plano(x).includes(f))) archivo = JSON.stringify({ frase: f }); }
  }
  const ritmo = (await env.DB.prepare(`SELECT COUNT(*) AS n FROM mensajes WHERE a = ? AND b = ? AND de = ? AND creado > datetime('now', '-60 seconds')`).bind(c.a, c.b, yo).first()).n;
  if (ritmo >= 40) return { error: 'Vas muy rápido. Respira un segundo.', status: 429 };
  const candado = await candadoDeElla(env, c, yo, otraId, false); if (candado) return candado;
  const r = await env.DB.prepare(`INSERT INTO mensajes (a, b, de, tipo, texto, archivo, responde_a) VALUES (?, ?, ?, ?, ?, ?, ?)`).bind(c.a, c.b, yo, tipo, t, archivo, cita ? cita.id : null).run();
  if (chispa) await trasEnviarChispa(env, r.meta.last_row_id, await persona(env, otraId), chispa);
  await avisarVivo(env, c.a, c.b, { t: 'mensaje', id: r.meta.last_row_id, de: yo, tipo, vista: chispa ? chispa.vista : tipo === 'sticker' ? t : tipo === 'gif' ? '🎞️ GIF' : t.slice(0, 80), excepto: yo });
  await hitoPorCantidad(env, c);
  await novedad(env, c, yo, otraId, chispa ? chispa.nov : tipo === 'sticker' ? { cat: 'charla', ico: t, v: 'te mandó un sticker' } : tipo === 'gif' ? { cat: 'charla', ico: '🎞️', v: 'te mandó un GIF' } : { cat: 'charla', ico: '💬', v: 'te escribió', d: t.slice(0, 180) });
  await env.DB.prepare(`UPDATE charlas SET ${c.soyA ? 'escribe_a' : 'escribe_b'} = NULL, ${c.soyA ? 'leido_a' : 'leido_b'} = ? WHERE a = ? AND b = ?`).bind(r.meta.last_row_id, c.a, c.b).run();
  return { ok: true, id: r.meta.last_row_id };
}

// Una persona ficticia del demo no contesta: ahí el tope es más alto para que el visitante pueda probar la charla
const topeInsistencia = (O) => (O?.origen === 'demo' ? 12 : INSISTENCIA);
// Aquí manda ella: frente a ella, él no insiste ni manda archivos sin permiso
async function candadoDeElla(env, c, yo, otraId, esArchivo) {
  const [Yo, O] = [await persona(env, yo), await persona(env, otraId)];
  if (esArchivo && !(await control(env, O, Yo, 'recibir_medios')))
    return { error: `${nom(O)} todavía no recibe fotos, videos, notas de voz ni archivos en esta charla. Eso lo decide ${nom(O)}.`, status: 403 };
  if (manda(O, Yo) && (await sinRespuesta(env, c, yo, otraId)) >= topeInsistencia(O))
    return { error: `Ya le escribiste ${topeInsistencia(O)} veces sin respuesta. Ahora le toca a ${nom(O)}: aquí nadie insiste.`, status: 429 };
  return null;
}

/* ── la llamada de voz: dentro de Cupido, sin número y sin que nadie vea desde dónde se conecta el otro ── */
// Llamar pide que la otra persona lo haya autorizado (frente a un hombre, ella lo enciende cuando quiere).
// Para quien llama, suena igual esté o no en línea la otra persona: así una llamada no delata quién está conectada.
export async function llamada(env, yo, otraId, accion) {
  const c = await charlaDe(env, yo, otraId);
  if (!c) return { error: 'No hay una puerta abierta con esa persona', status: 403 };
  if (!['llamar', 'contestar', 'rechazar', 'colgar'].includes(accion)) return { error: 'Acción inválida', status: 400 };
  if (accion === 'llamar') {
    const [Yo, O] = [await persona(env, yo), await persona(env, otraId)];
    if (!(await control(env, O, Yo, 'llamadas'))) return { error: `${nom(O)} todavía no recibe llamadas en esta charla. Eso lo decide ${nom(O)}.`, status: 403 };
    const candado = await candadoDeElla(env, c, yo, otraId, false); if (candado) return candado;
  }
  const r = await llamadaVivo(env, c.a, c.b, { accion, persona: yo });
  if (accion === 'llamar' && r.ok && !r.enLinea) await novedad(env, c, yo, otraId, { cat: 'llamadas', ico: '📞', v: 'te llamó por voz', d: 'No estabas en Cupido en ese momento. Le devuelves la llamada cuando quieras, o no.' });
  delete r.enLinea;
  return r;
}
// El canal del audio: el Worker valida la puerta; el objeto de la charla valida que haya una llamada contestada
export async function conectarVoz(env, req, yo, otraId) {
  const c = await charlaDe(env, yo, otraId);
  if (!c) return new Response('No hay una puerta abierta con esa persona', { status: 403 });
  return env.CHARLA_VIVA.get(env.CHARLA_VIVA.idFromName(`${c.a}|${c.b}`)).fetch('https://viva/voz', { headers: { upgrade: 'websocket', 'x-persona': yo } });
}

/* ── la chispa: el tono, responder cartas e invitaciones, y el álbum ─────── */
export async function cambiarTono(env, yo, otraId, tono) {
  const c = await charlaDe(env, yo, otraId);
  if (!c) return { error: 'No hay una puerta abierta con esa persona', status: 403 };
  const r = await ponerTono(env, c, yo, String(tono || ''));
  // la buena noticia sí se cuenta; que alguien le bajó al tono, no: eso se ve en la charla y ya
  if (r.cambio === 'coqueteo') await novedad(env, c, yo, otraId, { cat: 'chispa', ico: '💫', v: 'también eligió coqueteo', d: 'Los dos lo eligieron: ya se encendió. Con gusto y sin prisa.' });
  delete r.cambio;
  return r;
}
export async function responderChispa(env, yo, otraId, mensaje, valor) {
  const c = await charlaDe(env, yo, otraId);
  if (!c) return { error: 'No hay una puerta abierta con esa persona', status: 403 };
  const r = await responder(env, c, yo, await persona(env, yo), mensaje, valor);
  if (r.nov) { await novedad(env, c, yo, otraId, r.nov); delete r.nov; }
  return r;
}
export async function verAlbum(env, yo, otraId) {
  const c = await charlaDe(env, yo, otraId);
  return c ? album(env, c, yo) : null;
}

export async function escribiendo(env, yo, otraId) {
  const c = await charlaDe(env, yo, otraId);
  if (!c) return { error: 'No hay charla', status: 403 };
  await env.DB.prepare(`UPDATE charlas SET ${c.soyA ? 'escribe_a' : 'escribe_b'} = datetime('now') WHERE a = ? AND b = ?`).bind(c.a, c.b).run();
  return { ok: true };
}

/* ── guardados: cada quien marca lo que quiere volver a leer (privado) ──── */
export async function guardar(env, yo, otraId, mensajeId) {
  const c = await charlaDe(env, yo, otraId);
  if (!c) return { error: 'No hay charla', status: 403 };
  const m = await env.DB.prepare(`SELECT id FROM mensajes WHERE id = ? AND a = ? AND b = ? AND tipo != 'sistema'`).bind(Number(mensajeId), c.a, c.b).first();
  if (!m) return { error: 'No existe ese mensaje', status: 404 };
  const ya = await env.DB.prepare(`SELECT 1 AS v FROM guardados WHERE persona = ? AND mensaje = ?`).bind(yo, m.id).first();
  if (ya) { await env.DB.prepare(`DELETE FROM guardados WHERE persona = ? AND mensaje = ?`).bind(yo, m.id).run(); return { ok: true, guardado: false }; }
  await env.DB.prepare(`INSERT INTO guardados (persona, mensaje) VALUES (?, ?)`).bind(yo, m.id).run();
  return { ok: true, guardado: true };
}
export async function losGuardados(env, yo, otraId) {
  const c = await charlaDe(env, yo, otraId);
  if (!c) return null;
  const msgs = (await env.DB.prepare(`SELECT m.id, m.de, m.tipo, m.texto, m.archivo, m.auto, m.responde_a, m.creado FROM guardados g JOIN mensajes m ON m.id = g.mensaje WHERE g.persona = ? AND m.a = ? AND m.b = ? ORDER BY m.id ASC`).bind(yo, c.a, c.b).all()).results;
  return msgs.map((m) => ({ ...m, archivo: m.archivo ? JSON.parse(m.archivo) : null, mio: m.de === yo, vista: vistaDe(m) }));
}

/* ── buscar dentro de la charla ──────────────────────────────────────────── */
export async function buscarEnCharla(env, yo, otraId, q) {
  const c = await charlaDe(env, yo, otraId);
  if (!c) return null;
  const t = limpiarTexto(q).slice(0, 80);
  if (t.length < 2) return [];
  const like = '%' + t.replace(/[%_]/g, (x) => '\\' + x) + '%';
  return (await env.DB.prepare(`SELECT id, de, tipo, texto, creado FROM mensajes WHERE a = ? AND b = ? AND tipo IN ('texto','archivo') AND texto LIKE ? ESCAPE '\\' ORDER BY id DESC LIMIT 40`).bind(c.a, c.b, like).all()).results
    .map((m) => ({ id: m.id, mio: m.de === yo, vista: vistaDe(m), creado: m.creado }));
}

/* ── hitos: el sistema deja una nota cuando la charla cruza algo que vale ── */
async function hito(env, c, clave, texto) {
  const ya = await env.DB.prepare(`SELECT 1 AS v FROM mensajes WHERE a = ? AND b = ? AND tipo = 'sistema' AND texto LIKE ?`).bind(c.a, c.b, `%⟨${clave}⟩%`).first();
  if (ya) return false;
  await env.DB.prepare(`INSERT INTO mensajes (a, b, de, tipo, texto) VALUES (?, ?, 'sistema', 'sistema', ?)`).bind(c.a, c.b, `${texto} ⟨${clave}⟩`).run();
  await avisarVivo(env, c.a, c.b, { t: 'mensaje', de: 'sistema', tipo: 'sistema' });
  const limpio = texto.replace(/^\S+\s/, ''); // sin el emoji del principio
  for (const [yo, otra] of [[c.a, c.b], [c.b, c.a]]) await novedad(env, c, otra, yo, { cat: 'planes', ico: '🗓️', v: 'y tú tienen algo que celebrar', d: limpio });
  return true;
}
async function hitoPorCantidad(env, c) {
  const n = (await env.DB.prepare(`SELECT COUNT(*) AS n FROM mensajes WHERE a = ? AND b = ? AND tipo != 'sistema'`).bind(c.a, c.b).first()).n;
  if (n === 50) await hito(env, c, 'm50', '🎉 Cincuenta mensajes. Esto ya es una conversación.');
  else if (n === 200) await hito(env, c, 'm200', '🌟 Doscientos mensajes. Pocas charlas llegan hasta aquí.');
  else if (n === 1000) await hito(env, c, 'm1000', '🏆 Mil mensajes. Esto ya no es una charla: es una historia.');
}
// Cada día (desde el cron): aniversarios de la puerta
export async function hitosDelDia(env) {
  const charlas = (await env.DB.prepare(`SELECT a, b, creada, CAST(julianday('now') - julianday(creada) AS INTEGER) AS dias FROM charlas WHERE cerrada IS NULL`).all()).results;
  let n = 0;
  for (const c of charlas) {
    if (c.dias === 7 && await hito(env, c, 'd7', '🗓️ Una semana desde que se abrió la puerta. Lo que han compartido se queda aquí, ordenado, para los dos.')) n++;
    else if (c.dias === 30 && await hito(env, c, 'd30', '🌙 Un mes de charla. Nadie los apuró y nadie los vio: así se construye confianza.')) n++;
    else if (c.dias === 100 && await hito(env, c, 'd100', '💯 Cien días. Si están leyendo esto, ya saben que valió la pena.')) n++;
  }
  return n;
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
  const Yo = await persona(env, yo);
  return obj.fetch('https://viva/ws', { headers: { upgrade: 'websocket', 'x-persona': yo, 'x-discreta': !esHombre(Yo) && ajustesDe(Yo).discreta ? '1' : '0' } });
}

/* ── archivos adjuntos (R2, solo los dos) ───────────────────────────────── */
export async function adjuntar(env, req, yo, otraId, nombre) {
  const c = await charlaDe(env, yo, otraId);
  if (!c) return { error: 'No hay una puerta abierta con esa persona', status: 403 };
  const mime = (req.headers.get('content-type') || 'application/octet-stream').split(';')[0].trim().toLowerCase();
  const candado = await candadoDeElla(env, c, yo, otraId, true); if (candado) return candado;
  if (!ARCHIVO.mimes.test(mime)) return { error: 'Ese tipo de archivo no se puede mandar aquí (fotos, PDF, audio, video o documentos).', status: 415 };
  const cuerpo = await req.arrayBuffer();
  if (!cuerpo.byteLength) return { error: 'Archivo vacío', status: 400 };
  if (cuerpo.byteLength > ARCHIVO.max) return { error: 'Muy pesado: máximo 15 MB.', status: 413 };
  const limpio = String(nombre || 'archivo').replace(/[^\w.\- áéíóúñÁÉÍÓÚÑ()]/g, '_').slice(0, 80);
  const claveR2 = `charla/${c.a}_${c.b}/${Date.now().toString(36)}${Math.random().toString(36).slice(2, 7)}`;
  await env.MEDIOS.put(claveR2, cuerpo, { httpMetadata: { contentType: mime } });
  return registrarAdjunto(env, yo, otraId, { clave: claveR2, mime, nombre: limpio, tamano: cuerpo.byteLength });
}
// ¿Puede mandar un archivo en esta charla? (puerta abierta + los candados de ella). Lo usa la subida por partes antes de empezar.
export async function puedeAdjuntar(env, yo, otraId) {
  const c = await charlaDe(env, yo, otraId);
  if (!c) return { error: 'No hay una puerta abierta con esa persona', status: 403 };
  const candado = await candadoDeElla(env, c, yo, otraId, true); if (candado) return candado;
  return { c };
}
// El archivo ya está en R2: nace el mensaje. `archivo` = { clave, mime, nombre, tamano, vista?, ancho?, alto?, duracion? }
export async function registrarAdjunto(env, yo, otraId, archivo) {
  const pa = await puedeAdjuntar(env, yo, otraId); if (pa.error) return pa;
  const c = pa.c, mime = archivo.mime, limpio = archivo.nombre;
  const r = await env.DB.prepare(`INSERT INTO mensajes (a, b, de, tipo, texto, archivo) VALUES (?, ?, ?, 'archivo', ?, ?)`).bind(c.a, c.b, yo, limpio, JSON.stringify(archivo)).run();
  await env.DB.prepare(`UPDATE charlas SET ${c.soyA ? 'leido_a' : 'leido_b'} = ? WHERE a = ? AND b = ?`).bind(r.meta.last_row_id, c.a, c.b).run();
  await avisarVivo(env, c.a, c.b, { t: 'mensaje', id: r.meta.last_row_id, de: yo, tipo: 'archivo', vista: /^image\//.test(mime) ? '📷 Foto' : /^audio\//.test(mime) ? '🎤 Audio' : /^video\//.test(mime) ? '🎬 Video' : '📎 ' + limpio, excepto: yo });
  await novedad(env, c, yo, otraId, /^image\//.test(mime) ? { cat: 'charla', ico: '📷', v: 'te mandó una foto' } : /^audio\//.test(mime) ? { cat: 'charla', ico: '🎤', v: limpio === 'Nota de voz' ? 'te mandó una nota de voz' : 'te mandó un audio', d: limpio === 'Nota de voz' ? '' : limpio } : /^video\//.test(mime) ? { cat: 'charla', ico: '🎬', v: 'te mandó un video' } : { cat: 'charla', ico: '📎', v: 'te mandó un archivo', d: limpio });
  await anotar(env, 'charla', 'Se mandó un archivo en una charla', `${archivo.tamano >= 1048576 ? (archivo.tamano / 1048576).toFixed(1) + ' MB' : Math.round(archivo.tamano / 1024) + ' KB'} · ${mime}`);
  return { ok: true, id: r.meta.last_row_id };
}

export async function servirAdjunto(env, req, yo, otraId, id) {
  const c = await charlaDe(env, yo, otraId);
  if (!c) return new Response('No', { status: 403 });
  const m = await env.DB.prepare(`SELECT archivo FROM mensajes WHERE id = ? AND a = ? AND b = ? AND tipo = 'archivo'`).bind(id, c.a, c.b).first();
  if (!m) return new Response('No existe', { status: 404 });
  const ar = JSON.parse(m.archivo);
  const u = new URL(req.url), quiereVista = u.searchParams.get('vista') === '1' && ar.vista;
  // el original viaja tal cual se subió y por rangos; la vista es la miniatura ligera para la lista
  const obj = await env.MEDIOS.get(quiereVista ? ar.clave + '.vista' : ar.clave, { range: req.headers, onlyIf: req.headers });
  if (!obj) return new Response('No existe', { status: 404 });
  if (!('body' in obj)) return new Response(null, { status: 304, headers: { etag: obj.httpEtag } });
  const h = new Headers();
  obj.writeHttpMetadata(h);
  h.set('etag', obj.httpEtag);
  h.set('x-content-type-options', 'nosniff');
  h.set('cache-control', 'private, max-age=86400');
  h.set('accept-ranges', 'bytes');
  if (u.searchParams.get('bajar') === '1') h.set('content-disposition', `attachment; filename="${ar.nombre}"`);
  else if (!/^(image|audio|video)\//.test(ar.mime) && ar.mime !== 'application/pdf') h.set('content-disposition', `attachment; filename="${ar.nombre}"`);
  // el rango exacto que se entrega: sin esto el reproductor no puede adelantar ni regresar en archivos grandes
  const pideRango = req.headers.has('range');
  if (pideRango && obj.range) { const ini = obj.range.offset ?? Math.max(0, obj.size - (obj.range.suffix || 0)), largo = obj.range.length ?? obj.size - ini; h.set('content-range', `bytes ${ini}-${ini + largo - 1}/${obj.size}`); h.set('content-length', String(largo)); }
  return new Response(obj.body, { status: pideRango && obj.range ? 206 : 200, headers: h });
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
    await novedad(env, c, yo, otraId, { cat: 'perfil', ico: '🔓', v: 'te compartió parte de su perfil', d: nuevos.map((e) => `${ELEMENTO[e].i} ${ELEMENTO[e].n}`).join(' · ') });
  }
  const mios = [...ya, ...nuevos];
  return { ok: true, mios };
}

// Retirar lo compartido: una decisión de ella. Lo que él ya leyó, lo leyó; desde ahora deja de verlo.
export async function retirar(env, yo, otraId, elementos) {
  const c = await charlaDe(env, yo, otraId);
  if (!c) return { error: 'No hay una puerta abierta con esa persona', status: 403 };
  const Yo = await persona(env, yo);
  if (esHombre(Yo)) return { error: 'Retirar lo compartido es una decisión de ella.', status: 403 };
  const pedidos = [...new Set((Array.isArray(elementos) ? elementos : []).filter((e) => ELEMENTO[e]))];
  const ya = new Set((await env.DB.prepare(`SELECT elemento FROM liberaciones WHERE persona = ? AND otra = ?`).bind(yo, otraId).all()).results.map((r) => r.elemento));
  const fuera = pedidos.filter((e) => ya.has(e));
  if (!fuera.length) return { error: 'Eso no estaba compartido', status: 400 };
  await env.DB.batch([
    ...fuera.map((e) => env.DB.prepare(`DELETE FROM liberaciones WHERE persona = ? AND otra = ? AND elemento = ?`).bind(yo, otraId, e)),
    env.DB.prepare(`INSERT INTO mensajes (a, b, de, tipo, texto) VALUES (?, ?, 'sistema', 'sistema', ?)`).bind(c.a, c.b, `${nom(Yo)} guardó de nuevo: ${fuera.map((e) => `${ELEMENTO[e].i} ${ELEMENTO[e].n}`).join(' · ')}`),
  ]);
  await anotar(env, 'ella', 'Ella retiró parte de lo que había compartido', `${fuera.length} elemento(s)`);
  await avisarVivo(env, c.a, c.b, { t: 'mensaje', de: 'sistema', tipo: 'sistema', excepto: yo });
  return { ok: true, mios: [...ya].filter((e) => !fuera.includes(e)) };
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
