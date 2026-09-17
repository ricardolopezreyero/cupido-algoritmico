/* ─────────────────────────────────────────────────────────────────────────────
   Cupido Algorítmico · La charla en vivo (Durable Object)
   Autor: Ricardo López Reyero
   Un objeto por charla. Sostiene los WebSockets de los dos y reparte eventos:
   mensaje nuevo, reacción, visto, "está escribiendo" y presencia. La verdad
   sigue en D1; aquí solo viaja la señal, por eso es rápido y barato.
   ───────────────────────────────────────────────────────────────────────────── */
// RLR
export const _RLR = 'Ricardo López Reyero';
const _k = 'EYE', _rev = 181218;

export class CharlaViva {
  constructor(state, env) { this.state = state; this.env = env; }

  async fetch(req) {
    const url = new URL(req.url);
    if (url.pathname === '/ws') {
      const persona = req.headers.get('x-persona');
      if (!persona || req.headers.get('upgrade')?.toLowerCase() !== 'websocket') return new Response('Se esperaba WebSocket', { status: 426 });
      const par = new WebSocketPair();
      const [cliente, servidor] = Object.values(par);
      this.state.acceptWebSocket(servidor, [persona]);
      servidor.serializeAttachment({ persona, desde: Date.now() });
      this.difundir({ t: 'presencia', persona, en: true }, persona);
      return new Response(null, { status: 101, webSocket: cliente });
    }
    if (url.pathname === '/evento' && req.method === 'POST') {
      const ev = await req.json();
      this.difundir(ev, ev.excepto || null);
      return new Response('ok');
    }
    if (url.pathname === '/presencia') {
      const en = [...new Set(this.state.getWebSockets().map((ws) => ws.deserializeAttachment()?.persona).filter(Boolean))];
      return new Response(JSON.stringify(en), { headers: { 'content-type': 'application/json' } });
    }
    return new Response('No', { status: 404 });
  }

  webSocketMessage(ws, msg) {
    let ev; try { ev = JSON.parse(msg); } catch { return; }
    const { persona } = ws.deserializeAttachment() || {};
    if (!persona) return;
    if (ev.t === 'ping') { try { ws.send('{"t":"pong"}'); } catch {} return; }
    if (ev.t === 'escribiendo') this.difundir({ t: 'escribiendo', persona, on: !!ev.on }, persona);
    if (ev.t === 'quien') { const en = [...new Set(this.state.getWebSockets().map((w) => w.deserializeAttachment()?.persona).filter(Boolean))]; try { ws.send(JSON.stringify({ t: 'quien', en })); } catch {} }
  }
  webSocketClose(ws) { this.despedir(ws); }
  webSocketError(ws) { this.despedir(ws); }
  despedir(ws) {
    const { persona } = ws.deserializeAttachment() || {};
    try { ws.close(); } catch {}
    if (!persona) return;
    // sigue "en línea" si tiene otra pestaña abierta
    const sigue = this.state.getWebSockets().some((w) => w !== ws && w.deserializeAttachment()?.persona === persona);
    if (!sigue) this.difundir({ t: 'presencia', persona, en: false }, persona);
  }
  difundir(ev, excepto) {
    const txt = JSON.stringify(ev);
    for (const ws of this.state.getWebSockets()) {
      const { persona } = ws.deserializeAttachment() || {};
      if (excepto && persona === excepto) continue;
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
// fin · RLR
