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

   Cada frase está cotejada contra lo que Cupido hace de verdad (ver
   docs/COMPARTIR.md). Si el producto cambia, la frase se cambia o se quita.
   ───────────────────────────────────────────────────────────────────────────── */
const _RLR = 'Ricardo López Reyero', _k = 'EYE', _rev = 181218;

export const CASA = 'cupido.capitaltorreon.com';
export const NOMBRE = 'Cupido Algorítmico';
export const ROSA = '#d6455f';

/* ── las series: de qué habla cada frase ─────────────────────────────────── */
export const SERIES = [
  { id: 'ella', n: 'Ellas mandan', d: 'La regla de la casa: aquí manda ella.' },
  { id: 'contrario', n: 'Lo contrario', d: 'Todo lo contrario a lo que conoces de citas.' },
  { id: 'noventa', n: 'El 90 %', d: 'Solo avisamos cuando dos personas cruzan el 90 %.' },
  { id: 'puerta', n: 'Dos síes', d: 'La puerta se abre solo si los dos quieren.' },
  { id: 'limpio', n: 'Sin publicidad', d: 'Ni anuncios ni ventajas compradas. Gratis en 2026 y 2027.' },
  { id: 'serio', n: 'En serio', d: 'Para quien busca en serio.' },
  { id: 'el', n: 'Para él', d: 'Lo que un hombre encuentra aquí si es honesto y llena todo.' },
  { id: 'invitar', n: 'Para invitar', d: 'Entre más somos, más fácil que cada quien encuentre.' },
];

/* ── las frases ───────────────────────────────────────────────────────────
   t = la frase (\n parte el renglón, *así* va en cursiva, ~así~ va tachado)
   e = la explicación en letra chica (se puede apagar)
   n = el número gigante, cuando la pieza es un número
   c = el acomodo de inicio: arriba, abajo o centro                        */
export const FRASES = [
  // Ellas mandan
  { id: 'mandan', s: 'ella', c: 'arriba', t: 'Las mujeres\nmandan.', e: 'Es la regla de la casa. Los hombres son bienvenidos, y entran aceptándola.' },
  { id: 'manda-ella', s: 'ella', c: 'abajo', t: 'Aquí\nmanda ella.', e: 'Segura, cómoda y en control.' },
  { id: 'bloquea', s: 'ella', c: 'arriba', t: 'Si ella bloquea, queda bloqueado.', e: 'Al instante y sin dar explicaciones.' },
  { id: 'su-foto', s: 'ella', c: 'abajo', t: 'Su foto la enseña ella. *Cuando quiera.*', e: 'Abrir una puerta no entrega su foto, su voz ni su video.' },
  { id: 'sin-tu-si', s: 'ella', c: 'arriba', t: 'Nadie te ve.\nNadie te escribe\nsin tu sí.', e: 'No hay perfiles que navegar. La charla nace solo con dos síes.' },
  { id: 'insistir', s: 'ella', c: 'centro', t: 'Él no puede insistir.', e: 'Cinco mensajes seguidos sin respuesta y le toca esperar.' },
  { id: 'no-obliga', s: 'ella', c: 'abajo', t: 'Decir que sí *no te obliga* a nada.', e: 'Cierras la puerta cuando quieras, sin dar un motivo.' },
  { id: 'diez', s: 'ella', c: 'arriba', n: '10', t: 'mujeres lo bloquean y queda fuera. Para siempre.', e: 'Diez mujeres distintas, con las que la puerta sí se abrió.' },
  { id: 'en-control', s: 'ella', c: 'arriba', t: 'Segura.\nCómoda.\nEn control.', e: 'Así busca pareja una mujer aquí.' },
  { id: 'discreta', s: 'ella', c: 'centro', t: 'Él no ve si estás en línea. *Ni si ya leíste.*', e: 'Se llama modo discreta, y lo enciendes tú.' },

  // Lo contrario
  { id: 'pareja-ideal', s: 'contrario', c: 'centro', t: 'Encuentra a tu pareja ideal.', e: 'Todo lo contrario a lo que conoces de citas.' },
  { id: 'no-app', s: 'contrario', c: 'abajo', t: 'No es una app de citas.', e: 'Es un sistema de detección de parejas.' },
  { id: 'lo-contrario', s: 'contrario', c: 'arriba', t: 'Todo lo contrario a lo que conoces de citas.', e: 'Sin perfiles, sin deslizar y sin anuncios.' },
  { id: 'responder', s: 'contrario', c: 'arriba', t: '~Deslizar.~\nResponder.', e: '43 preguntas, una sola vez.' },
  { id: 'tres-sin', s: 'contrario', c: 'arriba', t: 'Sin perfiles.\nSin deslizar.\nSin anuncios.', e: 'Y gratis en 2026 y 2027.' },
  { id: 'por-foto', s: 'contrario', c: 'abajo', t: 'No vienes a que te escojan *por una foto.*', e: 'Primero su carta. Al final, su foto.' },
  { id: 'te-vayas', s: 'contrario', c: 'centro', t: 'Hecho para que encuentres a alguien *y te vayas.*', e: 'Cupido no gana nada con que te quedes más tiempo.' },
  { id: 'catalogo', s: 'contrario', c: 'centro', t: 'Una persona.\n*No un catálogo.*', e: 'Aquí no hay una lista de gente para escoger.' },
  { id: 'mejor-foto', s: 'contrario', c: 'abajo', t: '~La mejor foto.~\nLa mejor respuesta.', e: 'Lo primero que se conoce de ti es lo que piensas.' },
  { id: 'embone', s: 'contrario', c: 'arriba', t: 'No buscas a alguien perfecto. Buscas a alguien *que embone contigo.*', e: 'Por eso el corte es 90 %, no 100.' },

  // El 90 %
  { id: 'noventa', s: 'noventa', c: 'arriba', n: '90 %', t: 'Abajo de eso, silencio.', e: 'Arriba, les avisamos a los dos al mismo tiempo.' },
  { id: 'avisamos', s: 'noventa', c: 'abajo', t: 'Solo te avisamos arriba del 90 %.', e: 'Si alguien cruza el 90 % contigo, les avisamos a los dos.' },
  { id: 'silencio', s: 'noventa', c: 'centro', t: 'El silencio también es una respuesta.', e: 'Si nadie cruza el 90 % contigo, no te hacemos perder el tiempo.' },
  { id: 'cuarenta-tres', s: 'noventa', c: 'arriba', n: '43', t: 'preguntas. Una sola vez.', e: 'Lo que eres y lo que necesitas. Con ejemplos, no con adjetivos.' },
  { id: 'al-reves', s: 'noventa', c: 'arriba', t: 'Lo que tú necesitas contra lo que la otra persona da. *Y al revés.*', e: 'El motor cruza en las dos direcciones.' },
  { id: 'para-uno', s: 'noventa', c: 'centro', t: 'Si solo funciona para uno, no funciona.', e: 'Tiene que embonar de ida y de vuelta.' },
  { id: 'anos', s: 'noventa', c: 'abajo', t: 'Menos años con las personas incorrectas.', e: 'Abajo del 90 %, silencio.' },
  { id: 'embona', s: 'noventa', c: 'arriba', t: 'No te mandamos gente. Te avisamos *cuando alguien embona.*', e: 'Y solo arriba del 90 %.' },

  // Dos síes
  { id: 'dos-sies', s: 'puerta', c: 'abajo', t: 'La puerta solo se abre con dos síes.', e: 'El tuyo y el de la otra persona.' },
  { id: 'dijo-no', s: 'puerta', c: 'centro', t: 'Si dijo que no, *nunca te enteras.*', e: 'Y si tú dices que no, tampoco se entera nadie.' },
  { id: 'carta-foto', s: 'puerta', c: 'arriba', t: 'Primero su carta.\nAl final, su foto.', e: 'Conoces a la persona antes que a su foto.' },
  { id: 'piensa', s: 'puerta', c: 'abajo', t: 'Primero lo que piensa. Después, cómo se ve.', e: 'Así se abre una puerta en Cupido.' },
  { id: 'dos', s: 'puerta', c: 'arriba', n: '2', t: 'síes. Ni uno menos.', e: 'La charla nace únicamente cuando los dos dijeron que sí.' },
  { id: 'a-tu-ritmo', s: 'puerta', c: 'centro', t: 'Tu perfil se comparte por partes. *A tu ritmo.*', e: 'Elemento por elemento, y con tu confirmación.' },

  // Sin publicidad
  { id: 'sin-publicidad', s: 'limpio', c: 'arriba', t: 'Aquí no hay publicidad.\nNi una.\nNi la habrá.', e: '' },
  { id: 'producto', s: 'limpio', c: 'centro', t: 'Quien busca pareja no debería ser *el producto de nadie.*', e: 'Por eso aquí no hay publicidad.' },
  { id: 'primero', s: 'limpio', c: 'abajo', t: 'Nadie paga por aparecer primero.', e: 'No hay impulsos ni lugares comprados.' },
  { id: 'no-se-venden', s: 'limpio', c: 'centro', t: 'Tus respuestas no se venden.', e: 'Lo íntimo solo lo lee el motor.' },
  { id: 'gratis', s: 'limpio', c: 'arriba', t: 'Gratis en 2026\ny 2027.', e: 'Todo Cupido, sin letra chica.' },
  { id: 'algoritmo', s: 'limpio', c: 'abajo', t: 'El algoritmo no se compra.', e: 'El 90 % es el 90 % para todos.' },
  { id: 'cero', s: 'limpio', c: 'arriba', t: 'Cero anuncios.\nHoy y siempre.', e: 'Ni banners, ni «patrocinados», ni marcas metidas en tu charla.' },
  { id: 'tres-sin-2', s: 'limpio', c: 'abajo', t: 'Sin anuncios.\nSin contraseña.\nSin letra chica.', e: 'Entras con tu correo, y todo es gratis en 2026 y 2027.' },

  // En serio
  { id: 'en-serio', s: 'serio', c: 'centro', t: 'Para quien busca *en serio.*', e: '' },
  { id: 'verdad', s: 'serio', c: 'arriba', t: 'Responde con la verdad. Lo demás lo hace el motor.', e: '43 preguntas, una sola vez.' },
  { id: 'ejemplos', s: 'serio', c: 'abajo', t: 'Con ejemplos, no con adjetivos.', e: 'Así se responden las 43 preguntas.' },
  { id: 'trabajo', s: 'serio', c: 'arriba', t: 'Buscar pareja no debería sentirse como *un segundo trabajo.*', e: '' },
  { id: 'de-cero', s: 'serio', c: 'centro', t: '¿Otra vez empezar de cero?', e: 'Aquí respondes una sola vez. El motor sigue buscando por ti.' },
  { id: 'mejor', s: 'serio', c: 'abajo', t: 'No busques más.\n*Busca mejor.*', e: '' },
  { id: 'ningun-lado', s: 'serio', c: 'arriba', t: 'Menos conversaciones que no van a ningún lado.', e: 'Una charla se abre solo cuando los dos cruzan el 90 % y los dos dicen que sí.' },
  { id: 'una-vez', s: 'serio', c: 'centro', t: 'Lo cuentas una vez. *Y bien.*', e: '43 preguntas: lo que eres y lo que necesitas.' },

  // Para él
  { id: 'verdad-gana', s: 'el', c: 'arriba', t: 'Aquí no gana la mejor foto. *Gana la verdad.*', e: 'El motor cruza respuestas, no fotos.' },
  { id: 'llena-todo', s: 'el', c: 'abajo', t: 'Llena todo.\nDi la verdad.\nEl motor hace lo demás.', e: 'Entre más completo, mejor te presenta.' },
  { id: 'seguras', s: 'el', c: 'centro', t: 'Donde ellas se sienten seguras, *contestan en serio.*', e: 'Por eso aquí manda ella. No es en tu contra.' },
  { id: 'no-compites', s: 'el', c: 'arriba', t: 'No compites con nadie. O embonas, o no.', e: 'Nadie paga por aparecer primero.' },
  { id: 'bienvenidos', s: 'el', c: 'abajo', t: 'Hombres, bienvenidos. Con una regla: *manda ella.*', e: '' },
  { id: 'sin-posar', s: 'el', c: 'centro', t: 'No hace falta posar. Hace falta ser claro.', e: 'Con ejemplos, no con adjetivos.' },

  // Para invitar
  { id: 'compartas', s: 'invitar', c: 'arriba', t: 'Entre más compartas, más nos ayudas a todos a encontrar a la pareja ideal.', e: '' },
  { id: 'enterarse', s: 'invitar', c: 'abajo', t: 'Compártelo. Tu pareja ideal *también tiene que enterarse.*', e: '' },
  { id: 'pasaselo', s: 'invitar', c: 'centro', t: 'Alguien que quieres lleva tiempo buscando. *Pásaselo.*', e: '' },
  { id: 'cada-persona', s: 'invitar', c: 'arriba', t: 'Cada persona seria que entra sube las probabilidades de todos.', e: 'También las tuyas.' },
  { id: 'ya-encontraste', s: 'invitar', c: 'centro', t: '¿Tú ya encontraste? Ayuda a alguien a encontrar.', e: 'Compartir Cupido no cuesta nada.' },
  { id: 'conoces', s: 'invitar', c: 'abajo', t: '¿Conoces a alguien que busca en serio?', e: 'Esto es para esa persona.' },
  { id: 'amiga', s: 'invitar', c: 'arriba', t: 'Mándaselo a tu amiga, la que ya se cansó de las apps.', e: '' },
  { id: 'mas-somos', s: 'invitar', c: 'abajo', t: 'Entre más somos, más fácil que cada quien encuentre a su persona.', e: '' },
];
export const FRASE = Object.fromEntries(FRASES.map((f) => [f.id, f]));

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
// Acomoda los renglones en el ancho dado. Devuelve null si una sola palabra no cabe.
function acomodar(ctx, parrafos, tam, ancho, peso = 600) {
  const filas = []; const tinta = 'letterSpacing' in ctx; if (tinta) ctx.letterSpacing = `${(APRIETE * tam).toFixed(2)}px`;
  ctx.font = serif(tam, false, peso); const espacio = (ctx.measureText(' ').width || tam * 0.24) * 1.06;
  for (const palabras of parrafos) {
    let fila = { p: [], w: 0 };
    for (const p of palabras) {
      ctx.font = serif(tam, p.cursiva, peso); const w = ctx.measureText(p.t).width;
      if (w > ancho) { if (tinta) ctx.letterSpacing = '0px'; return null; }
      if (fila.p.length && fila.w + espacio + w > ancho) { filas.push(fila); fila = { p: [], w: 0 }; }
      const x = fila.p.length ? fila.w + espacio : 0; fila.p.push({ ...p, x, w }); fila.w = x + w;
    }
    filas.push(fila);
  }
  if (tinta) ctx.letterSpacing = '0px';
  return filas;
}
const INTERLINEA = 1.07, SUBE = 0.78, BAJA = 0.2;
const altoDe = (filas, tam) => (filas.length - 1) * tam * INTERLINEA + tam * (SUBE + BAJA);
// La letra más grande que quepa en la caja; y luego renglones parejos (que no quede una palabra sola al final).
function ajustar(ctx, parrafos, tope, minimo, ancho, alto, peso = 600) {
  const cabe = (tam, enteros) => { const f = acomodar(ctx, parrafos, tam, ancho, peso); return !!f && altoDe(f, tam) <= alto && (!enteros || f.length === parrafos.length); };
  const busca = (enteros) => {   // la letra más grande que cabe: si cabe a un tamaño, cabe a cualquiera menor
    if (cabe(tope, enteros)) return Math.round(tope);
    if (!cabe(minimo, enteros)) return 0;
    let lo = minimo, hi = tope; while (hi - lo > 1) { const mid = (lo + hi) / 2; if (cabe(mid, enteros)) lo = mid; else hi = mid; }
    return Math.floor(lo);
  };
  // Si la frase viene partida a mano, cada renglón se queda entero mientras la letra no tenga que achicarse demasiado
  const libre = busca(false), entero = parrafos.length > 1 ? busca(true) : 0;
  let tam = entero && entero >= libre * 0.6 ? entero : libre || minimo;
  let filas = acomodar(ctx, parrafos, tam, ancho, peso) || acomodar(ctx, parrafos, tam, 1e6, peso);
  if (filas.length > parrafos.length) {   // hay renglones partidos por el ancho: se emparejan, para que no quede una palabra sola
    let lo = Math.max(...filas.flatMap((f) => f.p.map((p) => p.w))), hi = ancho;
    for (let i = 0; i < 14 && hi - lo > 2; i++) { const mid = (lo + hi) / 2, f = acomodar(ctx, parrafos, tam, mid, peso); if (f && f.length <= filas.length) hi = mid; else lo = mid; }
    filas = acomodar(ctx, parrafos, tam, hi, peso) || filas;
  }
  return { tam, filas, alto: altoDe(filas, tam), ancho: Math.max(...filas.map((f) => f.w)) };
}
function escribir(ctx, bloque, x, y, anchoCaja, alinea, K, peso = 600, anim = null) {   // y = orilla de arriba del bloque
  const { tam, filas } = bloque; const tinta = 'letterSpacing' in ctx;
  ctx.textBaseline = 'alphabetic'; ctx.textAlign = 'left';
  filas.forEach((f, i) => {
    const bx = alinea === 'centro' ? x + (anchoCaja - f.w) / 2 : x, by = y + tam * SUBE + i * tam * INTERLINEA;
    if (tinta) ctx.letterSpacing = `${(APRIETE * tam).toFixed(2)}px`;
    let raya = 1;
    for (const p of f.p) {
      const a = anim ? anim.palabra() : 1; if (p.tachado) raya = a;   // en video, cada palabra entra a su tiempo, subiendo un poco
      ctx.globalAlpha = a; ctx.font = serif(tam, p.cursiva, peso); ctx.fillStyle = p.tachado ? K.tenue : K.tx; ctx.fillText(p.t, bx + p.x, by + (1 - a) * tam * 0.16);
    }
    if (tinta) ctx.letterSpacing = '0px';
    // la raya del tachado corre de la primera a la última palabra tachada del renglón
    const t = f.p.filter((p) => p.tachado);
    if (t.length) { const a = t[0].x, b = t[t.length - 1].x + t[t.length - 1].w; ctx.globalAlpha = raya; ctx.strokeStyle = K.raya; ctx.lineWidth = Math.max(2, tam * 0.07); ctx.lineCap = 'round'; ctx.beginPath(); ctx.moveTo(bx + a - tam * 0.04, by - tam * 0.25); ctx.lineTo(bx + a - tam * 0.04 + (b - a + tam * 0.08) * raya, by - tam * 0.25 - tam * 0.04 * raya); ctx.stroke(); }
    ctx.globalAlpha = 1;
  });
}
// La letra chica: Inter, en gris, con renglones cómodos
function parrafo(ctx, texto, tam, ancho, peso = 500) {
  ctx.font = sans(tam, peso); const filas = []; let fila = '';
  for (const p of String(texto).split(/\s+/)) { const prueba = fila ? fila + ' ' + p : p; if (fila && ctx.measureText(prueba).width > ancho) { filas.push(fila); fila = p; } else fila = prueba; }
  if (fila) filas.push(fila);
  return { tam, filas, alto: filas.length ? (filas.length - 1) * tam * 1.42 + tam * 1.05 : 0, ancho: Math.max(0, ...filas.map((f) => ctx.measureText(f).width)) };
}
function escribirParrafo(ctx, b, x, y, anchoCaja, alinea, color, peso = 500) {
  ctx.font = sans(b.tam, peso); ctx.fillStyle = color; ctx.textBaseline = 'alphabetic'; ctx.textAlign = alinea === 'centro' ? 'center' : 'left';
  b.filas.forEach((f, i) => ctx.fillText(f, alinea === 'centro' ? x + anchoCaja / 2 : x, y + b.tam * 0.86 + i * b.tam * 1.42));
  ctx.textAlign = 'left';
}

/* ── la marca: corazón + nombre ──────────────────────────────────────────── */
function medirMarca(ctx, u) { const alto = 42 * u, letra = 36 * u; ctx.font = serif(letra); return { alto, letra, hueco: 14 * u, w: alto + 14 * u + ctx.measureText(NOMBRE).width }; }
function pintarMarca(ctx, M, x, y, K) {   // y = orilla de arriba
  corazon(ctx, x, y, M.alto, K.cor, K.punto);
  ctx.font = serif(M.letra); ctx.fillStyle = K.tx; ctx.textBaseline = 'alphabetic'; ctx.textAlign = 'left'; ctx.fillText(NOMBRE, x + M.alto + M.hueco, y + M.alto * 0.5 + M.letra * 0.33);
}

/* ── el pintor ────────────────────────────────────────────────────────────
   receta = { frase: 'mandan' } o { t, e, n } · formato · fondo · c (acomodo)
            conE (con explicación) · liga (lo que se lee abajo; '' = sin liga)
            qr (la dirección completa a la que lleva el código; '' = sin código) */
export function completar(receta = {}) {
  const fr = receta.frase ? FRASE[receta.frase] : null;
  return { formato: 'retrato', fondo: 'blanco', liga: CASA, qr: '', conE: true, ...receta,
    t: receta.t ?? fr?.t ?? '', e: receta.conE === false ? '' : (receta.e ?? fr?.e ?? ''), n: receta.n ?? (receta.t == null ? fr?.n : '') ?? '', c: receta.c || fr?.c || 'centro' };
}
// En video: cuándo entra cada cosa (segundos). Las palabras, una por una; luego la letra chica; al final, la marca.
const suave = (x) => { x = Math.max(0, Math.min(1, x)); return 1 - (1 - x) ** 3; };
function tiempos(R) {
  const n = [...partir(R.n), ...partir(R.t)].reduce((s, r) => s + r.length, 0) || 1, inicio = 0.4, paso = Math.min(0.2, 2.5 / n), entra = 0.32;
  const frase = inicio + (n - 1) * paso + entra, sub = frase + 0.12, pie = sub + (R.e ? 0.4 : 0);
  return { n, inicio, paso, entra, sub, pie, total: Math.max(5, pie + 0.6 + 2.6) };
}
export const duracionDe = (receta) => tiempos(completar(receta)).total;
export function pintar(lienzo, receta, { ancho, momento = null } = {}) {
  const R = completar(receta), F = FORMATO[R.formato] || FORMATOS[0], K = FONDO[R.fondo] || FONDOS[0];
  const W = F.w, H = F.h, esc = ancho ? ancho / W : 1, u = F.u;
  const lw = Math.max(1, Math.round(W * esc)), lh = Math.max(1, Math.round(H * esc));
  if (lienzo.width !== lw) lienzo.width = lw; if (lienzo.height !== lh) lienzo.height = lh;   // solo si cambia: en video el lienzo es el mismo cuadro tras cuadro
  const ctx = lienzo.getContext('2d'); ctx.setTransform(lienzo.width / W, 0, 0, lienzo.height / H, 0, 0); ctx.globalAlpha = 1; ctx.globalCompositeOperation = 'source-over';
  ctx.fillStyle = K.bg; ctx.fillRect(0, 0, W, H);
  const m = F.m ?? 0, [x0, y0, x1, y1] = F.caja || [m, m, W - m, H - m], cw = x1 - x0;
  const portada = !FORMATOS.includes(F), c = portada ? 'centro' : R.c, alinea = c === 'centro' ? 'centro' : 'izq';
  const T = momento == null ? null : tiempos(R); let k = 0;
  const anim = T && { palabra: () => suave((momento - T.inicio - (k++) * T.paso) / T.entra), sub: suave((momento - T.sub) / 0.45), pie: suave((momento - T.pie) / 0.55) };

  // el pie: la marca y la dirección (y el código, si se pidió)
  if (anim) ctx.globalAlpha = anim.pie;
  const M = medirMarca(ctx, u), dirTam = 25 * u; ctx.font = sans(dirTam, 500); const dirW = R.liga ? ctx.measureText(R.liga).width : 0;
  const Q = R.qr ? qr(R.qr) : null, qLado = Q ? Math.round((F.w > F.h ? 150 : 168) * u) : 0;
  let pieH, pie;
  if (Q) { pieH = Math.max(qLado, M.alto + 14 * u + dirTam); pie = 'codigo'; }
  else if (alinea === 'centro') { pieH = M.alto + (R.liga ? 14 * u + dirTam : 0); pie = 'centro'; }
  else if (!R.liga || M.w + 40 * u + dirW <= cw) { pieH = M.alto; pie = 'renglon'; }
  else { pieH = M.alto + 14 * u + dirTam; pie = 'pila'; }
  const pieY = y1 - pieH;
  if (pie === 'centro') {
    pintarMarca(ctx, M, x0 + (cw - M.w) / 2, pieY, K);
    if (R.liga) { ctx.font = sans(dirTam, 500); ctx.fillStyle = K.sub; ctx.textAlign = 'center'; ctx.fillText(R.liga, x0 + cw / 2, y1 - dirTam * 0.18); ctx.textAlign = 'left'; }
  } else if (pie === 'renglon') {
    pintarMarca(ctx, M, x0, pieY, K);
    if (R.liga) { ctx.font = sans(dirTam, 500); ctx.fillStyle = K.sub; ctx.textAlign = 'right'; ctx.fillText(R.liga, x1, pieY + M.alto * 0.5 + dirTam * 0.36); ctx.textAlign = 'left'; }
  } else {
    pintarMarca(ctx, M, x0, y1 - (M.alto + (R.liga ? 14 * u + dirTam : 0)), K);
    if (R.liga) { ctx.font = sans(dirTam, 500); ctx.fillStyle = K.sub; ctx.fillText(R.liga, x0, y1 - dirTam * 0.18); }
    if (Q) pintarQr(ctx, Q, x1 - qLado, y1 - qLado, qLado, K);
  }
  ctx.globalAlpha = 1;

  // el cuerpo: la frase (y el número, y la explicación)
  const aire = Math.round((portada ? 30 : 58) * u), arriba = y0, abajo = pieY - aire, alto = abajo - arriba;
  const anchoTexto = F.w > F.h && !portada ? Math.min(cw, cw * 0.86) : cw;
  const subTam = Math.round((portada ? 27 : 34) * u), sub = R.e ? parrafo(ctx, R.e, subTam, Math.min(anchoTexto, subTam * 27)) : null, subHueco = sub ? Math.round(34 * u) : 0;
  const parrafos = partir(R.t); let num = null, numHueco = 0;
  if (R.n) { const topeN = Math.min(alto * (F.w > F.h ? 0.5 : 0.36), cw * 0.62); num = ajustar(ctx, partir(R.n), topeN, 60 * u, cw, topeN * 1.2, 700); numHueco = Math.round(num.tam * 0.02); }
  const libre = alto - (sub ? sub.alto + subHueco : 0) - (num ? num.alto + numHueco : 0);
  const tope = num ? Math.min(num.tam * 0.36, cw * 0.11) : Math.min(cw * (alinea === 'centro' ? 0.168 : 0.2), alto * (F.w > F.h ? 0.3 : 0.2)) * (portada ? 0.82 : 1);
  const frase = parrafos.length ? ajustar(ctx, parrafos, tope, 26 * u, anchoTexto, Math.max(libre * (c === 'centro' ? 0.9 : 1), 40 * u)) : { tam: 0, filas: [], alto: 0, ancho: 0 };
  const total = (num ? num.alto + numHueco : 0) + frase.alto + (sub ? subHueco + sub.alto : 0);
  let y = c === 'arriba' ? arriba : c === 'abajo' ? abajo - total : arriba + (alto - total) / 2;
  if (num) { escribir(ctx, num, x0 - (alinea === 'centro' ? 0 : num.tam * 0.035), y, cw, alinea, K, 700, anim); y += num.alto + numHueco; }
  if (frase.filas.length) { escribir(ctx, frase, x0, y, cw, alinea, K, 600, anim); y += frase.alto; }
  if (sub) { if (anim) ctx.globalAlpha = anim.sub; escribirParrafo(ctx, sub, x0, y + subHueco, cw, alinea, K.sub); ctx.globalAlpha = 1; }
  return lienzo;
}

/* ── la pieza en video: las palabras van llegando. Para TikTok, Reels y Shorts, que piden movimiento ──
   Se graba el mismo lienzo que se ve (MP4 donde el navegador puede; si no, WebM). Va sin sonido: la música la pone cada quien en su red. */
const VIDEOS = ['video/mp4;codecs=avc1.640028', 'video/mp4;codecs=avc1.42E01F', 'video/mp4', 'video/webm;codecs=vp9', 'video/webm;codecs=vp8', 'video/webm'];
export const tipoDeVideo = () => { try { return (window.MediaRecorder && HTMLCanvasElement.prototype.captureStream && VIDEOS.find((t) => MediaRecorder.isTypeSupported(t))) || ''; } catch { return ''; } };
export async function grabarVideo(lienzo, receta, alAvance = () => {}) {
  const tipo = tipoDeVideo(); if (!tipo) throw new Error('Este navegador no puede grabar video. Prueba con Chrome o Safari.');
  await cargarLetras(); const D = duracionDe(receta);
  pintar(lienzo, receta, { momento: 0 });
  const flujo = lienzo.captureStream(30), grabadora = new MediaRecorder(flujo, { mimeType: tipo, videoBitsPerSecond: 8e6 }), trozos = [];
  grabadora.ondataavailable = (e) => { if (e.data && e.data.size) trozos.push(e.data); };
  const listo = new Promise((ok, mal) => { grabadora.onstop = ok; grabadora.onerror = (e) => mal(e.error || new Error('No se pudo grabar')); });
  grabadora.start(); const t0 = performance.now();
  await new Promise((ok) => {
    const cuadro = () => { const t = (performance.now() - t0) / 1000; pintar(lienzo, receta, { momento: Math.min(t, D) }); alAvance(Math.min(1, t / D)); if (t >= D + 0.12) ok(); else if (document.hidden) setTimeout(cuadro, 33); else requestAnimationFrame(cuadro); };
    cuadro();
  });
  grabadora.stop(); await listo; flujo.getTracks().forEach((p) => p.stop());
  pintar(lienzo, receta);   // el lienzo vuelve a quedar como la imagen fija
  const mp4 = tipo.startsWith('video/mp4');
  return { blob: new Blob(trozos, { type: mp4 ? 'video/mp4' : 'video/webm' }), ext: mp4 ? 'mp4' : 'webm', segundos: D };
}

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
