/* ─────────────────────────────────────────────────────────────────────────────
   Cupido Algorítmico · Acceso: enlace mágico por correo y cuenta demo
   Autor: Ricardo López Reyero
   Sin contraseñas. Tu correo es tu cuenta: te mandamos un enlace, lo abres y
   ya estás dentro. Y el demo está a un clic: una sesión sobre una persona
   ficticia, con el interruptor "cuenta demo" siempre encendido.
   ───────────────────────────────────────────────────────────────────────────── */
// RLR
import { persona, anotar } from './datos.js';

export const _RLR = 'Ricardo López Reyero';
const _k = 'EYE', _rev = 181218;

export const COOKIE = 'cupido_s';
export const DEMO_ID = 'h01'; // Diego: dos coincidencias, una puerta abierta y una que espera su respuesta
const DIAS_SESION = 90, MIN_ENLACE = 20;

const aleatorio = (n = 24) => [...crypto.getRandomValues(new Uint8Array(n))].map((b) => b.toString(36).padStart(2, '0')).join('').slice(0, n + 8);
async function hash(txt) {
  const h = await crypto.subtle.digest('SHA-256', new TextEncoder().encode(txt));
  return [...new Uint8Array(h)].slice(0, 12).map((b) => b.toString(16).padStart(2, '0')).join('');
}
export const correoValido = (c) => /^[^\s@]{1,64}@[^\s@]{1,190}\.[a-z]{2,}$/i.test(c);
export const normalizar = (c) => String(c || '').trim().toLowerCase().slice(0, 254);

/* ── cookie ──────────────────────────────────────────────────────────────── */
export function cookieSesion(id, url, borrar = false) {
  const segura = url.protocol === 'https:' ? '; Secure' : '';
  return `${COOKIE}=${borrar ? '' : id}; Path=/; HttpOnly; SameSite=Lax${segura}; Max-Age=${borrar ? 0 : DIAS_SESION * 86400}`;
}
const leerCookie = (req) => (req.headers.get('cookie') || '').split(/;\s*/).map((c) => c.split('=')).find(([k]) => k === COOKIE)?.[1] || null;

/* ── ¿quién es? (null si no hay sesión) ──────────────────────────────────── */
export async function quien(env, req) {
  const id = leerCookie(req);
  if (!id || !/^[a-z0-9]{20,40}$/.test(id)) return null;
  const s = await env.DB.prepare(`SELECT * FROM sesiones WHERE id = ?`).bind(id).first();
  if (!s) return null;
  const P = await persona(env, s.persona);
  if (!P) { await env.DB.prepare(`DELETE FROM sesiones WHERE id = ?`).bind(id).run(); return null; }
  if (Math.random() < 0.1) await env.DB.prepare(`UPDATE sesiones SET usada = datetime('now') WHERE id = ?`).bind(id).run();
  return { P, sesion: { id, demo: !!s.demo || P.pool === 'demo', correo: s.demo ? null : P.correo || null } };
}

export async function crearSesion(env, personaId, demo) {
  const id = aleatorio(24);
  await env.DB.prepare(`INSERT INTO sesiones (id, persona, demo) VALUES (?, ?, ?)`).bind(id, personaId, demo ? 1 : 0).run();
  return id;
}
export async function cerrarSesion(env, req) {
  const id = leerCookie(req);
  if (id) await env.DB.prepare(`DELETE FROM sesiones WHERE id = ?`).bind(id).run();
}

/* ── cuenta demo: a un clic, siempre limpia ──────────────────────────────── */
// Cada entrada al demo regresa las puertas de la persona demo a su estado de
// muestra, para que cualquiera viva los tres momentos: una puerta abierta,
// una coincidencia esperando su respuesta y un sí guardado.
const PUERTAS_DEMO = [
  ['h01', 'm01', 'si', 'si'],   // Diego y Mariana: la puerta ya se abrió (se lee su carta)
  ['h01', 'm07', null, 'si'],   // Daniela ya dijo que sí; Diego no lo sabe: si dice que sí, se abre al instante
];
export async function entrarDemo(env, personaId = DEMO_ID) {
  const P = await persona(env, personaId);
  if (!P || P.pool !== 'demo') throw new Error('No existe esa persona del demo');
  if (personaId === DEMO_ID) await limpiarDemo(env);
  const id = await crearSesion(env, personaId, true);
  await anotar(env, 'acceso', 'Alguien entró a la cuenta demo', P.nombre);
  return id;
}
async function limpiarDemo(env) {
  const D = DEMO_ID;
  const stmts = [
    env.DB.prepare(`UPDATE personas SET estado = 'activa' WHERE id = ?`).bind(D),
    env.DB.prepare(`UPDATE puertas SET decision_a = NULL, decision_b = NULL, estado = 'cerrada', abierta = NULL WHERE a = ? OR b = ?`).bind(D, D),
    env.DB.prepare(`DELETE FROM avisos WHERE persona = ? OR otra = ?`).bind(D, D),
  ];
  for (const [a, b, da, db] of PUERTAS_DEMO) {
    const abierta = da === 'si' && db === 'si';
    stmts.push(env.DB.prepare(`UPDATE puertas SET decision_a = ?, decision_b = ?, estado = ?, abierta = CASE WHEN ? THEN datetime('now', '-2 days') ELSE NULL END WHERE a = ? AND b = ?`)
      .bind(da, db, abierta ? 'abierta' : 'cerrada', abierta ? 1 : 0, a, b));
  }
  await env.DB.batch(stmts);
  // vuelve a avisar lo que corresponde (coincidencias y la puerta abierta), con fechas de muestra
  const puertas = (await env.DB.prepare(`SELECT * FROM puertas WHERE a = ? OR b = ?`).bind(D, D).all()).results;
  const avisos = [];
  for (const p of puertas) {
    for (const [yo, otra] of [[p.a, p.b], [p.b, p.a]])
      avisos.push(env.DB.prepare(`INSERT INTO avisos (persona, tipo, texto, otra, pct, leido, creado) VALUES (?, 'coincidencia', ?, ?, ?, ?, datetime('now', '-3 days'))`)
        .bind(yo, `Apareció alguien al ${p.pct} % contigo. La puerta está cerrada hasta que los dos digan que sí.`, otra, p.pct, yo === D ? 1 : 0));
    if (p.estado === 'abierta') {
      const [A, B] = [await persona(env, p.a), await persona(env, p.b)];
      const nom = (X) => X.nombre.split(' ')[0];
      avisos.push(env.DB.prepare(`INSERT INTO avisos (persona, tipo, texto, otra, leido, creado) VALUES (?, 'apertura', ?, ?, 0, datetime('now', '-2 days'))`).bind(p.a, `Se abrió la puerta con ${nom(B)}. Los dos dijeron que sí.`, p.b));
      avisos.push(env.DB.prepare(`INSERT INTO avisos (persona, tipo, texto, otra, leido, creado) VALUES (?, 'apertura', ?, ?, 0, datetime('now', '-2 days'))`).bind(p.b, `Se abrió la puerta con ${nom(A)}. Los dos dijeron que sí.`, p.a));
    }
  }
  if (avisos.length) await env.DB.batch(avisos);
}

/* ── enlace mágico ───────────────────────────────────────────────────────── */
export async function pedirEnlace(env, req, url, correoCrudo) {
  const correo = normalizar(correoCrudo);
  if (!correoValido(correo)) return { ok: false, error: 'Ese correo no se ve bien. Revísalo.' };
  const ip = req.headers.get('cf-connecting-ip') || '';
  const ipHash = ip ? await hash(ip + _k) : null;
  const n = await env.DB.prepare(`SELECT
      (SELECT COUNT(*) FROM enlaces WHERE correo = ? AND creado > datetime('now', '-1 hour')) AS porCorreo,
      (SELECT COUNT(*) FROM enlaces WHERE ip_hash = ? AND creado > datetime('now', '-1 hour')) AS porIp`).bind(correo, ipHash).first();
  if (n.porCorreo >= 4 || n.porIp >= 12) return { ok: false, error: 'Ya te mandamos varios enlaces. Revisa tu correo (y el spam) o espera un rato.' };
  const token = aleatorio(28);
  await env.DB.prepare(`INSERT INTO enlaces (token, correo, ip_hash) VALUES (?, ?, ?)`).bind(token, correo, ipHash).run();
  const enlace = new URL(`/entrar/${token}`, url).href;
  const existe = await env.DB.prepare(`SELECT id FROM personas WHERE correo = ?`).bind(correo).first();
  const mandado = await mandarCorreo(env, correo, existe ? 'Tu enlace para entrar a Cupido Algorítmico' : 'Tu cuenta en Cupido Algorítmico', correoEnlace(enlace, !existe));
  await anotar(env, 'acceso', existe ? 'Alguien pidió su enlace para entrar' : 'Alguien pidió crear su cuenta', await hash(correo));
  if (mandado === 'sin_remitente') {
    // Solo en desarrollo local se enseña el enlace en pantalla; en producción sin llave no se entra por correo
    if (['localhost', '127.0.0.1'].includes(url.hostname)) return { ok: true, correo, enlace, sinCorreo: true };
    return { ok: false, error: 'El envío de correos aún no está activado. Mientras tanto, entra a la cuenta demo.' };
  }
  if (!mandado) return { ok: false, error: 'No pudimos mandar el correo. Intenta de nuevo en un momento.' };
  return { ok: true, correo };
}

export async function canjearEnlace(env, token) {
  if (!/^[a-z0-9]{20,40}$/.test(String(token))) return { ok: false, motivo: 'inválido' };
  const e = await env.DB.prepare(`SELECT * FROM enlaces WHERE token = ?`).bind(token).first();
  if (!e) return { ok: false, motivo: 'inválido' };
  if (e.usado) return { ok: false, motivo: 'usado' };
  const vivo = await env.DB.prepare(`SELECT 1 AS v FROM enlaces WHERE token = ? AND creado > datetime('now', ?)`).bind(token, `-${MIN_ENLACE} minutes`).first();
  if (!vivo) return { ok: false, motivo: 'vencido' };
  await env.DB.prepare(`UPDATE enlaces SET usado = datetime('now') WHERE token = ?`).bind(token).run();
  let P = await env.DB.prepare(`SELECT * FROM personas WHERE correo = ?`).bind(e.correo).first();
  let nueva = false;
  if (!P) {
    nueva = true;
    const id = 'r' + Date.now().toString(36) + Math.random().toString(36).slice(2, 5);
    const COLORES = ['#d6455f', '#e07a4e', '#8a6bbf', '#2f8f83', '#1d4ed8', '#0891b2', '#be185d', '#15803d', '#a16207', '#6d28d9'];
    await env.DB.prepare(`INSERT INTO personas (id, pool, nombre, correo, color, respuestas, origen, estado, completo) VALUES (?, 'real', 'Sin nombre', ?, ?, '{}', 'correo', 'activa', 0)`)
      .bind(id, e.correo, COLORES[Math.floor(Math.random() * COLORES.length)]).run();
    await anotar(env, 'acceso', 'Se creó una cuenta nueva', await hash(e.correo));
    P = await env.DB.prepare(`SELECT * FROM personas WHERE id = ?`).bind(id).first();
  } else await anotar(env, 'acceso', 'Alguien entró con su enlace', P.nombre);
  const sesion = await crearSesion(env, P.id, false);
  return { ok: true, sesion, nueva, completo: !!P.completo };
}

/* ── correo (Resend) ─────────────────────────────────────────────────────── */
function correoEnlace(enlace, nueva) {
  const t = (s) => s.replace(/[<>&]/g, (c) => ({ '<': '&lt;', '>': '&gt;', '&': '&amp;' }[c]));
  return {
    html: `<div style="font-family:Inter,Helvetica,Arial,sans-serif;max-width:520px;margin:0 auto;padding:28px 20px;color:#211d24">
      <p style="font-size:22px;margin:0 0 6px">💘 <b>Cupido Algorítmico</b></p>
      <h1 style="font-family:Georgia,serif;font-weight:600;font-size:26px;margin:18px 0 10px">${nueva ? 'Tu cuenta está lista' : 'Tu enlace para entrar'}</h1>
      <p style="font-size:16px;line-height:1.6;margin:0 0 20px">${nueva ? 'No hay contraseña que recordar: tu correo es tu cuenta. Abre este enlace para empezar tu cuestionario.' : 'Abre este enlace y entras directo a tu tablero. Sin contraseña.'}</p>
      <p style="margin:0 0 22px"><a href="${t(enlace)}" style="display:inline-block;background:#d6455f;color:#fff;text-decoration:none;font-weight:600;padding:14px 24px;border-radius:999px">Entrar a mi tablero →</a></p>
      <p style="font-size:13.5px;color:#75707c;line-height:1.6;margin:0">El enlace vale ${MIN_ENLACE} minutos y se usa una sola vez. Si tú no lo pediste, ignora este correo: nadie puede entrar sin él.</p>
      <p style="font-size:12px;color:#a09aa6;margin:22px 0 0;word-break:break-all">Si el botón no abre: ${t(enlace)}</p></div>`,
    text: `${nueva ? 'Tu cuenta en Cupido Algorítmico está lista.' : 'Tu enlace para entrar a Cupido Algorítmico.'}\n\nAbre este enlace (vale ${MIN_ENLACE} minutos, se usa una sola vez):\n${enlace}\n\nSi tú no lo pediste, ignora este correo.`,
  };
}

async function mandarCorreo(env, para, asunto, { html, text }) {
  if (!env.RESEND_KEY || !env.FROM_EMAIL) { console.warn('Sin RESEND_KEY/FROM_EMAIL: el enlace se muestra en pantalla (solo desarrollo)'); return 'sin_remitente'; }
  try {
    const r = await fetch('https://api.resend.com/emails', {
      method: 'POST',
      headers: { Authorization: `Bearer ${env.RESEND_KEY}`, 'Content-Type': 'application/json' },
      body: JSON.stringify({ from: env.FROM_EMAIL, to: [para], subject: asunto, html, text }),
      signal: AbortSignal.timeout(15000),
    });
    if (!r.ok) { console.error('Resend', r.status, await r.text()); await anotar(env, 'sistema', 'No salió un correo', `${asunto} · ${r.status}`); return null; }
    return (await r.json())?.id || true;
  } catch (e) { console.error('Resend falló', e.message); await anotar(env, 'sistema', 'No salió un correo', e.message); return null; }
}
// fin · RLR
