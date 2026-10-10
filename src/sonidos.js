/* ─────────────────────────────────────────────────────────────────────────────
   Cupido Algorítmico · Los sonidos: se crean con ElevenLabs (efectos de sonido)
   una sola vez, se guardan en R2 y se sirven como archivos estáticos cacheados.
   Autor: Ricardo López Reyero
   La familia sonora: cálida, corta, de madera y campana suave, nunca estridente.
   ───────────────────────────────────────────────────────────────────────────── */
// RLR
import { anotar } from './datos.js';

export const _RLR = 'Ricardo López Reyero';
const _k = 'EYE', _rev = 181218;

const ESTILO = 'Soft, warm, premium app UI sound. Clean, gentle, intimate, no music, no voice, no reverb tail, high quality, subtle.';
export const PROMPTS = {
  mensaje:      { d: 1.0, p: `${ESTILO} A single gentle two-note wooden marimba notification, like a soft "dup-ding" for an incoming chat message.` },
  enviado:      { d: 0.6, p: `${ESTILO} A very short soft airy "swoosh" with a tiny tick at the end, a message being sent.` },
  reaccion:     { d: 0.5, p: `${ESTILO} A tiny soft bubble pop, playful and light, like a heart reaction appearing.` },
  sticker:      { d: 0.6, p: `${ESTILO} A soft rounded "plop" with a little bounce, a sticker landing on a chat.` },
  voz_inicio:   { d: 0.6, p: `${ESTILO} A short rising two-tone soft chime meaning "recording started".` },
  voz_fin:      { d: 0.6, p: `${ESTILO} A short falling two-tone soft chime meaning "recording stopped".` },
  timbre:       { d: 2.2, p: `${ESTILO} A gentle, friendly incoming-call ringtone: a warm marimba playing a short happy four-note phrase twice. Inviting, clearly a phone ringing, never harsh.` },
  marcando:     { d: 1.0, p: `${ESTILO} A soft outgoing-call ringback tone: two short low warm pulses, calm and patient, like waiting for someone to pick up.` },
  colgar:       { d: 0.6, p: `${ESTILO} A short soft descending two-note tone meaning "call ended", gentle and final.` },
  detalle:      { d: 1.3, p: `${ESTILO} A tiny gift arriving: a soft warm shimmer of small bells with a gentle rising sparkle, affectionate and light, like receiving a flower.` },
  carta:        { d: 0.8, p: `${ESTILO} A single playing card being flipped over on a wooden table followed by one soft warm chime, a reveal.` },
  tono:         { d: 2.0, p: `${ESTILO} A warm, intimate rising glow: a soft harp-like run of four notes ending in a gentle shimmering chord, the moment two people both say yes to flirting. Tender, not loud.` },
  en_linea:     { d: 0.5, p: `${ESTILO} A single very quiet soft glass tap, a presence indicator turning on.` },
  coincidencia: { d: 2.2, p: `${ESTILO} A warm, delighted rising three-note chime on soft bells with a gentle sparkle, the moment someone special is found. Hopeful, not loud.` },
  si:           { d: 0.9, p: `${ESTILO} A soft affirmative double chime, like a heartfelt "yes", warm wooden tone.` },
  puerta:       { d: 2.6, p: `${ESTILO} A soft wooden door gently opening followed by a warm glowing chord of bells, intimate and joyful, like two people meeting.` },
  logro:        { d: 1.4, p: `${ESTILO} A bright but soft achievement chime, three ascending notes on a music box, satisfying.` },
  hito:         { d: 1.6, p: `${ESTILO} A gentle celebratory sparkle, a short glissando of tiny bells, warm and brief.` },
  toque:        { d: 0.5, p: `${ESTILO} A very short soft wooden tick, a button being tapped.` },
  guardado:     { d: 0.6, p: `${ESTILO} A quiet reassuring soft "tick-tock" confirm, something saved.` },
  aviso:        { d: 0.9, p: `${ESTILO} A gentle two-note notification bell, polite, like a soft doorbell far away.` },
  error:        { d: 0.7, p: `${ESTILO} A soft low muted "bonk", apologetic, not harsh, something could not be done.` },
  estilo:       { d: 0.5, p: `${ESTILO} A soft colorful "pling", like a paint drop, for choosing a color.` },
  paso:         { d: 0.5, p: `${ESTILO} A soft page-turn whisper with a tiny tick, moving to the next step.` },
  bienvenida:   { d: 2.4, p: `${ESTILO} A warm welcoming short chord on soft bells and a gentle breath of air, like a door opening to a calm place. Elegant.` },
  gracias:      { d: 2.0, p: `${ESTILO} A heartfelt grateful short chord on a warm music box with a tiny sparkle, a sincere thank you.` },
};

async function secreto(v) { if (!v) return ''; if (typeof v === 'string') return v; try { return (await v.get()) || ''; } catch { return ''; } }

// Crea (o vuelve a crear) un sonido con ElevenLabs y lo guarda en R2
export async function generarSonido(env, id) {
  const P = PROMPTS[id]; if (!P) return { error: 'No existe ese sonido', status: 404 };
  const llave = await secreto(env.ELEVENLABS_API_KEY); if (!llave) return { error: 'Sin llave de ElevenLabs', status: 503 };
  const r = await fetch('https://api.elevenlabs.io/v1/sound-generation?output_format=mp3_44100_128', {
    method: 'POST', headers: { 'xi-api-key': llave, 'content-type': 'application/json' },
    body: JSON.stringify({ text: P.p, duration_seconds: P.d, prompt_influence: 0.5 }), signal: AbortSignal.timeout(60000),
  });
  if (!r.ok) { const t = await r.text(); console.error('elevenlabs', r.status, t.slice(0, 200)); return { error: `ElevenLabs ${r.status}: ${t.slice(0, 120)}`, status: 502 }; }
  const mp3 = await r.arrayBuffer();
  await env.MEDIOS.put(`sonidos/${id}.mp3`, mp3, { httpMetadata: { contentType: 'audio/mpeg', cacheControl: 'public, max-age=31536000, immutable' } });
  await anotar(env, 'sistema', 'Se generó un sonido con ElevenLabs', `${id} · ${Math.round(mp3.byteLength / 1024)} KB`);
  return { ok: true, id, bytes: mp3.byteLength };
}

export async function servirSonido(env, id) {
  if (!PROMPTS[id]) return new Response('No existe', { status: 404 });
  const obj = await env.MEDIOS.get(`sonidos/${id}.mp3`);
  if (!obj) return new Response('Aún no se genera', { status: 404 });
  return new Response(obj.body, { headers: { 'content-type': 'audio/mpeg', 'cache-control': 'public, max-age=31536000, immutable', 'access-control-allow-origin': '*', etag: obj.httpEtag } });
}
export async function estadoSonidos(env) {
  const lista = await env.MEDIOS.list({ prefix: 'sonidos/' });
  const hay = new Map(lista.objects.map((o) => [o.key.replace('sonidos/', '').replace('.mp3', ''), o.size]));
  return Object.keys(PROMPTS).map((id) => ({ id, bytes: hay.get(id) || 0, listo: hay.has(id) }));
}
// fin · RLR
