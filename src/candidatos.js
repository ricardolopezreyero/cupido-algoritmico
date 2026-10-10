/* ─────────────────────────────────────────────────────────────────────
   Cupido Algorítmico · Candidatas: las fichas de quien salimos a buscar
   RLR · Ricardo López Reyero
   Este archivo no lleva a nadie adentro: cada ficha es un JSON en la tabla
   `candidatos` y solo se le manda a una cuenta administradora. El repositorio
   es público; los nombres y lo que pensamos de cada quien, no.
   La pantalla es public/js/candidatos.js (un módulo suelto, traído de Video
   Room). Se siembra con scripts/sembrar-candidatos.mjs desde privado/…json.
   ───────────────────────────────────────────────────────────────────── */
export const _RLR = 'Ricardo López Reyero';
const _k = 'EYE', _rev = 181218;

// grupo: 'top' (las elegidas), 'banca' (reserva y las que agrega el equipo) y 'meta' (cómo se hizo la búsqueda; una fila por vacante)
export const ESQUEMA_CANDIDATOS = [
  `CREATE TABLE IF NOT EXISTS candidatos (
     id TEXT PRIMARY KEY, vacante TEXT NOT NULL DEFAULT 'ceo', grupo TEXT NOT NULL DEFAULT 'banca', orden INTEGER NOT NULL DEFAULT 100,
     datos TEXT NOT NULL, estado TEXT NOT NULL DEFAULT 'por_contactar', notas TEXT NOT NULL DEFAULT '',
     created_at INTEGER NOT NULL DEFAULT (unixepoch()), updated_at INTEGER, updated_por TEXT)`,
  `CREATE INDEX IF NOT EXISTS idx_candidatos_vacante ON candidatos(vacante, grupo, orden)`,
];

export const ESTADOS = ['por_contactar', 'contactado', 'en_platica', 'prueba', 'descartado'];
const txt = (v, max) => String(v == null ? '' : v).replace(/\u0000/g, '').trim().slice(0, max);
const vacanteLimpia = (v) => (/^[a-z0-9-]{2,40}$/.test(String(v || '')) ? String(v) : 'ceo');
// solo ligas http(s): lo que se guarda aquí termina en un href
export const ligaLimpia = (v) => { const s = txt(v, 300); return /^https?:\/\/[^\s<>"']+$/i.test(s) ? s : ''; };
const leer = (s) => { try { const j = JSON.parse(s); return j && typeof j === 'object' && !Array.isArray(j) ? j : {}; } catch { return {}; } };
const nuevoId = () => 'cand_' + [...crypto.getRandomValues(new Uint8Array(8))].map((b) => b.toString(16).padStart(2, '0')).join('');

export async function listarCandidatos(env, vacante = 'ceo') {
  const v = vacanteLimpia(vacante);
  const r = await env.DB.prepare(`SELECT id, grupo, orden, datos, estado, notas, updated_at, updated_por FROM candidatos WHERE vacante = ? ORDER BY (grupo = 'top') DESC, orden, created_at`).bind(v).all();
  let meta = {}; const fichas = [];
  for (const f of r.results) {
    if (f.grupo === 'meta') { meta = leer(f.datos); continue; }
    fichas.push({ ...leer(f.datos), id: f.id, grupo: f.grupo === 'top' ? 'top' : 'banca', orden: f.orden, estado: ESTADOS.includes(f.estado) ? f.estado : 'por_contactar', notas: f.notas, updated_at: f.updated_at, updated_por: f.updated_por });
  }
  return { vacante: v, meta, fichas };
}

/* ── cambiar el estado o las notas de una ficha: queda quién y cuándo ── */
export async function moverCandidato(env, id, cuerpo, por) {
  const fila = await env.DB.prepare(`SELECT estado, notas, grupo FROM candidatos WHERE id = ?`).bind(String(id)).first();
  if (!fila || fila.grupo === 'meta') return { error: 'no_existe' };
  let estado = fila.estado, notas = fila.notas;
  if (cuerpo.estado !== undefined) { if (!ESTADOS.includes(String(cuerpo.estado))) return { error: 'estado_invalido' }; estado = String(cuerpo.estado); }
  if (cuerpo.notas !== undefined) notas = txt(cuerpo.notas, 4000);
  const at = Math.floor(Date.now() / 1000);
  await env.DB.prepare(`UPDATE candidatos SET estado = ?, notas = ?, updated_at = ?, updated_por = ? WHERE id = ?`).bind(estado, notas, at, por, String(id)).run();
  return { ok: true, id, estado, notas, updated_at: at, updated_por: por };
}

/* ── alguien del equipo agrega a una persona que encontró: entra a la banca ── */
export async function agregarCandidato(env, cuerpo, por) {
  const vacante = vacanteLimpia(cuerpo.vacante);
  const nombre = txt(cuerpo.nombre, 90), titular = txt(cuerpo.titular, 200), porque = txt(cuerpo.porque, 1200), ciudad = txt(cuerpo.ciudad, 80);
  const escrita = txt(cuerpo.liga, 300), liga = ligaLimpia(escrita);
  if (nombre.length < 3) return { error: 'falta_nombre' };
  if (escrita && !liga) return { error: 'liga_invalida' };
  const cuantos = await env.DB.prepare(`SELECT COUNT(*) n FROM candidatos WHERE vacante = ?`).bind(vacante).first();
  if ((cuantos?.n ?? 0) >= 300) return { error: 'demasiados' };
  const id = nuevoId(), datos = { nombre, titular, ciudad, liga, resumen: porque, agregado_por: por }, at = Math.floor(Date.now() / 1000);
  await env.DB.prepare(`INSERT INTO candidatos (id, vacante, grupo, orden, datos, updated_at, updated_por) VALUES (?, ?, 'banca', 900, ?, ?, ?)`).bind(id, vacante, JSON.stringify(datos), at, por).run();
  return { ok: true, ficha: { ...datos, id, grupo: 'banca', orden: 900, estado: 'por_contactar', notas: '', updated_at: at, updated_por: por } };
}
