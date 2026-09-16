/* ─────────────────────────────────────────────────────────────────────────────
   Cupido Algorítmico · Medios: foto, voz y video de la persona
   Autor: Ricardo López Reyero
   Regla: se agregan solo con el cuestionario al 100 %, y la otra persona los
   ve únicamente cuando la puerta se abrió (doble sí). Nunca antes.
   Se guardan en R2 (MEDIOS) y se sirven por el Worker con esa verificación.
   ───────────────────────────────────────────────────────────────────────────── */
// RLR
import { anotar } from './datos.js';

export const _RLR = 'Ricardo López Reyero';
const _k = 'EYE', _rev = 181218;

export const TIPOS = {
  foto:  { max: 6 * 1024 * 1024,  mimes: ['image/jpeg', 'image/png', 'image/webp'] },
  audio: { max: 12 * 1024 * 1024, mimes: ['audio/webm', 'audio/mp4', 'audio/mpeg', 'audio/ogg', 'audio/wav', 'audio/x-m4a', 'audio/aac'] },
  video: { max: 60 * 1024 * 1024, mimes: ['video/webm', 'video/mp4', 'video/quicktime'] },
};

export const ESQUEMA_MEDIOS = `CREATE TABLE IF NOT EXISTS medios (
  persona TEXT NOT NULL, tipo TEXT NOT NULL, clave TEXT NOT NULL, mime TEXT NOT NULL, tamano INTEGER NOT NULL,
  creado TEXT NOT NULL DEFAULT (datetime('now')), PRIMARY KEY (persona, tipo))`;

export async function mediosDe(env, personaId) {
  const r = (await env.DB.prepare(`SELECT tipo, mime, tamano, creado FROM medios WHERE persona = ?`).bind(personaId).all()).results;
  return Object.fromEntries(r.map((m) => [m.tipo, { mime: m.mime, tamano: m.tamano, creado: m.creado, url: `/api/medio/${personaId}/${m.tipo}?v=${Date.parse(m.creado + 'Z') || 0}` }]));
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
  await env.MEDIOS.put(clave, cuerpo, { httpMetadata: { contentType: mime } });
  await env.DB.prepare(`INSERT INTO medios (persona, tipo, clave, mime, tamano, creado) VALUES (?, ?, ?, ?, ?, datetime('now'))
    ON CONFLICT(persona, tipo) DO UPDATE SET clave = excluded.clave, mime = excluded.mime, tamano = excluded.tamano, creado = excluded.creado`)
    .bind(P.id, tipo, clave, mime, cuerpo.byteLength).run();
  await anotar(env, 'persona', `Una persona subió su ${tipo}`, `${Math.round(cuerpo.byteLength / 1024)} KB`);
  return { ok: true, medios: await mediosDe(env, P.id) };
}

export async function borrarMedio(env, P, tipo) {
  if (!TIPOS[tipo]) return { error: 'Tipo inválido', status: 400 };
  await env.MEDIOS.delete(`${P.id}/${tipo}`);
  await env.DB.prepare(`DELETE FROM medios WHERE persona = ? AND tipo = ?`).bind(P.id, tipo).run();
  return { ok: true, medios: await mediosDe(env, P.id) };
}

// ¿Puede `yo` ver los medios de `otra`? Solo si soy yo, o si hay una puerta abierta entre los dos.
export async function puedeVer(env, yoId, otraId) {
  if (yoId === otraId) return true;
  const [a, b] = yoId < otraId ? [yoId, otraId] : [otraId, yoId];
  const p = await env.DB.prepare(`SELECT estado FROM puertas WHERE a = ? AND b = ?`).bind(a, b).first();
  return p?.estado === 'abierta';
}

export async function servirMedio(env, req, yoId, otraId, tipo) {
  if (!TIPOS[tipo]) return new Response('No existe', { status: 404 });
  if (!(await puedeVer(env, yoId, otraId))) return new Response('La puerta no está abierta', { status: 403 });
  const obj = await env.MEDIOS.get(`${otraId}/${tipo}`, { range: req.headers, onlyIf: req.headers });
  if (!obj) return new Response('No existe', { status: 404 });
  const h = new Headers();
  obj.writeHttpMetadata(h);
  h.set('etag', obj.httpEtag);
  h.set('cache-control', 'private, max-age=3600');
  h.set('accept-ranges', 'bytes');
  if (obj.range) h.set('content-range', `bytes ${obj.range.offset}-${obj.range.end ?? obj.size - 1}/${obj.size}`);
  return new Response(obj.body, { status: obj.range ? 206 : 200, headers: h });
}
// fin · RLR
