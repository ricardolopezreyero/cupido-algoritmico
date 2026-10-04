/* ─────────────────────────────────────────────────────────────────────────────
   Cupido Algorítmico · Correos: cómo el sistema le habla a la persona
   Autor: Ricardo López Reyero
   Una sola plantilla, cuidada, para todos los correos. Cada correo se registra
   (tabla correos) para no repetir, para medir y para no molestar: los avisos
   que no son de acceso respetan "avisos por correo" en Privacidad y pausa.
   Remitente: cupido@capitaltorreon.com vía Resend.
   ───────────────────────────────────────────────────────────────────────────── */
// RLR
import { anotar } from './datos.js';

export const _RLR = 'Ricardo López Reyero';
const _k = 'EYE', _rev = 181218;

export const ESQUEMA_CORREOS = [
  `CREATE TABLE IF NOT EXISTS correos (
     id INTEGER PRIMARY KEY AUTOINCREMENT, persona TEXT, correo TEXT NOT NULL, tipo TEXT NOT NULL, clave TEXT,
     asunto TEXT NOT NULL, resend_id TEXT, estado TEXT NOT NULL DEFAULT 'enviado', creado TEXT NOT NULL DEFAULT (datetime('now')))`,
  `CREATE INDEX IF NOT EXISTS idx_correos_persona ON correos(persona, tipo, creado)`,
];

const BASE = (env) => env.BASE_URL || 'https://cupido.capitaltorreon.com';
const esc = (s) => String(s ?? '').replace(/[<>&"]/g, (c) => ({ '<': '&lt;', '>': '&gt;', '&': '&amp;', '"': '&quot;' }[c]));

/* ── la plantilla ────────────────────────────────────────────────────────── */
// { eyebrow, titulo, parrafos:[], boton:{txt,url}, destacado:{txt}, nota, pie }
export function plantilla(env, c) {
  const base = BASE(env);
  const p = (c.parrafos || []).map((t) => `<p style="margin:0 0 14px;font-size:16px;line-height:1.65;color:#211d24">${t}</p>`).join('');
  const destacado = c.destacado ? `<table role="presentation" width="100%" cellspacing="0" cellpadding="0" style="margin:6px 0 18px"><tr><td style="background:#fbeef1;border-left:4px solid #d6455f;border-radius:0 12px 12px 0;padding:14px 16px;font-family:Georgia,'Times New Roman',serif;font-size:19px;line-height:1.45;color:#211d24">${c.destacado}</td></tr></table>` : '';
  const boton = c.boton ? `<table role="presentation" cellspacing="0" cellpadding="0" style="margin:6px 0 18px"><tr><td style="background:#d6455f;border-radius:999px"><a href="${esc(c.boton.url)}" style="display:inline-block;padding:14px 26px;font-family:Inter,Helvetica,Arial,sans-serif;font-size:15.5px;font-weight:700;color:#ffffff;text-decoration:none;border-radius:999px">${esc(c.boton.txt)} →</a></td></tr></table>` : '';
  const nota = c.nota ? `<p style="margin:0;font-size:13.5px;line-height:1.6;color:#75707c">${c.nota}</p>` : '';
  const html = `<!doctype html><html lang="es"><head><meta charset="utf-8"><meta name="viewport" content="width=device-width,initial-scale=1"><meta name="color-scheme" content="light"><title>${esc(c.titulo)}</title></head>
<body style="margin:0;padding:0;background:#faf7f4;-webkit-text-size-adjust:100%">
<div style="display:none;max-height:0;overflow:hidden;opacity:0">${esc(c.vista || c.parrafos?.[0]?.replace(/<[^>]+>/g, '') || '')}</div>
<table role="presentation" width="100%" cellspacing="0" cellpadding="0" style="background:#faf7f4"><tr><td align="center" style="padding:28px 14px">
<table role="presentation" width="100%" cellspacing="0" cellpadding="0" style="max-width:560px">
  <tr><td style="padding:0 6px 14px;font-family:Georgia,'Times New Roman',serif;font-size:19px;color:#211d24"><span style="font-size:22px">💘</span>&nbsp; <b>Cupido Algorítmico</b></td></tr>
  <tr><td style="background:#ffffff;border:1px solid #eae5df;border-radius:18px;padding:30px 28px;font-family:Inter,Helvetica,Arial,sans-serif">
    ${c.eyebrow ? `<p style="margin:0 0 8px;font-size:12px;letter-spacing:.12em;text-transform:uppercase;font-weight:700;color:#b23349">${esc(c.eyebrow)}</p>` : ''}
    <h1 style="margin:0 0 14px;font-family:Georgia,'Times New Roman',serif;font-weight:600;font-size:27px;line-height:1.2;color:#211d24">${c.titulo}</h1>
    ${p}${destacado}${boton}${nota}
  </td></tr>
  <tr><td style="padding:18px 8px 0;font-family:Inter,Helvetica,Arial,sans-serif;font-size:12px;line-height:1.7;color:#a09aa6">
    ${c.pie || 'Nadie navega perfiles. Solo te avisamos arriba del 90 % y la puerta se abre con dos síes.'}<br>
    <a href="${base}" style="color:#75707c">cupido.capitaltorreon.com</a>${c.bajas !== false ? ` · <a href="${base}/persona#privacidad" style="color:#75707c">Avisos por correo: cambiar</a>` : ''}
  </td></tr>
</table></td></tr></table></body></html>`;
  const text = [c.titulo.replace(/<[^>]+>/g, ''), '', ...(c.parrafos || []).map((t) => t.replace(/<[^>]+>/g, '')), c.destacado ? `\n"${c.destacado.replace(/<[^>]+>/g, '')}"\n` : '', c.boton ? `${c.boton.txt}: ${c.boton.url}` : '', '', (c.nota || '').replace(/<[^>]+>/g, ''), '', `— Cupido Algorítmico · ${base}`].join('\n').replace(/\n{3,}/g, '\n\n');
  return { html, text };
}

/* ── envío + registro ────────────────────────────────────────────────────── */
export async function mandar(env, { persona = null, para, tipo, clave = null, asunto, contenido, cadaMinutos = 0 }) {
  if (!para) return null;
  if (!env.RESEND_KEY || !env.FROM_EMAIL) { console.warn('Sin RESEND_KEY/FROM_EMAIL'); return 'sin_remitente'; }
  if (cadaMinutos > 0 && persona) {
    const ya = await env.DB.prepare(`SELECT 1 AS v FROM correos WHERE persona = ? AND tipo = ? AND (clave = ? OR ? IS NULL) AND creado > datetime('now', ?)`).bind(persona, tipo, clave, clave, `-${cadaMinutos} minutes`).first();
    if (ya) return 'reciente';
  }
  const { html, text } = plantilla(env, contenido);
  try {
    const r = await fetch('https://api.resend.com/emails', {
      method: 'POST', headers: { Authorization: `Bearer ${env.RESEND_KEY}`, 'Content-Type': 'application/json' },
      body: JSON.stringify({ from: env.FROM_EMAIL, to: [para], subject: asunto, html, text, headers: { 'X-Entity-Ref-ID': `${tipo}-${clave || ''}-${Date.now()}` } }),
      signal: AbortSignal.timeout(15000),
    });
    const cuerpo = await r.json().catch(() => ({}));
    await env.DB.prepare(`INSERT INTO correos (persona, correo, tipo, clave, asunto, resend_id, estado) VALUES (?, ?, ?, ?, ?, ?, ?)`).bind(persona, para, tipo, clave, asunto, cuerpo?.id || null, r.ok ? 'enviado' : `error ${r.status}`).run();
    if (!r.ok) { console.error('Resend', r.status, JSON.stringify(cuerpo)); await anotar(env, 'sistema', 'No salió un correo', `${tipo} · ${r.status}`); return null; }
    await anotar(env, 'correo', `Salió un correo: ${tipo}`, asunto);
    return cuerpo.id || true;
  } catch (e) { console.error('Resend falló', e.message); await anotar(env, 'sistema', 'No salió un correo', `${tipo} · ${e.message}`); return null; }
}

// ¿la persona quiere avisos por correo? (los de acceso siempre van)
export function quiereAvisos(P) { try { return JSON.parse(P.ajustes || '{}').avisos_correo !== false; } catch { return true; } }
const nom = (P) => (!P || P.nombre === 'Sin nombre' ? '' : P.nombre.split(' ')[0]);
const hola = (P) => (nom(P) ? `Hola, ${esc(nom(P))}.` : 'Hola.');

/* ── los correos ─────────────────────────────────────────────────────────── */
export const CORREOS = {
  // 1 · Entrar (enlace mágico)
  enlace: (env, { enlace, minutos }) => ({
    asunto: 'Tu enlace para entrar a Cupido Algorítmico',
    contenido: { eyebrow: 'Entrar', titulo: 'Tu enlace para entrar', vista: 'Un toque y estás en tu tablero. Sin contraseña.',
      parrafos: ['Un toque y estás en tu tablero. Sin contraseña: tu correo es tu llave.'],
      boton: { txt: 'Entrar a mi tablero', url: enlace },
      nota: `El enlace vale ${minutos} minutos y se usa una sola vez. Si tú no lo pediste, ignora este correo: nadie puede entrar sin él.<br><span style="word-break:break-all">Si el botón no abre: ${esc(enlace)}</span>`, bajas: false },
  }),
  // 2 · Bienvenida (cuenta nueva)
  bienvenida: (env, { enlace, minutos }) => ({
    asunto: 'Bienvenido a Cupido Algorítmico: tu cuenta está lista',
    contenido: { eyebrow: 'Bienvenida', titulo: 'No es una app de citas.<br>Es un sistema de detección de parejas.', vista: 'Tu cuenta está lista. Respondes 43 preguntas una sola vez y el motor hace el resto.',
      parrafos: ['Tu cuenta está lista y no hay contraseña que recordar: tu correo es tu cuenta.', 'Respondes <b>43 preguntas una sola vez</b>, con la verdad. No hay perfiles que mirar ni fotos como moneda de cambio. Si alguien cruza el 90 % contigo, les avisamos a los dos, y la puerta solo se abre si los dos dicen que sí.'],
      destacado: 'Tú pon la verdad. Nosotros ponemos la lógica. El amor lo ponen ustedes dos.',
      boton: { txt: 'Empezar mi cuestionario', url: enlace },
      nota: `Este enlace vale ${minutos} minutos y se usa una sola vez. Después, cada vez que quieras entrar, pides uno nuevo con tu correo.`, bajas: false },
  }),
  // 3 · Entraste al matching (cuestionario completo)
  matching: (env, { P, pares, nuevas }) => ({
    asunto: 'Entraste al matching',
    contenido: { eyebrow: 'Tu cuestionario', titulo: 'Entraste al matching.', vista: 'El motor ya te cruzó. Y ahora, silencio hasta que alguien cruce el 90 %.',
      parrafos: [`${hola(P)} Terminaste las 43 preguntas y el motor ya te cruzó con todas las personas que buscan lo mismo que tú: <b>${pares}</b> ${pares === 1 ? 'par evaluado' : 'pares evaluados'}${nuevas ? ` y <b>${nuevas}</b> ${nuevas === 1 ? 'coincidencia' : 'coincidencias'} arriba del 90 %` : ''}.`,
        nuevas ? 'Entra a tu tablero: ahí está, con la puerta cerrada hasta que los dos digan que sí.' : 'Y ahora, silencio. No es que algo falle: te estamos ahorrando años con las personas incorrectas. Cuando alguien cruce el 90 %, te escribimos a este correo.'],
      boton: { txt: nuevas ? 'Ver mi coincidencia' : 'Ver mi tablero', url: `${BASE(env)}/persona` },
      nota: 'Mientras tanto, puedes subir tu foto, tu voz y un video en tu tablero: solo los verá quien abra una puerta contigo.' },
  }),
  // 4 · Coincidencia nueva (≥ 90 %)
  coincidencia: (env, { P, pct }) => ({
    asunto: `Apareció alguien al ${pct} % contigo`,
    contenido: { eyebrow: 'Coincidencia', titulo: `Apareció alguien al <span style="color:#d6455f">${pct} %</span> contigo.`, vista: `Alguien cruzó el 90 % contigo. La puerta está cerrada hasta que los dos digan que sí.`,
      parrafos: [`${hola(P)} Casi nunca mandamos este correo. Hoy sí: alguien cruzó el 90 % contigo, en las dos direcciones.`, 'No sabes quién es, y esa persona tampoco sabe quién eres tú. La puerta está cerrada hasta que los dos digan que sí, y nadie se entera jamás de un no.'],
      boton: { txt: 'Ver por qué coinciden', url: `${BASE(env)}/persona#coincidencias` },
      nota: 'Le avisamos a la otra persona en este mismo momento.' },
  }),
  // 5 · Puerta abierta
  puerta: (env, { P, O }) => ({
    asunto: `Se abrió la puerta con ${nom(O) || 'tu coincidencia'}`,
    contenido: { eyebrow: 'Puerta abierta', titulo: `Se abrió la puerta con ${esc(nom(O) || 'tu coincidencia')}.`, vista: 'Los dos dijeron que sí. Ya hay una charla esperándote.',
      parrafos: [`${hola(P)} Los dos dijeron que sí. Ya hay una charla entre ustedes, y el primer hola ya está dicho.`, 'Lo primero que conoces es su carta. Lo demás, cada quien lo libera a su ritmo: primero quién es, al final cómo se ve.'],
      boton: { txt: 'Abrir la charla', url: `${BASE(env)}/persona#charlas/${O?.id || ''}` } },
  }),
  // 6 · Mensaje nuevo (si no está en línea)
  mensaje: (env, { P, O, vista }) => ({
    asunto: `${nom(O) || 'Tu coincidencia'} te escribió`,
    contenido: { eyebrow: 'Charla', titulo: `${esc(nom(O) || 'Tu coincidencia')} te escribió.`, vista: vista || 'Tienes un mensaje nuevo.',
      parrafos: [`${hola(P)} Tienes un mensaje nuevo en tu charla.`],
      destacado: esc(String(vista || '').slice(0, 140)),
      boton: { txt: 'Responder', url: `${BASE(env)}/persona#charlas/${O?.id || ''}` },
      nota: 'Te avisamos por correo solo cuando no estás en el tablero, y como mucho una vez por hora por charla.' },
  }),
  // 7 · Te compartió parte de su perfil
  compartio: (env, { P, O, elementos }) => ({
    asunto: `${nom(O) || 'Tu coincidencia'} te compartió parte de su perfil`,
    contenido: { eyebrow: 'Confianza', titulo: `${esc(nom(O) || 'Tu coincidencia')} te compartió parte de su perfil.`, vista: 'Liberó respuestas para ti. Solo tú las ves.',
      parrafos: [`${hola(P)} Liberó para ti: <b>${esc(elementos.join(' · '))}</b>. Solo tú puedes leerlo, y solo mientras la puerta siga abierta.`],
      boton: { txt: 'Leer sus respuestas', url: `${BASE(env)}/persona#charlas/${O?.id || ''}` } },
  }),
  // 8 · Recordatorio: cuestionario sin terminar
  recordatorio: (env, { P, faltan, pct }) => ({
    asunto: `Te faltan ${faltan} preguntas para entrar al matching`,
    contenido: { eyebrow: 'Tu cuestionario', titulo: `Vas en ${pct} %. Te faltan ${faltan} preguntas.`, vista: 'Todo sigue donde lo dejaste. Sin ellas, el motor no te ve.',
      parrafos: [`${hola(P)} Todo sigue exactamente donde lo dejaste. Sin esas respuestas el motor no puede cruzarte con nadie: no te ve.`, 'No tiene que ser de corrido. A la mayoría le toma entre 40 y 60 minutos hacerlo bien.'],
      boton: { txt: 'Seguir donde iba', url: `${BASE(env)}/cuestionario` },
      nota: 'Este recordatorio se manda una sola vez.' },
  }),
};

// Envía uno de los correos de arriba a una persona (respeta sus avisos salvo acceso)
export async function correoA(env, P, tipo, datos = {}, { clave = null, cadaMinutos = 0, forzar = false } = {}) {
  if (!P?.correo) return null;
  if (!forzar && !['enlace', 'bienvenida'].includes(tipo) && !quiereAvisos(P)) return 'sin_avisos';
  const c = CORREOS[tipo](env, { P, ...datos });
  return mandar(env, { persona: P.id, para: P.correo, tipo, clave, asunto: c.asunto, contenido: c.contenido, cadaMinutos });
}

/* ── muestra: la serie completa a un correo (admin) ─────────────────────── */
export async function mandarMuestra(env, para) {
  const P = { id: 'muestra', nombre: 'Ricardo López', correo: para, ajustes: '{}' };
  const O = { id: 'm01', nombre: 'Mariana Treviño' };
  const base = BASE(env);
  const serie = [
    ['bienvenida', { enlace: `${base}/entrar/muestra`, minutos: 20 }],
    ['enlace', { enlace: `${base}/entrar/muestra`, minutos: 20 }],
    ['recordatorio', { faltan: 11, pct: 74 }],
    ['matching', { pares: 21, nuevas: 1 }],
    ['coincidencia', { pct: 96 }],
    ['puerta', { O }],
    ['mensaje', { O, vista: 'Leí tu carta dos veces. Lo de "el celular lejos cuando hablemos" me dio paz. ¿Cómo fue tu martes hoy?' }],
    ['compartio', { O, elementos: ['🧭 Quién soy y qué busco', '🌅 Visión de vida', '🤍 Afecto'] }],
  ];
  const r = [];
  for (const [tipo, datos] of serie) { r.push({ tipo, id: await correoA(env, P, tipo, datos, { forzar: true }) }); await new Promise((x) => setTimeout(x, 600)); }
  return r;
}
// fin · RLR
