/* ─────────────────────────────────────────────────────────────────────────────
   Cupido Algorítmico · La charla en vivo (Durable Object)
   Autor: Ricardo López Reyero
   Un objeto por charla. Sostiene los WebSockets de los dos y reparte eventos:
   mensaje nuevo, reacción, visto, "está escribiendo" y presencia. La verdad
   sigue en D1; aquí solo viaja la señal, por eso es rápido y barato.

   Y la llamada de voz. El audio no va de un teléfono al otro: pasa por aquí.
   Cada quien abre un segundo WebSocket ("voz") y este objeto le entrega al
   otro lo que recibe, cuadro por cuadro. Así ninguno conoce la dirección de
   internet del otro ni su número, y la llamada funciona detrás de cualquier
   red. La llamada tiene dueño: nace sonando, se contesta o se apaga sola a
   los 35 segundos, y al terminar deja su renglón en la charla.
   ───────────────────────────────────────────────────────────────────────────── */
// RLR
export const _RLR = 'Ricardo López Reyero';
const _k = 'EYE', _rev = 181218;

const SUENA_MS = 35000;          // cuánto suena antes de darse por no contestada
const GRACIA_MS = 12000;         // si a alguien se le cae la red, cuánto se le espera
const REVISION_MS = 30000;       // cada cuánto se revisa una llamada viva
const MAXIMO_MS = 3 * 3600000;   // tope de una sola llamada
const INTENTOS_HORA = 4;         // llamadas sin contestar de la misma persona, por hora

export class CharlaViva {
  constructor(state, env) { this.state = state; this.env = env; this.ll = undefined; }

  async fetch(req) {
    const url = new URL(req.url);
    if (url.pathname === '/ws') {
      const persona = req.headers.get('x-persona');
      if (!persona || req.headers.get('upgrade')?.toLowerCase() !== 'websocket') return new Response('Se esperaba WebSocket', { status: 426 });
      const par = new WebSocketPair();
      const [cliente, servidor] = Object.values(par);
      this.state.acceptWebSocket(servidor, [persona]);
      const discreta = req.headers.get('x-discreta') === '1'; // modo discreta: no se anuncia que llegó, que se fue ni que escribe
      servidor.serializeAttachment({ persona, discreta, desde: Date.now() });
      if (!discreta) this.difundir({ t: 'presencia', persona, en: true }, persona);
      // si entra a media llamada (otra pestaña, otro dispositivo, o recargó), que se entere
      const ll = await this.llamada();
      if (ll && [ll.de, ll.para].includes(persona)) { try { servidor.send(JSON.stringify({ t: 'llamada', fase: ll.estado, id: ll.id, de: ll.de, desde: ll.activa || ll.inicio })); } catch {} }
      return new Response(null, { status: 101, webSocket: cliente });
    }
    if (url.pathname === '/voz') {
      // el canal del audio: solo entra quien está en una llamada ya contestada
      const persona = req.headers.get('x-persona');
      if (!persona || req.headers.get('upgrade')?.toLowerCase() !== 'websocket') return new Response('Se esperaba WebSocket', { status: 426 });
      const ll = await this.llamada();
      if (!ll || ll.estado !== 'activa' || ![ll.de, ll.para].includes(persona)) return new Response('No hay una llamada contestada', { status: 409 });
      const par = new WebSocketPair();
      const [cliente, servidor] = Object.values(par);
      const otra = ll.de === persona ? ll.para : ll.de;
      this.state.acceptWebSocket(servidor, ['voz', 'voz:' + persona]);
      servidor.serializeAttachment({ persona, voz: true, otra });
      if (ll.cortado === persona) { ll.cortado = null; await this.guardar(ll); this.difundir({ t: 'llamada', fase: 'activa', id: ll.id, de: ll.de, desde: ll.activa, regreso: persona }); }
      return new Response(null, { status: 101, webSocket: cliente });
    }
    if (url.pathname === '/llamada' && req.method === 'POST') {
      const r = await this.accion(await req.json());
      return new Response(JSON.stringify(r), { status: r.error ? r.status || 400 : 200, headers: { 'content-type': 'application/json' } });
    }
    if (url.pathname === '/evento' && req.method === 'POST') {
      const ev = await req.json();
      if (ev.t === 'cerrada') await this.fin('cerrada'); // la puerta se cerró a media llamada: se corta
      this.difundir(ev, ev.excepto || null);
      if (ev.t === 'cerrada') for (const ws of this.state.getWebSockets()) { try { ws.close(1000, 'cerrada'); } catch {} } // nadie se queda escuchando
      return new Response('ok');
    }
    if (url.pathname === '/presencia') {
      return new Response(JSON.stringify(this.presentes()), { headers: { 'content-type': 'application/json' } });
    }
    return new Response('No', { status: 404 });
  }

  // quién tiene la charla abierta (los canales de voz no cuentan como presencia)
  presentes(soloVisibles = false, para = null) {
    return [...new Set(this.state.getWebSockets().map((w) => w.deserializeAttachment()).filter((x) => x?.persona && !x.voz && (!soloVisibles || !x.discreta || x.persona === para)).map((x) => x.persona))];
  }

  /* ── la llamada de voz ─────────────────────────────────────────────────── */
  async llamada() { if (this.ll === undefined) this.ll = (await this.state.storage.get('llamada')) || null; return this.ll; }
  async guardar(ll) { this.ll = ll; if (ll) await this.state.storage.put('llamada', ll); else await this.state.storage.delete('llamada'); }

  async accion({ accion, persona, a, b }) {
    let ll = await this.llamada();
    const otra = persona === a ? b : a, ahora = Date.now();
    if (ll && ll.estado === 'suena' && ahora - ll.inicio > SUENA_MS + 5000) { await this.fin('sin_contestar'); ll = null; } // se quedó colgada: se limpia
    if (accion === 'llamar') {
      if (ll) return ll.de === persona || ll.para === persona ? { error: 'Ya hay una llamada en esta charla.', status: 409 } : { error: 'Ocupado', status: 409 };
      const intentos = ((await this.state.storage.get('intentos')) || []).filter((x) => ahora - x.t < 3600000);
      if (intentos.filter((x) => x.de === persona).length >= INTENTOS_HORA) return { error: 'Ya llamaste varias veces sin respuesta. Mejor escríbele, y que conteste cuando pueda.', status: 429 };
      ll = { id: ahora.toString(36) + Math.random().toString(36).slice(2, 6), de: persona, para: otra, a, b, estado: 'suena', inicio: ahora, activa: null, cortado: null };
      await this.guardar(ll);
      await this.state.storage.setAlarm(ahora + SUENA_MS);
      this.difundir({ t: 'llamada', fase: 'suena', id: ll.id, de: persona, desde: ahora });
      return { ok: true, id: ll.id, enLinea: this.presentes().includes(otra) };
    }
    if (!ll || ![ll.de, ll.para].includes(persona)) return { error: 'Esa llamada ya terminó.', status: 404 };
    if (accion === 'contestar') {
      if (ll.estado !== 'suena' || ll.para !== persona) return { error: 'Esa llamada ya no está sonando.', status: 409 };
      ll.estado = 'activa'; ll.activa = ahora; await this.guardar(ll);
      await this.state.storage.setAlarm(ahora + REVISION_MS);
      this.difundir({ t: 'llamada', fase: 'activa', id: ll.id, de: ll.de, desde: ahora });
      return { ok: true, id: ll.id };
    }
    if (accion === 'rechazar') { if (ll.estado === 'suena' && ll.para === persona) await this.fin('sin_contestar'); return { ok: true }; }
    if (accion === 'colgar') { await this.fin(ll.estado === 'activa' ? 'terminada' : ll.de === persona ? 'cancelada' : 'sin_contestar'); return { ok: true }; }
    return { error: 'Acción inválida', status: 400 };
  }

  // Cierra la llamada, deja su renglón en la charla y avisa a los dos.
  // Para quien llamó, "no contestó" y "prefirió no contestar" se ven igual: nadie se entera de un no.
  async fin(motivo) {
    const ll = await this.llamada(); if (!ll) return;
    const hecha = ll.estado === 'activa', seg = hecha ? Math.max(1, Math.round((Date.now() - ll.activa) / 1000)) : 0;
    await this.guardar(null);
    try { await this.state.storage.deleteAlarm(); } catch {}
    for (const ws of this.state.getWebSockets('voz')) { try { ws.close(1000, 'fin'); } catch {} }
    if (!hecha) { const intentos = ((await this.state.storage.get('intentos')) || []).filter((x) => Date.now() - x.t < 3600000); intentos.push({ de: ll.de, t: Date.now() }); await this.state.storage.put('intentos', intentos.slice(-20)); }
    let id = null;
    if (motivo !== 'cerrada') {
      try {
        const r = await this.env.DB.prepare(`INSERT INTO mensajes (a, b, de, tipo, texto, archivo) VALUES (?, ?, ?, 'llamada', ?, ?)`)
          .bind(ll.a, ll.b, ll.de, hecha ? 'Llamada de voz' : 'Llamada sin contestar', JSON.stringify({ estado: hecha ? 'hecha' : 'perdida', duracion: seg })).run();
        id = r.meta.last_row_id;
      } catch (e) { console.error('llamada', e.message); }
    }
    this.difundir({ t: 'llamada', fase: 'fin', id: ll.id, de: ll.de, motivo: hecha ? 'terminada' : 'sin_contestar', duracion: seg });
    if (id) this.difundir({ t: 'mensaje', id, de: ll.de, tipo: 'llamada', vista: hecha ? '📞 Llamada de voz' : '📞 Llamada sin contestar' });
  }

  async alarm() {
    const ll = await this.llamada(); if (!ll) return;
    const ahora = Date.now();
    if (ll.estado === 'suena') { await this.fin('sin_contestar'); return; }
    const conVoz = (p) => this.state.getWebSockets('voz:' + p).length > 0;
    if (ll.cortado && !conVoz(ll.cortado) && ahora - ll.cortadoEn >= GRACIA_MS - 500) { await this.fin('terminada'); return; }
    if (ahora - ll.activa > 20000 && (!conVoz(ll.de) || !conVoz(ll.para)) && !ll.cortado) { await this.fin('terminada'); return; } // alguien nunca conectó su audio
    if (ahora - ll.activa > MAXIMO_MS) { await this.fin('terminada'); return; }
    await this.state.storage.setAlarm(ahora + (ll.cortado ? 2000 : REVISION_MS));
  }

  async webSocketMessage(ws, msg) {
    const att = ws.deserializeAttachment() || {};
    if (att.voz) { // audio (o el saludo de códecs): se entrega tal cual al canal de voz de la otra persona
      for (const w of this.state.getWebSockets('voz:' + att.otra)) { try { w.send(msg); } catch {} }
      return;
    }
    if (typeof msg !== 'string') return;
    let ev; try { ev = JSON.parse(msg); } catch { return; }
    const { persona, discreta } = att;
    if (!persona) return;
    if (ev.t === 'ping') { try { ws.send('{"t":"pong"}'); } catch {} return; }
    if (ev.t === 'escribiendo' && !discreta) this.difundir({ t: 'escribiendo', persona, on: !!ev.on }, persona);
    if (ev.t === 'quien') { try { ws.send(JSON.stringify({ t: 'quien', en: this.presentes(true, persona) })); } catch {} }
  }
  async webSocketClose(ws) { await this.despedir(ws); }
  async webSocketError(ws) { await this.despedir(ws); }
  async despedir(ws) {
    const { persona, discreta, voz } = ws.deserializeAttachment() || {};
    try { ws.close(); } catch {}
    if (!persona) return;
    if (voz) { // se le cayó el audio a media llamada: se le espera un momento antes de colgar
      const ll = await this.llamada();
      const sigue = this.state.getWebSockets('voz:' + persona).some((w) => w !== ws);
      if (ll && ll.estado === 'activa' && !sigue && !ll.cortado) {
        ll.cortado = persona; ll.cortadoEn = Date.now(); await this.guardar(ll);
        await this.state.storage.setAlarm(Date.now() + GRACIA_MS);
        this.difundir({ t: 'llamada', fase: 'reconectando', id: ll.id, de: ll.de, quien: persona });
      }
      return;
    }
    if (discreta) return;
    // sigue "en línea" si tiene otra pestaña abierta
    const sigue = this.state.getWebSockets().some((w) => { const x = w.deserializeAttachment(); return w !== ws && x?.persona === persona && !x.voz; });
    if (!sigue) this.difundir({ t: 'presencia', persona, en: false }, persona);
  }
  // Los eventos de la charla van a los canales de charla, nunca a los de voz
  difundir(ev, excepto) {
    const txt = JSON.stringify(ev);
    for (const ws of this.state.getWebSockets()) {
      const { persona, voz } = ws.deserializeAttachment() || {};
      if (voz || (excepto && persona === excepto)) continue;
      try { ws.send(txt); } catch {}
    }
  }
}

// Desde el Worker: avisar a la charla en vivo (nunca falla hacia afuera)
export async function avisarVivo(env, a, b, ev) {
  try {
    const id = env.CHARLA_VIVA.idFromName(`${a}|${b}`);
    await env.CHARLA_VIVA.get(id).fetch('https://viva/evento', { method: 'POST', headers: { 'content-type': 'application/json' }, body: JSON.stringify(ev) });
  } catch (e) { console.warn('viva', e.message); }
}
export async function presenciaVivo(env, a, b) {
  try { return await (await env.CHARLA_VIVA.get(env.CHARLA_VIVA.idFromName(`${a}|${b}`)).fetch('https://viva/presencia')).json(); }
  catch { return []; }
}
// La llamada: el Worker valida la puerta y el permiso de ella; el objeto lleva la llamada
export async function llamadaVivo(env, a, b, cuerpo) {
  const r = await env.CHARLA_VIVA.get(env.CHARLA_VIVA.idFromName(`${a}|${b}`)).fetch('https://viva/llamada', { method: 'POST', headers: { 'content-type': 'application/json' }, body: JSON.stringify({ ...cuerpo, a, b }) });
  return r.json();
}
// fin · RLR
