/* ─────────────────────────────────────────────────────────────────────────────
   Cupido Algorítmico · Cuestionario v2 — fuente única de verdad
   Autor: Ricardo López Reyero
   La usan el cuestionario (navegador), el motor (Worker) y el panel admin.
   Cada respuesta se guarda con un CÓDIGO estable, nunca con el texto visible:
   con un millón de personas los textos van a cambiar y los datos no se rompen.
   ───────────────────────────────────────────────────────────────────────────── */
// RLR
export const _RLR = 'Ricardo López Reyero';
export const _k = 'EYE', _rev = 181218; // candado de autoría (ver notas privadas)

export const BLOQUES = {
  1: 'Filtros y logística', 2: 'Visión de vida', 3: 'Valores en acción',
  4: 'Personalidad y energía', 5: 'Conflicto y reparación', 6: 'Afecto',
  7: 'Vida cotidiana', 8: 'Profundidad y verdad', 9: 'Intimidad sexual', 10: 'Conciencia y vida interior',
};

export const LENGUAJES = [
  ['tiempo', 'Tiempo de calidad'], ['palabras', 'Palabras y reconocimiento'], ['contacto', 'Contacto físico'],
  ['detalles', 'Detalles y regalos'], ['servicio', 'Actos de servicio'],
];

export const CIUDADES = [
  ['cdmx', 'Ciudad de México'], ['monterrey', 'Monterrey'], ['guadalajara', 'Guadalajara'], ['puebla', 'Puebla'],
  ['queretaro', 'Querétaro'], ['torreon', 'Torreón'], ['saltillo', 'Saltillo'], ['merida', 'Mérida'],
  ['leon', 'León'], ['tijuana', 'Tijuana'], ['chihuahua', 'Chihuahua'], ['cancun', 'Cancún'],
  ['sanluis', 'San Luis Potosí'], ['aguascalientes', 'Aguascalientes'], ['morelia', 'Morelia'],
  ['hermosillo', 'Hermosillo'], ['oaxaca', 'Oaxaca'], ['veracruz', 'Veracruz'], ['otra', 'Otra ciudad'],
];

// Vocabulario de la lectura de la carta (P33): lo que una persona promete y lo que pide.
export const CARTA_TAGS = [
  'presencia', 'honestidad', 'paciencia', 'humor', 'aventura', 'fe', 'familia', 'cuidado', 'libertad',
  'crecimiento', 'lealtad', 'ternura', 'calma', 'pasion', 'respeto', 'equipo', 'orden', 'alegria',
];

const SX = [['necesito', 'Lo necesito'], ['acepto', 'Lo acepto'], ['no', 'No lo acepto']];

/* Tipos de parte:
   choice (una opción) · multi (varias, con max) · scale (1–5) · rank (ordenar) · text · num · range [min,max]
   city (lista + otra) · grid (varias filas con las mismas columnas; cada fila guarda su propia clave)
   Banderas: filtro (alimenta un veto) · nuevo (agregado en v2) · opcional · si (se muestra solo si…) */
export const PREGUNTAS = [
  /* ── Bloque 1 · Filtros y logística ─────────────────────────────────────── */
  { n: 1, b: 1, t: '¿Quién eres y a quién buscas?',
    help: { why: 'Es un filtro de ida y vuelta: solo hay coincidencia si cada uno cae en lo que el otro busca. El rango de edad que considerarías no se pregunta aquí: lo decides después, como filtro sobre quienes te digan que sí.' },
    parts: [
      { id: 'genero', k: 'choice', l: 'Soy', filtro: true, nuevo: true, o: [['mujer', 'Mujer'], ['hombre', 'Hombre'], ['nobinaria', 'Persona no binaria']] },
      { id: 'busca', k: 'multi', l: 'Busco', filtro: true, nuevo: true, o: [['hombre', 'Hombres'], ['mujer', 'Mujeres'], ['nobinaria', 'Personas no binarias']] },
      { id: 'edad', k: 'num', l: 'Tu edad', min: 18, max: 99, filtro: true },
      { id: 'nacimiento', k: 'fecha', l: 'Fecha de nacimiento', opcional: true, nota: 'El año lo calculamos con tu edad; tú pones mes y día.' },
    ] },
  { n: 2, b: 1, t: '¿En qué ciudad vives, y qué tan lejos llegarías por la persona correcta?',
    help: { why: 'La distancia no mata coincidencias; la inflexibilidad mutua sí. No respondas lo romántico: responde lo real. ¿De verdad te irías?' },
    parts: [
      { id: 'ciudad', k: 'city', l: 'Tu ciudad', filtro: true, o: CIUDADES },
      { id: 'mudanza', k: 'choice', l: '¿Qué tan lejos llegarías?', filtro: true, o: [
        ['no', 'No me movería de mi ciudad'], ['pais', 'Me movería dentro de mi país'],
        ['mundo', 'Me movería a otro país'], ['donde_sea', 'A donde sea, si es la persona correcta']] },
    ] },
  { n: 3, b: 1, t: '¿Quieres hijos?',
    help: { why: 'Es la pregunta que más parejas rompe. «Me inclino» es una respuesta perfectamente válida — no la conviertas en «seguro» para verte decidido.' },
    parts: [
      { id: 'hijos', k: 'choice', filtro: true, o: [
        ['si', 'Sí, con certeza'], ['inc_si', 'Me inclino a que sí'], ['inc_no', 'Me inclino a que no'],
        ['no', 'No, con certeza'], ['tengo_mas', 'Ya tengo hijos y quiero más'], ['tengo_no', 'Ya tengo hijos y no quiero más']] },
      { id: 'acepta_hijos', k: 'choice', l: '¿Aceptarías una pareja que ya tiene hijos?', filtro: true, nuevo: true, o: [
        ['si', 'Sí, con gusto'], ['depende', 'Depende de la situación'], ['no', 'No']] },
    ] },
  { n: 4, b: 1, t: '¿Qué papel juega la fe o la espiritualidad en tu vida, y qué tan importante es que tu pareja la comparta?',
    note: 'Separamos tres cosas que casi siempre se mezclan: qué crees, qué tanto lo vives y qué tanto necesitas compartirlo.',
    help: { why: 'Lo que protege a una pareja no es la etiqueta religiosa: es compartir la práctica y darle la misma importancia. Por eso preguntamos las tres cosas por separado. Solo actúa como filtro si tú lo declaras innegociable.' },
    parts: [
      { id: 'fe', k: 'choice', l: 'Hoy me identifico como…', nuevo: true, o: [
        ['catolica', 'Católica'], ['cristiana', 'Cristiana (evangélica o protestante)'], ['judia', 'Judía'], ['musulmana', 'Musulmana'],
        ['otra', 'Otra religión'], ['espiritual', 'Espiritual, sin religión'], ['agnostica', 'Agnóstica'], ['atea', 'Atea']] },
      { id: 'fe_practica', k: 'choice', l: '¿Qué tan presente está en tu semana? (oración, culto, práctica)', nuevo: true, o: [
        ['diario', 'A diario'], ['semana', 'Cada semana'], ['aveces', 'De vez en cuando'], ['casi_nunca', 'Casi nunca'], ['nunca', 'Nunca']] },
      { id: 'fe_texto', k: 'text', l: 'En tus palabras: ¿qué practicas o crees?', min: 60, opcional: true },
      { id: 'fe_compartir', k: 'choice', l: '¿Qué tan importante es que tu pareja lo comparta?', filtro: true, o: [
        ['no_importa', 'No me importa lo que crea mi pareja'], ['prefiero', 'Prefiero que sea compatible, pero es negociable'],
        ['necesito', 'Necesito que comparta mi fe (o mi ausencia de fe)']] },
      { id: 'fe_hijos', k: 'choice', l: 'Si hay hijos, ¿cómo imaginas su formación espiritual?', filtro: true, nuevo: true, o: [
        ['mi_fe', 'En mi fe'], ['acordada', 'En la fe que acordemos juntos'], ['elijan', 'Que ellos elijan cuando crezcan'],
        ['sin', 'Sin formación religiosa'], ['no_aplica', 'No aplica: no habrá hijos']] },
    ] },
  { n: 5, b: 1, t: '¿Qué estás buscando exactamente?',
    help: { why: 'No hay respuesta que te haga ver mejor. Hay respuesta que te empareja con quien quiere lo mismo — y al mismo ritmo.' },
    parts: [
      { id: 'relacion', k: 'choice', o: [
        ['vida_matrimonio', 'Relación de por vida, con matrimonio'], ['vida', 'Relación de por vida, con o sin matrimonio'],
        ['seria', 'Relación seria, y ver hasta dónde llega']] },
      { id: 'exclusividad', k: 'choice', l: 'La exclusividad total para ti es…', filtro: true, o: [
        ['innegociable', 'Innegociable'], ['prefiero', 'La prefiero'], ['abierta', 'Estoy abierto/a a una relación no exclusiva']] },
      { id: 'ritmo', k: 'choice', l: '¿Con qué ritmo te gustaría formar un hogar?', nuevo: true, o: [
        ['pronto', 'Pronto: en 1–2 años'], ['calma', 'Con calma: en 3–5 años'], ['sin', 'Sin calendario']] },
    ] },

  /* ── Bloque 2 · Visión de vida ──────────────────────────────────────────── */
  { n: 6, b: 2, t: 'Describe un martes normal de tu vida ideal dentro de 10 años.',
    note: 'No describas tus sueños: describe un martes. La vida en pareja es de martes, no de bodas.',
    help: { why: 'Comparamos escenarios reales: ciudad o campo, hijos presentes, ritmo, rol del trabajo.',
      start: '¿A qué hora despiertas? ¿Qué ves por la ventana? ¿Quién más está en la casa? ¿Qué haces a las 2 pm? ¿Y a las 9 de la noche?',
      ex: '«Despierto a las 6:30 en una casa con patio, no en el centro. Hago café mientras los niños se alistan. Trabajo desde casa hasta las 4…» — imperfecta y real: así se ve una buena respuesta.' },
    parts: [
      { id: 'martes', k: 'text' },
      { id: 'entorno', k: 'choice', l: 'Ese martes, ¿dónde es?', nuevo: true, o: [
        ['ciudad_grande', 'Ciudad grande'], ['ciudad_media', 'Ciudad mediana o suburbio'], ['campo', 'Campo o pueblo'],
        ['playa', 'Cerca del mar'], ['nomada', 'Sin lugar fijo: viajando']] },
    ] },
  { n: 7, b: 2, t: '¿Qué papel juega tu familia de origen en tu vida hoy, y qué papel esperas que juegue en tu relación?',
    help: { start: '¿Cada cuánto los ves o les hablas hoy? ¿Qué opinión esperas que tengan sobre tu pareja: mucha, poca, ninguna?' },
    parts: [
      { id: 'familia', k: 'text' },
      { id: 'familia_origen', k: 'choice', l: 'En una frase, tu familia es…', nuevo: true, o: [
        ['muy', 'Muy presente: los veo cada semana y su opinión cuenta'], ['limites', 'Presente, con límites claros'],
        ['distante', 'Distante o poco involucrada']] },
    ] },
  { n: 8, b: 2, t: '¿Qué papel juega el trabajo y la ambición en tu vida — y qué esperas del trabajo y la ambición de tu pareja?',
    note: 'Son dos preguntas: cómo eres tú, y qué buscas en el otro. Responde ambas.',
    parts: [
      { id: 'trabajo', k: 'text' },
      { id: 'ambicion', k: 'choice', l: 'Tú:', nuevo: true, o: [
        ['central', 'Mi trabajo es central en mi vida'], ['equilibrio', 'Equilibrio: importa, pero no manda'], ['vida', 'La vida primero: trabajo para vivir']] },
      { id: 'ambicion_pareja', k: 'choice', l: 'De tu pareja esperas:', nuevo: true, o: [
        ['fuerte', 'Que tenga su propia ambición fuerte'], ['equilibrio', 'Que tenga equilibrio'], ['igual', 'Me da igual, mientras sea feliz']] },
    ] },
  { n: 9, b: 2, t: 'Para ti, ¿qué es una vida bien vivida?',
    help: { start: 'Imagina que tienes 80 años y miras atrás con paz. ¿Qué tuvo que haber pasado? ¿Qué habría hecho que sintieras que la desperdiciaste?' },
    parts: [
      { id: 'vida', k: 'text' },
      { id: 'ejes', k: 'multi', max: 3, l: 'Si tuvieras que elegir 3 ejes:', nuevo: true, o: [
        ['familia', 'Familia'], ['fe', 'Fe'], ['servicio', 'Servir a otros'], ['logro', 'Logro y legado'], ['libertad', 'Libertad'],
        ['aventura', 'Aventura'], ['conocimiento', 'Aprender y entender'], ['creatividad', 'Crear'], ['paz', 'Paz interior'], ['disfrutar', 'Disfrutar la vida']] },
    ] },

  /* ── Bloque 3 · Valores ─────────────────────────────────────────────────── */
  { n: 10, b: 3, t: '¿Cuáles son los 3 valores que no negocias — y cómo se ven en tu vida diaria?',
    note: 'Con ejemplos concretos, no en teoría.',
    help: { why: '«Honestidad» no dice nada. «Devolví un pago duplicado que nadie habría notado» lo dice todo.',
      start: 'Estructura sugerida: Valor 1: ___. Se ve en mi vida así: ___ (× 3).' },
    parts: [
      { id: 'valores', k: 'multi', max: 3, l: 'Elige tus 3', nuevo: true, o: [
        ['honestidad', 'Honestidad'], ['lealtad', 'Lealtad'], ['familia', 'Familia'], ['fe', 'Fe'], ['libertad', 'Libertad'],
        ['justicia', 'Justicia'], ['generosidad', 'Generosidad'], ['disciplina', 'Disciplina'], ['respeto', 'Respeto'],
        ['humildad', 'Humildad'], ['valentia', 'Valentía'], ['alegria', 'Alegría'], ['esfuerzo', 'Trabajo duro'], ['empatia', 'Empatía']] },
      { id: 'valores_texto', k: 'text', l: 'Y cómo se ven en tu vida, con ejemplos' },
    ] },
  { n: 11, b: 3, t: 'Cuéntame una decisión difícil en la que elegiste tus principios por encima de tu conveniencia.',
    help: { start: 'Piensa en: una renuncia, una devolución, una verdad que te costó decir, un favor que negaste, algo que pagaste sin que nadie viera. Vale un caso pequeño: importa el patrón, no la épica.',
      why: 'Si de verdad no encuentras ninguno, escríbelo — eso también es una respuesta.' },
    parts: [{ id: 'principios', k: 'text' }] },
  { n: 12, b: 3, t: 'Sobre el dinero: ¿cómo eres tú, y cómo imaginas manejarlo en pareja?',
    help: { why: 'El dinero es de las primeras causas de conflicto en pareja. No hay opción correcta: hay parejas alineadas y parejas en guerra.' },
    parts: [
      { id: 'dinero', k: 'choice', l: 'Tú eres…', o: [['ahorro', 'Ahorrador/a'], ['equilibrado', 'Equilibrado/a'], ['gasto', 'Disfruto gastar lo que gano']] },
      { id: 'dinero_pareja', k: 'choice', l: 'En pareja imaginas…', o: [['comun', 'Todo en común'], ['mixto', 'Una parte común y una individual'], ['separado', 'Cuentas separadas']] },
    ] },
  { n: 13, b: 3, t: '¿Qué tan importante es que tu pareja coincida contigo en visión política y social?',
    help: { why: 'No te preguntamos por quién votas. Solo hacia dónde te inclinas y cuánto te importa coincidir. «Prefiero no decirlo» nunca te quita coincidencias.' },
    parts: [
      { id: 'politica', k: 'choice', filtro: true, o: [
        ['nada', 'Nada: se puede querer a alguien que vota distinto'], ['algo', 'Algo: prefiero afinidad, tolero diferencia'],
        ['mucho', 'Mucho: necesito afinidad en lo esencial'], ['innegociable', 'Innegociable']] },
      { id: 'postura', k: 'choice', l: 'Te inclinas hacia…', nuevo: true, o: [
        ['progresista', 'Progresista'], ['centro', 'Al centro'], ['conservadora', 'Conservadora'], ['reservada', 'Prefiero no decirlo']] },
    ] },

  /* ── Bloque 4 · Personalidad ────────────────────────────────────────────── */
  { n: 14, b: 4, t: '¿Cómo recargas energía, y cómo es tu viernes ideal?',
    parts: [
      { id: 'energia', k: 'choice', l: 'Recargo energía…', o: [['solo', 'Solo/a o con muy poca gente'], ['depende', 'Depende'], ['gente', 'Rodeado/a de gente']] },
      { id: 'viernes', k: 'choice', l: 'Mi viernes ideal…', o: [['casa', 'Casa y calma'], ['pequeno', 'Plan pequeño (cena, cine, amigos cercanos)'], ['fiesta', 'Fiesta o evento social grande']] },
    ] },
  { n: 15, b: 4, t: '¿Cómo te llevas con el orden y los planes?',
    parts: [{ id: 'planes', k: 'choice', o: [
      ['planifico', 'Planifico casi todo y me gusta así'], ['flexible', 'Estructura flexible: plan general, improvisación en los detalles'],
      ['fluyo', 'Fluyo: los planes me estorban']] }] },
  { n: 16, b: 4, t: '¿Qué dirían tus mejores amigos que es lo mejor de ti — y qué es lo más difícil de ti?',
    note: 'Sé honesto/a en la segunda parte.',
    help: { start: 'Truco: no respondas tú. Escucha a tu mejor amigo diciéndolo. ¿Qué diría con cariño… y qué diría con una cerveza encima?',
      why: '«Soy demasiado perfeccionista» no cuenta. Lo difícil de ti es algo que le ha costado a alguien que te quiere.' },
    parts: [{ id: 'amigos', k: 'text' }] },
  { n: 17, b: 4, t: '¿Qué te hace reír de verdad? Describe tu humor con ejemplos.',
    help: { start: 'Abre tu app de mensajes mentalmente: ¿qué fue lo último que reenviaste riéndote? ¿Con quién te ríes hasta que duele, y de qué? ¿Qué te parece infantil o de mal gusto?' },
    parts: [
      { id: 'humor', k: 'multi', max: 3, l: 'Tu humor se parece más a…', nuevo: true, o: [
        ['ironia', 'Ironía y sarcasmo'], ['absurdo', 'Absurdo'], ['blanco', 'Blanco y familiar'], ['negro', 'Humor negro'],
        ['ingenio', 'Ingenio y juegos de palabras'], ['fisico', 'Tonterías y comedia física'], ['memes', 'Memes e internet']] },
      { id: 'humor_texto', k: 'text', l: 'Con ejemplos' },
    ] },
  { n: 18, b: 4, t: 'Entre estabilidad y aventura, ¿dónde vives tú?',
    parts: [{ id: 'aventura', k: 'scale', lo: 'Amo mi rutina y mi base', hi: 'Necesito cambio constante' }] },

  /* ── Bloque 5 · Conflicto y reparación ──────────────────────────────────── */
  { n: 19, b: 5, t: 'Cuando algo de tu pareja te molesta de verdad, ¿qué haces la mayoría de las veces?',
    note: 'La de verdad, no la ideal.',
    help: { why: 'No hay opción buena y mala: hay combinaciones de pareja que funcionan y otras que explotan. Mentir aquí es comprarte la explosión.' },
    parts: [{ id: 'conflicto', k: 'choice', o: [
      ['caliente', 'Lo digo en el momento, a veces en caliente'], ['calma', 'Espero a calmarme y lo hablo pronto'],
      ['acumulo', 'Me lo guardo, y a veces se acumula hasta que explota'], ['evito', 'Tiendo a evitar el tema esperando que pase']] }] },
  { n: 20, b: 5, t: 'Describe tu última discusión importante con alguien que amas.',
    help: { why: 'Nadie va a leer esto más que el algoritmo. No busca culpables: busca cómo reparas.' },
    parts: [
      { id: 'discusion_por', k: 'text', l: '¿Por qué fue?', min: 80 },
      { id: 'discusion_hice', k: 'text', l: '¿Qué hiciste tú?', min: 80 },
      { id: 'discusion_termino', k: 'text', l: '¿Cómo terminó?', min: 80 },
    ] },
  { n: 21, b: 5, t: 'Después de una pelea fuerte, ¿qué necesitas tú para volver a estar bien — y qué eres capaz de ofrecerle al otro?',
    help: { start: '¿Espacio o abrazo? ¿Hablarlo ya o mañana? ¿Qué gesto del otro te desarma? ¿Y qué eres capaz de dar tú aunque sigas enojado/a?' },
    parts: [
      { id: 'repara_necesito', k: 'choice', l: 'Lo que más necesito es…', nuevo: true, o: [
        ['hablar', 'Hablarlo pronto, aunque duela'], ['rato', 'Un rato a solas y luego hablarlo'],
        ['gesto', 'Un gesto de cariño antes que palabras'], ['espacio', 'Varios días de espacio']] },
      { id: 'repara_ofrezco', k: 'multi', max: 3, l: 'Lo que sí sé ofrecer (hasta 3)…', nuevo: true, o: [
        ['hablar', 'Buscar hablarlo pronto'], ['espacio', 'Dar espacio sin castigar con silencio'], ['perdon', 'Pedir perdón primero'],
        ['gesto', 'Un gesto de cariño'], ['escuchar', 'Escuchar sin defenderme']] },
      { id: 'reparacion', k: 'text', l: 'En tus palabras' },
    ] },
  { n: 22, b: 5, t: '¿Qué aprendiste de tu relación pasada más importante? ¿Qué harías diferente TÚ?',
    note: 'No qué debió hacer diferente la otra persona.',
    help: { why: 'No te pedimos revivir la historia ni contar qué hizo la otra persona. Solo una cosa: ¿qué harías diferente tú?' },
    parts: [{ id: 'aprendi', k: 'text' }] },

  /* ── Bloque 6 · Afecto ──────────────────────────────────────────────────── */
  { n: 23, b: 6, t: '¿Cómo sientes con más fuerza que te aman — y cómo demuestras amor tú?',
    help: { why: 'No comparamos tu lista con la suya: cruzamos lo que tú necesitas recibir con lo que el otro da naturalmente, en las dos direcciones.' },
    parts: [
      { id: 'amor_recibo', k: 'rank', l: 'Toca en orden: primero lo que MÁS te llega', o: LENGUAJES },
      { id: 'amor_doy', k: 'rank', l: 'Ahora: cómo demuestras amor tú (primero lo más natural)', o: LENGUAJES },
    ] },
  { n: 24, b: 6, t: '¿Cuánta cercanía necesitas en pareja?',
    help: { why: 'Ni la simbiosis ni la independencia son mejores: son incompatibles entre sí.' },
    parts: [{ id: 'cercania', k: 'choice', o: [
      ['todo', 'Compartirlo casi todo: planes, amigos, tiempo'], ['juntos', 'Muy juntos, pero cada quien con su mundo propio'],
      ['independencia', 'Mucha independencia: nos elegimos, no nos absorbemos']] }] },
  { n: 25, b: 6, t: '¿Qué papel juega la intimidad física en una relación para ti, y qué tan fácil te resulta hablar de lo que necesitas?',
    note: 'Respondes solo lo que quieras y al nivel de detalle que tú elijas.',
    help: { why: 'Hablar de lo íntimo con la pareja es de lo que más predice una vida sexual satisfecha — más que casi cualquier práctica. Por eso lo medimos aparte.',
      start: '¿Qué lugar ocupa en tu lista de lo que hace funcionar una relación? ¿Te resulta fácil pedir lo que necesitas, o te cuesta?' },
    parts: [
      { id: 'intimidad_importancia', k: 'scale', l: '¿Qué tan importante es la intimidad sexual en una relación para ti?', nuevo: true, lo: 'Poco importante', hi: 'Esencial' },
      { id: 'hablar_intimo', k: 'scale', l: '¿Qué tan fácil te resulta hablar de lo que necesitas en lo íntimo?', nuevo: true, lo: 'Me cuesta muchísimo', hi: 'Me sale natural' },
      { id: 'intimidad', k: 'text', l: 'En tus palabras', opcional: true },
    ] },
  { n: 26, b: 6, t: 'Cuando alguien que amas está en su peor momento, ¿cómo lo cuidas? Da un ejemplo real.',
    help: { start: 'Piensa en la última vez que alguien que amas estuvo enfermo, triste o quebrado. ¿Qué hiciste — no qué sentiste, qué HICISTE?' },
    parts: [
      { id: 'cuidado', k: 'multi', max: 2, l: 'Cuidas sobre todo…', nuevo: true, o: [
        ['presencia', 'Estando presente y acompañando'], ['resolver', 'Resolviendo lo práctico'], ['animo', 'Con palabras de ánimo'],
        ['espacio', 'Dando espacio y respetando su ritmo'], ['consentir', 'Consintiendo con detalles']] },
      { id: 'cuidado_texto', k: 'text', l: 'El ejemplo real' },
    ] },

  /* ── Bloque 7 · Vida cotidiana ──────────────────────────────────────────── */
  { n: 27, b: 7, t: 'Hábitos: cómo eres tú, y qué aceptas en tu pareja.',
    help: { why: 'La mitad de la fricción doméstica vive aquí. Un «no acepto» contra un hábito declarado es eliminatorio — por eso vale responder con verdad.' },
    parts: [
      { id: 'alcohol', k: 'choice', l: 'Alcohol — tú:', o: [['nada', 'Nada'], ['social', 'Social'], ['frecuente', 'Frecuente']] },
      { id: 'alcohol_acepto', k: 'choice', l: 'Alcohol — en tu pareja aceptas hasta:', filtro: true, o: [['nada', 'Nada'], ['social', 'Social'], ['frecuente', 'Frecuente']] },
      { id: 'tabaco', k: 'choice', l: 'Tabaco o vape — tú:', o: [['no', 'No'], ['ocasional', 'Ocasional'], ['si', 'Sí']] },
      { id: 'tabaco_acepto', k: 'choice', l: 'Tabaco o vape — en tu pareja aceptas hasta:', filtro: true, o: [['no', 'Nada'], ['ocasional', 'Ocasional'], ['si', 'Me da igual']] },
      { id: 'ejercicio', k: 'choice', l: 'Ejercicio — tú:', o: [['nada', 'Nada'], ['aveces', 'A veces'], ['vida', 'Parte de mi vida']] },
      { id: 'ejercicio_pareja', k: 'choice', l: 'Ejercicio — en tu pareja prefieres:', o: [['igual', 'Me da igual'], ['algo', 'Que se mueva algo'], ['activo', 'Que sea activo/a como yo']] },
      { id: 'mascotas', k: 'choice', l: 'Mascotas — tú:', o: [['familia', 'Tengo y son familia'], ['gustan', 'Me gustan'], ['sin', 'Prefiero sin mascotas']] },
      { id: 'mascotas_acepto', k: 'choice', l: 'Mascotas — en tu pareja aceptas:', filtro: true, o: [['si', 'Que tenga y sean familia'], ['gustan', 'Que le gusten, sin más'], ['no', 'Prefiero que no tenga (alergias cuentan)']] },
    ] },
  { n: 28, b: 7, t: 'Tu ritmo y tu espacio.',
    help: { why: 'El conflicto no viene del desorden: viene de la brecha entre el desorden de uno y el umbral del otro.' },
    parts: [
      { id: 'cronotipo', k: 'choice', l: '¿Madrugas o trasnochas?', o: [['madrugador', 'Madrugador/a'], ['flexible', 'Flexible'], ['nocturno', 'Nocturno/a']] },
      { id: 'orden_casa', k: 'scale', l: '¿Qué tan ordenada está tu casa HOY? (no después de limpiar el sábado)', lo: 'Caos', hi: 'Impecable' },
      { id: 'molesta_desorden', k: 'choice', l: '¿Qué tanto te molesta el desorden del otro?', o: [['poco', 'Poco'], ['algo', 'Algo'], ['mucho', 'Mucho']] },
    ] },
  { n: 29, b: 7, t: 'Describe tu domingo perfecto, de principio a fin.',
    help: { start: '¿A qué hora abres los ojos? ¿Qué desayunas? ¿Con quién? ¿Qué NO puede pasar en tu domingo perfecto?' },
    parts: [
      { id: 'domingo', k: 'text' },
      { id: 'domingo_tipo', k: 'multi', max: 3, l: 'Tu domingo tiene sobre todo…', nuevo: true, o: [
        ['descanso', 'Descanso en casa'], ['familia', 'Familia'], ['culto', 'Misa o servicio religioso'], ['deporte', 'Deporte'],
        ['naturaleza', 'Naturaleza'], ['amigos', 'Amigos y reuniones'], ['cultura', 'Cultura: museos, cine, lectura'],
        ['fiesta', 'Salir de fiesta'], ['proyectos', 'Mis proyectos']] },
    ] },
  { n: 30, b: 7, t: 'En la casa que compartan, ¿cómo imaginas la división de tareas y responsabilidades?',
    help: { why: 'No hay modelo correcto. Hay parejas donde los dos quieren lo mismo — y parejas condenadas a pelear cada carga de lavadora.' },
    parts: [
      { id: 'tareas', k: 'choice', o: [
        ['cincuenta', '50/50 explícito'], ['flexible', 'El que pueda en cada etapa, con flexibilidad'],
        ['roles', 'Roles claros y distintos (uno provee más, otro sostiene más el hogar)'], ['conversa', 'Se conversa y se rediseña cada vez que cambie la vida']] },
      { id: 'rol', k: 'choice', l: 'Y tú preferirías…', nuevo: true, si: { id: 'tareas', v: 'roles' }, o: [
        ['proveer', 'Proveer más'], ['hogar', 'Sostener más el hogar'], ['ninguno', 'Ninguno en especial']] },
    ] },

  /* ── Bloque 8 · Profundidad ─────────────────────────────────────────────── */
  { n: 31, b: 8, t: '¿Qué es algo de ti que la gente suele malinterpretar — y qué te gustaría que tu pareja entendiera desde el día uno?',
    help: { start: 'Completa: «La gente cree que soy ___, pero en realidad ___». ¿Qué primera impresión das que no te hace justicia?' },
    parts: [{ id: 'malinterpretan', k: 'text' }] },
  { n: 32, b: 8, t: '¿Por qué crees que sigues soltero/a?',
    note: 'Con honestidad — sin humildad falsa y sin culpar al resto del mundo.',
    help: { why: 'Es la pregunta que más dice de ti en todo el cuestionario. No te castiga por la respuesta: te premia por la honestidad.',
      start: 'Prohibido responder «no he encontrado a la persona correcta» — eso es la pregunta, no la respuesta. ¿Qué has elegido, evitado, priorizado o temido TÚ?',
      ex: '«Trabajo demasiado y lo sé. Y cuando alguien se acerca de verdad, encuentro un defecto para irme antes de que me lo encuentren a mí.» — vulnerable e imperfecta: eso es una respuesta de verdad.' },
    parts: [{ id: 'soltero', k: 'text' }] },
  { n: 33, b: 8, t: 'Escríbele una carta corta a tu futura pareja: ¿qué le prometes, y qué le pides?',
    note: 'Esta carta es lo primero que tu match leerá de ti.',
    help: { start: 'Dos párrafos bastan: «Te prometo…» y «Te pido…». Escríbela a UNA persona, no a un público.' },
    parts: [{ id: 'carta', k: 'text', min: 180 }] },

  /* ── Módulo Profundo · Intimidad sexual (revisado en v2) ────────────────── */
  { n: 34, b: 9, t: 'En una relación estable y buena, ¿cuál sería tu frecuencia ideal de intimidad sexual?',
    help: { why: 'El desajuste de deseo es de las primeras causas reales de ruptura. Preguntarlo hoy es más barato que descubrirlo en el año dos. Y no todos los deseos funcionan igual: en muchas personas el deseo no aparece de la nada, aparece cuando ya empezó la cercanía. Ninguno es mejor, y saberlo cambia cómo leemos la frecuencia.' },
    parts: [
      { id: 'frecuencia', k: 'choice', o: [
        ['varias', 'Varias veces por semana'], ['una_dos', 'Una o dos veces por semana'], ['mes', 'Algunas veces al mes'],
        ['conexion', 'La frecuencia me importa poco si hay conexión']] },
      { id: 'frecuencia_negociable', k: 'choice', l: '¿Qué tan negociable es esto para ti?', o: [['muy', 'Muy negociable'], ['algo', 'Algo negociable'], ['poco', 'Poco negociable']] },
      { id: 'deseo', k: 'choice', l: '¿Cómo suele aparecer tu deseo?', nuevo: true, o: [
        ['espontaneo', 'Suele aparecer solo, de la nada'], ['responsivo', 'Aparece cuando ya empezó la cercanía'], ['ambos', 'Depende del momento']] },
    ] },
  { n: 35, b: 9, t: 'Entre lo clásico y lo explorador, ¿dónde estás tú — y dónde necesitas que esté tu pareja?',
    parts: [
      { id: 'apertura', k: 'scale', l: 'Tú:', lo: 'Lo tradicional me llena', hi: 'Explorar es esencial' },
      { id: 'apertura_pareja', k: 'choice', l: 'Tu pareja:', o: [
        ['como_yo', 'Prefiero que sea como yo'], ['abra', 'Me gustaría que me abriera mundo'], ['respete', 'Necesito que respete mis límites sin presionarme']] },
    ] },
  { n: 36, b: 9, t: '¿Qué te hace sentir profundamente deseado/a — y qué te apaga por completo?',
    help: { start: 'No pienses en técnica: piensa en la última vez que te sentiste verdaderamente deseado/a. ¿Qué lo provocó? ¿Y qué gesto, frase o actitud te ha sacado por completo del momento?',
      why: 'Casi nada de lo que enciende a una persona pasa en la cama: pasa durante el día. Por eso lo cruzamos con cómo da cariño la otra persona, no con prácticas.' },
    parts: [
      { id: 'enciende', k: 'multi', max: 3, l: 'Me enciende (hasta 3)', nuevo: true, o: [
        ['escucha', 'Sentirme escuchado/a durante el día'], ['palabras', 'Palabras y coqueteo'], ['ternura', 'Contacto y ternura sin prisa'],
        ['iniciativa', 'Que tome la iniciativa'], ['juego', 'Juego y humor'], ['novedad', 'Novedad y sorpresa'],
        ['equipo', 'Sentirnos en equipo'], ['cuidado', 'Que me cuide en lo cotidiano']] },
      { id: 'apaga', k: 'multi', max: 3, l: 'Me apaga (hasta 3)', nuevo: true, o: [
        ['presion', 'Presión o insistencia'], ['criticas', 'Críticas o burlas'], ['pendientes', 'Conflictos sin resolver'],
        ['frialdad', 'Frialdad durante el día'], ['prisa', 'Prisa'], ['celular', 'Distracción con el celular'],
        ['descuido', 'Descuido personal'], ['comparaciones', 'Comparaciones']] },
      { id: 'deseado', k: 'text', l: 'En tus palabras', opcional: true },
    ] },
  { n: 37, b: 9, t: 'En tus relaciones pasadas, cuando uno quería y el otro no — ¿cómo lo manejaste tú?',
    note: '¿Con palabras, con distancia, con reclamo, con paciencia?',
    help: { why: 'Todas las parejas del mundo viven esto. No te descalifica haberlo manejado mal: descalifica no saber cómo lo manejas.' },
    parts: [{ id: 'desajuste', k: 'text' }] },
  { n: 38, b: 9, t: '¿Qué es innegociable para ti en lo sexual — como necesidad y como límite?',
    note: 'Esta respuesta decide coincidencias. Nadie humano la lee.',
    help: { why: 'Un límite callado hoy es una ruptura programada. Las cuatro filas cubren los desencuentros más comunes — incluido esperar al matrimonio, donde la fe y la intimidad se tocan. «Lo necesito» contra «No lo acepto» elimina el par, sin importar lo demás. Lo que no esté en la lista, escríbelo abajo.' },
    parts: [
      { id: 'sx', k: 'grid', nuevo: true, filtro: true, o: SX, rows: [
        ['sx_esperar', 'Esperar al matrimonio para la intimidad sexual'],
        ['sx_explorar', 'Explorar cosas nuevas juntos con regularidad'],
        ['sx_porno', 'Pornografía dentro de la relación'],
        ['sx_natural', 'Planificación familiar solo con métodos naturales']] },
      { id: 'innegociables', k: 'text', l: 'Algo más que sea innegociable para ti', opcional: true },
    ] },

  /* ── Módulo Profundo · Conciencia y vida interior (revisado en v2) ──────── */
  { n: 39, b: 10, t: '¿Qué prácticas sostienen tu vida interior — y qué papel esperas que jueguen en tu vida en pareja?',
    note: 'Oración, meditación, terapia, escribir, naturaleza… o ninguna. Todas son respuestas válidas.',
    help: { why: 'No nos digas qué crees: dinos qué HACES, y cada cuánto. Y si lo quieres compartir o solo necesitas que te lo respeten: son necesidades distintas.' },
    parts: [
      { id: 'practicas', k: 'multi', max: 5, l: 'Lo que de verdad practicas', nuevo: true, o: [
        ['oracion', 'Oración'], ['culto', 'Misa o culto'], ['meditacion', 'Meditación'], ['terapia', 'Terapia'],
        ['lectura', 'Lectura espiritual o filosófica'], ['diario', 'Escribir un diario'], ['naturaleza', 'Naturaleza'],
        ['cuerpo', 'Yoga o práctica corporal'], ['retiros', 'Retiros'], ['servicio', 'Servicio o voluntariado'], ['ninguna', 'Ninguna por ahora']] },
      { id: 'practicas_pareja', k: 'choice', l: 'Con tu pareja, esas prácticas…', nuevo: true, o: [
        ['juntos', 'Me gustaría compartirlas juntos'], ['espacio', 'Necesito que respete mi espacio para ellas'], ['igual', 'Me da igual']] },
      { id: 'practicas_texto', k: 'text', l: 'Qué haces y cada cuánto' },
    ] },
  { n: 40, b: 10, t: 'Sobre tu propio crecimiento: ¿dónde estás?',
    help: { why: 'El desnivel de conciencia es la fuente silenciosa de «ya no hablamos el mismo idioma» a los cinco años.' },
    parts: [
      { id: 'crecimiento', k: 'choice', o: [
        ['paz', 'Estoy en paz con quien soy; no busco reinventarme'], ['cuando', 'Trabajo en mí cuando la vida lo exige'],
        ['central', 'El crecimiento constante (terapia, lectura, práctica) es central en mi vida']] },
      { id: 'crecimiento_pareja', k: 'choice', l: '¿Y tu pareja?', o: [['conmigo', 'Necesito que crezca conmigo'], ['acompane', 'Basta con que me acompañe']] },
    ] },
  { n: 41, b: 10, t: 'Cuéntame la última vez que cambiaste de opinión sobre algo importante de ti mismo/a. ¿Qué te lo mostró?',
    parts: [{ id: 'cambie', k: 'text' }] },
];

// Índices útiles para el motor y el panel
export const PARTES = PREGUNTAS.flatMap((q) => q.parts.flatMap((p) =>
  p.k === 'grid' ? p.rows.map(([id, l]) => ({ ...p, id, l, n: q.n, b: q.b, grid: true })) : [{ ...p, n: q.n, b: q.b }]));
export const PARTE = Object.fromEntries(PARTES.map((p) => [p.id, p]));

// Etiqueta legible de un código ('hijos', 'inc_si' → 'Me inclino a que sí')
export function etiqueta(id, v) {
  const p = PARTE[id];
  if (!p || v == null) return v ?? '';
  const o = p.o ? Object.fromEntries(p.o) : null;
  if (Array.isArray(v)) return v.map((x) => (o && o[x]) || x).join(', ');
  return (o && o[v]) || String(v);
}

// Qué tan completo está un perfil (lo estructurado pesa: sin eso el motor no ve)
export function avance(r = {}) {
  const req = PARTES.filter((p) => !p.opcional && !(p.si && r[p.si.id] !== p.si.v));
  const lleno = (p) => {
    const v = r[p.id];
    if (v == null) return false;
    if (Array.isArray(v)) return v.length > 0;
    if (typeof v === 'string') return v.trim().length > 0;
    return true;
  };
  const est = req.filter((p) => p.k !== 'text');
  const txt = req.filter((p) => p.k === 'text');
  const e = est.filter(lleno).length, t = txt.filter(lleno).length;
  return {
    estructuradas: e, estructuradasTotal: est.length, textos: t, textosTotal: txt.length,
    pct: Math.round(100 * (e + t) / (est.length + txt.length)),
    // Entra al matching con todo lo estructurado + la carta: sin carta no hay primera impresión
    listo: e === est.length && lleno(PARTE.carta),
  };
}
// fin · RLR
