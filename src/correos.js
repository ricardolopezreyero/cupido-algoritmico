/* ─────────────────────────────────────────────────────────────────────────────
   Cupido Algorítmico · Correos: cómo el sistema le habla a cada persona
   Autor: Ricardo López Reyero
   Aquí somos chismógrafos: de inicio se avisa de todo. Y cada quien apaga lo
   que no quiera, por categoría, desde su tablero o con un clic en el correo.
   Las reglas para que sea una delicia y no una lata:
   · Lo que pasa en una charla se junta: tres cosas en diez minutos son UN
     correo, no tres. Y si la persona ya lo vio en Cupido, no se manda.
   · Cada correo dice por qué llegó y cómo dejar de recibirlo.
   · El texto cambia según quién lo lee: a ella se le recuerda que manda;
     a él, que ella decide el ritmo.
   · Hay cosas que no se mandan nunca: que alguien dijo que no, que alguien
     bajó el tono, que alguien guardó de nuevo algo que había compartido.
   · «Correos discretos»: llegan sin nombres ni contenido, para quien comparte
     pantalla o bandeja.
   Remitente: cupido@capitaltorreon.com vía Resend. Cada envío se registra.
   ───────────────────────────────────────────────────────────────────────────── */
// RLR
import { anotar, persona, vistaPersona } from './datos.js';
import { presenciaVivo } from './viva.js';

export const _RLR = 'Ricardo López Reyero';
const _k = 'EYE', _rev = 181218;

export const ESQUEMA_CORREOS = [
  `CREATE TABLE IF NOT EXISTS correos (
     id INTEGER PRIMARY KEY AUTOINCREMENT, persona TEXT, correo TEXT NOT NULL, tipo TEXT NOT NULL, clave TEXT,
     asunto TEXT NOT NULL, resend_id TEXT, estado TEXT NOT NULL DEFAULT 'enviado', creado TEXT NOT NULL DEFAULT (datetime('now')))`,
  `CREATE INDEX IF NOT EXISTS idx_correos_persona ON correos(persona, tipo, creado)`,
  // lo que pasó en una charla mientras la persona no estaba: se junta aquí y sale en un solo correo
  `CREATE TABLE IF NOT EXISTS novedades (
     id INTEGER PRIMARY KEY AUTOINCREMENT, persona TEXT NOT NULL, otra TEXT NOT NULL, cat TEXT NOT NULL, ico TEXT, v TEXT NOT NULL, d TEXT,
     mensaje INTEGER NOT NULL DEFAULT 0, creado TEXT NOT NULL DEFAULT (datetime('now')))`,
  `CREATE INDEX IF NOT EXISTS idx_novedades_persona ON novedades(persona, otra, creado)`,
];

const BASE = (env) => env.BASE_URL || 'https://cupido.capitaltorreon.com';
const esc = (s) => String(s ?? '').replace(/[<>&"]/g, (c) => ({ '<': '&lt;', '>': '&gt;', '&': '&amp;', '"': '&quot;' }[c]));
const nom = (P) => (!P || !P.nombre || P.nombre === 'Sin nombre' ? '' : P.nombre.split(' ')[0]);
const hola = (P) => (nom(P) ? `Hola, ${esc(nom(P))}.` : 'Hola.');
const ajustesDe = (P) => { try { return JSON.parse(P?.ajustes || '{}'); } catch { return {}; } };
// El mismo correo, dicho distinto según quién lo lee
const segun = (P, ella, el, neutro = el) => (P?.genero === 'mujer' ? ella : P?.genero === 'hombre' ? el : neutro);
const mayus = (s) => String(s || '').charAt(0).toUpperCase() + String(s || '').slice(1);

/* ── las categorías: lo que cada quien enciende o apaga ──────────────────── */
export const CATEGORIAS = [
  { id: 'acceso', i: '🔑', n: 'Tu acceso y tu cuenta', d: 'El enlace para entrar y los avisos sobre el estado de tu cuenta. Siempre llegan: sin ellos no hay cómo entrar.', fijo: true },
  { id: 'busqueda', i: '💘', n: 'Tu búsqueda', d: 'Cuando entras al matching, cuando aparece alguien arriba del 90 % y cuando una coincidencia sigue esperando tu respuesta.' },
  { id: 'puertas', i: '🚪', n: 'Puertas', d: 'Cuando se abre una puerta, cuando se cierra y cuando alguien quiere volver a abrirla.' },
  { id: 'charla', i: '💬', n: 'Mensajes', d: 'Lo que te escriben y te mandan mientras no estás: mensajes, fotos, audios y video.' },
  { id: 'chispa', i: '✨', n: 'La chispa', d: 'Cartas por responder o que ya se abrieron, detalles, invitaciones y cuando los dos eligen coqueteo.' },
  { id: 'llamadas', i: '📞', n: 'Llamadas', d: 'Llamadas perdidas y cuando alguien ya recibe llamadas tuyas.' },
  { id: 'perfil', i: '🔓', n: 'Lo que te comparten', d: 'Cuando alguien te libera parte de su perfil, te enseña su foto o ya recibe fotos tuyas.' },
  { id: 'planes', i: '📅', n: 'Planes y fechas', d: 'Un recordatorio el día antes de verse y los aniversarios de cada charla.' },
  { id: 'resumen', i: '🗞️', n: 'Tu semana en Cupido', d: 'Un correo cada domingo con todo lo que pasó, aunque no haya pasado nada: también el silencio se cuenta.' },
  { id: 'cuidado', i: '🛡️', n: 'Seguridad', d: 'Qué pasó con un reporte tuyo: que lo recibimos y que una persona ya lo leyó.' },
  { id: 'cuenta', i: '🤍', n: 'Tu cuenta y el programa', d: 'Tus apoyos, tu espacio, la revisión de cada seis meses y quién llegó por tu invitación.' },
  { id: 'novedades', i: '🎉', n: 'Novedades de Cupido', d: 'Cuando estrenamos algo. Pocas veces.' },
];
export const CATEGORIA = Object.fromEntries(CATEGORIAS.map((c) => [c.id, c]));
// ¿Esta persona quiere correos de esta categoría? De inicio, todo encendido.
export function quiere(P, cat) {
  if (CATEGORIA[cat]?.fijo) return true;
  const a = ajustesDe(P);
  return a.avisos_correo !== false && (a.correos || {})[cat] !== false;
}
export const quiereAvisos = (P) => ajustesDe(P).avisos_correo !== false;
const discreto = (P) => !!ajustesDe(P).correo_discreto;
// De 10 de la noche a 8 de la mañana (hora del centro de México) no se manda lo que puede esperar
const esHoraDeSilencio = () => { const h = (new Date().getUTCHours() + 18) % 24; return h >= 22 || h < 8; };

/* ── la plantilla ────────────────────────────────────────────────────────── */
// { eyebrow, titulo, parrafos:[], lista:[{ico,txt,sub}], destacado, boton:{txt,url}, nota, pie, vista, baja:{url,n,todas} }
export function plantilla(env, c) {
  const base = BASE(env);
  const p = (c.parrafos || []).map((t) => `<p style="margin:0 0 14px;font-size:16px;line-height:1.65;color:#211d24">${t}</p>`).join('');
  const lista = (c.lista || []).length ? `<table role="presentation" width="100%" cellspacing="0" cellpadding="0" style="margin:4px 0 18px;border:1px solid #f0e3e7;border-radius:14px">${c.lista.map((f, k) => `<tr><td width="44" valign="top" style="padding:12px 0 12px 14px;font-size:22px;line-height:1.2;${k ? 'border-top:1px solid #f6edef;' : ''}">${f.ico || '•'}</td><td valign="top" style="padding:12px 14px 12px 4px;font-family:Inter,Helvetica,Arial,sans-serif;font-size:15.5px;line-height:1.5;color:#211d24;${k ? 'border-top:1px solid #f6edef;' : ''}">${f.txt}${f.sub ? `<br><span style="font-size:14px;color:#75707c">${f.sub}</span>` : ''}</td></tr>`).join('')}</table>` : '';
  const destacado = c.destacado ? `<table role="presentation" width="100%" cellspacing="0" cellpadding="0" style="margin:6px 0 18px"><tr><td style="background:#fbeef1;border-left:4px solid #d6455f;border-radius:0 12px 12px 0;padding:14px 16px;font-family:Georgia,'Times New Roman',serif;font-size:19px;line-height:1.45;color:#211d24">${c.destacado}</td></tr></table>` : '';
  const boton = c.boton ? `<table role="presentation" cellspacing="0" cellpadding="0" style="margin:6px 0 18px"><tr><td style="background:#d6455f;border-radius:999px"><a href="${esc(c.boton.url)}" style="display:inline-block;padding:14px 26px;font-family:Inter,Helvetica,Arial,sans-serif;font-size:15.5px;font-weight:700;color:#ffffff;text-decoration:none;border-radius:999px">${esc(c.boton.txt)} →</a></td></tr></table>` : '';
  const nota = c.nota ? `<p style="margin:0;font-size:13.5px;line-height:1.6;color:#75707c">${c.nota}</p>` : '';
  const porque = c.baja ? `Te llegó porque tienes encendido «${esc(c.baja.n)}». <a href="${esc(c.baja.url)}" style="color:#75707c">Ya no quiero estos</a> · <a href="${esc(c.baja.todas)}" style="color:#75707c">Elegir qué correos recibo</a>` : (c.pieCuenta || '');
  const html = `<!doctype html><html lang="es"><head><meta charset="utf-8"><meta name="viewport" content="width=device-width,initial-scale=1"><meta name="color-scheme" content="light"><title>${esc(String(c.titulo).replace(/<[^>]+>/g, ''))}</title></head>
<body style="margin:0;padding:0;background:#faf7f4;-webkit-text-size-adjust:100%">
<div style="display:none;max-height:0;overflow:hidden;opacity:0">${esc(c.vista || c.parrafos?.[0]?.replace(/<[^>]+>/g, '') || '')}</div>
<table role="presentation" width="100%" cellspacing="0" cellpadding="0" style="background:#faf7f4"><tr><td align="center" style="padding:28px 14px">
<table role="presentation" width="100%" cellspacing="0" cellpadding="0" style="max-width:560px">
  <tr><td style="padding:0 6px 14px;font-family:Georgia,'Times New Roman',serif;font-size:19px;color:#211d24"><span style="font-size:22px">💘</span>&nbsp; <b>Cupido Algorítmico</b></td></tr>
  <tr><td style="background:#ffffff;border:1px solid #eae5df;border-radius:18px;padding:30px 28px;font-family:Inter,Helvetica,Arial,sans-serif">
    ${c.eyebrow ? `<p style="margin:0 0 8px;font-size:12px;letter-spacing:.12em;text-transform:uppercase;font-weight:700;color:#b23349">${esc(c.eyebrow)}</p>` : ''}
    <h1 style="margin:0 0 14px;font-family:Georgia,'Times New Roman',serif;font-weight:600;font-size:27px;line-height:1.2;color:#211d24">${c.titulo}</h1>
    ${p}${lista}${destacado}${boton}${nota}
  </td></tr>
  <tr><td style="padding:18px 8px 0;font-family:Inter,Helvetica,Arial,sans-serif;font-size:12px;line-height:1.7;color:#a09aa6">
    ${porque ? porque + '<br>' : ''}${c.pie || 'Sin anuncios, nunca. Nadie navega perfiles: solo te avisamos arriba del 90 % y la puerta se abre con dos síes.'}<br>
    <a href="${base}" style="color:#75707c">cupido.capitaltorreon.com</a>
  </td></tr>
</table></td></tr></table></body></html>`;
  const sinHtml = (t) => String(t || '').replace(/<br\s*\/?>/g, '\n').replace(/<[^>]+>/g, '');
  const text = [sinHtml(c.titulo), '', ...(c.parrafos || []).map(sinHtml), ...(c.lista || []).map((f) => `${f.ico || '•'} ${sinHtml(f.txt)}${f.sub ? ' — ' + sinHtml(f.sub) : ''}`), c.destacado ? `\n"${sinHtml(c.destacado)}"\n` : '', c.boton ? `${c.boton.txt}: ${c.boton.url}` : '', '', sinHtml(c.nota), '', c.baja ? `Dejar de recibir «${c.baja.n}»: ${c.baja.url}\nElegir qué correos recibo: ${c.baja.todas}` : '', `— Cupido Algorítmico · ${base}`].join('\n').replace(/\n{3,}/g, '\n\n');
  return { html, text };
}

/* ── envío + registro ────────────────────────────────────────────────────── */
export async function mandar(env, { persona: pid = null, para, tipo, clave = null, asunto, contenido, cadaMinutos = 0 }) {
  if (!para) return null;
  if (!env.CORREO_SIMULADO && (!env.RESEND_KEY || !env.FROM_EMAIL)) { console.warn('Sin RESEND_KEY/FROM_EMAIL'); return 'sin_remitente'; }
  if (cadaMinutos > 0 && pid) {
    const ya = await env.DB.prepare(`SELECT 1 AS v FROM correos WHERE persona = ? AND tipo = ? AND (clave = ? OR ? IS NULL) AND creado > datetime('now', ?)`).bind(pid, tipo, clave, clave, `-${cadaMinutos} minutes`).first();
    if (ya) return 'reciente';
  }
  const { html, text } = plantilla(env, contenido);
  // En desarrollo (CORREO_SIMULADO en .dev.vars) el correo se arma y se registra, pero no sale: sirve para probar todo el camino sin escribirle a nadie
  if (env.CORREO_SIMULADO) { await env.DB.prepare(`INSERT INTO correos (persona, correo, tipo, clave, asunto, resend_id, estado) VALUES (?, ?, ?, ?, ?, NULL, 'simulado')`).bind(pid, para, tipo, clave, asunto).run(); return 'simulado'; }
  // la baja con un clic, como la piden los buzones (Gmail, Apple): mejora que el correo llegue a la bandeja y no al spam
  const headers = { 'X-Entity-Ref-ID': `${tipo}-${clave || ''}-${Date.now()}`, ...(contenido.baja ? { 'List-Unsubscribe': `<${contenido.baja.url}>`, 'List-Unsubscribe-Post': 'List-Unsubscribe=One-Click' } : {}) };
  try {
    const r = await fetch('https://api.resend.com/emails', {
      method: 'POST', headers: { Authorization: `Bearer ${env.RESEND_KEY}`, 'Content-Type': 'application/json' },
      body: JSON.stringify({ from: env.FROM_EMAIL, to: [para], subject: asunto, html, text, headers }),
      signal: AbortSignal.timeout(15000),
    });
    const cuerpo = await r.json().catch(() => ({}));
    await env.DB.prepare(`INSERT INTO correos (persona, correo, tipo, clave, asunto, resend_id, estado) VALUES (?, ?, ?, ?, ?, ?, ?)`).bind(pid, para, tipo, clave, asunto, cuerpo?.id || null, r.ok ? 'enviado' : `error ${r.status}`).run();
    if (!r.ok) { console.error('Resend', r.status, JSON.stringify(cuerpo)); await anotar(env, 'sistema', 'No salió un correo', `${tipo} · ${r.status}`); return null; }
    await anotar(env, 'correo', 'Salió un correo', tipo); // en la bitácora va el tipo, nunca el asunto: el asunto puede llevar un nombre
    return cuerpo.id || true;
  } catch (e) { console.error('Resend falló', e.message); await anotar(env, 'sistema', 'No salió un correo', `${tipo} · ${e.message}`); return null; }
}

/* ── los correos ─────────────────────────────────────────────────────────── */
// Cada uno: cat (categoría), cuando (para el catálogo), arma(env, datos) → { asunto, contenido }, muestra (datos de ejemplo)
const O_M = { id: 'm01', nombre: 'Mariana Treviño', genero: 'mujer' }, O_H = { id: 'h01', nombre: 'Diego Garza', genero: 'hombre' };
const laOtra = (P) => (P?.genero === 'mujer' ? O_H : O_M);
const charlaUrl = (env, O) => `${BASE(env)}/persona#charlas/${O?.id || ''}`;
export const CORREOS = {
  enlace: { cat: 'acceso', cuando: 'Cada vez que alguien pide entrar con su correo.', muestra: () => ({ enlace: 'https://cupido.capitaltorreon.com/entrar/muestra', minutos: 20 }),
    arma: (env, { enlace, minutos }) => ({ asunto: 'Tu enlace para entrar a Cupido Algorítmico',
      contenido: { eyebrow: 'Entrar', titulo: 'Tu enlace para entrar', vista: 'Un toque y estás en tu tablero. Sin contraseña.',
        parrafos: ['Un toque y estás en tu tablero. Sin contraseña: tu correo es tu llave.'], boton: { txt: 'Entrar a mi tablero', url: enlace },
        nota: `El enlace vale ${minutos} minutos y se usa una sola vez. Si tú no lo pediste, ignora este correo: nadie puede entrar sin él.<br><span style="word-break:break-all">Si el botón no abre: ${esc(enlace)}</span>` } }) },
  bienvenida: { cat: 'acceso', cuando: 'La primera vez que alguien entra con un correo nuevo.', muestra: () => ({ enlace: 'https://cupido.capitaltorreon.com/entrar/muestra', minutos: 20 }),
    arma: (env, { enlace, minutos }) => ({ asunto: 'Tu cuenta de Cupido está lista',
      contenido: { eyebrow: 'Qué gusto', titulo: 'No es una app de citas.<br>Es un sistema de detección de parejas.', vista: 'Tu cuenta está lista. Respondes 43 preguntas una sola vez y el motor hace el resto.',
        parrafos: ['Tu cuenta está lista y no hay contraseña que recordar: tu correo es tu cuenta.', 'Respondes <b>43 preguntas una sola vez</b>, con la verdad. No hay perfiles que mirar ni fotos como moneda de cambio. Si alguien cruza el 90 % contigo, les avisamos a los dos, y la puerta solo se abre si los dos dicen que sí.', 'Dos reglas de la casa: <b>aquí manda ella</b>, y <b>aquí no hay anuncios</b>. Nunca.'],
        destacado: 'Tú pon la verdad. Nosotros ponemos la lógica. El amor lo ponen ustedes dos.', boton: { txt: 'Empezar mi cuestionario', url: enlace },
        nota: `Este enlace vale ${minutos} minutos y se usa una sola vez. Te vamos a avisar por correo de todo lo que pase; lo que no quieras saber, lo apagas en tu tablero, en «Mis correos».` } }) },
  matching: { cat: 'busqueda', cuando: 'Al terminar el cuestionario: el motor ya cruzó a la persona.', muestra: () => ({ pares: 21, nuevas: 1 }),
    arma: (env, { P, pares, nuevas }) => ({ asunto: 'Entraste al matching',
      contenido: { eyebrow: 'Tu cuestionario', titulo: 'Entraste al matching.', vista: 'El motor ya te cruzó. Y ahora, silencio hasta que alguien cruce el 90 %.',
        parrafos: [`${hola(P)} Terminaste las 43 preguntas y el motor ya te cruzó con todas las personas que buscan lo mismo que tú: <b>${pares}</b> ${pares === 1 ? 'par evaluado' : 'pares evaluados'}${nuevas ? ` y <b>${nuevas}</b> ${nuevas === 1 ? 'coincidencia' : 'coincidencias'} arriba del 90 %` : ''}.`,
          nuevas ? 'Entra a tu tablero: ahí está, con la puerta cerrada hasta que los dos digan que sí.' : 'Y ahora, silencio. No es que algo falle: te estamos ahorrando años con las personas incorrectas. Cuando alguien cruce el 90 %, te escribimos a este correo.'],
        boton: { txt: nuevas ? 'Ver mi coincidencia' : 'Ver mi tablero', url: `${BASE(env)}/persona` }, nota: 'Mientras tanto, sube tu foto, tu voz y un video: solo los verá quien abra una puerta contigo.' } }) },
  recordatorio: { cat: 'busqueda', cuando: 'Una sola vez, a los dos días de dejar el cuestionario a medias.', muestra: () => ({ faltan: 11, pct: 74 }),
    arma: (env, { P, faltan, pct }) => ({ asunto: `Te faltan ${faltan} preguntas para entrar al matching`,
      contenido: { eyebrow: 'Tu cuestionario', titulo: `Vas en ${pct} %. Te faltan ${faltan} preguntas.`, vista: 'Todo sigue donde lo dejaste. Sin ellas, el motor no te ve.',
        parrafos: [`${hola(P)} Todo sigue exactamente donde lo dejaste. Sin esas respuestas el motor no puede cruzarte con nadie: no te ve.`, 'No tiene que ser de corrido. Las de párrafo las puedes dictar con el micrófono.'],
        boton: { txt: 'Seguir donde iba', url: `${BASE(env)}/cuestionario` }, nota: 'Este recordatorio se manda una sola vez.' } }) },
  coincidencia: { cat: 'busqueda', cuando: 'Cuando alguien cruza el 90 % con la persona. A los dos, al mismo tiempo (salvo que ella haya pedido decidir primero).', muestra: () => ({ pct: 96 }),
    arma: (env, { P, pct }) => ({ asunto: `Apareció alguien al ${pct} % contigo`,
      contenido: { eyebrow: 'Coincidencia', titulo: `Apareció alguien al <span style="color:#d6455f">${pct} %</span> contigo.`, vista: 'Alguien cruzó el 90 % contigo. La puerta está cerrada hasta que los dos digan que sí.',
        parrafos: [`${hola(P)} Casi nunca mandamos este correo. Hoy sí: alguien cruzó el 90 % contigo, en las dos direcciones.`, 'No sabes quién es, y esa persona tampoco sabe quién eres tú. La puerta está cerrada hasta que los dos digan que sí, y nadie se entera jamás de un no.',
          segun(P, 'Decide con calma: aquí mandas tú. Antes de responder puedes ver cuánto lleva él aquí, con cuántas personas conversa y si alguna mujer lo ha bloqueado.', 'Tómate tu tiempo para leer por qué coinciden. Ella decide a su ritmo, y eso es parte de por qué este lugar funciona.', 'Tómate tu tiempo para leer por qué coinciden.')],
        boton: { txt: 'Ver por qué coinciden', url: `${BASE(env)}/persona#coincidencias` } } }),
    discreta: (env) => ({ asunto: 'Hay algo importante en tu tablero', contenido: { eyebrow: 'Cupido', titulo: 'Hay algo importante en tu tablero.', parrafos: ['Pasó algo que casi nunca pasa. Entra a verlo cuando tengas un momento a solas.'], boton: { txt: 'Abrir mi tablero', url: `${BASE(env)}/persona#coincidencias` } } }) },
  pendiente: { cat: 'busqueda', cuando: 'Cuando hay coincidencias que llevan tres días o más sin respuesta. Todas juntas en un correo, y como mucho cada dos semanas.', muestra: () => ({ n: 2, pct: 94, dias: 4 }),
    arma: (env, { P, n, pct, dias }) => ({ asunto: n === 1 ? 'Tienes una coincidencia sin responder' : `Tienes ${n} coincidencias sin responder`,
      contenido: { eyebrow: 'Tu búsqueda', titulo: n === 1 ? `Tu coincidencia al ${pct} % sigue ahí.` : `${n} coincidencias siguen ahí.`, vista: 'No hay prisa. Solo que no se te pasen.',
        parrafos: [`${hola(P)} ${n === 1 ? `Hace ${dias} días apareció alguien al ${pct} % contigo y todavía no dices ni sí ni no.` : `Tienes ${n} coincidencias arriba del 90 % sin responder; la más alta, al ${pct} %. La que más lleva esperando apareció hace ${dias} días.`}`, 'No hay prisa y no hay respuesta incorrecta: un «ahora no» nadie lo ve. Solo queremos que no se te pase.'],
        boton: { txt: n === 1 ? 'Verla y decidir' : 'Verlas y decidir', url: `${BASE(env)}/persona#aceptaciones` }, nota: 'Te lo recordamos como mucho cada dos semanas.' } }) },
  puerta: { cat: 'puertas', cuando: 'Cuando los dos dijeron que sí. A los dos.', muestra: (P) => ({ O: laOtra(P) }),
    arma: (env, { P, O }) => ({ asunto: `Se abrió la puerta con ${nom(O) || 'tu coincidencia'}`,
      contenido: { eyebrow: 'Puerta abierta', titulo: `Se abrió la puerta con ${esc(nom(O) || 'tu coincidencia')}.`, vista: 'Los dos dijeron que sí. Ya hay una charla esperándote.',
        parrafos: [`${hola(P)} Los dos dijeron que sí. Ya hay una charla entre ustedes, y el primer hola ya está dicho.`, 'Lo primero que conoces es su carta. Lo demás, cada quien lo libera a su ritmo: primero quién es, al final cómo se ve.'],
        lista: segun(P, [{ ico: '🖼️', txt: '<b>Tu foto, tu voz y tu video siguen guardados.</b>', sub: 'Abrir la puerta no los entrega: los enseñas tú cuando quieras.' }, { ico: '📎', txt: '<b>Él no puede mandarte fotos ni archivos, ni llamarte.</b>', sub: 'Todo eso nace apagado. Lo enciendes en el botón 👑 de la charla.' }, { ico: '🚪', txt: '<b>Puedes cerrar la puerta cuando quieras.</b>', sub: 'Sin motivo y sin castigo para nadie.' }],
          [{ ico: '✋', txt: '<b>Ella decide el ritmo.</b>', sub: 'Después de cinco mensajes sin respuesta, te toca esperar.' }, { ico: '📎', txt: '<b>Fotos, archivos y llamadas llegan después.</b>', sub: 'Cuando ella los enciende en esa charla.' }, { ico: '🎴', txt: '<b>Para romper el hielo, saca una carta.</b>', sub: 'La contestan los dos y se abre cuando están las dos respuestas.' }],
          [{ ico: '🎴', txt: '<b>Para romper el hielo, saca una carta.</b>', sub: 'La contestan los dos y se abre cuando están las dos respuestas.' }, { ico: '🚪', txt: '<b>Cualquiera puede cerrar la puerta cuando quiera.</b>', sub: 'Sin motivo y sin castigo.' }]),
        boton: { txt: 'Abrir la charla', url: charlaUrl(env, O) } } }) },
  cierre: { cat: 'puertas', cuando: 'Cuando la otra persona cierra la puerta. Es el mismo correo si cerró, bloqueó o reportó: nunca se distingue.', muestra: (P) => ({ O: laOtra(P) }),
    arma: (env, { P, O }) => ({ asunto: `Se cerró la puerta con ${nom(O) || 'tu coincidencia'}`,
      contenido: { eyebrow: 'Puertas', titulo: `Se cerró la puerta con ${esc(nom(O) || 'tu coincidencia')}.`, vista: 'Aquí cualquiera de los dos puede cerrarla cuando quiera, sin dar explicaciones.',
        parrafos: [`${hola(P)} La charla ya no existe para ninguno de los dos, y lo que se compartieron del perfil dejó de verse.`, 'Aquí cualquiera de los dos puede cerrar la puerta cuando quiera, sin dar explicaciones. No hay nada que hacer ni que contestar.', 'Tu búsqueda sigue igual: el motor te sigue cruzando, y cuando alguien cruce el 90 % te escribimos.'],
        boton: { txt: 'Ir a mi tablero', url: `${BASE(env)}/persona` } } }) },
  reabrir: { cat: 'puertas', cuando: 'Cuando quien cerró una puerta quiere volver a abrirla. A la otra persona se le pregunta de nuevo.', muestra: () => ({ pct: 93 }),
    arma: (env, { P, pct }) => ({ asunto: 'Alguien quiere volver a abrir una puerta contigo',
      contenido: { eyebrow: 'Puertas', titulo: 'Alguien quiere volver a abrir una puerta contigo.', vista: 'Tú decides, igual que la primera vez.',
        parrafos: [`${hola(P)} Alguien con quien ya habías hablado${pct ? ` (${pct} % contigo)` : ''} quiere volver a abrir la puerta.`, 'Tú decides, igual que la primera vez. Si prefieres que no, nadie lo sabrá.'],
        boton: { txt: 'Ver y decidir', url: `${BASE(env)}/persona#aceptaciones` } } }) },
  // Todo lo que pasó en una charla mientras la persona no estaba, junto en un solo correo
  novedades: { cat: 'charla', cuando: 'Unos minutos después de que pasa algo en una charla y la persona no está en Cupido. Junta mensajes, fotos, cartas, detalles, invitaciones y llamadas perdidas en un solo correo; como mucho uno cada media hora por charla.',
    muestra: (P) => ({ O: laOtra(P), filas: [{ cat: 'charla', ico: '💬', v: 'te escribió', d: 'Leí tu carta dos veces. ¿Cómo fue tu martes hoy?' }, { cat: 'chispa', ico: '🌹', v: 'te manda una rosa', d: 'Para tu martes.' }, { cat: 'chispa', ico: '🎴', v: 'sacó una carta para los dos', d: '¿Cómo es un domingo perfecto para ti?' }, { cat: 'llamadas', ico: '📞', v: 'te llamó por voz', d: 'No estabas en Cupido en ese momento.' }] }),
    arma: (env, { P, O, filas }) => {
      const n = nom(O) || 'Tu coincidencia', una = filas.length === 1, f0 = filas[0];
      return { asunto: una ? `${n} ${f0.v}${f0.ico ? ' ' + f0.ico : ''}` : `${n}: ${filas.length} novedades en su charla`,
        contenido: { eyebrow: `Tu charla con ${n}`, titulo: una ? `${esc(n)} ${esc(f0.v)}.` : `${esc(n)}: ${filas.length} novedades.`, vista: una ? (f0.d || `${n} ${f0.v}.`) : filas.map((f) => f.v).join(' · '),
          parrafos: [una ? hola(P) : `${hola(P)} Esto pasó en tu charla con ${esc(n)} mientras no estabas:`],
          lista: filas.slice(0, 8).map((f) => ({ ico: f.ico, txt: `<b>${esc(mayus(f.v))}</b>`, sub: f.d ? esc(String(f.d).slice(0, 180)) : '' })).concat(filas.length > 8 ? [{ ico: '➕', txt: `y ${filas.length - 8} más` }] : []),
          boton: { txt: 'Abrir la charla', url: charlaUrl(env, O) },
          nota: segun(P, 'Contestas cuando quieras, o nunca: aquí él no puede insistir. Te escribimos solo cuando no estás en Cupido, y juntamos lo que pasa para no llenarte el correo.', 'Te escribimos solo cuando no estás en Cupido, y juntamos lo que pasa para no llenarte el correo.') } };
    },
    discreta: (env, { filas }) => ({ asunto: 'Tienes novedades en Cupido', contenido: { eyebrow: 'Cupido', titulo: 'Tienes novedades.', parrafos: [`Hay ${filas.length === 1 ? 'una novedad' : filas.length + ' novedades'} en una de tus charlas. Este correo no dice más porque tienes encendidos los correos discretos.`], boton: { txt: 'Abrir mi tablero', url: `${BASE(env)}/persona#charlas` } } }) },
  cita_manana: { cat: 'planes', cuando: 'El día antes de un plan que los dos aceptaron. A los dos.', muestra: (P) => ({ O: laOtra(P), que: 'Un café', donde: 'Café de la plaza', hora: '6:00 p.m.' }),
    arma: (env, { P, O, que, donde, hora }) => ({ asunto: `Mañana: ${String(que).toLowerCase()} con ${nom(O)}`,
      contenido: { eyebrow: 'Mañana', titulo: `Mañana se ven: ${esc(String(que).toLowerCase())} con ${esc(nom(O))}.`, vista: `${que}${donde ? ', en ' + donde : ''}${hora ? ', a las ' + hora : ''}.`,
        parrafos: [`${hola(P)} Mañana es el plan que hicieron en su charla.`],
        lista: [{ ico: '📅', txt: `<b>${esc(que)}</b>`, sub: `${donde ? esc(donde) : 'Lugar: lo platican en la charla'}${hora ? ' · ' + esc(hora) : ''}` },
          ...segun(P, [{ ico: '📲', txt: '<b>Avísale a alguien de confianza</b>', sub: 'Con quién, dónde y a qué hora. Tu tablero te arma el mensaje en «Aquí mando yo».' }, { ico: '☀️', txt: '<b>Lugar público, y llega y vete por tu cuenta</b>', sub: 'Si algo no se siente bien, te vas. No le debes una explicación a nadie.' }],
            [{ ico: '☀️', txt: '<b>Lugar público y sin prisa</b>', sub: 'Que ella llegue y se vaya por su cuenta es lo normal aquí. Así la primera vez sale bien.' }], [{ ico: '☀️', txt: '<b>Lugar público y sin prisa</b>' }])],
        boton: { txt: 'Abrir la charla', url: charlaUrl(env, O) }, nota: 'Si cambió algo, díganselo en la charla: quien aceptó puede cambiar su respuesta cuando quiera.' } }) },
  semana: { cat: 'resumen', cuando: 'Cada domingo a las 10 de la mañana, a quien ya terminó su cuestionario.', muestra: () => ({ r: { coincidencias: 2, esperan: 1, abiertas: 1, sinLeer: 3, masCerca: 88, pool: 37, nuevas: 6, invitados: 1, pausada: false } }),
    arma: (env, { P, r }) => {
      const quieto = !r.coincidencias && !r.abiertas;
      return { asunto: quieto ? 'Tu semana en Cupido: silencio, y por qué eso está bien' : 'Tu semana en Cupido',
        contenido: { eyebrow: 'Tu semana en Cupido', titulo: quieto ? 'Esta semana, silencio.' : 'Esto pasó esta semana.', vista: quieto ? 'Nadie cruzó el 90 % contigo todavía. Te contamos qué sí se movió.' : `${r.coincidencias} coincidencias, ${r.abiertas} puertas abiertas.`,
          parrafos: [quieto ? `${hola(P)} Nadie cruzó el 90 % contigo todavía. No es que algo falle: es el sistema ahorrándote años con las personas incorrectas. Esto es lo que sí se movió:` : `${hola(P)} Tu búsqueda, en una mirada:`],
          lista: [
            r.pausada ? { ico: '⏸️', txt: '<b>Tu perfil está en pausa</b>', sub: 'No apareces para nadie. Lo reactivas con un toque.' } : null,
            { ico: '💘', txt: `<b>${r.coincidencias}</b> ${r.coincidencias === 1 ? 'coincidencia' : 'coincidencias'} arriba del 90 %`, sub: r.esperan ? `${r.esperan} ${r.esperan === 1 ? 'espera' : 'esperan'} tu respuesta` : (r.coincidencias ? 'Todas respondidas' : (r.masCerca ? `Lo más cerca que alguien ha estado: ${r.masCerca} %` : '')) },
            { ico: '🚪', txt: `<b>${r.abiertas}</b> ${r.abiertas === 1 ? 'puerta abierta' : 'puertas abiertas'}`, sub: r.sinLeer ? `${r.sinLeer} ${r.sinLeer === 1 ? 'mensaje sin leer' : 'mensajes sin leer'}` : '' },
            { ico: '👥', txt: `<b>${r.pool}</b> personas buscan lo mismo que tú`, sub: r.nuevas ? `${r.nuevas} ${r.nuevas === 1 ? 'llegó' : 'llegaron'} esta semana, y el motor ya te cruzó con ${r.nuevas === 1 ? 'esa persona' : 'todas'}` : 'Nadie nuevo esta semana' },
            r.invitados ? { ico: '🤍', txt: `<b>${r.invitados}</b> ${r.invitados === 1 ? 'persona llegó' : 'personas llegaron'} por tu invitación`, sub: 'Cada persona seria que entra sube las probabilidades de todos, también las tuyas.' } : null,
          ].filter(Boolean),
          boton: { txt: 'Abrir mi tablero', url: `${BASE(env)}/persona` }, nota: 'Lo que más ayuda a que el silencio dure menos: compartir Cupido con alguien que busque en serio. Tu liga está en tu tablero, en «Apoyar a Cupido».' } };
    } },
  en_revision: { cat: 'acceso', cuando: 'Cuando una cuenta junta tres reportes de mujeres distintas y sale del matching mientras alguien la revisa.', muestra: () => ({}),
    arma: (env, { P }) => ({ asunto: 'Tu cuenta de Cupido está en revisión',
      contenido: { eyebrow: 'Tu cuenta', titulo: 'Tu cuenta está en revisión.', vista: 'Recibimos reportes sobre ti. Mientras alguien los revisa, sales del matching.',
        parrafos: [`${hola(P)} Recibimos varios reportes sobre ti. Mientras una persona del equipo los lee, tu cuenta sale del matching: no aparecen coincidencias nuevas. Tus charlas abiertas siguen.`, 'No te vamos a decir quién ni cuándo: eso protege a quien reporta. Sí te vamos a avisar en cuanto alguien lo haya revisado.'],
        boton: { txt: 'Leer las reglas de la casa', url: `${BASE(env)}/ella` } } }) },
  regreso: { cat: 'acceso', cuando: 'Cuando una persona del equipo revisa una cuenta y la regresa al matching.', muestra: () => ({}),
    arma: (env, { P }) => ({ asunto: 'Tu cuenta regresó al matching',
      contenido: { eyebrow: 'Tu cuenta', titulo: 'Tu cuenta regresó al matching.', vista: 'Una persona del equipo ya la revisó.',
        parrafos: [`${hola(P)} Una persona del equipo ya revisó tu cuenta y la regresó al matching. El motor ya te volvió a cruzar.`, 'Las reglas de la casa siguen siendo las mismas, y vale la pena releerlas.'],
        boton: { txt: 'Ir a mi tablero', url: `${BASE(env)}/persona` } } }) },
  retirada: { cat: 'acceso', cuando: 'Cuando diez mujeres distintas bloquean a alguien, o el equipo lo decide tras un reporte.', muestra: () => ({}),
    arma: (env, { P }) => ({ asunto: 'Tu cuenta de Cupido Algorítmico fue retirada',
      contenido: { eyebrow: 'Las reglas de la casa', titulo: 'Tu cuenta fue retirada.', vista: 'Tu cuenta ya no está en Cupido. Es una decisión definitiva.',
        parrafos: [`${hola(P)} Tu cuenta ya no está en Cupido Algorítmico y no puede volver a entrar.`,
          'Al entrar aceptaste la regla de la casa: aquí manda ella. Cuando diez mujeres distintas bloquean a la misma persona, o cuando un reporte lo amerita, esa cuenta queda fuera para siempre. Bloquear no es lo mismo que dejar de hablar: es lo que alguien hace cuando la hicieron sentir incómoda.',
          'No vamos a decirte quién ni cuándo: eso las protege a ellas. Tus puertas se cerraron y tus respuestas dejaron de cruzarse con nadie.'],
        nota: 'Si quieres que borremos tus datos por completo, responde a este correo y lo hacemos.', pie: 'Cupido Algorítmico existe para que ella encuentre a la persona correcta, segura y en control.' } }) },
  reporte_recibido: { cat: 'cuidado', cuando: 'Al instante, a quien reporta a alguien.', muestra: (P) => ({ O: laOtra(P) }),
    arma: (env, { P, O }) => ({ asunto: 'Recibimos tu reporte',
      contenido: { eyebrow: 'Seguridad', titulo: 'Recibimos tu reporte. Gracias por decirlo.', vista: 'Ya no lo vas a volver a ver, y una persona lo va a leer.',
        parrafos: [`${hola(P)} Hiciste bien en decirlo. Desde este momento:`],
        lista: [{ ico: '⛔', txt: `<b>${esc(nom(O) || 'Esa persona')} quedó ${segun(O, 'bloqueada', 'bloqueado')}</b>`, sub: 'No te ve, no puede escribirte ni llamarte, y el motor no los vuelve a cruzar nunca.' }, { ico: '👀', txt: '<b>Una persona del equipo lo va a leer</b>', sub: 'No una máquina. Con lo que escribiste y lo último que se dijo en esa charla.' }, { ico: '🤫', txt: `<b>${segun(O, 'Ella', 'Él')} no sabe que fue un reporte</b>`, sub: 'Solo vio «Se cerró la puerta», igual que si hubieras cerrado sin más.' }],
        boton: { txt: 'Ir a mi tablero', url: `${BASE(env)}/persona#ella` }, nota: 'Si corres peligro ahora mismo, esto no sustituye al 911. Te escribimos de nuevo cuando alguien lo haya leído.' } }),
    discreta: (env) => ({ asunto: 'Recibimos lo que nos mandaste', contenido: { eyebrow: 'Cupido', titulo: 'Recibimos lo que nos mandaste.', parrafos: ['Una persona del equipo lo va a leer. Los detalles están en tu tablero.'], boton: { txt: 'Abrir mi tablero', url: `${BASE(env)}/persona#ella` } } }) },
  reporte_atendido: { cat: 'cuidado', cuando: 'Cuando una persona del equipo lee un reporte (y, si es el caso, cuando la cuenta reportada se retira).', muestra: () => ({ retirada: true }),
    arma: (env, { P, retirada }) => ({ asunto: 'Una persona ya leyó tu reporte',
      contenido: { eyebrow: 'Seguridad', titulo: 'Una persona del equipo ya leyó tu reporte.', vista: retirada ? 'Esa cuenta ya no está en Cupido.' : 'Sigue sin poder verte ni escribirte.',
        parrafos: [`${hola(P)} Ya lo leímos, completo.`, retirada ? '<b>Esa cuenta ya no está en Cupido</b>, y su correo no puede volver a entrar. Gracias: lo que dijiste también cuida a las que vienen después.' : 'Para ti nada cambia: esa persona sigue sin poder verte, escribirte ni llamarte, y el motor no los vuelve a cruzar. Tu reporte queda guardado y cuenta si alguien más reporta lo mismo.'],
        boton: { txt: 'Ir a mi tablero', url: `${BASE(env)}/persona` } } }),
    discreta: (env) => ({ asunto: 'Ya revisamos lo que nos mandaste', contenido: { eyebrow: 'Cupido', titulo: 'Ya revisamos lo que nos mandaste.', parrafos: ['Los detalles están en tu tablero.'], boton: { txt: 'Abrir mi tablero', url: `${BASE(env)}/persona` } } }) },
  invitado: { cat: 'cuenta', cuando: 'Cuando alguien crea su cuenta con la liga de invitación de la persona.', muestra: () => ({ total: 3 }),
    arma: (env, { P, total }) => ({ asunto: 'Alguien entró a Cupido por tu invitación',
      contenido: { eyebrow: 'Gracias', titulo: 'Alguien entró a Cupido por tu invitación.', vista: 'Cada persona seria que entra sube las probabilidades de todos.',
        parrafos: [`${hola(P)} Alguien abrió su cuenta con tu liga. ${total > 1 ? `Ya van <b>${total}</b> personas que llegan por ti.` : 'Es la primera persona que llega por ti.'}`, 'No te da ninguna ventaja en el algoritmo, y así debe ser. Te da algo mejor: más personas serias, más cruces, más posibilidades de que alguien cruce el 90 % contigo.'],
        boton: { txt: 'Ver mi liga para compartir', url: `${BASE(env)}/persona#apoyar` } } }) },
  gracias: { cat: 'cuenta', cuando: 'Al confirmar un aporte al Fondo de atracción o al hacerse Socio fundador.', muestra: () => ({ tipo: 'fondo', monto: 200 }),
    arma: (env, { P, tipo, monto }) => ({ asunto: tipo === 'socio' ? 'Gracias por ser Socio fundador de Cupido' : 'Gracias por tu aporte al Fondo de atracción',
      contenido: { eyebrow: 'Gracias', titulo: tipo === 'socio' ? 'Eres Socio fundador de Cupido.' : 'Tu aporte ya está en el Fondo de atracción.', vista: 'Cada peso se usa para traer a la siguiente persona seria.',
        parrafos: [`${hola(P)} ${tipo === 'socio' ? `Cada mes, ${monto} pesos tuyos` : `Tus ${monto} pesos`} se van íntegros a traer a la siguiente persona seria a Cupido: más personas, más cruces, más coincidencias arriba del 90 %, también para ti.`, 'No te da ninguna ventaja en el algoritmo, y así debe ser. Te da algo mejor: una comunidad más grande y nuestro agradecimiento. Cada año publicamos en qué se gastó.'],
        boton: { txt: 'Ver el programa', url: `${BASE(env)}/persona#apoyar` },
        nota: tipo === 'socio' ? 'Puedes cancelar cuando quieras desde tu tablero, sin preguntas. Devoluciones sin preguntas durante 15 días escribiendo a contacto@ingenieriadigital.mx.' : 'Devoluciones sin preguntas durante 15 días escribiendo a contacto@ingenieriadigital.mx.' } }) },
  revision: { cat: 'cuenta', cuando: 'Cada seis meses: ¿sigue igual tu ciudad, tu trabajo, tu situación?', muestra: () => ({}),
    arma: (env, { P }) => ({ asunto: '¿Sigue igual tu situación? Un minuto, cada seis meses',
      contenido: { eyebrow: 'Revisión', titulo: '¿Sigue todo igual?', vista: 'Ciudad, trabajo, hijos, tu situación: lo que cambia en seis meses.',
        parrafos: [`${hola(P)} Cada seis meses te preguntamos lo que sí cambia: tu ciudad, tu trabajo, si quieres hijos, y tu situación. Con eso el motor te lee mejor y tu precio justo se acomoda a ti.`, 'Si te quedaste sin trabajo, dilo ahí: Cupido se vuelve gratis en ese instante y sin preguntas.'],
        boton: { txt: 'Revisar en un minuto', url: `${BASE(env)}/persona#apoyar` }, nota: 'Es un minuto. Si todo sigue igual, solo confirmas.' } }) },
  espacio: { cat: 'cuenta', cuando: 'Cuando lo que la persona ha subido pasa del 80 % de su espacio incluido.', muestra: () => ({ usado: '4.2 GB', tope: '5.0 GB', pct: 84 }),
    arma: (env, { P, usado, tope, pct }) => ({ asunto: `Tu espacio en Cupido va en ${pct} %`,
      contenido: { eyebrow: 'Tu espacio', titulo: `Llevas ${esc(usado)} de ${esc(tope)}.`, vista: 'Todo lo tuyo se guarda sin comprimir. Te avisamos antes de que se llene.',
        parrafos: [`${hola(P)} Tus fotos, audios y videos se guardan en la calidad en que los subes, y eso ocupa. Vas en <b>${pct} %</b> de tu espacio incluido.`, 'Si se llena, nada se borra: solo no podrás subir más hasta quitar algo que ya no uses.'],
        boton: { txt: 'Ver mi espacio', url: `${BASE(env)}/persona#medios` } } }) },
  prueba: { cat: 'acceso', cuando: 'Cuando la persona toca «Mándame un correo de prueba» en su tablero.', muestra: () => ({}),
    arma: (env, { P }) => ({ asunto: 'Así se ven los correos de Cupido',
      contenido: { eyebrow: 'Correo de prueba', titulo: 'Sí llegó. Así te vamos a escribir.', vista: 'Tu correo funciona y Cupido te encuentra.',
        parrafos: [`${hola(P)} Este es un correo de prueba: llegó bien, así que no te vas a perder nada.`, 'De inicio te avisamos de todo. Lo que no quieras saber lo apagas tú, por categoría, y cada correo trae su propio «ya no quiero estos».'],
        boton: { txt: 'Elegir qué correos recibo', url: `${BASE(env)}/persona#correos` }, nota: 'Si alguno cae en spam, márcalo como «no es spam» y agrega cupido@capitaltorreon.com a tus contactos.' } }) },
};

// Arma un correo para una persona: elige la versión discreta si la pidió y le pone su pie de baja
export async function armar(env, P, tipo, datos = {}) {
  const def = CORREOS[tipo]; if (!def) throw new Error('No existe ese correo: ' + tipo);
  const cat = datos.cat && CATEGORIA[datos.cat] ? datos.cat : def.cat, C = CATEGORIA[cat];
  let c = def.arma(env, { P, ...datos });
  if (P && discreto(P) && !C.fijo) c = def.discreta ? def.discreta(env, { P, ...datos }) : { asunto: 'Tienes novedades en Cupido', contenido: { eyebrow: 'Cupido', titulo: 'Tienes novedades.', parrafos: ['Entra a tu tablero para verlas. Este correo no dice más porque tienes encendidos los correos discretos.'], boton: { txt: 'Abrir mi tablero', url: `${BASE(env)}/persona` } } };
  if (P?.id && !C.fijo) { const t = await tokenBaja(env, P); c.contenido.baja = { n: C.n, url: `${BASE(env)}/correo/baja?t=${t}&c=${cat}`, todas: `${BASE(env)}/persona#correos` }; }
  else c.contenido.pieCuenta = P?.id ? `Este correo es de tu cuenta y llega siempre. <a href="${BASE(env)}/persona#correos" style="color:#75707c">Elegir qué correos recibo</a>` : '';
  return { ...c, cat };
}
// Envía un correo a una persona si tiene encendida su categoría (los de acceso van siempre)
export async function correoA(env, P, tipo, datos = {}, { clave = null, cadaMinutos = 0, forzar = false } = {}) {
  if (!P?.correo || !CORREOS[tipo]) return null;
  const cat = datos.cat || CORREOS[tipo].cat;
  if (!forzar && !quiere(P, cat)) return 'apagado';
  const c = await armar(env, P, tipo, datos);
  return mandar(env, { persona: P.id, para: P.correo, tipo, clave, asunto: c.asunto, contenido: c.contenido, cadaMinutos });
}

/* ── la baja con un clic (sin entrar a la cuenta) ────────────────────────── */
export async function tokenBaja(env, P) {
  if (P.baja) return P.baja;
  if (!P.correo) return 'muestra';
  const t = [...crypto.getRandomValues(new Uint8Array(18))].map((b) => b.toString(36).padStart(2, '0')).join('').slice(0, 30);
  await env.DB.prepare(`UPDATE personas SET baja = ? WHERE id = ? AND baja IS NULL`).bind(t, P.id).run();
  return (await env.DB.prepare(`SELECT baja FROM personas WHERE id = ?`).bind(P.id).first())?.baja || t;
}
async function cambiarCategoria(env, P, cat, on) {
  const a = ajustesDe(P); a.correos = { ...(a.correos || {}), [cat]: !!on };
  if (on) a.avisos_correo = true;
  await env.DB.prepare(`UPDATE personas SET ajustes = ? WHERE id = ?`).bind(JSON.stringify(a), P.id).run();
  if (!on) await env.DB.prepare(`DELETE FROM novedades WHERE persona = ? AND cat = ?`).bind(P.id, cat).run();
  await anotar(env, 'correo', on ? 'Alguien volvió a encender una categoría de correos' : 'Alguien apagó una categoría de correos', cat);
}
// GET enseña la página y pregunta (los buzones abren las ligas solos: un GET nunca da de baja); POST la hace.
export async function paginaBaja(env, req, url) {
  const t = String(url.searchParams.get('t') || ''), cat = String(url.searchParams.get('c') || ''), C = CATEGORIA[cat];
  const fila = /^[a-z0-9]{20,40}$/.test(t) ? await env.DB.prepare(`SELECT id FROM personas WHERE baja = ?`).bind(t).first() : null;
  const P = fila ? await persona(env, fila.id) : null;
  const pag = (titulo, cuerpo, status = 200) => new Response(`<!doctype html><html lang="es"><head><meta charset="utf-8"><meta name="viewport" content="width=device-width,initial-scale=1"><meta name="robots" content="noindex"><title>${esc(titulo)} · Cupido Algorítmico</title><link rel="icon" href="/favicon.svg" type="image/svg+xml"><link rel="stylesheet" href="/css/cupido.css"></head><body data-author="RLR"><header class="barra"><div class="envoltura barra-in"><a class="marca" href="/"><span class="corazon">💘</span><b>Cupido Algorítmico</b></a></div></header><main class="envoltura entrar"><section class="tarjeta" style="max-width:560px;margin:40px auto"><p class="eyebrow">Mis correos</p><h1 style="font-size:30px;margin:0 0 10px">${titulo}</h1>${cuerpo}</section></main></body></html>`, { status, headers: { 'content-type': 'text/html; charset=utf-8', 'cache-control': 'no-store' } });
  if (!P || !C || C.fijo) return pag('Esta liga ya no sirve', `<p class="sub">Puede que sea vieja. Tus correos los eliges en tu tablero, en «Mis correos».</p><p><a class="boton" href="/persona#correos">Ir a mi tablero</a></p>`, 404);
  const accion = `/correo/baja?t=${t}&c=${cat}`;
  if (req.method === 'POST') {
    const cuerpoTxt = await req.text().catch(() => '');
    const on = /(^|&)volver=1/.test(cuerpoTxt);
    await cambiarCategoria(env, P, cat, on);
    if (/List-Unsubscribe=One-Click/i.test(cuerpoTxt)) return new Response('ok');
    return on ? pag(`Listo: «${C.n}» vuelve a llegarte`, `<p class="sub">${esc(C.d)}</p><p><a class="boton boton-claro" href="/persona#correos">Elegir qué correos recibo</a></p>`)
      : pag(`Listo: ya no te mandamos «${C.n}»`, `<p class="sub">Lo demás sigue igual. Si fue sin querer, lo vuelves a encender aquí mismo.</p><form method="post" action="${accion}" style="display:flex;gap:10px;flex-wrap:wrap"><input type="hidden" name="volver" value="1"><button class="boton boton-claro" type="submit">Volver a encenderlo</button><a class="boton boton-fantasma" href="/persona#correos">Elegir qué correos recibo</a></form>`);
  }
  return pag(`¿Ya no quieres «${C.n}»?`, `<p class="sub">${esc(C.i)} ${esc(C.d)}</p><p class="sub">Solo se apaga esto. Lo demás te sigue llegando, y lo puedes volver a encender cuando quieras.</p><form method="post" action="${accion}" style="display:flex;gap:10px;flex-wrap:wrap"><button class="boton" type="submit">Sí, ya no me los manden</button><a class="boton boton-fantasma" href="/persona#correos">Mejor elijo yo cuáles</a></form>`);
}

/* ── las preferencias, para el tablero ───────────────────────────────────── */
export async function prefsDe(env, P) {
  const a = ajustesDe(P);
  const ultimos = (await env.DB.prepare(`SELECT tipo, asunto, estado, creado FROM correos WHERE persona = ? ORDER BY id DESC LIMIT 12`).bind(P.id).all()).results
    .map((c) => ({ ...c, cat: CORREOS[c.tipo]?.cat || 'acceso' }));
  return { on: a.avisos_correo !== false, discreto: !!a.correo_discreto, silencio: !!a.correo_silencio,
    categorias: CATEGORIAS.map((c) => ({ ...c, on: c.fijo ? true : (a.correos || {})[c.id] !== false })), ultimos, correo: P.correo || null };
}
export async function ponerPrefs(env, P, b = {}) {
  const a = ajustesDe(P);
  if (typeof b.on === 'boolean') a.avisos_correo = b.on;
  if (typeof b.discreto === 'boolean') a.correo_discreto = b.discreto;
  if (typeof b.silencio === 'boolean') a.correo_silencio = b.silencio;
  if (b.cat && CATEGORIA[b.cat] && !CATEGORIA[b.cat].fijo && typeof b.valor === 'boolean') { a.correos = { ...(a.correos || {}), [b.cat]: b.valor }; if (!b.valor) await env.DB.prepare(`DELETE FROM novedades WHERE persona = ? AND cat = ?`).bind(P.id, b.cat).run(); }
  if (b.todas === true) { a.correos = {}; a.avisos_correo = true; }
  if (b.on === false) await env.DB.prepare(`DELETE FROM novedades WHERE persona = ?`).bind(P.id).run();
  await env.DB.prepare(`UPDATE personas SET ajustes = ? WHERE id = ?`).bind(JSON.stringify(a), P.id).run();
  return prefsDe(env, { ...P, ajustes: JSON.stringify(a) });
}

/* ── las novedades de una charla: se juntan y salen en un solo correo ────── */
// `nov` = { cat, ico, v: 'te escribió' (lo que hizo, en minúscula, para decirlo junto a su nombre), d: detalle }
export async function anotarNovedad(env, c, de, para, nov) {
  try {
    const O = await persona(env, para);
    if (!O?.correo || !quiere(O, nov.cat)) return false;
    if ((await presenciaVivo(env, c.a, c.b)).includes(para)) return false; // está en Cupido: ya lo está viendo
    const ult = (await env.DB.prepare(`SELECT COALESCE(MAX(id), 0) AS n FROM mensajes WHERE a = ? AND b = ?`).bind(c.a, c.b).first()).n;
    await env.DB.prepare(`INSERT INTO novedades (persona, otra, cat, ico, v, d, mensaje) VALUES (?, ?, ?, ?, ?, ?, ?)`).bind(para, de, nov.cat, nov.ico || '', String(nov.v).slice(0, 120), nov.d ? String(nov.d).slice(0, 240) : null, ult).run();
    return true;
  } catch (e) { console.error('novedad', e.message); return false; }
}
const ESPERA_MIN = 3, ENTRE_CORREOS_MIN = 30;
const salio = (r) => !!r && !['apagado', 'reciente', 'sin_remitente'].includes(r); // ¿de verdad salió un correo?
// Cada pocos minutos: lo que lleva esperando sale junto, si la persona todavía no lo vio
export async function despacharNovedades(env) {
  const grupos = (await env.DB.prepare(`SELECT persona, otra, COUNT(*) AS n FROM novedades GROUP BY persona, otra HAVING MIN(creado) <= datetime('now', ?) LIMIT 60`).bind(`-${ESPERA_MIN} minutes`).all()).results;
  let enviados = 0;
  for (const g of grupos) {
    const limpiar = () => env.DB.prepare(`DELETE FROM novedades WHERE persona = ? AND otra = ?`).bind(g.persona, g.otra).run();
    const [P, O] = [await persona(env, g.persona), await persona(env, g.otra)];
    const [a, b] = g.persona < g.otra ? [g.persona, g.otra] : [g.otra, g.persona];
    const ch = await env.DB.prepare(`SELECT * FROM charlas WHERE a = ? AND b = ?`).bind(a, b).first();
    if (!P?.correo || !O || !ch || ch.cerrada || P.estado === 'vetada') { await limpiar(); continue; }
    const leido = g.persona === a ? ch.leido_a : ch.leido_b;
    let filas = (await env.DB.prepare(`SELECT * FROM novedades WHERE persona = ? AND otra = ? ORDER BY id ASC`).bind(g.persona, g.otra).all()).results;
    filas = filas.filter((f) => f.mensaje > leido && quiere(P, f.cat)); // lo que ya leyó en Cupido no se le repite por correo
    if (!filas.length || (await presenciaVivo(env, a, b)).includes(g.persona)) { await limpiar(); continue; }
    if (ajustesDe(P).correo_silencio && esHoraDeSilencio()) continue; // espera a la mañana
    const reciente = await env.DB.prepare(`SELECT 1 AS v FROM correos WHERE persona = ? AND tipo = 'novedades' AND clave = ? AND creado > datetime('now', ?)`).bind(P.id, g.otra, `-${ENTRE_CORREOS_MIN} minutes`).first();
    if (reciente) continue; // se junta con lo siguiente
    const cat = filas.some((f) => f.cat === 'charla') ? 'charla' : filas[0].cat;
    await limpiar();
    if (salio(await correoA(env, P, 'novedades', { O: { id: O.id, nombre: O.nombre, genero: O.genero }, filas, cat }, { clave: g.otra, forzar: true }))) enviados++;
  }
  return enviados;
}

/* ── lo de cada día: recordatorios y el resumen de los domingos ──────────── */
export async function correosDelDia(env, { domingo = new Date().getUTCDay() === 0 } = {}) {
  const hechos = { pendientes: 0, citas: 0, semanas: 0 };
  // 1 · coincidencias que llevan tres días o más sin respuesta: juntas en un correo por persona, como mucho cada dos semanas
  //     (nunca cuentan las de una mujer que pidió decidir primero y aún no dice que sí: él no sabe que existen)
  const puertas = (await env.DB.prepare(`SELECT * FROM puertas WHERE estado = 'cerrada' AND avisada < datetime('now', '-3 days') AND avisada > datetime('now', '-60 days')`).all()).results;
  const porPersona = new Map();
  for (const pu of puertas) for (const [yo, otra, mia, suya] of [[pu.a, pu.b, pu.decision_a, pu.decision_b], [pu.b, pu.a, pu.decision_b, pu.decision_a]]) {
    if (mia) continue;
    const [P, O] = [await persona(env, yo), await persona(env, otra)];
    if (!P?.correo || P.estado !== 'activa' || !O || O.estado !== 'activa') continue;
    if (P.genero === 'hombre' && O.genero !== 'hombre' && ajustesDe(O).primero && suya !== 'si') continue;
    const dias = Math.floor((Date.now() - Date.parse(pu.avisada.replace(' ', 'T') + 'Z')) / 86400000);
    const x = porPersona.get(yo) || { P, n: 0, pct: 0, dias: 0 }; x.n++; x.pct = Math.max(x.pct, pu.pct); x.dias = Math.max(x.dias, dias); porPersona.set(yo, x);
  }
  for (const x of porPersona.values()) if (salio(await correoA(env, x.P, 'pendiente', { n: x.n, pct: x.pct, dias: x.dias }, { cadaMinutos: 60 * 24 * 14 }))) hechos.pendientes++;
  // 2 · planes de mañana (hora del centro de México)
  const manana = new Date(Date.now() - 6 * 3600000 + 86400000).toISOString().slice(0, 10);
  const citas = (await env.DB.prepare(`SELECT m.id, m.a, m.b, m.de, m.archivo FROM mensajes m JOIN charlas c ON c.a = m.a AND c.b = m.b WHERE m.tipo = 'cita' AND c.cerrada IS NULL AND json_extract(m.archivo, '$.cuando') LIKE ? AND EXISTS (SELECT 1 FROM respuestas r WHERE r.mensaje = m.id AND r.valor = 'si')`).bind(manana + '%').all()).results;
  for (const m of citas) {
    const A = JSON.parse(m.archivo || '{}');
    const hora = (() => { try { return new Date(A.cuando + ':00Z').toLocaleTimeString('es-MX', { hour: 'numeric', minute: '2-digit', timeZone: 'UTC' }); } catch { return ''; } })();
    for (const [yo, otra] of [[m.a, m.b], [m.b, m.a]]) {
      const [P, O] = [await persona(env, yo), await persona(env, otra)];
      if (P?.correo && O && salio(await correoA(env, P, 'cita_manana', { O: { id: O.id, nombre: O.nombre, genero: O.genero }, que: A.que, donde: A.donde || '', hora }, { clave: `cita${m.id}`, cadaMinutos: 60 * 24 * 30 }))) hechos.citas++;
    }
  }
  // 3 · tu semana en Cupido: los domingos, a quien ya está en el matching (o en pausa)
  if (domingo) {
    const reales = (await env.DB.prepare(`SELECT id FROM personas WHERE pool = 'real' AND correo IS NOT NULL AND completo = 1 AND estado IN ('activa', 'pausada')`).all()).results;
    for (const f of reales) {
      const P = await persona(env, f.id);
      if (!quiere(P, 'resumen')) continue;
      try { if (salio(await correoA(env, P, 'semana', { r: await resumenSemana(env, P) }, { cadaMinutos: 60 * 24 * 6 }))) hechos.semanas++; } catch (e) { console.error('semana', P.id, e.message); }
    }
  }
  return hechos;
}
export async function resumenSemana(env, P) {
  const v = await vistaPersona(env, P);
  const vivas = v.coincidencias.filter((c) => c.puerta.estado !== 'retirada');
  const nuevas = (await env.DB.prepare(`SELECT COUNT(*) AS n FROM personas WHERE completo = 1 AND estado = 'activa' AND id != ? AND creada > datetime('now', '-7 days')`).bind(P.id).first()).n;
  return { coincidencias: vivas.length, esperan: vivas.filter((c) => c.puerta.estado === 'cerrada' && !c.puerta.miDecision).length, abiertas: vivas.filter((c) => c.puerta.estado === 'abierta').length,
    sinLeer: (v.charlas || []).reduce((s, c) => s + c.nuevos, 0), masCerca: v.masCerca || 0, pool: v.pool.delOtroLado, nuevas: Math.min(nuevas, v.pool.delOtroLado), invitados: v.invitacion?.invitados || 0, pausada: P.estado === 'pausada' };
}

/* ── para el admin: el catálogo, la vista previa y la serie de muestra ───── */
const personaDeMuestra = (genero, para = 'muestra@cupido.test') => ({ id: null, nombre: genero === 'mujer' ? 'Sofía Rangel' : genero === 'hombre' ? 'Andrés Luna' : 'Alex Mora', genero: genero === 'otro' ? 'nobinaria' : genero, correo: para, ajustes: '{}' });
export const catalogoCorreos = () => Object.entries(CORREOS).map(([tipo, d]) => ({ tipo, cat: d.cat, categoria: CATEGORIA[d.cat].n, cuando: d.cuando, fijo: !!CATEGORIA[d.cat].fijo, discreta: !!d.discreta }));
export function vistaPrevia(env, tipo, genero = 'mujer', esDiscreto = false) {
  const def = CORREOS[tipo]; if (!def) return null;
  const P = { ...personaDeMuestra(genero), ajustes: JSON.stringify({ correo_discreto: esDiscreto }) };
  let c = def.arma(env, { P, ...def.muestra(P) });
  const C = CATEGORIA[def.cat];
  if (esDiscreto && !C.fijo) c = def.discreta ? def.discreta(env, { P, ...def.muestra(P) }) : { asunto: 'Tienes novedades en Cupido', contenido: { eyebrow: 'Cupido', titulo: 'Tienes novedades.', parrafos: ['Entra a tu tablero para verlas. Este correo no dice más porque tienes encendidos los correos discretos.'], boton: { txt: 'Abrir mi tablero', url: `${BASE(env)}/persona` } } };
  if (!C.fijo) c.contenido.baja = { n: C.n, url: `${BASE(env)}/correo/baja?t=muestra&c=${def.cat}`, todas: `${BASE(env)}/persona#correos` };
  else c.contenido.pieCuenta = `Este correo es de tu cuenta y llega siempre. <a href="${BASE(env)}/persona#correos" style="color:#75707c">Elegir qué correos recibo</a>`;
  return { asunto: c.asunto, ...plantilla(env, c.contenido) };
}
// La serie completa a un correo, como la recibiría una mujer o un hombre
export async function mandarMuestra(env, para, genero = 'mujer') {
  const P = personaDeMuestra(genero, para), r = [];
  for (const [tipo, def] of Object.entries(CORREOS)) {
    const c = def.arma(env, { P, ...def.muestra(P) }), C = CATEGORIA[def.cat];
    if (!C.fijo) c.contenido.baja = { n: C.n, url: `${BASE(env)}/correo/baja?t=muestra&c=${def.cat}`, todas: `${BASE(env)}/persona#correos` };
    r.push({ tipo, id: await mandar(env, { persona: null, para, tipo: 'muestra', asunto: `[Muestra] ${c.asunto}`, contenido: c.contenido }) });
    await new Promise((x) => setTimeout(x, 550));
  }
  return r;
}
// fin · RLR
