/* ─────────────────────────────────────────────────────────────────────────────
   Cupido Algorítmico · El programa: confianza primero, monetización después
   Autor: Ricardo López Reyero
   Todo Cupido es gratis durante 2026 y 2027. Cada acción que algún día tendrá
   precio ya existe aquí con su etapa prevista y su precio de referencia, en
   estado "gratis"; Ricardo decide desde el admin cuándo se enciende cada una.
   Lo único que se puede pagar hoy es voluntario: el Fondo de atracción y
   Socio fundador. Reglas de la casa (CapitalTorreon): mismo precio para todos,
   sin anuncios, devoluciones sin preguntas, tope de cuidado.
   ───────────────────────────────────────────────────────────────────────────── */
// RLR
import { persona, anotar } from './datos.js';
import { correoA } from './correos.js';
import { precioPara, miPrecioJusto, BANDAS, SITUACIONES } from './precios.js';

export const _RLR = 'Ricardo López Reyero';
const _k = 'EYE', _rev = 181218;

export const ESQUEMA_PROGRAMA = [
  `CREATE TABLE IF NOT EXISTS programa (
     clave TEXT PRIMARY KEY, orden INTEGER NOT NULL, nombre TEXT NOT NULL, que TEXT NOT NULL, cuando TEXT NOT NULL,
     etapa TEXT NOT NULL, precio INTEGER NOT NULL DEFAULT 0, unidad TEXT NOT NULL DEFAULT '', estado TEXT NOT NULL DEFAULT 'gratis',
     actualizado TEXT NOT NULL DEFAULT (datetime('now')))`,
  `CREATE TABLE IF NOT EXISTS aportes (
     id INTEGER PRIMARY KEY AUTOINCREMENT, persona TEXT, correo TEXT, tipo TEXT NOT NULL, monto INTEGER NOT NULL,
     sid TEXT UNIQUE, estado TEXT NOT NULL DEFAULT 'pendiente', nombre_publico TEXT, creado TEXT NOT NULL DEFAULT (datetime('now')), confirmado TEXT)`,
];

// El mapa completo. "cuando" es la etapa prevista; se puede adelantar o atrasar desde el admin.
export const ACCIONES = [
  { clave: 'entrada', orden: 1, nombre: 'Entrada con seriedad', que: 'Terminar las 43 preguntas, verificar tu identidad y entrar al matching.', cuando: '2028', etapa: 'Etapa 2', precio: 690, unidad: 'una sola vez' },
  { clave: 'puerta', orden: 2, nombre: 'Abrir una puerta', que: 'Cuando los dos dicen que sí y nace la charla. La primera siempre será gratis.', cuando: '2028', etapa: 'Etapa 2', precio: 1490, unidad: 'por puerta, por persona' },
  { clave: 'mientras', orden: 3, nombre: 'Mientras esperas', que: 'Círculos por afinidad, diario guiado, lectura mensual de tu vida y salas por tema.', cuando: '2029', etapa: 'Etapa 3', precio: 199, unidad: 'al mes, cancelable en un clic' },
  { clave: 'acompanamiento', orden: 4, nombre: 'Acompañamiento', que: 'Sesiones con especialistas verificados: pareja, intimidad, fe, dinero. Cupido solo cobra comisión.', cuando: '2029', etapa: 'Etapa 3', precio: 0, unidad: 'precio del especialista' },
  { clave: 'comunidades', orden: 5, nombre: 'Comunidades propias', que: 'Un Cupido cerrado para tu parroquia, universidad o empresa, con el mismo motor.', cuando: '2030', etapa: 'Etapa 4', precio: 30000, unidad: 'al año, por institución' },
  { clave: 'regalo', orden: 6, nombre: 'Regalar Cupido', que: 'Pagar la entrada de alguien que quieres, con una carta.', cuando: '2028', etapa: 'Etapa 2', precio: 690, unidad: 'una sola vez' },
];
const PRECIO_MIN = 49, TOPE_MES = 5000;

export async function sembrarPrograma(env) {
  const n = (await env.DB.prepare(`SELECT COUNT(*) AS n FROM programa`).first()).n;
  if (n) return;
  await env.DB.batch(ACCIONES.map((a) => env.DB.prepare(`INSERT OR IGNORE INTO programa (clave, orden, nombre, que, cuando, etapa, precio, unidad, estado) VALUES (?, ?, ?, ?, ?, ?, ?, ?, 'gratis')`).bind(a.clave, a.orden, a.nombre, a.que, a.cuando, a.etapa, a.precio, a.unidad)));
}

async function secreto(v) { if (!v) return ''; if (typeof v === 'string') return v; try { return (await v.get()) || ''; } catch { return ''; } }

/* ── lo público: el mapa y la transparencia ──────────────────────────────── */
export async function verPrograma(env, P = null) {
  const acciones = (await env.DB.prepare(`SELECT clave, nombre, que, cuando, etapa, precio, unidad, estado FROM programa ORDER BY orden`).all()).results;
  const t = await env.DB.prepare(`SELECT COALESCE(SUM(monto), 0) AS reunido, COUNT(DISTINCT COALESCE(persona, correo)) AS personas, COALESCE(SUM(CASE WHEN tipo = 'socio' THEN 1 ELSE 0 END), 0) AS socios FROM aportes WHERE estado = 'confirmado'`).first();
  const ultimos = (await env.DB.prepare(`SELECT nombre_publico, tipo, monto, confirmado FROM aportes WHERE estado = 'confirmado' AND nombre_publico IS NOT NULL ORDER BY id DESC LIMIT 12`).all()).results;
  const pagos = !!(await secreto(env.STRIPE_SECRET_KEY));
  let mio = null;
  if (P) { let aj = {}; try { aj = JSON.parse(P.ajustes || '{}'); } catch {} mio = { ...miPrecioJusto(aj), acciones: Object.fromEntries(acciones.map((a) => [a.clave, precioPara(aj, a.precio)])), bandas: BANDAS, situaciones: SITUACIONES }; }
  return { gratisHasta: '2027', mio, acciones, fondo: { reunido: t.reunido, personas: t.personas, socios: t.socios, ultimos }, pagos, minimo: PRECIO_MIN, tope: TOPE_MES, destino: 'El 100 % del Fondo de atracción se usa para traer a la siguiente persona seria: anuncios cuidados, contenido y verificación de identidad. Se publica cada año en qué se gastó.' };
}

/* ── apoyar: Fondo de atracción (una vez) o Socio fundador (cada mes) ────── */
export async function apoyar(env, url, P, { tipo, monto, nombrePublico, volver }) {
  const stripe = await secreto(env.STRIPE_SECRET_KEY);
  if (!stripe) return { error: 'Los pagos se activan pronto. Gracias por querer apoyar.', status: 503 };
  if (!P?.correo) return { error: 'Para apoyar hace falta tu cuenta con correo.', status: 403 };
  tipo = tipo === 'socio' ? 'socio' : 'fondo';
  monto = Math.round(Number(monto) || 0);
  if (monto < PRECIO_MIN || monto > 100000) return { error: `El mínimo es ${PRECIO_MIN} pesos.`, status: 400 };
  const gastado = (await env.DB.prepare(`SELECT COALESCE(SUM(monto), 0) AS s FROM aportes WHERE persona = ? AND estado = 'confirmado' AND tipo = 'fondo' AND creado > datetime('now', '-30 days')`).bind(P.id).first()).s;
  if (tipo === 'fondo' && gastado + monto > TOPE_MES) return { error: 'Gracias: este mes ya diste mucho. Vuelve el mes que entra.', status: 400 };
  const nombre = String(nombrePublico || '').replace(/[<>]/g, '').trim().slice(0, 40) || null;
  const base = url.origin;
  let ok = base + '/persona'; try { const x = new URL(String(volver || ''), base); if (x.origin === base) ok = x.origin + x.pathname + x.hash; } catch {}
  const f = new URLSearchParams();
  f.set('mode', tipo === 'socio' ? 'subscription' : 'payment');
  f.set('success_url', base + '/persona?apoyo={CHECKOUT_SESSION_ID}#apoyar'); f.set('cancel_url', ok.includes('#') ? ok : ok + '#apoyar');
  f.set('line_items[0][quantity]', '1'); f.set('line_items[0][price_data][currency]', 'mxn'); f.set('line_items[0][price_data][unit_amount]', String(monto * 100));
  f.set('line_items[0][price_data][product_data][name]', tipo === 'socio' ? 'Cupido Algorítmico · Socio fundador · cada mes' : 'Cupido Algorítmico · Fondo de atracción');
  if (tipo === 'socio') f.set('line_items[0][price_data][recurring][interval]', 'month');
  f.set('metadata[persona]', P.id); f.set('metadata[tipo]', tipo); f.set('metadata[monto]', String(monto)); if (nombre) f.set('metadata[nombre]', nombre);
  if (tipo === 'socio') { f.set('subscription_data[metadata][persona]', P.id); f.set('subscription_data[metadata][tipo]', 'socio'); }
  f.set('locale', 'es-419'); f.set('customer_email', P.correo);
  let r, ses;
  try { r = await fetch('https://api.stripe.com/v1/checkout/sessions', { method: 'POST', headers: { authorization: 'Bearer ' + stripe, 'content-type': 'application/x-www-form-urlencoded' }, body: f, signal: AbortSignal.timeout(15000) }); ses = await r.json(); }
  catch (e) { return { error: 'No se pudo abrir el pago: ' + e.message, status: 502 }; }
  if (!r.ok || !ses.url) { console.error('stripe', JSON.stringify(ses).slice(0, 300)); return { error: 'No se pudo abrir el pago.', status: 502 }; }
  await env.DB.prepare(`INSERT OR IGNORE INTO aportes (persona, correo, tipo, monto, sid, estado, nombre_publico) VALUES (?, ?, ?, ?, ?, 'pendiente', ?)`).bind(P.id, P.correo, tipo, monto, ses.id, nombre).run();
  return { url: ses.url };
}

// Al volver: se le pregunta a Stripe si de verdad se pagó (una sola vez por sesión)
export async function confirmarApoyo(env, P, sid) {
  const stripe = await secreto(env.STRIPE_SECRET_KEY);
  if (!stripe || !/^cs_[A-Za-z0-9_]{10,200}$/.test(String(sid || ''))) return { error: 'Datos inválidos', status: 400 };
  const fila = await env.DB.prepare(`SELECT * FROM aportes WHERE sid = ?`).bind(sid).first();
  if (!fila || fila.persona !== P.id) return { error: 'No encuentro ese apoyo', status: 404 };
  if (fila.estado === 'confirmado') return { ok: true, ya: true, tipo: fila.tipo, monto: fila.monto };
  let r, ses;
  try { r = await fetch('https://api.stripe.com/v1/checkout/sessions/' + sid, { headers: { authorization: 'Bearer ' + stripe }, signal: AbortSignal.timeout(15000) }); ses = await r.json(); }
  catch (e) { return { error: 'Stripe no respondió', status: 502 }; }
  const pagado = r.ok && (ses.payment_status === 'paid' || (ses.mode === 'subscription' && ses.status === 'complete'));
  if (!pagado) return { error: 'El pago no se completó', status: 402 };
  await env.DB.prepare(`UPDATE aportes SET estado = 'confirmado', confirmado = datetime('now') WHERE sid = ?`).bind(sid).run();
  await anotar(env, 'programa', fila.tipo === 'socio' ? 'Alguien se volvió Socio fundador' : 'Alguien aportó al Fondo de atracción', `${fila.monto} MXN`);
  const Pp = await persona(env, P.id);
  if (Pp?.correo) await correoA(env, Pp, 'gracias', { tipo: fila.tipo, monto: fila.monto }, { forzar: true });
  return { ok: true, tipo: fila.tipo, monto: fila.monto };
}

/* ── admin: mover el mapa ────────────────────────────────────────────────── */
export async function ajustarPrograma(env, { clave, estado, cuando, precio }) {
  const fila = await env.DB.prepare(`SELECT clave FROM programa WHERE clave = ?`).bind(String(clave || '')).first();
  if (!fila) return { error: 'No existe esa acción', status: 404 };
  const e = ['gratis', 'cobrando'].includes(estado) ? estado : null;
  const c = /^20\d\d( ·.*)?$/.test(String(cuando || '')) ? String(cuando).slice(0, 30) : null;
  const p = Number.isFinite(Number(precio)) ? Math.max(0, Math.round(Number(precio))) : null;
  await env.DB.prepare(`UPDATE programa SET estado = COALESCE(?, estado), cuando = COALESCE(?, cuando), precio = COALESCE(?, precio), actualizado = datetime('now') WHERE clave = ?`).bind(e, c, p, fila.clave).run();
  await anotar(env, 'admin', 'Se ajustó el programa', `${fila.clave}: ${e || ''} ${c || ''} ${p ?? ''}`.trim());
  return { ok: true };
}
export async function distribucionPrecios(env) {
  const filas = (await env.DB.prepare(`SELECT ajustes FROM personas WHERE pool = 'real'`).all()).results;
  const d = { bandas: {}, situaciones: {}, total: filas.length, declarado: 0 };
  for (const f of filas) { let aj = {}; try { aj = JSON.parse(f.ajustes || '{}'); } catch {} if (aj.banda) { d.declarado++; d.bandas[aj.banda] = (d.bandas[aj.banda] || 0) + 1; } const s = aj.situacion || 'bien'; d.situaciones[s] = (d.situaciones[s] || 0) + 1; }
  return d;
}
export async function aportesAdmin(env) {
  return (await env.DB.prepare(`SELECT id, persona, correo, tipo, monto, estado, nombre_publico, creado, confirmado FROM aportes ORDER BY id DESC LIMIT 100`).all()).results;
}
// fin · RLR
