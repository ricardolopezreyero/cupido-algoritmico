/* ─────────────────────────────────────────────────────────────────────────────
   Cupido Algorítmico · Subidas en alta calidad
   Autor: Ricardo López Reyero
   Fotos, audio y video se guardan en la calidad en que llegan: aquí nada se
   vuelve a comprimir. Para que quepan archivos grandes, se suben por partes
   (R2 multipart): el navegador corta el archivo, cada parte viaja sola y se
   reintenta sola, y al final se arma el original, byte por byte.
   Cada archivo puede traer su «vista» (miniatura o cuadro del video) para que
   la charla cargue ligera y el original se pida solo cuando se quiere ver.
   El espacio se mide por persona: hoy está incluido; mañana se podrá cobrar.
   ───────────────────────────────────────────────────────────────────────────── */
// RLR
import { anotar } from './datos.js';
import { puedeAdjuntar, registrarAdjunto, ARCHIVO } from './charla.js';
import { mediosDe, TIPOS } from './medios.js';
import { correoA } from './correos.js';

export const _RLR = 'Ricardo López Reyero';
const _k = 'EYE', _rev = 181218;

const MB = 1024 * 1024;
export const PARTE = 8 * MB;                 // tamaño de cada parte (todas iguales menos la última)
export const TOPE_PERSONA = 5 * 1024 * MB;   // espacio incluido por persona
export const VISTA_MAX = 700 * 1024;
// Lo más que pesa un solo archivo, según lo que es
export const LIMITES = {
  charla: { imagen: 40 * MB, audio: 300 * MB, video: 800 * MB, otro: 50 * MB },
  medio: { foto: 40 * MB, audio: 100 * MB, video: 500 * MB },
};
const clase = (mime) => (/^image\//.test(mime) ? 'imagen' : /^audio\//.test(mime) ? 'audio' : /^video\//.test(mime) ? 'video' : 'otro');
const legible = (n) => (n >= 1024 * MB ? `${(n / 1024 / MB).toFixed(1)} GB` : `${Math.round(n / MB)} MB`);

export const ESQUEMA_SUBIDAS = [
  `CREATE TABLE IF NOT EXISTS subidas (
     id TEXT PRIMARY KEY, persona TEXT NOT NULL, destino TEXT NOT NULL, otra TEXT, tipo TEXT, clave TEXT NOT NULL, upload_id TEXT NOT NULL,
     nombre TEXT, mime TEXT NOT NULL, tamano INTEGER NOT NULL, vista INTEGER NOT NULL DEFAULT 0, extra TEXT,
     creado TEXT NOT NULL DEFAULT (datetime('now')))`,
  `CREATE INDEX IF NOT EXISTS idx_subidas_persona ON subidas(persona, creado)`,
];

/* ── cuánto espacio usa una persona: lo suyo del perfil + lo que mandó en sus charlas ── */
export async function espacioDe(env, personaId) {
  const m = await env.DB.prepare(`SELECT COALESCE(SUM(tamano), 0) AS n FROM medios WHERE persona = ?`).bind(personaId).first();
  const c = await env.DB.prepare(`SELECT COALESCE(SUM(json_extract(archivo, '$.tamano')), 0) AS n, COUNT(*) AS archivos FROM mensajes WHERE de = ? AND tipo = 'archivo' AND archivo IS NOT NULL`).bind(personaId).first();
  return { usado: m.n + c.n, perfil: m.n, charlas: c.n, archivos: c.archivos, tope: TOPE_PERSONA };
}

/* ── 1 · empezar ─────────────────────────────────────────────────────────── */
export async function empezarSubida(env, P, b = {}) {
  const destino = b.destino === 'medio' ? 'medio' : 'charla';
  const mime = String(b.mime || '').split(';')[0].trim().toLowerCase();
  const tamano = Number(b.tamano) || 0;
  if (tamano <= 0) return { error: 'Archivo vacío', status: 400 };
  let clave, tipo = null, otra = null, limite;
  if (destino === 'medio') {
    tipo = String(b.tipo || '');
    const T = TIPOS[tipo]; if (!T) return { error: 'Tipo inválido', status: 400 };
    if (!P.completo) return { error: 'Primero termina tu cuestionario al 100 %. Después agregas tu foto, tu voz y tu video.', status: 403 };
    if (!T.mimes.includes(mime)) return { error: `Formato no admitido (${mime || 'desconocido'}).`, status: 415 };
    limite = LIMITES.medio[tipo]; clave = `${P.id}/${tipo}-${Date.now().toString(36)}${Math.random().toString(36).slice(2, 6)}`; // llave nueva: el anterior sigue vivo hasta que este termine
  } else {
    otra = String(b.otra || '');
    const pa = await puedeAdjuntar(env, P.id, otra); if (pa.error) return pa;
    if (!ARCHIVO.mimes.test(mime)) return { error: 'Ese tipo de archivo no se puede mandar aquí (fotos, PDF, audio, video o documentos).', status: 415 };
    limite = LIMITES.charla[clase(mime)];
    clave = `charla/${pa.c.a}_${pa.c.b}/${Date.now().toString(36)}${Math.random().toString(36).slice(2, 7)}`;
  }
  if (tamano > limite) return { error: `Muy pesado: aquí caben hasta ${legible(limite)} por archivo.`, status: 413 };
  const e = await espacioDe(env, P.id);
  if (e.usado + tamano > TOPE_PERSONA) return { error: `Llegaste al espacio incluido (${legible(TOPE_PERSONA)}). Quita algo que ya no uses, o espera: pronto se podrá ampliar.`, status: 413 };
  const pendientes = (await env.DB.prepare(`SELECT COUNT(*) AS n FROM subidas WHERE persona = ? AND creado > datetime('now', '-1 hour')`).bind(P.id).first()).n;
  if (pendientes >= 20) return { error: 'Tienes muchas subidas a medias. Espera un momento.', status: 429 };
  const mpu = await env.MEDIOS.createMultipartUpload(clave, { httpMetadata: { contentType: mime } });
  const id = [...crypto.getRandomValues(new Uint8Array(16))].map((x) => x.toString(36).padStart(2, '0')).join('').slice(0, 26);
  const nombre = String(b.nombre || 'archivo').replace(/[^\w.\- áéíóúñÁÉÍÓÚÑ()]/g, '_').slice(0, 80);
  const extra = { ancho: Number(b.ancho) || null, alto: Number(b.alto) || null, duracion: Number(b.duracion) || null };
  await env.DB.prepare(`INSERT INTO subidas (id, persona, destino, otra, tipo, clave, upload_id, nombre, mime, tamano, extra) VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)`)
    .bind(id, P.id, destino, otra, tipo, clave, mpu.uploadId, nombre, mime, tamano, JSON.stringify(extra)).run();
  return { ok: true, id, parte: PARTE, partes: Math.max(1, Math.ceil(tamano / PARTE)) };
}

const laSubida = (env, P, id) => env.DB.prepare(`SELECT * FROM subidas WHERE id = ? AND persona = ?`).bind(String(id), P.id).first();
const llaveR2 = (s) => s.clave;

/* ── 2 · cada parte ──────────────────────────────────────────────────────── */
export async function subirParte(env, P, id, n, req) {
  const s = await laSubida(env, P, id); if (!s) return { error: 'Esa subida ya no existe', status: 404 };
  const total = Math.max(1, Math.ceil(s.tamano / PARTE));
  if (!Number.isInteger(n) || n < 1 || n > total) return { error: 'Parte inválida', status: 400 };
  const cuerpo = await req.arrayBuffer();
  const esperado = n === total ? s.tamano - PARTE * (total - 1) : PARTE;
  if (cuerpo.byteLength !== esperado) return { error: 'La parte no llegó completa. Se reintenta sola.', status: 400 };
  const mpu = env.MEDIOS.resumeMultipartUpload(llaveR2(s), s.upload_id);
  const p = await mpu.uploadPart(n, cuerpo);
  return { ok: true, n, etag: p.etag };
}

/* ── la vista: miniatura de la foto o un cuadro del video ───────────────── */
export async function subirVista(env, P, id, req) {
  const s = await laSubida(env, P, id); if (!s) return { error: 'Esa subida ya no existe', status: 404 };
  const mime = (req.headers.get('content-type') || '').split(';')[0].trim().toLowerCase();
  if (mime !== 'image/jpeg') return { error: 'La vista va en JPEG', status: 415 };
  const cuerpo = await req.arrayBuffer();
  if (!cuerpo.byteLength || cuerpo.byteLength > VISTA_MAX) return { error: 'Vista inválida', status: 413 };
  await env.MEDIOS.put(llaveR2(s) + '.vista', cuerpo, { httpMetadata: { contentType: 'image/jpeg' } });
  await env.DB.prepare(`UPDATE subidas SET vista = 1 WHERE id = ?`).bind(s.id).run();
  return { ok: true };
}

/* ── 3 · terminar: se arma el original y nace el mensaje (o el medio del perfil) ── */
// Antes de que se llene: un aviso cuando lo subido pasa del 80 % del espacio incluido (como mucho uno al mes)
async function avisarEspacio(env, P) {
  const e = await espacioDe(env, P.id), pct = Math.round(100 * e.usado / e.tope);
  if (pct >= 80) await correoA(env, P, 'espacio', { usado: legible(e.usado), tope: legible(e.tope), pct }, { cadaMinutos: 60 * 24 * 30 });
}
export async function terminarSubida(env, P, id, partes) {
  const s = await laSubida(env, P, id); if (!s) return { error: 'Esa subida ya no existe', status: 404 };
  const lista = (Array.isArray(partes) ? partes : []).map((p) => ({ partNumber: Number(p.n), etag: String(p.etag || '') })).filter((p) => p.partNumber >= 1 && p.etag).sort((x, y) => x.partNumber - y.partNumber);
  if (lista.length !== Math.max(1, Math.ceil(s.tamano / PARTE))) return { error: 'Faltan partes', status: 400 };
  const mpu = env.MEDIOS.resumeMultipartUpload(llaveR2(s), s.upload_id);
  let obj;
  try { obj = await mpu.complete(lista); } catch (e) { console.error('subida', e.message); await soltar(env, s); return { error: 'No se pudo armar el archivo. Intenta de nuevo.', status: 502 }; }
  if (obj.size !== s.tamano) { await env.MEDIOS.delete(llaveR2(s)); await soltar(env, s, false); return { error: 'El archivo llegó incompleto. Intenta de nuevo.', status: 400 }; }
  const extra = (() => { try { return JSON.parse(s.extra || '{}'); } catch { return {}; } })();
  await env.DB.prepare(`DELETE FROM subidas WHERE id = ?`).bind(s.id).run();
  if (s.destino === 'medio') {
    // el archivo nuevo ya está completo: ahora sí reemplaza al anterior, y el anterior se borra
    const anterior = await env.DB.prepare(`SELECT clave FROM medios WHERE persona = ? AND tipo = ?`).bind(P.id, s.tipo).first();
    await env.DB.prepare(`INSERT INTO medios (persona, tipo, clave, mime, tamano, vista, creado) VALUES (?, ?, ?, ?, ?, ?, datetime('now'))
      ON CONFLICT(persona, tipo) DO UPDATE SET clave = excluded.clave, mime = excluded.mime, tamano = excluded.tamano, vista = excluded.vista, creado = excluded.creado`)
      .bind(P.id, s.tipo, s.clave, s.mime, s.tamano, s.vista ? 1 : 0).run();
    if (anterior && anterior.clave !== s.clave) { try { await env.MEDIOS.delete([anterior.clave, anterior.clave + '.vista']); } catch {} }
    await anotar(env, 'persona', `Una persona subió su ${s.tipo} en alta calidad`, legible(s.tamano));
    await avisarEspacio(env, P);
    return { ok: true, medios: await mediosDe(env, P.id), espacio: await espacioDe(env, P.id) };
  }
  const r = await registrarAdjunto(env, P.id, s.otra, { clave: s.clave, mime: s.mime, nombre: s.nombre, tamano: s.tamano, vista: !!s.vista, ...extra });
  if (r.error) { await env.MEDIOS.delete(s.clave); if (s.vista) await env.MEDIOS.delete(s.clave + '.vista'); }
  else await avisarEspacio(env, P);
  return r;
}

async function soltar(env, s, abortar = true) {
  if (abortar) { try { await env.MEDIOS.resumeMultipartUpload(llaveR2(s), s.upload_id).abort(); } catch {} }
  if (s.vista) { try { await env.MEDIOS.delete(llaveR2(s) + '.vista'); } catch {} }
  await env.DB.prepare(`DELETE FROM subidas WHERE id = ?`).bind(s.id).run();
}
export async function cancelarSubida(env, P, id) {
  const s = await laSubida(env, P, id); if (s) await soltar(env, s);
  return { ok: true };
}
// Cada día: lo que se quedó a medias hace más de un día se suelta (no ocupa espacio)
export async function limpiarSubidas(env) {
  const viejas = (await env.DB.prepare(`SELECT * FROM subidas WHERE creado < datetime('now', '-1 day') LIMIT 200`).all()).results;
  for (const s of viejas) await soltar(env, s);
  return viejas.length;
}
// fin · RLR
