/* ─────────────────────────────────────────────────────────────────────────────
   Cupido Algorítmico · Medios: foto, voz y video de la persona
   Autor: Ricardo López Reyero
   Regla: se agregan solo con el cuestionario al 100 %, y la otra persona los
   ve únicamente cuando la puerta se abrió (doble sí). Nunca antes.
   Se guardan en R2 (MEDIOS) y se sirven por el Worker con esa verificación.
   ───────────────────────────────────────────────────────────────────────────── */
// RLR
import { anotar, persona } from './datos.js';
import { control } from './ella.js';

export const _RLR = 'Ricardo López Reyero';
const _k = 'EYE', _rev = 181218;

export const TIPOS = {
  foto:  { max: 6 * 1024 * 1024,  mimes: ['image/jpeg', 'image/png', 'image/webp'] },
  audio: { max: 12 * 1024 * 1024, mimes: ['audio/webm', 'audio/mp4', 'audio/mpeg', 'audio/mp3', 'audio/ogg', 'audio/wav', 'audio/x-wav', 'audio/wave', 'audio/flac', 'audio/x-flac', 'audio/x-m4a', 'audio/aac'] },
  video: { max: 60 * 1024 * 1024, mimes: ['video/webm', 'video/mp4', 'video/quicktime'] },
};

export const ESQUEMA_MEDIOS = `CREATE TABLE IF NOT EXISTS medios (
  persona TEXT NOT NULL, tipo TEXT NOT NULL, clave TEXT NOT NULL, mime TEXT NOT NULL, tamano INTEGER NOT NULL,
  creado TEXT NOT NULL DEFAULT (datetime('now')), PRIMARY KEY (persona, tipo))`;

export async function mediosDe(env, personaId) {
  const r = (await env.DB.prepare(`SELECT tipo, mime, tamano, vista, creado FROM medios WHERE persona = ?`).bind(personaId).all()).results;
  // `url` es el original, en la calidad en que se subió; `mini` es la vista ligera (para avatares y carteles de video)
  return Object.fromEntries(r.map((m) => { const url = `/api/medio/${personaId}/${m.tipo}?v=${Date.parse(m.creado + 'Z') || 0}`; return [m.tipo, { mime: m.mime, tamano: m.tamano, creado: m.creado, url, mini: m.vista ? url + '&vista=1' : null }]; }));
}

export async function guardarMedio(env, P, tipo, req) {
  const T = TIPOS[tipo];
  if (!T) return { error: 'Tipo inválido', status: 400 };
  if (!P.completo) return { error: 'Primero termina tu cuestionario al 100 %. Después agregas tu foto, tu voz y tu video.', status: 403 };
  const mime = (req.headers.get('content-type') || '').split(';')[0].trim().toLowerCase();
  if (!T.mimes.includes(mime)) return { error: `Formato no admitido (${mime || 'desconocido'}).`, status: 415 };
  const largo = Number(req.headers.get('content-length') || 0);
  if (largo > T.max) return { error: `Muy pesado: máximo ${Math.round(T.max / 1048576)} MB.`, status: 413 };
  const cuerpo = await req.arrayBuffer();
  if (!cuerpo.byteLength) return { error: 'Archivo vacío', status: 400 };
  if (cuerpo.byteLength > T.max) return { error: `Muy pesado: máximo ${Math.round(T.max / 1048576)} MB.`, status: 413 };
  const clave = `${P.id}/${tipo}`;
  const antes = await env.DB.prepare(`SELECT clave FROM medios WHERE persona = ? AND tipo = ?`).bind(P.id, tipo).first();
  if (antes && antes.clave !== clave) { try { await env.MEDIOS.delete([antes.clave, antes.clave + '.vista']); } catch {} }
  await env.MEDIOS.put(clave, cuerpo, { httpMetadata: { contentType: mime } });
  await env.DB.prepare(`INSERT INTO medios (persona, tipo, clave, mime, tamano, creado) VALUES (?, ?, ?, ?, ?, datetime('now'))
    ON CONFLICT(persona, tipo) DO UPDATE SET clave = excluded.clave, mime = excluded.mime, tamano = excluded.tamano, vista = 0, creado = excluded.creado`)
    .bind(P.id, tipo, clave, mime, cuerpo.byteLength).run();
  await anotar(env, 'persona', `Una persona subió su ${tipo}`, `${Math.round(cuerpo.byteLength / 1024)} KB`);
  return { ok: true, medios: await mediosDe(env, P.id) };
}

export async function borrarMedio(env, P, tipo) {
  if (!TIPOS[tipo]) return { error: 'Tipo inválido', status: 400 };
  const m = await env.DB.prepare(`SELECT clave FROM medios WHERE persona = ? AND tipo = ?`).bind(P.id, tipo).first();
  await env.MEDIOS.delete([m?.clave || `${P.id}/${tipo}`, (m?.clave || `${P.id}/${tipo}`) + '.vista']);
  await env.DB.prepare(`DELETE FROM medios WHERE persona = ? AND tipo = ?`).bind(P.id, tipo).run();
  return { ok: true, medios: await mediosDe(env, P.id) };
}

// ¿Puede `yo` ver los medios de `otra`? Solo si soy yo, o si hay una puerta abierta entre los dos
// y la otra persona decidió enseñarlos (frente a un hombre, ella los enciende cuando quiere).
export async function puedeVer(env, yoId, otraId) {
  if (yoId === otraId) return true;
  const [a, b] = yoId < otraId ? [yoId, otraId] : [otraId, yoId];
  const p = await env.DB.prepare(`SELECT estado FROM puertas WHERE a = ? AND b = ?`).bind(a, b).first();
  if (p?.estado !== 'abierta') return false;
  const [Yo, O] = [await persona(env, yoId), await persona(env, otraId)];
  return !!Yo && !!O && await control(env, O, Yo, 'mis_medios');
}

export async function servirMedio(env, req, yoId, otraId, tipo) {
  if (!TIPOS[tipo]) return new Response('No existe', { status: 404 });
  if (!(await puedeVer(env, yoId, otraId))) return new Response('Todavía no se puede ver', { status: 403 });
  const m = await env.DB.prepare(`SELECT clave, vista FROM medios WHERE persona = ? AND tipo = ?`).bind(otraId, tipo).first();
  if (!m) return new Response('No existe', { status: 404 });
  const quiereVista = new URL(req.url).searchParams.get('vista') === '1' && m.vista;
  // el original se sirve tal cual se subió, por rangos: el reproductor pide solo lo que va a tocar
  const obj = await env.MEDIOS.get(quiereVista ? m.clave + '.vista' : m.clave, { range: req.headers, onlyIf: req.headers });
  if (!obj) return new Response('No existe', { status: 404 });
  if (!('body' in obj)) return new Response(null, { status: 304, headers: { etag: obj.httpEtag } });
  const h = new Headers();
  obj.writeHttpMetadata(h);
  h.set('etag', obj.httpEtag);
  h.set('x-content-type-options', 'nosniff');
  h.set('cache-control', 'private, max-age=86400');
  h.set('accept-ranges', 'bytes');
  // el rango exacto que se entrega: sin esto el reproductor no puede adelantar ni regresar en archivos grandes
  const pideRango = req.headers.has('range');
  if (pideRango && obj.range) { const ini = obj.range.offset ?? Math.max(0, obj.size - (obj.range.suffix || 0)), largo = obj.range.length ?? obj.size - ini; h.set('content-range', `bytes ${ini}-${ini + largo - 1}/${obj.size}`); h.set('content-length', String(largo)); }
  return new Response(obj.body, { status: pideRango && obj.range ? 206 : 200, headers: h });
}
// fin · RLR
