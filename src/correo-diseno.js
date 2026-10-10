/* ─────────────────────────────────────────────────────────────────────────────
   Cupido Algorítmico · El diseño de los correos
   Autor: Ricardo López Reyero
   Un correo de Cupido se reconoce sin leer el remitente. Tiene siempre lo mismo,
   en este orden:
     1 · la marca arriba, con la categoría del correo a la derecha
     2 · la portada: un color según de qué se trata, una figura y el título
     3 · el cuerpo, armado con bloques (párrafo, lista, cifras, burbujas…)
     4 · UN botón grande: lo que queremos que la persona haga al volver
     5 · la firma
     6 · las tres promesas de la casa, por qué llegó y cómo apagarlo
   Reglas de oficio:
   · Todo va en tablas y estilos en línea: así se ve igual en Gmail, Apple y Outlook.
   · Sin imágenes que carguen el mensaje: la única es el corazón de la marca, y con
     las imágenes apagadas el correo se entiende completo.
   · Gmail corta un correo a partir de 102 KB de HTML. Aquí el tope es 60 KB y
     cada correo dice cuánto pesa.
   · Letra de 16 px o más y contraste alto: se tiene que poder leer sin lentes.
   ───────────────────────────────────────────────────────────────────────────── */
// RLR
export const _RLR = 'Ricardo López Reyero';
const _k = 'EYE', _rev = 181218;

export const LIMITE_GMAIL = 102 * 1024; // a partir de aquí Gmail esconde el resto tras «Ver mensaje completo»
export const TOPE_CORREO = 60 * 1024;   // el nuestro: nunca ni cerca

/* ── los tokens: los mismos colores y letras del sitio ───────────────────── */
export const TK = {
  rosa: '#d6455f', rosaOsc: '#b23349', rosaBoton: '#c93a55', rosaSuave: '#fbeef1', rosaLinea: '#f1cdd5',
  crema: '#faf7f4', blanco: '#ffffff', tinta: '#211d24', tinta2: '#4c4752', gris: '#6b6672', linea: '#eae5df', lineaSuave: '#f3ede8',
  ok: '#2e8b57', okSuave: '#e8f5ee', ambar: '#8a5a12', ambarSuave: '#fdf3e1', noche: '#1c1622', noche3: '#3a2f42', perla: '#f4f0ec',
  serif: "Fraunces,Georgia,'Times New Roman',serif", sans: "Inter,-apple-system,'Segoe UI',Helvetica,Arial,sans-serif",
  ancho: 580,
};
// El tono de la portada dice de qué se trata antes de leer una palabra
export const TONOS = {
  amor: { n: 'Lo que casi nunca pasa', fondo: '#c93a55', degr: 'linear-gradient(135deg,#d6455f 0%,#c93a55 45%,#a52c43 100%)', tinta: '#ffffff', sub: '#ffffff', eyebrow: '#ffe1e7', adorno: '#e98a9b', oscuro: true },
  noche: { n: 'Tu cuenta y tu llave', fondo: '#1c1622', degr: 'linear-gradient(135deg,#3a2f42 0%,#1c1622 100%)', tinta: '#ffffff', sub: '#e6dfea', eyebrow: '#f3a9b6', adorno: '#5a4a66', oscuro: true },
  claro: { n: 'Lo de todos los días', fondo: '#fbeef1', degr: 'linear-gradient(135deg,#fdf5f6 0%,#fbe6eb 100%)', tinta: TK.tinta, sub: TK.tinta2, eyebrow: TK.rosaOsc, adorno: '#f1bcc7' },
  sol: { n: 'Recordatorios y fechas', fondo: '#fdf3e1', degr: 'linear-gradient(135deg,#fef8ea 0%,#fbe8c6 100%)', tinta: TK.tinta, sub: TK.tinta2, eyebrow: '#8a5a12', adorno: '#edd29d' },
  calma: { n: 'Cuidado y gracias', fondo: '#e8f5ee', degr: 'linear-gradient(135deg,#f0f9f4 0%,#d8eee2 100%)', tinta: TK.tinta, sub: TK.tinta2, eyebrow: '#1f6b41', adorno: '#b4dcc5' },
  sereno: { n: 'Lo serio, dicho con calma', fondo: '#f1ede8', degr: 'linear-gradient(135deg,#f7f3ef 0%,#e9e2da 100%)', tinta: TK.tinta, sub: TK.tinta2, eyebrow: TK.tinta2, adorno: '#d3c9be' },
};

export const esc = (s) => String(s ?? '').replace(/[<>&"]/g, (c) => ({ '<': '&lt;', '>': '&gt;', '&': '&amp;', '"': '&quot;' }[c]));
const sinHtml = (t) => String(t ?? '').replace(/<br\s*\/?>/g, '\n').replace(/<[^>]+>/g, '').replace(/&nbsp;/g, ' ').replace(/&amp;/g, '&').replace(/&lt;/g, '<').replace(/&gt;/g, '>').replace(/&quot;/g, '"');
const color = (c, def = TK.rosa) => (/^#[0-9a-f]{6}$/i.test(String(c || '')) ? c : def);
const inicial = (n) => esc((String(n || '').trim()[0] || '♥').toUpperCase());
const T0 = 'role="presentation" cellspacing="0" cellpadding="0" border="0"';
const SANS = `font-family:${TK.sans}`, SERIF = `font-family:${TK.serif}`;

/* ── los bloques del cuerpo ──────────────────────────────────────────────── */
// El texto de un bloque puede llevar <b> y <a>; lo que venga de una persona se escapa ANTES de llegar aquí.
export const p = (x) => ({ t: 'p', x });
export const sec = (x) => ({ t: 'sec', x });
export const lista = (f) => ({ t: 'lista', f: f.filter(Boolean) });
export const cita = (x, de = '') => ({ t: 'cita', x, de });
export const cifras = (f) => ({ t: 'cifras', f: f.filter(Boolean) });
export const burbujas = (f) => ({ t: 'burbujas', f });
export const pasos = (f) => ({ t: 'pasos', f });
export const barra = (pct, izq = '', der = '') => ({ t: 'barra', pct, izq, der });
export const ficha = (titulo, f) => ({ t: 'ficha', titulo, f: f.filter(Boolean) });
export const chips = (f) => ({ t: 'chips', f });
export const aviso = (ico, x, tono = 'rosa') => ({ t: 'aviso', ico, x, tono });

const SUAVES = { rosa: [TK.rosaSuave, TK.rosaLinea], sol: [TK.ambarSuave, '#f0dcb8'], calma: [TK.okSuave, '#c6e4d3'], gris: [TK.perla, TK.linea] };
const barraHtml = (pct, lleno = TK.rosa, vacio = '#f3e2e6') => {
  const n = Math.max(3, Math.min(100, Math.round(pct)));
  return `<table ${T0} width="100%" style="background:${vacio};border-radius:99px"><tr><td width="${n}%" bgcolor="${lleno}" style="background:${lleno};border-radius:99px;height:12px;font-size:0;line-height:0">&nbsp;</td>${n < 100 ? '<td style="font-size:0;line-height:0">&nbsp;</td>' : ''}</tr></table>`;
};
const PINTA = {
  p: (b) => `<p style="margin:0 0 16px;${SANS};font-size:16px;line-height:1.65;color:${TK.tinta}">${b.x}</p>`,
  sec: (b) => `<p style="margin:8px 0 10px;${SANS};font-size:12px;line-height:1.4;letter-spacing:.12em;text-transform:uppercase;font-weight:700;color:${TK.rosaOsc}">${b.x}</p>`,
  lista: (b) => `<table ${T0} width="100%" style="margin:0 0 20px;border:1px solid ${TK.rosaLinea};border-radius:16px;border-collapse:separate">${b.f.map((f, k) => {
    const raya = k ? `border-top:1px solid ${TK.rosaSuave};` : '';
    return `<tr><td width="52" valign="top" style="${raya}padding:14px 0 14px 16px;font-size:23px;line-height:1.25">${f.ico || '•'}</td><td valign="top" style="${raya}padding:14px 16px 14px 0;${SANS};font-size:16px;line-height:1.5;color:${TK.tinta}">${f.txt}${f.sub ? `<br><span style="font-size:14.5px;line-height:1.5;color:${TK.gris}">${f.sub}</span>` : ''}</td></tr>`;
  }).join('')}</table>`,
  cita: (b) => `<table ${T0} width="100%" style="margin:2px 0 20px"><tr><td width="30" valign="top" style="${SERIF};font-size:54px;line-height:44px;color:${TK.rosaLinea}">&ldquo;</td><td style="padding:2px 0 0 6px;${SERIF};font-style:italic;font-size:19.5px;line-height:1.5;color:${TK.tinta}">${b.x}${b.de ? `<br><span style="${SANS};font-style:normal;font-size:13.5px;line-height:2.2;color:${TK.gris}">— ${b.de}</span>` : ''}</td></tr></table>`,
  cifras: (b) => {
    const porFila = 2, filas = [];
    for (let i = 0; i < b.f.length; i += porFila) filas.push(b.f.slice(i, i + porFila));
    return `<table ${T0} width="100%" style="margin:0 0 14px">${filas.map((fila) => `<tr>${fila.map((f, k) => `<td width="${Math.floor(100 / porFila)}%" valign="top" style="padding:0 ${k < fila.length - 1 ? 8 : 0}px 8px 0"><table ${T0} width="100%"><tr><td bgcolor="${TK.rosaSuave}" style="background:${TK.rosaSuave};border-radius:16px;padding:14px 14px 13px"><span style="${SERIF};font-size:34px;line-height:1.05;font-weight:700;color:${TK.rosaOsc}">${f.n}</span><br><span style="${SANS};font-size:13.5px;line-height:1.4;color:${TK.tinta2}">${f.e}</span></td></tr></table></td>`).join('')}${fila.length < porFila ? '<td>&nbsp;</td>' : ''}</tr>`).join('')}</table>`;
  },
  burbujas: (b) => `<table ${T0} width="100%" style="margin:0 0 14px">${b.f.map((f) => `<tr><td style="padding:0 0 8px"><table ${T0}><tr><td bgcolor="${f.suave ? TK.rosaSuave : TK.perla}" style="background:${f.suave ? TK.rosaSuave : TK.perla};border-radius:4px 18px 18px 18px;padding:11px 16px 12px;${SANS};font-size:16px;line-height:1.5;color:${TK.tinta}"><span style="font-size:12.5px;font-weight:700;color:${f.suave ? TK.rosaOsc : TK.gris}">${f.ico ? f.ico + '&nbsp; ' : ''}${f.v}</span>${f.d ? `<br>${f.d}` : ''}</td></tr></table></td></tr>`).join('')}</table>`,
  pasos: (b) => `<table ${T0} width="100%" style="margin:0 0 18px">${b.f.map((f, k) => `<tr><td width="44" valign="top" style="padding:0 0 14px"><table ${T0}><tr><td width="32" height="32" align="center" bgcolor="${TK.rosa}" style="background:${TK.rosa};border-radius:16px;${SERIF};font-size:16px;line-height:32px;font-weight:700;color:#ffffff">${k + 1}</td></tr></table></td><td valign="top" style="padding:4px 0 14px;${SANS};font-size:16px;line-height:1.5;color:${TK.tinta}">${f.txt}${f.sub ? `<br><span style="font-size:14.5px;color:${TK.gris}">${f.sub}</span>` : ''}</td></tr>`).join('')}</table>`,
  barra: (b) => `<table ${T0} width="100%" style="margin:0 0 20px"><tr><td style="${SANS};font-size:14.5px;line-height:1.4;color:${TK.tinta2};padding:0 0 7px">${b.izq}</td><td align="right" style="${SANS};font-size:14.5px;line-height:1.4;font-weight:700;color:${TK.rosaOsc};padding:0 0 7px">${b.der}</td></tr><tr><td colspan="2">${barraHtml(b.pct)}</td></tr></table>`,
  ficha: (b) => `<table ${T0} width="100%" style="margin:0 0 20px;border:1px solid ${TK.linea};border-radius:16px;border-collapse:separate">${b.titulo ? `<tr><td colspan="2" bgcolor="${TK.crema}" style="background:${TK.crema};border-radius:16px 16px 0 0;padding:10px 16px;${SANS};font-size:12px;letter-spacing:.12em;text-transform:uppercase;font-weight:700;color:${TK.tinta2}">${b.titulo}</td></tr>` : ''}${b.f.map(([k, v], i) => `<tr><td valign="top" style="${i || b.titulo ? `border-top:1px solid ${TK.lineaSuave};` : ''}padding:11px 8px 11px 16px;${SANS};font-size:14.5px;line-height:1.45;color:${TK.gris};white-space:nowrap">${k}</td><td align="right" valign="top" style="${i || b.titulo ? `border-top:1px solid ${TK.lineaSuave};` : ''}padding:11px 16px 11px 8px;${SANS};font-size:15.5px;line-height:1.45;font-weight:600;color:${TK.tinta}">${v}</td></tr>`).join('')}</table>`,
  chips: (b) => `<p style="margin:0 0 12px;line-height:1">${b.f.map((c) => `<span style="display:inline-block;margin:0 6px 8px 0;padding:8px 13px;background:${TK.rosaSuave};border-radius:99px;${SANS};font-size:14px;line-height:1.2;font-weight:600;color:${TK.rosaOsc};white-space:nowrap">${c}</span>`).join(' ')}</p>`,
  aviso: (b) => { const [f, l] = SUAVES[b.tono] || SUAVES.rosa; return `<table ${T0} width="100%" style="margin:0 0 20px"><tr><td bgcolor="${f}" style="background:${f};border:1px solid ${l};border-radius:16px;padding:14px 16px"><table ${T0} width="100%"><tr>${b.ico ? `<td width="34" valign="top" style="font-size:21px;line-height:1.3">${b.ico}</td>` : ''}<td valign="top" style="${SANS};font-size:15.5px;line-height:1.55;color:${TK.tinta}">${b.x}</td></tr></table></td></tr></table>`; },
};
const TEXTO = {
  p: (b) => sinHtml(b.x) + '\n', sec: (b) => `\n${sinHtml(b.x).toUpperCase()}`,
  lista: (b) => b.f.map((f) => `${f.ico || '•'} ${sinHtml(f.txt)}${f.sub ? '\n   ' + sinHtml(f.sub) : ''}`).join('\n') + '\n',
  cita: (b) => `«${sinHtml(b.x)}»${b.de ? '\n— ' + sinHtml(b.de) : ''}\n`,
  cifras: (b) => b.f.map((f) => `· ${sinHtml(f.n)} ${sinHtml(f.e)}`).join('\n') + '\n',
  burbujas: (b) => b.f.map((f) => `${f.ico || '•'} ${sinHtml(f.v)}${f.d ? ': ' + sinHtml(f.d) : ''}`).join('\n') + '\n',
  pasos: (b) => b.f.map((f, k) => `${k + 1}. ${sinHtml(f.txt)}${f.sub ? '\n   ' + sinHtml(f.sub) : ''}`).join('\n') + '\n',
  barra: (b) => `${sinHtml(b.izq)} ${sinHtml(b.der)}\n`,
  ficha: (b) => (b.titulo ? sinHtml(b.titulo).toUpperCase() + '\n' : '') + b.f.map(([k, v]) => `${sinHtml(k)}: ${sinHtml(v)}`).join('\n') + '\n',
  chips: (b) => b.f.map(sinHtml).join(' · ') + '\n',
  aviso: (b) => `${b.ico ? b.ico + ' ' : ''}${sinHtml(b.x)}\n`,
};

/* ── la figura de la portada ─────────────────────────────────────────────── */
function figura(f, tono) {
  if (!f) return '';
  const borde = tono.oscuro ? '#ffffff' : tono.adorno;
  const circulo = (txt, fondo, lado = 64, letra = 26, col = '#ffffff') => `<td width="${lado}" height="${lado}" align="center" valign="middle" bgcolor="${fondo}" style="background:${fondo};border:3px solid ${borde};border-radius:${lado}px;${SERIF};font-size:${letra}px;line-height:${lado}px;font-weight:700;color:${col}">${txt}</td>`;
  if (f.tipo === 'emoji') return `<table ${T0} style="margin:0 0 18px"><tr><td width="68" height="68" align="center" valign="middle" bgcolor="#ffffff" style="background:#ffffff;border-radius:68px;${tono.oscuro ? '' : `border:1px solid ${tono.adorno};`}font-size:32px;line-height:68px">${f.v}</td></tr></table>`;
  if (f.tipo === 'numero') return `<p class="cu-n" style="margin:0 0 4px;${SERIF};font-size:76px;line-height:1;font-weight:700;letter-spacing:-2px;color:${tono.tinta}">${f.v}${f.sufijo ? `<span style="font-size:40px;letter-spacing:0">&nbsp;${f.sufijo}</span>` : ''}</p>${f.pie ? `<p style="margin:0 0 18px;${SANS};font-size:14.5px;line-height:1.4;font-weight:600;color:${tono.eyebrow}">${f.pie}</p>` : '<p style="margin:0 0 14px;font-size:0;line-height:0">&nbsp;</p>'}`;
  if (f.tipo === 'pareja') return `<table ${T0} style="margin:0 0 18px"><tr>${circulo(inicial(f.a), color(f.ca, TK.noche3))}<td style="padding:0 12px;font-size:28px;line-height:1">💘</td>${circulo(inicial(f.b), color(f.cb, TK.noche3))}</tr></table>`;
  if (f.tipo === 'avatar') return `<table ${T0} style="margin:0 0 18px"><tr>${circulo(inicial(f.v), color(f.c))}</tr></table>`;
  if (f.tipo === 'fecha') return `<table ${T0} style="margin:0 0 18px"><tr><td width="78" align="center" valign="top" bgcolor="#ffffff" style="background:#ffffff;border:1px solid ${tono.adorno};border-radius:16px"><table ${T0} width="100%"><tr><td align="center" bgcolor="${TK.rosaBoton}" style="background:${TK.rosaBoton};border-radius:15px 15px 0 0;padding:5px 0;${SANS};font-size:12px;line-height:1.3;font-weight:700;letter-spacing:.14em;color:#ffffff">${f.mes}</td></tr><tr><td align="center" style="padding:5px 0 9px;${SERIF};font-size:36px;line-height:1;font-weight:700;color:${TK.tinta}">${f.dia}</td></tr></table></td><td valign="middle" style="padding-left:16px;${SANS};font-size:16px;line-height:1.5;color:${tono.sub}"><b style="color:${tono.tinta}">${f.sem}</b>${f.pie ? `<br>${f.pie}` : ''}</td></tr></table>`;
  if (f.tipo === 'barra') return `<table ${T0} width="100%" style="margin:0 0 20px"><tr><td style="${SERIF};font-size:44px;line-height:1;font-weight:700;color:${tono.tinta};padding:0 0 12px">${Math.round(f.pct)}&nbsp;<span style="font-size:26px">%</span>${f.pie ? `<span style="${SANS};font-size:14.5px;font-weight:600;color:${tono.eyebrow}">&nbsp; ${f.pie}</span>` : ''}</td></tr><tr><td>${barraHtml(f.pct, TK.rosaBoton, '#ffffff')}</td></tr></table>`;
  return '';
}

/* ── la plantilla ────────────────────────────────────────────────────────── */
// c = { tono, figura, etiqueta, eyebrow, titulo, sub, vista, cuerpo:[bloques], boton:{txt,url,sub}, segunda:{txt,url},
//       despues:[bloques que van abajo del botón], nota, firma:'casa'|'equipo', promesas:false, reenvio:{url}, baja:{url,n,todas}, pieCuenta }
// (Los campos viejos —parrafos, lista, destacado— se siguen aceptando: se convierten a bloques.)
export function plantilla(env, c) {
  const base = env.BASE_URL || 'https://cupido.capitaltorreon.com';
  const tono = TONOS[c.tono] || TONOS.claro;
  const cuerpo = c.cuerpo || [...(c.parrafos || []).map(p), ...((c.lista || []).length ? [lista(c.lista)] : []), ...(c.destacado ? [cita(c.destacado)] : [])];
  const titulo = String(c.titulo || ''), despues = c.despues || [];
  const vista = esc(c.vista || sinHtml(c.sub || '') || sinHtml(cuerpo.find((b) => b.t === 'p')?.x || ''));
  const enlace = (url, txt, col = TK.gris) => `<a href="${esc(url)}" style="color:${col};text-decoration:underline">${txt}</a>`;

  const cabeza = `<tr><td style="padding:0 4px 16px"><table ${T0} width="100%"><tr>
<td width="40" valign="middle"><a href="${base}" style="text-decoration:none"><img src="${base}/img/correo/marca.png" width="40" height="40" alt="💘" style="display:block;border:0;outline:none;border-radius:10px;font-size:26px;line-height:40px"></a></td>
<td valign="middle" style="padding-left:11px;${SERIF};font-size:19px;line-height:1.2;font-weight:600;color:${TK.tinta};white-space:nowrap"><a href="${base}" style="color:${TK.tinta};text-decoration:none">Cupido Algorítmico</a></td>
${c.etiqueta ? `<td align="right" valign="middle" style="padding-left:10px;${SANS};font-size:13px;line-height:1.3;font-weight:600;color:${TK.gris}">${c.etiqueta}</td>` : ''}</tr></table></td></tr>`;

  const portada = `<tr><td class="cu-p" bgcolor="${tono.fondo}" style="background:${tono.fondo};background-image:${tono.degr};border-radius:22px 22px 0 0;padding:26px 30px 28px">
<table ${T0} width="100%" style="margin:0 0 18px"><tr><td style="${SANS};font-size:12px;line-height:1.4;letter-spacing:.14em;text-transform:uppercase;font-weight:700;color:${tono.eyebrow}">${esc(c.eyebrow || 'Cupido')}</td>
<td align="right" style="font-family:Georgia,serif;line-height:1;color:${tono.adorno};white-space:nowrap"><span style="font-size:13px">♥</span>&nbsp;<span style="font-size:19px">♥</span>&nbsp;<span style="font-size:27px">♥</span></td></tr></table>
${figura(c.figura, tono)}<h1 class="cu-h1" style="margin:0;${SERIF};font-size:31px;line-height:1.16;font-weight:600;letter-spacing:-.3px;color:${tono.tinta}">${titulo}</h1>
${c.sub ? `<p style="margin:10px 0 0;${SANS};font-size:16.5px;line-height:1.5;color:${tono.sub}">${c.sub}</p>` : ''}</td></tr>`;

  const boton = c.boton ? `<table ${T0} width="100%" style="margin:6px 0 ${c.boton.sub ? 9 : 18}px"><tr><td align="center" bgcolor="${TK.rosaBoton}" style="background:${TK.rosaBoton};border-radius:99px"><a href="${esc(c.boton.url)}" style="display:block;padding:17px 22px;${SANS};font-size:17px;line-height:1.25;font-weight:700;color:#ffffff;text-decoration:none;border-radius:99px">${esc(c.boton.txt)}&nbsp;&nbsp;→</a></td></tr></table>${c.boton.sub ? `<p style="margin:0 0 18px;text-align:center;${SANS};font-size:14px;line-height:1.5;color:${TK.gris}">${c.boton.sub}</p>` : ''}` : '';
  const segunda = c.segunda ? `<p style="margin:0 0 18px;text-align:center;${SANS};font-size:15px;line-height:1.5">${enlace(c.segunda.url, esc(c.segunda.txt), TK.rosaOsc)}</p>` : '';
  const nota = c.nota ? `<p style="margin:2px 0 0;${SANS};font-size:14px;line-height:1.6;color:${TK.gris}">${c.nota}</p>` : '';
  const dentro = `<tr><td class="cu-p" bgcolor="#ffffff" style="background:#ffffff;padding:28px 30px 24px">${cuerpo.map((b) => PINTA[b.t](b)).join('\n')}${boton}${segunda}${despues.map((b) => PINTA[b.t](b)).join('\n')}${nota}</td></tr>`;

  const equipo = c.firma === 'equipo';
  const firma = `<tr><td class="cu-p" bgcolor="#fffdfb" style="background:#fffdfb;border-top:1px solid ${TK.lineaSuave};border-radius:0 0 22px 22px;padding:18px 30px 22px"><table ${T0}><tr>
<td width="38" valign="top"><img src="${base}/img/correo/corazon.png" width="28" height="28" alt="♥" style="display:block;border:0;font-size:20px;line-height:28px;color:${TK.rosa}"></td>
<td valign="top" style="${SANS};font-size:14.5px;line-height:1.55;color:${TK.tinta2}">${equipo ? 'Atentamente,' : 'Con cariño y con lógica,'}<br><b style="${SERIF};font-size:16.5px;color:${TK.tinta}">${equipo ? 'El equipo de Cupido Algorítmico' : 'Cupido Algorítmico'}</b>${equipo ? '' : `<br><span style="font-size:13.5px;color:${TK.gris}">Hecho a mano por el ${enlace('https://ricardolopezreyero.com', 'Ing. Ricardo López Reyero')}</span>`}</td></tr></table></td></tr>`;

  const promesa = (ico, a, b) => `<td width="33%" align="center" valign="top" style="padding:0 5px;${SANS};font-size:12.5px;line-height:1.45;color:${TK.gris}"><span style="font-size:19px;line-height:1.5">${ico}</span><br><b style="color:${TK.tinta2}">${a}</b><br>${b}</td>`;
  const promesas = c.promesas === false ? '' : `<tr><td style="padding:22px 4px 0"><table ${T0} width="100%"><tr>${promesa('🚫', 'Sin anuncios', 'Nunca.')}${promesa('🙈', 'Sin vitrina', 'Nadie navega perfiles.')}${promesa('👑', 'Manda ella', 'La regla de la casa.')}</tr></table></td></tr>`;
  const reenvio = c.reenvio ? `<tr><td style="padding:20px 4px 0"><table ${T0} width="100%"><tr><td style="border:1px dashed ${TK.rosaLinea};border-radius:16px;padding:14px 16px;${SANS};font-size:14px;line-height:1.6;color:${TK.tinta2}"><b>💌 ¿Te reenviaron este correo?</b> Cupido Algorítmico no es una app de citas: respondes 43 preguntas una sola vez y solo te avisamos si alguien cruza el 90&nbsp;% contigo. ${enlace(c.reenvio.url, 'Conócelo&nbsp;→', TK.rosaOsc)}</td></tr></table></td></tr>` : '';
  const porque = c.baja ? `Te llegó porque tienes encendido «${esc(c.baja.n)}». ${enlace(c.baja.url, 'Ya no quiero estos')} · ${enlace(c.baja.todas, 'Elegir qué correos recibo')}` : (c.pieCuenta || '');
  const pie = `<tr><td align="center" style="padding:20px 10px 0;${SANS};font-size:13px;line-height:1.7;color:${TK.gris}">${porque ? porque + '<br>' : ''}${c.pie ? c.pie + '<br>' : ''}${enlace(base, 'cupido.capitaltorreon.com')} · ${enlace(base + '/ella', 'Las reglas de la casa')}</td></tr>`;

  const html = `<!doctype html><html lang="es"><head><meta charset="utf-8"><meta name="viewport" content="width=device-width,initial-scale=1"><meta name="x-apple-disable-message-reformatting"><meta name="color-scheme" content="light only"><meta name="supported-color-schemes" content="light only"><meta name="author" content="${_RLR}"><title>${esc(sinHtml(titulo))}</title>
<link href="https://fonts.googleapis.com/css2?family=Fraunces:ital,opsz,wght@0,9..144,600;0,9..144,700;1,9..144,400&amp;family=Inter:wght@400;600;700&amp;display=swap" rel="stylesheet">
<style>body{margin:0;padding:0}img{-ms-interpolation-mode:bicubic}a{color:${TK.rosaOsc}}@media (max-width:600px){.cu-p{padding-left:20px!important;padding-right:20px!important}.cu-h1{font-size:27px!important}.cu-n{font-size:64px!important}.cu-f{padding:18px 8px 28px!important}}</style></head>
<body style="margin:0;padding:0;background:${TK.crema};-webkit-text-size-adjust:100%;-ms-text-size-adjust:100%">
<div style="display:none;font-size:1px;line-height:1px;max-height:0;max-width:0;opacity:0;overflow:hidden;color:${TK.crema}">${vista}${'&nbsp;&zwnj;'.repeat(70)}</div>
<table ${T0} width="100%" bgcolor="${TK.crema}" style="background:${TK.crema}"><tr><td class="cu-f" align="center" style="padding:26px 12px 34px">
<table ${T0} width="100%" style="max-width:${TK.ancho}px">
${cabeza}
<tr><td><table ${T0} width="100%" style="border:1px solid ${TK.linea};border-radius:23px;border-collapse:separate">
${portada}
${dentro}
${firma}
</table></td></tr>
${promesas}
${reenvio}
${pie}
</table></td></tr></table></body></html>`;

  const text = [sinHtml(titulo), c.sub ? sinHtml(c.sub) : '', '', ...cuerpo.map((b) => TEXTO[b.t](b)), c.boton ? `→ ${c.boton.txt}: ${c.boton.url}` : '', c.boton?.sub ? `  (${sinHtml(c.boton.sub)})` : '', c.segunda ? `${c.segunda.txt}: ${c.segunda.url}` : '', '', ...despues.map((b) => TEXTO[b.t](b)), sinHtml(c.nota),
    '', equipo ? 'Atentamente,\nEl equipo de Cupido Algorítmico' : 'Con cariño y con lógica,\nCupido Algorítmico', '',
    c.promesas === false ? '' : 'Sin anuncios, nunca · Nadie navega perfiles · Aquí manda ella', c.reenvio ? `¿Te reenviaron este correo? Conoce Cupido: ${c.reenvio.url}` : '',
    c.baja ? `Dejar de recibir «${c.baja.n}»: ${c.baja.url}\nElegir qué correos recibo: ${c.baja.todas}` : sinHtml(c.pieCuenta), base].join('\n').replace(/\n{3,}/g, '\n\n').trim();
  return { html, text, peso: new TextEncoder().encode(html).length };
}

/* ── la revisión: lo que todo correo de Cupido tiene que cumplir ─────────── */
// Devuelve la lista de faltas (vacía = pasa). Se corre sobre cada correo del catálogo.
export function revisar({ asunto, html, text, peso }, c) {
  const f = [];
  if (peso > TOPE_CORREO) f.push(`pesa ${(peso / 1024).toFixed(1)} KB (tope ${TOPE_CORREO / 1024} KB; Gmail corta en 102)`);
  if (!c.boton?.url || !c.boton?.txt) f.push('no tiene botón: todo correo invita a hacer algo');
  if (!c.titulo) f.push('no tiene título');
  if (!c.vista) f.push('no tiene la línea que se ve en la bandeja');
  if (!asunto || asunto.length > 78) f.push(`asunto ${asunto ? 'de ' + asunto.length + ' letras (se corta en el teléfono)' : 'vacío'}`);
  if (/undefined|\bNaN\b|\[object |\bnull\b/.test(text + ' ' + asunto)) f.push('se coló un dato vacío (undefined, null o NaN)');
  if (!/marca\.png/.test(html) || !/Cupido Algorítmico<\/a>/.test(html)) f.push('le falta la marca arriba');
  if (!/Con cariño y con lógica|El equipo de Cupido Algorítmico/.test(html)) f.push('le falta la firma');
  if (!c.baja && !c.pieCuenta) f.push('no dice por qué llegó ni cómo apagarlo');
  const ligas = [...html.matchAll(/href="([^"]*)"/g)].map((m) => m[1]);
  const malas = ligas.filter((u) => !/^(https:\/\/|mailto:)/.test(u) && !/^http:\/\/(localhost|127\.0\.0\.1)/.test(u));
  if (malas.length) f.push(`ligas que no abren desde un correo: ${malas.slice(0, 3).join(', ')}`);
  if ([...html.matchAll(/<img\b[^>]*>/g)].some((m) => !/\balt="[^"]+"/.test(m[0]))) f.push('una imagen sin texto alterno');
  if (!text || text.length < 80) f.push('la versión de puro texto está vacía');
  return f;
}
// fin · RLR
