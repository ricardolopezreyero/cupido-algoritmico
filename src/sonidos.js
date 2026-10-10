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

/* ── La música de fondo de los videos para compartir ────────────────────────
   Cuatro fondos cortos, hechos con ElevenLabs una sola vez y guardados en R2.
   De ahí se bajan a public/musica/ y se mezclan en los videos (scripts/videos-compartir.mjs).
   Primero se intenta el compositor de música; si esa llave no lo tiene, se usa el de efectos.     */
const FONDO = 'Instrumental background music for a short, heartfelt social video about finding real love. Minimal, warm, intimate and hopeful. No vocals, no lyrics, no sound effects. Starts gently right away and resolves softly at the end.';
export const MUSICA = {
  piano:    { n: 'Piano', d: 16, p: `${FONDO} Solo felt piano at a slow tempo: a simple, tender melody in a major key over soft sustained chords.` },
  guitarra: { n: 'Guitarra', d: 16, p: `${FONDO} Fingerpicked nylon-string acoustic guitar, slow and gentle: sweet, calm arpeggios with a little warm room reverb.` },
  cuerdas:  { n: 'Cuerdas', d: 16, p: `${FONDO} A soft string ensemble swelling slowly, with a few delicate piano notes on top. Emotional and cinematic, but quiet.` },
  ritmo:    { n: 'Ritmo suave', d: 16, p: `${FONDO} Mellow lo-fi: warm electric piano chords and a soft brushed beat at a slow tempo. Cozy, modern, light and optimistic.` },
};
const INTENTOS_MUSICA = 3;   // por fondo: si ElevenLabs falla tres veces, no se insiste sola (cada intento puede costar créditos)

export async function generarMusica(env, id) {
  const M = MUSICA[id]; if (!M) return { error: 'No existe esa música', status: 404 };
  const llave = await secreto(env.ELEVENLABS_API_KEY); if (!llave) return { error: 'Sin llave de ElevenLabs', status: 503 };
  const cab = { 'xi-api-key': llave, 'content-type': 'application/json' };
  let mp3 = null, motor = '', falla = '';
  for (const cuerpo of [{ prompt: M.p, music_length_ms: M.d * 1000, force_instrumental: true }, { prompt: M.p, music_length_ms: M.d * 1000 }]) {
    try {
      const r = await fetch('https://api.elevenlabs.io/v1/music?output_format=mp3_44100_128', { method: 'POST', headers: cab, body: JSON.stringify(cuerpo), signal: AbortSignal.timeout(120000) });
      if (r.ok) { mp3 = await r.arrayBuffer(); motor = 'musica'; break; }
      falla = `música ${r.status}: ${(await r.text()).slice(0, 160)}`;
      if (r.status !== 400 && r.status !== 422) break;   // si no es un problema del pedido, repetirlo no ayuda
    } catch (e) { falla = 'música: ' + e.message; break; }
  }
  if (!mp3) {
    try {
      const r = await fetch('https://api.elevenlabs.io/v1/sound-generation?output_format=mp3_44100_128', { method: 'POST', headers: cab, body: JSON.stringify({ text: M.p, duration_seconds: Math.min(M.d, 22), prompt_influence: 0.4 }), signal: AbortSignal.timeout(120000) });
      if (r.ok) { mp3 = await r.arrayBuffer(); motor = 'efectos'; } else falla += ` · efectos ${r.status}: ${(await r.text()).slice(0, 160)}`;
    } catch (e) { falla += ' · efectos: ' + e.message; }
  }
  if (!mp3) { console.error('elevenlabs música', id, falla); await anotar(env, 'sistema', 'No se pudo crear una música con ElevenLabs', `${id} · ${falla}`.slice(0, 400)); return { error: `ElevenLabs: ${falla}`.slice(0, 300), status: 502 }; }
  await env.MEDIOS.put(`musica/${id}.mp3`, mp3, { httpMetadata: { contentType: 'audio/mpeg', cacheControl: 'public, max-age=300' }, customMetadata: { motor, creada: new Date().toISOString() } });
  await anotar(env, 'sistema', 'Se creó una música con ElevenLabs', `${id} · ${motor} · ${Math.round(mp3.byteLength / 1024)} KB`);
  return { ok: true, id, motor, bytes: mp3.byteLength };
}
export async function servirMusica(env, id) {
  if (!MUSICA[id]) return new Response('No existe', { status: 404 });
  const obj = await env.MEDIOS.get(`musica/${id}.mp3`);
  if (!obj) return new Response('Aún no se crea', { status: 404 });
  return new Response(obj.body, { headers: { 'content-type': 'audio/mpeg', 'cache-control': 'public, max-age=300', 'access-control-allow-origin': '*', etag: obj.httpEtag, 'x-motor': obj.customMetadata?.motor || '', 'x-creada': obj.customMetadata?.creada || '' } });
}
export async function estadoMusica(env) {
  const lista = await env.MEDIOS.list({ prefix: 'musica/' });
  const hay = new Map(lista.objects.map((o) => [o.key.replace('musica/', '').replace('.mp3', ''), o.size]));
  return Object.entries(MUSICA).map(([id, m]) => ({ id, n: m.n, bytes: hay.get(id) || 0, lista: hay.has(id) }));
}
// La que falte se crea sola (la llama la tarea de cada tres minutos). Con todo creado, esto es una sola consulta a R2.
export async function asegurarMusica(env) {
  const faltan = (await estadoMusica(env)).filter((m) => !m.lista); if (!faltan.length) return 0;
  let intentos = {}; try { intentos = (await (await env.MEDIOS.get('musica/_intentos.json'))?.json()) || {}; } catch { /* primera vez */ }
  let hechas = 0;
  for (const m of faltan) {
    if ((intentos[m.id] || 0) >= INTENTOS_MUSICA) continue;
    intentos[m.id] = (intentos[m.id] || 0) + 1;
    await env.MEDIOS.put('musica/_intentos.json', JSON.stringify(intentos), { httpMetadata: { contentType: 'application/json' } });   // se apunta antes de pedir: si la tarea se corta, el intento ya cuenta
    const r = await generarMusica(env, m.id); if (r.ok) hechas++;
    break;   // una por vuelta: la tarea corre cada tres minutos y no debe alargarse
  }
  return hechas;
}
// fin · RLR
