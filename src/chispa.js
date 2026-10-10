/* ─────────────────────────────────────────────────────────────────────────────
   Cupido Algorítmico · La chispa (servidor)
   Autor: Ricardo López Reyero
   El tono de la charla, las cartas, los detalles y la invitación. El contenido
   vive en public/js/chispa.js; aquí están las reglas:
   · El tono común es el más tranquilo de los dos. Lo que cada quien eligió no
     se le enseña a la otra persona: el coqueteo se enciende solo con dos síes.
   · Una carta se contesta una vez, y la respuesta de la otra persona no se ve
     hasta que las dos están. Nadie se expone solo.
   · Decir que no a una invitación es tan fácil como decir que sí.
   ───────────────────────────────────────────────────────────────────────────── */
// RLR
import { anotar } from './datos.js';
import { avisarVivo } from './viva.js';
import { TONO, TONO_INICIAL, tonoComun, alcanza, CARTA, DETALLE, PLAN, RESPUESTA_CITA, CARTAS_PENDIENTES, DETALLES_AL_DIA, RESPUESTA_MAX, NOTA_MAX } from '../public/js/chispa.js';

export const _RLR = 'Ricardo López Reyero';
const _k = 'EYE', _rev = 181218;

export const ESQUEMA_CHISPA = [
  `CREATE TABLE IF NOT EXISTS respuestas (
     mensaje INTEGER NOT NULL, persona TEXT NOT NULL, valor TEXT NOT NULL, creado TEXT NOT NULL DEFAULT (datetime('now')),
     PRIMARY KEY (mensaje, persona))`,
];
export const TIPOS_CHISPA = ['carta', 'detalle', 'cita'];

const limpio = (s, max) => Array.from(String(s ?? '').replace(/[\u0000-\u0009\u000b-\u001f\u007f\u200b-\u200f\u2028-\u202e\u2066-\u2069]/g, ' ').replace(/[ \t]+/g, ' ').replace(/\n{3,}/g, '\n\n').trim()).slice(0, max).join('');
const nom = (P) => (!P || P.nombre === 'Sin nombre' ? 'Alguien' : P.nombre.split(' ')[0]);
const mayus = (s) => String(s || '').charAt(0).toUpperCase() + String(s || '').slice(1);

/* ── el tono ─────────────────────────────────────────────────────────────── */
export function tonoDe(c) {
  const mio = (c.soyA ? c.tono_a : c.tono_b) || TONO_INICIAL, suyo = (c.soyA ? c.tono_b : c.tono_a) || TONO_INICIAL;
  return { mio, comun: tonoComun(mio, suyo) }; // el de la otra persona nunca sale de aquí
}
export async function ponerTono(env, c, yo, tono) {
  if (!TONO[tono]) return { error: 'Tono inválido', status: 400 };
  const antes = tonoDe(c), suyo = (c.soyA ? c.tono_b : c.tono_a) || TONO_INICIAL;
  await env.DB.prepare(`UPDATE charlas SET ${c.soyA ? 'tono_a' : 'tono_b'} = ? WHERE a = ? AND b = ?`).bind(tono, c.a, c.b).run();
  const comun = tonoComun(tono, suyo);
  if (comun !== antes.comun) {
    const sube = TONO[comun].nivel > TONO[antes.comun].nivel;
    const txt = comun === 'coqueteo' ? `💫 Los dos eligieron coqueteo. Con gusto y sin prisa: cualquiera de los dos puede bajarle cuando quiera. ⟨tono${Date.now().toString(36)}⟩`
      : comun === 'amistad' ? '🙂 El tono de la charla ahora es amistad. También se vale, y aquí nadie queda mal.'
      : sube ? '😊 El tono de la charla ahora es «conocernos».' : '😊 El tono de la charla regresó a «conocernos». Sin prisa.';
    await env.DB.prepare(`INSERT INTO mensajes (a, b, de, tipo, texto) VALUES (?, ?, 'sistema', 'sistema', ?)`).bind(c.a, c.b, txt).run();
    await avisarVivo(env, c.a, c.b, { t: 'mensaje', de: 'sistema', tipo: 'sistema', tono: comun });
    await anotar(env, 'chispa', sube ? `El tono de una charla subió a ${comun}` : `El tono de una charla bajó a ${comun}`, '');
    return { ok: true, tono: { mio: tono, comun }, cambio: sube ? comun : null };
  }
  return { ok: true, tono: { mio: tono, comun } };
}

/* ── armar una carta, un detalle o una invitación antes de que sea mensaje ── */
export async function prepararChispa(env, c, yo, otraId, b = {}) {
  const { comun } = tonoDe(c);
  if (b.tipo === 'carta') {
    const C = CARTA[String(b.carta || '')]; if (!C) return { error: 'Esa carta no existe', status: 400 };
    if (!alcanza(comun, C.tono)) return { error: 'Esa carta se abre cuando los dos elijan coqueteo.', status: 403 };
    const ya = await env.DB.prepare(`SELECT 1 AS v FROM mensajes WHERE a = ? AND b = ? AND tipo = 'carta' AND json_extract(archivo, '$.carta') = ?`).bind(c.a, c.b, C.id).first();
    if (ya) return { error: 'Esa carta ya salió en esta charla. Saca otra.', status: 409 };
    const pend = (await env.DB.prepare(`SELECT COUNT(*) AS n FROM mensajes m WHERE m.a = ? AND m.b = ? AND m.de = ? AND m.tipo = 'carta' AND NOT EXISTS (SELECT 1 FROM respuestas r WHERE r.mensaje = m.id AND r.persona = ?)`).bind(c.a, c.b, yo, otraId).first()).n;
    if (pend >= CARTAS_PENDIENTES) return { error: `Ya hay ${CARTAS_PENDIENTES} cartas tuyas esperando respuesta. Dale su tiempo.`, status: 429 };
    return { tipo: 'carta', texto: C.t, archivo: { carta: C.id }, vista: '🎴 ' + C.t, nov: { cat: 'chispa', ico: '🎴', v: 'sacó una carta para los dos', d: C.tipo === 'ab' ? `${C.a} o ${C.b}` : C.t } };
  }
  if (b.tipo === 'detalle') {
    const D = DETALLE[String(b.detalle || '')]; if (!D) return { error: 'Ese detalle no existe', status: 400 };
    if (!alcanza(comun, D.tono)) return { error: 'Ese detalle se abre cuando los dos elijan coqueteo.', status: 403 };
    const hoy = (await env.DB.prepare(`SELECT COUNT(*) AS n FROM mensajes WHERE a = ? AND b = ? AND de = ? AND tipo = 'detalle' AND creado > datetime('now', '-1 day')`).bind(c.a, c.b, yo).first()).n;
    if (hoy >= DETALLES_AL_DIA) return { error: 'Ya mandaste muchos detalles hoy. Un detalle vale más cuando no sobran.', status: 429 };
    const nota = limpio(b.nota, NOTA_MAX);
    return { tipo: 'detalle', texto: D.n, archivo: { detalle: D.id, ...(nota ? { nota } : {}) }, vista: `${D.i} ${D.n}`, nov: { cat: 'chispa', ico: D.i, v: D.v, d: nota } };
  }
  if (b.tipo === 'cita') {
    const P = PLAN[String(b.plan || '')]; if (!P) return { error: 'Elige un plan', status: 400 };
    const que = P.id === 'otro' ? limpio(b.que, 60) : P.n; if (!que) return { error: 'Cuéntale qué propones', status: 400 };
    const donde = limpio(b.donde, 80);
    let cuando = String(b.cuando || '');
    if (cuando) { if (!/^\d{4}-\d{2}-\d{2}T\d{2}:\d{2}$/.test(cuando) || Number.isNaN(Date.parse(cuando))) return { error: 'Esa fecha no se ve bien', status: 400 }; if (Date.parse(cuando) < Date.now() - 86400000) return { error: 'Esa fecha ya pasó', status: 400 }; }
    const pend = await env.DB.prepare(`SELECT 1 AS v FROM mensajes m WHERE m.a = ? AND m.b = ? AND m.tipo = 'cita' AND NOT EXISTS (SELECT 1 FROM respuestas r WHERE r.mensaje = m.id)`).bind(c.a, c.b).first();
    if (pend) return { error: 'Ya hay una invitación esperando respuesta en esta charla.', status: 409 };
    return { tipo: 'cita', texto: que, archivo: { plan: P.id, que, ...(donde ? { donde } : {}), ...(cuando ? { cuando } : {}) }, vista: `📅 ${que}`, nov: { cat: 'chispa', ico: '📅', v: 'te hizo una invitación', d: resumenCita({ que, donde, cuando }) } };
  }
  return { error: 'Tipo inválido', status: 400 };
}
// En el demo, la persona ficticia contesta sola las cartas de dos opciones: así el visitante ve cómo se abre
export async function trasEnviarChispa(env, mensajeId, O, p) {
  if (p.tipo === 'carta' && O?.origen === 'demo' && CARTA[p.archivo.carta]?.tipo === 'ab')
    await env.DB.prepare(`INSERT OR IGNORE INTO respuestas (mensaje, persona, valor) VALUES (?, ?, ?)`).bind(mensajeId, O.id, Math.random() < 0.5 ? 'a' : 'b').run();
}

/* ── responder una carta o una invitación ────────────────────────────────── */
const fechaBonita = (iso) => { try { return new Date(iso + ':00Z').toLocaleString('es-MX', { weekday: 'long', day: 'numeric', month: 'long', hour: 'numeric', minute: '2-digit', timeZone: 'UTC' }); } catch { return iso; } };
export const resumenCita = (a) => `${a.que}${a.donde ? `, en ${a.donde}` : ''}${a.cuando ? `, el ${fechaBonita(a.cuando)}` : ''}`;
export async function responder(env, c, yo, Yo, mensajeId, valor) {
  const m = await env.DB.prepare(`SELECT id, de, tipo, archivo FROM mensajes WHERE id = ? AND a = ? AND b = ? AND tipo IN ('carta', 'cita')`).bind(Number(mensajeId), c.a, c.b).first();
  if (!m) return { error: 'Eso ya no está en esta charla', status: 404 };
  const A = JSON.parse(m.archivo || '{}');
  if (m.tipo === 'carta') {
    const C = CARTA[A.carta]; if (!C) return { error: 'Esa carta ya no existe', status: 404 };
    const v = C.tipo === 'ab' ? (['a', 'b'].includes(valor) ? valor : '') : limpio(valor, RESPUESTA_MAX);
    if (!v) return { error: C.tipo === 'ab' ? 'Elige una de las dos' : 'Escribe tu respuesta', status: 400 };
    const r = await env.DB.prepare(`INSERT OR IGNORE INTO respuestas (mensaje, persona, valor) VALUES (?, ?, ?)`).bind(m.id, yo, v).run();
    if (!r.meta.changes) return { error: 'Ya respondiste esta carta', status: 409 };
    const listo = (await env.DB.prepare(`SELECT COUNT(*) AS n FROM respuestas WHERE mensaje = ?`).bind(m.id).first()).n >= 2;
    await avisarVivo(env, c.a, c.b, { t: 'juego', mensaje: m.id, de: yo, listo });
    return { ok: true, listo, nov: listo ? { cat: 'chispa', ico: '🎴', v: 'respondió la carta, y ya se abrió', d: C.t } : { cat: 'chispa', ico: '🎴', v: 'respondió una carta', d: `${C.t} · Se abre en cuanto respondas tú.` } };
  }
  // invitación: responde quien la recibió, y puede cambiar de opinión
  if (m.de === yo) return { error: 'Esa invitación la hiciste tú', status: 403 };
  if (!RESPUESTA_CITA[valor]) return { error: 'Respuesta inválida', status: 400 };
  const antes = await env.DB.prepare(`SELECT valor FROM respuestas WHERE mensaje = ? AND persona = ?`).bind(m.id, yo).first();
  if (antes?.valor === valor) return { ok: true };
  await env.DB.prepare(`INSERT INTO respuestas (mensaje, persona, valor) VALUES (?, ?, ?) ON CONFLICT(mensaje, persona) DO UPDATE SET valor = excluded.valor, creado = datetime('now')`).bind(m.id, yo, valor).run();
  const txt = valor === 'si' ? `📅 ¡Hay plan! ${resumenCita(A).replace(/\.$/, '')}. ⟨cita${m.id}x${Date.now().toString(36)}⟩`
    : antes?.valor === 'si' ? `El plan (${A.que}) quedó en pausa. Sin problema: aquí nadie apura a nadie.`
    : `${nom(Yo)} ${RESPUESTA_CITA[valor].dice}. Y está perfecto.`;
  await env.DB.prepare(`INSERT INTO mensajes (a, b, de, tipo, texto) VALUES (?, ?, 'sistema', 'sistema', ?)`).bind(c.a, c.b, txt).run();
  await avisarVivo(env, c.a, c.b, { t: 'juego', mensaje: m.id, de: yo, listo: true, cita: valor });
  await avisarVivo(env, c.a, c.b, { t: 'mensaje', de: 'sistema', tipo: 'sistema' });
  if (valor === 'si') await anotar(env, 'chispa', 'Dos personas quedaron de verse', A.plan || '');
  return { ok: true, listo: true, nov: valor === 'si' ? { cat: 'chispa', ico: '💛', v: 'dijo que sí a tu invitación', d: resumenCita(A) } : { cat: 'chispa', ico: '📅', v: 'respondió tu invitación', d: mayus(RESPUESTA_CITA[valor].dice) + '. Y está perfecto.' } };
}

/* ── el estado de cartas e invitaciones de toda la charla (cambia sobre mensajes viejos) ── */
export async function juegoDe(env, c, yo) {
  const filas = (await env.DB.prepare(`SELECT r.mensaje, r.persona, r.valor, m.tipo FROM respuestas r JOIN mensajes m ON m.id = r.mensaje WHERE m.a = ? AND m.b = ?`).bind(c.a, c.b).all()).results;
  const por = {};
  for (const f of filas) { const x = (por[f.mensaje] = por[f.mensaje] || { tipo: f.tipo }); if (f.persona === yo) x.mia = f.valor; else x.suyaCruda = f.valor; }
  const out = {};
  for (const [id, x] of Object.entries(por)) {
    if (x.tipo === 'cita') out[id] = { respuesta: x.mia ?? x.suyaCruda ?? null };
    else out[id] = { mia: x.mia ?? null, suyaLista: x.suyaCruda != null, suya: x.mia != null && x.suyaCruda != null ? x.suyaCruda : null }; // la suya solo se ve cuando ya está la mía
  }
  const usadas = (await env.DB.prepare(`SELECT json_extract(archivo, '$.carta') AS k FROM mensajes WHERE a = ? AND b = ? AND tipo = 'carta'`).bind(c.a, c.b).all()).results.map((f) => f.k).filter(Boolean);
  return { estados: out, usadas };
}

/* ── el álbum: todo lo que ya es de los dos ──────────────────────────────── */
export async function album(env, c, yo) {
  const arch = (await env.DB.prepare(`SELECT id, de, archivo, creado FROM mensajes WHERE a = ? AND b = ? AND tipo = 'archivo' AND archivo IS NOT NULL ORDER BY id DESC LIMIT 400`).bind(c.a, c.b).all()).results
    .map((m) => { const A = JSON.parse(m.archivo); return { id: m.id, mio: m.de === yo, mime: A.mime, nombre: A.nombre, tamano: A.tamano, vista: !!A.vista, duracion: A.duracion || null, creado: m.creado }; });
  const juego = (await env.DB.prepare(`SELECT m.id, m.de, m.tipo, m.archivo, m.creado FROM mensajes m WHERE m.a = ? AND m.b = ? AND m.tipo IN ('carta', 'cita') ORDER BY m.id DESC LIMIT 300`).bind(c.a, c.b).all()).results;
  const { estados } = await juegoDe(env, c, yo);
  const cartas = [], planes = [];
  for (const m of juego) {
    const A = JSON.parse(m.archivo || '{}'), e = estados[m.id];
    if (m.tipo === 'carta' && e?.mia != null && e?.suya != null) cartas.push({ id: m.id, carta: A.carta, mia: e.mia, suya: e.suya, creado: m.creado });
    if (m.tipo === 'cita' && e?.respuesta === 'si') planes.push({ id: m.id, ...A, mio: m.de === yo, creado: m.creado });
  }
  const hitos = (await env.DB.prepare(`SELECT texto, creado FROM mensajes WHERE a = ? AND b = ? AND tipo = 'sistema' AND texto LIKE '%⟨%' ORDER BY id ASC LIMIT 60`).bind(c.a, c.b).all()).results.map((h) => ({ texto: h.texto.replace(/\s*⟨[a-z0-9]+⟩/, ''), creado: h.creado }));
  return { desde: c.creada, archivos: arch, cartas, planes, hitos };
}
// fin · RLR
