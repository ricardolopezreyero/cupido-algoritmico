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
   · Ningún correo se vende: cada uno cuenta algo que es de esa persona y la
     invita a UNA cosa. Por eso todos traen un botón, y solo uno.
   · Cada correo lleva lo suyo: su nombre, el porcentaje, en qué coinciden,
     lo que le espera adentro. Lo que hace falta saber para armarlo se busca
     en `prepara`, y si esa búsqueda falla el correo sale igual, más sencillo.
   El diseño (marca, portada, bloques, firma y pie) vive en correo-diseno.js.
   Remitente: cupido@capitaltorreon.com vía Resend. Cada envío se registra.
   ───────────────────────────────────────────────────────────────────────────── */
// RLR
import { anotar, persona, vistaPersona, codigoDe } from './datos.js';
import { presenciaVivo } from './viva.js';
import { mediosDe } from './medios.js';
import { senalesPara } from './ella.js';
import { razonesPersona } from '../public/js/motor.js';
import { avance } from '../public/js/preguntas.js';
import { plantilla, revisar, esc, TONOS, TOPE_CORREO, LIMITE_GMAIL, p, sec, lista, cita, cifras, burbujas, pasos, ficha, chips, aviso } from './correo-diseno.js';
export { plantilla };

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
const tablero = (env, h = '') => `${BASE(env)}/persona${h ? '#' + h : ''}`;
const nom = (P) => (!P || !P.nombre || P.nombre === 'Sin nombre' ? '' : P.nombre.split(' ')[0]);
const hola = (P) => (nom(P) ? `Hola, ${esc(nom(P))}.` : 'Hola.');
const ajustesDe = (P) => { try { return JSON.parse(P?.ajustes || '{}'); } catch { return {}; } };
// El mismo correo, dicho distinto según quién lo lee
const segun = (P, ella, el, neutro = el) => (P?.genero === 'mujer' ? ella : P?.genero === 'hombre' ? el : neutro);
const mayus = (s) => String(s || '').charAt(0).toUpperCase() + String(s || '').slice(1);
const cuantos = (n, uno, varios) => `${n} ${n === 1 ? uno : varios}`;
// Un pedazo de un texto largo, cortado en una palabra y no a media sílaba
const recorte = (t, n = 210) => { const s = String(t || '').replace(/\s+/g, ' ').trim(); if (s.length <= n) return s; const c = s.slice(0, n); return c.slice(0, Math.max(c.lastIndexOf(' '), n - 40)).replace(/[,;:.\s]+$/, '') + '…'; };
const MESES = ['enero', 'febrero', 'marzo', 'abril', 'mayo', 'junio', 'julio', 'agosto', 'septiembre', 'octubre', 'noviembre', 'diciembre'];
const DIAS = ['domingo', 'lunes', 'martes', 'miércoles', 'jueves', 'viernes', 'sábado'];
const fechaDe = (iso) => { const d = new Date(String(iso || '').slice(0, 10) + 'T12:00:00Z'); return isNaN(d) ? null : { dia: d.getUTCDate(), mes: MESES[d.getUTCMonth()], sem: DIAS[d.getUTCDay()] }; };
const ICO_DIM = { 'Visión de vida': '🧭', 'Proyecto de familia': '🏡', 'Valores en acción': '⚖️', 'Conflicto y reparación': '🤝', 'Afecto y cuidado': '🤍', 'Fe y vida interior': '🕊️', 'Vida cotidiana': '☕', 'Personalidad y humor': '😄', Cartas: '✉️' };

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

/* ── envío + registro ────────────────────────────────────────────────────── */
export async function mandar(env, { persona: pid = null, para, tipo, clave = null, asunto, contenido, cadaMinutos = 0 }) {
  if (!para) return null;
  if (!env.CORREO_SIMULADO && (!env.RESEND_KEY || !env.FROM_EMAIL)) { console.warn('Sin RESEND_KEY/FROM_EMAIL'); return 'sin_remitente'; }
  if (cadaMinutos > 0 && pid) {
    const ya = await env.DB.prepare(`SELECT 1 AS v FROM correos WHERE persona = ? AND tipo = ? AND (clave = ? OR ? IS NULL) AND creado > datetime('now', ?)`).bind(pid, tipo, clave, clave, `-${cadaMinutos} minutes`).first();
    if (ya) return 'reciente';
  }
  const { html, text, peso } = plantilla(env, contenido);
  // Gmail corta lo que pasa de 102 KB. Ningún correo debería acercarse; si alguno crece, que se sepa antes de que alguien lo reciba cortado.
  if (peso > TOPE_CORREO) await anotar(env, 'sistema', 'Un correo salió más pesado de lo debido', `${tipo} · ${(peso / 1024).toFixed(1)} KB`);
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

/* ── lo que se busca antes de armar un correo ────────────────────────────── */
// En qué coinciden dos personas, visto por una de ellas. Lo íntimo no viaja por correo: se lee adentro.
async function razonesCon(env, P, otraId) {
  const fx = await env.DB.prepare(`SELECT detalle FROM pares WHERE (a = ? AND b = ?) OR (a = ? AND b = ?)`).bind(P.id, otraId, otraId, P.id).first();
  if (!fx) return [];
  return razonesPersona(JSON.parse(fx.detalle), P.id).fuertes.filter((f) => !/sexual|íntim/i.test(f.dim)).slice(0, 3).map((f) => ({ dim: f.dim, pct: f.pct, txt: f.txt }));
}
// Lo que ella puede ver de él antes de decidir (lo mismo que le enseña su tablero)
async function senalesDe(env, P, otraId) {
  const O = await persona(env, otraId);
  return O ? (await senalesPara(env, P, [O])).get(otraId) || null : null;
}

/* ── los correos ─────────────────────────────────────────────────────────── */
// Cada uno: cat (categoría), cuando (para el catálogo), reenvio (¿se presta a reenviarse? entonces lleva la invitación al pie),
// prepara(env, P, datos) → lo que hay que buscar para personalizarlo, arma(env, datos) → { asunto, contenido }, muestra (datos de ejemplo)
const O_M = { id: 'm01', nombre: 'Mariana Treviño', genero: 'mujer', color: '#8a6bbf', r: { carta: 'Busco a alguien con quien el silencio no sea incómodo y los domingos se alarguen sin plan. Soy de las que preguntan cómo te fue y de verdad escuchan la respuesta. Me río fuerte y cocino regular.' } };
const O_H = { id: 'h01', nombre: 'Diego Garza', genero: 'hombre', color: '#2f8f83', r: { carta: 'No busco a alguien que me complete: busco con quién construir. Me gusta el café sin prisa, manejar en carretera con buena música y la gente que dice lo que piensa. Si algo me importa, lo cuido.' } };
const laOtra = (P) => (P?.genero === 'mujer' ? O_H : O_M);
const charlaUrl = (env, O) => `${BASE(env)}/persona#charlas/${O?.id || ''}`;
const FUERTES_MUESTRA = [{ dim: 'Conflicto y reparación', pct: 97, txt: 'Cuando algo les molesta, los dos se calman y lo hablan pronto' }, { dim: 'Proyecto de familia', pct: 94, txt: 'En hijos van en la misma dirección' }, { dim: 'Visión de vida', pct: 93, txt: 'Se imaginan su vida en el mismo tipo de lugar' }];
const filasDeRazones = (fuertes) => (fuertes || []).map((f) => ({ ico: ICO_DIM[f.dim] || '💗', txt: `<b>${esc(f.txt)}</b>`, sub: `${esc(f.dim)} · ${f.pct} %` }));
// El código de ocho números, por si el enlace abre en otro lado (la app del iPhone, el navegador de adentro del correo)
const bloqueCodigo = (codigo, minutos) => (codigo ? [aviso('🔢', `<b>¿El enlace abrió en otro lado?</b> Pasa con la app instalada en el teléfono. Escribe este código donde pediste entrar:<br><span style="display:inline-block;margin:8px 0 4px;font-family:Georgia,'Times New Roman',serif;font-size:28px;line-height:1.2;font-weight:700;letter-spacing:3px;color:#211d24;white-space:nowrap">${esc(String(codigo).slice(0, 4))}&nbsp;${esc(String(codigo).slice(4))}</span><br><span style="font-size:14px;color:#6b6672">Vale ${minutos} minutos, igual que el enlace. Nadie de Cupido te lo va a pedir nunca.</span>`, 'sol')] : []);
const candado = (minutos) => aviso('🔒', `<b>Este enlace abre tu cuenta: no reenvíes este correo.</b> Vale ${minutos} minutos y se usa una sola vez. Si tú no lo pediste, ignóralo: nadie puede entrar sin él.`, 'gris');
const DISCRETO = (env, h = '') => ({ asunto: 'Tienes novedades en Cupido', contenido: { tono: 'sereno', figura: { tipo: 'emoji', v: '💌' }, eyebrow: 'Cupido', titulo: 'Tienes novedades.', sub: 'Entra a verlas cuando tengas un momento a solas.', vista: 'Entra a verlas cuando tengas un momento.',
  cuerpo: [p('Este correo no dice más porque tienes encendidos los <b>correos discretos</b>: sin nombres y sin contenido, para que nadie más lea lo que es tuyo.')], boton: { txt: 'Abrir mi tablero', url: tablero(env, h) } } });

export const CORREOS = {
  enlace: { cat: 'acceso', cuando: 'Cada vez que alguien pide entrar con su correo. Si ya tiene cuenta, le dice lo que le espera adentro.',
    muestra: () => ({ enlace: 'https://cupido.capitaltorreon.com/entrar/muestra', minutos: 20, codigo: '48391275', espera: { sinLeer: 3, esperan: 1, abiertas: 1 } }),
    prepara: async (env, P) => (!P?.id || discreto(P) ? {} : P.completo ? { espera: await resumenSemana(env, P) } : { av: avance(P.r || {}).pct }),
    arma: (env, { P, enlace, minutos, codigo, espera, av }) => {
      const filas = [
        espera?.sinLeer ? { ico: '💬', txt: `<b>${cuantos(espera.sinLeer, 'mensaje', 'mensajes')}</b> sin leer` } : null,
        espera?.esperan ? { ico: '💘', txt: `<b>${cuantos(espera.esperan, 'coincidencia espera', 'coincidencias esperan')}</b> tu respuesta` } : null,
        espera?.abiertas ? { ico: '🚪', txt: `<b>${cuantos(espera.abiertas, 'puerta abierta', 'puertas abiertas')}</b>` } : null,
        av != null && av < 100 ? { ico: '📝', txt: `<b>Tu cuestionario va en ${av} %</b>`, sub: 'Todo sigue donde lo dejaste.' } : null,
      ].filter(Boolean);
      return { asunto: nom(P) ? `${nom(P)}, aquí está tu enlace para entrar a Cupido` : 'Tu enlace para entrar a Cupido Algorítmico',
        contenido: { tono: 'noche', figura: { tipo: 'emoji', v: '🔑' }, eyebrow: 'Tu llave', titulo: nom(P) ? `Pásale, ${esc(nom(P))}.` : 'Pásale.', sub: 'Un toque y estás en tu tablero. Sin contraseña: tu correo es tu llave.', vista: `Un toque y estás adentro. Vale ${minutos} minutos y se usa una sola vez.`,
          cuerpo: [p('Aquí está el enlace que pediste. Ábrelo en el mismo teléfono o computadora donde quieres entrar.')],
          boton: { txt: 'Entrar a mi tablero', url: enlace, sub: `Vale ${minutos} minutos · se usa una sola vez` },
          despues: [...bloqueCodigo(codigo, minutos), ...(filas.length ? [sec('Lo que te espera adentro'), lista(filas)] : []), candado(minutos)],
          nota: `Si el botón no abre, copia esta liga en tu navegador:<br><span style="word-break:break-all">${esc(enlace)}</span>` } };
    } },
  bienvenida: { cat: 'acceso', cuando: 'La primera vez que alguien entra con un correo nuevo.', muestra: () => ({ enlace: 'https://cupido.capitaltorreon.com/entrar/muestra', minutos: 20, codigo: '48391275' }),
    arma: (env, { enlace, minutos, codigo }) => ({ asunto: 'Qué gusto: tu cuenta de Cupido está lista',
      contenido: { tono: 'amor', figura: { tipo: 'emoji', v: '💘' }, eyebrow: 'Qué gusto que llegaste', titulo: 'No es una app de citas.', sub: 'Es un sistema de detección de parejas. Y tu cuenta ya está lista.', vista: 'Respondes 43 preguntas una sola vez y el motor hace el resto. Aquí está tu enlace.',
        cuerpo: [
          p('Aquí no hay perfiles que deslizar ni fotos como moneda de cambio. Hay 43 preguntas, un motor que cruza respuestas y una promesa: <b>solo te escribimos si alguien cruza el 90 % contigo</b>, en las dos direcciones.'),
          sec('Así funciona'),
          pasos([{ txt: '<b>Respondes 43 preguntas, una sola vez.</b>', sub: 'Con la verdad. Puedes cerrar y seguir otro día: todo se guarda.' }, { txt: '<b>El motor te cruza con quien busca lo mismo.</b>', sub: 'Mientras tanto, silencio. Eso también es el sistema trabajando.' }, { txt: '<b>Si alguien cruza el 90 %, les avisamos a los dos.</b>', sub: 'La puerta se abre solo con dos síes. De un no, nadie se entera.' }]),
          cita('Tú pon la verdad. Nosotros ponemos la lógica. El amor lo ponen ustedes dos.'),
        ],
        boton: { txt: 'Empezar mi cuestionario', url: enlace, sub: 'No hay contraseña que recordar: tu correo es tu cuenta' },
        despues: [...bloqueCodigo(codigo, minutos), candado(minutos)],
        nota: 'Te vamos a avisar por correo de todo lo que pase. Lo que no quieras saber, lo apagas en tu tablero, en «Mis correos».' } }) },
  matching: { cat: 'busqueda', reenvio: true, cuando: 'Al terminar el cuestionario: el motor ya cruzó a la persona. Le dice qué le falta subir.', muestra: () => ({ pares: 21, nuevas: 0, tengo: { foto: true, voz: false, video: false } }),
    prepara: async (env, P) => { const m = await mediosDe(env, P.id); return { tengo: { foto: !!m.foto, voz: !!m.audio, video: !!m.video } }; },
    arma: (env, { P, pares, nuevas, tengo }) => {
      const faltan = tengo ? [['foto', 'mi foto'], ['voz', 'mi voz'], ['video', 'mi video']].filter(([k]) => !tengo[k]).map(([, n]) => n) : [], falta = faltan.length > 0;
      const juntar = (l) => (l.length > 1 ? l.slice(0, -1).join(', ') + ' y ' + l[l.length - 1] : l[0]);
      const medio = (k, ico, n, listo, pend) => ({ ico, txt: `<b>${n}</b>${tengo[k] ? ' &nbsp;<span style="color:#2e8b57;font-weight:700">✓ Listo</span>' : ''}`, sub: tengo[k] ? listo : pend });
      return { asunto: nom(P) ? `${nom(P)}, ya estás en el matching` : 'Ya estás en el matching',
        contenido: { tono: nuevas ? 'amor' : 'claro', figura: { tipo: 'emoji', v: '🏹' }, eyebrow: 'Tu cuestionario', titulo: 'Ya estás en el matching.', sub: 'Terminaste las 43 preguntas, y el motor ya dio su primera vuelta.', vista: nuevas ? 'El motor ya te cruzó, y hay alguien arriba del 90 % contigo.' : 'El motor ya te cruzó. Y ahora, silencio hasta que alguien cruce el 90 %.',
          cuerpo: [
            p(`${hola(P)} Hiciste la parte difícil: contestar con la verdad. Esto encontró el motor al cruzarte con todas las personas que buscan lo mismo que tú:`),
            cifras([{ n: pares, e: pares === 1 ? 'par evaluado' : 'pares evaluados' }, nuevas ? { n: nuevas, e: nuevas === 1 ? 'coincidencia arriba del 90 %' : 'coincidencias arriba del 90 %' } : { n: '90&nbsp;%', e: 'lo mínimo para escribirte' }]),
            p(nuevas ? 'Entra a tu tablero: ahí está, con la puerta cerrada hasta que los dos digan que sí.' : '<b>Y ahora, silencio.</b> No es que algo falle: te estamos ahorrando años con las personas incorrectas. Cada vez que alguien nuevo termine su cuestionario, el motor te vuelve a cruzar. Cuando alguien pase del 90 %, te escribimos a este correo.'),
            ...(tengo ? [sec(falta ? 'Mientras tanto, deja lista tu parte' : 'Tu parte ya está lista'), lista([
              medio('foto', '📷', 'Tu foto', 'Solo la verá quien abra una puerta contigo, y cuando tú decidas.', 'Solo la verá quien abra una puerta contigo, y cuando tú decidas.'),
              medio('voz', '🎙️', 'Tu voz', 'Un saludo tuyo, para que te conozcan antes de verte.', 'Un saludo de medio minuto dice más que diez mensajes.'),
              medio('video', '🎬', 'Tu video', 'Para quien ya llegó hasta ahí contigo.', 'Opcional. Para quien ya llegó hasta ahí contigo.')])] : []),
          ],
          boton: nuevas ? { txt: 'Ver mi coincidencia', url: tablero(env, 'coincidencias') } : falta ? { txt: `Subir ${juntar(faltan)}`, url: tablero(env, 'medios'), sub: 'Nada se enseña sin que tú lo decidas' } : { txt: 'Ver mi tablero', url: tablero(env) } } };
    } },
  recordatorio: { cat: 'busqueda', cuando: 'Una sola vez, a los dos días de dejar el cuestionario a medias.', muestra: () => ({ faltan: 11, pct: 74 }),
    arma: (env, { P, faltan, pct }) => ({ asunto: !pct ? 'Tus 43 preguntas te esperan en Cupido' : `Te ${faltan === 1 ? 'falta 1 pregunta' : `faltan ${faltan} preguntas`} para entrar al matching`,
      contenido: { tono: 'sol', figura: { tipo: 'barra', pct, pie: 'de tu cuestionario' }, eyebrow: 'Tu cuestionario', titulo: !pct ? 'Tus 43 preguntas te esperan.' : faltan === 1 ? 'Te falta una pregunta.' : `Te faltan ${faltan} preguntas.`, sub: pct ? 'Todo sigue exactamente donde lo dejaste.' : 'Se contestan una sola vez, y a tu ritmo.', vista: pct ? 'Todo sigue donde lo dejaste. Sin ellas, el motor todavía no te ve.' : 'Se contestan una sola vez. Sin ellas, el motor todavía no te ve.',
        cuerpo: [
          p(`${hola(P)} ${pct >= 50 ? 'Ya hiciste la mayor parte.' : pct ? 'Ya empezaste, que es lo más difícil.' : 'Tu cuenta ya está lista; falta lo que la hace funcionar.'} Sin ${pct ? 'las que faltan' : 'tus respuestas'} el motor no puede cruzarte con nadie: todavía no te ve.`),
          ...(segun(P, [aviso('🚪', '<b>Tu filtro todavía no se enciende.</b> Mientras tanto nadie llega a tu puerta: ni quien no debía, ni quien sí.')], [aviso('🏹', '<b>Todavía no llegas a nadie.</b> En cuanto termines, el motor te cruza con todas las personas que buscan lo que tú eres.')], [])),
          lista([{ ico: '⏸️', txt: '<b>No tiene que ser de corrido</b>', sub: 'Contestas unas cuantas, cierras y sigues otro día. Todo se guarda.' }, { ico: '🎙️', txt: '<b>Las de párrafo se pueden dictar</b>', sub: 'Tocas el micrófono y hablas, como si le contaras a alguien.' }, { ico: '🤫', txt: '<b>Nadie lee tus respuestas</b>', sub: 'Las cruza el motor. Ninguna persona navega perfiles aquí.' }]),
        ],
        boton: { txt: pct ? 'Seguir donde iba' : 'Empezar mi cuestionario', url: `${BASE(env)}/cuestionario` }, nota: 'Este recordatorio se manda una sola vez. No te vamos a insistir.' } }) },
  coincidencia: { cat: 'busqueda', reenvio: true, cuando: 'Cuando alguien cruza el 90 % con la persona. A los dos, al mismo tiempo (salvo que ella haya pedido decidir primero). Dice en qué coinciden; a ella, además, lo que vemos de él.',
    muestra: (P) => ({ pct: 96, fuertes: FUERTES_MUESTRA, senales: P?.genero === 'mujer' ? { dias: 34, charlas: 1, bloqueos: 0 } : null }),
    prepara: async (env, P, { otra }) => (otra ? { fuertes: await razonesCon(env, P, otra), senales: P.genero !== 'hombre' ? await senalesDe(env, P, otra) : null } : {}),
    arma: (env, { P, pct, fuertes, senales }) => ({ asunto: `${nom(P) ? nom(P) + ', a' : 'A'}pareció alguien al ${pct} % contigo 💘`,
      contenido: { tono: 'amor', figura: { tipo: 'numero', v: pct, sufijo: '%', pie: 'de afinidad, en las dos direcciones' }, eyebrow: 'Coincidencia', titulo: 'Apareció alguien.', sub: 'Casi nunca mandamos este correo. Hoy sí.', vista: 'Alguien cruzó el 90 % contigo. La puerta está cerrada hasta que los dos digan que sí.',
        cuerpo: [
          p(`${hola(P)} Alguien cruzó el 90 % contigo: lo que tú buscas se parece a lo que esa persona es, y al revés. No sabes quién es, y esa persona tampoco sabe quién eres tú.`),
          ...(fuertes?.length ? [sec('En qué coinciden'), lista(filasDeRazones(fuertes))] : []),
          ...(senales ? [aviso('👁️', `<b>Lo que vemos de él:</b> ${senales.dias ? `lleva ${cuantos(senales.dias, 'día', 'días')} aquí` : 'llegó hoy'}, ${senales.charlas ? `conversa con ${cuantos(senales.charlas, 'persona', 'personas')} más` : 'no conversa con nadie más'} y ${senales.bloqueos ? `${cuantos(senales.bloqueos, 'mujer lo ha bloqueado', 'mujeres lo han bloqueado')}` : 'ninguna mujer lo ha bloqueado'}.`, 'gris')] : []),
          p(segun(P, '<b>Decide con calma: aquí mandas tú.</b> La puerta está cerrada hasta que los dos digan que sí, y de un no nadie se entera jamás.', 'La puerta está cerrada hasta que los dos digan que sí, y de un no nadie se entera jamás. Ella decide a su ritmo, y eso es parte de por qué este lugar funciona.', 'La puerta está cerrada hasta que los dos digan que sí, y de un no nadie se entera jamás.')),
        ],
        boton: { txt: 'Ver por qué coinciden', url: tablero(env, 'coincidencias'), sub: 'Lo lees completo y después decides: sí, o ahora no' } } }),
    discreta: (env) => ({ asunto: 'Hay algo importante en tu tablero', contenido: { tono: 'sereno', figura: { tipo: 'emoji', v: '💌' }, eyebrow: 'Cupido', titulo: 'Hay algo importante en tu tablero.', sub: 'Pasó algo que casi nunca pasa.', vista: 'Entra a verlo cuando tengas un momento a solas.', cuerpo: [p('Entra a verlo cuando tengas un momento a solas. Este correo no dice más porque tienes encendidos los correos discretos.')], boton: { txt: 'Abrir mi tablero', url: tablero(env, 'coincidencias') } } }) },
  pendiente: { cat: 'busqueda', cuando: 'Cuando hay coincidencias que llevan tres días o más sin respuesta. Todas juntas en un correo, y como mucho cada dos semanas.', muestra: () => ({ n: 2, pct: 94, dias: 6, lista: [{ pct: 94, dias: 4 }, { pct: 91, dias: 6 }] }),
    arma: (env, { P, n, pct, dias, lista: pend }) => ({ asunto: n === 1 ? `Tu coincidencia al ${pct} % sigue esperando` : `Tienes ${n} coincidencias sin responder`,
      contenido: { tono: 'sol', figura: n === 1 ? { tipo: 'numero', v: pct, sufijo: '%', pie: `apareció hace ${cuantos(dias, 'día', 'días')}` } : { tipo: 'numero', v: n, pie: 'coincidencias esperan tu respuesta' }, eyebrow: 'Tu búsqueda', titulo: n === 1 ? 'Sigue ahí.' : 'Siguen ahí.', sub: 'No hay prisa. Solo que no se te pasen.', vista: 'No hay prisa y no hay respuesta incorrecta. Solo que no se te pasen.',
        cuerpo: [
          p(`${hola(P)} ${n === 1 ? 'Alguien cruzó el 90 % contigo y todavía no dices ni sí ni no.' : `Tienes ${n} coincidencias arriba del 90 % a las que todavía no les dices ni sí ni no.`} Cruzar el 90 % casi nunca pasa; por eso te lo recordamos.`),
          ...(n > 1 && pend?.length ? [lista(pend.slice(0, 5).map((x) => ({ ico: '💘', txt: `<b>${x.pct} %</b> contigo`, sub: `Apareció hace ${cuantos(x.dias, 'día', 'días')}` })).concat(pend.length > 5 ? [{ ico: '➕', txt: `y ${pend.length - 5} más` }] : []))] : []),
          aviso('🤫', '<b>No hay respuesta incorrecta.</b> Un «ahora no» nadie lo ve. Y un sí tampoco, a menos que la otra persona también lo diga.'),
        ],
        boton: { txt: n === 1 ? 'Verla y decidir' : 'Verlas y decidir', url: tablero(env, 'aceptaciones') }, nota: 'Te lo recordamos como mucho cada dos semanas.' } }) },
  puerta: { cat: 'puertas', cuando: 'Cuando los dos dijeron que sí. A los dos. Lleva un pedazo de la carta de la otra persona.', muestra: (P) => ({ O: laOtra(P), pct: 96 }),
    prepara: async (env, P, { O }) => { const f = O?.id ? await env.DB.prepare(`SELECT pct FROM puertas WHERE (a = ? AND b = ?) OR (a = ? AND b = ?)`).bind(P.id, O.id, O.id, P.id).first() : null; return { pct: f?.pct || null }; },
    arma: (env, { P, O, pct }) => {
      const n = nom(O) || 'tu coincidencia', carta = recorte(O?.r?.carta);
      return { asunto: `Se abrió la puerta con ${n} 💘`,
        contenido: { tono: 'amor', figura: { tipo: 'pareja', a: nom(P), ca: P?.color, b: nom(O), cb: O?.color }, eyebrow: 'Puerta abierta', titulo: `Se abrió la puerta con ${esc(n)}.`, sub: `Los dos dijeron que sí${pct ? `. Coinciden al ${pct} %.` : '.'}`, vista: 'Los dos dijeron que sí. Ya hay una charla esperándote.',
          cuerpo: [
            p(`${hola(P)} Ya hay una charla entre ustedes, y el primer hola ya está dicho.`),
            ...(carta ? [cita(esc(carta), `De la carta de ${esc(n)}`), p('Su carta completa te espera adentro. Lo demás, cada quien lo libera a su ritmo: primero quién es, al final cómo se ve.')] : [p('Lo primero que conoces es su carta. Lo demás, cada quien lo libera a su ritmo: primero quién es, al final cómo se ve.')]),
            lista(segun(P, [{ ico: '🖼️', txt: '<b>Tu foto, tu voz y tu video siguen guardados.</b>', sub: 'Abrir la puerta no los entrega: los enseñas tú cuando quieras.' }, { ico: '📎', txt: '<b>Él no puede mandarte fotos ni archivos, ni llamarte.</b>', sub: 'Todo eso nace apagado. Lo enciendes en el botón 👑 de la charla.' }, { ico: '🚪', txt: '<b>Puedes cerrar la puerta cuando quieras.</b>', sub: 'Sin motivo y sin castigo para nadie.' }],
              [{ ico: '✋', txt: '<b>Ella decide el ritmo.</b>', sub: 'Después de cinco mensajes sin respuesta, te toca esperar.' }, { ico: '📎', txt: '<b>Fotos, archivos y llamadas llegan después.</b>', sub: 'Cuando ella los enciende en esa charla.' }, { ico: '🎴', txt: '<b>Para romper el hielo, saca una carta.</b>', sub: 'La contestan los dos y se abre cuando están las dos respuestas.' }],
              [{ ico: '🎴', txt: '<b>Para romper el hielo, saca una carta.</b>', sub: 'La contestan los dos y se abre cuando están las dos respuestas.' }, { ico: '🚪', txt: '<b>Cualquiera puede cerrar la puerta cuando quiera.</b>', sub: 'Sin motivo y sin castigo.' }])),
          ],
          boton: { txt: nom(O) ? `Abrir mi charla con ${nom(O)}` : 'Abrir la charla', url: charlaUrl(env, O), sub: segun(P, 'Contestas cuando quieras: aquí nadie te apura', 'Sin prisa: lo bueno se escribe con calma', '') } } };
    } },
  cierre: { cat: 'puertas', cuando: 'Cuando la otra persona cierra la puerta. Es el mismo correo si cerró, bloqueó o reportó: nunca se distingue.', muestra: (P) => ({ O: laOtra(P) }),
    arma: (env, { P, O }) => ({ asunto: `Se cerró la puerta con ${nom(O) || 'tu coincidencia'}`,
      contenido: { tono: 'sereno', figura: { tipo: 'emoji', v: '🚪' }, eyebrow: 'Puertas', titulo: `Se cerró la puerta con ${esc(nom(O) || 'tu coincidencia')}.`, sub: 'Aquí cualquiera de los dos puede cerrarla cuando quiera, sin dar explicaciones.', vista: 'Aquí cualquiera de los dos puede cerrarla cuando quiera, sin dar explicaciones.',
        cuerpo: [
          p(`${hola(P)} La charla ya no existe para ninguno de los dos, y lo que se compartieron del perfil dejó de verse. No hay nada que contestar ni que arreglar.`),
          p('Que una puerta se cierre no dice nada malo de nadie: dice que no era ahí. Y cruzar el 90 % una vez quiere decir que tus respuestas sí encuentran a alguien.'),
          aviso('🏹', '<b>Tu búsqueda sigue igual.</b> El motor te vuelve a cruzar cada vez que llega alguien nuevo, y cuando alguien pase del 90 % contigo te escribimos.'),
        ],
        boton: { txt: 'Ir a mi tablero', url: tablero(env) } } }) },
  reabrir: { cat: 'puertas', cuando: 'Cuando quien cerró una puerta quiere volver a abrirla. A la otra persona se le pregunta de nuevo.', muestra: () => ({ pct: 93, fuertes: FUERTES_MUESTRA.slice(0, 2) }),
    prepara: async (env, P, { otra }) => (otra ? { fuertes: (await razonesCon(env, P, otra)).slice(0, 2) } : {}),
    arma: (env, { P, pct, fuertes }) => ({ asunto: 'Alguien quiere volver a abrir una puerta contigo',
      contenido: { tono: 'claro', figura: { tipo: 'emoji', v: '🚪' }, eyebrow: 'Puertas', titulo: 'Alguien quiere volver a abrir una puerta contigo.', sub: 'Tú decides, igual que la primera vez.', vista: 'Tú decides, igual que la primera vez. Si prefieres que no, nadie lo sabrá.',
        cuerpo: [
          p(`${hola(P)} Alguien con quien ya habías hablado${pct ? ` (${pct} % contigo)` : ''} cerró la puerta y ahora quiere volver a intentarlo.`),
          ...(fuertes?.length ? [sec('En qué coincidían'), lista(filasDeRazones(fuertes))] : []),
          aviso('🤍', '<b>No le debes un sí.</b> Si prefieres que no, nadie lo sabrá: de tu lado, simplemente no pasa nada.'),
        ],
        boton: { txt: 'Ver y decidir', url: tablero(env, 'aceptaciones') } } }) },
  // Todo lo que pasó en una charla mientras la persona no estaba, junto en un solo correo
  novedades: { cat: 'charla', cuando: 'Unos minutos después de que pasa algo en una charla y la persona no está en Cupido. Junta mensajes, fotos, cartas, detalles, invitaciones y llamadas perdidas en un solo correo; como mucho uno cada media hora por charla.',
    muestra: (P) => ({ O: laOtra(P), filas: [{ cat: 'charla', ico: '💬', v: 'te escribió', d: 'Leí tu carta dos veces. ¿Cómo fue tu martes hoy?' }, { cat: 'chispa', ico: '🌹', v: 'te manda una rosa', d: 'Para tu martes.' }, { cat: 'chispa', ico: '🎴', v: 'sacó una carta para los dos', d: '¿Cómo es un domingo perfecto para ti?' }, { cat: 'llamadas', ico: '📞', v: 'te llamó por voz', d: 'No estabas en Cupido en ese momento.' }] }),
    arma: (env, { P, O, filas }) => {
      const n = nom(O) || 'Tu coincidencia', una = filas.length === 1, f0 = filas[0], contesta = filas.some((f) => f.cat === 'charla' || f.cat === 'chispa');
      return { asunto: una ? `${n} ${f0.v}${f0.ico ? ' ' + f0.ico : ''}` : `${n} te dejó ${filas.length} novedades`,
        contenido: { tono: 'claro', figura: { tipo: 'avatar', v: nom(O), c: O?.color }, eyebrow: `Tu charla con ${n}`, titulo: una ? `${esc(n)} ${esc(f0.v)}.` : `${esc(n)} te dejó ${filas.length} novedades.`, sub: 'Pasó mientras no estabas en Cupido.', vista: una ? (f0.d || `${n} ${f0.v}.`) : filas.map((f) => f.v).join(' · '),
          cuerpo: [
            p(una ? hola(P) : `${hola(P)} Esto pasó en tu charla con ${esc(n)}:`),
            burbujas(filas.slice(0, 8).map((f) => ({ ico: f.ico, v: esc(mayus(f.v)), d: f.d ? esc(recorte(f.d, 180)) : '', suave: f.cat !== 'charla' })).concat(filas.length > 8 ? [{ ico: '➕', v: `y ${filas.length - 8} más`, suave: true }] : [])),
          ],
          boton: { txt: contesta && nom(O) ? `Contestarle a ${nom(O)}` : 'Abrir la charla', url: charlaUrl(env, O), sub: segun(P, 'Contestas cuando quieras, o nunca: aquí él no puede insistir', 'Sin prisa: ella decide el ritmo', '') },
          nota: 'Te escribimos solo cuando no estás en Cupido, y juntamos lo que pasa para no llenarte el correo.' } };
    },
    discreta: (env, { filas }) => ({ asunto: 'Tienes novedades en Cupido', contenido: { tono: 'sereno', figura: { tipo: 'emoji', v: '💌' }, eyebrow: 'Cupido', titulo: 'Tienes novedades.', sub: `Hay ${filas.length === 1 ? 'una novedad' : filas.length + ' novedades'} en una de tus charlas.`, vista: 'Entra a verlas cuando tengas un momento.', cuerpo: [p('Este correo no dice más porque tienes encendidos los <b>correos discretos</b>: sin nombres y sin contenido.')], boton: { txt: 'Abrir mi tablero', url: tablero(env, 'charlas') } } }) },
  cita_manana: { cat: 'planes', cuando: 'El día antes de un plan que los dos aceptaron. A los dos.', muestra: (P) => ({ O: laOtra(P), que: 'Un café', donde: 'Café de la plaza', hora: '6:00 p.m.', fecha: new Date(Date.now() + 86400000 - 6 * 3600000).toISOString().slice(0, 10) }),
    arma: (env, { P, O, que, donde, hora, fecha }) => {
      const f = fechaDe(fecha), n = nom(O) || 'tu coincidencia', q = String(que || 'un plan');
      return { asunto: `Mañana: ${q.toLowerCase()} con ${n}`,
        contenido: { tono: 'sol', figura: f ? { tipo: 'fecha', dia: f.dia, mes: f.mes.slice(0, 3).toUpperCase(), sem: mayus(f.sem), pie: [hora, donde].filter(Boolean).map(esc).join(' · ') } : { tipo: 'emoji', v: '📅' }, eyebrow: 'Mañana', titulo: `Mañana se ven: ${esc(q.toLowerCase())} con ${esc(n)}.`, sub: 'Que salga bonito.', vista: `${q}${donde ? ', en ' + donde : ''}${hora ? ', a las ' + hora : ''}.`,
          cuerpo: [
            p(`${hola(P)} Mañana es el plan que hicieron en su charla. Solo queríamos que no se te pasara.`),
            ficha('El plan', [['Qué', esc(q)], ['Con', esc(n)], f ? ['Cuándo', `${mayus(f.sem)} ${f.dia} de ${f.mes}${hora ? ', ' + esc(hora) : ''}`] : null, ['Dónde', donde ? esc(donde) : 'Lo platican en la charla']]),
            lista(segun(P, [{ ico: '📲', txt: '<b>Avísale a alguien de confianza</b>', sub: 'Con quién, dónde y a qué hora. Tu tablero te arma el mensaje en «Aquí mando yo».' }, { ico: '☀️', txt: '<b>Lugar público, y llega y vete por tu cuenta</b>', sub: 'Si algo no se siente bien, te vas. No le debes una explicación a nadie.' }],
              [{ ico: '☀️', txt: '<b>Lugar público y sin prisa</b>', sub: 'Que ella llegue y se vaya por su cuenta es lo normal aquí. Así la primera vez sale bien.' }, { ico: '👂', txt: '<b>Llega a escuchar</b>', sub: 'Ya coinciden en lo importante. Mañana toca conocerse.' }], [{ ico: '☀️', txt: '<b>Lugar público y sin prisa</b>', sub: 'Ya coinciden en lo importante. Mañana toca conocerse.' }])),
          ],
          boton: { txt: nom(O) ? `Abrir mi charla con ${nom(O)}` : 'Abrir la charla', url: charlaUrl(env, O), sub: 'Si cambió algo, díganselo ahí' }, nota: 'Quien aceptó puede cambiar su respuesta cuando quiera.' } };
    } },
  semana: { cat: 'resumen', reenvio: true, cuando: 'Cada domingo a las 10 de la mañana, a quien ya terminó su cuestionario. El botón cambia según lo que más le conviene hacer a esa persona.', muestra: () => ({ r: { coincidencias: 2, esperan: 1, abiertas: 1, sinLeer: 3, masCerca: 88, pool: 37, nuevas: 6, invitados: 1, pausada: false, sinFoto: false } }),
    arma: (env, { P, r }) => {
      const quieto = !r.coincidencias && !r.abiertas;
      // Lo que sigue: una sola cosa, la que más le sirve a esta persona hoy
      const sigue = r.pausada ? { ico: '⏸️', x: '<b>Tu perfil está en pausa.</b> No apareces para nadie y el motor no te cruza. Cuando quieras volver, es un toque.', b: { txt: 'Reactivar mi perfil', url: tablero(env) } }
        : r.esperan ? { ico: '💘', x: `<b>${cuantos(r.esperan, 'coincidencia espera', 'coincidencias esperan')} tu respuesta.</b> Léela con calma: un «ahora no» nadie lo ve.`, b: { txt: r.esperan === 1 ? 'Ver mi coincidencia y decidir' : 'Ver mis coincidencias y decidir', url: tablero(env, 'aceptaciones') } }
        : r.sinLeer ? { ico: '💬', x: `<b>Tienes ${cuantos(r.sinLeer, 'mensaje', 'mensajes')} sin leer</b> en una charla que se abrió con dos síes.`, b: { txt: 'Leer mis mensajes', url: tablero(env, 'charlas') } }
        : r.sinFoto ? { ico: '📷', x: '<b>Todavía no subes tu foto.</b> No se la enseñamos a nadie: solo la ve quien abra una puerta contigo, y cuando tú decidas. Tenerla lista hace que ese día todo fluya.', b: { txt: 'Subir mi foto', url: tablero(env, 'medios') } }
        : { ico: '🤍', x: '<b>Lo que más acorta el silencio es más gente seria.</b> Si conoces a alguien que busca en serio, pásale tu liga. No te da ventaja en el algoritmo: te da más cruces posibles.', b: { txt: 'Ver mi liga para compartir', url: tablero(env, 'apoyar') } };
      return { asunto: quieto ? 'Tu semana en Cupido: silencio, y por qué eso está bien' : `${nom(P) ? nom(P) + ', t' : 'T'}u semana en Cupido`,
        contenido: { tono: quieto ? 'noche' : 'claro', figura: { tipo: 'emoji', v: quieto ? '🌙' : '🗞️' }, eyebrow: (() => { const h = fechaDe(new Date(Date.now() - 6 * 3600000).toISOString()); return `${mayus(h.sem)} ${h.dia} de ${h.mes}`; })(), titulo: quieto ? 'Esta semana, silencio.' : 'Esto pasó esta semana.', sub: quieto ? 'Y eso también es el sistema trabajando para ti.' : 'Tu búsqueda, en una mirada.', vista: quieto ? 'Nadie cruzó el 90 % contigo todavía. Te contamos qué sí se movió.' : `${cuantos(r.coincidencias, 'coincidencia', 'coincidencias')}, ${cuantos(r.abiertas, 'puerta abierta', 'puertas abiertas')}${r.sinLeer ? `, ${cuantos(r.sinLeer, 'mensaje', 'mensajes')} sin leer` : ''}.`,
          cuerpo: [
            p(quieto ? `${hola(P)} Nadie cruzó el 90 % contigo todavía. No es que algo falle: es el sistema ahorrándote años con las personas incorrectas. Esto es lo que sí se movió:` : `${hola(P)} Así va lo tuyo:`),
            cifras([...(quieto ? [] : [{ n: r.coincidencias, e: 'arriba del 90 % contigo' }, { n: r.abiertas, e: r.abiertas === 1 ? 'puerta abierta' : 'puertas abiertas' }]), { n: r.pool, e: r.pool === 1 ? 'persona busca lo mismo que tú' : 'personas buscan lo mismo que tú' }, { n: r.nuevas, e: r.nuevas === 1 ? 'llegó esta semana' : 'llegaron esta semana' }]),
            lista([
              r.nuevas ? { ico: '🏹', txt: `<b>El motor ya te cruzó con ${r.nuevas === 1 ? 'la persona nueva' : `las ${r.nuevas} personas nuevas`}</b>`, sub: 'Cada vez que alguien termina su cuestionario, te vuelve a cruzar.' } : { ico: '🏹', txt: '<b>Nadie nuevo esta semana</b>', sub: 'En cuanto alguien termine su cuestionario, el motor te cruza.' },
              !r.coincidencias && r.masCerca ? { ico: '📈', txt: `<b>Lo más cerca que alguien ha estado: ${r.masCerca} %</b>`, sub: 'Avisamos a partir del 90 %. Abajo de eso, preferimos el silencio.' } : null,
              r.invitados ? { ico: '🤍', txt: `<b>${cuantos(r.invitados, 'persona llegó', 'personas llegaron')} por tu invitación</b>`, sub: 'Cada persona seria que entra sube las probabilidades de todos, también las tuyas.' } : null,
            ]),
            sec('Lo que sigue'), aviso(sigue.ico, sigue.x),
          ],
          boton: sigue.b, nota: 'Este resumen llega los domingos, aunque no haya pasado nada: también el silencio se cuenta.' } };
    } },
  en_revision: { cat: 'acceso', cuando: 'Cuando una cuenta junta tres reportes de mujeres distintas y sale del matching mientras alguien la revisa.', muestra: () => ({}),
    arma: (env, { P }) => ({ asunto: 'Tu cuenta de Cupido está en revisión',
      contenido: { tono: 'sereno', figura: { tipo: 'emoji', v: '🔎' }, firma: 'equipo', eyebrow: 'Tu cuenta', titulo: 'Tu cuenta está en revisión.', sub: 'Mientras una persona del equipo la revisa, sales del matching.', vista: 'Recibimos reportes sobre ti. Mientras alguien los revisa, sales del matching.',
        cuerpo: [
          p(`${hola(P)} Recibimos varios reportes sobre ti. Esto es lo que cambia mientras una persona del equipo los lee:`),
          lista([{ ico: '⏸️', txt: '<b>No aparecen coincidencias nuevas</b>', sub: 'Tu cuenta sale del matching hasta que termine la revisión.' }, { ico: '💬', txt: '<b>Tus charlas abiertas siguen</b>', sub: 'Lo que ya tienes no se toca.' }, { ico: '✉️', txt: '<b>Te avisamos en cuanto alguien lo haya revisado</b>', sub: 'Lo lee una persona, no una máquina.' }]),
          p('No te vamos a decir quién ni cuándo: eso protege a quien reporta. Lo que sí puedes hacer hoy es releer las reglas de la casa.'),
        ],
        boton: { txt: 'Leer las reglas de la casa', url: `${BASE(env)}/ella` } } }) },
  regreso: { cat: 'acceso', cuando: 'Cuando una persona del equipo revisa una cuenta y la regresa al matching.', muestra: () => ({}),
    arma: (env, { P }) => ({ asunto: 'Tu cuenta regresó al matching',
      contenido: { tono: 'calma', figura: { tipo: 'emoji', v: '✅' }, firma: 'equipo', eyebrow: 'Tu cuenta', titulo: 'Tu cuenta regresó al matching.', sub: 'Una persona del equipo ya la revisó.', vista: 'Una persona del equipo ya la revisó. El motor ya te volvió a cruzar.',
        cuerpo: [
          p(`${hola(P)} Una persona del equipo ya revisó tu cuenta y la regresó al matching. El motor ya te volvió a cruzar con todas las personas que buscan lo mismo que tú.`),
          p('Las reglas de la casa siguen siendo las mismas, y vale la pena tenerlas presentes: aquí ella decide el ritmo.'),
        ],
        boton: { txt: 'Ir a mi tablero', url: tablero(env) }, segunda: { txt: 'Releer las reglas de la casa', url: `${BASE(env)}/ella` } } }) },
  retirada: { cat: 'acceso', cuando: 'Cuando diez mujeres distintas bloquean a alguien, o el equipo lo decide tras un reporte.', muestra: () => ({}),
    arma: (env, { P }) => ({ asunto: 'Tu cuenta de Cupido Algorítmico fue retirada',
      contenido: { tono: 'noche', firma: 'equipo', promesas: false, eyebrow: 'Las reglas de la casa', titulo: 'Tu cuenta fue retirada.', sub: 'Es una decisión definitiva.', vista: 'Tu cuenta ya no está en Cupido. Es una decisión definitiva.',
        cuerpo: [
          p(`${hola(P)} Tu cuenta ya no está en Cupido Algorítmico y no puede volver a entrar.`),
          p('Al entrar aceptaste la regla de la casa: aquí manda ella. Cuando diez mujeres distintas bloquean a la misma persona, o cuando un reporte lo amerita, esa cuenta queda fuera para siempre. Bloquear no es lo mismo que dejar de hablar: es lo que alguien hace cuando la hicieron sentir incómoda.'),
          p('No vamos a decirte quién ni cuándo: eso las protege a ellas. Tus puertas se cerraron y tus respuestas dejaron de cruzarse con nadie.'),
        ],
        boton: { txt: 'Leer la regla de la casa', url: `${BASE(env)}/ella` },
        nota: 'Si quieres que borremos tus datos por completo, responde a este correo y lo hacemos.', pieCuenta: 'Te llegó porque tenías una cuenta en Cupido Algorítmico.', pie: 'Cupido Algorítmico existe para que ella encuentre a la persona correcta, segura y en control.' } }) },
  reporte_recibido: { cat: 'cuidado', cuando: 'Al instante, a quien reporta a alguien.', muestra: (P) => ({ O: laOtra(P) }),
    arma: (env, { P, O }) => ({ asunto: 'Recibimos tu reporte',
      contenido: { tono: 'calma', figura: { tipo: 'emoji', v: '🛡️' }, firma: 'equipo', eyebrow: 'Seguridad', titulo: 'Recibimos tu reporte.', sub: 'Gracias por decirlo. Hiciste bien.', vista: 'Ya no lo vas a volver a ver, y una persona lo va a leer.',
        cuerpo: [
          p(`${hola(P)} Desde este momento:`),
          lista([{ ico: '⛔', txt: `<b>${esc(nom(O) || 'Esa persona')} quedó ${segun(O, 'bloqueada', 'bloqueado')}</b>`, sub: 'No te ve, no puede escribirte ni llamarte, y el motor no los vuelve a cruzar nunca.' }, { ico: '👀', txt: '<b>Una persona del equipo lo va a leer</b>', sub: 'No una máquina. Con lo que escribiste y lo último que se dijo en esa charla.' }, { ico: '🤫', txt: `<b>${segun(O, 'Ella', 'Él')} no sabe que fue un reporte</b>`, sub: 'Solo vio «Se cerró la puerta», igual que si hubieras cerrado sin más.' }]),
          aviso('🚨', '<b>Si corres peligro ahora mismo, llama al 911.</b> Esto no lo sustituye.', 'sol'),
        ],
        boton: { txt: 'Ver mis candados', url: tablero(env, 'ella'), sub: 'Todo lo que tú decides, en un solo lugar' }, nota: 'Te escribimos de nuevo cuando alguien lo haya leído.' } }),
    discreta: (env) => ({ asunto: 'Recibimos lo que nos mandaste', contenido: { tono: 'sereno', figura: { tipo: 'emoji', v: '💌' }, firma: 'equipo', eyebrow: 'Cupido', titulo: 'Recibimos lo que nos mandaste.', sub: 'Una persona del equipo lo va a leer.', vista: 'Los detalles están en tu tablero.', cuerpo: [p('Los detalles están en tu tablero. Este correo no dice más porque tienes encendidos los correos discretos.')], boton: { txt: 'Abrir mi tablero', url: tablero(env, 'ella') } } }) },
  reporte_atendido: { cat: 'cuidado', cuando: 'Cuando una persona del equipo lee un reporte (y, si es el caso, cuando la cuenta reportada se retira).', muestra: () => ({ retirada: true }),
    arma: (env, { P, retirada }) => ({ asunto: 'Una persona ya leyó tu reporte',
      contenido: { tono: 'calma', figura: { tipo: 'emoji', v: retirada ? '✅' : '🛡️' }, firma: 'equipo', eyebrow: 'Seguridad', titulo: 'Una persona del equipo ya leyó tu reporte.', sub: retirada ? 'Esa cuenta ya no está en Cupido.' : 'Completo, y con calma.', vista: retirada ? 'Esa cuenta ya no está en Cupido.' : 'Sigue sin poder verte ni escribirte.',
        cuerpo: [
          p(`${hola(P)} Ya lo leímos, completo.`),
          retirada ? aviso('✅', '<b>Esa cuenta ya no está en Cupido</b>, y su correo no puede volver a entrar. Gracias: lo que dijiste también cuida a las que vienen después.', 'calma')
            : aviso('🛡️', '<b>Para ti nada cambia:</b> esa persona sigue sin poder verte, escribirte ni llamarte, y el motor no los vuelve a cruzar. Tu reporte queda guardado y cuenta si alguien más reporta lo mismo.', 'calma'),
          p('Tu búsqueda sigue igual que antes. Cuando alguien cruce el 90 % contigo, te escribimos.'),
        ],
        boton: { txt: 'Ir a mi tablero', url: tablero(env) } } }),
    discreta: (env) => ({ asunto: 'Ya revisamos lo que nos mandaste', contenido: { tono: 'sereno', figura: { tipo: 'emoji', v: '💌' }, firma: 'equipo', eyebrow: 'Cupido', titulo: 'Ya revisamos lo que nos mandaste.', sub: 'Los detalles están en tu tablero.', vista: 'Los detalles están en tu tablero.', cuerpo: [p('Este correo no dice más porque tienes encendidos los correos discretos.')], boton: { txt: 'Abrir mi tablero', url: tablero(env) } } }) },
  invitado: { cat: 'cuenta', reenvio: true, cuando: 'Cuando alguien crea su cuenta con la liga de invitación de la persona.', muestra: () => ({ total: 3, codigo: 'k7m2p' }),
    prepara: async (env, P) => ({ codigo: P.codigo || await codigoDe(env, P) }),
    arma: (env, { P, total, codigo }) => ({ asunto: total > 1 ? `Ya van ${total} personas que llegan a Cupido por ti` : 'Alguien entró a Cupido por tu invitación',
      contenido: { tono: 'amor', figura: { tipo: 'numero', v: total, pie: total === 1 ? 'persona llegó por ti' : 'personas han llegado por ti' }, eyebrow: 'Gracias', titulo: 'Alguien entró por tu invitación.', sub: 'Cada persona seria que entra sube las probabilidades de todos.', vista: 'Cada persona seria que entra sube las probabilidades de todos, también las tuyas.',
        cuerpo: [
          p(`${hola(P)} Alguien abrió su cuenta con tu liga. ${total > 1 ? `Ya van <b>${total}</b> personas que llegan por ti.` : 'Es la primera persona que llega por ti.'} Gracias, de verdad.`),
          p('No te da ninguna ventaja en el algoritmo, y así debe ser. Te da algo mejor: más personas serias, más cruces, más posibilidades de que alguien cruce el 90 % contigo.'),
          ...(codigo ? [ficha('Tu liga para compartir', [['Es tuya', `<a href="${BASE(env)}/i/${esc(codigo)}" style="color:#b23349">${BASE(env).replace(/^https?:\/\//, '')}/i/${esc(codigo)}</a>`]])] : []),
        ],
        boton: { txt: 'Compartir mi liga otra vez', url: tablero(env, 'apoyar'), sub: 'Mándasela a alguien que busque en serio' } } }) },
  gracias: { cat: 'cuenta', reenvio: true, cuando: 'Al confirmar un aporte al Fondo de atracción o al hacerse Socio fundador.', muestra: () => ({ tipo: 'fondo', monto: 200 }),
    arma: (env, { P, tipo, monto }) => {
      const socio = tipo === 'socio';
      return { asunto: socio ? 'Gracias por ser Socio fundador de Cupido' : 'Gracias por tu aporte al Fondo de atracción',
        contenido: { tono: 'calma', figura: { tipo: 'emoji', v: '💝' }, eyebrow: 'Gracias', titulo: socio ? 'Eres Socio fundador de Cupido.' : 'Tu aporte ya está en el Fondo de atracción.', sub: 'Cada peso se usa para traer a la siguiente persona seria.', vista: 'Cada peso se usa para traer a la siguiente persona seria.',
          cuerpo: [
            p(`${hola(P)} Gracias. Cupido no tiene anuncios ni los va a tener, así que crece con gente como tú.`),
            ficha('Tu apoyo', [['Qué', socio ? 'Socio fundador' : 'Fondo de atracción'], ['Cuánto', `$${esc(monto)} MXN${socio ? ' al mes' : ''}`], ['A dónde va', 'Íntegro, a traer más personas serias'], ['Cuentas claras', 'Cada año publicamos en qué se gastó']]),
            p('No te da ninguna ventaja en el algoritmo, y así debe ser. Te da algo mejor: una comunidad más grande, más cruces y más coincidencias arriba del 90 %, también para ti.'),
          ],
          boton: { txt: 'Ver el programa', url: tablero(env, 'apoyar') },
          nota: `${socio ? 'Puedes cancelar cuando quieras desde tu tablero, sin preguntas. ' : ''}Devoluciones sin preguntas durante 15 días escribiendo a contacto@ingenieriadigital.mx.` } };
    } },
  revision: { cat: 'cuenta', cuando: 'Cada seis meses: ¿sigue igual tu ciudad, tu trabajo, tu situación?', muestra: () => ({}),
    arma: (env, { P }) => ({ asunto: '¿Sigue igual tu situación? Un minuto, cada seis meses',
      contenido: { tono: 'sol', figura: { tipo: 'emoji', v: '🗓️' }, eyebrow: 'Revisión de cada seis meses', titulo: '¿Sigue todo igual?', sub: 'Un minuto. Si nada cambió, solo confirmas.', vista: 'Ciudad, trabajo, hijos, tu situación: lo que sí cambia en seis meses.',
        cuerpo: [
          p(`${hola(P)} Tus 43 respuestas se quedan como están. Cada seis meses te preguntamos solo lo que sí cambia, para que el motor te siga leyendo bien:`),
          lista([{ ico: '📍', txt: '<b>Tu ciudad</b>', sub: 'Si te mudaste, cambian tus cruces.' }, { ico: '💼', txt: '<b>Tu trabajo y tu situación</b>', sub: 'Con eso tu precio justo se acomoda a ti.' }, { ico: '🏡', txt: '<b>Si quieres hijos</b>', sub: 'Es de lo que más pesa al cruzar.' }]),
          aviso('🤍', '<b>Si te quedaste sin trabajo, dilo ahí:</b> Cupido se vuelve gratis en ese instante y sin preguntas.', 'calma'),
        ],
        boton: { txt: 'Revisar en un minuto', url: tablero(env, 'apoyar') } } }) },
  espacio: { cat: 'cuenta', cuando: 'Cuando lo que la persona ha subido pasa del 80 % de su espacio incluido.', muestra: () => ({ usado: '4.2 GB', tope: '5.0 GB', pct: 84 }),
    arma: (env, { P, usado, tope, pct }) => ({ asunto: `Tu espacio en Cupido va en ${pct} %`,
      contenido: { tono: 'sol', figura: { tipo: 'barra', pct, pie: 'de tu espacio' }, eyebrow: 'Tu espacio', titulo: `Llevas ${esc(usado)} de ${esc(tope)}.`, sub: 'Te avisamos antes de que se llene.', vista: 'Todo lo tuyo se guarda sin comprimir. Te avisamos antes de que se llene.',
        cuerpo: [
          p(`${hola(P)} Tus fotos, audios y videos se guardan en la calidad en que los subes, y eso ocupa.`),
          lista([{ ico: '🗂️', txt: '<b>Si se llena, nada se borra</b>', sub: 'Solo no podrás subir más hasta quitar algo que ya no uses.' }, { ico: '🧹', txt: '<b>Tú eliges qué quitar</b>', sub: 'En tu tablero ves cuánto ocupa cada cosa.' }]),
        ],
        boton: { txt: 'Ver mi espacio', url: tablero(env, 'medios') } } }) },
  prueba: { cat: 'acceso', reenvio: true, cuando: 'Cuando la persona toca «Mándame un correo de prueba» en su tablero.', muestra: () => ({}),
    arma: (env, { P }) => ({ asunto: 'Sí llegó: así se ven los correos de Cupido',
      contenido: { tono: 'noche', figura: { tipo: 'emoji', v: '📬' }, eyebrow: 'Correo de prueba', titulo: 'Sí llegó.', sub: 'Así te vamos a escribir.', vista: 'Tu correo funciona y Cupido te encuentra.',
        cuerpo: [
          p(`${hola(P)} Este es un correo de prueba: llegó bien, así que no te vas a perder nada.`),
          p('Aquí somos chismógrafos: <b>de inicio te contamos todo.</b> Lo que no quieras saber lo apagas tú, por tema, y cada correo trae su propio «ya no quiero estos».'),
          sec('De esto te contamos'),
          chips(CATEGORIAS.filter((c) => !c.fijo).map((c) => `${c.i}&nbsp; ${esc(c.n)}`)),
        ],
        boton: { txt: 'Elegir qué correos recibo', url: tablero(env, 'correos') }, nota: 'Si alguno cae en spam, márcalo como «no es spam» y agrega cupido@capitaltorreon.com a tus contactos.' } }) },
};

// Arma un correo para una persona: busca lo que hace falta para personalizarlo, elige la versión discreta si la pidió y le pone su pie
export async function armar(env, P, tipo, datos = {}) {
  const def = CORREOS[tipo]; if (!def) throw new Error('No existe ese correo: ' + tipo);
  const cat = datos.cat && CATEGORIA[datos.cat] ? datos.cat : def.cat, C = CATEGORIA[cat];
  const callado = !!P && discreto(P) && !C.fijo;
  let extra = {};
  if (def.prepara && P?.id && !callado) { try { extra = (await def.prepara(env, P, datos)) || {}; } catch (e) { console.error('prepara', tipo, e.message); } }
  const c = callado ? (def.discreta ? def.discreta(env, { P, ...datos }) : DISCRETO(env)) : def.arma(env, { P, ...extra, ...datos });
  return { ...c, contenido: await vestir(env, c.contenido, { P, def, C, cat, callado }), cat };
}
// Lo que todo correo lleva además de lo suyo: la categoría arriba, por qué llegó, cómo apagarlo y, si se presta a reenviarse, la invitación
async function vestir(env, contenido, { P, def, C, cat, callado, token = null }) {
  const c = { ...contenido };
  if (!callado) c.etiqueta = `${C.i}&nbsp; ${esc(C.n)}`;
  if (!C.fijo) c.baja = { n: C.n, url: `${BASE(env)}/correo/baja?t=${token || (P?.id ? await tokenBaja(env, P) : 'muestra')}&c=${cat}`, todas: tablero(env, 'correos') };
  else c.pieCuenta = c.pieCuenta || (P ? `Este correo es de tu cuenta y llega siempre. <a href="${tablero(env, 'correos')}" style="color:#6b6672">Elegir qué correos recibo</a>` : 'Te llegó porque alguien pidió entrar a Cupido con este correo.');
  if (def.reenvio && !callado) { let cod = null; try { cod = P?.id ? (P.codigo || await codigoDe(env, P)) : null; } catch { /* sin código: va al inicio */ } c.reenvio = { url: cod ? `${BASE(env)}/i/${cod}` : BASE(env) }; }
  return c;
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
  const pag = (titulo, cuerpo, status = 200) => new Response(`<!doctype html><html lang="es"><head><meta charset="utf-8"><meta name="viewport" content="width=device-width,initial-scale=1"><meta name="robots" content="noindex"><title>${esc(titulo)} · Cupido Algorítmico</title><link rel="icon" href="/favicon.svg" type="image/svg+xml"><link rel="manifest" href="/manifest.webmanifest"><meta name="theme-color" content="#faf7f4"><link rel="apple-touch-icon" href="/app/icono-180.png"><link rel="stylesheet" href="/css/cupido.css"></head><body data-author="RLR"><header class="barra"><div class="envoltura barra-in"><a class="marca" href="/"><span class="corazon">💘</span><b>Cupido Algorítmico</b></a></div></header><main class="envoltura entrar"><section class="tarjeta" style="max-width:560px;margin:40px auto"><p class="eyebrow">Mis correos</p><h1 style="font-size:30px;margin:0 0 10px">${titulo}</h1>${cuerpo}</section></main></body></html>`, { status, headers: { 'content-type': 'text/html; charset=utf-8', 'cache-control': 'no-store' } });
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
    if (salio(await correoA(env, P, 'novedades', { O: { id: O.id, nombre: O.nombre, genero: O.genero, color: O.color }, filas, cat }, { clave: g.otra, forzar: true }))) enviados++;
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
    const x = porPersona.get(yo) || { P, n: 0, pct: 0, dias: 0, lista: [] }; x.n++; x.pct = Math.max(x.pct, pu.pct); x.dias = Math.max(x.dias, dias); x.lista.push({ pct: pu.pct, dias }); porPersona.set(yo, x);
  }
  for (const x of porPersona.values()) if (salio(await correoA(env, x.P, 'pendiente', { n: x.n, pct: x.pct, dias: x.dias, lista: x.lista.sort((p1, p2) => p2.pct - p1.pct) }, { cadaMinutos: 60 * 24 * 14 }))) hechos.pendientes++;
  // 2 · planes de mañana (hora del centro de México)
  const manana = new Date(Date.now() - 6 * 3600000 + 86400000).toISOString().slice(0, 10);
  const citas = (await env.DB.prepare(`SELECT m.id, m.a, m.b, m.de, m.archivo FROM mensajes m JOIN charlas c ON c.a = m.a AND c.b = m.b WHERE m.tipo = 'cita' AND c.cerrada IS NULL AND json_extract(m.archivo, '$.cuando') LIKE ? AND EXISTS (SELECT 1 FROM respuestas r WHERE r.mensaje = m.id AND r.valor = 'si')`).bind(manana + '%').all()).results;
  for (const m of citas) {
    const A = JSON.parse(m.archivo || '{}');
    const hora = (() => { try { return new Date(A.cuando + ':00Z').toLocaleTimeString('es-MX', { hour: 'numeric', minute: '2-digit', timeZone: 'UTC' }); } catch { return ''; } })();
    for (const [yo, otra] of [[m.a, m.b], [m.b, m.a]]) {
      const [P, O] = [await persona(env, yo), await persona(env, otra)];
      if (P?.correo && O && salio(await correoA(env, P, 'cita_manana', { O: { id: O.id, nombre: O.nombre, genero: O.genero, color: O.color }, que: A.que, donde: A.donde || '', hora, fecha: manana }, { clave: `cita${m.id}`, cadaMinutos: 60 * 24 * 30 }))) hechos.citas++;
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
    sinLeer: (v.charlas || []).reduce((s, c) => s + c.nuevos, 0), masCerca: v.masCerca || 0, pool: v.pool.delOtroLado, nuevas: Math.min(nuevas, v.pool.delOtroLado), invitados: v.invitacion?.invitados || 0, pausada: P.estado === 'pausada', sinFoto: !v.misMedios?.foto };
}


/* ── para el admin: el catálogo, la vista previa, la revisión y la serie de muestra ── */
const personaDeMuestra = (genero, para = 'muestra@cupido.test') => ({ id: null, nombre: genero === 'mujer' ? 'Sofía Rangel' : genero === 'hombre' ? 'Andrés Luna' : 'Alex Mora', genero: genero === 'otro' ? 'nobinaria' : genero, color: genero === 'mujer' ? '#be185d' : genero === 'hombre' ? '#1d4ed8' : '#2f8f83', correo: para, ajustes: '{}' });
// Un correo de ejemplo, completo: con sus datos de muestra y vestido igual que uno de verdad
async function deMuestra(env, tipo, genero = 'mujer', esDiscreto = false, datos = null) {
  const def = CORREOS[tipo]; if (!def) return null;
  const P = personaDeMuestra(genero), C = CATEGORIA[def.cat], callado = esDiscreto && !C.fijo, d = { P, ...def.muestra(P), ...(datos || {}) };
  const c = callado ? (def.discreta ? def.discreta(env, d) : DISCRETO(env)) : def.arma(env, d);
  return { asunto: c.asunto, contenido: await vestir(env, c.contenido, { P, def, C, cat: def.cat, callado, token: 'muestra' }) };
}
export async function catalogoCorreos(env) {
  const r = [];
  for (const [tipo, d] of Object.entries(CORREOS)) {
    const m = await deMuestra(env, tipo, 'mujer'), { peso } = plantilla(env, m.contenido);
    r.push({ tipo, cat: d.cat, categoria: CATEGORIA[d.cat].n, cuando: d.cuando, fijo: !!CATEGORIA[d.cat].fijo, discreta: !!d.discreta, tono: m.contenido.tono, tonoNombre: TONOS[m.contenido.tono]?.n || '', boton: m.contenido.boton?.txt || '', kb: Math.round(peso / 102.4) / 10 });
  }
  return r;
}
export async function vistaPrevia(env, tipo, genero = 'mujer', esDiscreto = false) {
  const m = await deMuestra(env, tipo, genero, esDiscreto); if (!m) return null;
  return { asunto: m.asunto, ...plantilla(env, m.contenido) };
}
// La revisión: cada correo, como lo lee ella, él y alguien sin género, en su versión normal y en la discreta,
// más el caso más cargado que puede darse. Dice cuánto pesa cada uno y qué le falta. Si la lista de faltas sale vacía, todo pasa.
export async function revisarCorreos(env) {
  const lleno = { filas: Array.from({ length: 14 }, (_, k) => ({ cat: k % 3 ? 'charla' : 'chispa', ico: '💬', v: 'te escribió', d: 'Un mensaje largo, de los que se escriben cuando hay mucho que contar y nadie tiene prisa. '.repeat(4) })) };
  const casos = [];
  for (const tipo of Object.keys(CORREOS)) {
    const C = CATEGORIA[CORREOS[tipo].cat];
    for (const genero of ['mujer', 'hombre', 'otro']) for (const d of (C.fijo ? [false] : [false, true])) casos.push({ tipo, genero, discreto: d });
  }
  casos.push({ tipo: 'novedades', genero: 'mujer', discreto: false, datos: lleno, nota: 'el más cargado' });
  casos.push({ tipo: 'semana', genero: 'hombre', discreto: false, datos: { r: { coincidencias: 0, esperan: 0, abiertas: 0, sinLeer: 0, masCerca: 0, pool: 0, nuevas: 0, invitados: 0, pausada: false, sinFoto: true } }, nota: 'semana en silencio' });
  casos.push({ tipo: 'enlace', genero: 'otro', discreto: false, datos: { espera: null }, nota: 'sin nada adentro' });
  casos.push({ tipo: 'recordatorio', genero: 'mujer', discreto: false, datos: { faltan: 43, pct: 0 }, nota: 'sin empezar' });
  casos.push({ tipo: 'matching', genero: 'mujer', discreto: false, datos: { nuevas: 2, tengo: { foto: true, voz: true, video: true } }, nota: 'con coincidencias' });
  casos.push({ tipo: 'pendiente', genero: 'hombre', discreto: false, datos: { n: 1, pct: 93, dias: 3, lista: [{ pct: 93, dias: 3 }] }, nota: 'una sola' });
  casos.push({ tipo: 'gracias', genero: 'mujer', discreto: false, datos: { tipo: 'socio', monto: 99 }, nota: 'socio fundador' });
  casos.push({ tipo: 'reporte_atendido', genero: 'mujer', discreto: false, datos: { retirada: false }, nota: 'sin retiro' });
  const lista = [];
  for (const k of casos) {
    try {
      const m = await deMuestra(env, k.tipo, k.genero, k.discreto, k.datos), r = plantilla(env, m.contenido);
      lista.push({ tipo: k.tipo, genero: k.genero, discreto: k.discreto, nota: k.nota || '', asunto: m.asunto, kb: Math.round(r.peso / 102.4) / 10, boton: m.contenido.boton?.txt || '', faltas: revisar({ asunto: m.asunto, ...r }, m.contenido) });
    } catch (e) { lista.push({ tipo: k.tipo, genero: k.genero, discreto: k.discreto, nota: k.nota || '', asunto: '', kb: 0, boton: '', faltas: ['no se pudo armar: ' + e.message] }); }
  }
  const pesado = lista.reduce((x, y) => (y.kb > x.kb ? y : x), lista[0]);
  return { revisados: lista.length, conFaltas: lista.filter((x) => x.faltas.length).length, masPesado: { tipo: pesado.tipo, kb: pesado.kb }, topeKb: TOPE_CORREO / 1024, limiteGmailKb: LIMITE_GMAIL / 1024, lista };
}
// La serie completa a un correo, como la recibiría una mujer o un hombre
export async function mandarMuestra(env, para, genero = 'mujer') {
  const r = [];
  for (const tipo of Object.keys(CORREOS)) {
    const m = await deMuestra(env, tipo, genero);
    r.push({ tipo, id: await mandar(env, { persona: null, para, tipo: 'muestra', asunto: `[Muestra] ${m.asunto}`, contenido: m.contenido }) });
    await new Promise((x) => setTimeout(x, 550));
  }
  return r;
}
// fin · RLR
