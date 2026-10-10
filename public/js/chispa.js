/* ─────────────────────────────────────────────────────────────────────────────
   Cupido Algorítmico · La chispa — RLR · Ricardo López Reyero
   Lo que hace que dos personas se relacionen a gusto dentro de la charla:
   · El tono: amistad, conocernos o coqueteo. Cada quien elige el suyo en
     privado y la charla toma el más tranquilo de los dos. El coqueteo, igual
     que la puerta, solo se enciende con dos síes. Y ser amigos también vale.
   · Las cartas: preguntas para los dos. Nadie ve la respuesta del otro hasta
     que los dos contestaron: así nadie se expone solo.
   · Los detalles: una flor, un café, un guiño. Decir algo sin tener que
     encontrar las palabras.
   · La invitación: proponer verse, con tres respuestas cómodas ya escritas.
   Este archivo es el contenido; lo leen el navegador y el servidor.
   ───────────────────────────────────────────────────────────────────────────── */
export const _RLR = 'Ricardo López Reyero';
const _k = 'EYE', _rev = 181218;

export const TONOS = [
  { id: 'amistad', i: '🙂', n: 'Amistad', d: 'Platicar a gusto, sin otra intención. También se vale.' },
  { id: 'conocernos', i: '😊', n: 'Conocernos', d: 'Con curiosidad y sin prisa. Así empieza toda charla.' },
  { id: 'coqueteo', i: '😏', n: 'Coqueteo', d: 'Con chispa. Solo se enciende si los dos lo eligen.' },
];
export const TONO = Object.fromEntries(TONOS.map((t, k) => [t.id, { ...t, nivel: k }]));
export const TONO_INICIAL = 'conocernos';
// El tono común es el más tranquilo de los dos
export const tonoComun = (x, y) => (TONO[x || TONO_INICIAL].nivel <= TONO[y || TONO_INICIAL].nivel ? x || TONO_INICIAL : y || TONO_INICIAL);
export const alcanza = (comun, pedido) => TONO[comun || TONO_INICIAL].nivel >= TONO[pedido || 'amistad'].nivel;

/* ── las cartas ──────────────────────────────────────────────────────────── */
// tipo 'ab': dos opciones, un toque · tipo 'texto': cada quien escribe. `tono`: desde qué tono común se puede sacar.
export const MAZOS = [
  { id: 'prefieres', i: '⚖️', n: '¿Qué prefieres?', d: 'Dos opciones, un toque.', tipo: 'ab', tono: 'amistad', cartas: [
    ['p01', 'Café por la mañana', 'Vino por la noche'], ['p02', 'Playa', 'Montaña'], ['p03', 'Madrugar', 'Desvelarte'],
    ['p04', 'Cocinar en casa', 'Salir a cenar'], ['p05', 'Planear con semanas', '«Vámonos hoy»'], ['p06', 'Perro', 'Gato'],
    ['p07', 'Película en el cine', 'Serie en el sillón'], ['p08', 'Bailar', 'Platicar toda la noche'], ['p09', 'Mensajes largos', 'Notas de voz'],
    ['p10', 'Carretera con música', 'Avión y llegar ya'], ['p11', 'Tacos', 'Sushi'], ['p12', 'Domingo en familia', 'Domingo de no hacer nada'],
    ['p13', 'Que te sorprendan', 'Saber el plan'], ['p14', 'Ciudad grande', 'Pueblo tranquilo'], ['p15', 'Dulce', 'Salado'],
    ['p16', 'Leer el libro', 'Ver la película'], ['p17', 'Hablar por teléfono', 'Verse en persona'], ['p18', 'Frío con cobija', 'Calor con alberca'],
    ['p19', 'Museo', 'Mercado'], ['p20', 'Regalar', 'Que te regalen'], ['p21', 'Cantar en el coche', 'Silencio en el coche'],
    ['p22', 'Fiesta grande', 'Cena de cuatro'], ['p23', 'Desayuno largo', 'Cena larga'], ['p24', 'Decirlo en el momento', 'Pensarlo y decirlo mañana'],
  ] },
  { id: 'conocernos', i: '🌱', n: 'Para conocernos', d: 'Preguntas fáciles de contestar y bonitas de leer.', tipo: 'texto', tono: 'amistad', cartas: [
    ['c01', '¿Qué fue lo mejor de tu semana?'], ['c02', '¿Qué canción no te cansas de escuchar?'], ['c03', '¿Cuál es tu lugar favorito de tu ciudad, y por qué?'],
    ['c04', '¿Qué comida te regresa a tu infancia?'], ['c05', '¿Qué te hace reír sin falta?'], ['c06', '¿Cómo es un domingo perfecto para ti?'],
    ['c07', '¿Qué estás aprendiendo últimamente?'], ['c08', '¿Qué viaje te cambió algo por dentro?'], ['c09', '¿A quién de tu familia admiras más?'],
    ['c10', '¿Qué cosa pequeña te alegra el día?'], ['c11', '¿Qué harías con un día libre, sin pendientes ni teléfono?'], ['c12', '¿Qué te gustaba hacer en tu infancia que todavía te gusta?'],
    ['c13', '¿Cuál es tu platillo estrella, el que sí te sale?'], ['c14', '¿Qué película puedes ver mil veces?'], ['c15', '¿De qué puedes hablar por horas?'],
    ['c16', '¿Qué fue lo último que te emocionó de verdad?'], ['c17', '¿Qué tradición tuya te gustaría conservar siempre?'], ['c18', '¿Qué te relaja después de un día pesado?'],
    ['c19', '¿Cuál fue tu primer trabajo y qué te dejó?'], ['c20', '¿Qué lugar del mundo quieres conocer antes que cualquier otro?'], ['c21', '¿Qué dicen tus amigos que haces muy bien?'],
    ['c22', '¿A qué hora del día eres más tú?'], ['c23', '¿Qué olor te trae un buen recuerdo?'], ['c24', '¿Qué plan sencillo te hace feliz?'],
  ] },
  { id: 'hondo', i: '🌊', n: 'Más hondo', d: 'Para cuando ya hay confianza.', tipo: 'texto', tono: 'amistad', cartas: [
    ['h01', '¿Qué te costó trabajo aprender sobre ti?'], ['h02', 'En un mal día, ¿qué necesitas: compañía o espacio?'], ['h03', '¿Qué logro tuyo casi nadie conoce?'],
    ['h04', '¿Qué te enseñó tu última relación sobre lo que sí quieres?'], ['h05', '¿Cuándo te has sentido más en paz?'], ['h06', '¿Qué te da miedo perder?'],
    ['h07', '¿Qué significa para ti sentirte en casa con alguien?'], ['h08', '¿Qué te gustaría que entendieran de ti sin tener que explicarlo?'], ['h09', '¿Qué consejo te cambió la vida?'],
    ['h10', '¿En qué has cambiado de opinión con los años?'], ['h11', 'Cuando algo te duele, ¿lo hablas o lo guardas?'], ['h12', '¿Qué sueño sigues teniendo aunque no se lo cuentes a nadie?'],
    ['h13', '¿Qué es lo más valiente que has hecho?'], ['h14', '¿Cómo te gusta que te cuiden?'], ['h15', '¿Qué te hace confiar en alguien?'],
    ['h16', '¿Qué agradeces hoy que hace cinco años no tenías?'], ['h17', '¿Qué parte de tu vida quieres compartir y cuál quieres conservar solo para ti?'], ['h18', '¿Cómo te imaginas un martes cualquiera dentro de diez años?'],
  ] },
  { id: 'chispa', i: '😏', n: 'Con chispa', d: 'Para coquetear con gusto y sin prisa.', tipo: 'texto', tono: 'coqueteo', cartas: [
    ['k01', '¿Qué fue lo primero que te llamó la atención de mí?'], ['k02', '¿Qué te parece irresistible en alguien y casi nadie nota?'], ['k03', '¿Cómo sabes que alguien te gusta de verdad?'],
    ['k04', '¿Cómo sería nuestra primera cita ideal?'], ['k05', '¿Qué frase mía te hizo sonreír?'], ['k06', '¿Qué te da nervios, de los bonitos?'],
    ['k07', '¿Eres de dar el primer paso o de dejar señales?'], ['k08', '¿Qué canción pondrías si bailáramos ahorita?'], ['k09', '¿Qué detalle te conquista?'],
    ['k10', '¿Qué te gustaría que hiciéramos la primera vez que nos veamos?'], ['k11', '¿Qué piropo te gusta recibir y cuál no soportas?'], ['k12', '¿Qué te gusta de cómo te escribo?'],
    ['k13', '¿Qué imaginas cuando piensas en conocerme en persona?'], ['k14', '¿Cuál es tu idea de una noche romántica sin gastar un peso?'], ['k15', '¿Qué te gustaría saber de mí y no te has animado a preguntar?'],
    ['k16', '¿En qué momento del día te acuerdas de mí?'], ['k17', 'Termina la frase: «Me encanta cuando tú…»'], ['k18', '¿Qué gesto mío te gustaría un día cualquiera?'],
  ] },
  { id: 'prefieres_chispa', i: '💘', n: '¿Qué prefieres? Con chispa', d: 'Dos opciones, un toque y una sonrisa.', tipo: 'ab', tono: 'coqueteo', cartas: [
    ['q01', 'Abrazo largo', 'Beso lento'], ['q02', 'Que te escriban «buenos días»', 'Que te escriban «buenas noches»'], ['q03', 'Miradas', 'Palabras'],
    ['q04', 'Bailar pegados', 'Caminar de la mano'], ['q05', 'Cita planeada al detalle', 'Cita improvisada'], ['q06', 'Carta escrita a mano', 'Nota de voz de madrugada'],
    ['q07', 'Que te cocinen', 'Cocinar juntos'], ['q08', 'Beso en la primera cita', 'Hacerlo esperar'], ['q09', 'Coquetear con humor', 'Coquetear en serio'],
    ['q10', 'Atardecer', 'Noche de estrellas'], ['q11', 'Que te digan «me gustas»', 'Que te lo demuestren'], ['q12', 'Cena con velas', 'Desayuno sin prisa'],
    ['q13', 'Tomar la iniciativa', 'Que la tomen contigo'], ['q14', 'Vernos mañana', 'Dejar crecer las ganas'],
  ] },
];
export const CARTA = Object.fromEntries(MAZOS.flatMap((m) => m.cartas.map(([id, a, b]) => [id, m.tipo === 'ab' ? { id, mazo: m.id, tipo: 'ab', a, b, t: `${a} o ${b}`, tono: m.tono } : { id, mazo: m.id, tipo: 'texto', t: a, tono: m.tono }])));
export const MAZO = Object.fromEntries(MAZOS.map((m) => [m.id, m]));
export const CARTAS_PENDIENTES = 3;   // cartas mías que la otra persona aún no contesta
export const RESPUESTA_MAX = 600;

/* ── los detalles ────────────────────────────────────────────────────────── */
// `n`: cómo se llama en el menú · `v`: lo que lee quien lo recibe («Diego te manda una rosa») · `yo`: lo que lee quien lo mandó · `e`: lo que flota al llegar
export const DETALLES = [
  { id: 'cafe', i: '☕', n: 'Un café', v: 'te invita un café', yo: 'Le invitaste un café a {n}', tono: 'amistad', e: '☕' },
  { id: 'girasol', i: '🌻', n: 'Un girasol', v: 'te manda un girasol', yo: 'Le mandaste un girasol a {n}', tono: 'amistad', e: '🌻' },
  { id: 'abrazo', i: '🤗', n: 'Un abrazo', v: 'te manda un abrazo', yo: 'Le mandaste un abrazo a {n}', tono: 'amistad', e: '🤗' },
  { id: 'dia', i: '⭐', n: 'Me alegraste el día', v: 'dice que le alegraste el día', yo: 'Le dijiste a {n} que te alegró el día', tono: 'amistad', e: '⭐' },
  { id: 'suerte', i: '🍀', n: 'Suerte hoy', v: 'te desea suerte hoy', yo: 'Le deseaste suerte a {n}', tono: 'amistad', e: '🍀' },
  { id: 'cancion', i: '🎶', n: 'Una canción', v: 'te dedica una canción', yo: 'Le dedicaste una canción a {n}', tono: 'amistad', e: '🎶', nota: 'Cuál canción (o pega la liga)' },
  { id: 'dias', i: '☀️', n: 'Buenos días', v: 'te da los buenos días', yo: 'Le diste los buenos días a {n}', tono: 'amistad', e: '☀️' },
  { id: 'noches', i: '🌙', n: 'Buenas noches', v: 'te desea buenas noches', yo: 'Le deseaste buenas noches a {n}', tono: 'amistad', e: '🌙' },
  { id: 'rosa', i: '🌹', n: 'Una rosa', v: 'te manda una rosa', yo: 'Le mandaste una rosa a {n}', tono: 'coqueteo', e: '🌹' },
  { id: 'guino', i: '😉', n: 'Un guiño', v: 'te guiña el ojo', yo: 'Le guiñaste el ojo a {n}', tono: 'coqueteo', e: '😉' },
  { id: 'beso', i: '😘', n: 'Un beso', v: 'te manda un beso', yo: 'Le mandaste un beso a {n}', tono: 'coqueteo', e: '💋' },
  { id: 'pense', i: '💌', n: 'Pensé en ti', v: 'pensó en ti', yo: 'Pensaste en {n}, y se lo dijiste', tono: 'coqueteo', e: '💌' },
  { id: 'mariposas', i: '🦋', n: 'Mariposas', v: 'dice que le das mariposas', yo: 'Le dijiste a {n} que te da mariposas', tono: 'coqueteo', e: '🦋' },
  { id: 'bailar', i: '💃', n: 'Sacar a bailar', v: 'te saca a bailar', yo: 'Sacaste a bailar a {n}', tono: 'coqueteo', e: '🎵' },
  { id: 'encantas', i: '🔥', n: 'Me encantas', v: 'dice que le encantas', yo: 'Le dijiste a {n} que te encanta', tono: 'coqueteo', e: '❤️‍🔥' },
];
export const DETALLE = Object.fromEntries(DETALLES.map((d) => [d.id, d]));
export const DETALLES_AL_DIA = 8;
export const NOTA_MAX = 160;

/* ── la invitación ───────────────────────────────────────────────────────── */
export const PLANES = [['cafe', '☕', 'Un café'], ['cenar', '🍽️', 'Cenar'], ['caminar', '🚶', 'Caminar'], ['helado', '🍦', 'Un helado'], ['cine', '🎬', 'Ir al cine'], ['otro', '✏️', 'Otra cosa']];
export const PLAN = Object.fromEntries(PLANES.map(([id, i, n]) => [id, { id, i, n }]));
// Tres respuestas cómodas, ya escritas: decir que no también tiene que ser fácil
export const RESPUESTAS_CITA = [
  { id: 'si', i: '💛', n: 'Sí, vamos', dice: 'dijo que sí' },
  { id: 'luego', i: '🗓️', n: 'Me encantaría, otro día', dice: 'prefiere otro día' },
  { id: 'aqui', i: '💬', n: 'Sigamos platicando aquí un poco más', dice: 'prefiere seguir platicando aquí un poco más' },
];
export const RESPUESTA_CITA = Object.fromEntries(RESPUESTAS_CITA.map((r) => [r.id, r]));

/* ── antes de mandar: una pausa amable si el tono todavía no es ese ──────── */
const SUBIDO = /\b(desnud[ao]s?|encuerad[ao]s?|sexo|coger(te|nos)?|cog[eé]rte|follar(te)?|cachond[ao]s?|calient[eo]s?\s+(estoy|me)|me\s+(prendes|calientas|excitas)|excitad[ao]|tetas?|chichis?|nalgas?|verga|pene|vagina|nudes?|pack|mast[uú]rb\w*|cama\s+contigo|qu[ií]tate\s+la)\b/i;
export const subidoDeTono = (texto) => SUBIDO.test(String(texto || ''));
// RLR
