// Cupido Algorítmico · pruebas del libro de cobros — RLR · Ricardo López Reyero
// Uso: node scripts/pruebas-pagos.mjs   (sale con código 1 si algo se rompe)
// Corre el código de verdad (src/pagos.js) contra una base en memoria y un Stripe de mentira que entrega
// los eventos como los entrega el de verdad: repetidos, fuera de orden, por páginas, con fallas y mezclados
// con los de otras casas. La regla que se prueba: ningún peso sin anotar y ninguno anotado dos veces.
import assert from 'node:assert/strict';
import { createHmac } from 'node:crypto';
import { DatabaseSync } from 'node:sqlite';
import * as pagos from '../src/pagos.js';

/* ── una base como la de Cloudflare (D1), en memoria ── */
function base() {
  const db = new DatabaseSync(':memory:');
  const limpio = (v) => v.map((x) => (x === undefined ? null : typeof x === 'boolean' ? (x ? 1 : 0) : x));
  const prepare = (sql) => {
    let args = [];
    const st = {
      bind: (...v) => { args = limpio(v); return st; },
      first: async () => db.prepare(sql).get(...args) ?? null,
      all: async () => ({ results: db.prepare(sql).all(...args) }),
      run: async () => ({ meta: { changes: Number(db.prepare(sql).run(...args).changes) } }),
    };
    return st;
  };
  for (const q of [
    `CREATE TABLE personas (id TEXT PRIMARY KEY)`,
    `CREATE TABLE bitacora (id INTEGER PRIMARY KEY AUTOINCREMENT, tipo TEXT NOT NULL, accion TEXT NOT NULL, detalle TEXT, creado TEXT NOT NULL DEFAULT (datetime('now')))`,
    `CREATE TABLE aportes (id INTEGER PRIMARY KEY AUTOINCREMENT, persona TEXT, correo TEXT, tipo TEXT NOT NULL, monto INTEGER NOT NULL, sid TEXT UNIQUE,
       estado TEXT NOT NULL DEFAULT 'pendiente', nombre_publico TEXT, creado TEXT NOT NULL DEFAULT (datetime('now')), confirmado TEXT)`,
    ...pagos.ESQUEMA_PAGOS, ...pagos.MIGRAR_PAGOS,
  ]) db.exec(q);
  return { prepare, sql: (q, ...v) => db.prepare(q).all(...v), uno: (q, ...v) => db.prepare(q).get(...v), exec: (q) => db.exec(q) };
}

/* ── un Stripe de mentira ── */
let serie = 0;
const clave = (p) => `${p}_${String(++serie).padStart(6, '0')}prueba`;
const hoy = () => Math.floor(Date.now() / 1000);
function mundo() {
  const DB = base();
  const S = { eventos: [], sesiones: {}, subs: {}, facturas: {}, cargos: {}, devoluciones: [], llamadas: [], falla: null, gracias: [], bajas: [] };
  const env = {
    DB,
    STRIPE_API: async (metodo, ruta) => {
      S.llamadas.push(`${metodo} ${ruta.split('?')[0]}`);
      if (S.falla && S.falla(metodo, ruta)) return { ok: false, status: 500, j: { error: { message: 'Stripe se cayó' } } };
      const u = new URL('https://stripe.test' + ruta), q = u.searchParams, par = u.pathname.split('/').filter(Boolean);
      const da = (x) => (x ? { ok: true, status: 200, j: x } : { ok: false, status: 404, j: { error: { code: 'resource_missing' } } });
      const pagina = (l) => { const desp = q.get('starting_after'); let i = 0; if (desp) i = l.findIndex((x) => x.id === desp) + 1; const lim = Number(q.get('limit')) || 10; return { ok: true, status: 200, j: { data: l.slice(i, i + lim), has_more: i + lim < l.length } }; };
      if (par[0] === 'events' && par[1]) return da(S.eventos.find((e) => e.id === par[1]));
      if (par[0] === 'events') { const gte = Number(q.get('created[gte]')) || 0, tipos = q.getAll('types[]'); return pagina(S.eventos.filter((e) => e.created >= gte && (!tipos.length || tipos.includes(e.type))).sort((a, b) => (b.created - a.created) || (a.id < b.id ? 1 : -1))); }
      if (par[0] === 'checkout' && par[1] === 'sessions') return da(S.sesiones[par[2]]);
      if (par[0] === 'subscriptions' && metodo === 'DELETE') { const s = S.subs[par[1]]; if (!s) return da(null); s.status = 'canceled'; s.canceled_at = s.ended_at = hoy(); evento('customer.subscription.deleted', s); return da(s); }
      if (par[0] === 'subscriptions') return da(S.subs[par[1]]);
      if (par[0] === 'invoices') return pagina(Object.values(S.facturas).filter((f) => f.subscription === q.get('subscription')));
      if (par[0] === 'charges') return da(S.cargos[par[1]]);
      if (par[0] === 'refunds') { const ch = q.get('charge'), gte = Number(q.get('created[gte]')) || 0; return pagina(S.devoluciones.filter((r) => (ch ? r.charge === ch : r.created >= gte))); }
      return { ok: false, status: 400, j: {} };
    },
  };
  const op = { alConfirmar: async (x) => { S.gracias.push(x); }, alDarDeBaja: async (x) => { S.bajas.push(x); } };
  const copia = (o) => JSON.parse(JSON.stringify(o));
  // un evento, con la hora que se le diga (por omisión, ahora) y una copia del objeto como estaba en ese momento
  function evento(type, objeto, created = hoy()) { const e = { id: clave('evt'), type, created, data: { object: copia(objeto) } }; S.eventos.push(e); return e; }
  const persona = (id) => { DB.exec(`INSERT OR IGNORE INTO personas (id) VALUES ('${id}')`); return id; };

  // Una persona aporta una vez al Fondo
  function fondo(id, monto, cuando = hoy(), nuestro = true) {
    const ses = { id: clave('cs'), mode: 'payment', status: 'complete', payment_status: 'paid', amount_total: monto * 100, payment_intent: clave('pi'), customer: clave('cus'), created: cuando, metadata: nuestro ? { app: 'cupido', persona: id, tipo: 'fondo' } : { app: 'mina' } };
    const cargo = { id: clave('ch'), amount: monto * 100, amount_refunded: 0, payment_intent: ses.payment_intent, customer: ses.customer, metadata: ses.metadata };
    S.sesiones[ses.id] = ses; S.cargos[cargo.id] = cargo;
    if (nuestro) DB.exec(`INSERT INTO aportes (persona, correo, tipo, monto, sid) VALUES ('${persona(id)}', '${id}@cupido.test', 'fondo', ${monto}, '${ses.id}')`);
    return { ses, cargo, ev: evento('checkout.session.completed', ses, cuando) };
  }
  // Una persona se vuelve socio: nacen la suscripción, su primera factura y la sesión
  function socio(id, monto, cuando = hoy(), { nuevoFormato = false, nuestro = true } = {}) {
    const meta = nuestro ? { app: 'cupido', persona: id, tipo: 'socio' } : { app: 'otra-casa' };
    const sub = { id: clave('sub'), status: 'active', customer: clave('cus'), created: cuando, start_date: cuando, cancel_at_period_end: false, metadata: meta, items: { data: [{ price: { unit_amount: monto * 100 }, quantity: 1, current_period_end: cuando + 30 * 86400 }] } };
    if (!nuevoFormato) sub.current_period_end = cuando + 30 * 86400;
    S.subs[sub.id] = sub;
    const fac = factura(sub, monto, 'subscription_create', cuando, nuevoFormato);
    const ses = { id: clave('cs'), mode: 'subscription', status: 'complete', payment_status: 'paid', amount_total: monto * 100, subscription: sub.id, invoice: fac.f.id, customer: sub.customer, created: cuando, metadata: meta };
    S.sesiones[ses.id] = ses;
    if (nuestro) DB.exec(`INSERT INTO aportes (persona, correo, tipo, monto, sid) VALUES ('${persona(id)}', '${id}@cupido.test', 'socio', ${monto}, '${ses.id}')`);
    return { sub, ses, fac: fac.f, cargo: fac.cargo, evSub: evento('customer.subscription.created', sub, cuando), evFac: fac.ev, evSes: evento('checkout.session.completed', ses, cuando) };
  }
  // Una mensualidad. Stripe cambió de lugar algunos datos en sus versiones nuevas: se prueban las dos formas
  function factura(sub, monto, razon, cuando = hoy(), nuevoFormato = false) {
    const cargo = { id: clave('ch'), amount: monto * 100, amount_refunded: 0, payment_intent: clave('pi'), customer: sub.customer, metadata: {} };
    const f = { id: clave('in'), customer: sub.customer, amount_paid: monto * 100, billing_reason: razon, created: cuando, status: 'paid', status_transitions: { paid_at: cuando }, lines: { data: [{ period: { end: cuando + 30 * 86400 }, metadata: sub.metadata }] } };
    if (nuevoFormato) f.parent = { subscription_details: { subscription: sub.id, metadata: sub.metadata } };
    else { f.subscription = sub.id; f.subscription_details = { metadata: sub.metadata }; f.payment_intent = cargo.payment_intent; f.charge = cargo.id; cargo.invoice = f.id; }
    S.facturas[f.id] = f; S.cargos[cargo.id] = cargo;
    return { f, cargo, ev: evento('invoice.paid', f, cuando) };
  }
  // Una devolución: nace el reembolso y Stripe avisa de las dos maneras
  function devolver(cargo, monto, { conLista = false, estado = 'succeeded', cuando = hoy() } = {}) {
    const re = { id: clave('re'), amount: monto * 100, charge: cargo.id, payment_intent: cargo.payment_intent, status: estado, created: cuando };
    S.devoluciones.push(re); if (estado === 'succeeded') cargo.amount_refunded += monto * 100;
    const ch = copia(cargo); if (conLista) ch.refunds = { data: S.devoluciones.filter((r) => r.charge === cargo.id) };
    return { re, evRe: evento('refund.created', re, cuando), evCh: evento('charge.refunded', ch, cuando) };
  }
  const cuenta = async () => {
    const libro = DB.sql(`SELECT id, clase, tipo, centavos, persona, de FROM cobros ORDER BY cuando, id`);
    return { libro, neto: libro.reduce((s, c) => s + c.centavos, 0) / 100, cobros: libro.filter((c) => c.clase === 'cobro').length, ingreso: (await pagos.ingresoDe(env, 30)).total, socios: (await pagos.sociosVivos(env)).vivos };
  };
  const jalar = (o = {}) => pagos.jalarEventos(env, { ...op, ...o });
  const procesar = (e, via = 'aviso') => pagos.procesarEvento(env, copia(e), via, op);
  return { env, DB, S, op, evento, persona, fondo, socio, factura, devolver, cuenta, jalar, procesar, copia };
}

let ok = 0;
const prueba = async (nombre, fn) => { try { await fn(); ok++; console.log('✓', nombre); } catch (e) { console.error('✗', nombre, '\n ', e.stack || e.message); process.exitCode = 1; } };

/* ═══ un pago de una vez ═══ */
await prueba('un aporte al Fondo se anota una vez, llegue por el aviso, al volver o en el jalón', async () => {
  const m = mundo(), { ses, ev } = m.fondo('ana', 299);
  assert.equal(await m.procesar(ev), 'hecho');
  assert.equal(await m.procesar(ev), 'repetido');                                            // el mismo aviso otra vez
  assert.equal((await pagos.confirmarSesion(m.env, ses, hoy(), null, m.op)).nuevo, false);    // la persona vuelve del pago
  await m.jalar();                                                                            // y además lo trae el jalón
  const c = await m.cuenta();
  assert.equal(c.cobros, 1); assert.equal(c.neto, 299); assert.equal(c.ingreso, 299);
  assert.equal(m.S.gracias.length, 1, 'se agradece una sola vez');
  assert.equal(m.DB.uno(`SELECT estado FROM aportes WHERE sid = ?`, ses.id).estado, 'confirmado');
});

await prueba('si la persona vuelve antes que el aviso, tampoco se duplica', async () => {
  const m = mundo(), { ses, ev } = m.fondo('beto', 99);
  assert.equal((await pagos.confirmarSesion(m.env, ses, hoy(), null, m.op)).nuevo, true);
  assert.equal(await m.procesar(ev), 'hecho');
  const c = await m.cuenta();
  assert.equal(c.cobros, 1); assert.equal(c.neto, 99); assert.equal(m.S.gracias.length, 1);
});

await prueba('dos caminos al mismo tiempo confirman el mismo apoyo: un cobro y un solo agradecimiento', async () => {
  const m = mundo(), { ses, ev } = m.fondo('caro', 499);
  await Promise.all([m.procesar(ev), pagos.confirmarSesion(m.env, ses, hoy(), null, m.op), m.procesar(ev, 'jalon')]);
  const c = await m.cuenta();
  assert.equal(c.cobros, 1); assert.equal(c.neto, 499); assert.equal(m.S.gracias.length, 1);
});

await prueba('una sesión que no se pagó no anota nada, y la que venció queda como vencida', async () => {
  const m = mundo(), { ses } = m.fondo('dani', 199);
  const sinPagar = { ...ses, status: 'open', payment_status: 'unpaid' };
  assert.equal((await pagos.confirmarSesion(m.env, sinPagar, hoy(), null, m.op)).ok, false);
  await m.procesar(m.evento('checkout.session.expired', { ...sinPagar, status: 'expired' }));
  assert.equal((await m.cuenta()).cobros, 0);
  assert.equal(m.DB.uno(`SELECT estado FROM aportes WHERE sid = ?`, ses.id).estado, 'vencido');
  assert.equal(m.S.gracias.length, 0);
});

/* ═══ socios: alta, renovación y baja ═══ */
await prueba('el alta de un socio anota una sola mensualidad aunque lleguen tres eventos por ella', async () => {
  const m = mundo(), a = m.socio('eva', 199);
  for (const e of [a.evSub, a.evFac, a.evSes]) assert.equal(await m.procesar(e), 'hecho');
  const c = await m.cuenta();
  assert.equal(c.cobros, 1, 'la sesión y la factura son el mismo cobro'); assert.equal(c.neto, 199); assert.equal(c.socios, 1);
  assert.equal(m.S.gracias.length, 1);
});

await prueba('los mismos eventos en cualquier orden dan el mismo libro', async () => {
  const ordenes = [[0, 1, 2], [0, 2, 1], [1, 0, 2], [1, 2, 0], [2, 0, 1], [2, 1, 0]];
  for (const o of ordenes) {
    const m = mundo(), a = m.socio('fer', 99), evs = [a.evSub, a.evFac, a.evSes];
    for (const i of o) await m.procesar(evs[i]);
    const c = await m.cuenta();
    assert.equal(c.cobros, 1, `orden ${o}`); assert.equal(c.neto, 99, `orden ${o}`); assert.equal(c.socios, 1, `orden ${o}`); assert.equal(m.S.gracias.length, 1, `orden ${o}`);
    assert.equal(m.DB.uno(`SELECT persona FROM cobros`).persona, 'fer', `orden ${o}: se sabe de quién es`);
  }
});

await prueba('cada renovación se anota: tres meses son tres cobros', async () => {
  const m = mundo(), a = m.socio('gil', 199, hoy() - 61 * 86400);
  const r1 = m.factura(a.sub, 199, 'subscription_cycle', hoy() - 31 * 86400), r2 = m.factura(a.sub, 199, 'subscription_cycle', hoy() - 86400);
  for (const e of [a.evSes, a.evFac, a.evSub, r1.ev, r2.ev, r1.ev, r2.ev]) await m.procesar(e);
  const c = await m.cuenta();
  assert.equal(c.cobros, 3); assert.equal(c.neto, 597);
  assert.equal(c.ingreso, 199, 'en los últimos 30 días solo entró la última mensualidad');
});

await prueba('las facturas con la forma nueva de Stripe (sin cargo ni intento a la vista) también se anotan', async () => {
  const m = mundo(), a = m.socio('hugo', 499, hoy(), { nuevoFormato: true });
  await m.procesar(a.evFac); await m.procesar(a.evSub); await m.procesar(a.evSes);
  const r = m.factura(a.sub, 499, 'subscription_cycle', hoy(), true); await m.procesar(r.ev);
  const c = await m.cuenta();
  assert.equal(c.cobros, 2); assert.equal(c.neto, 998); assert.equal(c.socios, 1);
});

await prueba('una baja deja de contar como socio, y un evento viejo que llega tarde no la revive', async () => {
  const m = mundo(), a = m.socio('ines', 199, hoy() - 3600);
  for (const e of [a.evSes, a.evFac, a.evSub]) await m.procesar(e);
  const viejo = m.evento('customer.subscription.updated', a.sub, hoy() - 1800);                  // «sigue activa», de hace media hora
  a.sub.status = 'canceled'; a.sub.canceled_at = a.sub.ended_at = hoy();
  await m.procesar(m.evento('customer.subscription.deleted', a.sub));
  assert.equal((await m.cuenta()).socios, 0);
  await m.procesar(viejo);
  assert.equal((await m.cuenta()).socios, 0, 'de cancelada no se regresa');
  assert.equal(m.S.bajas.length, 1);
  assert.equal((await m.cuenta()).neto, 199, 'lo que ya había dado sigue en el libro');
});

await prueba('los dos candados de una suscripción, cada uno por separado: el del orden y el de «cancelada es para siempre»', async () => {
  // el del orden: «atrasada» es de ahora; «al corriente», de hace una hora, llega después y no la pisa
  const m = mundo(), a = m.socio('ivan', 199, hoy() - 7200);
  for (const e of [a.evSes, a.evFac, a.evSub]) await m.procesar(e);
  const alCorriente = m.evento('customer.subscription.updated', a.sub, hoy() - 3600);
  await m.procesar(m.evento('customer.subscription.updated', { ...a.sub, status: 'past_due' }, hoy()));
  await m.procesar(alCorriente);
  assert.equal(m.DB.uno(`SELECT estado FROM suscripciones WHERE id = ?`, a.sub.id).estado, 'past_due');
  // el de la baja: Stripe manda «actualizada» y «cancelada» en el mismo segundo, y la primera llega al final
  const n = mundo(), b = n.socio('irma', 199, hoy() - 7200), t = hoy();
  for (const e of [b.evSes, b.evFac, b.evSub]) await n.procesar(e);
  const mismaHora = n.evento('customer.subscription.updated', b.sub, t);
  await n.procesar(n.evento('customer.subscription.deleted', { ...b.sub, status: 'canceled', ended_at: t }, t));
  await n.procesar(mismaHora);
  assert.equal(n.DB.uno(`SELECT estado FROM suscripciones WHERE id = ?`, b.sub.id).estado, 'canceled');
  assert.equal((await n.cuenta()).socios, 0);
});

await prueba('dejar de ser socio desde el tablero cancela en Stripe y avisa una sola vez', async () => {
  const m = mundo(), a = m.socio('juan', 199);
  for (const e of [a.evSes, a.evFac, a.evSub]) await m.procesar(e);
  assert.equal((await pagos.darDeBaja(m.env, 'otra-persona', a.sub.id, m.op)).status, 404, 'nadie cancela lo de otra persona');
  assert.equal((await pagos.darDeBaja(m.env, 'juan', a.sub.id, m.op)).ok, true);
  assert.equal(m.S.subs[a.sub.id].status, 'canceled');
  assert.equal((await pagos.darDeBaja(m.env, 'juan', a.sub.id, m.op)).ya, true);
  await m.jalar();                                                                              // llega el evento de la baja que provocamos
  assert.equal((await m.cuenta()).socios, 0); assert.equal(m.S.bajas.length, 1);
  assert.equal(await pagos.socioVivoDe(m.env, 'juan'), null);
});

await prueba('si el cobro de un socio no pasa queda como atrasado, y al pagar vuelve a contar', async () => {
  const m = mundo(), a = m.socio('kike', 199, hoy() - 40 * 86400);
  for (const e of [a.evSes, a.evFac, a.evSub]) await m.procesar(e);
  await m.procesar(m.evento('invoice.payment_failed', { id: clave('in'), subscription: a.sub.id, customer: a.sub.customer, amount_paid: 0 }, hoy() - 3600));
  let s = await pagos.sociosVivos(m.env); assert.equal(s.vivos, 0); assert.equal(s.atrasados, 1);
  await m.procesar(m.factura(a.sub, 199, 'subscription_cycle').ev);
  s = await pagos.sociosVivos(m.env); assert.equal(s.vivos, 1); assert.equal(s.atrasados, 0);
});

/* ═══ devoluciones y disputas ═══ */
await prueba('una devolución parcial y luego el resto: el libro queda en cero y el aporte ya no sale como confirmado', async () => {
  const m = mundo(), a = m.fondo('lalo', 300);
  await m.procesar(a.ev);
  const d1 = m.devolver(a.cargo, 100);
  for (const e of [d1.evRe, d1.evCh, d1.evRe]) await m.procesar(e);                              // dos avisos distintos de la misma devolución, y uno repetido
  let c = await m.cuenta(); assert.equal(c.neto, 200); assert.equal(c.libro.length, 2);
  assert.equal(m.DB.uno(`SELECT estado FROM aportes WHERE sid = ?`, a.ses.id).estado, 'confirmado');
  const d2 = m.devolver(a.cargo, 200, { conLista: true });
  await m.procesar(d2.evCh); await m.procesar(d2.evRe);
  c = await m.cuenta(); assert.equal(c.neto, 0); assert.equal(c.libro.length, 3); assert.equal(c.ingreso, 0);
  assert.equal(m.DB.uno(`SELECT estado FROM aportes WHERE sid = ?`, a.ses.id).estado, 'devuelto');
  assert.ok(c.libro.filter((x) => x.clase === 'devolucion').every((x) => x.de === a.ses.payment_intent && x.persona === 'lalo'), 'cada devolución sabe de qué cobro es');
  assert.equal((await pagos.resumenPublico(m.env)).personas, 0, 'quien recibió todo de vuelta ya no cuenta como persona que apoya');
});

await prueba('dos devoluciones procesadas al mismo tiempo no restan de más', async () => {
  const m = mundo(), a = m.fondo('mara', 500);
  await m.procesar(a.ev);
  const d1 = m.devolver(a.cargo, 100), d2 = m.devolver(a.cargo, 150);
  await Promise.all([m.procesar(d2.evCh), m.procesar(d1.evCh), m.procesar(d1.evRe), m.procesar(d2.evRe)]);
  assert.equal((await m.cuenta()).neto, 250);
});

await prueba('la devolución de una mensualidad se liga a su factura aunque Stripe no diga a cuál pertenece el cargo', async () => {
  const m = mundo(), a = m.socio('nico', 199, hoy(), { nuevoFormato: true });                    // en la forma nueva el cobro se guarda sin cargo ni intento
  for (const e of [a.evSes, a.evFac, a.evSub]) await m.procesar(e);
  const d = m.devolver(a.cargo, 199);
  assert.equal(await m.procesar(d.evRe), 'hecho', 'se reconoce por el cliente, que es nuestro');
  const c = await m.cuenta();
  assert.equal(c.neto, 0); assert.equal(c.libro.find((x) => x.clase === 'devolucion').de, a.fac.id);
  assert.equal(c.socios, 1, 'devolverle un mes no lo da de baja');
});

await prueba('una devolución que el banco rechaza se quita del libro', async () => {
  const m = mundo(), a = m.fondo('olga', 400);
  await m.procesar(a.ev);
  const d = m.devolver(a.cargo, 400); await m.procesar(d.evRe);
  assert.equal((await m.cuenta()).neto, 0);
  await m.procesar(m.evento('refund.updated', { ...d.re, status: 'failed' }));
  assert.equal((await m.cuenta()).neto, 400);
  assert.equal(m.DB.uno(`SELECT estado FROM aportes WHERE sid = ?`, a.ses.id).estado, 'confirmado');
});

await prueba('una disputa resta cuando el banco se lleva el dinero y suma si lo regresa', async () => {
  const m = mundo(), a = m.fondo('paco', 999);
  await m.procesar(a.ev);
  const disputa = { id: clave('dp'), amount: 99900, charge: a.cargo.id, payment_intent: a.cargo.payment_intent };
  const retiro = m.evento('charge.dispute.funds_withdrawn', disputa);
  await m.procesar(retiro); await m.procesar(retiro);
  assert.equal((await m.cuenta()).neto, 0);
  await m.procesar(m.evento('charge.dispute.funds_reinstated', disputa));
  assert.equal((await m.cuenta()).neto, 999);
});

/* ═══ lo que no es de Cupido ═══ */
await prueba('los pagos de otras casas en la misma cuenta de Stripe no entran al libro', async () => {
  const m = mundo(), nuestro = m.fondo('queta', 299);
  const ajenoPago = m.fondo('nadie', 5000, hoy(), false), ajenoSocio = m.socio('nadie', 900, hoy(), { nuestro: false });
  const ajenaDev = m.devolver(ajenoPago.cargo, 5000);
  for (const e of [ajenoPago.ev, ajenoSocio.evSub, ajenoSocio.evFac, ajenoSocio.evSes, ajenaDev.evRe, ajenaDev.evCh]) assert.equal(await m.procesar(e), 'ajeno');
  await m.procesar(nuestro.ev);
  const c = await m.cuenta();
  assert.equal(c.cobros, 1); assert.equal(c.neto, 299); assert.equal(c.socios, 0);
  assert.equal(m.DB.uno(`SELECT COUNT(*) AS n FROM suscripciones`).n, 0);
  assert.equal(await m.procesar(ajenoPago.ev), 'ajeno', 'y la segunda vez ni se vuelve a mirar');
});

await prueba('alguien que pone el nombre de una persona nuestra en los datos de otro cobro no engaña al libro', async () => {
  const m = mundo(); m.persona('rita');
  // una sesión que dice ser de Cupido pero que Cupido nunca abrió: no está entre los apoyos
  const falsa = { id: clave('cs'), mode: 'payment', status: 'complete', payment_status: 'paid', amount_total: 100000, payment_intent: clave('pi'), metadata: { app: 'cupido', persona: 'rita', tipo: 'fondo' } };
  assert.equal(await m.procesar(m.evento('checkout.session.completed', falsa)), 'ajeno');
  assert.equal((await m.cuenta()).neto, 0);
});

/* ═══ el jalón ═══ */
await prueba('el jalón recoge lo que el aviso no entregó y avanza su lugar', async () => {
  const m = mundo(), a = m.fondo('sara', 299, hoy() - 600), b = m.socio('toño', 199, hoy() - 300);
  const r = await m.jalar();
  assert.equal(r.completo, true); assert.equal(r.nuestros, 4); assert.equal(r.errores, 0);
  const c = await m.cuenta(); assert.equal(c.neto, 498); assert.equal(c.socios, 1); assert.equal(m.S.gracias.length, 2);
  const lugar = Number(m.DB.uno(`SELECT valor FROM pagos_estado WHERE clave = 'eventos_desde'`).valor);
  assert.ok(lugar >= hoy() - 120, 'el lugar avanzó hasta ahora');
  const r2 = await m.jalar(); assert.equal(r2.nuestros, 0, 'la segunda vuelta no encuentra nada nuevo');
  assert.equal((await m.cuenta()).neto, 498);
  assert.ok(a && b);
});

await prueba('un atraso grande se recoge por partes, sin saltarse nada y sin mover el lugar antes de tiempo', async () => {
  const m = mundo(), antes = hoy() - 86400;
  m.DB.exec(`INSERT INTO pagos_estado (clave, valor) VALUES ('eventos_desde', '${antes}')`);
  const nuestros = [];
  for (let i = 0; i < 260; i++) {                                                                // 260 eventos de otras casas…
    if (i % 26 === 0) nuestros.push(m.fondo('p' + i, 100, antes + 60 + i * 10));                 // …y diez aportes de Cupido repartidos entre ellos
    m.evento('invoice.paid', { id: clave('in'), subscription: clave('sub'), amount_paid: 50000, customer: clave('cus'), lines: { data: [] } }, antes + 65 + i * 10);
  }
  let vueltas = 0, r;
  do { r = await m.jalar({ paginas: 1 }); vueltas++; if (!r.completo) assert.equal(Number(m.DB.uno(`SELECT valor FROM pagos_estado WHERE clave = 'eventos_desde'`).valor), antes, 'a medias, el lugar no se mueve'); } while (!r.completo && vueltas < 10);
  assert.equal(vueltas, 3, '270 eventos de a 100 son tres vueltas');
  const c = await m.cuenta(); assert.equal(c.cobros, 10); assert.equal(c.neto, 1000); assert.equal(m.S.gracias.length, 10);
  assert.equal(m.DB.uno(`SELECT valor FROM pagos_estado WHERE clave = 'relleno'`).valor, '');
});

await prueba('si Stripe se cae a medio evento, el evento se guarda con su error y se reintenta hasta que entra', async () => {
  const m = mundo(), a = m.socio('uri', 199, hoy() - 7200, { nuevoFormato: true });
  for (const e of [a.evSes, a.evFac, a.evSub]) await m.procesar(e);
  const d = m.devolver(a.cargo, 199, { cuando: hoy() - 3600 });
  m.DB.exec(`INSERT INTO pagos_estado (clave, valor) VALUES ('eventos_desde', '${hoy() - 600}')`);   // el jalón ya pasó por esa hora: solo el reintento puede rescatarlo
  m.S.falla = (metodo, ruta) => ruta.startsWith('/charges/');                                    // para saber de quién es el cargo hay que preguntarle a Stripe, y Stripe no contesta
  assert.equal(await m.procesar(d.evRe), 'error');
  assert.equal((await m.cuenta()).neto, 199, 'no se decide a ciegas');
  assert.equal((await pagos.saludPagos(m.env)).eventos.errores, 1);
  m.S.falla = null;
  m.DB.exec(`UPDATE pagos_eventos SET recibido = datetime('now', '-5 minutes') WHERE estado = 'error'`);
  const r = await m.jalar();
  assert.equal(r.vistos, 0, 'la barrida normal ya no lo ve'); assert.equal(r.reintentos, 1);
  assert.equal((await m.cuenta()).neto, 0);
  assert.equal((await pagos.saludPagos(m.env)).eventos.errores, 0);
});

await prueba('si Stripe no deja leer los eventos, el jalón lo dice y no mueve su lugar', async () => {
  const m = mundo(); m.fondo('vale', 299, hoy() - 100);
  m.S.falla = (metodo, ruta) => ruta.startsWith('/events');
  const r = await m.jalar();
  assert.match(r.error, /^500/);
  const s = await pagos.saludPagos(m.env);
  assert.equal(s.alDia, false); assert.match(s.error, /^500/);
  assert.equal(m.DB.uno(`SELECT valor FROM pagos_estado WHERE clave = 'eventos_desde'`), undefined);
  m.S.falla = null;
  await m.jalar();
  assert.equal((await m.cuenta()).neto, 299);
  assert.equal((await pagos.saludPagos(m.env)).alDia, true);
});

/* ═══ el aviso ═══ */
await prueba('el aviso con firma: la buena pasa; la falsa, la vieja y el cuerpo alterado no', async () => {
  const secreto = 'whsec_de_prueba', cuerpo = JSON.stringify({ id: 'evt_x', type: 'invoice.paid' }), t = hoy();
  const firma = (c, hora = t, s = secreto) => `t=${hora},v1=${createHmac('sha256', s).update(`${hora}.${c}`).digest('hex')}`;
  assert.equal(await pagos.firmaValida(secreto, cuerpo, firma(cuerpo)), true);
  assert.equal(await pagos.firmaValida(secreto, cuerpo, `t=${t},v1=deadbeef,v1=${firma(cuerpo).split('v1=')[1]}`), true, 'con dos firmas basta que una sea buena');
  assert.equal(await pagos.firmaValida(secreto, cuerpo + ' ', firma(cuerpo)), false);
  assert.equal(await pagos.firmaValida(secreto, cuerpo, firma(cuerpo, t, 'otro_secreto')), false);
  assert.equal(await pagos.firmaValida(secreto, cuerpo, firma(cuerpo, t - 3600)), false, 'una firma de hace una hora ya no vale');
  assert.equal(await pagos.firmaValida(secreto, cuerpo, ''), false);
});

await prueba('sin secreto de firma, el aviso no le cree al cuerpo: le pide el evento a Stripe', async () => {
  const m = mundo(), a = m.fondo('wendy', 299);
  // alguien manda un aviso inventado con la clave de un evento que sí existe, pero con otro monto: gana lo que diga Stripe
  const mentira = m.copia(a.ev); mentira.data.object.amount_total = 99999900;
  const r = await pagos.recibirAviso(m.env, JSON.stringify(mentira), '', m.op);
  assert.equal(r.status, 200); assert.equal((await m.cuenta()).neto, 299);
  // un evento que Stripe no conoce no hace nada
  const r2 = await pagos.recibirAviso(m.env, JSON.stringify({ id: 'evt_inventado_123456', type: 'checkout.session.completed', data: { object: a.ses } }), '', m.op);
  assert.equal(r2.r, 'desconocido'); assert.equal((await m.cuenta()).cobros, 1);
  assert.equal((await pagos.recibirAviso(m.env, 'no es json', '', m.op)).status, 400);
  assert.equal((await pagos.recibirAviso(m.env, JSON.stringify({ id: 'DROP TABLE cobros' }), '', m.op)).status, 400);
});

await prueba('con secreto de firma, un aviso sin firma buena se rechaza sin preguntarle nada a Stripe', async () => {
  const m = mundo(), a = m.fondo('xime', 299); m.env.STRIPE_WEBHOOK_SECRET = 'whsec_de_prueba';
  const cuerpo = JSON.stringify(a.ev), t = hoy(), antes = m.S.llamadas.length;
  assert.equal((await pagos.recibirAviso(m.env, cuerpo, 't=1,v1=nada', m.op)).status, 400);
  assert.equal(m.S.llamadas.length, antes); assert.equal((await m.cuenta()).cobros, 0);
  const buena = `t=${t},v1=${createHmac('sha256', 'whsec_de_prueba').update(`${t}.${cuerpo}`).digest('hex')}`;
  assert.equal((await pagos.recibirAviso(m.env, cuerpo, buena, m.op)).status, 200);
  assert.equal((await m.cuenta()).neto, 299);
});

await prueba('sin secreto de firma, una lluvia de avisos no nos pone a martillar a Stripe', async () => {
  const m = mundo(); let luego = 0;
  for (let i = 0; i < 60; i++) if ((await pagos.recibirAviso(m.env, JSON.stringify({ id: `evt_lluvia_${String(i).padStart(6, '0')}` }), '', m.op)).status === 202) luego++;
  assert.ok(luego >= 15, 'después del tope por minuto contesta «luego»');
  assert.ok(m.S.llamadas.length <= 45);
});

/* ═══ la conciliación ═══ */
await prueba('quien pagó y cerró la ventana antes de volver: la conciliación lo confirma y le agradece', async () => {
  const m = mundo(), a = m.fondo('yoli', 299); m.S.eventos.length = 0;                           // y además el evento nunca llegó
  m.DB.exec(`UPDATE aportes SET creado = datetime('now', '-2 hours')`);
  const r = await pagos.conciliar(m.env, m.op);
  assert.equal(r.confirmadas, 1); assert.equal((await m.cuenta()).neto, 299); assert.equal(m.S.gracias.length, 1);
  assert.equal((await pagos.conciliar(m.env, m.op)).confirmadas, 0);
  assert.ok(a);
});

await prueba('la conciliación recupera mensualidades, bajas y devoluciones cuyos eventos se perdieron', async () => {
  const m = mundo(), a = m.socio('zoe', 199, hoy() - 62 * 86400), b = m.socio('abel', 99, hoy() - 10 * 86400);
  for (const e of [a.evSes, a.evFac, a.evSub, b.evSes, b.evFac, b.evSub]) await m.procesar(e);
  m.factura(a.sub, 199, 'subscription_cycle', hoy() - 32 * 86400); const r2 = m.factura(a.sub, 199, 'subscription_cycle', hoy() - 2 * 86400);
  b.sub.status = 'canceled'; b.sub.canceled_at = b.sub.ended_at = hoy() - 86400;
  m.devolver(r2.cargo, 199, { cuando: hoy() - 86400 });
  m.S.eventos.length = 0;                                                                        // nada de esto llegó por evento
  const r = await pagos.conciliar(m.env, m.op);
  assert.equal(r.facturas, 2); assert.equal(r.devoluciones, 1); assert.deepEqual(r.errores, []);
  const c = await m.cuenta();
  assert.equal(c.neto, 199 * 3 + 99 - 199); assert.equal(c.socios, 1, 'abel ya no es socio');
  assert.equal(m.S.bajas.length, 1);
  const otra = await pagos.conciliar(m.env, m.op);
  assert.equal(otra.facturas + otra.devoluciones, 0, 'conciliar otra vez no cambia nada');
  assert.equal((await m.cuenta()).neto, c.neto);
});

await prueba('si Stripe no conoce una suscripción (por ejemplo, se cambió de cuenta), nadie se da de baja por eso: se avisa', async () => {
  const m = mundo(), a = m.socio('gala', 199);
  for (const e of [a.evSes, a.evFac, a.evSub]) await m.procesar(e);
  delete m.S.subs[a.sub.id];
  const r = await pagos.conciliar(m.env, m.op);
  assert.equal(r.errores.length, 1); assert.match(r.errores[0], /no conoce/);
  assert.equal((await m.cuenta()).socios, 1); assert.equal(m.S.bajas.length, 0);
});

/* ═══ lo que se le enseña a cada quien ═══ */
await prueba('el tope de cuidado y «un socio a la vez» se miden con lo que de verdad se cobró', async () => {
  const m = mundo(), a = m.fondo('bea', 3000), s = m.socio('bea', 499);
  for (const e of [a.ev, s.evSes, s.evFac, s.evSub]) await m.procesar(e);
  assert.equal(await pagos.dadoEn30(m.env, 'bea'), 3499);
  assert.equal((await pagos.socioVivoDe(m.env, 'bea')).centavos, 49900);
  const d = m.devolver(a.cargo, 3000); await m.procesar(d.evRe);
  assert.equal(await pagos.dadoEn30(m.env, 'bea'), 499, 'lo devuelto deja de contar para el tope');
  const mios = await pagos.misApoyos(m.env, 'bea');
  assert.equal(mios.total, 499); assert.equal(mios.socio[0].viva, true); assert.equal(mios.movimientos.length, 3);
  assert.ok(!JSON.stringify(mios.movimientos).includes('pi_'), 'en su tablero no van claves de Stripe');
  assert.deepEqual(await pagos.misApoyos(m.env, 'alguien-más'), { total: 0, socio: [], movimientos: [] });
});

await prueba('lo público es neto y de hoy: lo reunido, quién apoya y cuántos socios siguen', async () => {
  const m = mundo(), a = m.fondo('ceci', 1000), b = m.fondo('dora', 500), s = m.socio('ceci', 199), t = m.socio('elsa', 99);
  for (const e of [a.ev, b.ev, s.evSes, s.evFac, s.evSub, t.evSes, t.evFac, t.evSub]) await m.procesar(e);
  assert.deepEqual(await pagos.resumenPublico(m.env), { reunido: 1798, personas: 3, socios: 2 });
  const d = m.devolver(b.cargo, 500); await m.procesar(d.evCh);
  await pagos.darDeBaja(m.env, 'elsa', t.sub.id, m.op);
  assert.deepEqual(await pagos.resumenPublico(m.env), { reunido: 1298, personas: 2, socios: 1 });
});

await prueba('el panel no enseña de quién es cada cobro a quien no es administrador', async () => {
  const m = mundo(), a = m.fondo('fabi', 299); await m.procesar(a.ev);
  const sin = await pagos.libroAdmin(m.env, false), con = await pagos.libroAdmin(m.env, true);
  assert.equal(sin.cobros[0].monto, 299); assert.equal(sin.cobros[0].quien, ''); assert.equal(sin.cobros[0].clave, '');
  assert.equal(con.cobros[0].quien, 'fabi@cupido.test');
  assert.ok(!JSON.stringify(sin).includes('fabi'));
});

await prueba('todo junto, revuelto y repetido: el libro cuadra con lo que Stripe cobró de verdad', async () => {
  const m = mundo(); let esperado = 0; const eventos = [];
  for (let i = 0; i < 12; i++) {
    const f = m.fondo('f' + i, 100 + i, hoy() - 20 * 86400 + i); eventos.push(f.ev); esperado += 100 + i;
    if (i % 4 === 0) { const d = m.devolver(f.cargo, 50, { conLista: i % 8 === 0 }); eventos.push(d.evRe, d.evCh); esperado -= 50; }
  }
  for (let i = 0; i < 8; i++) {
    const s = m.socio('s' + i, 99, hoy() - 25 * 86400 + i, { nuevoFormato: i % 2 === 1 }); eventos.push(s.evSub, s.evFac, s.evSes); esperado += 99;
    if (i % 3 === 0) { s.sub.status = 'canceled'; s.sub.ended_at = hoy(); eventos.push(m.evento('customer.subscription.deleted', s.sub)); }
    else { const r = m.factura(s.sub, 99, 'subscription_cycle', hoy() - 3600 + i, i % 2 === 1); eventos.push(r.ev); esperado += 99; }
  }
  for (let i = 0; i < 6; i++) { const x = m.fondo('nadie', 7777, hoy() - 1000 + i, false); eventos.push(x.ev); }
  // se barajan (siempre igual, para que la prueba se pueda repetir) y cada uno se entrega dos veces
  let semilla = 181218; const azar = () => (semilla = (semilla * 1103515245 + 12345) % 2147483648) / 2147483648;
  const revueltos = [...eventos, ...eventos].map((e) => [azar(), e]).sort((a, b) => a[0] - b[0]).map((x) => x[1]);
  for (const e of revueltos) await m.procesar(e, 'aviso');
  await m.jalar({ paginas: 10 }); await pagos.conciliar(m.env, { ...m.op, suscripciones: 50 });
  const c = await m.cuenta();
  assert.equal(c.neto, esperado); assert.equal(c.cobros, 12 + 8 + 5); assert.equal(c.socios, 5);
  assert.equal(m.S.gracias.length, 20, 'veinte apoyos, veinte agradecimientos');
  assert.equal(m.DB.uno(`SELECT COUNT(*) AS n FROM pagos_eventos WHERE estado NOT IN ('hecho', 'ajeno')`).n, 0, 'ningún evento quedó atorado');
});

console.log(`\n${ok} pruebas del libro de cobros pasaron.`);
