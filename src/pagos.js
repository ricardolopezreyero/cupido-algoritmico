/* ─────────────────────────────────────────────────────────────────────────────
   Cupido Algorítmico · Pagos: el libro de cobros
   Autor: Ricardo López Reyero

   Regla de esta pieza: ningún peso se queda sin anotar y ninguno se anota dos veces.

   Cómo se logra:
   1. UN LIBRO (tabla `cobros`). Cada movimiento de dinero es un renglón con la clave que
      le dio Stripe: un pago de una vez (pi_…), una factura de socio (in_…), una devolución
      (re_…) o una disputa (dp_…:retiro / :regreso). Como la clave es la de Stripe, anotar
      dos veces lo mismo es imposible: el segundo intento no hace nada. Los montos van en
      centavos, con signo: lo que entra suma y lo que se devuelve resta.
   2. DOS CAMINOS para enterarse, y cualquiera de los dos basta:
      · el aviso: Stripe llama a /api/stripe/aviso en el momento;
      · el jalón: cada pocos minutos Cupido le pide a Stripe los eventos nuevos. Si un aviso
        se perdió, el jalón lo recoge. Lleva su propio lugar («eventos_desde») y un atraso
        grande se recoge por partes, sin saltarse nada.
      Además, una vez al día se concilia: sesiones que se pagaron y nadie volvió a
      confirmar, el estado y las facturas de cada suscripción, y las devoluciones.
   3. CADA EVENTO SE PROCESA UNA VEZ (tabla `pagos_eventos`) y, si llega repetido, fuera de
      orden o a medias, el resultado es el mismo. Un evento que falla se guarda con su
      error y se reintenta; no se pierde en silencio.
   4. NO SE LE CREE A NADIE POR SU PALABRA. El aviso se acepta con la firma de Stripe o,
      si todavía no hay secreto de firma, tomando solo la clave del evento y pidiéndoselo a
      Stripe con nuestra llave.
   5. La cuenta de Stripe se comparte con otras casas: de cada evento se comprueba que sea
      de Cupido (la sesión, la suscripción o el cliente son nuestros) antes de tocarlo.

   Este archivo no importa nada de la casa, para poder probarse solo
   (scripts/pruebas-pagos.mjs). Los correos los manda quien lo llama, con `op.alConfirmar`.
   ───────────────────────────────────────────────────────────────────────────── */
// RLR
export const _RLR = 'Ricardo López Reyero';
const _k = 'EYE', _rev = 181218;

export const ESQUEMA_PAGOS = [
  // El libro. clase: cobro | devolucion | disputa. tipo: fondo | socio (y lo que el programa cobre después).
  `CREATE TABLE IF NOT EXISTS cobros (
     id TEXT PRIMARY KEY, clase TEXT NOT NULL, tipo TEXT NOT NULL, centavos INTEGER NOT NULL,
     persona TEXT, correo TEXT, sesion TEXT, intento TEXT, cargo TEXT, factura TEXT, suscripcion TEXT, de TEXT,
     cuando TEXT NOT NULL, anotado TEXT NOT NULL DEFAULT (datetime('now')), evento TEXT)`,
  `CREATE INDEX IF NOT EXISTS idx_cobros_cuando ON cobros(cuando)`,
  `CREATE INDEX IF NOT EXISTS idx_cobros_persona ON cobros(persona, cuando)`,
  `CREATE INDEX IF NOT EXISTS idx_cobros_intento ON cobros(intento)`,
  `CREATE INDEX IF NOT EXISTS idx_cobros_cargo ON cobros(cargo)`,
  // Los socios fundadores: una fila por suscripción, con el estado que dice Stripe. «visto» es la hora del último
  // evento aplicado: uno más viejo que llegue tarde no pisa lo nuevo.
  `CREATE TABLE IF NOT EXISTS suscripciones (
     id TEXT PRIMARY KEY, persona TEXT, correo TEXT, cliente TEXT, centavos INTEGER NOT NULL DEFAULT 0,
     estado TEXT NOT NULL DEFAULT 'active', desde TEXT, periodo_fin TEXT, cancela_al_final INTEGER NOT NULL DEFAULT 0,
     baja TEXT, motivo TEXT, visto INTEGER NOT NULL DEFAULT 0, revisada TEXT, actualizado TEXT NOT NULL DEFAULT (datetime('now')))`,
  `CREATE INDEX IF NOT EXISTS idx_suscripciones_persona ON suscripciones(persona, estado)`,
  `CREATE INDEX IF NOT EXISTS idx_suscripciones_cliente ON suscripciones(cliente)`,
  // Cada evento de Stripe que se miró: hecho | ajeno (de otra casa) | error | perdido. Sin datos de nadie: solo clave, tipo y hora.
  `CREATE TABLE IF NOT EXISTS pagos_eventos (
     id TEXT PRIMARY KEY, tipo TEXT NOT NULL, creado INTEGER NOT NULL, via TEXT NOT NULL, estado TEXT NOT NULL DEFAULT 'proceso',
     intentos INTEGER NOT NULL DEFAULT 0, error TEXT, recibido TEXT NOT NULL DEFAULT (datetime('now')), hecho TEXT)`,
  `CREATE INDEX IF NOT EXISTS idx_pagos_eventos_estado ON pagos_eventos(estado, recibido)`,
  // Dónde va el jalón, cuándo se concilió y qué falló la última vez
  `CREATE TABLE IF NOT EXISTS pagos_estado (clave TEXT PRIMARY KEY, valor TEXT, at TEXT NOT NULL DEFAULT (datetime('now')))`,
];
// Columnas nuevas en una tabla que ya existía (se corren una por una, dentro de try/catch, como las demás migraciones)
export const MIGRAR_PAGOS = [`ALTER TABLE aportes ADD COLUMN suscripcion TEXT`, `ALTER TABLE aportes ADD COLUMN intento TEXT`, `ALTER TABLE aportes ADD COLUMN cliente TEXT`];

// Los eventos que importan (Stripe deja pedir hasta 20 tipos a la vez)
export const TIPOS = [
  'checkout.session.completed', 'checkout.session.async_payment_succeeded', 'checkout.session.async_payment_failed', 'checkout.session.expired',
  'invoice.paid', 'invoice.payment_failed',
  'customer.subscription.created', 'customer.subscription.updated', 'customer.subscription.deleted',
  'charge.refunded', 'refund.created', 'refund.updated', 'charge.refund.updated',
  'charge.dispute.funds_withdrawn', 'charge.dispute.funds_reinstated',
];
const TRASLAPE = 300;          // segundos que el jalón vuelve a mirar hacia atrás: repetir no cuesta, saltarse sí
const VIVAS = `('active', 'trialing')`;   // una suscripción cuenta como socio mientras Stripe la tenga así
const FIN = `('canceled', 'incomplete_expired')`;   // de aquí no se regresa

/* ── utilerías ───────────────────────────────────────────────────────────── */
const idDe = (v) => (typeof v === 'string' && v ? v : v && typeof v === 'object' && typeof v.id === 'string' ? v.id : null);
const fechaDe = (epoch) => new Date((Number(epoch) || Date.now() / 1000) * 1000).toISOString().slice(0, 19).replace('T', ' ');
const ahora = () => Math.floor(Date.now() / 1000);
const uno = (env, sql, ...v) => env.DB.prepare(sql).bind(...v).first();
const todos = async (env, sql, ...v) => (await env.DB.prepare(sql).bind(...v).all()).results;
const corre = async (env, sql, ...v) => (await env.DB.prepare(sql).bind(...v).run()).meta?.changes || 0;
const secreto = async (v) => { if (!v) return ''; if (typeof v === 'string') return v; try { return (await v.get()) || ''; } catch { return ''; } };
const leer = async (env, clave) => (await uno(env, `SELECT valor FROM pagos_estado WHERE clave = ?`, clave))?.valor ?? null;
const poner = (env, clave, valor) => corre(env, `INSERT INTO pagos_estado (clave, valor, at) VALUES (?, ?, datetime('now')) ON CONFLICT(clave) DO UPDATE SET valor = excluded.valor, at = excluded.at`, clave, String(valor ?? ''));
const anotar = async (env, accion, detalle = '') => { try { await corre(env, `INSERT INTO bitacora (tipo, accion, detalle) VALUES ('programa', ?, ?)`, accion, String(detalle).slice(0, 500)); } catch (e) { console.error('bitácora de pagos', e.message); } };
const pesosDe = (centavos) => `${(centavos / 100).toLocaleString('es-MX', { maximumFractionDigits: 2 })} MXN`;

export async function hayPagos(env) { return !!env.STRIPE_API || !!(await secreto(env.STRIPE_SECRET_KEY)); }

/* ── hablar con Stripe ───────────────────────────────────────────────────────
   Devuelve siempre { ok, status, j }. Lo que se puede repetir sin riesgo (leer, o escribir con llave
   de idempotencia) se reintenta una vez si Stripe está ocupado o la red se cae. */
export async function stripe(env, metodo, ruta, cuerpo = null, idem = '') {
  if (env.STRIPE_API) return env.STRIPE_API(metodo, ruta, cuerpo, idem);   // las pruebas ponen aquí un Stripe de mentira
  const llave = await secreto(env.STRIPE_SECRET_KEY);
  if (!llave) return { ok: false, status: 0, j: { error: { message: 'sin llave de Stripe' } } };
  const h = { authorization: 'Bearer ' + llave };
  if (cuerpo) h['content-type'] = 'application/x-www-form-urlencoded';
  if (idem) h['idempotency-key'] = idem;
  const repetible = metodo === 'GET' || !!idem;
  for (let i = 0; ; i++) {
    try {
      const r = await fetch('https://api.stripe.com/v1' + ruta, { method: metodo, headers: h, body: cuerpo ? String(cuerpo) : undefined, signal: AbortSignal.timeout(15000) });
      let j = {}; try { j = await r.json(); } catch { /* sin cuerpo */ }
      if ((r.status >= 500 || r.status === 429) && repetible && i < 1) { await new Promise((ok) => setTimeout(ok, 500)); continue; }
      return { ok: r.ok, status: r.status, j };
    } catch (e) {
      if (repetible && i < 1) continue;
      return { ok: false, status: 0, j: { error: { message: String(e?.message || e) } } };
    }
  }
}

/* ── el libro ────────────────────────────────────────────────────────────── */
// Anota un movimiento. Devuelve true solo si era nuevo: quien llame decide con eso si avisa o agradece.
async function asentar(env, c) {
  return (await corre(env, `INSERT OR IGNORE INTO cobros (id, clase, tipo, centavos, persona, correo, sesion, intento, cargo, factura, suscripcion, de, cuando, evento)
    VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)`, c.id, c.clase, c.tipo, Math.round(c.centavos), c.persona ?? null, c.correo ?? null, c.sesion ?? null, c.intento ?? null,
    c.cargo ?? null, c.factura ?? null, c.suscripcion ?? null, c.de ?? null, c.cuando, c.evento ?? null)) > 0;
}
// Lo que se va sabiendo después de un cobro (su cargo, su intento) se le completa; nunca se pisa lo que ya tenía
const completar = (env, id, c) => corre(env, `UPDATE cobros SET intento = COALESCE(intento, ?), cargo = COALESCE(cargo, ?), suscripcion = COALESCE(suscripcion, ?), persona = COALESCE(persona, ?), correo = COALESCE(correo, ?) WHERE id = ?`,
  c.intento ?? null, c.cargo ?? null, c.suscripcion ?? null, c.persona ?? null, c.correo ?? null, id);

const esPersona = async (env, id) => !!id && !!(await uno(env, `SELECT 1 AS x FROM personas WHERE id = ?`, String(id)));
// ¿Ese cliente de Stripe es de alguien de Cupido? Devuelve a quién y con qué
async function clienteNuestro(env, cli) {
  if (!cli) return null;
  const s = await uno(env, `SELECT persona, correo, id AS suscripcion FROM suscripciones WHERE cliente = ? ORDER BY desde DESC LIMIT 1`, cli);
  if (s) return { ...s, tipo: 'socio' };
  const a = await uno(env, `SELECT persona, correo, tipo FROM aportes WHERE cliente = ? ORDER BY id DESC LIMIT 1`, cli);
  return a ? { ...a, suscripcion: null } : null;
}

/* ── una sesión de pago que ya se pagó ───────────────────────────────────────
   La llaman tres caminos (la persona al volver, el aviso y la conciliación) y da igual quién llegue primero.
   Devuelve { ajeno } si la sesión no es de Cupido, { ok: false } si todavía no se paga, o { ok, nuevo, tipo, monto }. */
export async function confirmarSesion(env, ses, creado, evento, op = {}) {
  const fila = await uno(env, `SELECT * FROM aportes WHERE sid = ?`, String(ses?.id || ''));
  if (!fila) return { ajeno: true };
  const pagado = ses.payment_status === 'paid' || (ses.mode === 'subscription' && ses.status === 'complete' && ses.payment_status !== 'unpaid');
  if (!pagado) {
    if (ses.status === 'expired') await corre(env, `UPDATE aportes SET estado = 'vencido' WHERE sid = ? AND estado = 'pendiente'`, ses.id);
    return { ok: false, estado: ses.status || 'abierta' };
  }
  const sub = idDe(ses.subscription), pi = idDe(ses.payment_intent), cli = idDe(ses.customer), fac = idDe(ses.invoice);
  const centavos = Number.isFinite(ses.amount_total) ? ses.amount_total : fila.monto * 100;
  const cuando = fechaDe(creado);
  // El cambio de estado es una sola instrucción: si dos caminos llegan a la vez, solo uno «gana» y solo ese agradece
  const nuevo = (await corre(env, `UPDATE aportes SET estado = 'confirmado', confirmado = datetime('now') WHERE sid = ? AND estado NOT IN ('confirmado', 'devuelto')`, ses.id)) > 0;
  await corre(env, `UPDATE aportes SET suscripcion = COALESCE(suscripcion, ?), intento = COALESCE(intento, ?), cliente = COALESCE(cliente, ?) WHERE sid = ?`, sub, pi, cli, ses.id);
  if (ses.mode === 'subscription') {
    if (sub) await corre(env, `INSERT INTO suscripciones (id, persona, correo, cliente, centavos, estado, desde) VALUES (?, ?, ?, ?, ?, 'active', ?)
      ON CONFLICT(id) DO UPDATE SET persona = COALESCE(suscripciones.persona, excluded.persona), correo = COALESCE(suscripciones.correo, excluded.correo), cliente = COALESCE(suscripciones.cliente, excluded.cliente),
        centavos = CASE WHEN suscripciones.centavos > 0 THEN suscripciones.centavos ELSE excluded.centavos END, desde = COALESCE(suscripciones.desde, excluded.desde)`,
      sub, fila.persona, fila.correo, cli, centavos, cuando);
    // La primera mensualidad se anota con la clave de su factura: cuando llegue «invoice.paid» ya estará, y no se duplica
    if (fac && centavos > 0) await asentar(env, { id: fac, clase: 'cobro', tipo: 'socio', centavos, persona: fila.persona, correo: fila.correo, sesion: ses.id, intento: pi, factura: fac, suscripcion: sub, cuando, evento });
  } else if (centavos > 0) {
    await asentar(env, { id: pi || 'cs:' + ses.id, clase: 'cobro', tipo: fila.tipo === 'socio' ? 'socio' : 'fondo', centavos, persona: fila.persona, correo: fila.correo, sesion: ses.id, intento: pi, cuando, evento });
  }
  if (nuevo) {
    await anotar(env, fila.tipo === 'socio' ? 'Alguien se volvió Socio fundador' : 'Alguien aportó al Fondo de atracción', pesosDe(centavos));
    try { await op.alConfirmar?.({ persona: fila.persona, tipo: fila.tipo, monto: Math.round(centavos / 100) }); } catch (e) { console.error('gracias', e?.message || e); }
  }
  return { ok: true, nuevo, tipo: fila.tipo, monto: Math.round(centavos / 100), persona: fila.persona };
}

/* ── una suscripción, como la ve Stripe ──────────────────────────────────────
   «creado» es la hora del evento. Un evento más viejo que el último aplicado no cambia nada, y de «cancelada» no se regresa. */
async function verSuscripcion(env, s, creado, op = {}) {
  const id = idDe(s); if (!id) return false;
  const meta = s.metadata || {};
  const existe = await uno(env, `SELECT id, persona, estado FROM suscripciones WHERE id = ?`, id);
  let persona = existe?.persona || null;
  if (!existe) {
    const a = await uno(env, `SELECT persona, correo FROM aportes WHERE suscripcion = ? LIMIT 1`, id);
    persona = a?.persona || ((meta.app === 'cupido' || meta.tipo === 'socio') && (await esPersona(env, meta.persona)) ? String(meta.persona) : null);
    if (!persona) return false;   // no es de Cupido
  }
  const item = s.items?.data?.[0];
  const centavos = item ? ((item.price?.unit_amount ?? item.plan?.amount ?? 0) * (item.quantity || 1)) : 0;
  const fin = s.current_period_end ?? item?.current_period_end ?? null;
  const termino = ['canceled', 'incomplete_expired'].includes(s.status);
  const baja = termino ? fechaDe(s.ended_at || s.canceled_at || creado) : null;
  const antes = existe?.estado || null;
  await corre(env, `INSERT INTO suscripciones (id, persona, cliente, centavos, estado, desde, periodo_fin, cancela_al_final, baja, motivo, visto, actualizado)
    VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, datetime('now'))
    ON CONFLICT(id) DO UPDATE SET
      estado = CASE WHEN suscripciones.estado IN ${FIN} THEN suscripciones.estado ELSE excluded.estado END,
      periodo_fin = COALESCE(excluded.periodo_fin, suscripciones.periodo_fin),
      cancela_al_final = excluded.cancela_al_final,
      baja = COALESCE(suscripciones.baja, excluded.baja), motivo = COALESCE(suscripciones.motivo, excluded.motivo),
      centavos = CASE WHEN excluded.centavos > 0 THEN excluded.centavos ELSE suscripciones.centavos END,
      cliente = COALESCE(suscripciones.cliente, excluded.cliente), persona = COALESCE(suscripciones.persona, excluded.persona),
      visto = excluded.visto, actualizado = datetime('now')
    WHERE excluded.visto >= suscripciones.visto`,
    id, persona, idDe(s.customer), centavos, s.status || 'active', fechaDe(s.start_date || s.created || creado), fin ? fechaDe(fin) : null, s.cancel_at_period_end ? 1 : 0,
    baja, termino ? (s.cancellation_details?.reason || 'stripe') : null, Number(creado) || 0);
  if (termino && antes && !['canceled', 'incomplete_expired'].includes(antes)) {
    await anotar(env, 'Un socio fundador se dio de baja', id);
    try { await op.alDarDeBaja?.({ persona, suscripcion: id }); } catch (e) { console.error('aviso de baja', e?.message || e); }
  }
  return true;
}

/* ── una factura pagada: la mensualidad de un socio ──────────────────────── */
// Las versiones nuevas de Stripe movieron estos datos de lugar: se buscan en los dos
const subDeFactura = (f) => idDe(f.subscription) || idDe(f.parent?.subscription_details?.subscription) || idDe(f.lines?.data?.[0]?.subscription) || idDe(f.lines?.data?.[0]?.parent?.subscription_item_details?.subscription);
const metaDeFactura = (f) => f.subscription_details?.metadata || f.parent?.subscription_details?.metadata || f.lines?.data?.[0]?.metadata || {};
async function duenoDeFactura(env, f) {
  const sub = subDeFactura(f), meta = metaDeFactura(f);
  const S = sub ? await uno(env, `SELECT * FROM suscripciones WHERE id = ?`, sub) : null;
  if (S) return { sub, S, persona: S.persona, correo: S.correo };
  const a = sub ? await uno(env, `SELECT persona, correo FROM aportes WHERE suscripcion = ? LIMIT 1`, sub) : null;
  if (a) return { sub, S: null, persona: a.persona, correo: a.correo };
  if ((meta.app === 'cupido' || meta.tipo === 'socio') && (await esPersona(env, meta.persona))) return { sub, S: null, persona: String(meta.persona), correo: f.customer_email || null };
  const c = await clienteNuestro(env, idDe(f.customer));
  return c && c.tipo === 'socio' ? { sub: sub || c.suscripcion, S: null, persona: c.persona, correo: c.correo } : null;
}
async function verFactura(env, f, creado, evento) {
  const d = await duenoDeFactura(env, f); if (!d) return false;
  const pagado = Number(f.amount_paid) || 0;
  const pi = idDe(f.payment_intent), cargo = idDe(f.charge), cuando = fechaDe(f.status_transitions?.paid_at || creado);
  if (pagado > 0) {
    const nuevo = await asentar(env, { id: f.id, clase: 'cobro', tipo: 'socio', centavos: pagado, persona: d.persona, correo: d.correo || f.customer_email || null, intento: pi, cargo, factura: f.id, suscripcion: d.sub, cuando, evento });
    await completar(env, f.id, { intento: pi, cargo, suscripcion: d.sub, persona: d.persona, correo: d.correo || f.customer_email || null });
    if (nuevo && f.billing_reason === 'subscription_cycle') await anotar(env, 'Se renovó un Socio fundador', pesosDe(pagado));
  }
  if (d.sub) {
    const fin = f.lines?.data?.[0]?.period?.end || null;
    // Pagó: si estaba atrasada vuelve a estar al corriente. No toca «visto»: el estado fino lo da el evento de la suscripción
    await corre(env, `INSERT INTO suscripciones (id, persona, correo, cliente, centavos, estado, desde, periodo_fin) VALUES (?, ?, ?, ?, ?, 'active', ?, ?)
      ON CONFLICT(id) DO UPDATE SET estado = CASE WHEN suscripciones.estado IN ('past_due', 'unpaid', 'incomplete') THEN 'active' ELSE suscripciones.estado END,
        periodo_fin = CASE WHEN excluded.periodo_fin IS NOT NULL AND (suscripciones.periodo_fin IS NULL OR excluded.periodo_fin > suscripciones.periodo_fin) THEN excluded.periodo_fin ELSE suscripciones.periodo_fin END,
        persona = COALESCE(suscripciones.persona, excluded.persona), correo = COALESCE(suscripciones.correo, excluded.correo), cliente = COALESCE(suscripciones.cliente, excluded.cliente),
        centavos = CASE WHEN suscripciones.centavos > 0 THEN suscripciones.centavos ELSE excluded.centavos END, actualizado = datetime('now')`,
      d.sub, d.persona, d.correo || f.customer_email || null, idDe(f.customer), pagado, cuando, fin ? fechaDe(fin) : null);
  }
  return true;
}
async function facturaFallida(env, f, creado) {
  const d = await duenoDeFactura(env, f); if (!d) return false;
  if (d.sub && (await corre(env, `UPDATE suscripciones SET estado = 'past_due', actualizado = datetime('now') WHERE id = ? AND estado = 'active' AND visto <= ?`, d.sub, Number(creado) || 0)) > 0) await anotar(env, 'No pasó el cobro de un Socio fundador', d.sub);
  return true;
}

/* ── devoluciones y disputas ─────────────────────────────────────────────────
   Primero hay que saber de qué cobro son. Se busca por las claves que ya tenemos y, si no aparece,
   se le pregunta a Stripe por el cargo: si el cliente es nuestro, la devolución se anota aunque no se
   encuentre el cobro exacto (el dinero cuadra; lo que queda pendiente es a cuál se le resta). */
async function origenDe(env, { intento, cargo, factura }, ch = null) {
  const cobro = async (sql, ...v) => uno(env, `SELECT * FROM cobros WHERE clase = 'cobro' AND ${sql} LIMIT 1`, ...v);
  let o = null;
  if (intento) o = await cobro(`(id = ? OR intento = ?)`, intento, intento);
  if (!o && factura) o = await cobro(`id = ?`, factura);
  if (!o && cargo) o = await cobro(`cargo = ?`, cargo);
  if (!o && !ch && cargo) {
    const r = await stripe(env, 'GET', `/charges/${encodeURIComponent(cargo)}`);
    if (r.status === 404) return null;
    if (!r.ok) throw new Error(`Stripe no dio el cargo ${cargo} (${r.status})`);   // se reintenta: no se decide a ciegas
    ch = r.j;
  }
  if (!o && ch) {
    const fac = idDe(ch.invoice), pi = idDe(ch.payment_intent);
    if (fac) o = await cobro(`id = ?`, fac);
    if (!o && pi) o = await cobro(`(id = ? OR intento = ?)`, pi, pi);
  }
  if (o) return { o, persona: o.persona, correo: o.correo, tipo: o.tipo, suscripcion: o.suscripcion };
  if (!ch) return null;
  const c = await clienteNuestro(env, idDe(ch.customer));
  if (!c && ch.metadata?.app !== 'cupido') return null;
  const persona = c?.persona || ((await esPersona(env, ch.metadata?.persona)) ? String(ch.metadata.persona) : null);
  o = persona ? await uno(env, `SELECT * FROM cobros WHERE clase = 'cobro' AND persona = ? AND centavos = ? ORDER BY cuando DESC LIMIT 1`, persona, Number(ch.amount) || 0) : null;
  return { o, persona, correo: c?.correo || o?.correo || null, tipo: o?.tipo || c?.tipo || (ch.metadata?.tipo === 'socio' ? 'socio' : 'fondo'), suscripcion: o?.suscripcion || c?.suscripcion || null };
}
// Un aporte de una vez que se devolvió completo deja de salir en la lista de agradecimiento (y regresa si la devolución no pasó)
async function revisarDevuelto(env, o) {
  if (!o?.sesion || o.tipo !== 'fondo') return;
  const neto = o.centavos + ((await uno(env, `SELECT COALESCE(SUM(centavos), 0) AS s FROM cobros WHERE de = ? AND clase != 'cobro'`, o.id))?.s || 0);
  if (neto <= 0) await corre(env, `UPDATE aportes SET estado = 'devuelto' WHERE sid = ? AND estado = 'confirmado'`, o.sesion);
  else await corre(env, `UPDATE aportes SET estado = 'confirmado' WHERE sid = ? AND estado = 'devuelto'`, o.sesion);
}
async function verReembolso(env, re, evento, origen = null) {
  const cargo = idDe(re.charge), intento = idDe(re.payment_intent);
  const og = origen || await origenDe(env, { intento, cargo });
  if (!og) return false;
  if (['failed', 'canceled'].includes(re.status)) {
    // la devolución no pasó: el dinero sigue aquí
    if (await corre(env, `DELETE FROM cobros WHERE id = ? AND clase = 'devolucion'`, re.id)) await anotar(env, 'Una devolución no pasó y se quitó del libro', re.id);
  } else if (!re.status || re.status === 'succeeded') {
    const nuevo = await asentar(env, { id: re.id, clase: 'devolucion', tipo: og.tipo, centavos: -Math.abs(Number(re.amount) || 0), persona: og.persona, correo: og.correo, intento, cargo, factura: og.o?.factura, suscripcion: og.suscripcion, de: og.o?.id, cuando: fechaDe(re.created), evento });
    if (nuevo) await anotar(env, 'Se devolvió un apoyo', pesosDe(Math.abs(Number(re.amount) || 0)));
  }   // «pending»: todavía no sale el dinero; llegará otro evento o lo verá la conciliación
  if (og.o && cargo) await completar(env, og.o.id, { cargo });
  await revisarDevuelto(env, og.o);
  return true;
}
async function verCargoDevuelto(env, ch, evento) {
  const og = await origenDe(env, { intento: idDe(ch.payment_intent), cargo: ch.id, factura: idDe(ch.invoice) }, ch);
  if (!og) return false;
  let l = ch.refunds?.data;
  if (!Array.isArray(l) || !l.length) {
    const r = await stripe(env, 'GET', `/refunds?charge=${encodeURIComponent(ch.id)}&limit=100`);
    if (!r.ok) throw new Error(`Stripe no dio las devoluciones de ${ch.id} (${r.status})`);
    l = r.j.data || [];
  }
  for (const re of l) await verReembolso(env, re, evento, og);
  return true;
}
async function verDisputa(env, d, retiro, creado, evento) {
  const og = await origenDe(env, { intento: idDe(d.payment_intent), cargo: idDe(d.charge) });
  if (!og) return false;
  const monto = Math.abs(Number(d.amount) || 0);
  const nuevo = await asentar(env, { id: `${d.id}:${retiro ? 'retiro' : 'regreso'}`, clase: 'disputa', tipo: og.tipo, centavos: retiro ? -monto : monto, persona: og.persona, correo: og.correo, intento: idDe(d.payment_intent), cargo: idDe(d.charge), suscripcion: og.suscripcion, de: og.o?.id, cuando: fechaDe(creado), evento });
  if (nuevo) await anotar(env, retiro ? 'El banco retiró un cobro por una disputa' : 'El banco regresó el dinero de una disputa', pesosDe(monto));
  return true;
}

/* ── un evento de Stripe ─────────────────────────────────────────────────────
   Devuelve 'hecho', 'ajeno' (no es de Cupido), 'repetido' (ya se había procesado) o 'error' (se guardó y se reintentará). */
async function despachar(env, ev, op) {
  const o = ev.data?.object || {}, t = ev.type;
  if (t === 'checkout.session.expired' || t === 'checkout.session.async_payment_failed') {
    if (!(await uno(env, `SELECT 1 AS x FROM aportes WHERE sid = ?`, String(o.id || '')))) return false;
    await corre(env, `UPDATE aportes SET estado = ? WHERE sid = ? AND estado = 'pendiente'`, t.endsWith('expired') ? 'vencido' : 'fallido', o.id);
    return true;
  }
  if (t.startsWith('checkout.session.')) return !(await confirmarSesion(env, o, ev.created, ev.id, op)).ajeno;
  if (t.startsWith('customer.subscription.')) return verSuscripcion(env, o, ev.created, op);
  if (t === 'invoice.paid') return verFactura(env, o, ev.created, ev.id);
  if (t === 'invoice.payment_failed') return facturaFallida(env, o, ev.created);
  if (t === 'charge.refunded') return verCargoDevuelto(env, o, ev.id);
  if (t === 'refund.created' || t === 'refund.updated' || t === 'charge.refund.updated') return verReembolso(env, o, ev.id);
  if (t === 'charge.dispute.funds_withdrawn') return verDisputa(env, o, true, ev.created, ev.id);
  if (t === 'charge.dispute.funds_reinstated') return verDisputa(env, o, false, ev.created, ev.id);
  return false;
}
export async function procesarEvento(env, ev, via, op = {}) {
  if (!ev?.id || !TIPOS.includes(ev.type)) return 'ajeno';
  const ya = await uno(env, `SELECT estado FROM pagos_eventos WHERE id = ?`, ev.id);
  if (ya?.estado === 'hecho') return 'repetido';
  if (ya?.estado === 'ajeno') return 'ajeno';
  await corre(env, `INSERT INTO pagos_eventos (id, tipo, creado, via, estado, intentos) VALUES (?, ?, ?, ?, 'proceso', 1) ON CONFLICT(id) DO UPDATE SET intentos = pagos_eventos.intentos + 1, estado = 'proceso'`, ev.id, ev.type, Number(ev.created) || 0, via);
  try {
    const r = (await despachar(env, ev, op)) ? 'hecho' : 'ajeno';
    await corre(env, `UPDATE pagos_eventos SET estado = ?, error = NULL, hecho = datetime('now') WHERE id = ?`, r, ev.id);
    return r;
  } catch (e) {
    console.error('evento de Stripe', ev.id, ev.type, e?.message || e);
    await corre(env, `UPDATE pagos_eventos SET estado = 'error', error = ? WHERE id = ?`, String(e?.message || e).slice(0, 300), ev.id);
    return 'error';
  }
}

/* ── el aviso (webhook) ──────────────────────────────────────────────────── */
const enc = (s) => new TextEncoder().encode(s);
const hex = (b) => [...new Uint8Array(b)].map((x) => x.toString(16).padStart(2, '0')).join('');
const igual = (a, b) => { if (a.length !== b.length) return false; let d = 0; for (let i = 0; i < a.length; i++) d |= a.charCodeAt(i) ^ b.charCodeAt(i); return d === 0; };
// La firma de Stripe: HMAC-SHA256 de «hora.cuerpo» con el secreto del aviso, y la hora no puede ser vieja
export async function firmaValida(secretoFirma, cuerpo, cabecera, tolerancia = 300, hoy = Date.now() / 1000) {
  let t = 0; const v1 = [];
  for (const x of String(cabecera || '').split(',')) { const i = x.indexOf('='); if (i < 0) continue; const k = x.slice(0, i).trim(), v = x.slice(i + 1).trim(); if (k === 't') t = Number(v); else if (k === 'v1') v1.push(v); }
  if (!t || !v1.length || Math.abs(hoy - t) > tolerancia) return false;
  const llave = await crypto.subtle.importKey('raw', enc(secretoFirma), { name: 'HMAC', hash: 'SHA-256' }, false, ['sign']);
  const mac = hex(await crypto.subtle.sign('HMAC', llave, enc(`${t}.${cuerpo}`)));
  return v1.some((x) => igual(x, mac));
}
// Sin secreto de firma cada aviso cuesta una pregunta a Stripe: se le pone tope por minuto para que nadie nos use de martillo.
// Lo que no quepa no se pierde: lo recoge el jalón.
async function cupo(env, tope = 40) {
  const minuto = Math.floor(Date.now() / 60000), [m, n] = String((await leer(env, 'aviso_minuto')) || '').split(':').map(Number);
  const van = m === minuto ? (n || 0) + 1 : 1;
  await poner(env, 'aviso_minuto', `${minuto}:${van}`);
  return van <= tope;
}
export async function recibirAviso(env, cuerpo, firma, op = {}) {
  let ev; try { ev = JSON.parse(cuerpo); } catch { return { status: 400, error: 'No es un aviso.' }; }
  const id = String(ev?.id || '');
  if (!/^evt_[A-Za-z0-9_]{6,120}$/.test(id)) return { status: 400, error: 'No es un aviso.' };
  const sFirma = await secreto(env.STRIPE_WEBHOOK_SECRET);
  if (sFirma) {
    if (!(await firmaValida(sFirma, cuerpo, firma))) return { status: 400, error: 'La firma no coincide.' };
  } else {
    // No se le cree al cuerpo: solo se toma la clave, y el evento se le pide a Stripe con nuestra llave
    const ya = await uno(env, `SELECT estado FROM pagos_eventos WHERE id = ?`, id);
    if (ya?.estado === 'hecho' || ya?.estado === 'ajeno') return { status: 200, r: 'repetido' };
    if (!(await cupo(env))) return { status: 202, r: 'luego' };
    const r = await stripe(env, 'GET', `/events/${id}`);
    if (r.status === 404) return { status: 200, r: 'desconocido' };
    if (!r.ok) return { status: 503, error: 'Stripe no contestó; lo recoge la siguiente revisión.' };
    ev = r.j;
  }
  await poner(env, 'aviso', ev.type || '');
  const r = await procesarEvento(env, ev, 'aviso', op);
  return r === 'error' ? { status: 500, error: 'No se pudo procesar; se va a reintentar.' } : { status: 200, r };
}

/* ── el jalón: pedirle a Stripe lo nuevo ─────────────────────────────────────
   Lleva su lugar en «eventos_desde». Stripe entrega del más nuevo al más viejo, por páginas: si en una vuelta no
   alcanza a llegar hasta el lugar anterior, guarda dónde se quedó («relleno») y sigue en la siguiente; el lugar
   solo avanza cuando ya vio todo. Después reintenta los eventos que fallaron. */
export async function jalarEventos(env, op = {}) {
  const rep = { vistos: 0, nuestros: 0, errores: 0, reintentos: 0, completo: false };
  if (!(await hayPagos(env))) return { ...rep, error: 'sin llave' };
  let desde = Number(await leer(env, 'eventos_desde')) || 0;
  if (!desde) {
    // primera vez: desde el primer apoyo que exista (Stripe guarda 30 días de eventos); si no hay ninguno, desde hace una hora
    const primero = (await uno(env, `SELECT CAST(strftime('%s', MIN(creado)) AS INTEGER) AS t FROM aportes`))?.t;
    desde = Math.max(ahora() - 30 * 86400, primero ? primero - 3600 : ahora() - 3600);
  }
  let relleno = null; try { relleno = JSON.parse((await leer(env, 'relleno')) || 'null'); } catch { relleno = null; }
  let despues = relleno?.despues || null, tope = Math.max(desde, Number(relleno?.tope) || 0);
  const t0 = Number(relleno?.t0) || ahora();   // cuándo empezó esta barrida (si viene de un relleno, cuándo empezó aquel)
  const base = `/events?limit=100&created[gte]=${Math.max(0, desde - TRASLAPE)}${TIPOS.map((t) => `&types[]=${t}`).join('')}`;
  const eventos = [];
  for (let pag = 0; pag < (op.paginas || 5); pag++) {
    const r = await stripe(env, 'GET', base + (despues ? `&starting_after=${despues}` : ''));
    if (!r.ok) {
      const err = `${r.status} ${r.j?.error?.message || ''}`.trim().slice(0, 200);
      await poner(env, 'jalon_error', err);
      return { ...rep, error: err };
    }
    const l = r.j.data || [];
    eventos.push(...l);
    if (!r.j.has_more || !l.length) { rep.completo = true; break; }
    despues = l[l.length - 1].id;
  }
  // del más viejo al más nuevo, para que casi siempre lleguen en su orden (y si no, da igual)
  eventos.sort((a, b) => (a.created - b.created) || (a.id < b.id ? -1 : 1));
  for (const ev of eventos) {
    tope = Math.max(tope, Number(ev.created) || 0);
    const r = await procesarEvento(env, ev, 'jalon', op);
    rep.vistos++; if (r === 'hecho') rep.nuestros++; if (r === 'error') rep.errores++;
  }
  // Ya se vio todo hasta que empezó la barrida: el lugar avanza hasta ahí (menos un minuto de margen), aunque no haya habido eventos
  if (rep.completo) { await poner(env, 'eventos_desde', Math.max(tope, t0 - 60)); await poner(env, 'relleno', ''); }
  else await poner(env, 'relleno', JSON.stringify({ despues, tope, t0 }));
  // lo que falló o se quedó a medias en otra vuelta: se pide otra vez por su clave
  for (const f of await todos(env, `SELECT id, intentos FROM pagos_eventos WHERE estado IN ('error', 'proceso') AND intentos < 12 AND recibido < datetime('now', '-2 minutes') ORDER BY creado LIMIT 10`)) {
    const r = await stripe(env, 'GET', `/events/${f.id}`);
    if (r.status === 404) { await corre(env, `UPDATE pagos_eventos SET estado = 'perdido', error = 'Stripe ya no lo tiene' WHERE id = ?`, f.id); continue; }
    if (!r.ok) continue;
    rep.reintentos++;
    if ((await procesarEvento(env, r.j, 'reintento', op)) === 'error') rep.errores++;
  }
  await poner(env, 'jalon_ok', new Date().toISOString());
  await poner(env, 'jalon_error', '');
  return rep;
}
// ¿Toca jalar? Si hay alguien pagando en este momento, cada vuelta; si no, cada 15 minutos. Si la llave no tiene permiso, cada hora.
export async function tocaJalar(env) {
  if (!(await hayPagos(env))) return false;
  const ok = await uno(env, `SELECT at, valor FROM pagos_estado WHERE clave = 'jalon_ok'`), mal = await uno(env, `SELECT at, valor FROM pagos_estado WHERE clave = 'jalon_error'`);
  const hace = (f) => (f?.at ? (Date.now() - Date.parse(f.at.replace(' ', 'T') + 'Z')) / 60000 : Infinity);
  if (mal?.valor && /^(401|403)\b/.test(mal.valor)) return hace(mal) >= 60;
  if ((await uno(env, `SELECT 1 AS x FROM aportes WHERE estado = 'pendiente' AND creado > datetime('now', '-2 hours') LIMIT 1`))) return true;
  if (await leer(env, 'relleno')) return true;
  return hace(ok) >= 15;
}

/* ── la conciliación de cada día ─────────────────────────────────────────────
   Por si los eventos no bastaran: se le pregunta a Stripe directamente por lo que debería estar en el libro. */
export async function conciliar(env, op = {}) {
  const rep = { sesiones: 0, confirmadas: 0, suscripciones: 0, facturas: 0, devoluciones: 0, errores: [] };
  if (!(await hayPagos(env))) return { ...rep, errores: ['sin llave'] };
  const falla = (que, r) => rep.errores.push(`${que}: ${r.status} ${r.j?.error?.message || ''}`.trim().slice(0, 160));
  // 1. Sesiones que se quedaron «pendientes»: quizá se pagaron y la persona cerró la ventana antes de volver
  for (const a of await todos(env, `SELECT sid FROM aportes WHERE estado = 'pendiente' AND creado < datetime('now', '-20 minutes') AND creado > datetime('now', '-4 days') ORDER BY id LIMIT 25`)) {
    const r = await stripe(env, 'GET', `/checkout/sessions/${a.sid}`); rep.sesiones++;
    if (r.status === 404) continue;   // Stripe no la conoce (¿otra cuenta?): no se decide nada; a los cuatro días se da por vencida
    if (!r.ok) { falla('sesión', r); continue; }
    if ((await confirmarSesion(env, r.j, ahora(), null, op)).nuevo) rep.confirmadas++;
  }
  await corre(env, `UPDATE aportes SET estado = 'vencido' WHERE estado = 'pendiente' AND creado <= datetime('now', '-4 days')`);
  // 2. Socios confirmados de los que no se guardó la suscripción (los de antes de este libro)
  for (const a of await todos(env, `SELECT sid FROM aportes WHERE tipo = 'socio' AND estado = 'confirmado' AND suscripcion IS NULL LIMIT 10`)) {
    const r = await stripe(env, 'GET', `/checkout/sessions/${a.sid}`);
    if (r.ok) await confirmarSesion(env, r.j, r.j.created, null, op); else if (r.status !== 404) falla('sesión de socio', r);
  }
  // 3. Las suscripciones vivas, por turnos (las que llevan más tiempo sin revisarse): su estado de hoy y sus facturas pagadas
  for (const s of await todos(env, `SELECT id FROM suscripciones WHERE estado NOT IN ${FIN} ORDER BY COALESCE(revisada, '') LIMIT ?`, op.suscripciones || 15)) {
    const r = await stripe(env, 'GET', `/subscriptions/${s.id}`); rep.suscripciones++;
    // Si Stripe no la conoce no se da de baja a nadie por eso (puede ser que se cambió de cuenta de Stripe): se avisa y se deja como está
    if (r.status === 404) { rep.errores.push(`suscripción que Stripe no conoce: ${s.id}`); await corre(env, `UPDATE suscripciones SET revisada = datetime('now') WHERE id = ?`, s.id); continue; }
    if (!r.ok) { falla('suscripción', r); continue; }
    await verSuscripcion(env, r.j, ahora(), op);
    const f = await stripe(env, 'GET', `/invoices?subscription=${s.id}&status=paid&limit=12`);
    if (f.ok) for (const x of f.j.data || []) { const antes = await uno(env, `SELECT 1 AS x FROM cobros WHERE id = ?`, x.id); await verFactura(env, x, x.created, null); if (!antes && (await uno(env, `SELECT 1 AS x FROM cobros WHERE id = ?`, x.id))) rep.facturas++; }
    else falla('facturas', f);
    await corre(env, `UPDATE suscripciones SET revisada = datetime('now') WHERE id = ?`, s.id);
  }
  // 4. Las devoluciones de los últimos 35 días (la casa devuelve sin preguntas en 15). Las de cobros que conocemos se anotan;
  //    de las demás, que pueden ser de otra casa, se pregunta solo por unas cuantas en cada vuelta
  let despues = null, preguntas = 0;
  for (let pag = 0; pag < 3; pag++) {
    const r = await stripe(env, 'GET', `/refunds?limit=100&created[gte]=${ahora() - 35 * 86400}${despues ? `&starting_after=${despues}` : ''}`);
    if (!r.ok) { falla('devoluciones', r); break; }
    for (const re of r.j.data || []) {
      const cargo = idDe(re.charge), intento = idDe(re.payment_intent);
      const nuestro = await uno(env, `SELECT 1 AS x FROM cobros WHERE clase = 'cobro' AND (id = ? OR intento = ? OR cargo = ?) LIMIT 1`, intento || '', intento || '', cargo || '');
      if (!nuestro && (!(await uno(env, `SELECT 1 AS x FROM cobros WHERE clase = 'cobro' AND tipo = 'socio' AND intento IS NULL AND cargo IS NULL LIMIT 1`)) || preguntas++ >= 10)) continue;
      const antes = await uno(env, `SELECT 1 AS x FROM cobros WHERE id = ?`, re.id);
      try { await verReembolso(env, re, null); } catch (e) { rep.errores.push(String(e.message).slice(0, 120)); }
      if (!antes && (await uno(env, `SELECT 1 AS x FROM cobros WHERE id = ?`, re.id))) rep.devoluciones++;
    }
    if (!r.j.has_more || !(r.j.data || []).length) break;
    despues = r.j.data[r.j.data.length - 1].id;
  }
  // 5. Lo ajeno de hace más de dos meses ya no hace falta
  await corre(env, `DELETE FROM pagos_eventos WHERE estado = 'ajeno' AND recibido < datetime('now', '-60 days')`);
  await poner(env, 'conciliado', JSON.stringify({ ...rep, errores: rep.errores.slice(0, 5) }));
  if (rep.confirmadas || rep.facturas || rep.devoluciones) await anotar(env, 'La conciliación encontró movimientos que no habían llegado', `${rep.confirmadas} apoyos, ${rep.facturas} mensualidades, ${rep.devoluciones} devoluciones`);
  return rep;
}

/* ── lo que se lee del libro ─────────────────────────────────────────────── */
// Lo que entró, ya restado lo devuelto, en los últimos N días. En pesos.
export async function ingresoDe(env, dias = 30) {
  const r = await uno(env, `SELECT COALESCE(SUM(centavos), 0) AS total, COALESCE(SUM(CASE WHEN tipo = 'fondo' THEN centavos END), 0) AS fondo, COALESCE(SUM(CASE WHEN tipo = 'socio' THEN centavos END), 0) AS socio
    FROM cobros WHERE cuando >= datetime('now', ?)`, `-${Number(dias) || 30} days`);
  return { total: r.total / 100, fondo: r.fondo / 100, socio: r.socio / 100 };
}
export async function sociosVivos(env) {
  const r = await uno(env, `SELECT COALESCE(SUM(estado IN ${VIVAS}), 0) AS vivos, COALESCE(SUM(estado = 'past_due'), 0) AS atrasados, COALESCE(SUM(CASE WHEN estado IN ${VIVAS} THEN centavos END), 0) AS centavos FROM suscripciones`);
  return { vivos: r.vivos, atrasados: r.atrasados, alMes: r.centavos / 100 };
}
// Lo que se enseña en público: cuánto se ha reunido (neto), cuánta gente apoya y cuántos socios hay hoy
export async function resumenPublico(env) {
  const t = await uno(env, `SELECT COALESCE(SUM(centavos), 0) AS neto FROM cobros`);
  const p = await uno(env, `SELECT COUNT(*) AS n FROM (SELECT COALESCE(persona, correo) AS q FROM cobros GROUP BY q HAVING SUM(centavos) > 0)`);
  return { reunido: Math.max(0, Math.round(t.neto / 100)), personas: p.n, socios: (await sociosVivos(env)).vivos };
}
// Lo que una persona ha dado, para su tablero. Sin claves de Stripe: no le sirven y no hace falta enseñarlas.
export async function misApoyos(env, personaId) {
  const subs = await todos(env, `SELECT id, centavos, estado, desde, periodo_fin, cancela_al_final, baja FROM suscripciones WHERE persona = ? ORDER BY (estado IN ${VIVAS}) DESC, desde DESC LIMIT 6`, personaId);
  const mov = await todos(env, `SELECT clase, tipo, centavos, cuando FROM cobros WHERE persona = ? ORDER BY cuando DESC LIMIT 24`, personaId);
  const neto = (await uno(env, `SELECT COALESCE(SUM(centavos), 0) AS s FROM cobros WHERE persona = ?`, personaId)).s;
  return {
    total: neto / 100,
    socio: subs.map((s) => ({ id: s.id, monto: s.centavos / 100, estado: s.estado, viva: ['active', 'trialing', 'past_due'].includes(s.estado), desde: s.desde, sigue: s.periodo_fin, baja: s.baja })),
    movimientos: mov.map((m) => ({ clase: m.clase, tipo: m.tipo, monto: m.centavos / 100, cuando: m.cuando })),
  };
}
// El tope de cuidado se mide con lo que de verdad se cobró en 30 días (ya restado lo devuelto)
export async function dadoEn30(env, personaId) {
  return ((await uno(env, `SELECT COALESCE(SUM(centavos), 0) AS s FROM cobros WHERE persona = ? AND cuando >= datetime('now', '-30 days')`, personaId)).s || 0) / 100;
}
export const socioVivoDe = (env, personaId) => uno(env, `SELECT id, centavos, estado FROM suscripciones WHERE persona = ? AND estado IN ('active', 'trialing', 'past_due') ORDER BY desde DESC LIMIT 1`, personaId);

/* ── dejar de ser socio: un clic, sin preguntas ──────────────────────────── */
export async function darDeBaja(env, personaId, id, op = {}) {
  const S = await uno(env, `SELECT * FROM suscripciones WHERE id = ? AND persona = ?`, String(id || ''), personaId);
  if (!S) return { error: 'No encuentro ese apoyo.', status: 404 };
  if (['canceled', 'incomplete_expired'].includes(S.estado)) return { ok: true, ya: true };
  const r = await stripe(env, 'DELETE', `/subscriptions/${encodeURIComponent(S.id)}`, null, `cupido-baja-${S.id}`);
  const yaNoExiste = r.status === 404 || r.j?.error?.code === 'resource_missing';
  if (!r.ok && !yaNoExiste) return { error: 'No se pudo cancelar en este momento. Intenta otra vez en un minuto; si sigue igual, escríbenos y lo hacemos por ti hoy mismo.', status: 502 };
  await corre(env, `UPDATE suscripciones SET estado = 'canceled', baja = COALESCE(baja, datetime('now')), motivo = COALESCE(motivo, 'la persona'), cancela_al_final = 0, visto = ?, actualizado = datetime('now') WHERE id = ?`, ahora(), S.id);
  await anotar(env, 'Un socio fundador se dio de baja', 'desde su tablero');
  try { await op.alDarDeBaja?.({ persona: personaId, suscripcion: S.id, monto: S.centavos / 100 }); } catch (e) { console.error('aviso de baja', e?.message || e); }
  return { ok: true, monto: S.centavos / 100 };
}

/* ── cómo está el libro (para el panel y para /gtm) ──────────────────────── */
export async function saludPagos(env) {
  const f = Object.fromEntries((await todos(env, `SELECT clave, valor, at FROM pagos_estado`)).map((x) => [x.clave, x]));
  const ev = await uno(env, `SELECT COALESCE(SUM(estado = 'error'), 0) AS errores, COALESCE(SUM(estado = 'perdido'), 0) AS perdidos, COALESCE(SUM(estado = 'hecho'), 0) AS hechos FROM pagos_eventos`);
  const pend = (await uno(env, `SELECT COUNT(*) AS n FROM aportes WHERE estado = 'pendiente' AND creado < datetime('now', '-30 minutes')`)).n;
  const jalon = f.jalon_ok?.valor || null, error = f.jalon_error?.valor || '';
  const minutos = jalon ? Math.round((Date.now() - Date.parse(jalon)) / 60000) : null;
  let conciliado = null; try { conciliado = f.conciliado ? { at: f.conciliado.at, ...JSON.parse(f.conciliado.valor || '{}') } : null; } catch { conciliado = null; }
  const llave = await hayPagos(env);
  // Al día: hay llave, el último jalón salió bien hace menos de una hora y no hay eventos atorados
  const alDia = llave && !error && minutos != null && minutos <= 60 && !ev.errores && !ev.perdidos;
  return { llave, alDia, jalon, minutos, error, aviso: f.aviso ? { tipo: f.aviso.valor, at: f.aviso.at } : null, firma: !!(await secreto(env.STRIPE_WEBHOOK_SECRET)),
    eventos: { hechos: ev.hechos, errores: ev.errores, perdidos: ev.perdidos }, pendientes: pend, relleno: !!f.relleno?.valor, conciliado };
}
// Para una cuenta administradora: los últimos renglones del libro y las suscripciones. «conQuien» decide si se enseña de quién es cada uno.
export async function libroAdmin(env, conQuien) {
  const cobros = await todos(env, `SELECT id, clase, tipo, centavos, persona, correo, cuando FROM cobros ORDER BY cuando DESC, anotado DESC LIMIT 100`);
  const subs = await todos(env, `SELECT id, persona, correo, centavos, estado, desde, periodo_fin, baja, motivo FROM suscripciones ORDER BY desde DESC LIMIT 100`);
  const fallos = await todos(env, `SELECT id, tipo, estado, intentos, error, recibido FROM pagos_eventos WHERE estado IN ('error', 'perdido', 'proceso') ORDER BY recibido DESC LIMIT 20`);
  const q = (x) => (conQuien ? x.correo || x.persona || '' : '');
  return {
    cobros: cobros.map((c) => ({ clase: c.clase, tipo: c.tipo, monto: c.centavos / 100, cuando: c.cuando, quien: q(c), clave: conQuien ? c.id : '' })),
    suscripciones: subs.map((s) => ({ monto: s.centavos / 100, estado: s.estado, desde: s.desde, sigue: s.periodo_fin, baja: s.baja, motivo: s.motivo, quien: q(s), clave: conQuien ? s.id : '' })),
    fallos: conQuien ? fallos : fallos.map((x) => ({ tipo: x.tipo, estado: x.estado, intentos: x.intentos, recibido: x.recibido })),
  };
}
// fin · RLR
