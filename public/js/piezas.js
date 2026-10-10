/* ─────────────────────────────────────────────────────────────────────────────
   Cupido Algorítmico · Las piezas para compartir
   Autor: Ricardo López Reyero · RLR

   Todo lo que se comparte de Cupido sale de aquí: las frases, las medidas de
   cada red y el pintor que las dibuja. Una sola idea de estilo: texto negro,
   fondo blanco y el corazón de la casa como único color.

   Nada se guarda como archivo: cada pieza es una receta (frase + formato +
   fondo) que se pinta en vivo, a la medida exacta, en el navegador de quien
   la baja. Por eso la galería no pesa y una frase nueva aparece en todos los
   formatos el mismo día.

   Las frases viven en /js/frases.js. Aquí están las medidas, los fondos y el
   pintor, que dibuja la pieza terminada (la imagen) o un instante de su video:
   el gancho, el número que cuenta, las palabras que entran, el tachado que se
   dibuja y el corazón que late al final.
   ───────────────────────────────────────────────────────────────────────────── */
const _RLR = 'Ricardo López Reyero', _k = 'EYE', _rev = 181218;

export const CASA = 'cupido.capitaltorreon.com';
export const NOMBRE = 'Cupido Algorítmico';
export const ROSA = '#d6455f';

import { SERIES, FRASES, FRASE, SERIE, VIDEOS, musicaDe } from '/js/frases.js';
export { SERIES, FRASES, FRASE, SERIE, VIDEOS, musicaDe };   // las frases viven en su propio archivo
export { ORDEN, POR_DIA } from './orden.js';   // y el orden en que conviene publicarlas, en el suyo

/* ── las medidas de cada red ──────────────────────────────────────────────
   u = cuánto crecen la marca y la letra chica respecto al cuadrado
   m = margen · caja = dónde cabe lo importante (lo demás lo tapa cada red) */
export const FORMATOS = [
  { id: 'retrato', n: 'Vertical', r: '4:5', w: 1080, h: 1350, u: 1.04, m: 92, para: 'Publicación de Instagram y Facebook' },
  { id: 'cuadrado', n: 'Cuadrado', r: '1:1', w: 1080, h: 1080, u: 1, m: 88, para: 'Instagram, Facebook y grupos de WhatsApp' },
  { id: 'historia', n: 'Historia', r: '9:16', w: 1080, h: 1920, u: 1.1, m: 96, caja: [96, 270, 984, 1570], para: 'Historias, Reels, TikTok, Shorts y estados de WhatsApp' },
  { id: 'horizontal', n: 'Horizontal', r: '16:9', w: 1920, h: 1080, u: 1.3, m: 124, para: 'YouTube: miniatura, video y pantalla final' },
  { id: 'liga', n: 'Liga', r: '1.91:1', w: 1200, h: 630, u: 0.82, m: 66, para: 'Facebook, X y LinkedIn con liga' },
];
// Las portadas de perfil y de canal: una sola pieza cada una, con la frase de la casa
export const PORTADAS = [
  { id: 'portada-facebook', n: 'Portada de Facebook', w: 1640, h: 624, u: 0.78, caja: [300, 76, 1340, 548], para: 'Página o perfil de Facebook' },
  { id: 'banner-youtube', n: 'Banner de YouTube', w: 2560, h: 1440, u: 0.74, caja: [520, 512, 2040, 928], para: 'Canal de YouTube' },
  { id: 'encabezado-x', n: 'Encabezado de X', w: 1500, h: 500, u: 0.66, caja: [300, 70, 1200, 430], para: 'X y LinkedIn' },
];
export const FORMATO = Object.fromEntries([...FORMATOS, ...PORTADAS].map((f) => [f.id, f]));

/* ── los fondos: el blanco es el de la casa; el negro y el rosa, para variar el muro ── */
export const FONDOS = [
  { id: 'blanco', n: 'Blanco', bg: '#ffffff', tx: '#111111', sub: '#5a5a5a', cor: ROSA, punto: '#ffffff', tenue: '#a8a8a8', raya: ROSA },
  { id: 'negro', n: 'Negro', bg: '#0e0e0e', tx: '#ffffff', sub: '#b4b4b4', cor: ROSA, punto: '#0e0e0e', tenue: '#6f6f6f', raya: ROSA },
  { id: 'rosa', n: 'Rosa', bg: ROSA, tx: '#ffffff', sub: 'rgba(255,255,255,.88)', cor: '#ffffff', punto: ROSA, tenue: 'rgba(255,255,255,.55)', raya: '#ffffff' },
];
export const FONDO = Object.fromEntries(FONDOS.map((f) => [f.id, f]));
export const ACOMODOS = [{ id: 'arriba', n: 'Arriba' }, { id: 'centro', n: 'Al centro' }, { id: 'abajo', n: 'Abajo' }];

/* ── las letras de la casa: Fraunces para decir, Inter para explicar ─────── */
const HOJA_LETRAS = 'https://fonts.googleapis.com/css2?family=Fraunces:ital,opsz,wght@0,9..144,600;0,9..144,700;1,9..144,600&family=Inter:wght@500;600&display=swap';
const serif = (tam, cursiva = false, peso = 600) => `${cursiva ? 'italic ' : ''}${peso} ${tam}px Fraunces, Georgia, 'Times New Roman', serif`;
const sans = (tam, peso = 500) => `${peso} ${tam}px Inter, system-ui, -apple-system, 'Segoe UI', sans-serif`;
let letras = null;
export function cargarLetras() {
  if (letras) return letras;
  letras = (async () => {
    try {
      if (!document.getElementById('piezas-letras')) {
        const l = document.createElement('link'); l.id = 'piezas-letras'; l.rel = 'stylesheet'; l.href = HOJA_LETRAS;
        await new Promise((ok) => { l.onload = l.onerror = ok; document.head.appendChild(l); setTimeout(ok, 4000); });
      }
      const muestra = 'Cupido Algorítmico 90 % ¿síes?';
      await Promise.race([Promise.all([serif(80), serif(80, true), serif(80, false, 700), sans(30), sans(30, 600)].map((f) => document.fonts.load(f, muestra))), new Promise((ok) => setTimeout(ok, 6000))]);
    } catch { /* sin las letras de la casa se pinta con las del equipo: se ve distinto, pero se ve */ }
    letrasListas = true; PLANOS.clear();   // lo medido con otras letras ya no sirve
  })();
  return letras;
}

/* ── el corazón (el mismo trazo del favicon) ─────────────────────────────── */
const TRAZO = 'M32 50s-16-9.6-16-21.3C16 22.7 20.3 18 25.9 18c2.7 0 5 1.2 6.1 3.2C33.1 19.2 35.4 18 38.1 18 43.7 18 48 22.7 48 28.7 48 40.4 32 50 32 50z';
export const SVG_CORAZON = (color = ROSA, punto = '#fff') => `<svg xmlns="http://www.w3.org/2000/svg" viewBox="14 16 36 36"><!-- RLR --><path d="${TRAZO}" fill="${color}"/><circle cx="32" cy="30" r="3.2" fill="${punto}"/></svg>`;
function corazon(ctx, x, y, alto, color, punto) {   // x, y = esquina de arriba a la izquierda; el corazón mide alto × alto
  const s = alto / 32; ctx.save(); ctx.translate(x - 16 * s, y - 18 * s); ctx.scale(s, s);
  ctx.fillStyle = color; ctx.fill(new Path2D(TRAZO));
  if (punto) { ctx.fillStyle = punto; ctx.beginPath(); ctx.arc(32, 30, 3.2, 0, Math.PI * 2); ctx.fill(); }
  ctx.restore();
}

/* ── partir la frase en palabras con su estilo ───────────────────────────── */
export const sinMarcas = (t) => String(t || '').replace(/~[^~]*~\s*/g, '').replace(/[*~]/g, '').replace(/\s*\n\s*/g, ' ').trim();
function partir(texto) {
  let cursiva = false, tachado = false;
  return String(texto || '').split('\n').map((renglon) => {
    const palabras = []; let actual = '';
    const cierra = () => { if (actual) { palabras.push({ t: actual, cursiva, tachado }); actual = ''; } };
    for (const ch of renglon) {
      if (ch === '*') { cierra(); cursiva = !cursiva; } else if (ch === '~') { cierra(); tachado = !tachado; } else if (ch === ' ') cierra(); else actual += ch;
    }
    cierra(); return palabras;
  }).filter((r) => r.length);
}
const APRIETE = -0.004;   // las letras grandes van apenas más juntas
// Acomoda los renglones en el ancho dado. Devuelve null si una sola palabra no cabe. Cada fila recuerda de qué renglón escrito viene (pr).
function acomodar(ctx, parrafos, tam, ancho, peso = 600, todoCursiva = false) {
  const filas = []; const tinta = 'letterSpacing' in ctx; if (tinta) ctx.letterSpacing = `${(APRIETE * tam).toFixed(2)}px`;
  ctx.font = serif(tam, todoCursiva, peso); const espacio = (ctx.measureText(' ').width || tam * 0.24) * 1.06;
  parrafos.forEach((palabras, pr) => {
    let fila = { p: [], w: 0, pr };
    for (const p of palabras) {
      ctx.font = serif(tam, p.cursiva || todoCursiva, peso); const w = ctx.measureText(p.t).width;
      if (w > ancho) { filas.length = 0; filas.push(null); return; }
      if (fila.p.length && fila.w + espacio + w > ancho) { filas.push(fila); fila = { p: [], w: 0, pr }; }
      const x = fila.p.length ? fila.w + espacio : 0; fila.p.push({ ...p, x, w }); fila.w = x + w;
    }
    filas.push(fila);
  });
  if (tinta) ctx.letterSpacing = '0px';
  return filas.includes(null) ? null : filas;
}
const INTERLINEA = 1.07, SUBE = 0.78, BAJA = 0.2;
const altoDe = (filas, tam) => (filas.length - 1) * tam * INTERLINEA + tam * (SUBE + BAJA);
// La letra más grande que quepa en la caja; y luego renglones parejos (que no quede una palabra sola al final).
function ajustar(ctx, parrafos, tope, minimo, ancho, alto, peso = 600, todoCursiva = false, aguante = 0.6) {
  const cabe = (tam, enteros) => { const f = acomodar(ctx, parrafos, tam, ancho, peso, todoCursiva); return !!f && altoDe(f, tam) <= alto && (!enteros || f.length === parrafos.length); };
  const busca = (enteros) => {   // la letra más grande que cabe: si cabe a un tamaño, cabe a cualquiera menor
    if (cabe(tope, enteros)) return Math.round(tope);
    if (!cabe(minimo, enteros)) return 0;
    let lo = minimo, hi = tope; while (hi - lo > 1) { const mid = (lo + hi) / 2; if (cabe(mid, enteros)) lo = mid; else hi = mid; }
    return Math.floor(lo);
  };
  // Si la frase viene partida a mano, cada renglón se queda entero mientras la letra no tenga que achicarse demasiado
  const libre = busca(false), entero = parrafos.length > 1 ? busca(true) : 0;
  const tam = entero && entero >= libre * aguante ? entero : libre || minimo;
  let filas = acomodar(ctx, parrafos, tam, ancho, peso, todoCursiva) || acomodar(ctx, parrafos, tam, 1e6, peso, todoCursiva);
  if (filas.length > parrafos.length) {   // hay renglones partidos por el ancho: se emparejan, para que no quede una palabra sola
    let lo = Math.max(...filas.flatMap((f) => f.p.map((p) => p.w))), hi = ancho;
    for (let i = 0; i < 14 && hi - lo > 2; i++) { const mid = (lo + hi) / 2, f = acomodar(ctx, parrafos, tam, mid, peso, todoCursiva); if (f && f.length <= filas.length) hi = mid; else lo = mid; }
    filas = acomodar(ctx, parrafos, tam, hi, peso, todoCursiva) || filas;
  }
  return { tam, filas, alto: altoDe(filas, tam), ancho: Math.max(...filas.map((f) => f.w)), peso, todoCursiva };
}
// La letra chica: Inter, en gris, con renglones cómodos
function parrafo(ctx, texto, tam, ancho, peso = 500) {
  ctx.font = sans(tam, peso); const filas = []; let fila = '';
  for (const p of String(texto).split(/\s+/)) { const prueba = fila ? fila + ' ' + p : p; if (fila && ctx.measureText(prueba).width > ancho) { filas.push(fila); fila = p; } else fila = prueba; }
  if (fila) filas.push(fila);
  return { tam, filas, alto: filas.length ? (filas.length - 1) * tam * 1.42 + tam * 1.05 : 0, ancho: Math.max(0, ...filas.map((f) => ctx.measureText(f).width)) };
}
function medirMarca(ctx, u) { const alto = 42 * u, letra = 36 * u; ctx.font = serif(letra); return { alto, letra, hueco: 14 * u, w: alto + 14 * u + ctx.measureText(NOMBRE).width }; }

/* ── la receta completa ──────────────────────────────────────────────────
   receta = { frase: 'mandan' } o { t, e, n } · formato · fondo · c (acomodo) · conE (con letra chica)
            liga (lo que se lee abajo; '' = sin dirección) · qr (adonde lleva el código; '' = sin código)
            g (el gancho con que abre el video) · gr (el dibujo de la cantidad)                          */
export function completar(receta = {}) {
  const fr = receta.frase ? FRASE[receta.frase] : null, propia = receta.t != null;
  return { formato: 'retrato', fondo: 'blanco', liga: CASA, qr: '', conE: true, ...receta,
    t: receta.t ?? fr?.t ?? '', e: receta.conE === false ? '' : (receta.e ?? fr?.e ?? ''), n: receta.n ?? (propia ? '' : fr?.n) ?? '', c: receta.c || fr?.c || 'centro',
    g: receta.g ?? (propia ? '' : fr?.g) ?? '', gr: receta.gr ?? (propia ? null : fr?.gr) ?? null };
}

/* ── el plano: dónde va cada cosa y cuándo entra. Se calcula una vez por receta y se guarda ── */
const PLANOS = new Map(); let letrasListas = false;
const suave = (x) => { x = Math.max(0, Math.min(1, x)); return 1 - (1 - x) ** 3; };
// El video abre con la pieza completa un instante y luego se desvanece para armarse. Así su primer cuadro —la portada que enseñan
// WhatsApp, TikTok y la galería del teléfono— nunca es un cuadro en blanco; y en bucle, el final empata con el principio.
const PORTADA = 0.62;
const entre = (x, a, b) => Math.max(a, Math.min(b, x));
function planear(ctx, R) {
  const F = FORMATO[R.formato] || FORMATOS[0], K = FONDO[R.fondo] || FONDOS[0], W = F.w, H = F.h, u = F.u;
  const m = F.m ?? 0, [x0, y0, x1, y1] = F.caja || [m, m, W - m, H - m], cw = x1 - x0;
  const portada = !FORMATOS.includes(F), c = portada ? 'centro' : R.c, alinea = c === 'centro' ? 'centro' : 'izq';
  const P = { F, K, W, H, u, x0, x1, cw, alinea };

  // el pie: la marca y la dirección (y el código, si se pidió)
  const M = medirMarca(ctx, u), dirTam = 25 * u; ctx.font = sans(dirTam, 500); const dirW = R.liga ? ctx.measureText(R.liga).width : 0;
  const Q = R.qr ? qr(R.qr) : null, qLado = Q ? Math.round((W > H ? 150 : 168) * u) : 0;
  let pieH, tipo;
  if (Q) { pieH = Math.max(qLado, M.alto + 14 * u + dirTam); tipo = 'codigo'; }
  else if (alinea === 'centro') { pieH = M.alto + (R.liga ? 14 * u + dirTam : 0); tipo = 'centro'; }
  else if (!R.liga || M.w + 40 * u + dirW <= cw) { pieH = M.alto; tipo = 'renglon'; }
  else { pieH = M.alto + 14 * u + dirTam; tipo = 'pila'; }
  const pieY = y1 - pieH, pie = { M, dirTam, liga: R.liga, Q, qLado };
  if (tipo === 'centro') Object.assign(pie, { mx: x0 + (cw - M.w) / 2, my: pieY, dx: x0 + cw / 2, dy: y1 - dirTam * 0.18, da: 'center' });
  else if (tipo === 'renglon') Object.assign(pie, { mx: x0, my: pieY, dx: x1, dy: pieY + M.alto * 0.5 + dirTam * 0.36, da: 'right' });
  else Object.assign(pie, { mx: x0, my: y1 - (M.alto + (R.liga ? 14 * u + dirTam : 0)), dx: x0, dy: y1 - dirTam * 0.18, da: 'left', qx: x1 - qLado, qy: y1 - qLado });
  P.pie = pie;

  // el cuerpo: el número (y su dibujo), la frase y la letra chica
  const aire = Math.round((portada ? 30 : 58) * u), arriba = y0, abajo = pieY - aire, alto = abajo - arriba;
  const anchoTexto = W > H && !portada ? cw * 0.86 : cw;
  const subTam = Math.round((portada ? 27 : 34) * u), sub = R.e ? parrafo(ctx, R.e, subTam, Math.min(anchoTexto, subTam * 27)) : null, subHueco = sub ? Math.round(34 * u) : 0;
  const parrafos = partir(R.t); let num, numHueco, graf, grafHueco, gan, ganHueco, frase, total, tope;
  // Si la pieza trae mucho (gancho, número, dibujo, frase y letra chica) y la medida es bajita, el número y su dibujo se achican hasta que todo cabe
  for (let vuelta = 0, k = 1; vuelta < 5; vuelta++) {
    num = null; numHueco = 0; graf = null; grafHueco = 0; gan = null; ganHueco = 0;
    // el gancho: la pregunta o el pie que abre la pieza. Va arriba de la frase, en cursiva y más chico; en el video entra primero y se queda
    if (R.g) { gan = ajustar(ctx, partir(R.g), Math.min(cw * (W > H ? 0.05 : 0.086), alto * 0.09) * Math.max(k, 0.8), 24 * u, anchoTexto, alto * 0.3, 600, true); ganHueco = Math.round(gan.tam * 0.5); }
    if (R.n) {
      const topeN = Math.min(alto * (W > H ? 0.46 : R.gr ? 0.3 : 0.36), cw * 0.62) * k;
      num = ajustar(ctx, partir(R.n), topeN, 44 * u, cw, topeN * 1.2, 700); numHueco = Math.round(num.tam * 0.02);
      const v = String(R.n).match(/^(\d{1,3})(\D.*)?$/); num.cuenta = v && Number(v[1]) <= 100 ? { hasta: Number(v[1]), resto: v[2] || '' } : null;   // los años y los miles no se cuentan: se ven raros corriendo
      if (R.gr?.puntos) {   // tantos puntos como diga la cifra: hasta 10 en un renglón, hasta 50 de diez en diez, y de veinte en veinte después
        const n = Math.min(120, R.gr.puntos), col = n <= 10 ? n : n <= 50 ? 10 : 20, filas = Math.ceil(n / col), d = (n <= 5 ? 34 : n <= 10 ? 30 : n <= 50 ? 24 : 18) * u * (W > H ? 0.9 : 1) * k, sep = d * (n <= 50 ? 0.55 : 0.5);
        graf = { tipo: 'puntos', n, llenos: Math.min(n, R.gr.llenos ?? n), col, d, sep, w: col * d + (col - 1) * sep, h: filas * d + (filas - 1) * sep };
      } else if (R.gr?.barra != null) {
        graf = { tipo: 'barra', pct: entre(R.gr.barra, 0, 100), raya: R.gr.raya ?? null, w: Math.min(cw, 640 * u), h: Math.round(16 * u * Math.max(k, 0.7)), cresta: Math.round(22 * u * Math.max(k, 0.7)) };
        graf.h += graf.raya != null ? graf.cresta : 0;
      }
      if (graf) grafHueco = Math.round((graf.tipo === 'barra' ? 30 : 26) * u * Math.max(k, 0.6));
    }
    const fijo = (gan ? gan.alto + ganHueco : 0) + (sub ? sub.alto + subHueco : 0) + (num ? num.alto + numHueco : 0) + (graf ? graf.h + grafHueco : 0), libre = alto - fijo;
    tope = num ? Math.min(num.tam * 0.36, cw * 0.11) : Math.min(cw * (alinea === 'centro' ? 0.168 : 0.2), alto * (W > H ? 0.3 : 0.2)) * (portada ? 0.82 : 1);
    // en las medidas paradas la letra grande manda: un renglón escrito se parte antes que achicarse mucho
    frase = parrafos.length ? ajustar(ctx, parrafos, tope, 26 * u, anchoTexto, Math.max(libre * (c === 'centro' ? 0.9 : 1), 40 * u), 600, false, W > H ? 0.6 : 0.74) : null;
    total = fijo + (frase ? frase.alto : 0);
    if (total <= alto || !(num || gan)) break;
    k *= Math.max(0.55, alto / total) * 0.96;
  }
  let y = c === 'arriba' ? arriba : c === 'abajo' ? abajo - total : arriba + (alto - total) / 2;
  if (gan) { P.gancho = { b: gan, x: x0, y }; y += gan.alto + ganHueco; }
  if (num) { P.num = { b: num, x: x0 - (alinea === 'centro' ? 0 : num.tam * 0.035), y }; y += num.alto + numHueco; }
  if (graf) { y += grafHueco * 0.35; P.graf = { ...graf, x: alinea === 'centro' ? x0 + (cw - graf.w) / 2 : x0, y }; y += graf.h + grafHueco * 0.65; }
  if (frase) { P.frase = { b: frase, x: x0, y }; y += frase.alto; }
  if (sub) P.sub = { b: sub, x: x0, y: y + subHueco };

  // los tiempos (en segundos): gancho → número y dibujo → palabras (y tachados) → letra chica → marca → latido
  const T = {}; let t = PORTADA + 0.12;
  if (P.gancho) {
    const pal = P.gancho.b.filas.reduce((s, f) => s + f.p.length, 0), paso = Math.min(0.13, 1.3 / pal), letras = sinMarcas(R.g).length;
    T.g = { ini: t, paso }; t += (pal - 1) * paso + 0.3 + entre(0.7 + 0.04 * letras, 0.95, 2.1);   // entra, y se deja leer antes de que llegue la respuesta
  }
  if (P.num) { T.num = { ini: t, dura: num.cuenta ? 0.95 : 0.4 }; if (P.graf) T.graf = { ini: t + 0.08, dura: 1.05 }; t += num.cuenta || P.graf ? 0.8 : 0.42; }
  T.pal = []; let finFrase = t;
  if (P.frase) {
    const todas = frase.filas.reduce((s, f) => s + f.p.length, 0), paso = Math.min(0.2, 2.5 / Math.max(1, todas)); let prAntes = 0;
    frase.filas.forEach((f, i) => {
      if (f.pr !== prAntes) { t += 0.1; prAntes = f.pr; }   // un respiro en cada renglón que el autor partió
      const ult = f.p.reduce((u2, p, j) => (p.tachado ? j : u2), -1); let raya = null;
      f.p.forEach((p, j) => { T.pal.push(t); finFrase = t + 0.32; t += paso; if (j === ult) { raya = { ini: t + 0.2, dura: 0.32 }; t = raya.ini + raya.dura + 0.22; finFrase = t; } });
      f.raya = raya;
    });
  }
  T.sub = finFrase + 0.12; T.pie = T.sub + (P.sub ? 0.4 : 0); T.late = T.pie + 0.8;
  const lectura = entre(1.5 + 0.03 * (sinMarcas(R.t).length + String(R.e || '').length), 2.2, 3.4);   // lo que se queda quieto al final, para leerlo
  T.quieto = T.late + 0.75; T.total = Math.max(5, T.pie + 0.55 + lectura);
  P.T = T;
  return P;
}
function planoDe(ctx, R) {
  const llave = [R.formato, R.fondo, R.c, R.t, R.e, R.n, R.g, R.liga, R.qr, JSON.stringify(R.gr || 0)].join('\u0001');
  let P = PLANOS.get(llave); if (P) return P;
  P = planear(ctx, R);
  if (letrasListas) { if (PLANOS.size > 900) PLANOS.clear(); PLANOS.set(llave, P); }   // sin las letras de la casa las medidas son otras: no se guardan
  return P;
}
export const duracionDe = (receta) => planoDe(medidor(), completar(receta)).T.total;
export const quietoDesde = (receta) => planoDe(medidor(), completar(receta)).T.quieto;   // de aquí en adelante todos los cuadros son iguales
let lienzoMedidor = null; const medidor = () => (lienzoMedidor ||= document.createElement('canvas')).getContext('2d');

/* ── el pintor ───────────────────────────────────────────────────────────
   momento = null pinta la pieza terminada (la imagen). Con momento (segundos) pinta ese instante del video. */
function escribir(ctx, bloque, x, y, anchoCaja, alinea, K, anim) {   // y = orilla de arriba del bloque
  const { tam, filas, peso, todoCursiva } = bloque; const tinta = 'letterSpacing' in ctx;
  ctx.textBaseline = 'alphabetic'; ctx.textAlign = 'left';
  filas.forEach((f, i) => {
    const bx = alinea === 'centro' ? x + (anchoCaja - f.w) / 2 : x, by = y + tam * SUBE + i * tam * INTERLINEA;
    const raya = !f.p.some((p) => p.tachado) ? 0 : anim ? (f.raya ? suave((anim.m - f.raya.ini) / f.raya.dura) : anim.todo) : 1;   // qué tanto va la raya del tachado
    if (tinta) ctx.letterSpacing = `${(APRIETE * tam).toFixed(2)}px`;
    for (const p of f.p) {
      const a = anim ? anim.palabra() : 1; if (a <= 0) continue;
      ctx.globalAlpha = a * (anim?.todo ?? 1); ctx.font = serif(tam, p.cursiva || todoCursiva, peso);
      ctx.fillStyle = K.tx; ctx.fillText(p.t, bx + p.x, by + (1 - a) * tam * 0.16);
      if (p.tachado && raya > 0) { ctx.globalAlpha = a * raya; ctx.fillStyle = K.bg; ctx.fillText(p.t, bx + p.x, by); ctx.fillStyle = K.tenue; ctx.fillText(p.t, bx + p.x, by); }   // lo tachado se apaga a gris cuando pasa la raya
    }
    if (tinta) ctx.letterSpacing = '0px';
    const t = f.p.filter((p) => p.tachado);
    if (t.length && raya > 0) { const a = t[0].x, b = t[t.length - 1].x + t[t.length - 1].w; ctx.globalAlpha = 1; ctx.strokeStyle = K.raya; ctx.lineWidth = Math.max(2, tam * 0.07); ctx.lineCap = 'round'; ctx.beginPath(); ctx.moveTo(bx + a - tam * 0.04, by - tam * 0.25); ctx.lineTo(bx + a - tam * 0.04 + (b - a + tam * 0.08) * raya, by - tam * 0.25 - tam * 0.04 * raya); ctx.stroke(); }
    ctx.globalAlpha = 1;
  });
}
function escribirParrafo(ctx, b, x, y, anchoCaja, alinea, color) {
  ctx.font = sans(b.tam, 500); ctx.fillStyle = color; ctx.textBaseline = 'alphabetic'; ctx.textAlign = alinea === 'centro' ? 'center' : 'left';
  b.filas.forEach((f, i) => ctx.fillText(f, alinea === 'centro' ? x + anchoCaja / 2 : x, y + b.tam * 0.86 + i * b.tam * 1.42));
  ctx.textAlign = 'left';
}
function dibujar(ctx, P, R, m) {
  const { K, W, H, T, x0, cw, alinea, pie } = P, vivo = m != null, v = (ini, dura) => (vivo ? suave((m - ini) / dura) : 1);
  if (vivo && m < PORTADA) { dibujar(ctx, P, R, null); const velo = suave((m - 0.22) / (PORTADA - 0.26)); if (velo > 0) { ctx.globalAlpha = velo; ctx.fillStyle = K.bg; ctx.fillRect(0, 0, W, H); ctx.globalAlpha = 1; } return; }
  ctx.globalAlpha = 1; ctx.globalCompositeOperation = 'source-over'; ctx.fillStyle = K.bg; ctx.fillRect(0, 0, W, H);

  // la marca al pie; al final del video el corazón late dos veces
  const aPie = v(T.pie, 0.55);
  if (aPie > 0) {
    const M = pie.M, pulso = (d) => { const x = vivo ? (m - T.late - d) / 0.28 : -1; return x > 0 && x < 1 ? Math.sin(Math.PI * x) : 0; }, late = 1 + 0.2 * pulso(0) + 0.13 * pulso(0.36);
    ctx.globalAlpha = aPie;
    ctx.save(); ctx.translate(pie.mx + M.alto / 2, pie.my + M.alto / 2); ctx.scale(late, late); corazon(ctx, -M.alto / 2, -M.alto / 2, M.alto, K.cor, K.punto); ctx.restore();
    ctx.font = serif(M.letra); ctx.fillStyle = K.tx; ctx.textBaseline = 'alphabetic'; ctx.textAlign = 'left'; ctx.fillText(NOMBRE, pie.mx + M.alto + M.hueco, pie.my + M.alto * 0.5 + M.letra * 0.33);
    if (pie.liga) { ctx.font = sans(pie.dirTam, 500); ctx.fillStyle = K.sub; ctx.textAlign = pie.da; ctx.fillText(pie.liga, pie.dx, pie.dy); ctx.textAlign = 'left'; }
    if (pie.Q) pintarQr(ctx, pie.Q, pie.qx, pie.qy, pie.qLado, K);
    ctx.globalAlpha = 1;
  }

  // el gancho: entra primero y se queda arriba
  if (P.gancho) { let k = 0; escribir(ctx, P.gancho.b, P.gancho.x, P.gancho.y, cw, alinea, K, vivo ? { m, todo: 1, palabra: () => suave((m - T.g.ini - (k++) * T.g.paso) / 0.3) } : null); }

  // el número: si es una cantidad chica, cuenta desde cero
  if (P.num) {
    const a = v(T.num.ini, 0.35), b = P.num.b;
    if (a > 0) {
      let bloque = b;
      if (vivo && b.cuenta && m < T.num.ini + T.num.dura) {   // el número corriendo: mismo tamaño y mismo lugar, otra cifra
        const p = suave((m - T.num.ini) / T.num.dura), txt = `${Math.round(b.cuenta.hasta * p)}${b.cuenta.resto}`;
        ctx.font = serif(b.tam, false, 700); const palabras = txt.trim().split(/\s+/); let x = 0; const esp = ctx.measureText(' ').width * 1.06;
        const fila = { p: palabras.map((t) => { const w = ctx.measureText(t).width, o = { t, x, w }; x += w + esp; return o; }), pr: 0 }; fila.w = x - esp; bloque = { ...b, filas: [fila] };
        if (alinea === 'centro') fila.w = b.filas[0].w;   // centrado con el ancho final, para que no baile
      }
      ctx.save(); ctx.translate(0, (1 - a) * b.tam * 0.08); escribir(ctx, bloque, P.num.x, P.num.y, cw, alinea, K, vivo ? { m, todo: a, palabra: () => 1 } : null); ctx.restore();
    }
  }
  // el dibujo de la cantidad
  if (P.graf) {
    const g = P.graf, p = v(T.graf.ini, T.graf.dura);
    if (g.tipo === 'puntos') {
      for (let i = 0; i < g.n; i++) {
        const cx = g.x + (i % g.col) * (g.d + g.sep) + g.d / 2, cy = g.y + Math.floor(i / g.col) * (g.d + g.sep) + g.d / 2;
        const lleno = i < g.llenos, sale = vivo ? suave((m - T.graf.ini - (i / g.n) * T.graf.dura * (lleno ? 1 : 0.45)) / 0.22) : 1; if (sale <= 0) continue;
        ctx.globalAlpha = sale; ctx.beginPath(); ctx.arc(cx, cy, (g.d / 2) * (0.55 + 0.45 * sale) - (lleno ? 0 : g.d * 0.05), 0, Math.PI * 2);
        if (lleno) { ctx.fillStyle = K.tx; ctx.fill(); } else { ctx.strokeStyle = K.tenue; ctx.lineWidth = Math.max(1.5, g.d * 0.09); ctx.stroke(); }
      }
      ctx.globalAlpha = 1;
    } else {
      const alto = g.h - (g.raya != null ? g.cresta : 0), y = g.y + (g.raya != null ? g.cresta : 0), r = alto / 2, redonda = (x, w, color, alfa = 1) => { if (w <= 0) return; ctx.globalAlpha = alfa; ctx.fillStyle = color; ctx.beginPath(); if (ctx.roundRect) ctx.roundRect(x, y, Math.max(w, alto), alto, r); else ctx.rect(x, y, w, alto); ctx.fill(); ctx.globalAlpha = 1; };
      redonda(g.x, g.w, K.tenue, 0.32 * v(T.graf.ini, 0.3)); redonda(g.x, g.w * (g.pct / 100) * p, K.tx);
      if (g.raya != null) { const a = v(T.graf.ini + T.graf.dura * 0.55, 0.35), x = g.x + g.w * (g.raya / 100); ctx.globalAlpha = a; ctx.strokeStyle = K.raya; ctx.lineWidth = Math.max(3, alto * 0.3); ctx.lineCap = 'round'; ctx.beginPath(); ctx.moveTo(x, g.y + 2); ctx.lineTo(x, y + alto + g.cresta * 0.45); ctx.stroke(); ctx.globalAlpha = 1; }
    }
  }
  // la frase, palabra por palabra
  if (P.frase) { let k = 0; escribir(ctx, P.frase.b, P.frase.x, P.frase.y, cw, alinea, K, vivo ? { m, todo: 1, palabra: () => suave((m - T.pal[k++]) / 0.32) } : null); }
  // la letra chica
  if (P.sub) { const a = v(T.sub, 0.45); if (a > 0) { ctx.globalAlpha = a; escribirParrafo(ctx, P.sub.b, P.sub.x, P.sub.y + (1 - a) * P.sub.b.tam * 0.3, cw, alinea, K.sub); ctx.globalAlpha = 1; } }
}
export function pintar(lienzo, receta, { ancho, momento = null } = {}) {
  const R = completar(receta), F = FORMATO[R.formato] || FORMATOS[0], esc = ancho ? ancho / F.w : 1;
  const lw = Math.max(1, Math.round(F.w * esc)), lh = Math.max(1, Math.round(F.h * esc));
  if (lienzo.width !== lw) lienzo.width = lw; if (lienzo.height !== lh) lienzo.height = lh;   // solo si cambia: en video el lienzo es el mismo cuadro tras cuadro
  const ctx = lienzo.getContext('2d'); ctx.setTransform(1, 0, 0, 1, 0, 0);
  const P = planoDe(ctx, R); ctx.setTransform(lienzo.width / F.w, 0, 0, lienzo.height / F.h, 0, 0);
  dibujar(ctx, P, R, momento);
  return lienzo;
}

/* ── la música de fondo (hecha con ElevenLabs; los archivos viven en /musica/) ── */
export const MUSICAS = [{ id: 'piano', n: 'Piano' }, { id: 'guitarra', n: 'Guitarra' }, { id: 'cuerdas', n: 'Cuerdas' }, { id: 'ritmo', n: 'Ritmo suave' }];
let audio = null; const TONADAS = new Map();
const contexto = () => (audio ||= new (window.AudioContext || window.webkitAudioContext)());
export function cargarMusica(id) {
  if (!TONADAS.has(id)) TONADAS.set(id, (async () => { const r = await fetch(`/musica/${id}.mp3`); if (!r.ok) throw new Error('No se pudo bajar la música'); const datos = await r.arrayBuffer(); return new Promise((ok, mal) => contexto().decodeAudioData(datos, ok, mal)); })().catch((e) => { TONADAS.delete(id); throw e; }));
  return TONADAS.get(id);
}
// Pone a sonar un fondo durante `segundos`, con entrada suave y salida suave. Devuelve cómo callarlo. `destino` es para grabarlo en el video.
export async function sonar(id, segundos, destino = null) {
  const ac = contexto();
  if (ac.state !== 'running') { await Promise.race([ac.resume(), new Promise((ok) => setTimeout(ok, 1500))]); if (ac.state !== 'running') throw new Error('el navegador no dejó sonar el audio. Toca otra vez.'); }   // sin un toque de la persona, el navegador no suelta el sonido
  const buf = await cargarMusica(id), fuente = ac.createBufferSource(), vol = ac.createGain(), t0 = ac.currentTime + 0.02, fin = Math.min(segundos, buf.duration);
  fuente.buffer = buf; fuente.connect(vol); vol.connect(destino || ac.destination);
  vol.gain.setValueAtTime(0, t0); vol.gain.linearRampToValueAtTime(0.85, t0 + 0.3); vol.gain.setValueAtTime(0.85, t0 + Math.max(0.4, fin - 1.5)); vol.gain.linearRampToValueAtTime(0, t0 + fin);
  fuente.start(t0); fuente.stop(t0 + fin + 0.05);
  return () => { try { vol.gain.cancelScheduledValues(ac.currentTime); vol.gain.setTargetAtTime(0, ac.currentTime, 0.04); fuente.stop(ac.currentTime + 0.2); } catch { /* ya había terminado */ } };
}

/* ── la pieza en video: para TikTok, Reels y Shorts, que piden movimiento ──
   Los videos de la galería ya vienen hechos (public/videos/, con scripts/videos-compartir.mjs). Esto graba en el navegador
   cualquier otra combinación: otra medida, otro fondo, otra música o una frase propia. MP4 donde se puede; si no, WebM. */
const TIPOS_VIDEO = ['video/mp4;codecs="avc1.640028,mp4a.40.2"', 'video/mp4;codecs="avc1.42E01F,mp4a.40.2"', 'video/mp4;codecs=avc1.640028', 'video/mp4;codecs=avc1.42E01F', 'video/mp4', 'video/webm;codecs=vp9,opus', 'video/webm;codecs=vp8,opus', 'video/webm'];
export const tipoDeVideo = (conAudio = false) => { try { const lista = conAudio ? TIPOS_VIDEO : [...TIPOS_VIDEO.filter((t) => !/mp4a|opus/.test(t)), ...TIPOS_VIDEO]; return (window.MediaRecorder && HTMLCanvasElement.prototype.captureStream && lista.find((t) => MediaRecorder.isTypeSupported(t))) || ''; } catch { return ''; } };
export async function grabarVideo(lienzo, receta, alAvance = () => {}, { musica = '' } = {}) {
  const tipo = tipoDeVideo(!!musica); if (!tipo) throw new Error('Este navegador no puede grabar video. Prueba con Chrome o Safari.');
  await cargarLetras(); const D = duracionDe(receta);
  pintar(lienzo, receta, { momento: 0 });
  const flujo = lienzo.captureStream(30); let pistas = flujo.getVideoTracks(), salida = null;
  if (musica) { await cargarMusica(musica); salida = contexto().createMediaStreamDestination(); pistas = [...pistas, ...salida.stream.getAudioTracks()]; }
  const grabadora = new MediaRecorder(new MediaStream(pistas), { mimeType: tipo, videoBitsPerSecond: 8e6, audioBitsPerSecond: 160000 }), trozos = [];
  grabadora.ondataavailable = (e) => { if (e.data && e.data.size) trozos.push(e.data); };
  const listo = new Promise((ok, mal) => { grabadora.onstop = ok; grabadora.onerror = (e) => mal(e.error || new Error('No se pudo grabar')); });
  let callar = null; if (musica) callar = await sonar(musica, D, salida);
  grabadora.start(); const t0 = performance.now();
  await new Promise((ok) => {
    const cuadro = () => { const t = (performance.now() - t0) / 1000; pintar(lienzo, receta, { momento: Math.min(t, D) }); alAvance(Math.min(1, t / D)); if (t >= D + 0.12) ok(); else if (document.hidden) setTimeout(cuadro, 33); else requestAnimationFrame(cuadro); };
    cuadro();
  });
  grabadora.stop(); await listo; callar?.(); flujo.getTracks().forEach((p) => p.stop());
  pintar(lienzo, receta);   // el lienzo vuelve a quedar como la imagen fija
  const mp4 = tipo.startsWith('video/mp4');
  return { blob: new Blob(trozos, { type: mp4 ? 'video/mp4' : 'video/webm' }), ext: mp4 ? 'mp4' : 'webm', segundos: D };
}
// Dónde vive el video ya hecho de una frase (solo los de la galería: historia, fondo blanco, tal cual)
export const videoHecho = (id, conAudio) => `/videos/${id}${conAudio ? '-audio' : ''}.mp4`;

/* ── el perfil (todas las redes lo recortan en círculo) y el logotipo suelto ── */
export const PERFILES = [{ id: 'rosa', n: 'Rosa', bg: ROSA, cor: '#ffffff', punto: ROSA }, { id: 'blanco', n: 'Blanco', bg: '#ffffff', cor: ROSA, punto: '#ffffff' }, { id: 'negro', n: 'Negro', bg: '#0e0e0e', cor: ROSA, punto: '#0e0e0e' }];
export function pintarPerfil(lienzo, id = 'rosa', lado = 1080) {
  const P = PERFILES.find((p) => p.id === id) || PERFILES[0]; lienzo.width = lienzo.height = lado; const ctx = lienzo.getContext('2d');
  ctx.fillStyle = P.bg; ctx.fillRect(0, 0, lado, lado); const a = lado * 0.5; corazon(ctx, (lado - a) / 2, (lado - a) / 2 + lado * 0.012, a, P.cor, P.punto); return lienzo;
}
// tinta: 'negro' o 'blanco' (el nombre); el corazón siempre rosa, salvo en 'una' (todo de un color)
export function pintarLogo(lienzo, { tinta = 'negro', solo = false, una = false, alto = 240 } = {}) {
  const color = tinta === 'blanco' ? '#ffffff' : '#111111', ctx = lienzo.getContext('2d'), u = alto / 64, pad = 12 * u;
  const M = medirMarca(ctx, u * 1.25); const w = solo ? M.alto : M.w;
  lienzo.width = Math.ceil(w + pad * 2); lienzo.height = Math.ceil(M.alto + pad * 2);
  const K = { cor: una ? color : ROSA, punto: una ? 'transparent' : '#ffffff', tx: color };
  if (solo) { corazon(ctx, pad, pad, M.alto, K.cor, null); if (!una) { ctx.fillStyle = '#fff'; ctx.beginPath(); ctx.arc(pad + M.alto / 2, pad + M.alto * 0.375, M.alto * 0.1, 0, 7); ctx.fill(); } else { ctx.globalCompositeOperation = 'destination-out'; ctx.beginPath(); ctx.arc(pad + M.alto / 2, pad + M.alto * 0.375, M.alto * 0.1, 0, 7); ctx.fill(); ctx.globalCompositeOperation = 'source-over'; } return lienzo; }
  corazon(ctx, pad, pad, M.alto, K.cor, null);
  ctx.globalCompositeOperation = 'destination-out'; ctx.beginPath(); ctx.arc(pad + M.alto / 2, pad + M.alto * 0.375, M.alto * 0.1, 0, 7); ctx.fill(); ctx.globalCompositeOperation = 'source-over';
  ctx.font = serif(M.letra); ctx.fillStyle = color; ctx.textBaseline = 'alphabetic'; ctx.fillText(NOMBRE, pad + M.alto + M.hueco, pad + M.alto * 0.5 + M.letra * 0.33);
  return lienzo;
}

// La insignia para páginas: una pastilla con el corazón, del tamaño de un botón de tienda (se pinta al doble). Tres colores: clara, oscura y rosa.
export function pintarInsignia(lienzo, color = 'clara', esc = 2) {
  const C = { clara: { bg: '#ffffff', tx: '#111111', sub: '#5a5a5a', orilla: '#111111', cor: ROSA }, oscura: { bg: '#0e0e0e', tx: '#ffffff', sub: '#b4b4b4', orilla: '#4a4a4a', cor: ROSA }, rosa: { bg: ROSA, tx: '#ffffff', sub: 'rgba(255,255,255,.9)', orilla: ROSA, cor: '#ffffff' } }[color === 'negro' ? 'clara' : color === 'blanco' ? 'oscura' : color] || null;
  const K = C || { bg: '#ffffff', tx: '#111111', sub: '#5a5a5a', orilla: '#111111', cor: ROSA }, W = 292, H = 72;
  lienzo.width = W * esc; lienzo.height = H * esc; const ctx = lienzo.getContext('2d'); ctx.setTransform(esc, 0, 0, esc, 0, 0);
  ctx.beginPath(); if (ctx.roundRect) ctx.roundRect(1, 1, W - 2, H - 2, 16); else ctx.rect(1, 1, W - 2, H - 2);
  ctx.fillStyle = K.bg; ctx.fill(); ctx.strokeStyle = K.orilla; ctx.lineWidth = 1.5; ctx.stroke();
  corazon(ctx, 18, 17, 38, K.cor, K.bg);
  ctx.textBaseline = 'alphabetic'; ctx.textAlign = 'left';
  ctx.font = sans(11.5, 600); ctx.fillStyle = K.sub; ctx.fillText('Encuentra a tu pareja en', 68, 28);
  ctx.font = serif(21.5); ctx.fillStyle = K.tx; ctx.fillText(NOMBRE, 67, 53);
  return lienzo;
}

/* ── de receta a archivo ─────────────────────────────────────────────────── */
export const aBlob = (lienzo, tipo = 'image/png', calidad) => new Promise((ok, mal) => lienzo.toBlob((b) => (b ? ok(b) : mal(new Error('No se pudo armar la imagen'))), tipo, calidad));
// Para los paquetes: la imagen sale en el momento, sin esperar turno. (toBlob espera a que el navegador esté desocupado,
// y con la pestaña atrás eso tarda un segundo por imagen; con trescientas piezas, no se acaba nunca.)
export function aBytes(lienzo) { const bin = atob(lienzo.toDataURL('image/png').split(',')[1]), u = new Uint8Array(bin.length); for (let i = 0; i < bin.length; i++) u[i] = bin.charCodeAt(i); return u; }
export async function aPng(receta) { await cargarLetras(); return aBlob(pintar(document.createElement('canvas'), receta)); }
const limpio = (t) => String(t).normalize('NFD').replace(/[̀-ͯ]/g, '').toLowerCase().replace(/[^a-z0-9]+/g, '-').replace(/^-|-$/g, '').slice(0, 40);
export function nombreDe(receta) {
  const R = completar(receta), F = FORMATO[R.formato];
  return `Cupido_${receta.frase || limpio(sinMarcas(R.n ? R.n + ' ' + R.t : R.t)) || 'pieza'}_${F.id}_${F.w}x${F.h}${R.fondo !== 'blanco' ? '_' + R.fondo : ''}.png`;
}
// El sello de los paquetes: versión + fecha y hora al minuto
export const sello = (d = new Date()) => { const p = (n) => String(n).padStart(2, '0'); return `${d.getFullYear()}-${p(d.getMonth() + 1)}-${p(d.getDate())}_${p(d.getHours())}${p(d.getMinutes())}`; };

/* ── un zip sin comprimir (los PNG ya vienen comprimidos) ────────────────── */
const TABLA = (() => { const t = new Uint32Array(256); for (let n = 0; n < 256; n++) { let c = n; for (let k = 0; k < 8; k++) c = c & 1 ? 0xedb88320 ^ (c >>> 1) : c >>> 1; t[n] = c >>> 0; } return t; })();
const crc32 = (b) => { let c = 0xffffffff; for (let i = 0; i < b.length; i++) c = TABLA[(c ^ b[i]) & 255] ^ (c >>> 8); return (c ^ 0xffffffff) >>> 0; };
export function zip(archivos) {   // [{ nombre, datos: Uint8Array }]
  const partes = [], central = []; let pos = 0; const txt = new TextEncoder();
  for (const a of archivos) {
    const n = txt.encode(a.nombre), crc = crc32(a.datos), cab = new DataView(new ArrayBuffer(30));
    cab.setUint32(0, 0x04034b50, true); cab.setUint16(4, 20, true); cab.setUint16(6, 0x0800, true); cab.setUint32(14, crc, true); cab.setUint32(18, a.datos.length, true); cab.setUint32(22, a.datos.length, true); cab.setUint16(26, n.length, true);
    const cen = new DataView(new ArrayBuffer(46)); cen.setUint32(0, 0x02014b50, true); cen.setUint16(4, 20, true); cen.setUint16(6, 20, true); cen.setUint16(8, 0x0800, true); cen.setUint32(16, crc, true); cen.setUint32(20, a.datos.length, true); cen.setUint32(24, a.datos.length, true); cen.setUint16(28, n.length, true); cen.setUint32(42, pos, true);
    partes.push(cab, n, a.datos); central.push(cen, n); pos += 30 + n.length + a.datos.length;
  }
  const tam = central.reduce((s, x) => s + x.byteLength, 0), fin = new DataView(new ArrayBuffer(22));
  fin.setUint32(0, 0x06054b50, true); fin.setUint16(8, archivos.length, true); fin.setUint16(10, archivos.length, true); fin.setUint32(12, tam, true); fin.setUint32(16, pos, true);
  return new Blob([...partes, ...central, fin], { type: 'application/zip' });
}

/* ── el código QR: hecho aquí, sin librerías (bytes, corrección M, versiones 1 a 10) ── */
const QR_V = [0, [26, 10, 1, 16], [44, 16, 1, 28], [70, 26, 1, 44], [100, 18, 2, 32], [134, 24, 2, 43], [172, 16, 4, 27], [196, 18, 4, 31], [242, 22, 2, 38, 2, 39], [292, 22, 3, 36, 2, 37], [346, 26, 4, 43, 1, 44]];
const QR_AL = [0, [], [6, 18], [6, 22], [6, 26], [6, 30], [6, 34], [6, 22, 38], [6, 24, 42], [6, 26, 46], [6, 28, 50]];
const QRS = new Map();
export function qr(texto) { if (!QRS.has(texto)) QRS.set(texto, armarQr(texto)); return QRS.get(texto); }
function armarQr(texto) {
  const datos = [...new TextEncoder().encode(texto)];
  let v = 1; const cabe = (n) => { const d = QR_V[n]; return d[2] * d[3] + (d[4] || 0) * (d[5] || 0); };
  while (v <= 10 && datos.length > Math.floor((cabe(v) * 8 - 4 - (v < 10 ? 8 : 16)) / 8)) v++;
  if (v > 10) return null;
  const d = QR_V[v], total = cabe(v), n = 17 + v * 4;
  // 1. bits: modo, cuenta, datos, terminador y relleno
  const bits = []; const mete = (val, len) => { for (let i = len - 1; i >= 0; i--) bits.push((val >> i) & 1); };
  mete(4, 4); mete(datos.length, v < 10 ? 8 : 16); for (const b of datos) mete(b, 8);
  mete(0, Math.min(4, total * 8 - bits.length)); while (bits.length % 8) bits.push(0);
  const cw = []; for (let i = 0; i < bits.length; i += 8) cw.push(bits.slice(i, i + 8).reduce((a, b) => a * 2 + b, 0));
  for (let i = 0; cw.length < total; i++) cw.push(i % 2 ? 0x11 : 0xec);
  // 2. Reed-Solomon sobre GF(256)
  const EXP = new Uint8Array(512), LOG = new Uint8Array(256);
  for (let i = 0, x = 1; i < 255; i++) { EXP[i] = x; LOG[x] = i; x <<= 1; if (x & 256) x ^= 0x11d; }
  for (let i = 255; i < 512; i++) EXP[i] = EXP[i - 255];
  const mul = (a, b) => (a && b ? EXP[LOG[a] + LOG[b]] : 0);
  let gen = [1]; for (let i = 0; i < d[1]; i++) { const g = new Array(gen.length + 1).fill(0); for (let j = 0; j < gen.length; j++) { g[j] ^= gen[j]; g[j + 1] ^= mul(gen[j], EXP[i]); } gen = g; }
  const ecc = (blo) => { const r = new Array(d[1]).fill(0); for (const b of blo) { const f = b ^ r.shift(); r.push(0); for (let j = 0; j < d[1]; j++) r[j] ^= mul(gen[j + 1], f); } return r; };
  const bloques = [], ecs = []; let p = 0;
  for (let g = 2; g < d.length; g += 2) for (let i = 0; i < d[g]; i++) { const b = cw.slice(p, p + d[g + 1]); p += d[g + 1]; bloques.push(b); ecs.push(ecc(b)); }
  const fin = [];
  for (let i = 0; i < Math.max(...bloques.map((b) => b.length)); i++) for (const b of bloques) if (i < b.length) fin.push(b[i]);
  for (let i = 0; i < d[1]; i++) for (const e of ecs) fin.push(e[i]);
  // 3. matriz: patrones fijos
  const M = Array.from({ length: n }, () => new Int8Array(n).fill(-1)), fijo = Array.from({ length: n }, () => new Uint8Array(n));
  const pon = (x, y, val) => { if (x >= 0 && y >= 0 && x < n && y < n) { M[y][x] = val ? 1 : 0; fijo[y][x] = 1; } };
  const ojo = (cx, cy) => { for (let y = -4; y <= 4; y++) for (let x = -4; x <= 4; x++) { const mm = Math.max(Math.abs(x), Math.abs(y)); pon(cx + x, cy + y, mm !== 2 && mm !== 4); } };
  ojo(3, 3); ojo(n - 4, 3); ojo(3, n - 4);
  for (let i = 8; i < n - 8; i++) { pon(i, 6, i % 2 === 0); pon(6, i, i % 2 === 0); }
  const al = QR_AL[v];
  for (const ay of al) for (const ax of al) { if ((ax === 6 && ay === 6) || (ax === 6 && ay === n - 7) || (ax === n - 7 && ay === 6)) continue; for (let y = -2; y <= 2; y++) for (let x = -2; x <= 2; x++) pon(ax + x, ay + y, Math.max(Math.abs(x), Math.abs(y)) !== 1); }
  pon(8, n - 8, 1);
  for (let i = 0; i < 9; i++) { if (!fijo[8][i]) pon(i, 8, 0); if (!fijo[i][8]) pon(8, i, 0); }
  for (let i = 0; i < 8; i++) { pon(n - 1 - i, 8, 0); if (i < 7) pon(8, n - 1 - i, 0); }
  if (v >= 7) {
    let r = v; for (let i = 0; i < 12; i++) r = (r << 1) ^ ((r >> 11) * 0x1f25);
    const info = (v << 12) | r;
    for (let i = 0; i < 18; i++) { const b = (info >> i) & 1, a = n - 11 + (i % 3), c = Math.floor(i / 3); pon(a, c, b); pon(c, a, b); }
  }
  // 4. datos en zigzag
  let k = 0; const nb = fin.length * 8;
  for (let x = n - 1, sube = true; x > 0; x -= 2, sube = !sube) {
    if (x === 6) x--;
    for (let i = 0; i < n; i++) { const y = sube ? n - 1 - i : i; for (const xx of [x, x - 1]) if (!fijo[y][xx]) { M[y][xx] = k < nb ? (fin[k >> 3] >> (7 - (k & 7))) & 1 : 0; k++; } }
  }
  // 5. la máscara que menos castigo recibe
  const MASC = [(x, y) => (x + y) % 2 === 0, (x, y) => y % 2 === 0, (x) => x % 3 === 0, (x, y) => (x + y) % 3 === 0, (x, y) => (Math.floor(y / 2) + Math.floor(x / 3)) % 2 === 0, (x, y) => ((x * y) % 2) + ((x * y) % 3) === 0, (x, y) => (((x * y) % 2) + ((x * y) % 3)) % 2 === 0, (x, y) => (((x + y) % 2) + ((x * y) % 3)) % 2 === 0];
  const arma = (mk) => {
    const R = M.map((f, y) => Array.from(f, (val, x) => (fijo[y][x] ? val : val ^ (MASC[mk](x, y) ? 1 : 0))));
    let r = mk; for (let i = 0; i < 10; i++) r = (r << 1) ^ ((r >> 9) * 0x537);   // nivel M = 00
    const fmt = ((mk << 10) | r) ^ 0x5412;
    for (let i = 0; i < 15; i++) {
      const b = (fmt >> i) & 1;
      if (i < 6) R[i][8] = b; else if (i < 8) R[i + 1][8] = b; else R[8][i === 8 ? 7 : 14 - i] = b;
      if (i < 8) R[8][n - 1 - i] = b; else R[n - 15 + i][8] = b;
    }
    return R;
  };
  const castigo = (R) => {
    let s = 0;
    for (let y = 0; y < n; y++) for (const lin of [R[y], R.map((f) => f[y])]) {
      let c = 1; for (let x = 1; x <= n; x++) { if (x < n && lin[x] === lin[x - 1]) c++; else { if (c >= 5) s += c - 2; c = 1; } }
      const t = lin.join(''); for (let i = 0; i + 11 <= n; i++) { const uu = t.substr(i, 11); if (uu === '10111010000' || uu === '00001011101') s += 40; }
    }
    for (let y = 0; y < n - 1; y++) for (let x = 0; x < n - 1; x++) if (R[y][x] === R[y][x + 1] && R[y][x] === R[y + 1][x] && R[y][x] === R[y + 1][x + 1]) s += 3;
    const osc = R.reduce((a, f) => a + f.reduce((b, c) => b + c, 0), 0);
    return s + Math.floor(Math.abs(osc * 20 - n * n * 10) / (n * n)) * 10;
  };
  let mejor = null, minimo = Infinity;
  for (let mk = 0; mk < 8; mk++) { const R = arma(mk), c = castigo(R); if (c < minimo) { minimo = c; mejor = R; } }
  return mejor;
}
// El código siempre va en negro sobre una ficha blanca: así lo lee cualquier cámara, sea cual sea el fondo
function pintarQr(ctx, Q, x, y, lado, K) {
  const n = Q.length, orilla = 2, celda = lado / (n + orilla * 2);
  ctx.fillStyle = '#ffffff'; ctx.beginPath(); if (ctx.roundRect) ctx.roundRect(x, y, lado, lado, lado * 0.06); else ctx.rect(x, y, lado, lado); ctx.fill();
  if (K.bg === '#ffffff') { ctx.strokeStyle = '#e6e6e6'; ctx.lineWidth = 1.5; ctx.stroke(); }
  ctx.fillStyle = '#111111';
  for (let j = 0; j < n; j++) for (let i = 0; i < n; i++) if (Q[j][i]) ctx.fillRect(x + (i + orilla) * celda, y + (j + orilla) * celda, celda + 0.4, celda + 0.4);
}
// Un código suelto, para imprimir o pegar en un video
export function pintarCodigo(lienzo, texto, lado = 1024) {
  const Q = qr(texto); lienzo.width = lienzo.height = lado; const ctx = lienzo.getContext('2d'); ctx.fillStyle = '#fff'; ctx.fillRect(0, 0, lado, lado);
  if (!Q) return lienzo; const n = Q.length, celda = Math.floor(lado / (n + 6)), o = Math.round((lado - celda * n) / 2); ctx.fillStyle = '#111';
  for (let j = 0; j < n; j++) for (let i = 0; i < n; i++) if (Q[j][i]) ctx.fillRect(o + i * celda, o + j * celda, celda, celda);
  return lienzo;
}
