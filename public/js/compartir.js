/* ─────────────────────────────────────────────────────────────────────────────
   Cupido Algorítmico · Compartir
   Autor: Ricardo López Reyero · RLR

   Todo lo que alguien necesita para hablar de Cupido, en un solo lugar y a un
   toque: su liga, la galería de frases en la medida de cada red, los textos
   para acompañarlas, los mensajes de WhatsApp, el código para páginas y la
   marca. Entre más se comparte, más fácil que cada quien encuentre a su persona.

   La misma sección se monta en el tablero (#compartir, con la liga personal de
   quien entró) y en la página pública /compartir (con la liga de la casa).
   Las piezas no son archivos: las pinta public/js/piezas.js en el momento.
   ───────────────────────────────────────────────────────────────────────────── */
import { $, $$, esc, avisar } from '/js/ui.js';
import * as P from '/js/piezas.js';
const _RLR = 'Ricardo López Reyero', _k = 'EYE', _rev = 181218;

const VERSION_KIT = 'v1';
const LLAVE = 'cupido.compartir';   // el formato y el fondo que cada quien dejó elegidos (solo en este equipo)
const ETIQUETAS = '#CupidoAlgorítmico #BuscarPareja #ParejaIdeal #AmorEnSerio #NoEsUnaAppDeCitas #SinAnuncios';

/* ── los textos para acompañar: {liga} y {etiquetas} se llenan solos ─────── */
const TEXTOS = [
  { id: 'instagram', n: 'Instagram', nota: 'En Instagram la liga del pie de foto no se puede tocar. Ponla en tu perfil, o en la historia con la calcomanía «Enlace».', lista: [
    { t: 'Qué es', x: 'No es una app de citas. 💘\n\nRespondes 43 preguntas una sola vez. Si alguien cruza el 90 % contigo, les avisan a los dos. Y la puerta solo se abre si los dos dicen que sí.\n\nSin perfiles que mirar. Sin deslizar. Sin anuncios. Gratis en 2026 y 2027.\n\n{liga}\n\n{etiquetas}' },
    { t: 'Aquí manda ella', x: 'Aquí manda ella. 👑\n\nNadie ve tu perfil. Nadie te escribe sin tu sí. Tu foto la enseñas tú, cuando quieras. Y si bloqueas, queda bloqueado: al instante y sin dar explicaciones.\n\nSe llama Cupido Algorítmico. Es gratis y no tiene anuncios.\n\n{liga}\n\n{etiquetas}' },
    { t: 'Para él', x: 'Aquí no gana la mejor foto: gana la verdad.\n\n43 preguntas, una sola vez. El motor cruza lo que tú necesitas con lo que la otra persona da, y al revés. Si embonan arriba del 90 %, les avisa a los dos.\n\nUna regla: ahí manda ella. Por eso ahí sí contestan en serio.\n\n{liga}\n\n{etiquetas}' },
    { t: 'Para invitar', x: 'Si conoces a alguien que busca pareja en serio, pásale esto.\n\nEntre más gente seria entra, más fácil que cada quien encuentre a su persona. Compartirlo no cuesta nada.\n\n{liga}\n\n{etiquetas}' },
    { t: 'Tu biografía', x: '💘 No es una app de citas\n43 preguntas · solo avisa arriba del 90 %\nGratis y sin anuncios 👇\n{liga}' },
  ] },
  { id: 'tiktok', n: 'TikTok', nota: 'TikTok acepta fotos y video. Sube la pieza en formato Historia (9:16) y pon la liga en tu perfil.', lista: [
    { t: 'Qué es', x: 'No es una app de citas. 43 preguntas, una sola vez, y solo te avisa si alguien cruza el 90 % contigo 💘 Gratis y sin anuncios. La liga está en mi perfil. {etiquetas}' },
    { t: 'Aquí manda ella', x: 'Aquí manda ella: nadie te ve y nadie te escribe sin tu sí 👑 La liga está en mi perfil. {etiquetas}' },
    { t: 'Para invitar', x: 'Mándaselo a tu amiga, la que ya se cansó de las apps. La liga está en mi perfil. {etiquetas}' },
    { t: 'Tu biografía', x: '💘 No es una app de citas · gratis y sin anuncios 👇\n{liga}' },
  ] },
  { id: 'youtube', n: 'YouTube', nota: 'En YouTube la liga de la descripción sí se puede tocar: ponla en el primer renglón.', lista: [
    { t: 'Título', x: 'No es una app de citas: así funciona Cupido Algorítmico' },
    { t: 'Otro título', x: 'Aquí manda ella: la regla que cambia cómo se busca pareja' },
    { t: 'Descripción', x: 'Conócelo aquí: {liga}\n\nCupido Algorítmico no es una app de citas. Respondes 43 preguntas una sola vez; si alguien cruza el 90 % contigo, les avisa a los dos, y la puerta solo se abre si los dos dicen que sí.\n\n· Sin perfiles que mirar ni fotos que deslizar\n· Aquí manda ella: si bloquea, queda bloqueado\n· Sin publicidad, nunca\n· Gratis en 2026 y 2027\n\nCómo funciona, en 2 minutos: https://cupido.capitaltorreon.com/bienvenida\nLa regla completa: https://cupido.capitaltorreon.com/ella\n\n{etiquetas}' },
    { t: 'Comentario fijado', x: 'La liga: {liga} 💘 Es gratis y no tiene anuncios.' },
  ] },
  { id: 'facebook', n: 'Facebook', nota: 'En Facebook pega la liga y espera un segundo: la vista previa con la imagen sale sola.', lista: [
    { t: 'Qué es', x: 'Les comparto algo distinto para quien esté buscando pareja en serio, o conozca a alguien que sí.\n\nSe llama Cupido Algorítmico y no es una app de citas: respondes 43 preguntas una sola vez y solo te avisa cuando alguien cruza el 90 % contigo. Sin perfiles, sin deslizar y sin anuncios. Es gratis.\n\n{liga}' },
    { t: 'Aquí manda ella', x: 'Aquí manda ella.\n\nEn Cupido Algorítmico nadie ve tu perfil, nadie te escribe sin tu sí y tu foto la enseñas tú cuando quieras. Si bloqueas, queda bloqueado. Los hombres son bienvenidos, y entran aceptando esa regla.\n\nEs gratis y no tiene anuncios.\n\n{liga}' },
    { t: 'Para invitar', x: 'Yo ya no estoy buscando, pero si tú sí, o alguien que quieres sí, mira esto. Entre más gente seria entra, más fácil que cada quien encuentre a su persona.\n\n{liga}' },
  ] },
  { id: 'x', n: 'X', nota: 'Caben en una sola publicación.', lista: [
    { t: 'Qué es', x: 'No es una app de citas. 43 preguntas, una sola vez. Si alguien cruza el 90 % contigo, les avisa a los dos. Sin perfiles, sin deslizar, sin anuncios. Gratis.\n{liga}' },
    { t: 'Aquí manda ella', x: 'Aquí manda ella: nadie te ve, nadie te escribe sin tu sí y, si bloquea, queda bloqueado.\n{liga}' },
    { t: 'Sin publicidad', x: 'Quien busca pareja no debería ser el producto de nadie. Por eso aquí no hay publicidad. Ni una. Ni la habrá.\n{liga}' },
  ] },
];
// quien = el nombre que sale arriba del chat (en vez del de un contacto) · sub = el renglón chico de debajo · foto = persona, grupo o estado
const WHATSAPP = [
  { id: 'amiga', quien: 'Para una amiga', sub: 'en línea', foto: 'persona', x: 'Amiga, mira esto. No es una app de citas: contestas 43 preguntas una sola vez y solo te avisa si alguien cruza el 90 % contigo. Nadie ve tu perfil, nadie te escribe sin tu sí y tu foto la enseñas tú cuando quieras. Es gratis y no tiene anuncios.\n{liga}' },
  { id: 'amigo', quien: 'Para un amigo', sub: 'en línea', foto: 'persona', x: 'Te paso esto. No es una app de citas: contestas 43 preguntas una sola vez y el sistema solo te avisa si alguien cruza el 90 % contigo. Aquí no gana la mejor foto, gana embonar. Una regla: ahí manda ella. Es gratis y no tiene anuncios.\n{liga}' },
  { id: 'grupo', quien: 'Para un grupo', sub: 'tus amigas, tus primos, tú', foto: 'grupo', x: 'Les comparto algo distinto para quien esté buscando pareja en serio, o conozca a alguien que sí. Se llama Cupido Algorítmico: 43 preguntas una sola vez, y solo avisa cuando dos personas cruzan el 90 %. Sin perfiles, sin deslizar y sin anuncios. Es gratis. Entre más gente seria entre, más fácil que cada quien encuentre a su persona.\n{liga}' },
  { id: 'pareja', quien: 'Para alguien que quieres', sub: 'si tú ya tienes pareja', foto: 'persona', x: 'Yo ya no estoy buscando, pero me acordé de ti. Esto no es una app de citas: son 43 preguntas una sola vez y solo te avisa si alguien cruza el 90 % contigo. Es gratis y no tiene anuncios. Dale una vuelta:\n{liga}' },
  { id: 'estado', quien: 'Para tu estado', sub: 'lo ven tus contactos por 24 horas', foto: 'estado', x: 'No es una app de citas 💘\n{liga}' },
];
const REDES = [
  ['Instagram', 'Publicación', 'retrato'], ['Instagram', 'Reel', 'video'], ['Instagram', 'Historia y portada de Reel', 'historia'], ['Instagram', 'Carrusel o cuadrícula', 'cuadrado'],
  ['Facebook', 'Publicación', 'retrato'], ['Facebook', 'Publicación con liga', 'liga'], ['Facebook', 'Portada de la página', 'portada-facebook'],
  ['TikTok', 'Video corto', 'video'], ['TikTok', 'Foto o portada', 'historia'],
  ['YouTube', 'Miniatura y pantalla final', 'horizontal'], ['YouTube', 'Shorts', 'video'], ['YouTube', 'Banner del canal', 'banner-youtube'],
  ['WhatsApp', 'Estado', 'historia'], ['WhatsApp', 'Mensaje o grupo', 'cuadrado'], ['WhatsApp', 'Foto del grupo', 'perfil'],
  ['X · LinkedIn', 'Publicación', 'liga'], ['X · LinkedIn', 'Encabezado', 'encabezado-x'],
  ['Todas', 'Foto de perfil', 'perfil'],
];
const COLORES = [
  { n: 'Negro', h: '#111111', u: 'El texto. Siempre.' }, { n: 'Blanco', h: '#ffffff', u: 'El fondo de la casa.' }, { n: 'Rosa Cupido', h: '#d6455f', u: 'El corazón. El único color.' },
  { n: 'Gris', h: '#5a5a5a', u: 'La letra chica.' }, { n: 'Crema', h: '#faf7f4', u: 'El fondo de la plataforma.' },
];

/* ── utilidades ──────────────────────────────────────────────────────────── */
const bajar = (blob, nombre) => { const a = document.createElement('a'); a.href = URL.createObjectURL(blob); a.download = nombre; document.body.appendChild(a); a.click(); a.remove(); setTimeout(() => URL.revokeObjectURL(a.href), 8000); };
// Un respiro entre tandas para que la pantalla siga respondiendo. Con un canal y no con setTimeout: así no se frena si la pestaña queda atrás.
const respiro = () => new Promise((ok) => { const c = new MessageChannel(); c.port1.onmessage = () => ok(); c.port2.postMessage(0); });
// Los dibujos del chat (las siluetas, las palomitas y la flecha de mandar), hechos aquí
const WA_FOTO = {
  persona: '<svg viewBox="0 0 40 40" aria-hidden="true"><circle cx="20" cy="20" r="20" fill="#dfe5e7"/><circle cx="20" cy="15.5" r="6.6" fill="#fff"/><path d="M6.5 34.5C7.9 27.5 13.3 23.9 20 23.9s12.1 3.6 13.5 10.6A19.9 19.9 0 0 1 20 40a19.9 19.9 0 0 1-13.5-5.5z" fill="#fff"/></svg>',
  grupo: '<svg viewBox="0 0 40 40" aria-hidden="true"><circle cx="20" cy="20" r="20" fill="#dfe5e7"/><circle cx="14.5" cy="16" r="4.8" fill="#fff"/><circle cx="26.5" cy="16.5" r="4.2" fill="#fff"/><path d="M5.5 30c.9-5 4.300-7.600 9-7.600s8.100 2.600 9 7.600v2.500h-18z" fill="#fff"/><path d="M25.500 32.500V30c-.2-2.300-1-4.200-2.300-5.700 1-.5 2.100-.7 3.300-.7 4.200 0 7.300 2.300 8.100 6.900v2z" fill="#fff"/></svg>',
  estado: '<svg viewBox="0 0 40 40" aria-hidden="true"><circle cx="20" cy="20" r="18.5" fill="none" stroke="#25d366" stroke-width="2.6" stroke-dasharray="26 3.1"/><circle cx="20" cy="20" r="14.5" fill="#dfe5e7"/><circle cx="20" cy="17" r="4.8" fill="#fff"/><path d="M10.500 30.500c1.100-5 4.900-7.400 9.500-7.400s8.400 2.400 9.500 7.400a14.400 14.400 0 0 1-19 0z" fill="#fff"/></svg>',
};
const WA_PALOMITAS = '<svg viewBox="0 0 16 11" width="16" height="11" aria-label="Leído"><path d="M11.07.65a.46.46 0 0 0-.65.08L4.9 7.8 2.37 5.4a.46.46 0 0 0-.65.02l-.3.32a.46.46 0 0 0 .02.65l3.2 3.05c.2.19.5.17.67-.05l6.1-7.8a.46.46 0 0 0-.08-.65zM15.1.65a.46.46 0 0 0-.65.08L8.93 7.8l-.7-.67-.6.77 1.02.98c.2.19.5.17.67-.05l6.1-7.8a.46.46 0 0 0-.08-.65z" fill="#53bdeb"/></svg>';
const WA_MANDAR = '<svg viewBox="0 0 24 24" width="18" height="18" aria-hidden="true"><path d="M3.400 20.400l17.500-7.500a1 1 0 0 0 0-1.800L3.400 3.600a1 1 0 0 0-1.400 1.200L4 11l9 1-9 1-2 6.200a1 1 0 0 0 1.400 1.200z" fill="currentColor"/></svg>';
const ICONO_BOTON = (punto) => `<svg width="20" height="20" viewBox="14 16 36 36" aria-hidden="true"><path d="M32 50s-16-9.6-16-21.3C16 22.7 20.3 18 25.9 18c2.7 0 5 1.2 6.1 3.2C33.1 19.2 35.4 18 38.1 18 43.7 18 48 22.7 48 28.7 48 40.4 32 50 32 50z" fill="${punto[0]}"/><circle cx="32" cy="30" r="3.2" fill="${punto[1]}"/></svg>`;
const BOTONES = {
  // un solo color manda en las cuatro piezas: el botón, la insignia, la tarjeta y la imagen
  negro: { n: 'Negro', css: 'background:#111;color:#fff', ico: ['#d6455f', '#111'], insignia: 'oscura', imagen: 'liga-negro.png', orilla: '#0e0e0e' },
  blanco: { n: 'Blanco', css: 'background:#fff;color:#111;border:1.5px solid #111', ico: ['#d6455f', '#fff'], insignia: 'clara', imagen: 'liga.png', orilla: '#e6e6e6' },
  rosa: { n: 'Rosa', css: 'background:#d6455f;color:#fff', ico: ['#fff', '#d6455f'], insignia: 'rosa', imagen: 'liga-rosa.png', orilla: '#d6455f' },
};

export async function montarCompartir(raiz, op = {}) {
  const local = /^(localhost|127\.|\[::1\])/.test(location.hostname);
  const base = local ? location.origin : `https://${P.CASA}`;
  const codigo = op.codigo && /^[a-z0-9]{5,12}$/.test(op.codigo) ? op.codigo : '';
  const liga = codigo ? `${base}/i/${codigo}` : base;                    // adonde llevan los botones y los textos
  const leida = codigo ? `${P.CASA}/i/${codigo}` : P.CASA;               // lo que se lee en una pieza con «mi liga»
  const tocar = op.tocar || (() => {});
  const E = { modo: 'imagenes', serie: 'todas', formato: 'retrato', fondo: 'blanco', red: 'instagram', boton: 'negro' };
  try { const g = JSON.parse(localStorage.getItem(LLAVE) || '{}'); if (P.FORMATOS.some((f) => f.id === g.formato)) E.formato = g.formato; if (P.FONDO[g.fondo]) E.fondo = g.fondo; } catch {}
  const recordar = () => { try { localStorage.setItem(LLAVE, JSON.stringify({ formato: E.formato, fondo: E.fondo })); } catch {} };
  const llenar = (x) => x.replaceAll('{liga}', liga).replaceAll('{etiquetas}', ETIQUETAS);
  const copiar = async (txt, msj = 'Copiado') => {
    try { await navigator.clipboard.writeText(txt); } catch { const t = document.createElement('textarea'); t.value = txt; t.style.cssText = 'position:fixed;opacity:0'; document.body.appendChild(t); t.select(); try { document.execCommand('copy'); } catch {} t.remove(); }
    tocar('guardado'); avisar(msj);
  };
  const textoDe = (r) => { const R = P.completar(r), fuente = P.FRASE[r.frase]?.f; return `${R.g ? P.sinMarcas(R.g) + ' ' : ''}${P.sinMarcas((R.n ? R.n + ' ' : '') + R.t)}${R.e ? ' ' + R.e : ''}${fuente ? `\nFuente: ${fuente}` : ''}\n\nCupido Algorítmico: no es una app de citas. Gratis y sin anuncios.\n${liga}`; };

  /* ── el código para páginas ── */
  const codigos = () => {
    const B = BOTONES[E.boton], img = `${base}/img/compartir`;
    return {
      boton: `<a href="${liga}" target="_blank" rel="noopener" style="display:inline-flex;align-items:center;gap:10px;padding:13px 22px;border-radius:999px;${B.css};font:600 16px/1 system-ui,-apple-system,'Segoe UI',sans-serif;text-decoration:none">${ICONO_BOTON(B.ico)}Encuentra a tu pareja en Cupido</a>`,
      insignia: `<a href="${liga}" target="_blank" rel="noopener"><img src="${img}/insignia-${B.insignia}.png" width="292" height="72" alt="Encuentra a tu pareja en Cupido Algorítmico" style="border:0"></a>`,
      tarjeta: `<iframe src="${base}/incrustar?fondo=${E.boton}${codigo ? '&i=' + codigo : ''}" title="Cupido Algorítmico" loading="lazy" style="width:100%;max-width:380px;height:430px;border:0;border-radius:18px"></iframe>`,
      imagen: `<a href="${liga}" target="_blank" rel="noopener"><img src="${img}/${B.imagen}" width="600" height="315" alt="Cupido Algorítmico: no es una app de citas" style="max-width:100%;height:auto;border:1px solid ${B.orilla};border-radius:12px"></a>`,
    };
  };

  /* ── la sección ── */
  raiz.classList.add('cmp');
  raiz.innerHTML = `
    <section class="tarjeta cmp-liga">
      <div class="cmp-liga-cab"><div><h2>${codigo ? 'Tu liga' : 'La liga de Cupido'}</h2>
        <p class="sub">${codigo ? 'Es tuya: cuando alguien entra por ella y abre su cuenta, cuenta para ti. No da ninguna ventaja en el motor; solo sabrás a cuántas personas trajiste.' : op.demo ? 'En la cuenta demo se comparte la liga de la casa. Con tu propia cuenta tendrás una liga personal y verás cuántas personas llegaron por ti.' : 'Cualquiera puede compartirla. Si entras a tu tablero, aquí aparece tu liga personal y ves cuántas personas llegaron por ti.'}</p></div>
        ${codigo ? `<div class="cmp-cuenta"><b>${Number(op.invitados) || 0}</b><span>${Number(op.invitados) === 1 ? 'persona llegó' : 'personas llegaron'}<br>por tu liga</span></div>` : ''}</div>
      <div class="enlace-privado"><input id="cmp-liga" readonly value="${esc(liga)}" aria-label="La liga para compartir"><button class="boton boton-chico" data-a="copiar-liga">Copiar</button></div>
      <div class="acciones cmp-liga-acc">
        <a class="boton boton-claro boton-chico" target="_blank" rel="noopener" href="https://wa.me/?text=${encodeURIComponent(llenar(WHATSAPP[2].x))}">WhatsApp</a>
        <a class="boton boton-claro boton-chico" target="_blank" rel="noopener" href="https://www.facebook.com/sharer/sharer.php?u=${encodeURIComponent(liga)}">Facebook</a>
        <a class="boton boton-claro boton-chico" target="_blank" rel="noopener" href="https://twitter.com/intent/tweet?text=${encodeURIComponent(llenar(TEXTOS[4].lista[0].x))}">X</a>
        <a class="boton boton-claro boton-chico" target="_blank" rel="noopener" href="https://t.me/share/url?url=${encodeURIComponent(liga)}&text=${encodeURIComponent('No es una app de citas. 43 preguntas, una sola vez. Gratis y sin anuncios.')}">Telegram</a>
        <a class="boton boton-claro boton-chico" href="mailto:?subject=${encodeURIComponent('Mira esto: no es una app de citas')}&body=${encodeURIComponent(llenar(WHATSAPP[2].x))}">Correo</a>
        ${navigator.share ? '<button class="boton boton-claro boton-chico" data-a="compartir-liga">Más…</button>' : ''}
        <button class="boton boton-claro boton-chico" data-a="qr">Código QR</button>
      </div>
    </section>

    <nav class="cmp-indice" aria-label="Lo que hay en esta sección">
      ${[['galeria', '🖼 Galería'], ['textos', '✍️ Textos'], ['whatsapp', '💬 WhatsApp'], ['redes', '📐 Qué va en cada red'], ['codigo', '🧩 Código para tu página'], ['marca', '🎨 La marca'], ['todo', '⬇ Descargar todo']].map(([a, t]) => `<button data-a="ir" data-p="${a}">${t}</button>`).join('')}
    </nav>

    <section class="tarjeta" id="cmp-galeria">
      <div class="cmp-cab"><div><h2>Galería</h2><p class="sub">${P.FRASES.length} frases para publicar y ${P.VIDEOS.length} videos cortitos, listos para descargar. Texto negro, fondo blanco y el corazón de Cupido como único color.</p></div>
        <div class="acciones"><button class="boton boton-chico" data-a="azar">🎲 Una al azar</button><button class="boton boton-claro boton-chico" data-a="mia">✍️ Con mi frase</button></div></div>
      <div class="cmp-modos" id="cmp-modos"><button data-a="modo" data-m="imagenes" class="on">🖼 Imágenes <small>${P.FRASES.length}</small></button><button data-a="modo" data-m="videos">🎬 Videos <small>${P.VIDEOS.length}</small></button><button data-a="modo" data-m="cuenta" title="Todas las publicaciones juntas, en el orden en que conviene publicarlas">📱 La cuenta <small>${P.ORDEN.length}</small></button></div>
      <div class="cmp-series" id="cmp-series"></div>
      <div class="cmp-mandos-muro" id="cmp-mandos-muro">
        <div class="cmp-grupo"><span>Medida</span><div class="cmp-seg" id="cmp-formatos">${P.FORMATOS.map((f) => `<button data-a="formato" data-f="${f.id}" class="${f.id === E.formato ? 'on' : ''}" title="${esc(f.para)} · ${f.w} × ${f.h}"><i style="aspect-ratio:${f.w}/${f.h}"></i>${esc(f.n)}</button>`).join('')}</div></div>
        <div class="cmp-grupo"><span>Fondo</span><div class="cmp-seg" id="cmp-fondos">${P.FONDOS.map((f) => `<button data-a="fondo" data-f="${f.id}" class="${f.id === E.fondo ? 'on' : ''}"><i class="cmp-gota" style="background:${f.bg}"></i>${esc(f.n)}</button>`).join('')}</div></div>
      </div>
      <p class="cmp-para" id="cmp-para"></p>
      <div class="cmp-perfil" id="cmp-perfil" hidden></div>
      <div class="cmp-rejilla" id="cmp-rejilla"></div>
      <div class="acciones cmp-pie-muro" id="cmp-pie-muro"></div>
    </section>

    <section class="tarjeta cmp-plegada" id="cmp-textos"><details>
      <summary><div><h2>Textos para acompañar</h2><p class="sub">Cada imagen ya trae su texto. Aquí están los largos, por red, con tu liga puesta.</p></div><span class="cmp-abre"><i>Ver los textos</i><i>Cerrar</i></span></summary>
      <div class="cmp-series" id="cmp-red">${TEXTOS.map((t) => `<button data-a="red" data-r="${t.id}" class="${t.id === E.red ? 'on' : ''}">${t.n}</button>`).join('')}</div>
      <div id="cmp-textos-lista"></div>
    </details></section>

    <section class="tarjeta" id="cmp-whatsapp">
      <h2>WhatsApp</h2><p class="sub">De persona a persona es como más se cree. Así se va a ver tu mensaje cuando llegue: con la imagen de Cupido y la liga ya puestas. Toca «Mandar», elige a quién, y ya.</p>
      <div class="cmp-whats">${WHATSAPP.map((w) => { const texto = w.x.replace(/\n?\{liga\}$/, ''), hora = new Date().toLocaleTimeString('es-MX', { hour: 'numeric', minute: '2-digit', hour12: true });
        return `<article class="wa ${w.foto === 'estado' ? 'wa-estado' : ''}">
          <header class="wa-cab"><span class="wa-atras" aria-hidden="true">‹</span><span class="wa-foto">${WA_FOTO[w.foto]}</span><div class="wa-quien"><b>${w.quien}</b><small>${w.sub}</small></div></header>
          <div class="wa-chat"><span class="wa-dia">Hoy</span>
            <div class="wa-burbuja">
              <div class="wa-previa"><img src="/img/compartir/liga.png" alt="" loading="lazy" data-priv-no><b>Cupido Algorítmico — No es una app de citas</b><span>43 preguntas, una sola vez. Si alguien cruza el 90 % contigo, les avisamos a los dos.</span><small>${P.CASA}</small></div>
              <p>${esc(texto).replace(/\n/g, '<br>')}<br><i>${esc(liga)}</i></p>
              <span class="wa-hora">${esc(hora)} ${WA_PALOMITAS}</span>
            </div></div>
          <footer class="wa-pie"><a class="wa-mandar" target="_blank" rel="noopener" href="https://wa.me/?text=${encodeURIComponent(llenar(w.x))}">${WA_MANDAR}Mandar por WhatsApp</a><button class="wa-copiar" data-a="copiar-wa" data-w="${w.id}">Copiar</button></footer>
        </article>`; }).join('')}</div>
      <h3 class="cmp-h3">La foto del grupo</h3><p class="sub">Si abres un grupo o una comunidad para hablar de Cupido, usa el corazón. Todas las redes lo recortan en círculo, y cabe. Toca uno y se descarga.</p>
      <div class="cmp-perfiles">${P.PERFILES.map((p) => `<button class="cmp-perfil" data-a="perfil" data-p="${p.id}" title="Descargar el perfil ${p.n.toLowerCase()} · 1080 × 1080"><canvas data-perfil="${p.id}"></canvas><span>⬇ ${p.n}</span></button>`).join('')}</div>
    </section>

    <section class="tarjeta" id="cmp-redes">
      <h2>Qué va en cada red</h2><p class="sub">Cada red pide su medida. Toca la pieza y la galería se acomoda sola.</p>
      <div class="cmp-tabla"><table><thead><tr><th>Red</th><th>Para qué</th><th>Medida</th><th></th></tr></thead><tbody>
        ${REDES.map(([red, que, f]) => { const F = P.FORMATO[f]; return `<tr><td><b>${red}</b></td><td>${que}</td><td>${F ? `${F.w} × ${F.h}` : f === 'video' ? '1080 × 1920 · MP4' : '1080 × 1080'}</td><td><button class="enlace" data-a="red-pieza" data-f="${f}">${f === 'perfil' ? 'Descargar' : f === 'video' ? 'Ver los videos' : P.FORMATOS.some((x) => x.id === f) ? 'Ver en la galería' : 'Abrir'}</button></td></tr>`; }).join('')}
      </tbody></table></div>
      <ul class="razones" style="padding:0;margin-top:14px">
        <li><span class="i si">✓</span><span><b>En historias, lo importante va al centro.</b> Instagram y TikTok tapan la parte de arriba y la de abajo con sus botones. La pieza «Historia» ya deja ese espacio libre.</span></li>
        <li><span class="i si">✓</span><span><b>Para grabar tu pantalla sin enseñar a nadie,</b> prende «Ocultar nombres» y «Ocultar fotos» en el menú de tu tablero. Todo queda borroso hasta que lo apagues.</span></li>
        <li><span class="i si">✓</span><span><b>Siempre di dónde:</b> ${P.CASA}</span></li>
      </ul>
    </section>

    <section class="tarjeta" id="cmp-codigo">
      <h2>Código para tu página</h2><p class="sub">Si tienes un sitio, un blog o una tienda, pega uno de estos. Ya llevan tu liga. No instalan nada ni rastrean a quien te visita.</p>
      <div class="cmp-grupo" style="margin-bottom:14px"><span>Color</span><div class="cmp-seg" id="cmp-boton">${Object.entries(BOTONES).map(([id, b]) => `<button data-a="boton" data-b="${id}" class="${id === E.boton ? 'on' : ''}">${b.n}</button>`).join('')}</div></div>
      <div class="cmp-codigos" id="cmp-codigos"></div>
    </section>

    <section class="tarjeta" id="cmp-marca">
      <div class="cmp-cab"><div><h2>La marca</h2><p class="sub">Con esto se arma todo lo demás. Úsalo tal cual: no pide permiso.</p></div>
        <div class="acciones"><button class="boton boton-claro boton-chico" data-a="guia">⬇ Guía de estilos</button></div></div>
      <div class="cmp-marca">
        <div><h3 class="cmp-h3">Logotipo</h3><p class="sub">El corazón con su punto y el nombre en Fraunces. El corazón va en rosa; el nombre, en negro o en blanco. Toca el que necesites y se descarga.</p>
          <div class="cmp-logos">
            <button class="cmp-logo claro" data-a="logo" data-l="negro" title="Descargar en PNG sin fondo"><canvas data-logo="negro"></canvas><span>⬇ Sobre claro · PNG</span></button>
            <button class="cmp-logo oscuro" data-a="logo" data-l="blanco" title="Descargar en PNG sin fondo"><canvas data-logo="blanco"></canvas><span>⬇ Sobre oscuro · PNG</span></button>
            <button class="cmp-logo claro" data-a="logo" data-l="una" title="Descargar en PNG sin fondo"><canvas data-logo="una"></canvas><span>⬇ A una tinta · PNG</span></button>
            <button class="cmp-logo claro" data-a="logo" data-l="svg" title="Descargar en SVG"><canvas data-logo="solo"></canvas><span>⬇ El corazón · SVG</span></button>
          </div></div>
        <div><h3 class="cmp-h3">Color</h3><p class="sub">Negro sobre blanco. El rosa es solo del corazón. Toca un color para copiarlo.</p>
          <div class="cmp-colores">${COLORES.map((c) => `<button data-a="color" data-h="${c.h}" title="Copiar ${c.h}"><i style="background:${c.h}"></i><b>${c.n}</b><code>${c.h} · copiar</code><small>${c.u}</small></button>`).join('')}</div></div>
        <div><h3 class="cmp-h3">Tipografía</h3><p class="sub">Dos letras, las dos libres y gratis. Toca una y se descarga a tu equipo.</p>
          <div class="cmp-tipos">
            <a class="cmp-tipo" href="/letras/Cupido_Tipografia_Fraunces.zip" download data-a="letra" data-l="Fraunces"><b style="font:600 30px/1.1 Fraunces,Georgia,serif">Las mujeres <i>mandan.</i></b><span>Fraunces 600 · para decir. La cursiva, para lo que importa.</span><em>⬇ Descargar Fraunces <small>.zip · 0.5 MB</small></em></a>
            <a class="cmp-tipo" href="/letras/Cupido_Tipografia_Inter.zip" download data-a="letra" data-l="Inter"><b style="font:500 17px/1.4 Inter,system-ui,sans-serif">Es la regla de la casa.</b><span>Inter 500 · para explicar, en gris y en chico.</span><em>⬇ Descargar Inter <small>.zip · 0.9 MB</small></em></a>
          </div><p class="cmp-pista">Cada paquete trae la letra normal, la cursiva, su licencia y cómo instalarla en Mac, Windows, Canva o CapCut.</p></div>
        <div class="cmp-voz"><div><h3 class="cmp-h3">Así suena Cupido</h3><ul class="razones" style="padding:0">
            <li><span class="i si">✓</span><span>Invita, no vende. Se le habla a una persona, de tú.</span></li>
            <li><span class="i si">✓</span><span>Frases cortas, que se entiendan a la primera.</span></li>
            <li><span class="i si">✓</span><span>Dice la verdad: gratis es gratis, y lo que todavía no hacemos, también se dice.</span></li>
            <li><span class="i si">✓</span><span>Con calma. Aquí nadie tiene prisa por conseguirte a alguien.</span></li></ul></div>
          <div><h3 class="cmp-h3">Así no</h3><ul class="razones" style="padding:0">
            <li><span class="i ojo">✕</span><span>Nada de «pareja garantizada» ni «en 30 días». Cupido no promete a nadie.</span></li>
            <li><span class="i ojo">✕</span><span>Nada de «perfiles verificados»: todavía no verificamos identidad.</span></li>
            <li><span class="i ojo">✕</span><span>Nada de cifras infladas ni urgencias inventadas («solo hoy»).</span></li>
            <li><span class="i ojo">✕</span><span>Sin nombrar a otras apps ni burlarse de quien las usa.</span></li></ul></div></div>
        <div><h3 class="cmp-h3">Tres reglas</h3><ul class="razones" style="padding:0">
          <li><span class="i si">1</span><span><b>El corazón no se deforma ni se pinta de otro color.</b> Rosa, blanco o negro.</span></li>
          <li><span class="i si">2</span><span><b>Lo que se dice de Cupido es cierto.</b> Las ${P.FRASES.length} frases de la galería están cotejadas contra lo que la plataforma hace hoy.</span></li>
          <li><span class="i si">3</span><span><b>Siempre se dice dónde:</b> ${P.CASA}</span></li></ul></div>
      </div>
    </section>

    <section class="tarjeta cmp-todo" id="cmp-todo">
      <div><h2>Descargar todo</h2><p class="sub">Por paquetes, para que nada pese de más. Las imágenes y el kit se arman aquí mismo, en tu equipo, con tu liga.</p></div>
      <div class="cmp-paquetes">
        <button data-a="todas-imagenes"><b>🖼 Las ${P.FRASES.length} imágenes</b><small>Todas las frases en vertical 4:5, la medida que mejor se ve en Instagram y Facebook. Las demás medidas se bajan desde la galería.</small><em>⬇ .zip · unos 35 MB</em></button>
        <button data-a="todos-videos" data-audio="0"><b>🎬 Los ${P.VIDEOS.length} videos, sin audio</b><small>Verticales, de 5 a 9 segundos. Para ponerles la música de tu red.</small><em id="cmp-peso-mudos">⬇ .zip</em></button>
        <button data-a="todos-videos" data-audio="1"><b>🎵 Los ${P.VIDEOS.length} videos, con música</b><small>Los mismos, con un fondo suave de piano, guitarra, cuerdas o ritmo.</small><em id="cmp-peso-sonoros">⬇ .zip</em></button>
        <button data-a="kit"><b>🎨 Kit de marca</b><small>Logotipo, perfiles, portadas, tipografías, tu código QR, los textos, el código para páginas y la guía de estilos.</small><em>⬇ .zip · unos 2 MB</em></button>
      </div>
      <p class="cmp-gracias">🤍 Entre más compartas, más nos ayudas a todos a encontrar a la pareja ideal. Gracias.</p>
    </section>`;

  /* ── el muro de piezas: imágenes o videos ── */
  let HECHOS = {};   // los videos que ya vienen hechos (public/videos/lista.json): { id: { s: segundos, m: música, kb, kba } }
  const enRonda = (lista) => {   // «Todas» va mezclada, una de cada serie por vuelta, para que el muro no salga en bloques
    const porSerie = P.SERIES.map((s) => lista.filter((f) => f.s === s.id)), sal = [];
    for (let i = 0; sal.length < lista.length; i++) for (const g of porSerie) if (g[i]) sal.push(g[i]);
    return sal;
  };
  const RONDA = { imagenes: enRonda(P.FRASES), videos: enRonda(P.VIDEOS) };
  const deModo = () => (E.modo === 'videos' ? P.VIDEOS : P.FRASES);
  // «La cuenta»: todas las publicaciones en el orden del calendario (public/js/orden.js), cada una con el fondo que le toca ahí
  const CUENTA = P.ORDEN.map((o) => P.FRASE[o.id]), FONDO_CUENTA = Object.fromEntries(P.ORDEN.map((o) => [o.id, o.fondo]));
  const enCuenta = () => E.modo === 'cuenta', deCuenta = (id) => ({ frase: id, formato: 'retrato', fondo: FONDO_CUENTA[id] || 'blanco' });
  const visibles = () => (enCuenta() ? CUENTA : E.serie === 'todas' ? RONDA[E.modo] : deModo().filter((f) => f.s === E.serie));
  const delMuro = (f) => (E.modo === 'videos' ? { frase: f.id, formato: 'historia', fondo: 'blanco', liga: P.CASA } : enCuenta() ? { ...deCuenta(f.id), liga: P.CASA } : { frase: f.id, formato: E.formato, fondo: E.fondo, liga: P.CASA });
  const turnoDe = (id) => { const i = CUENTA.findIndex((f) => f.id === id); return i < 0 ? '' : `Publicación ${i + 1} de ${CUENTA.length} · día ${Math.floor(i / P.POR_DIA) + 1}`; };
  const reloj = (s) => `0:${String(Math.round(s)).padStart(2, '0')}`;
  const cuantos = (n, uno, varios) => (n === 1 ? uno : varios.replace('#', n));
  function pintarSeries() {
    const base = deModo(), n = (s) => (s === 'todas' ? base.length : base.filter((f) => f.s === s).length);
    if (E.serie !== 'todas' && !n(E.serie)) E.serie = 'todas';
    $('#cmp-series', raiz).innerHTML = [{ id: 'todas', n: 'Todas' }, ...P.SERIES].filter((s) => n(s.id)).map((s) => `<button data-a="serie" data-s="${s.id}" class="${s.id === E.serie ? 'on' : ''}" title="${esc(s.d || '')}">${esc(s.n)} <small>${n(s.id)}</small></button>`).join('');
  }
  // Un lienzo que se mueve: pinta el video de la receta cuadro por cuadro. Devuelve cómo pararlo (y lo deja en su imagen final).
  function animar(lienzo, receta, ancho, { bucle = false, alEmpezar = null } = {}) {
    let vivo = true, t0 = 0, cuadro = 0; const D = P.duracionDe(receta);
    const paso = (ahora) => {
      if (!vivo) return; if (!lienzo.isConnected) { vivo = false; return; }
      if (!t0) { t0 = ahora; alEmpezar?.(D); }
      const t = (ahora - t0) / 1000;
      if (t >= D + (bucle ? 1.2 : 0)) { if (!bucle) { vivo = false; P.pintar(lienzo, receta, { ancho }); return; } t0 = 0; }
      else P.pintar(lienzo, receta, { ancho, momento: Math.min(t, D) });
      cuadro = requestAnimationFrame(paso);
    };
    cuadro = requestAnimationFrame(paso);
    return () => { if (!vivo) return; vivo = false; cancelAnimationFrame(cuadro); if (lienzo.isConnected) P.pintar(lienzo, receta, { ancho }); };
  }
  let turno = 0, enMano = null; const mesaChica = document.createElement('canvas');
  async function pintarMuro() {
    const mio = ++turno, videos = E.modo === 'videos', cuenta = enCuenta(); enMano?.(); pintarSeries();
    const F = P.FORMATO[videos ? 'historia' : cuenta ? 'retrato' : E.formato], lista = visibles(), caja = $('#cmp-rejilla', raiz);
    $('#cmp-mandos-muro', raiz).hidden = videos || cuenta; $('#cmp-series', raiz).hidden = cuenta;
    const perfil = $('#cmp-perfil', raiz); perfil.hidden = !cuenta;
    if (cuenta && !perfil.firstChild) {   // la cabecera, como la de un perfil: así se vería la cuenta ya publicada
      const dias = Math.ceil(lista.length / P.POR_DIA);
      perfil.innerHTML = `<canvas width="168" height="168" aria-hidden="true"></canvas><div><b>cupidoalgoritmico</b><p class="cmp-perfil-cifras"><span><b>${lista.length}</b> publicaciones</span><span><b>${dias}</b> días</span><span><b>${P.POR_DIA}</b> al día</span></p><p>No es una app de citas. 43 preguntas, una sola vez. Aquí manda ella. Gratis y sin anuncios.</p></div>`;
    }
    $('#cmp-para', raiz).innerHTML = videos ? '<b>Video vertical · 1080 × 1920</b> — Para TikTok, Reels, Shorts e historias. De 5 a 9 segundos. Pasa el cursor para verlo; tócalo para descargarlo, con música o sin ella.'
      : cuenta ? '<b>Así se vería la cuenta.</b> Todas las publicaciones, en el orden en que conviene publicarlas: la de arriba a la izquierda sale primero, y cada renglón es un día. Las verdades incómodas van en negro y la regla de la casa en rosa. Toca cualquiera para descargarla.'
        : `<b>${esc(F.n)} · ${F.w} × ${F.h}</b> — ${esc(F.para)}`;
    $('#cmp-pie-muro', raiz).innerHTML = videos
      ? `<button class="boton boton-claro boton-chico" data-a="zip-videos" data-audio="0">⬇ Bajar ${cuantos(lista.length, 'este', 'estos #')} sin audio (.zip)</button><button class="boton boton-claro boton-chico" data-a="zip-videos" data-audio="1">⬇ Bajar ${cuantos(lista.length, 'este', 'estos #')} con música (.zip)</button>`
      : cuenta ? `<button class="boton boton-claro boton-chico" data-a="zip-muro">⬇ Bajar las ${lista.length} numeradas, en orden (.zip)</button>`
        : `<button class="boton boton-claro boton-chico" data-a="zip-muro">⬇ Bajar ${cuantos(lista.length, 'esta', 'estas #')} en ${F.n.toLowerCase()} (.zip)</button>`;
    caja.className = `cmp-rejilla f-${F.id}${videos ? ' de-videos' : ''}${cuenta ? ' de-cuenta' : ''}`;
    // En la cuenta cada pieza es una imagen (no un lienzo): son cientos a la vista, y así el navegador las suelta cuando no se ven
    caja.innerHTML = lista.map((f, i) => `<button class="cmp-pieza${videos ? ' cmp-video' : ''}" data-a="abrir" data-i="${i}" style="aspect-ratio:${F.w}/${F.h}" aria-label="${cuenta ? `${i + 1}. ` : ''}${esc(P.sinMarcas((f.g ? f.g + ' ' : '') + (f.n ? f.n + ' ' : '') + f.t))}">${cuenta ? `<img alt="" decoding="async" data-priv-no><i class="cmp-turno">${i + 1}</i>` : '<canvas></canvas>'}${videos ? '<span class="cmp-play">▶ <i></i></span>' : ''}</button>`).join('');
    await P.cargarLetras(); if (mio !== turno) return;
    if (cuenta) P.pintarPerfil($('canvas', perfil), P.PERFILES[0].id, 168);
    const piezas = $$('.cmp-pieza', caja), punto = Math.min(2, window.devicePixelRatio || 1);
    for (let i = 0; i < piezas.length; i++) {
      if (mio !== turno) return;
      const receta = delMuro(lista[i]), ancho = Math.max(120, Math.round((piezas[i].clientWidth || 220) * punto));
      try {
        if (cuenta) piezas[i].firstElementChild.src = P.pintar(mesaChica, receta, { ancho }).toDataURL('image/png');
        else { P.pintar(piezas[i].firstElementChild, receta, { ancho }); if (videos) piezas[i].querySelector('.cmp-play i').textContent = reloj(P.duracionDe(receta)); }
      } catch { /* una pieza que no se pudo pintar no detiene el muro */ }
      if (i % 6 === 5) await respiro();
    }
  }
  // En la vista de videos, el que tienes bajo el cursor se mueve; y cada rato uno se mueve solo, para que el muro se sienta vivo
  const rejilla = $('#cmp-rejilla', raiz), quieto = matchMedia('(prefers-reduced-motion: reduce)').matches;
  rejilla.addEventListener('pointerover', (e) => {
    if (E.modo !== 'videos' || e.pointerType === 'touch') return; const p = e.target.closest('.cmp-video'); if (!p || p === enMano?.pieza) return;
    enMano?.(); const lienzo = p.firstElementChild, parar = animar(lienzo, delMuro(visibles()[Number(p.dataset.i)]), lienzo.width, { bucle: true });
    enMano = Object.assign(() => { parar(); enMano = null; }, { pieza: p });
  });
  rejilla.addEventListener('pointerleave', () => enMano?.());
  const ola = setInterval(() => {
    if (!raiz.isConnected) return clearInterval(ola);
    if (E.modo !== 'videos' || quieto || enMano || document.hidden || velo.classList.contains('on')) return;
    const aLaVista = $$('.cmp-video', rejilla).filter((p) => { const r = p.getBoundingClientRect(); return r.bottom > 60 && r.top < innerHeight - 60; }); if (!aLaVista.length) return;
    const p = aLaVista[Math.floor(Math.random() * aLaVista.length)], lienzo = p.firstElementChild; if (lienzo.width > 10) animar(lienzo, delMuro(visibles()[Number(p.dataset.i)]), lienzo.width);
  }, 2800);
  function pintarTextos() {
    const T = TEXTOS.find((t) => t.id === E.red) || TEXTOS[0];
    $('#cmp-textos-lista', raiz).innerHTML = `<p class="cmp-nota">💡 ${esc(T.nota)}</p>` + T.lista.map((x, i) => `<article class="cmp-texto"><div class="cmp-texto-cab"><b>${esc(x.t)}</b><button class="boton boton-claro boton-chico" data-a="copiar-texto" data-i="${i}">Copiar</button></div><p>${esc(llenar(x.x)).replace(/\n/g, '<br>')}</p></article>`).join('')
      + `<article class="cmp-texto"><div class="cmp-texto-cab"><b>Etiquetas</b><button class="boton boton-claro boton-chico" data-a="copiar-etiquetas">Copiar</button></div><p>${esc(ETIQUETAS)}</p></article>`;
  }
  function pintarCodigos() {
    const c = codigos(), fila = (id, t, d, vista) => `<article class="cmp-cod"><div class="cmp-cod-cab"><div><b>${t}</b><small>${d}</small></div><button class="boton boton-claro boton-chico" data-a="copiar-codigo" data-c="${id}">Copiar código</button></div><div class="cmp-cod-vista ${E.boton === 'negro' && id === 'insignia' ? '' : ''}">${vista}</div><textarea readonly rows="3" spellcheck="false" aria-label="Código de ${t}">${esc(c[id])}</textarea></article>`;
    $('#cmp-codigos', raiz).innerHTML =
      fila('boton', 'Botón', 'Solo HTML: no carga nada de fuera.', c.boton)
      + fila('insignia', 'Insignia', 'Una imagen chica, como las de las tiendas de apps.', c.insignia)
      + fila('tarjeta', 'Tarjeta con frase', 'Una frase distinta cada día, con su botón.', c.tarjeta)
      + fila('imagen', 'Imagen con liga', 'La misma imagen que sale al pegar la liga en WhatsApp.', c.imagen);
    $$('.cmp-cod-vista img', raiz).forEach((i) => i.setAttribute('data-priv-no', ''));   // son de la marca, no de una persona: «Ocultar fotos» no las toca
    $$('.cmp-cod-vista a', raiz).forEach((x) => x.addEventListener('click', (e) => e.preventDefault()));   // aquí son muestra: no sacan a nadie de la página
  }
  function pintarMarca() {
    $$('canvas[data-perfil]', raiz).forEach((c) => P.pintarPerfil(c, c.dataset.perfil, 240));
    $$('canvas[data-logo]', raiz).forEach((c) => { const l = c.dataset.logo; P.pintarLogo(c, { tinta: l === 'blanco' ? 'blanco' : 'negro', una: l === 'una', solo: l === 'solo', alto: 96 }); });
  }

  /* ── el taller: una pieza en grande, con sus mandos. Dos vistas: la imagen y el video ── */
  const T = { r: null, i: null, mia: false, vista: 'imagen', musica: 'piano', oir: false, ajustes: false, blob: null, clave: '', grabando: false, video: null, parar: null, callar: null };
  const velo = document.createElement('div'); velo.className = 'modal-velo cmp-velo'; velo.id = 'cmp-taller';
  document.getElementById('cmp-taller')?.remove(); document.body.appendChild(velo);
  const pararVista = () => { T.parar?.(); T.parar = null; T.callar?.(); T.callar = null; };
  const cerrarTaller = () => { pararVista(); velo.classList.remove('on'); document.removeEventListener('keydown', teclas); };
  const teclas = (e) => {
    if (T.grabando) return;
    if (e.key === 'Escape') { cerrarTaller(); return; }
    if (/^(INPUT|TEXTAREA)$/.test(document.activeElement?.tagName || '')) return;
    if (e.key === 'ArrowRight') mover(1); else if (e.key === 'ArrowLeft') mover(-1);
  };
  const suMusica = () => { if (!T.mia) T.musica = P.musicaDe(P.FRASE[T.r.frase]); };   // cada frase llega con la música de su serie; después se cambia a gusto
  function mover(d) { if (T.mia || T.grabando) return; const l = visibles(); if (!l.length) return; T.i = ((T.i ?? 0) + d + l.length) % l.length; T.r = { ...T.r, frase: l[T.i].id, c: undefined, ...(enCuenta() && T.vista !== 'video' ? { fondo: FONDO_CUENTA[l[T.i].id] || 'blanco' } : {}) }; suMusica(); pintarTaller(); }
  function abrirTaller(r, i = null, mia = false, vista = 'imagen') {
    const video = vista === 'video';
    T.r = { formato: video ? 'historia' : E.formato, fondo: video ? 'blanco' : E.fondo, conE: true, conLiga: true, miLiga: false, conQr: false, ...r }; T.i = i; T.mia = mia; T.vista = vista; T.oir = false; T.ajustes = false; suMusica();
    velo.classList.add('on'); document.addEventListener('keydown', teclas); pintarTaller(true);
  }
  const recetaTaller = () => { const r = T.r, x = { formato: r.formato, fondo: r.fondo, conE: r.conE, c: r.c, liga: r.conLiga ? (r.miLiga && codigo ? leida : P.CASA) : '', qr: r.conQr ? liga : '' }; return T.mia ? { ...x, t: r.t || '', e: r.conE ? r.e || '' : '', n: '' } : { ...x, frase: r.frase }; };
  // ¿Este video ya viene hecho? Solo los de la galería, tal cual: vertical, fondo blanco, su acomodo, la dirección de la casa y su música
  const yaHecho = (receta, musica) => { const h = !T.mia && HECHOS[receta.frase], fr = P.FRASE[receta.frase]; return !!h && receta.formato === 'historia' && receta.fondo === 'blanco' && receta.conE !== false && receta.liga === P.CASA && !receta.qr && (!receta.c || receta.c === fr.c) && (!musica || musica === h.m); };
  async function pintarTaller(armar = false) {
    const r = T.r, R = P.completar(recetaTaller()), F = P.FORMATO[r.formato], formatos = P.FORMATOS.some((f) => f.id === r.formato) ? P.FORMATOS : [...P.FORMATOS, F], video = T.vista === 'video';
    if (armar || !$('.cmp-taller', velo)) {
      velo.innerHTML = `<div class="cmp-taller" role="dialog" aria-modal="true" aria-label="Una pieza para compartir">
        <button class="cmp-x" data-a="cerrar" aria-label="Cerrar">✕</button>
        <div class="cmp-vista"><button class="cmp-flecha" data-a="antes" aria-label="La anterior">‹</button><div class="cmp-marco"><canvas id="cmp-lienzo"></canvas></div><button class="cmp-flecha" data-a="despues" aria-label="La siguiente">›</button></div>
        <div class="cmp-mandos">
          <div class="cmp-modos chico" id="t-vistas"></div>
          <div class="cmp-escribir" id="cmp-escribir"></div>
          <div id="t-musica"></div>
          <div class="acciones cmp-acciones" id="t-acciones"></div>
          <p class="cmp-pista" id="t-aviso-graba"></p>
          <details class="cmp-ajustes" id="t-ajustes"><summary>Cambiar medida, fondo o acomodo</summary>
            <div class="cmp-grupo"><span>Medida</span><div class="cmp-seg" id="t-formatos"></div><small id="t-para"></small></div>
            <div class="cmp-grupo"><span>Fondo</span><div class="cmp-seg" id="t-fondos"></div></div>
            <div class="cmp-grupo"><span>Acomodo</span><div class="cmp-seg" id="t-acomodos"></div></div>
            <div class="cmp-casillas" id="t-casillas"></div>
          </details>
          <div class="cmp-acompana"><div class="cmp-texto-cab"><b>Texto para acompañarla</b><button class="boton boton-claro boton-chico" data-a="t-texto">Copiar</button></div><p id="t-texto"></p></div>
        </div></div>`;
      $('#t-ajustes', velo).ontoggle = (e) => { T.ajustes = e.target.open; };
    }
    const portada = !P.FORMATOS.includes(F), receta = recetaTaller();
    $('#t-vistas', velo).innerHTML = `<button data-a="t-vista" data-v="imagen" class="${video ? '' : 'on'}">🖼 Imagen</button><button data-a="t-vista" data-v="video" class="${video ? 'on' : ''}">🎬 Video</button>`;
    $('#cmp-escribir', velo).innerHTML = T.mia
      ? `<label class="campo"><small>Tu frase <em>(Enter parte el renglón · *así* va en cursiva · ~así~ va tachado)</em></small><textarea id="t-frase" rows="3" maxlength="140" placeholder="Escribe aquí lo que quieras decir de Cupido">${esc(r.t || '')}</textarea></label>
         <label class="campo"><small>La letra chica (opcional)</small><input id="t-sub" maxlength="110" value="${esc(r.e || '')}" placeholder="Una explicación corta"></label>
         <p class="cmp-nota">Di lo que es cierto: gratis es gratis, y Cupido no promete pareja a nadie. <button class="enlace" data-a="t-frases">Volver a las frases de la casa</button></p>`
      : `<div class="cmp-frase-cab"><span class="chip">${esc(P.SERIE[P.FRASE[r.frase]?.s]?.n || '')}</span>${enCuenta() ? `<span class="cmp-turno-t">${esc(turnoDe(r.frase))}</span>` : ''}${P.FRASE[r.frase]?.f ? `<a class="cmp-fuente" href="${esc(P.FRASE[r.frase].f)}" target="_blank" rel="noopener">📎 Ver la fuente del dato</a>` : ''}<span class="acciones"><button class="boton boton-claro boton-chico" data-a="t-azar">🎲 Otra</button><button class="boton boton-claro boton-chico" data-a="t-mia">✍️ Escribir la mía</button></span></div>`;
    $('#t-musica', velo).innerHTML = video ? `<div class="cmp-grupo"><span>Música</span><div class="cmp-seg" id="t-musicas">${P.MUSICAS.map((m) => `<button data-a="t-musica" data-m="${m.id}" class="${m.id === T.musica ? 'on' : ''}">${esc(m.n)}</button>`).join('')}</div>
        <button class="cmp-oir ${T.oir ? 'on' : ''}" data-a="t-oir" aria-pressed="${T.oir}">${T.oir ? '🔊 Sonando' : '🔈 Oírla'}</button><small>Fondos suaves y sin voz, hechos para Cupido. Si prefieres la música de tu red, baja el video sin audio.</small></div>` : '';
    $('#t-acciones', velo).innerHTML = video
      ? `<button class="boton" data-a="t-video-bajar" data-audio="0">⬇ Video sin audio</button><button class="boton" data-a="t-video-bajar" data-audio="1">⬇ Video con música</button>${navigator.canShare ? '<button class="boton boton-claro" data-a="t-video-compartir">📤 Compartir video</button>' : ''}`
      : `<button class="boton" data-a="t-bajar">⬇ Descargar imagen</button>${navigator.canShare ? '<button class="boton boton-claro" data-a="t-compartir">📤 Compartir</button>' : ''}${window.ClipboardItem ? '<button class="boton boton-claro" data-a="t-copiar">📋 Copiar imagen</button>' : ''}`;
    const aj = $('#t-ajustes', velo); aj.open = video ? T.ajustes : true; aj.classList.toggle('fijo', !video);
    $('#t-formatos', velo).innerHTML = formatos.map((f) => `<button data-a="t-formato" data-f="${f.id}" class="${f.id === r.formato ? 'on' : ''}" title="${f.w} × ${f.h}">${P.FORMATOS.includes(f) ? `<i style="aspect-ratio:${f.w}/${f.h}"></i>` : ''}${esc(f.n)}</button>`).join('');
    $('#t-para', velo).textContent = `${F.w} × ${F.h} · ${F.para}`;
    $('#t-fondos', velo).innerHTML = P.FONDOS.map((f) => `<button data-a="t-fondo" data-f="${f.id}" class="${f.id === r.fondo ? 'on' : ''}"><i class="cmp-gota" style="background:${f.bg}"></i>${esc(f.n)}</button>`).join('');
    $('#t-acomodos', velo).innerHTML = P.ACOMODOS.map((a) => `<button data-a="t-acomodo" data-c="${a.id}" class="${a.id === R.c ? 'on' : ''}" ${portada ? 'disabled' : ''}>${a.n}</button>`).join('');
    $('#t-casillas', velo).innerHTML = `
      <label><input type="checkbox" data-k="conE" ${r.conE ? 'checked' : ''}> Con la letra chica</label>
      <label><input type="checkbox" data-k="conLiga" ${r.conLiga ? 'checked' : ''}> Con la dirección</label>
      ${codigo ? `<label><input type="checkbox" data-k="miLiga" ${r.miLiga ? 'checked' : ''} ${r.conLiga ? '' : 'disabled'}> Que sea mi liga</label>` : ''}
      <label title="Lleva a ${esc(liga)}"><input type="checkbox" data-k="conQr" ${r.conQr ? 'checked' : ''}> Con código QR${codigo ? ' de mi liga' : ''}</label>`;
    // si la combinación ya viene hecha, baja al instante; si no, se graba aquí mismo y hay que decirlo
    const instante = yaHecho(receta, ''), conSuMusica = yaHecho(receta, T.musica);
    const enIphone = /iPhone|iPad|iPod/.test(navigator.userAgent) || (navigator.platform === 'MacIntel' && navigator.maxTouchPoints > 1);
    $('#t-aviso-graba', velo).textContent = !video ? '' : (instante && conSuMusica ? 'Ya está hecho: baja al instante.' : instante ? 'Sin audio baja al instante. Con esta música se graba aquí mismo, en lo que dura el video.' : P.tipoDeVideo() ? 'Con estos cambios el video se graba aquí mismo, en lo que dura. Deja esta ventana a la vista mientras tanto.' : 'Este navegador no graba video: los de la galería sí se descargan, tal como vienen.')
      + (enIphone ? ' En iPhone, para dejarlo en tus fotos: «Compartir video» y luego «Guardar video».' : '');
    $('#t-texto', velo).innerHTML = esc(textoDe(receta)).replace(/\n/g, '<br>');
    $$('.cmp-flecha', velo).forEach((b) => b.hidden = T.mia || visibles().length < 2);
    $$('#t-casillas input', velo).forEach((c) => c.onchange = () => { T.r[c.dataset.k] = c.checked; pintarTaller(); });
    const tf = $('#t-frase', velo), ts = $('#t-sub', velo);
    if (tf) tf.oninput = () => { T.r.t = tf.value; repintar(); };
    if (ts) ts.oninput = () => { T.r.e = ts.value; repintar(); };
    await repintar();
  }
  async function repintar() {
    await P.cargarLetras(); const receta = recetaTaller(), lienzo = $('#cmp-lienzo', velo); if (!lienzo || T.grabando) return;
    pararVista();
    const F = P.FORMATO[receta.formato]; lienzo.style.aspectRatio = `${F.w}/${F.h}`; lienzo.parentElement.className = `cmp-marco ${F.w > F.h * 1.2 ? 'ancho' : F.h > F.w * 1.5 ? 'alto' : ''}`;
    P.pintar(lienzo, receta); const clave = JSON.stringify(receta); T.clave = clave;
    if (T.vista === 'video') {
      // la vista se pinta al tamaño en que se ve (no a 1080), para que corra suave en cualquier equipo; al grabar se pinta completa
      const ancho = Math.min(F.w, Math.max(240, Math.round((lienzo.clientWidth || 360) * Math.min(2, window.devicePixelRatio || 1))));
      T.blob = null;
      T.parar = animar(lienzo, receta, ancho, { bucle: true, alEmpezar: (D) => { T.callar?.(); T.callar = null; if (T.oir && T.musica) P.sonar(T.musica, D).then((c) => { if (T.parar && T.vista === 'video' && T.oir) T.callar = c; else c(); }).catch(() => {}); } });
    } else {
      // la imagen se deja lista de una vez: así «Compartir» y «Copiar» responden al toque (Safari no espera)
      T.blob = P.aBlob(lienzo); T.blob.catch(() => {});
    }
    if (T.video && T.video.clave !== clave) T.video = null;
    const tx = $('#t-texto', velo); if (tx) tx.innerHTML = esc(textoDe(receta)).replace(/\n/g, '<br>');
  }
  // El archivo del video: el que ya viene hecho, si la combinación es la de la galería; si no, se graba aquí
  async function archivoDeVideo(conMusica, boton) {
    const receta = recetaTaller(), clave = JSON.stringify(receta), musica = conMusica ? T.musica : '', llave = `${clave}|${musica}`;
    if (T.video?.llave === llave) return T.video.archivo;
    const nombre = P.nombreDe(receta).replace(/\.png$/, `${conMusica ? '_con-musica' : ''}.mp4`); let archivo = null;
    if (yaHecho(receta, musica)) { try { const r = await fetch(P.videoHecho(receta.frase, conMusica)); if (r.ok) archivo = new File([await r.blob()], nombre, { type: 'video/mp4' }); } catch { /* sin red o sin archivo: se graba */ } }
    if (!archivo) {
      if (!P.tipoDeVideo(conMusica)) throw new Error('este navegador no graba video. Los de la galería sí se descargan, tal como vienen.');
      const etiqueta = boton.innerHTML; pararVista(); T.grabando = true; velo.classList.add('grabando'); boton.classList.add('grabando');
      try { const v = await P.grabarVideo($('#cmp-lienzo', velo), receta, (p) => { boton.textContent = `Grabando… ${Math.round(p * 100)} %`; }, { musica }); archivo = new File([v.blob], nombre.replace(/\.mp4$/, '.' + v.ext), { type: v.blob.type }); }
      finally { boton.innerHTML = etiqueta; boton.classList.remove('grabando'); T.grabando = false; velo.classList.remove('grabando'); repintar(); }
    }
    T.video = { clave, llave, archivo }; return archivo;
  }

  /* ── los paquetes ── */
  const aBytes = async (b) => (b instanceof Uint8Array ? b : new Uint8Array(await (b instanceof Blob ? b : new Blob([b])).arrayBuffer()));
  async function paquete(nombre, tareas) {
    const tapa = document.createElement('div'); tapa.className = 'modal-velo on cmp-avance';
    tapa.innerHTML = `<div class="modal claro"><h2>Armando tu paquete</h2><p class="sub" id="cmp-av-t">Un momento…</p><div class="cmp-barra"><i></i></div><div class="acciones" style="margin-top:16px"><button class="boton boton-claro boton-chico" id="cmp-av-no">Cancelar</button></div></div>`;
    document.body.appendChild(tapa); let cancelado = false; $('#cmp-av-no', tapa).onclick = () => { cancelado = true; };
    try {
      await P.cargarLetras(); const archivos = [];
      for (let i = 0; i < tareas.length; i++) {
        if (cancelado) return false;
        archivos.push({ nombre: tareas[i].nombre, datos: await aBytes(await tareas[i].hacer()) });
        $('#cmp-av-t', tapa).textContent = `${i + 1} de ${tareas.length} archivos`; $('.cmp-barra i', tapa).style.width = `${Math.round(100 * (i + 1) / tareas.length)}%`; await respiro();
      }
      bajar(P.zip(archivos), nombre); tocar('logro'); avisar(`Listo: ${archivos.length} archivos en ${nombre}`, 5000); return true;
    } catch (e) { avisar('No se pudo armar el paquete: ' + e.message); return false; } finally { tapa.remove(); }
  }
  const lienzoNuevo = () => document.createElement('canvas'), mesa = lienzoNuevo();   // la mesa: un solo lienzo para todo el paquete (las piezas se pintan de una en una)
  const tareaPieza = (carpeta, receta) => ({ nombre: `${carpeta}${P.nombreDe(receta)}`, hacer: () => P.aBytes(P.pintar(mesa, receta)) });
  const textosPlanos = () => TEXTOS.map((t) => `══ ${t.n.toUpperCase()} ══\n${t.nota}\n\n` + t.lista.map((x) => `— ${x.t} —\n${llenar(x.x)}`).join('\n\n')).join('\n\n\n') + `\n\n\n══ ETIQUETAS ══\n${ETIQUETAS}\n`;
  const whatsPlano = () => WHATSAPP.map((w) => `— ${w.quien} —\n${llenar(w.x)}`).join('\n\n') + '\n';
  const codigoPlano = () => { const c = codigos(); return `<!-- Cupido Algorítmico · código para tu página. Copia el bloque que quieras y pégalo donde deba verse. -->\n\n<!-- Botón -->\n${c.boton}\n\n<!-- Insignia -->\n${c.insignia}\n\n<!-- Tarjeta con una frase distinta cada día -->\n${c.tarjeta}\n\n<!-- Imagen con liga -->\n${c.imagen}\n`; };
  const leeme = (sello) => `CUPIDO ALGORÍTMICO · Kit de marca ${VERSION_KIT} · ${sello}
${P.CASA}/compartir
Hecho por Ing. Ricardo López Reyero

TU LIGA
  ${liga}
  ${codigo ? 'Es tuya: cuando alguien entra por ella y abre su cuenta, cuenta para ti.' : 'Es la liga de la casa. Con tu cuenta tienes una liga personal.'}

QUÉ HAY AQUÍ
  Cupido_Guia_de_Estilos.html   La guía completa: ábrela en tu navegador (se imprime o se guarda en PDF)
  01-logotipo/     El logotipo sin fondo (PNG) y el corazón (SVG)
  02-perfil/       El corazón para la foto de perfil o del grupo (todas las redes lo recortan en círculo)
  03-portadas/     Portada de Facebook, banner de YouTube y encabezado de X, en blanco y en negro
  04-tipografia/   Fraunces e Inter, con su licencia y cómo instalarlas
  05-codigo-qr/    El código QR de tu liga, para imprimir o pegar en un video
  06-textos/       Textos para cada red, mensajes de WhatsApp y el código para páginas

LO DEMÁS SE BAJA EN ${P.CASA}/compartir
  Las ${P.FRASES.length} imágenes (en cinco medidas y tres fondos) y los ${P.VIDEOS.length} videos verticales, sin audio o con música.

CÓMO SE VE CUPIDO
  Texto negro sobre fondo blanco. El único color es el corazón: rosa #d6455f.
  Letras: Fraunces 600 para decir (cursiva para lo que importa) e Inter 500 para explicar. Las dos son libres.

TRES REGLAS
  1. El corazón no se deforma ni se pinta de otro color: rosa, blanco o negro.
  2. Lo que se dice de Cupido es cierto. Es gratis en 2026 y 2027, no tiene publicidad y no promete pareja a nadie.
     Todavía no verifica identidad: no se dice «perfiles verificados».
  3. Siempre se dice dónde: ${P.CASA}

Entre más compartas, más nos ayudas a todos a encontrar a la pareja ideal. Gracias.
`;
  // La guía de estilos en un solo archivo: se abre en cualquier navegador y se imprime (o se guarda en PDF) tal cual
  const guiaHtml = (sello) => `<!doctype html>
<html lang="es"><head><meta charset="utf-8"><meta name="viewport" content="width=device-width,initial-scale=1">
<title>Guía de estilos · Cupido Algorítmico</title><meta name="author" content="Ricardo López Reyero">
<link href="https://fonts.googleapis.com/css2?family=Fraunces:ital,opsz,wght@0,9..144,600;1,9..144,600&family=Inter:wght@400;500;600&display=swap" rel="stylesheet">
<style>
body{margin:0;font:400 16px/1.6 Inter,system-ui,sans-serif;color:#111;background:#fff}main{max-width:820px;margin:0 auto;padding:56px 28px}
h1{font:600 54px/1.05 Fraunces,Georgia,serif;margin:18px 0 12px}h2{font:600 26px/1.2 Fraunces,Georgia,serif;margin:44px 0 8px;padding-top:22px;border-top:1px solid #e6e6e6}
p{margin:0 0 12px}.g{color:#5a5a5a}.m{display:inline-flex;align-items:center;gap:12px;font:600 26px/1 Fraunces,Georgia,serif;padding:22px 26px;border:1px solid #e6e6e6;border-radius:14px;margin:6px 10px 6px 0}.m svg{width:38px;height:38px}.m.o{background:#0e0e0e;color:#fff;border-color:#0e0e0e}
.c{display:grid;grid-template-columns:repeat(5,1fr);gap:10px}.c div{border:1px solid #e6e6e6;border-radius:10px;overflow:hidden;font-size:13px}.c i{display:block;height:64px;border-bottom:1px solid #e6e6e6}.c b,.c span{display:block;padding:0 10px}.c b{padding-top:8px}.c span{padding-bottom:8px;color:#5a5a5a}
.p{border:1px solid #e6e6e6;border-radius:14px;padding:30px;margin:10px 0}.p b{font:600 46px/1.08 Fraunces,Georgia,serif;display:block;margin-bottom:10px}.p small{color:#5a5a5a;font-size:16px}
table{width:100%;border-collapse:collapse;font-size:14px}td,th{text-align:left;padding:8px 10px;border-bottom:1px solid #e6e6e6}th{font-size:12px;letter-spacing:.06em;text-transform:uppercase;color:#5a5a5a}
.dos{display:grid;grid-template-columns:1fr 1fr;gap:28px}ul{padding-left:20px;margin:6px 0}li{margin:5px 0}footer{margin-top:48px;padding-top:18px;border-top:1px solid #e6e6e6;font-size:13px;color:#5a5a5a}
@media(max-width:640px){.c{grid-template-columns:repeat(2,1fr)}.dos{grid-template-columns:1fr}h1{font-size:40px}}@media print{main{padding:0}h2{break-after:avoid}.p,table,.c,.dos{break-inside:avoid}}
</style></head><body><main>
<span class="m" style="border:0;padding:0">${P.SVG_CORAZON()}Cupido Algorítmico</span>
<h1>Guía de estilos</h1>
<p class="g">Todo lo que hace falta para hablar de Cupido y que se reconozca. Úsala tal cual: no pide permiso. Las piezas listas están en <b>${P.CASA}/compartir</b></p>

<h2>La idea, en una línea</h2>
<p>Texto negro, fondo blanco y un solo color: el corazón. Lo contrario a como se ven las apps de citas, porque Cupido es lo contrario.</p>
<div class="p"><b>Las mujeres <i>mandan.</i></b><small>Es la regla de la casa. Los hombres son bienvenidos, y entran aceptándola.</small></div>

<h2>Logotipo</h2>
<p>El corazón con su punto y el nombre en Fraunces 600. El corazón va en rosa; el nombre, en negro sobre claro o en blanco sobre oscuro. Déjale aire alrededor: al menos el ancho del corazón por cada lado.</p>
<span class="m">${P.SVG_CORAZON()}Cupido Algorítmico</span><span class="m o">${P.SVG_CORAZON(P.ROSA, '#0e0e0e')}Cupido Algorítmico</span>

<h2>Color</h2>
<div class="c">${COLORES.map((c) => `<div><i style="background:${c.h}"></i><b>${c.n}</b><span>${c.h}<br>${c.u}</span></div>`).join('')}</div>

<h2>Tipografía</h2>
<p><b style="font:600 30px/1.2 Fraunces,Georgia,serif">Fraunces 600</b> — para decir. La <i style="font:italic 600 20px Fraunces,Georgia,serif">cursiva</i> se guarda para lo que importa.<br><b>Inter 500</b> — para explicar, en gris y en chico.</p>
<p class="g">Las dos son libres y gratis: fonts.google.com/specimen/Fraunces · fonts.google.com/specimen/Inter</p>

<h2>Las medidas de cada red</h2>
<table><tr><th>Red</th><th>Para qué</th><th>Medida</th></tr>${REDES.map(([red, que, f]) => { const F = P.FORMATO[f]; return `<tr><td>${red}</td><td>${que}</td><td>${F ? `${F.w} × ${F.h}` : f === 'video' ? '1080 × 1920 · MP4' : '1080 × 1080'}</td></tr>`; }).join('')}</table>
<p class="g" style="margin-top:10px">En historias, lo importante va al centro: Instagram y TikTok tapan arriba y abajo con sus botones.</p>

<h2>Cómo suena</h2>
<div class="dos"><div><b>Así sí</b><ul><li>Invita, no vende. Se le habla a una persona, de tú.</li><li>Frases cortas, que se entiendan a la primera.</li><li>Dice la verdad: gratis es gratis.</li><li>Con calma. Aquí nadie tiene prisa.</li></ul></div>
<div><b>Así no</b><ul><li>«Pareja garantizada», «en 30 días».</li><li>«Perfiles verificados»: todavía no se verifica identidad.</li><li>Cifras infladas o urgencias inventadas.</li><li>Nombrar a otras apps o burlarse de quien las usa.</li></ul></div></div>

<h2>Lo que sí se puede decir, porque es cierto</h2>
<ul><li>No es una app de citas: no hay perfiles que mirar ni fotos que deslizar.</li><li>Son 43 preguntas, y se responden una sola vez.</li><li>Solo avisa cuando dos personas cruzan el 90 %, y les avisa a las dos.</li><li>La puerta se abre con dos síes. Nadie se entera de un no.</li><li>Aquí manda ella: si bloquea, queda bloqueado.</li><li>No tiene publicidad, ni la tendrá. Nadie paga por aparecer primero.</li><li>Es gratis en 2026 y 2027. Se entra con el correo, sin contraseña.</li></ul>

<h2>Tres reglas</h2>
<ul><li><b>El corazón no se deforma ni se pinta de otro color.</b> Rosa, blanco o negro.</li><li><b>Lo que se dice de Cupido es cierto.</b> Si dudas, usa una frase de la galería: todas están cotejadas.</li><li><b>Siempre se dice dónde:</b> ${P.CASA}</li></ul>

<footer>Cupido Algorítmico · Guía de estilos ${VERSION_KIT} · ${sello} · Ing. Ricardo López Reyero<br>Entre más compartas, más nos ayudas a todos a encontrar a la pareja ideal.</footer>
</main></body></html>`;
  const deLaRed = (nombre, url) => ({ nombre, hacer: async () => { const r = await fetch(url); if (!r.ok) throw new Error('no se pudo bajar ' + nombre); return r.blob(); } });
  async function bajarKit() {   // el kit de marca: lo que no cambia de una frase a otra
    const sello = P.sello(), t = [], txt = (nombre, contenido) => ({ nombre, hacer: async () => new Blob([contenido], { type: 'text/plain' }) });
    t.push(txt('LEEME.txt', leeme(sello)), txt('Cupido_Guia_de_Estilos.html', guiaHtml(sello)));
    [['negro', 'sobre-claro'], ['blanco', 'sobre-oscuro']].forEach(([tinta, n]) => t.push({ nombre: `01-logotipo/Cupido_logotipo_${n}.png`, hacer: () => P.aBytes(P.pintarLogo(mesa, { tinta, alto: 320 })) }));
    t.push({ nombre: '01-logotipo/Cupido_logotipo_una-tinta.png', hacer: () => P.aBytes(P.pintarLogo(mesa, { una: true, alto: 320 })) }, txt('01-logotipo/Cupido_corazon.svg', P.SVG_CORAZON()));
    P.PERFILES.forEach((p) => t.push({ nombre: `02-perfil/Cupido_perfil_${p.id}_1080x1080.png`, hacer: () => P.aBytes(P.pintarPerfil(mesa, p.id, 1080)) }));
    P.PORTADAS.forEach((p) => ['blanco', 'negro'].forEach((fondo) => t.push(tareaPieza('03-portadas/', { frase: 'no-app', formato: p.id, fondo, liga: P.CASA }))));
    t.push(deLaRed('04-tipografia/Cupido_Tipografia_Fraunces.zip', '/letras/Cupido_Tipografia_Fraunces.zip'), deLaRed('04-tipografia/Cupido_Tipografia_Inter.zip', '/letras/Cupido_Tipografia_Inter.zip'));
    t.push({ nombre: '05-codigo-qr/Cupido_codigo-qr.png', hacer: () => P.aBytes(P.pintarCodigo(mesa, liga, 1200)) });
    t.push(txt('06-textos/textos-para-cada-red.txt', textosPlanos()), txt('06-textos/mensajes-de-whatsapp.txt', whatsPlano()), txt('06-textos/codigo-para-tu-pagina.html', codigoPlano()));
    await paquete(`Cupido_Kit_de_Marca_${VERSION_KIT}_${sello}.zip`, t);
  }
  async function bajarMuro() {
    if (enCuenta()) {
      const tres = (n) => String(n).padStart(3, '0'), sello = P.sello();
      const calendario = `CUPIDO ALGORÍTMICO · EL CALENDARIO\n${CUENTA.length} publicaciones en el orden en que conviene publicarlas: ${P.POR_DIA} por día.\nCada archivo lleva su número. Debajo de cada una va el texto para acompañarla.\n\n`
        + CUENTA.map((f, i) => `${i % P.POR_DIA === 0 ? `════ DÍA ${Math.floor(i / P.POR_DIA) + 1} ════\n\n` : ''}${tres(i + 1)} · ${P.SERIE[f.s]?.n || ''}\n${textoDe(delMuro(f))}\n`).join('\n');
      return paquete(`Cupido_La-cuenta_en-orden_${VERSION_KIT}_${sello}.zip`, [{ nombre: '000_calendario.txt', hacer: async () => new Blob([calendario], { type: 'text/plain' }) }, ...CUENTA.map((f, i) => { const r = delMuro(f); return { nombre: `${tres(i + 1)}_${P.nombreDe(r)}`, hacer: () => P.aBytes(P.pintar(mesa, r)) }; })]);
    }
    const F = P.FORMATO[E.formato], lista = visibles();
    await paquete(`Cupido_${F.id}${E.serie === 'todas' ? '' : '_' + E.serie}${E.fondo === 'blanco' ? '' : '_' + E.fondo}_${VERSION_KIT}_${P.sello()}.zip`, lista.map((f) => tareaPieza('', delMuro(f))));
  }
  // todas las imágenes en vertical, cada serie en su carpeta
  const bajarImagenes = () => paquete(`Cupido_Imagenes_vertical_${VERSION_KIT}_${P.sello()}.zip`, P.SERIES.flatMap((s, i) => P.FRASES.filter((f) => f.s === s.id).map((f) => tareaPieza(`${String(i + 1).padStart(2, '0')}-${s.id}/`, { frase: f.id, formato: 'retrato', fondo: 'blanco', liga: P.CASA }))));
  // los videos ya vienen hechos: el paquete solo los junta
  async function bajarVideos(lista, conMusica, etiqueta = '') {
    const hechos = lista.filter((f) => HECHOS[f.id]); if (!hechos.length) return avisar('Los videos no se pudieron cargar. Revisa tu conexión y vuelve a intentar.');
    await paquete(`Cupido_Videos${etiqueta}${conMusica ? '_con-musica' : '_sin-audio'}_${VERSION_KIT}_${P.sello()}.zip`, hechos.map((f) => deLaRed(`Cupido_${f.id}_1080x1920${conMusica ? '_con-musica' : ''}.mp4`, P.videoHecho(f.id, conMusica))));
  }
  function abrirQr() {
    const tapa = document.createElement('div'); tapa.className = 'modal-velo on';
    tapa.innerHTML = `<div class="modal claro cmp-qr"><button class="cerrar" aria-label="Cerrar">✕</button><h2>El código de ${codigo ? 'tu liga' : 'la liga'}</h2><p class="sub">Para imprimir, pegar en un video o enseñar en tu pantalla. Quien lo apunta con su cámara llega a Cupido.</p>
      <a href="${esc(liga)}" target="_blank" rel="noopener" title="Abrir la liga"><canvas></canvas></a><p class="cmp-qr-liga">${esc(liga)}</p>
      <div class="acciones"><button class="boton" id="cmp-qr-bajar">⬇ Descargar (PNG)</button></div></div>`;
    document.body.appendChild(tapa); P.pintarCodigo($('canvas', tapa), liga, 720);
    const quitar = () => tapa.remove(); $('.cerrar', tapa).onclick = quitar; tapa.onclick = (e) => { if (e.target === tapa) quitar(); };
    $('#cmp-qr-bajar', tapa).onclick = async () => { bajar(await P.aBlob(P.pintarCodigo(lienzoNuevo(), liga, 1200)), 'Cupido_codigo-qr.png'); tocar('guardado'); };
  }

  /* ── los toques ── */
  const blobListo = async () => { if (T.clave !== JSON.stringify(recetaTaller()) || !T.blob) { T.blob = P.aBlob(P.pintar(lienzoNuevo(), recetaTaller())); } return T.blob; };
  const marcar = (caja, attr, valor) => $$(`${caja} button`, raiz).forEach((b) => b.classList.toggle('on', b.dataset[attr] === valor));
  const ponerModo = (m) => { E.modo = m; marcar('#cmp-modos', 'm', m); return pintarMuro(); };
  async function alTocar(e) {
    if (T.grabando) return;   // mientras se graba el video no se toca nada: el lienzo es la película
    const b = e.target.closest('[data-a]'); if (!b) { if (e.target === velo) cerrarTaller(); return; }
    const a = b.dataset.a;
    if (a === 'ir') { const parte = $('#cmp-' + b.dataset.p, raiz), plegada = parte?.querySelector('details'); if (plegada) plegada.open = true; parte?.scrollIntoView({ behavior: 'smooth', block: 'start' }); return; }
    if (a === 'copiar-liga') return copiar(liga, codigo ? 'Tu liga quedó copiada. Compártela con alguien que busque en serio.' : 'Liga copiada.');
    if (a === 'compartir-liga') { try { await navigator.share({ title: 'Cupido Algorítmico', text: 'No es una app de citas. 43 preguntas, una sola vez. Gratis y sin anuncios.', url: liga }); } catch {} return; }
    if (a === 'qr') return abrirQr();
    if (a === 'modo') return ponerModo(b.dataset.m);
    if (a === 'serie') { E.serie = b.dataset.s; return pintarMuro(); }
    if (a === 'formato') { E.formato = b.dataset.f; recordar(); marcar('#cmp-formatos', 'f', E.formato); return pintarMuro(); }
    if (a === 'fondo') { E.fondo = b.dataset.f; recordar(); marcar('#cmp-fondos', 'f', E.fondo); return pintarMuro(); }
    if (a === 'abrir') { const i = Number(b.dataset.i), id = visibles()[i].id; return abrirTaller(enCuenta() ? deCuenta(id) : { frase: id }, i, false, E.modo === 'videos' ? 'video' : 'imagen'); }
    if (a === 'azar') { const l = visibles(), i = Math.floor(Math.random() * l.length); return abrirTaller(enCuenta() ? deCuenta(l[i].id) : { frase: l[i].id }, i, false, E.modo === 'videos' ? 'video' : 'imagen'); }
    if (a === 'mia') return abrirTaller({ t: 'Escribe aquí\ntu frase.', e: '', c: 'arriba' }, null, true, E.modo === 'videos' ? 'video' : 'imagen');
    if (a === 'zip-muro') return bajarMuro();
    if (a === 'zip-videos') return bajarVideos(visibles(), b.dataset.audio === '1', E.serie === 'todas' ? '' : '_' + E.serie);
    if (a === 'todas-imagenes') return bajarImagenes();
    if (a === 'todos-videos') return bajarVideos(P.VIDEOS, b.dataset.audio === '1');
    if (a === 'red') { E.red = b.dataset.r; marcar('#cmp-red', 'r', E.red); return pintarTextos(); }
    if (a === 'copiar-texto') return copiar(llenar(TEXTOS.find((t) => t.id === E.red).lista[Number(b.dataset.i)].x), 'Texto copiado. Pégalo donde vayas a publicar.');
    if (a === 'copiar-etiquetas') return copiar(ETIQUETAS, 'Etiquetas copiadas.');
    if (a === 'copiar-wa') return copiar(llenar(WHATSAPP.find((w) => w.id === b.dataset.w).x), 'Mensaje copiado.');
    if (a === 'perfil') { bajar(await P.aBlob(P.pintarPerfil(lienzoNuevo(), b.dataset.p, 1080)), `Cupido_perfil_${b.dataset.p}_1080x1080.png`); return tocar('guardado'); }
    if (a === 'red-pieza') {
      const f = b.dataset.f, aLaGaleria = () => $('#cmp-galeria', raiz).scrollIntoView({ behavior: 'smooth', block: 'start' });
      if (f === 'perfil') { bajar(await P.aBlob(P.pintarPerfil(lienzoNuevo(), 'rosa', 1080)), 'Cupido_perfil_rosa_1080x1080.png'); return tocar('guardado'); }
      if (f === 'video') { ponerModo('videos'); return aLaGaleria(); }
      if (P.FORMATOS.some((x) => x.id === f)) { E.formato = f; recordar(); marcar('#cmp-formatos', 'f', f); ponerModo('imagenes'); return aLaGaleria(); }
      return abrirTaller({ frase: 'no-app', formato: f });
    }
    if (a === 'boton') { E.boton = b.dataset.b; marcar('#cmp-boton', 'b', E.boton); return pintarCodigos(); }
    if (a === 'copiar-codigo') return copiar(codigos()[b.dataset.c], 'Código copiado. Pégalo en tu página.');
    if (a === 'color') return copiar(b.dataset.h, `${b.dataset.h} copiado.`);
    if (a === 'letra') { tocar('guardado'); return avisar(`Descargando ${b.dataset.l}. Abre el .zip: adentro dice cómo instalarla.`, 5000); }   // el propio enlace baja el archivo
    if (a === 'logo') {
      const l = b.dataset.l;
      if (l === 'svg') bajar(new Blob([P.SVG_CORAZON()], { type: 'image/svg+xml' }), 'Cupido_corazon.svg');
      else bajar(await P.aBlob(P.pintarLogo(lienzoNuevo(), { tinta: l === 'blanco' ? 'blanco' : 'negro', una: l === 'una', alto: 320 })), `Cupido_logotipo_${l === 'blanco' ? 'sobre-oscuro' : l === 'una' ? 'una-tinta' : 'sobre-claro'}.png`);
      return tocar('guardado');
    }
    if (a === 'guia') { const sello = P.sello(); bajar(new Blob([guiaHtml(sello)], { type: 'text/html' }), `Cupido_Guia_de_Estilos_${VERSION_KIT}_${sello}.html`); tocar('guardado'); return avisar('Guía descargada. Ábrela en tu navegador; desde ahí se imprime o se guarda en PDF.', 5000); }
    if (a === 'kit') return bajarKit();
    // el taller
    if (a === 'cerrar') return cerrarTaller();
    if (a === 'antes') return mover(-1);
    if (a === 'despues') return mover(1);
    if (a === 't-vista') { T.vista = b.dataset.v; T.oir = false; return pintarTaller(); }
    if (a === 't-musica') { T.musica = b.dataset.m; T.oir = true; return pintarTaller(); }   // elegir una música es querer oírla
    if (a === 't-oir') { T.oir = !T.oir; return pintarTaller(); }
    if (a === 't-formato') { T.r.formato = b.dataset.f; return pintarTaller(); }
    if (a === 't-fondo') { T.r.fondo = b.dataset.f; return pintarTaller(); }
    if (a === 't-acomodo') { T.r.c = b.dataset.c; return pintarTaller(); }
    if (a === 't-azar') { const l = T.vista === 'video' ? P.VIDEOS : P.FRASES, f = l[Math.floor(Math.random() * l.length)]; T.r = { ...T.r, frase: f.id, c: undefined }; T.i = visibles().indexOf(f); if (T.i < 0) T.i = null; suMusica(); return pintarTaller(); }
    if (a === 't-mia') { const R = P.completar({ frase: T.r.frase }); T.mia = true; T.r = { ...T.r, t: (R.n ? R.n + ' ' : '') + R.t, e: R.e, c: R.c }; await pintarTaller(); $('#t-frase', velo)?.focus(); return; }
    if (a === 't-frases') { T.mia = false; T.r = { ...T.r, frase: T.r.frase || visibles()[0].id, c: undefined }; suMusica(); return pintarTaller(); }
    if (a === 't-bajar') { bajar(await blobListo(), P.nombreDe(recetaTaller())); tocar('guardado'); return avisar('Imagen descargada. El texto para acompañarla está aquí abajo.'); }
    if (a === 't-texto') return copiar(textoDe(recetaTaller()), 'Texto copiado.');
    if (a === 't-copiar') {
      try { await navigator.clipboard.write([new ClipboardItem({ 'image/png': blobListo() })]); tocar('guardado'); avisar('Imagen copiada. Pégala donde quieras.'); }
      catch { avisar('Este navegador no deja copiar imágenes. Usa «Descargar».'); }
      return;
    }
    if (a === 't-compartir') {
      const receta = recetaTaller(), archivo = new File([await blobListo()], P.nombreDe(receta), { type: 'image/png' }), texto = textoDe(receta);
      if (!navigator.canShare?.({ files: [archivo] })) { bajar(archivo, archivo.name); return avisar('Este equipo no comparte imágenes directo: quedó descargada.'); }
      try { navigator.clipboard?.writeText(texto).catch(() => {}); await navigator.share({ files: [archivo], text: texto }); tocar('logro'); avisar('El texto quedó copiado, por si la red no lo puso: pégalo.', 5000); } catch {}
      return;
    }
    // el video: descargar siempre descarga (sin audio o con música); compartir es otro botón
    if (a === 't-video-bajar') {
      const conMusica = b.dataset.audio === '1';
      try { const archivo = await archivoDeVideo(conMusica, b); bajar(archivo, archivo.name); tocar('logro'); avisar(/\.webm$/.test(archivo.name) ? 'Video descargado en WebM. Desde Chrome o Safari sale en MP4.' : conMusica ? 'Video descargado, con su música.' : 'Video descargado, sin audio: la música la pones tú en tu red.', 5000); }
      catch (err) { avisar('No se pudo hacer el video: ' + err.message); }
      return;
    }
    if (a === 't-video-compartir') {
      const receta = recetaTaller(), clave = JSON.stringify(receta);
      try {
        const archivo = T.video?.clave === clave ? T.video.archivo : await archivoDeVideo(true, b);   // si todavía no bajaste ninguno, se comparte el que trae música
        if (!navigator.canShare?.({ files: [archivo] })) { bajar(archivo, archivo.name); return avisar('Este equipo no comparte videos directo: quedó descargado.'); }
        await navigator.share({ files: [archivo], text: textoDe(receta) }); tocar('logro');
      } catch (err) { if (err?.name === 'NotAllowedError') avisar('El video ya está listo. Toca «Compartir video» otra vez.', 5000); else if (err?.name !== 'AbortError') avisar('No se pudo compartir: ' + err.message); }
      return;
    }
  }
  raiz.onclick = alTocar; velo.onclick = alTocar;

  pintarTextos(); pintarCodigos(); await P.cargarLetras(); pintarMarca();
  if (op.parte === 'videos' || op.parte === 'cuenta') { E.modo = op.parte; marcar('#cmp-modos', 'm', op.parte); }
  await pintarMuro();
  // qué videos ya vienen hechos (y cuánto pesan, para decirlo en los paquetes)
  fetch('/videos/lista.json').then((r) => (r.ok ? r.json() : {})).then((j) => {
    HECHOS = j || {}; const ids = P.VIDEOS.filter((f) => HECHOS[f.id]), mb = (k) => Math.max(1, Math.round(ids.reduce((s, f) => s + HECHOS[f.id][k], 0) / 1024));
    if (!raiz.isConnected || !ids.length) return;
    $('#cmp-peso-mudos', raiz).textContent = `⬇ .zip · unos ${mb('kb')} MB`; $('#cmp-peso-sonoros', raiz).textContent = `⬇ .zip · unos ${mb('kba')} MB`;
  }).catch(() => {});
  if (op.parte === 'cuenta') $('#cmp-galeria', raiz)?.scrollIntoView({ block: 'start' });
  else if (op.parte && op.parte !== 'videos') $('#cmp-' + op.parte, raiz)?.scrollIntoView({ block: 'start' });
  // si cambia el ancho (girar el teléfono, abrir el menú), el muro se vuelve a pintar a la nitidez nueva
  let anchoAntes = raiz.clientWidth, espera = null;
  const alCambiar = () => { if (!raiz.isConnected) { window.removeEventListener('resize', alCambiar); return; } clearTimeout(espera); espera = setTimeout(() => { if (Math.abs(raiz.clientWidth - anchoAntes) > 40) { anchoAntes = raiz.clientWidth; pintarMuro(); } }, 250); };
  window.addEventListener('resize', alCambiar);
  return { abrir: (frase, vista = 'imagen') => abrirTaller({ frase: P.FRASE[frase] ? frase : P.FRASES[0].id }, null, false, vista) };
}
