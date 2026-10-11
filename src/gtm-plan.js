/* ─────────────────────────────────────────────────────────────────────
   Cupido Algorítmico · El plan del go-to-market (el texto de las pestañas)
   RLR · Ricardo López Reyero
   Cada pestaña es una lista de bloques que pinta public/js/gtm.js:
     cabeza {e, t, s} · p {t} · cifras {l:[{n, t, s}]} · tarjetas {col, num, l:[{e, t, d, l, pie}]}
     pasos {l:[{t, cuando, d, l}]} · tabla {cab, filas, nota} · lista {l} · nota {tono, e, t}
     gente {l:[{n, r, q, a, u}]} · calc · boton {t, ir} · fuentes {t, l:[{t, u}]}
   En el texto: **negritas** y [liga](https://…).
   Regla de la casa para este archivo: todo dato lleva de dónde salió y de cuándo es; lo que es
   supuesto dice «supuesto». Los datos se verificaron el 10 de octubre de 2026.
   Los contactos de personas no se copian aquí (el repositorio es público): se liga su página oficial.
   ───────────────────────────────────────────────────────────────────── */
import { CONTROLES, SUPUESTOS_CONTROL } from './gtm-tareas.js';

export const _RLR = 'Ricardo López Reyero';
const _k = 'EYE', _rev = 181218;

// Los puntos de control viven en gtm-tareas.js (ahí está cada número): aquí solo se escriben como tabla para leerlos de corrido
const MESES = ['enero', 'febrero', 'marzo', 'abril', 'mayo', 'junio', 'julio', 'agosto', 'septiembre', 'octubre', 'noviembre', 'diciembre'];
const diaLargo = (iso) => { const [a, m, d] = iso.split('-').map(Number); return `${d} de ${MESES[m - 1]} de ${a}`; };
const miles = (n) => String(n).replace(/\B(?=(\d{3})+(?!\d))/g, ',');
const pesos = (n) => (n >= 1e6 ? `$${miles(n / 1e6)} millones` : `$${miles(n)}`);

/* ═══ RESUMEN ═════════════════════════════════════════════════════════ */
const resumen = [
  { k: 'cabeza', e: 'La idea en una frase', t: 'No llenamos una app: encendemos ciudades.', s: 'Cupido solo sirve donde hay suficiente gente cerca para que alguien pase de 90 % contigo. Por eso el plan no es «conseguir usuarios»: es encender una ciudad, demostrarlo con números y repetirlo con un manual.' },
  { k: 'cifras', l: [
    { n: '47.5 M', t: 'adultos sin pareja conyugal en México', s: '46.1 % de las personas de 15 años o más. INEGI, 3T 2025 (suma propia de sus cifras; «soltero» no excluye noviazgo).' },
    { n: '8.6 M', t: 'usan hoy una app de citas en México', s: '38.7 millones las han descargado alguna vez. The CIU, febrero de 2026.' },
    { n: '32.5 y 35.4', t: 'años al casarse, ellas y ellos', s: 'La gente se casa cada vez más tarde: busca más tiempo. INEGI, matrimonios 2025.' },
    { n: '635.7 M', t: 'personas hablan español', s: 'El techo de todo esto. Instituto Cervantes, octubre de 2025.' },
  ] },
  { k: 'nota', tono: 'ojo', e: 'Sobre los 10 millones «todos los días».', t: 'Cupido está hecho para que nadie tenga que entrar diario: contestas una vez y el motor busca por ti. Por eso aquí la meta se mide en **perfiles vivos**: 10 millones de personas con su perfil completo y activo, a las que el motor les busca pareja todos los días. Son más que todos los que hoy usan apps de citas en México (8.6 millones): no se llega quitándole gente a Tinder, sino trayendo a quienes ya se fueron de las apps o nunca entraron, y saliendo después a todo el mundo que habla español. Si además se quiere que la gente abra Cupido a diario, eso pide construir «Mientras esperan a Cupido», que sigue pendiente de decisión.' },

  { k: 'cabeza', e: 'Por qué ahora', t: 'La categoría entera está buscando otra forma' },
  { k: 'tarjetas', col: 3, l: [
    { t: 'Las apps de siempre van de bajada', d: 'El grupo dueño de Tinder perdió 6 % de sus usuarios de pago en un año y Bumble 16 %. Las dos despidieron gente en 2025. En mayo de 2026 Bumble quitó el gesto de deslizar. (Informes del 2T 2026 de Match Group y Bumble.)' },
    { t: 'La gente está cansada', d: '78 % de quienes usan apps de citas dice sentir agotamiento (Forbes Health, Estados Unidos, 2024). En México, quienes no las usan dan una razón: inseguridad (The CIU, 2026).' },
    { t: 'El miedo tiene motivos', d: 'Secuestros exprés con citas de Tinder en la Ciudad de México (septiembre de 2025). Ocho de cada diez sextorsiones que atendió el Consejo Ciudadano ocurrieron en Facebook Parejas. «Aquí manda ella» no es un lema: es la respuesta a eso.' },
  ] },

  { k: 'cabeza', e: 'La estrategia', t: 'Las siete ideas que sostienen el plan' },
  { k: 'tarjetas', col: 2, num: true, l: [
    { t: 'La ciudad es la unidad', d: 'Un perfil solo vale si hay con quién cruzarlo cerca. Mil personas repartidas en veinte ciudades son mil silencios; mil en una sola ciudad son las primeras puertas. Una ciudad a la vez, hasta que se enciende.' },
    { t: 'Una fecha vuelve urgente lo que no lo es', d: 'Nadie tiene prisa por contestar 43 preguntas. El caso más parecido del mundo, Marriage Pact, logra que entre 45 % y 60 % de una universidad conteste 50 preguntas en una semana, sin publicidad, porque hay una fecha de cierre y un solo día de resultados. Eso es el Gran Cruce.' },
    { t: 'Invitar te conviene', d: 'En una app de catálogo, cada persona nueva es competencia. Aquí no hay catálogo: cada persona nueva sube tu probabilidad. Es el único producto de pareja donde compartir es egoísta en el buen sentido, y hay que decirlo así.' },
    { t: 'El cuestionario no es el obstáculo: es el evento', d: 'Lo más pesado (contestar) se vuelve una noche con gente: la Noche de las 43. Los encuentros en grupo ya funcionan en México (Timeleft llena cenas de desconocidos en cinco ciudades) y a las mujeres les dan más seguridad que el uno a uno.' },
    { t: 'Ella llega sola; a ellos hay que traerlos', d: 'En los sistemas serios sobran mujeres y faltan hombres: en Marriage Pact cientos de mujeres se quedan sin par cada año por eso. La casa es de ella, y por lo mismo el plan cuida el equilibrio desde el primer día: cada fundadora trae a un buen hombre.' },
    { t: 'Publicar no alcanza: alguien más tiene que decirlo', d: 'Una cuenta chica de TikTok promedia 350 vistas por video. El material propio (325 imágenes y 154 videos) sirve para que la casa se vea armada; el crecimiento viene de personas invitando, noches, creadores, prensa y comunidades.' },
    { t: 'La confianza es el producto', d: 'Datos íntimos, mujeres y citas con desconocidos: un solo caso malo acaba con una ciudad. Por eso la fase 1 no es marketing: es privacidad, verificación, reportes y reglas escritas.' },
  ] },

  { k: 'cabeza', e: 'La meta, por escalones', t: 'De mil a diez millones' },
  { k: 'tabla', cab: ['Perfiles vivos', 'Para cuándo', 'Dónde', 'Qué lo prueba'], filas: [
    ['1,000', '31 de diciembre de 2026', 'La Laguna', 'Las primeras puertas abiertas y la tasa de par real'],
    ['5,000', '14 de febrero de 2027', 'La Laguna, encendida', 'La mayoría recibe al menos un aviso el día del Cruce'],
    ['10,000', 'Abril de 2027', 'Más Monterrey y Saltillo', 'El manual funciona sin el fundador en la sala'],
    ['100,000', 'Diciembre de 2027', 'Diez ciudades de México', 'Cada perfil trae a otro y el costo por perfil no sube'],
    ['1,000,000', 'Diciembre de 2028', 'México y los hispanos de Estados Unidos', 'Empieza el cobro del programa y la gente se queda'],
    ['10,000,000', '2030', 'El mundo que habla español', 'Parejas que siguen juntas un año después'],
  ], nota: 'Son metas, no pronósticos. De 5,000 a 10 millones hay once duplicaciones: duplicando cada cuatro meses se llega en octubre de 2030; cada tres, en noviembre de 2029. La escalera pide duplicar cada dos o tres meses en 2027 y afloja después. Señal de alarma: si a las cuatro semanas de abrir una ciudad no hay 300 perfiles, no se abre la siguiente.' },

  { k: 'nota', e: 'Cada escalón se revisa con dos números: usuarios al mes e ingreso al mes.', t: 'Están metidos en Tareas como **puntos de control**, junto a la actividad que debería producirlos, y la franja de arriba enseña cómo van hoy. De dónde sale cada meta está en Números.' },

  { k: 'cabeza', e: 'El camino', t: 'Los cinco pasos' },
  { k: 'pasos', l: [
    { t: 'La casa lista', cuando: 'Del 12 al 31 de octubre de 2026', d: 'Antes de invitar a nadie: poder medir, cuidar y explicar.', l: ['Medir el embudo y dar un código a cada canal.', 'Aviso de privacidad para datos sensibles, verificación de identidad y protocolo de reportes.', 'Las redes armadas con lo que ya existe y el video del fundador.', 'Ver a diez personas contestar en su teléfono y arreglar las cinco fugas más grandes.'] },
    { t: 'Las primeras 1,000 en La Laguna', cuando: 'Noviembre y diciembre de 2026 · arranque público el 11 de noviembre, Día del Soltero', d: 'Persona a persona. Nada de anuncios todavía.', l: ['Cien fundadoras invitadas una por una; cada una trae a un buen hombre.', 'Treinta madrinas, diez embajadoras y dos Noches de las 43 al mes.', 'Creadores con público lagunero, PLAYERS, El Siglo, Milenio, Telediario y radio.', 'Diez invitaciones personales al día y tres piezas diarias del banco.'] },
    { t: 'El Gran Cruce', cuando: 'Del 3 de enero al 14 de febrero de 2027', d: 'Una fecha, un termómetro y toda la ciudad hablando de lo mismo.', l: ['El 3 de enero, el domingo en que más gente abre apps de citas: «este año no deslices».', 'Cuenta regresiva de 42 días con el termómetro de la ciudad.', 'Semana de noches, veinte creadores a la vez y la primera radiografía.', 'El 14 de febrero, que cae en domingo: todos los avisos el mismo día. Abren Monterrey y Saltillo.'] },
    { t: 'Ciudad por ciudad', cuando: 'De marzo a diciembre de 2027', d: 'El manual de La Laguna, repetido con alguien responsable en cada plaza.', l: ['Una ciudad nueva cada cuatro a seis semanas, solo si la anterior ya camina.', 'Redes nacionales: exalumnos, iglesias, clubes, bodas.', 'Creadores nacionales, gira de pódcasts y la radiografía del mes.', 'Cupido en las tiendas de apps y la lista de espera diciendo qué ciudad sigue.'] },
    { t: 'Escala', cuando: 'De 2028 en adelante', d: 'México completo, Estados Unidos y después cada país que habla español.', l: ['Las 32 capitales y Texas, California e Illinois.', 'Colombia, Argentina, Chile, Perú y España, con alguien de ahí en cada uno.', 'Empieza a cobrarse lo que el programa prometió desde 2026, sin sorpresas.', 'El número que manda pasa a ser: parejas que siguen juntas.'] },
  ] },

  { k: 'cabeza', e: 'Rápido, con poco desgaste y poco dinero', t: 'Cinco reglas para no gastar de más' },
  { k: 'lista', l: [
    '**Lo que ya existe no se vuelve a hacer.** 325 imágenes ya en orden de publicación, 154 videos, mensajes de WhatsApp, 22 correos y la app. El trabajo es repartir, no producir.',
    '**Lo que puede hacer una IA, lo hace una IA.** Más de la mitad de la lista la hace o la ayuda a hacer una IA. La persona se queda con lo que no se delega: llamar, dar la cara y llenar una sala.',
    '**Nada pagado hasta saber cuánto cuesta un perfil vivo.** Primero una prueba de tres mil pesos; solo se sube si el costo queda bajo el tope.',
    '**Una ciudad a la vez.** Abrir dos antes de encender una duplica el gasto y no acerca a nadie.',
    '**Cada lunes, una sola decisión.** Seis números, treinta minutos. Lo que no trae perfiles vivos se deja de hacer esa semana.',
  ] },
  { k: 'nota', tono: 'bien', e: 'Cómo usar esta página.', t: 'Quien llegue a ejecutar recibe una sola instrucción: «sigue el go-to-market». Lee una vez la Estrategia; después vive en Tareas. Cada palomita queda guardada con su correo y su hora, y la franja de arriba enseña los números de verdad.' },
  { k: 'boton', t: 'Ir a la lista →', ir: 'checklist' },
  { k: 'fuentes', t: 'De dónde salen los datos de todo el plan', l: [
    { t: 'INEGI · Estadísticas a propósito del 14 de febrero (situación conyugal, ENOE 3T 2025)', u: 'https://www.inegi.org.mx/contenidos/saladeprensa/aproposito/2026/EAP_14FEB_26.pdf' },
    { t: 'INEGI · Matrimonios 2025 (edad al casarse, 491,640 matrimonios)', u: 'https://www.inegi.org.mx/contenidos/saladeprensa/boletines/2026/emat/EMAT2025_CP.pdf' },
    { t: 'INEGI · Divorcios 2025 (155,254; edad al divorcio)', u: 'https://www.inegi.org.mx/contenidos/saladeprensa/boletines/2026/ed/ED2025_CP.pdf' },
    { t: 'INEGI · ENDUTIH 2025 (104.9 millones de usuarios de internet)', u: 'https://www.inegi.org.mx/contenidos/saladeprensa/boletines/2026/endutih/ENDUTIH_25.pdf' },
    { t: 'DataReportal · Digital 2026 México (alcance de Facebook, TikTok, YouTube e Instagram)', u: 'https://datareportal.com/reports/digital-2026-mexico' },
    { t: 'AIMX 2026 · WhatsApp en 91 % de los internautas (nota de SDP Noticias)', u: 'https://www.sdpnoticias.com/estados/aimx-revela-habitos-digitales-de-mexicanos-en-2026-ia-redes-sociales-y-compras-online/' },
    { t: 'The CIU, feb 2026 · 38.7 millones han descargado apps de citas; 8.6 millones activos (Crónica)', u: 'https://www.cronica.com.mx/nacional/2026/02/13/citas-digitales-en-mexico-mas-de-86-millones-de-personas-buscan-el-amor-por-aplicacion/' },
    { t: 'Expansión · Hinge entra a México; qué apps usan los mexicanos (sep 2025)', u: 'https://expansion.mx/tecnologia/2025/09/24/hinge-entra-al-ring-citas-de-apps-mexico' },
    { t: 'SEDATU-CONAPO-INEGI · Metrópolis de México 2020 (tamaño de las zonas metropolitanas)', u: 'https://www.gob.mx/cms/uploads/sedatu/MM2020_06022024.pdf' },
    { t: 'IMPLAN Torreón · Zona Metropolitana de La Laguna 2025', u: 'https://trcimplan.gob.mx/estudios/aspectos-socioeconomicos-ZML-2025/aspectos-socioeconomicos-ZML-2025.pdf' },
    { t: 'Match Group · resultados del 2T 2026 (SEC)', u: 'https://www.sec.gov/Archives/edgar/data/0000891103/000089110326000128/mtch8-k20260804ex991.htm' },
    { t: 'Bumble · resultados del 2T 2026 (Business Wire)', u: 'https://www.businesswire.com/news/home/20260805016041/en/' },
    { t: 'Fortune · despidos en Match Group (may 2025)', u: 'https://fortune.com/2025/05/08/match-group-layoffs-spencer-rascoff' },
    { t: 'Fortune · despidos en Bumble (jun 2025)', u: 'https://fortune.com/2025/06/25/bumble-layoffs-surprise-jpmorgan-analysts' },
    { t: 'ABC7 · Bumble elimina el deslizar y presenta su asistente (may 2026)', u: 'https://abc7news.com/post/dating-app-bumble-ends-swipe-feature-introduces-ai-assistant-matchmaking/19100191/' },
    { t: 'Global Dating Insights · las funciones de IA de Tinder leen el carrete de fotos', u: 'https://www.globaldatinginsights.com/news/tinders-new-ai-features-scan-camera-rolls-for-vibe-insights' },
    { t: 'Global Dating Insights · 78 % con fatiga de apps (Forbes Health, 2024)', u: 'https://www.globaldatinginsights.com/featured/survey-finds-over-three-quarters-are-suffering-dating-app-fatigue/' },
    { t: 'Pew Research · experiencias de las mujeres en apps de citas (EE. UU.)', u: 'https://www.pewresearch.org/short-reads/2023/02/02/key-findings-about-online-dating-in-the-u-s/' },
    { t: 'Marriage Pact · sitio oficial (750,000 participantes)', u: 'https://marriagepact.com/' },
    { t: 'Fortune · qué es Marriage Pact (mecánica, 60 % de Stanford en una semana)', u: 'https://fortune.com/2024/04/10/what-is-the-marriage-pact-dating-apps-stanford-economics-project' },
    { t: 'The Daily Pennsylvanian · Marriage Pact en Penn 2024 (45 % de la licenciatura, solo boca a boca)', u: 'https://www.thedp.com/article/2024/10/penn-marriage-pact-fifth-year' },
    { t: 'The Villanovan · 639 mujeres sin par por falta de hombres (2025)', u: 'https://villanovan.com/28247/news/marriage-pact-results-broken-down/' },
    { t: 'The Harvard Crimson · Datamatch 2025', u: 'https://www.thecrimson.com/article/2025/2/19/datamatch-2025-reax/' },
    { t: 'Global Dating Insights · Thursday cierra su app y se queda con los eventos (ene 2025)', u: 'https://www.globaldatinginsights.com/featured/thursday-shutters-dating-app-to-shift-focus-on-real-world-events/' },
    { t: 'DailyMax · Timeleft, de cero a un millón de euros al mes (y lo que salió mal)', u: 'https://dailymax.substack.com/p/timeleft-de-0-a-1-million-deuros' },
    { t: 'CDMX Secreta · Timeleft en México', u: 'https://cdmxsecreta.com/timeleft-cdmx/' },
    { t: 'Fortune · Strava: los clubes de corredores y las citas', u: 'https://fortune.com/2025/10/13/strava-ipo-ceo-michael-martin-gen-z-running-clubs-marathons-dating-apps' },
    { t: 'Entrepreneur · cómo arrancó Tinder en las universidades', u: 'https://www.entrepreneur.com/article/253165' },
    { t: 'The Harvard Crimson · OkTrends, el blog de datos de OkCupid', u: 'https://thecrimson.com/article/2011/5/24/blog-rudder-dating-okcupid' },
    { t: 'Wikipedia · eHarmony (cuestionario, cifras y el «científicamente probado» rechazado)', u: 'https://en.wikipedia.org/wiki/EHarmony' },
    { t: 'Global Dating Insights · Dating Sunday 2026', u: 'https://www.globaldatinginsights.com/featured/dating-sunday-drives-annual-surge-in-app-activity-for-2026/' },
    { t: 'Socialinsider · vistas promedio en TikTok por tamaño de cuenta (2025)', u: 'https://www.socialinsider.io/blog/tiktok-benchmarks/' },
    { t: 'Unbounce · conversión mediana de páginas de aterrizaje', u: 'https://unbounce.com/?p=95294' },
    { t: 'Saxifrage · referencias de factor de viralidad', u: 'https://www.saxifrage.xyz/post/k-factor-benchmarks' },
    { t: 'Influencer Marketing Hub · tarifas de microcreadores (global, 2026)', u: 'https://influencermarketinghub.com/?p=224915' },
    { t: 'Ley Federal de Protección de Datos Personales en Posesión de los Particulares (2025)', u: 'https://www.diputados.gob.mx/LeyesBiblio/pdf/LFPDPPP.pdf' },
    { t: 'El Imparcial · detenidos por secuestros exprés con citas de Tinder (sep 2025)', u: 'https://www.elimparcial.com/mexico/2025/09/27/detienes-a-dos-policias-en-cdmx-por-participar-en-secuestros-expres-con-citas-de-tinder/' },
    { t: 'La Razón · sextorsión en Facebook Parejas (Consejo Ciudadano, feb 2025)', u: 'https://www.razon.com.mx/ciudad/2025/02/13/en-facebook-parejas-8-de-cada-10-casos-de-sextorsion/' },
    { t: 'Instituto Cervantes 2025 · hablantes de español (La Nación)', u: 'https://www.lanacion.com.ar/cultura/mas-de-635-millones-de-personas-hablan-espanol-crece-5-en-un-ano-y-se-afianza-como-la-tercera-lengua-nid28102025/' },
    { t: 'U.S. Census · población hispana en Estados Unidos (2025)', u: 'https://www.census.gov/newsroom/facts-for-features/2026/hispanic-heritage-month.html' },
  ] },
];

/* ═══ ATAJOS ══════════════════════════════════════════════════════════ */
const atajos = [
  { k: 'cabeza', e: 'Lo que hoy no estamos viendo', t: 'Dieciséis atajos', s: 'Ninguno pide presupuesto grande. Varios piden una decisión de producto, y esas están marcadas en la lista. Van en orden de cuánto mueven la aguja ahora.' },
  { k: 'tarjetas', col: 2, num: true, l: [
    { e: 'Fase 1 a 3 · el corazón del plan', t: 'Enciende tu ciudad', d: 'Una página por ciudad con un termómetro («La Laguna: 312 de 3,000») y una fecha: el día en que salen todos los avisos a la vez. La gente deja de esperar en silencio sin saber por qué y empieza a empujar su propia ciudad.', l: ['**Por qué funciona:** Marriage Pact, lo más parecido que existe, junta a 45 % de una universidad en siete días sin gastar en publicidad: fecha de cierre y un solo día de resultados. Ya van 750,000 participantes.', '**Primer paso:** decidir la regla del Cruce y construir el termómetro.', '**Cuesta:** trabajo de producto; nada de dinero.'] },
    { e: 'Fase 2', t: 'La Noche de las 43', d: 'Cuarenta personas en un café, un martes. Se contesta el cuestionario ahí, con anfitriona y tres pausas para comentar una pregunta al aire. No es para ligar: es para acabar. Lo más pesado del producto se vuelve la experiencia.', l: ['**Por qué funciona:** quien va, termina. Timeleft llena cenas de desconocidos en cinco ciudades de México, y dejó los encuentros uno a uno porque en grupo las mujeres se sienten seguras.', '**Primer paso:** una sede y una fecha esta semana.', '**Cuesta:** unos $2,500 por noche; la sede pone el lugar.'] },
    { e: 'Fase 2', t: 'A los buenos los traen ellas', d: 'Cada fundadora invita a un hombre al que respeta: su hermano, su primo, su amigo, su compañero. Él entra recomendado por una mujer, que es la mejor credencial que puede tener en una casa donde manda ella.', l: ['**Por qué funciona:** el problema de los sistemas serios es la falta de hombres. En Villanova, 639 mujeres se quedaron sin par en 2025 por eso. Nadie lo está resolviendo así.', '**Primer paso:** que el mensaje de invitación de ellas tenga la versión «para un buen hombre».', '**Cuesta:** nada.'] },
    { e: 'Fase 2', t: 'Las madrinas', d: 'Quien ya tiene pareja no puede usar Cupido, pero conoce a cinco solteros. Mamás, tías, la dueña del salón, la amiga que presenta a todos. Con su liga de madrina y su contador de cuánta gente trajeron.', l: ['**Por qué funciona:** 91 % de quienes usan internet en México tiene WhatsApp. Los grupos de familia son la red más grande del país y ninguna app de citas puede entrar ahí. Nosotros sí: no enseñamos a nadie.', '**Primer paso:** treinta nombres en una hoja.', '**Cuesta:** construir la liga de madrina.'] },
    { e: 'Fase 1', t: 'Invitar te conviene, con un número', d: 'En el tablero: «Hoy el motor te puede cruzar con 212 personas de tu ciudad». El silencio deja de sentirse como rechazo y se vuelve una razón honesta para compartir.', l: ['**Por qué funciona:** un programa de referidos normal trae 0.04 personas por cada usuario; lo excelente es 0.4. La diferencia es que aquí invitar sí le sirve a quien invita.', '**Primer paso:** el dato en el tablero y la pantalla «ahora invita a tres».', '**Cuesta:** trabajo de producto.'] },
    { e: 'Fase 3 en adelante', t: 'La radiografía', d: 'Con las respuestas en agregado: cómo quiere La Laguna, qué no negocian las mujeres de 30 a 40, en qué se parecen las parejas que sí abren la puerta. Un dato al mes.', l: ['**Por qué funciona:** el blog de datos de OkCupid tenía un millón de lectores al mes con un solo autor y un texto cada seis semanas. Los medios publican datos solos.', '**Primer paso:** dejar escrita la regla: nada con menos de mil personas ni grupos de menos de cincuenta.', '**Cuesta:** nada; pide cuidar la privacidad con lupa.'] },
    { e: 'Fase 2 en adelante', t: 'Las 43 como programa', d: 'Las preguntas son el contenido. Alguien conocido contesta tres a cámara y dice cuál le costó más. Una serie de calle con una sola pregunta. El cierre siempre es el mismo: «faltan cuarenta».', l: ['**Por qué funciona:** los programas de citas en video tienen público enorme (Somos Bubble: 147 millones de vistas en año y medio) y los pódcasts que hablan de relaciones tienen cientos de miles de seguidores. No necesitan otro producto: necesitan buenas preguntas.', '**Primer paso:** grabar cinco episodios con gente de la ciudad.', '**Cuesta:** un teléfono y una tarde.'] },
    { e: 'Fase 2', t: 'Las terapeutas primero', d: 'Cinco terapeutas de pareja contestan el cuestionario, lo critican y dicen en cámara lo que opinan. Lo que corrijan, se corrige. Después escriben en Artículos y lo recomiendan cuando un paciente pregunta dónde buscar.', l: ['**Por qué funciona:** dan lo que una marca nueva no puede comprar: criterio. Y su público ya quiere una relación en serio.', '**Ojo:** nunca decir «científicamente comprobado». A eHarmony se lo prohibieron en Reino Unido.', '**Cuesta:** su tiempo; se les ofrece visibilidad y, cuando llegue, el acompañamiento del programa.'] },
    { e: 'Fase 2 en adelante', t: 'La mesa de los solteros', d: 'En México hubo 491,640 bodas en 2025. En cada una hay una mesa de solteros pensando exactamente en esto. Una tarjeta en esa mesa, con la complicidad de la organizadora.', l: ['**Por qué funciona:** es el momento del año en que más se piensa en pareja, y la novia es la mejor madrina.', '**Primer paso:** tres organizadoras de bodas de La Laguna.', '**Cuesta:** imprimir tarjetas.'] },
    { e: 'Fase 2', t: 'Donde la gente ya se junta', d: 'Clubes de correr, pádel, baile, ciclismo. Tres minutos al terminar y un QR. Ahí está quien no quiere una app pero sí quiere conocer a alguien.', l: ['**Por qué funciona:** según Strava, en un año se crearon 3.5 veces más clubes de corredores y una de cada cinco personas ha tenido una cita con alguien de su club. Es el lugar de moda para conocerse, y nadie les ofrece algo serio.', '**Primer paso:** cinco clubes de la ciudad.', '**Cuesta:** nada.'] },
    { e: 'Fase 1', t: 'El algoritmo se puede leer', d: 'El código de Cupido es público. Mientras Tinder estrena una función (opcional) que lee el carrete de fotos de tu teléfono, aquí cualquiera puede leer cómo se decide y comprobar que el motor es ciego a la cara.', l: ['**Por qué funciona:** es una nota de tecnología que se escribe sola y un argumento de confianza que nadie más puede usar.', '**Primer paso:** decidir que el repositorio se queda abierto y escribir «cómo decide Cupido» para gente que no programa.', '**Cuesta:** nada. Ojo: mientras siga abierto, este plan también se puede leer ahí.'] },
    { e: 'Fase 4', t: 'Segunda vuelta', d: 'Personas divorciadas, separadas y viudas de 35 a 55 años. Tres de cada diez adultos de 30 a 59 no tienen pareja conyugal. Hubo 155,254 divorcios en 2025, a los 41 años ellas y a los 43 ellos.', l: ['**Por qué funciona:** las apps les hablan a los de 25. Este grupo tiene hijos, innegociables claros y cero paciencia para deslizar: justo lo que el cuestionario sabe cruzar.', '**Dónde están:** en Facebook (93.5 millones en México) y en pódcasts como Salida de Emergencia.', '**Cuesta:** una línea de piezas y una página propia.'] },
    { e: 'Fase 3', t: 'El primer domingo de enero', d: 'En todo el mundo es el día del año en que más gente abre una app de citas: Hinge registra 31 % más «me gusta» que un domingo normal. En 2027 cae el 3 de enero y la temporada alta termina el 14 de febrero, que cae en domingo.', l: ['**Por qué funciona:** la gente ya trae la intención; solo hay que estar ahí con otra propuesta: «este año no deslices».', '**Primer paso:** que la cuenta regresiva del Gran Cruce empiece ese día.', '**Cuesta:** nada; es calendario.'] },
    { e: 'Fase 2', t: 'El Fondo de atracción, por ciudad', d: 'Ya existe como apoyo voluntario. Con cuentas claras y por ciudad, quien está adentro puede pagar para que llegue más gente a la suya: «con esto traemos a 500 personas más a La Laguna».', l: ['**Por qué funciona:** es el mismo interés propio de invitar, para quien tiene más dinero que tiempo. Y paga la publicidad sin tocar la regla de cero anuncios adentro.', '**Primer paso:** la página pública de cuentas.', '**Cuesta:** nada.'] },
    { e: 'Fase 1', t: 'Que la IA nos recomiende', d: 'Cada vez más gente le pregunta a un asistente «¿cómo encuentro una relación seria?» antes que a Google. Los asistentes repiten lo que encuentran escrito con claridad.', l: ['**Por qué funciona:** casi nadie lo está cuidando en español y es barato: una página «qué es» sin adornos, preguntas frecuentes, el comparativo y los 43 artículos.', '**Primer paso:** el resumen para modelos y los datos estructurados.', '**Cuesta:** una tarde de IA.'] },
    { e: 'Fase 4 y 5', t: 'El otro lado de la frontera', d: 'En Estados Unidos viven 70.1 millones de hispanos; unos 13 millones en Texas. Muchos quieren pareja con la misma cultura y la misma fe, y ninguna app grande se los resuelve.', l: ['**Por qué funciona:** es el mismo idioma, el mismo producto y un público con más poder de compra para cuando el programa cobre.', '**Primer paso:** poner las ciudades en la lista de espera y medir.', '**Cuesta:** revisión legal antes de abrir.'] },
  ] },
  { k: 'nota', tono: 'ojo', e: 'Un atajo que se queda en prueba.', t: 'Dejar que dos personas que ya se conocen (amigos o una pareja) contesten y vean su cruce daría muchísimo contenido, pero un número bajo puede lastimar a una pareja de verdad. Está en la lista para la fase 4, como prueba chica y con decisión de Ricardo.' },
  { k: 'p', t: 'Las fuentes de cada cifra están al final del Resumen.' },
];

/* ═══ LANZAMIENTO ═════════════════════════════════════════════════════ */
const lanzamiento = [
  { k: 'cabeza', e: 'Cómo lucimos', t: 'Negro sobre blanco, y un corazón' },
  { k: 'tarjetas', col: 3, l: [
    { t: 'Un solo color', d: 'Texto negro, fondo blanco y el corazón rosa. Fraunces para decir, Inter para explicar. Si una pieza necesita más que eso, le sobra algo.' },
    { t: 'Sin caras', d: 'El algoritmo es ciego a la cara y la marca también. Nada de parejas de catálogo ni fotos de archivo. Palabras, números y, cuando hay personas, personas de verdad hablando.' },
    { t: 'Sin prometer amor', d: 'Nunca «encuentra al amor de tu vida» ni «comprobado por la ciencia». Se promete lo que sí se controla: preguntas serias, silencio, control y un aviso solo arriba de 90 %.' },
    { t: 'La voz', d: 'Seria sin ser solemne. Frases cortas, de tú. Cabe el humor (la tía que pregunta por el novio); nunca la burla de quien está solo.' },
    { t: 'Tres mensajes madre', l: ['Aquí manda ella.', 'Contesta una vez; nosotros buscamos.', 'Lo contrario a todo lo que has conocido de citas.'] },
    { t: 'Lo que nunca', l: ['Publicidad dentro de Cupido.', 'Cuentas falsas o seguidores comprados.', 'Testimonios pagados sin decirlo.', 'Hablar mal de alguien por su nombre.'] },
  ] },

  { k: 'cabeza', e: 'Cómo lo acomodamos', t: 'Cinco pilares y una sola casa en cada red' },
  { k: 'tabla', cab: ['Pilar', 'Qué dice', 'De dónde sale', 'Peso'], filas: [
    ['Ella manda', 'Nadie te ve, nadie te escribe sin tu sí, y diez bloqueos sacan a cualquiera.', 'Series «ella», «puerta» y «limpio» de Compartir', '25 %'],
    ['Las 43 preguntas', 'Lo que nadie pregunta en las primeras diez citas.', 'Series «preguntas» y «sentir»; serie de calle', '25 %'],
    ['Lo contrario a las apps', 'Sin catálogo, sin deslizar, sin pagar por que te vean.', 'Series «contrario» y «serio»', '20 %'],
    ['Los números', 'El 90 %, el doble sí, los datos del país.', 'Series «datos», «noventa» y «cómo»; la radiografía', '15 %'],
    ['Tu ciudad se enciende', 'Cómo va tu ciudad y por qué invitar te conviene.', 'Serie «invitar», el termómetro y las piezas locales', '15 %'],
  ], nota: 'Además, desde la primera semana, una de cada cinco piezas va dirigida a ellos (serie «él»). El gancho de un día sí y otro no es una «verdad incómoda»: 50 frases con su fuente, que van en negro. El orden completo ya está armado en [Compartir → La cuenta](/compartir#cuenta).' },
  { k: 'tarjetas', col: 2, l: [
    { t: 'Cada perfil, igual', l: ['El mismo usuario en todas las redes.', 'La insignia como foto y la frase de una línea.', 'Una liga por red, con su código, para saber cuál trae gente.', 'Tres videos fijados: qué es, aquí manda ella y cómo se ve por dentro.', 'Doce piezas publicadas antes de anunciar nada.'] },
    { t: 'El camino de una persona', d: 'Cada paso tiene su número en la fase 1. Donde más gente se cae es donde se trabaja.', l: ['Ve una pieza o le llega un mensaje.', 'Entra a la liga y ve la portada (o la cuenta demo).', 'Deja su correo y hace el recorrido.', 'Contesta las 43, sola o en una noche.', 'Invita a tres y ve cómo va su ciudad.', 'Aviso, doble sí y charla.'] },
  ] },

  { k: 'cabeza', e: 'Dónde lanzamos', t: 'Primero la casa, luego el norte, luego el país' },
  { k: 'tabla', cab: ['Ciudad', 'Tamaño', 'Por qué', 'Cuándo'], filas: [
    ['La Laguna', '1.38 millones (Censo 2020); 1.54 con cinco municipios en 2025', 'La casa del fundador: medios cercanos y noches fáciles de llenar. Y una ciudad donde «todos se conocen» es donde más vale que nadie te vea.', 'Noviembre de 2026'],
    ['Monterrey', '5.32 millones', 'El mercado grande del norte, con creadores de público regio ya ubicados y medios que comparten dueño con los de La Laguna.', 'Febrero de 2027'],
    ['Saltillo', '—', 'El puente entre las dos. Se abre junto con Monterrey.', 'Febrero de 2027'],
    ['Guadalajara', '5.11 millones', 'La segunda del país; ya tiene costumbre de encuentros en grupo.', '2027'],
    ['Ciudad de México', '21.44 millones', 'La más grande y la más cara de encender: se llega con el manual probado y con prensa nacional.', '2027'],
    ['Chihuahua, Querétaro, Puebla, León, Mérida, Tijuana', '—', 'El orden lo decide la lista de espera.', '2027'],
    ['Texas', 'Unos 13 millones de hispanos', 'Mismo idioma, misma cultura y nadie atendiéndolos así.', '2028'],
  ], nota: 'Por qué no empezar por la Ciudad de México: 5,000 perfiles en La Laguna son cerca de 3 de cada 100 personas sin pareja de 25 a 49 años (estimación propia con proporciones nacionales); todo el mundo conoce a alguien adentro. En la capital serían una gota.' },

  { k: 'cabeza', e: 'En qué redes', t: 'Para qué sirve cada una' },
  { k: 'tabla', cab: ['Red', 'Tamaño en México', 'Para qué', 'Qué va ahí', 'Cada cuánto'], filas: [
    ['WhatsApp', '91 % de quienes usan internet', 'Donde de verdad se invita. Aquí se convierte.', 'Canal con la pregunta del día; mensajes listos para una amiga, un amigo y un grupo; ligas personales', 'Diario'],
    ['TikTok', '99 millones de adultos alcanzables (dato de la plataforma)', 'Que te vea quien no te conoce.', 'Video vertical: una pregunta, un dato, «lo contrario»', '1 al día'],
    ['Instagram', '53.6 millones', 'Credibilidad: aquí revisa la gente si eres serio.', 'Las tres imágenes del día en el orden de La cuenta (al muro y a historias) y el video', '3 + 1 al día'],
    ['Facebook', '93.5 millones', 'La segunda vuelta, los grupos de la ciudad y las tías.', 'Las imágenes del día, los grupos locales y los eventos de las noches', '3 al día'],
    ['YouTube', '85 millones', 'Profundidad y buscador. Ahí viven los pódcasts.', 'Los mismos videos cortos; desde la fase 4, una conversación larga', '1 al día · 1 a la semana'],
    ['Pódcasts y radio', '—', 'Confianza prestada: lo cuenta alguien en quien ya creen.', 'Ir de invitado', '2 al mes'],
    ['Google y asistentes de IA', '—', 'Quien ya está buscando «app para relación seria».', 'Los 43 artículos y la página comparativa', '1 artículo a la semana'],
    ['Correo', 'El único canal propio', 'Hablarle a quien ya está adentro.', '«Tu ciudad va en…» y el boletín', 'Cada dos semanas'],
    ['LinkedIn y X', '—', 'La voz del fundador y la puerta a la prensa de negocios.', 'Cómo se construyó y los números abiertos', '1 o 2 a la semana'],
  ], nota: 'Alcance publicitario de DataReportal (octubre de 2025) y AIMX (mayo de 2026). No se abre ninguna otra red hasta encender la primera ciudad.' },

  { k: 'cabeza', e: 'Cuándo', t: 'Las fechas que ya existen' },
  { k: 'tabla', cab: ['Fecha', 'Qué es', 'Qué hacemos'], filas: [
    ['11 de noviembre de 2026 (miércoles)', 'Día del Soltero', 'Arranque público en La Laguna y primera Noche de las 43'],
    ['Diciembre de 2026', 'Posadas y cenas de fin de año', '«Para la tía que pregunta por el novio»'],
    ['3 de enero de 2027 (domingo)', 'El día en que más gente abre apps de citas', '«Este año no deslices»: arranca la cuenta regresiva de 42 días'],
    ['Del 25 al 31 de enero de 2027', 'La semana fuerte', 'Seis noches en seis sedes y veinte creadores a la vez'],
    ['14 de febrero de 2027 (domingo)', 'Día del Amor y la Amistad', 'El Gran Cruce de La Laguna. Abren Monterrey y Saltillo'],
    ['Marzo a mayo de 2027', 'Temporada de bodas', 'La mesa de los solteros'],
    ['10 de mayo de 2027', 'Día de las Madres', '«Mamá, ya me inscribí»'],
    ['11 de noviembre de 2027', 'Día del Soltero', 'Cruce en todas las ciudades abiertas'],
    ['2 de enero y 14 de febrero de 2028', 'Segunda temporada alta', 'El Gran Cruce nacional'],
  ] },
];

/* ═══ CREADORES ═══════════════════════════════════════════════════════ */
const yt = (u) => `https://www.youtube.com/@${u}`, ig = (u) => `https://www.instagram.com/${u}/`;
const busca = (q) => `https://www.youtube.com/results?search_query=${encodeURIComponent(q)}`;   // cuando no se leyó el usuario exacto del canal, se liga la búsqueda en vez de adivinarlo
const creadores = [
  { k: 'cabeza', e: 'A quién buscar', t: 'Creadores, pódcasts y medios, con nombre', s: 'Cada tamaño se leyó el 10 de octubre de 2026 en el canal de cada quien o en listados públicos. No son aliados: son a quién escribirle. Antes de escribir, vuelve a mirar: los números cambian.' },
  { k: 'nota', tono: 'ojo', e: 'Lo que falta.', t: 'Instagram, Facebook y TikTok no dejan leer sus cifras sin entrar; donde no hay dato, no lo inventamos. Quedaron cortas las listas de creadores que hablan solo de citas, de parejas y de grupos de Facebook de solteros: completarlas es una actividad de la fase 2. Aquí no se copian correos ni teléfonos (el código es público): cada nombre lleva a su página, donde está su contacto.' },

  { k: 'cabeza', e: 'Para empezar', t: 'Los veinte por donde yo empezaría' },
  { k: 'gente', l: [
    { n: 'Eva Latapi', r: 'YouTube 65 mil · Instagram 67 mil', q: 'Se presenta como terapeuta de rupturas amorosas; su pódcast Supéralo Por Favor lleva 484 episodios.', a: 'Vive de reparar lo que las apps rompen. Tamaño accesible y contacto directo en su sitio.', u: 'https://www.evalatapi.com/' },
    { n: 'PLAYERS of Life', r: 'Torreón 93,600 · Monterrey 84,500 · Saltillo 27,100 seguidores', q: 'Revista de estilo de vida y negocios del norte; cerca de 300 mil usuarios al mes según su kit de medios.', a: '«Un lagunero construyó un sistema para encontrar pareja sin fotos» es su nota natural. Tiene correo editorial público.', u: 'https://playersoflife.com/mediakit/' },
    { n: 'Romina Sacre', r: 'YouTube 79 mil · boletín y club de lectura', q: 'Conduce Sensibles y Chingonas y escribió «El amor en los tiempos del like».', a: 'Ya escribió el libro sobre este problema. Acepta colaboraciones desde su sitio.', u: 'https://www.rominasacre.com/prensa-y-collabs' },
    { n: 'Somos Bubble', r: 'YouTube 264 mil · 147 millones de vistas desde mayo de 2025', q: 'Canal mexicano de «experimentos sociales y dating shows».', a: 'El mejor candidato para la serie «Las 43»: ya hace el formato y tiene formulario abierto.', u: yt('somosbubble') },
    { n: 'Esmeralda Borrego', r: 'Instagram 102 mil · 50 % de su público en Torreón', q: 'Cuenta lagunera: la mitad de su público está en Torreón.', a: 'Para anunciar la primera noche. Su público es justo la ciudad semilla.', u: ig('esmeraldabdc') },
    { n: 'Mayquer Martínez', r: 'Instagram 71 mil · 68 % en Torreón', q: 'La cuenta con el público más local de toda la lista.', a: 'Para la cuenta regresiva del Gran Cruce: casi todo el que la ve vive ahí.', u: ig('mayquer_14') },
    { n: 'Cholafresa', r: 'Instagram 29 mil · 43 % en Torreón', q: 'Asados y música en La Laguna.', a: 'Llega a donde están ellos. Una noche con carne asada.', u: ig('cholafresa') },
    { n: 'Nan Covarrubias', r: 'Instagram 11 mil · 65 % en Torreón', q: 'Reseñas de comida en La Laguna.', a: 'Conoce los cafés de la ciudad: puede presentar las sedes de las noches.', u: ig('nancycovarrubias_') },
    { n: 'Andrea Lozano', r: 'Instagram 115 mil · 44 % en Monterrey', q: 'Experimentos sociales y comedia.', a: 'Para abrir Monterrey: una pregunta de las 43 en la calle.', u: ig('_andrealozano') },
    { n: 'Chic Magazine (Laguna y Monterrey)', r: 'Sociales y estilo de vida, del grupo Milenio', q: 'Lo que lee la ciudad para ver quién fue a qué.', a: 'La cena de fundadoras y la Noche del Cruce como evento social.', u: 'https://www.chicmagazine.com.mx/contactanos' },
    { n: 'Telediario y Milenio Laguna', r: 'Televisión y diario regionales (Multimedios)', q: 'Noticias de La Laguna, Monterrey y Saltillo.', a: 'La nota local primero, y la radiografía en febrero. El mismo grupo cubre las tres ciudades.', u: 'https://www.telediario.mx/contactenos' },
    { n: 'El Siglo de Torreón', r: 'El diario de casa', q: 'El periódico de referencia de La Laguna.', a: 'Falta conseguir el contacto: su sitio no se dejó leer. Se pide por un conocido.', u: 'https://www.elsiglodetorreon.com.mx/' },
    { n: 'Ismael García Delgado · Xataka México', r: 'Tres notas sobre apps de citas entre 2024 y 2026', q: 'Su nota más reciente sobre el tema es del 8 de octubre de 2026. El mismo medio publicó «Tinder ya pasó de moda» en agosto.', a: 'El ángulo es tecnología: un motor que se puede leer y que no mira fotos.', u: 'https://www.xataka.com.mx/contacto' },
    { n: 'Eréndira Reyes · Expansión', r: 'Editora de Tecnología', q: 'Expansión cubrió la llegada de Hinge a México.', a: 'El ángulo es «sin deslizar» y una empresa que no vive de la atención.', u: 'https://expansion.mx/directorio' },
    { n: 'Salida de Emergencia', r: 'YouTube 330 mil', q: 'Paola Serrano y Samuel Guzmán hablan de divorcio, amor y desamor con expertos.', a: 'La puerta a la segunda vuelta: gente que vuelve a empezar.', u: yt('SalidaDeEmergenciaPod') },
    { n: 'Sanando Relaciones', r: '155 episodios · audiencia sin verificar', q: 'Pódcast de Joaquín Domher, desde Monterrey, sobre los patrones al amar.', a: 'Chico, local y del tema exacto.', u: 'https://joaquindomher.com/' },
    { n: 'Las Damitas Histeria', r: 'YouTube 400 mil', q: 'Pódcast de humor sobre relaciones; nominadas en los premios de Spotify 2025.', a: 'El tema exacto, con humor. Tienen canal de WhatsApp.', u: yt('lasdamitashisteria') },
    { n: 'Tere Díaz Sendra', r: 'YouTube 47 mil · libros reeditados en abril de 2026', q: 'Terapeuta de pareja; escribe sobre infidelidad y «patanes».', a: 'Autoridad para revisar el cuestionario y decirlo en público.', u: 'https://www.terediaz.com/' },
    { n: 'Seis de Copas', r: 'YouTube 807 mil', q: 'Cinco amigas platicando; ganó la categoría de salud mental en los premios de Spotify 2026.', a: 'Son cinco conductoras: se les puede escribir una por una.', u: yt('SeisDeCopas') },
    { n: 'Se Regalan Dudas', r: 'YouTube 804 mil · TikTok 2.1 millones', q: 'Lety Sahagún y Ashley Frangie. El pódcast con más afinidad de todo el país.', a: 'Probablemente de paga. Se llega mejor en la fase 3, con una ciudad encendida que contar.', u: 'https://www.seregalandudas.com/' },
  ] },

  { k: 'cabeza', e: 'Criterio prestado', t: 'Terapeutas, psicólogas y voces de relaciones' },
  { k: 'gente', l: [
    { n: 'Nilda Chiaraviglio', r: 'YouTube 782 mil · TikTok 2.4 millones', q: 'Terapeuta de pareja y sexóloga; publica casi a diario.', u: yt('nildachiaraviglio') },
    { n: 'Silvia Olmedo', r: 'YouTube 1.02 millones', q: 'Psicóloga y sexóloga.', u: 'https://silviaolmedo.com' },
    { n: 'Walter Riso', r: 'YouTube 1.16 millones', q: 'Psicólogo; sus libros sobre el amor se leen en toda Hispanoamérica.', u: 'https://walter-riso.com/' },
    { n: 'Gaby Pérez Islas', r: 'YouTube 710 mil', q: 'Tanatóloga; autora de «Cómo curar un corazón roto».', u: 'https://gabytanatologa.com/contacto/' },
    { n: 'Mario Guerra', r: 'YouTube 126 mil', q: 'Psicoterapeuta y conferencista; tiene agente y contacto de contrataciones.', u: 'https://www.marioguerra.mx/contacto' },
    { n: 'Marina Mammoliti · Psicología al Desnudo', r: 'YouTube 515 mil', q: 'Argentina. Para cuando el plan salga de México.', u: 'https://www.psimammoliti.com' },
    { n: 'Shulamit Graber', r: 'YouTube 241 mil · TikTok 703 mil', q: 'Trauma y resiliencia.', u: yt('shulamitgraber') },
    { n: 'Anamar Orihuela', r: 'YouTube 98 mil', q: 'Relaciones y heridas de la infancia.', u: yt('AnamarOrihuelaTV') },
    { n: 'Psicóloga Pau', r: 'YouTube 301 mil', q: 'Nominada en salud mental en los premios de Spotify 2026.', u: yt('psicologapau_') },
    { n: 'César Lozano', r: 'YouTube 2.47 millones', q: 'Conferencista regiomontano con radio y pódcast.', a: 'Público adulto del norte; útil para Monterrey y para la segunda vuelta.', u: 'https://www.cesarlozano.com/contacto' },
    { n: 'Regina Carrot', r: 'YouTube 2.65 millones', q: 'Mentora de mujeres profesionistas.', u: 'https://www.reginacarrot.com' },
    { n: 'Efrén Martínez · El Rincón de los Errores', r: 'YouTube 278 mil', q: 'Doctor en psicología; conduce con Marimar Vega.', u: 'https://efrenmartinezortiz.com/contacto' },
  ] },

  { k: 'cabeza', e: 'Donde ya se habla de esto', t: 'Pódcasts y programas' },
  { k: 'gente', l: [
    { n: 'La Magia del Caos', r: 'YouTube 1.16 millones', q: 'Aislinn Derbez; relaciones y cambio personal.', u: yt('AislinnDerbezOficial') },
    { n: 'Date Cuenta', r: 'YouTube 332 mil', q: 'Jorge Lozano H., Rocío Gómez Turner y Sandy Fayad: «relaciones y verdades incómodas». Tiene formulario para colaboraciones.', u: 'https://jorgelozanoh.com/contacto/' },
    { n: 'Envinadas', r: 'YouTube 1.1 millones', q: 'Mariana Botas, Daniela Luján y Jessica Segura: «un vino entre amigas».', u: yt('envinadas_') },
    { n: 'De Todo Un Mucho', r: 'YouTube 1.1 millones', q: 'Martha Higareda y Yordi Rosado. Alcance masivo.', u: busca('De Todo Un Mucho Martha Higareda Yordi Rosado') },
    { n: 'Martha Debayle', r: 'YouTube 2.01 millones', q: 'Radio y video sobre amor, relaciones, salud y crianza. Mujeres de 30 a 50.', u: yt('MarthadebayleOficial') },
    { n: 'La Burra Arisca', r: 'YouTube 33 mil', q: '«Tres mujeres en sus cuarenta».', a: 'Chico y del público exacto de la segunda vuelta.', u: busca('La Burra Arisca podcast') },
    { n: 'Fluir con el Caos', r: 'YouTube 18 mil · entre los diez más oídos de Spotify México en febrero de 2026', q: 'Diana Hidalgo; manejo de emociones.', u: busca('Fluir con el Caos Diana Hidalgo') },
    { n: 'Los Hombres Sí Lloran', r: 'Nominado en los premios de Spotify 2026 · audiencia sin verificar', q: 'Para la línea de ellos.', u: 'https://open.spotify.com/search/Los%20Hombres%20S%C3%AD%20Lloran' },
    { n: 'Noche de Chicxs', r: 'YouTube 823 mil', q: 'Xanic lee y comenta historias que le manda el público.', a: 'Historias de citas contadas por quien las vivió.', u: busca('Noche de Chicxs') },
    { n: 'Radio Manguito Chupado', r: 'YouTube 55 mil', q: 'Kikis y Ana Julia, comediantes; un tema por episodio.', a: 'Comedia femenina de tamaño accesible.', u: busca('Radio Manguito Chupado') },
    { n: 'Andrea Farga · Los Signos', r: 'YouTube 1.92 millones', q: 'Humor con los signos del zodiaco.', a: 'Opcional. Mucho público que busca pareja; el ángulo es «ni tu signo ni tu foto: tus respuestas».', u: yt('andreafarga') },
  ] },

  { k: 'cabeza', e: 'El norte', t: 'Creadores y medios de La Laguna, Monterrey y Saltillo' },
  { k: 'tabla', cab: ['Quién', 'Dónde', 'Tamaño', 'Para qué'], filas: [
    ['Andrea Rodríguez (@andrearoodrigueez)', 'Torreón', 'Instagram 29 mil · 61 % local', 'Público lagunero'],
    ['Bárbara Sánchez Leyva (@barbarasnchzz)', 'Torreón', 'Instagram 11 mil', 'Tiene empresa de eventos: aliada para las noches'],
    ['Tomano de la granja (@tomanodelagranja)', 'Monterrey', 'Instagram 280 mil', 'Humor regio'],
    ['Martín Ocañas (@soymartinocanas)', 'Monterrey', 'Instagram 123 mil', 'Público regio'],
    ['Adrián Garza (@adriangarzavzz)', 'Monterrey', 'Instagram 891 mil', 'Alcance grande; fase 3'],
    ['Stephanie Luna (@stephanieluuna)', 'Monterrey', 'Instagram 111 mil', 'Reflexión personal'],
    ['Muy A Tu Nivel', 'Monterrey', 'Instagram 85 mil', 'Pódcast de comedia'],
    ['Mariana Zapata (@mariana.zapataj)', 'Saltillo', 'Instagram 22 mil', 'Conduce en televisión local'],
    ['Nathalia Salazar (@nathaliasalazaro)', 'Saltillo', 'Instagram 17 mil', 'Público de Saltillo'],
    ['Frida López (@fridasofia150)', 'Saltillo', 'Instagram 49 mil · 46 % local', 'Contenido personal y de boda'],
    ['POSTA', 'Nuevo León, Coahuila y Durango', 'YouTube 63 mil', 'Nota regional'],
    ['ABC Noticias, El Horizonte, INFO7, El Norte', 'Monterrey', '—', 'Prensa local para abrir la plaza'],
    ['Vanguardia y Zócalo', 'Saltillo', '—', 'Prensa local'],
    ['Exa FM', 'Torreón y Monterrey', 'Radio', 'Entrevista de la mañana'],
  ], nota: 'Tamaños y porcentaje de público local según Modash (octubre de 2026).' },

  { k: 'cabeza', e: 'Para que lo escriban', t: 'Prensa de tecnología y negocios, y comunidades' },
  { k: 'tabla', cab: ['Medio o comunidad', 'Por qué', 'Ángulo'], filas: [
    ['Forbes México', 'En julio de 2026 publicó una nota sobre apps de citas «sin deslizar el dedo».', 'El caso mexicano de esa misma tendencia'],
    ['Bloomberg Línea', 'Cubre de forma constante a Tinder y Bumble.', 'Un modelo que no vive de la atención'],
    ['Whitepaper', 'Boletín de negocios con más de 121 mil suscriptores.', 'La historia de cómo se construyó'],
    ['Contxto', 'Empresas nuevas de Latinoamérica.', 'Producto y números abiertos'],
    ['El Financiero Tech', 'Sección activa de tecnología.', 'El motor que se puede leer'],
    ['Victoria147', 'Comunidad de mujeres en los negocios; su festival junta a más de 3,000.', 'Una plática: seguridad y control al buscar pareja'],
    ['Opinión 51', 'Medio y boletín de columnistas mujeres.', 'Una columna invitada sobre por qué «manda ella»'],
    ['Momzilla', 'Comunidad de mamás (tamaño sin verificar).', 'Las madrinas y la segunda vuelta'],
    ['Te lo cuento', 'Boletín diario de noticias.', 'La nota corta del Gran Cruce'],
  ] },

  { k: 'cabeza', e: 'Cómo', t: 'Acercarse sin quemar el contacto' },
  { k: 'pasos', l: [
    { t: 'Ver tres piezas suyas antes de escribir', d: 'El mensaje empieza con algo que solo sabe quien sí los vio. Si no hay tiempo para eso, no hay tiempo para escribirles.' },
    { t: 'Cinco renglones, no más', d: 'Quién eres, qué es Cupido en una frase, por qué a su público le importa, qué les ofreces y la liga a la cuenta demo. Sin adjuntos.' },
    { t: 'Ofrecer lo que sí tenemos', d: 'Entrar antes que nadie, una liga propia con sus números a los siete días, al fundador para una conversación y el crédito de haber encendido su ciudad.' },
    { t: 'Dos recordatorios y ya', d: 'A los cuatro días y a los diez. Después se les deja en paz y se anota en la hoja.' },
    { t: 'Cumplir con los números', d: 'A la semana de que publiquen: cuánta gente entró con su liga y cuántos terminaron. Quien ve su resultado, repite.' },
  ] },
  { k: 'tarjetas', col: 3, l: [
    { t: 'De inicio, sin pago', d: 'A quien le importa el tema no hay que pagarle por decir lo que piensa. Lo que sí: tiempo, datos y crédito.' },
    { t: 'Lo pagado, después y a la vista', d: 'Cuando ya se sepa cuánto trae un creador. En el mundo, uno de 10 mil a 100 mil seguidores cobra de 200 a 800 dólares por video de TikTok; en México no está verificado: se pide cotización. Siempre se dice que es pagado.' },
    { t: 'Lo que nunca se pide', d: 'Un guion obligado, decir que «funciona», inventar una historia o esconder que hubo pago.' },
  ] },
  { k: 'fuentes', t: 'De dónde salen estos nombres', l: [
    { t: 'Modash · creadores de Torreón', u: 'https://www.modash.io/find-influencers/mexico/torreón' },
    { t: 'Modash · creadores de Monterrey', u: 'https://www.modash.io/find-influencers/mexico/monterrey' },
    { t: 'Modash · creadores de Saltillo', u: 'https://www.modash.io/find-influencers/mexico/saltillo' },
    { t: 'Feedspot · pódcasts de relaciones en México', u: 'https://podcast.feedspot.com/podcasts_relaciones_mexico/' },
    { t: 'Feedspot · pódcasts de mujeres en México', u: 'https://podcast.feedspot.com/podcasts_mujeres_mexico/' },
    { t: 'El Imparcial · ganadores de los premios de pódcast de Spotify 2026', u: 'https://www.elimparcial.com/espectaculos/2026/05/14/spotify-podcast-awards-2026-lista-completa-de-ganadores-y-los-podcasts-mas-populares-del-ano/' },
    { t: 'Spotify · premios de pódcast de México 2025', u: 'https://newsroom.spotify.com/2025-04-30/spotify-celebrates-mexicos-booming-podcast-scene-with-first-ever-podcast-awards/' },
    { t: 'PLAYERS of Life · kit de medios', u: 'https://playersoflife.com/mediakit/' },
    { t: 'Xataka México · notas sobre Tinder', u: 'https://www.xataka.com.mx/tag/tinder' },
    { t: 'Expansión · directorio', u: 'https://expansion.mx/directorio' },
    { t: 'Forbes México · apps de citas', u: 'https://www.forbes.com.mx/tag/apps-de-citas/' },
    { t: 'Whitepaper', u: 'https://www.whitepaper.mx/' },
    { t: 'Victoria147', u: 'https://victoria147.org/' },
    { t: 'Opinión 51', u: 'https://www.opinion51.com/contacto/' },
    { t: 'Los tamaños de YouTube se leyeron el 10 de octubre de 2026 en el canal de cada quien.' },
  ] },
];

/* ═══ ALIANZAS ════════════════════════════════════════════════════════ */
const alianzas = [
  { k: 'cabeza', e: 'Dónde ya se junta la gente', t: 'Comunidades, sedes y fechas, con nombre', s: 'Leído el 10 de octubre de 2026. Lo que no se pudo confirmar no aparece. El contacto de cada quien está en la liga de las fuentes, al final.' },
  { k: 'nota', tono: 'bien', e: 'El campo está libre.', t: 'En Torreón no se encontró nada organizado para personas solteras: el grupo más grande de Meetup es un club de lectura de 77 miembros. Las cenas de Timeleft no llegan a Torreón ni a Saltillo. Ninguna diócesis de la región publica una pastoral para solteros. Quien lo organice primero se queda con la ciudad.' },

  { k: 'cabeza', e: 'La Laguna', t: 'Por dónde empezar en casa' },
  { k: 'tabla', cab: ['Dónde', 'Qué es', 'Para qué nos sirve'], filas: [
    ['Paseo Colón', 'Cada domingo, unas 7 mil personas caminando y en bici; 360 mil en todo 2025', 'Una mesa con una sola pregunta de las 43 en un pizarrón y el QR. Es gratis y es donde está la ciudad.'],
    ['La Tinta Cafebrería', 'Círculo de lectura los jueves a las siete', 'Sede natural para la primera Noche de las 43'],
    ['Café Tumbao y Fábrica de Arte', 'Presentaciones de libros y cine gratis los jueves', 'Sedes con público que ya sale entre semana'],
    ['Casa La Morelos y Plan B Estudio Teatro', 'Espacios culturales', 'Sedes para las noches grandes de enero'],
    ['Casa Faya (Gómez Palacio)', 'Café literario los lunes', 'Para que el lado de Durango tenga su noche'],
    ['Asociación EXATEC Laguna', 'Más de 6 mil egresados del campus (dato de 2021)', 'Su boletín y su siguiente evento; el campus tiene responsable de egresados'],
    ['Egresados de la Ibero Torreón', 'Capítulos en Torreón, Chihuahua y Durango, y red de negocios', 'Cinco minutos en su siguiente reunión'],
    ['Colegio de Contadores Públicos de La Laguna', 'Más de 230 afiliados', 'Una nota en su boletín; profesión con hombres y mujeres casi a la mitad'],
    ['Ruedas del Desierto y Travesías Laguna', 'Ciclistas y senderistas', 'Tres minutos al terminar la rodada: ahí están ellos'],
    ['AMPROFEC', 'Gremio de eventos; tres de sus vicepresidentas son de Torreón', 'La puerta a las organizadoras de bodas'],
    ['Maratón Lala', 'Cupo de 4,500 corredores en 2026', 'Una tarjeta en el kit del corredor de 2027'],
  ] },

  { k: 'cabeza', e: 'Monterrey y Saltillo', t: 'Con quién hablar al abrir' },
  { k: 'tabla', cab: ['Dónde', 'Qué es', 'Para qué nos sirve'], filas: [
    ['The First Round', 'Cenas con mesas armadas por algoritmo; vende boletos en Fever', 'Lo más parecido que hay en la ciudad: hablar primero, puede ser aliado'],
    ['Sip and Read', 'Club de lectura con más de 700 personas en WhatsApp', 'Una Noche de las 43 con ellas'],
    ['Casa de la Cultura de Nuevo León', 'Presta espacio sin costo a clubes que se organizan solos', 'Sede gratis'],
    ['The Wargame Café, Saxy Jazz Club e Invino', 'Lugares que ya reciben eventos de terceros', 'Sedes'],
    ['Pueblo Bicicletero', 'Pedaleada mensual, sin membresía', 'Donde están ellos'],
    ['Regnum Christi Cumbres y DIEC Pro', 'Jóvenes profesionistas católicos; el primero tiene 160 miembros', 'La puerta a la fe en Monterrey'],
    ['ExaUDEM, egresados de la UANL y EXATEC', 'Asociaciones y clubes de egresados', 'Un sí abre miles de correos'],
    ['Federación de Colegios de Profesionistas de Nuevo León', '26 colegios', 'Sus boletines'],
    ['Expo Tu Boda Monterrey', 'En Cintermex, varias veces al año', 'Un lugar chico con una sola idea: «¿tienes una amiga soltera?»'],
    ['Conecta Saltillo', 'Citas rápidas para personas de 25 a 35 años', 'Aliado natural para abrir Saltillo'],
    ['Meetup «Solteros, divorciados y viudos de 35 a 65»', '1,316 miembros y casi sin actividad', 'Gente que ya levantó la mano y a la que nadie atiende'],
  ] },

  { k: 'cabeza', e: 'El terreno', t: 'Seis cosas que conviene saber' },
  { k: 'tarjetas', col: 3, l: [
    { t: 'La gente ya paga por esto', d: 'Fábrica de Parejas cobra de $6,115 a $10,050 por dos a seis citas y dice tener unos 1,600 inscritos. Timeleft cobraba $140 por cena. Hay disposición a pagar por algo serio: lo gratis de Cupido se tiene que explicar, no solo anunciar.' },
    { t: 'La fe', d: 'Coahuila: 74.9 % católica y 13.4 % evangélica. Nuevo León: 77.7 % y 11.9 %. Nadie les ofrece una forma seria de buscar pareja que trate su fe como innegociable. Cupido sí, igual que respeta a quien no la tiene.' },
    { t: 'Las bodas', d: 'En 2025 hubo 14,266 bodas en Coahuila, 27,330 en Nuevo León y 8,609 en Durango. Febrero junta 14.5 % de las bodas del año y diciembre 10.7 %: la temporada del Gran Cruce.' },
    { t: 'Texas ya está conectado', d: 'En Texas viven 2.4 millones de personas nacidas en México. En 2022, siete de cada diez matrículas consulares de coahuilenses se tramitaron ahí, y una de cada cuatro era de alguien de Torreón.' },
    { t: 'Los medios de casa, en Facebook', d: 'El Siglo de Torreón 917 mil seguidores; El Sol de La Laguna 386 mil; Telediario Monterrey 4.3 millones; El Norte 1.3 millones; Donde Ir MTY 1.3 millones.' },
    { t: 'Profesiones organizadas', d: 'Psicólogas (77 % mujeres), enfermeras (76 %) y maestras de primaria (70 %) tienen colegios. Para cuidar el equilibrio, tocar también a ingenieros, contadores y abogados.' },
  ] },

  { k: 'cabeza', e: 'Las fechas de la ciudad', t: 'Donde va a haber gente' },
  { k: 'tabla', cab: ['Cuándo', 'Qué', 'Dónde', 'Idea'], filas: [
    ['30 de octubre de 2026', 'Desfile de Día de Muertos (40 mil personas esperadas)', 'Torreón', 'Grabar la serie de calle; todavía no se invita'],
    ['12, 19 y 27 de noviembre de 2026', 'Mägo de Oz, Caifanes y Manuel Medrano', 'Torreón', 'Filas largas: una pregunta y un QR'],
    ['Del 22 de octubre al 4 de noviembre de 2026', 'Festival Santa Lucía', 'Monterrey', 'Conocer a las primeras fundadoras regias'],
    ['13 de diciembre de 2026', 'Maratón de Monterrey (cupo de 10 mil, ya agotado)', 'Monterrey', 'Los clubes de corredores'],
    ['Cada domingo', 'Paseo Colón', 'Torreón', 'La mesa fija'],
    ['Marzo de 2027', 'Maratón Lala (fecha oficial por confirmar)', 'La Laguna', 'El kit del corredor'],
    ['Mayo de 2027', 'Feria del libro de Coahuila (en 2026 fue del 8 al 17 de mayo)', 'Torreón', 'Una mesa: «Las 43 preguntas»'],
  ] },
  { k: 'fuentes', t: 'De dónde sale cada renglón', l: [
    { t: 'Milenio · Paseo Colón: 360 mil personas en 2025', u: 'https://www.milenio.com/estados/mas-de-360-mil-personas-vivieron-la-experiencia-paseo-colon-en-2025' },
    { t: 'Milenio · La Tinta Cafebrería', u: 'https://www.milenio.com/cultura/la-tinta-cafebreria-impulsa-ajedrez-escritura-creativa' },
    { t: 'El Siglo de Torreón · agenda de Fábrica de Arte', u: 'https://www.elsiglodetorreon.com.mx/noticia/2026/flamenco-cine-y-dia-de-muertos-fabrica-de-arte-revela-su-agenda-cultural-en-torreon.html' },
    { t: 'El Siglo de Torreón · 25 años del Tumbao', u: 'https://www.elsiglodetorreon.com.mx/noticia/2025/presentan-libro-por-25-anos-del-tumbao.html' },
    { t: 'El Sol de La Laguna · Casa Faya en Gómez Palacio', u: 'https://oem.com.mx/elsoldelalaguna/local/dia-del-libro-se-vive-con-intercambio-y-lectura-en-gomez-palacio-29622355' },
    { t: 'Tec de Monterrey · asociaciones y clubes EXATEC', u: 'https://tec.mx/es/exatec/asociaciones-y-clubes' },
    { t: 'Tec de Monterrey · responsables de egresados por campus', u: 'https://tec.mx/es/exatec/responsables-de-atencion-por-campus' },
    { t: 'Tec de Monterrey · egresados del Campus Laguna', u: 'https://conecta.tec.mx/es/node/100141' },
    { t: 'Ibero Torreón · egresados', u: 'https://www.iberotorreon.mx/egresados' },
    { t: 'UDEM · ExaUDEM', u: 'https://www.udem.edu.mx/es/exaudem' },
    { t: 'UANL · egresados', u: 'https://www.uanl.mx/egresados/' },
    { t: 'Colegio de Contadores Públicos de La Laguna', u: 'https://colegiodecontadorespublicoslaguna.org/' },
    { t: 'Federación de Colegios de Profesionistas de Nuevo León', u: 'https://fcpenl.org.mx/colegios-afiliados/' },
    { t: 'DataMéxico · mujeres y hombres por profesión', u: 'https://www.economia.gob.mx/datamexico/es/profile/occupation/psicologos' },
    { t: 'Milenio · Ruedas del Desierto', u: 'https://www.milenio.com/estados/ruedas-del-desierto-historia-de-como-rodaron-por-la-laguna' },
    { t: 'PLAYERS of Life · vicepresidentas de AMPROFEC de Torreón', u: 'https://playersoflife.com/torreon/de-torreon-tres-vicepresidentas-de-amprofec-que-impacto-tiene/' },
    { t: 'Monterrey Secreto · The First Round', u: 'https://monterreysecreto.com/the-first-round-monterrey-conocer-gente-nueva/' },
    { t: 'PLAYERS of Life · Sip and Read', u: 'https://playersoflife.com/monterrey/sip-and-read-el-book-club-en-monterrey-que-transformo-la-lectura-en-comunidad/' },
    { t: 'Pueblo Bicicletero · pedaleadas', u: 'https://pueblobicicletero.org/pedaleadas/' },
    { t: 'Regnum Christi Monterrey Cumbres', u: 'https://www.regnumchristi.mx/monterrey-cumbres' },
    { t: 'Parroquia Natividad del Señor · grupos (DIEC Pro)', u: 'https://natividadmty.org/grupos-pastorales/' },
    { t: 'Expo Tu Boda Monterrey', u: 'https://www.expotuboda.com.mx/monterrey' },
    { t: 'Telediario · Conecta Saltillo', u: 'https://www.telediario.mx/comunidad/conecta-saltillo-el-evento-donde-podran-encontrar-pareja' },
    { t: 'Meetup · solteros, divorciados y viudos en Monterrey', u: 'https://www.meetup.com/es/solteros-divorciados-y-viudos-de-35-a-60-en-mty-meetup/' },
    { t: 'Emprendedor · cómo funciona y cuánto cobra Fábrica de Parejas', u: 'https://emprendedor.com/asi-funciona-fabrica-de-parejas-el-matchmaking-que-transforma-las-citas-en-mexico/' },
    { t: 'Timeleft · ciudades', u: 'https://timeleft.com/es/' },
    { t: 'INEGI · Censo 2020, Coahuila (religión)', u: 'https://www.inegi.org.mx/contenidos/programas/ccpv/2020/doc/cpv2020_pres_res_coah.pdf' },
    { t: 'INEGI · Censo 2020, Nuevo León (religión)', u: 'https://www.inegi.org.mx/contenidos/programas/ccpv/2020/doc/cpv2020_pres_res_nl.pdf' },
    { t: 'INEGI · matrimonios 2025 por estado y por mes', u: 'https://www.inegi.org.mx/contenidos/saladeprensa/boletines/2026/emat/EMAT2025_RR.pdf' },
    { t: 'Census Reporter · nacidos en México que viven en Texas', u: 'https://censusreporter.org/data/table/?table=B05006&geo_ids=04000US48' },
    { t: 'BBVA Research · Anuario de migración y remesas 2025 (matrículas consulares)', u: 'https://www.bbvaresearch.com/wp-content/uploads/2026/02/Anuario_Migracion_y_Remesas_2025a.pdf' },
    { t: 'PLAYERS of Life · desfile de Día de Muertos en Torreón 2026', u: 'https://playersoflife.com/torreon/cuando-es-el-desfile-de-dia-de-muertos-en-torreon-2026-guia-con-fecha-recorrido-y-todos-los-detalles/' },
    { t: 'PLAYERS of Life · conciertos en Torreón 2026', u: 'https://playersoflife.com/torreon/conciertos-en-torreon-2026-lista-completa-de-eventos-confirmados/' },
    { t: 'PLAYERS of Life · Festival Santa Lucía', u: 'https://playersoflife.com/monterrey/festival-internacional-santa-lucia-cuando-empieza-y-eventos/' },
    { t: 'Maratón de Monterrey', u: 'https://maratonmonterrey.mx/' },
    { t: 'Lala · Maratón Internacional Lala', u: 'https://www.lala.com.mx/notas-novedades/comienza-la-cuenta-regresiva-rumbo-la-37-edicion-del-maraton-internacional-lala' },
    { t: 'Los seguidores de Facebook de cada medio se leyeron el 10 de octubre de 2026 en su página pública.' },
  ] },
];

/* ═══ NÚMEROS ═════════════════════════════════════════════════════════ */
const numeros = [
  { k: 'cabeza', e: 'La lógica', t: 'Cuánta gente, de dónde y a qué costo', s: 'Todo lo que dice «supuesto» se cambia por el dato real en cuanto exista. Para eso son las actividades de medición de la fase 1.' },
  { k: 'calc' },

  { k: 'cabeza', e: 'La meta de la primera ciudad', t: 'De dónde salen 5,000 perfiles en La Laguna' },
  { k: 'tabla', cab: ['De dónde', 'Meta', 'Cómo', 'Supuesto'], filas: [
    ['Persona a persona', '1,750', '100 fundadoras, 30 madrinas y cada perfil invitando a tres', 'Cada perfil vivo trae 0.4 más en 30 días (lo que en apps se considera excelente; un programa de referidos típico trae 0.04)'],
    ['Creadores locales', '900', 'Los de la fase 2 y veinte publicando a la vez en enero', '45 perfiles por creador en promedio: unos traen 300 y otros cinco'],
    ['Noches de las 43', '600', 'Quince noches de cuarenta personas', 'Casi todos terminan, porque a eso van'],
    ['Comunidades y alianzas', '600', 'Iglesias, exalumnos, clubes, bodas, gimnasios y salones', 'Veinte perfiles por alianza que sí se mueve'],
    ['Prensa y radio', '500', 'Dos notas, dos entrevistas y la radiografía', 'Una nota local buena trae de 100 a 200'],
    ['Contenido propio', '350', 'Tres imágenes y un video diarios durante 18 semanas', 'Si las vistas no crecen, este renglón da menos de 200'],
    ['Publicidad pagada', '300', 'Pruebas de 3 mil y de 15 mil pesos', 'Tope de 60 pesos por perfil vivo'],
  ], nota: 'Suma 5,000. El primer renglón es el más grande a propósito: es el único que crece solo.' },

  { k: 'cabeza', e: 'El embudo', t: 'Qué tiene que pasar en cada paso' },
  { k: 'tabla', cab: ['Paso', 'Supuesto', 'Qué lo mueve'], filas: [
    ['Ve una pieza y entra a la liga', '1 %', 'Los primeros dos segundos del video y quién lo dice'],
    ['Entra y crea su cuenta', '12 %', 'La portada, y sobre todo que la invitación venga de alguien conocido. La mediana de cualquier página de aterrizaje es 6.6 %.'],
    ['Crea su cuenta y termina las 43', '50 % (90 % en una noche)', 'Los recordatorios, la fecha de cierre y la compañía'],
    ['Termina e invita', '0.4 perfiles nuevos por cada uno', 'La pantalla «ahora invita a tres» y el dato de su ciudad'],
  ], nota: 'Con estos supuestos, de cada 100 personas que entran a la liga terminan 6. Para 5,000 perfiles hacen falta unas 83,000 visitas de gente de La Laguna. Publicando solos no se llega: una cuenta chica promedia 350 vistas por video. Por eso el plan descansa en que otros lo digan.' },

  { k: 'cabeza', e: 'Cuántas publicaciones', t: 'El ritmo de una semana' },
  { k: 'cifras', l: [
    { n: '38', t: 'piezas propias a la semana', s: '21 imágenes (tres al día, en el orden de La cuenta; las mismas van a historias), 7 videos, 7 preguntas en WhatsApp, 2 videos a cámara y 1 artículo.' },
    { n: '70', t: 'invitaciones personales a la semana', s: 'Diez al día. Es el canal que más convierte y el que menos se ve.' },
    { n: '50', t: 'acercamientos a creadores a la semana', s: 'Diez al día, de lunes a viernes. Meta: cinco publicaciones de otros por semana.' },
    { n: '2', t: 'noches al mes', s: 'Y seis en la última semana de enero.' },
  ] },
  { k: 'p', t: 'El banco alcanza y ya está en orden: en [Compartir → La cuenta](/compartir#cuenta) están las 325 imágenes como se publicarían, tres por día durante 109 días (un gancho, una del corazón y una prueba), y se bajan numeradas con su calendario. Los 154 videos, a uno diario, alcanzan 22 semanas. Lo nuevo que sí se graba son los videos a cámara, la serie de calle y lo que diga la ciudad.' },

  { k: 'cabeza', e: 'El dinero', t: 'Propuesta de tope para los primeros 90 días' },
  { k: 'tabla', cab: ['Concepto', 'Propuesta', 'Nota'], filas: [
    ['Abogado: aviso de privacidad, términos y marca', '$35,000', 'Lo único que no se puede saltar. Cotizar.'],
    ['Seis Noches de las 43', '$15,000', '$2,500 por noche; la sede pone el lugar'],
    ['Tarjetas, carteles y lonas', '$8,000', 'Con QR y código por lugar'],
    ['Pruebas de publicidad', '$18,000', 'La segunda (15 mil) solo si la primera (3 mil) sale bien'],
    ['Creadores, después de probar sin pago', '$20,000', 'Tarifas en México sin verificar: pedir cotización'],
    ['Imprevistos', '$9,000', ''],
    ['Total sin sueldos', '$105,000', 'Unos $21 por perfil vivo si se llega a 5,000'],
    ['Verificación de identidad', 'Por cotizar', 'Depende del proveedor y de en qué momento se pida'],
    ['Quien ejecuta el plan', 'Por definir', 'Sueldo base más bono por perfiles vivos con equilibrio'],
  ], nota: 'Es una propuesta para discutir, en pesos mexicanos. El tope y de dónde sale los decide Ricardo (actividad de la fase 1).' },

  { k: 'cabeza', e: 'Los dos números de control', t: 'Usuarios al mes e ingreso al mes', s: 'Todo lo que hay en Tareas existe para mover estos dos números. Cada escalón tiene su fecha y está metido ahí como punto de control, junto a la actividad que debería producirlo.' },
  { k: 'tabla', cab: ['Para cuándo', 'Usuarios al mes', 'Ingreso al mes', 'Qué es'], filas: CONTROLES.map((c) => [diaLargo(c[3]), miles(c[4]), pesos(c[5]), c[6]]),
    nota: 'En pesos mexicanos. Hasta diciembre de 2027 el ingreso son apoyos voluntarios; de 2028 en adelante, lo que cobra el programa.' },
  { k: 'cabeza', e: 'De dónde sale cada meta', t: 'Los supuestos, a la vista' },
  { k: 'lista', l: SUPUESTOS_CONTROL },
  { k: 'nota', tono: 'ojo', e: 'Lo que no cambia.', t: 'Todo es gratis en 2026 y 2027, y lo que tendrá precio ya está publicado en [el programa](/programa), con sus años. Hasta 2028 el ingreso es voluntario y chico a propósito: el plan no depende de cobrar antes, depende de llegar con un millón de perfiles vivos y la confianza intacta. La regla que no se toca: sin publicidad, nunca.' },
  { k: 'boton', t: 'Ver los puntos de control en Tareas', ir: 'control' },

  { k: 'cabeza', e: 'Para decidir cada lunes', t: 'Señales de que vamos bien o tarde' },
  { k: 'tabla', cab: ['Señal', 'Bien', 'Tarde'], filas: [
    ['Terminan las 43', 'Más de 50 %', 'Menos de 30 %: se arregla el cuestionario antes de invitar a más gente'],
    ['Mujeres en la ciudad', 'Entre 45 % y 60 %', 'Fuera de eso: toda la invitación de la semana va al otro lado'],
    ['Perfiles nuevos por cada perfil', 'Más de 0.4', 'Menos de 0.15'],
    ['Costo por perfil vivo, en pagado', 'Menos de $60', 'Más de $120: se apaga'],
    ['Respuesta a un reporte', 'Menos de 24 horas', 'Más de 48'],
    ['A las cuatro semanas de abrir una ciudad', '300 perfiles', 'Menos de 150: no se abre la siguiente'],
    ['Puertas abiertas de las avisadas', 'Más de la mitad', 'Menos de una de cada cuatro: revisar cómo se presenta la coincidencia'],
  ], nota: 'Los umbrales son supuestos de arranque. Las referencias de viralidad y de conversión están en las fuentes del Resumen.' },
];

/* ═══ RITMO ═══════════════════════════════════════════════════════════ */
const ritmo = [
  { k: 'cabeza', e: 'El ritmo', t: 'La semana tipo de la fase 2', s: 'Para una persona de tiempo completo con IA a la mano. Lo que se repite está marcado con ↻ en la lista.' },
  { k: 'tabla', cab: ['Día', 'Lo que se hace', 'Quién'], filas: [
    ['Lunes', 'Números: 30 minutos y una decisión. Se programan las piezas de la semana.', 'Persona + IA'],
    ['Martes', 'Noche de las 43, cuando toca. Diez acercamientos a creadores.', 'Persona'],
    ['Miércoles', 'Primer video a cámara. Visita a dos sedes o comunidades.', 'Persona'],
    ['Jueves', 'El artículo de la semana. A cada creador que publicó, sus números.', 'IA + persona'],
    ['Viernes', 'Segundo video a cámara. Veinte minutos con las embajadoras. Revisión de reportes.', 'Persona'],
    ['Sábado', 'Clubes y eventos: donde está la gente.', 'Persona'],
    ['Domingo', 'Descanso. Solo salen las piezas programadas.', '—'],
    ['Todos los días', 'Diez invitaciones personales, un video, las tres imágenes del día (al muro y a historias), la pregunta del día y contestar todo en menos de una hora.', 'Persona + IA'],
  ] },

  { k: 'cabeza', e: 'El reparto', t: 'Qué hace cada quién' },
  { k: 'tarjetas', col: 3, l: [
    { e: '🙋 Persona', t: 'Lo que no se delega', l: ['Dar la cara en video y con medios.', 'Llamar, visitar y cerrar alianzas.', 'Llevar una sala de cuarenta personas.', 'Invitar una por una.', 'Decidir el lunes.'] },
    { e: '🤖 IA', t: 'Lo que se le deja completo', l: ['Calendarios, listas y bancos de respuestas.', 'Pintar piezas por ciudad y por fecha.', 'Borradores de artículos, boletines y mensajes.', 'Sacar los números del lunes.', 'Lo que hay que construir en el producto.'] },
    { e: '🤝 Persona + IA', t: 'Lo que sale mejor juntas', l: ['Artículos: la IA escribe, la persona lo vuelve humano.', 'Guiones y campañas.', 'La lista de creadores y el mensaje para cada uno.', 'Leer el embudo y decidir qué se arregla.', 'La radiografía.'] },
  ] },

  { k: 'cabeza', e: 'Un día normal', t: 'Seis horas de persona, bien puestas' },
  { k: 'lista', l: [
    '**30 min** · Contestar mensajes y comentarios de la noche.',
    '**45 min** · Diez invitaciones personales, con nombre.',
    '**60 min** · Diez acercamientos a creadores o medios, cada uno con su mensaje.',
    '**30 min** · Revisar y soltar las piezas del día (ya programadas el lunes).',
    '**2 horas** · La calle: una sede, una comunidad, un club o una grabación.',
    '**45 min** · Seguimientos en la hoja de contactos.',
    '**30 min** · Anotar lo que la gente dijo hoy con sus palabras.',
  ] },

  { k: 'cabeza', e: 'Para no desgastarse', t: 'Lo que no se hace' },
  { k: 'lista', l: [
    'No se discute con quien viene a pelear: una respuesta amable del banco y se sigue.',
    'No se abre otra red social hasta encender la primera ciudad.',
    'No se producen piezas nuevas mientras el banco alcance.',
    'No se abre otra ciudad porque «ya hay interés»: se anota en la lista de espera.',
    'No se mide el éxito en seguidores ni en vistas.',
    'No se promete una fecha de pareja a nadie.',
  ] },
];

/* ═══ EQUIPO ══════════════════════════════════════════════════════════ */
const equipo = [
  { k: 'cabeza', e: 'A quién buscar', t: 'Una persona que dirija y ejecute, viviendo en la ciudad semilla', s: 'Es a quien se le dice: «sigue el go-to-market». Su perfil completo (cómo es, qué tiene que saber, qué tiene que poder hacer y la prueba) está en [cupido.capitaltorreon.com/ceo](/ceo). Esa es la liga que se manda; no está listada en buscadores. A quienes ya salimos a buscar están en Candidatos (solo cuentas administradoras).' },
  { k: 'tarjetas', col: 2, l: [
    { t: 'Lo que hace', l: ['Llena las Noches de las 43 y las deja contentas.', 'Invita, convence y da seguimiento: fundadoras, madrinas, sedes, clubes, iglesias.', 'Escribe a diez creadores al día y cumple con sus números.', 'Sale a cámara dos veces por semana.', 'Lleva el lunes de números y propone la decisión.', 'Usa IA todos los días para todo lo que no pide presencia.'] },
    { t: 'Cómo reconocerla', l: ['Ya hizo crecer algo desde cero con poco dinero: una comunidad, un evento, un negocio local.', 'Tiene gente: en una semana puede sentar a cuarenta personas en un café.', 'Escribe claro y sin adornos.', 'Le gustan los números y no se los cuenta bonito a sí misma.', 'Puede explicarle Cupido a una amiga que no cree en estas cosas, sin exagerar.', 'Cree en las reglas de la casa: manda ella y cero publicidad.'] },
    { t: 'Lo que no es', l: ['Una agencia de publicidad.', 'Alguien que solo programa publicaciones.', 'Un experto en trucos: cuentas falsas, seguidores comprados, mensajes en frío.', 'Alguien que necesita un equipo para empezar.'] },
    { t: 'Dos pruebas, ningún currículum', d: 'Primero, la escrita de [/ceo](/ceo): cinco cosas que se contestan en una tarde; llegan aquí abajo. Después, con dos o tres finalistas, la de verdad y pagada: diez días para organizar una Noche de las 43 con cuarenta personas y traer cien perfiles completos. Se elige a quien lo logra, no a quien mejor lo explica.' },
    { t: 'Cómo se le paga', d: 'Propuesta: un sueldo base, un bono por cada perfil vivo que entra con equilibrio entre mujeres y hombres, y un bono al encender la ciudad. Los montos están por definir con el presupuesto de la fase 1.' },
    { t: 'Sus primeros 90 días', l: ['**30:** la casa lista, las cien fundadoras invitadas y la primera noche hecha.', '**60:** mil perfiles vivos en La Laguna, diez embajadoras y tres medios publicados.', '**90:** el Gran Cruce anunciado, veinte creadores comprometidos y el manual de ciudad empezado.'] },
  ] },
  { k: 'nota', tono: 'ojo', e: 'Al publicar la vacante.', t: 'No se pide género ni edad: sería discriminar y además no hace falta. Lo que sí importa es que pueda hablarle con credibilidad a mujeres de 27 a 45 años sobre seguridad y citas. La voz hacia ellas también la llevan las fundadoras y las embajadoras.' },

  { k: 'cabeza', e: 'Para evaluar', t: 'Cómo leer una prueba', s: 'Esto no se publica: es para quien decide. La prueba no busca buena redacción; busca hechos, números y criterio.' },
  { k: 'tabla', cab: ['Lo que se pregunta', 'Buena señal', 'Bandera'], filas: [
    ['La vez que juntó gente desde cero', 'Dice de cuánto a cuánto, en cuánto tiempo y con cuánto dinero. Cuenta lo que hizo con sus manos y qué salió mal.', 'Habla de «el equipo» y de «la estrategia». No hay un solo número. Todo salió bien.'],
    ['Diez días y cero pesos', 'Empieza por personas con nombre: a quién le escribe el día uno. Hay una fecha y un lugar. Piensa en quién invita a quién.', 'Empieza por redes sociales o por un anuncio. Pide presupuesto. No sale de su casa en diez días.'],
    ['Tres cosas que cambiaría', 'Entró de verdad: cita pantallas. Lo que cambia sirve a quien llega, no a su gusto. Cuida la regla de la casa.', 'Elogia todo. O quiere quitar lo que protege a las mujeres «para crecer más rápido».'],
    ['Lo correcto sobre lo conveniente', 'Le costó algo que se puede medir: dinero, un cliente, un puesto. Lo cuenta sin presumir.', 'No le costó nada. O el ejemplo lo deja como héroe.'],
    ['El minuto a cámara', 'Mira a la cámara, habla como persona y no promete amor. Se entiende qué es Cupido.', 'Lee. Exagera. Dice «la mejor app». No lo mandó.'],
  ], nota: 'Además: ¿cuánto tardó en mandarla desde que recibió la liga? La rapidez también contesta.' },
  { k: 'tarjetas', col: 2, l: [
    { t: 'La conversación: cinco preguntas', l: ['Enséñame cómo llevas tu semana. (Método)', '¿Cuál fue tu peor número y a quién se lo dijiste primero? (Honradez)', 'Explícale a un hombre por qué le conviene que mande ella. (La regla)', 'Tienes 5,000 mujeres y 1,500 hombres en la ciudad. ¿Qué haces el lunes? (Números y foco)', '¿Qué hiciste esta semana con IA y qué le corregiste? (Herramienta)'] },
    { t: 'Lo que falta decidir antes de mandar la liga', l: ['**La paga.** La página dice «atada al marcador; los términos se platican con quien pase la prueba». Definir base, bono por ciudad encendida y si lleva parte de la empresa.', '**La Laguna.** La página pide vivir ahí de noviembre a febrero. Confirmar si es requisito o preferencia.', '**El nombre del puesto.** La página no pone título: dice «quien va a dirigir Cupido». Definir cómo firma.'] },
  ] },

  { k: 'cabeza', e: 'Después', t: 'Quién más, y cuándo' },
  { k: 'tabla', cab: ['Rol', 'Cuándo', 'Cómo', 'Para qué'], filas: [
    ['Abogado o abogada de datos personales', 'Fase 1', 'Por proyecto', 'Aviso de privacidad, términos y marca'],
    ['Asesoría de psicología', 'Fase 2', 'Por sesión', 'Revisa el cuestionario, la guía de cita segura y los casos difíciles'],
    ['Anfitrionas de noche', 'Fase 2', 'Por noche', 'Llevan la sala cuando hay más de una sede'],
    ['Edición de video corto', 'Fase 2', 'Por pieza', 'Los videos a cámara y la serie de calle'],
    ['Producción de noches en Monterrey', 'Fase 3', 'Medio tiempo', 'Abre la segunda ciudad'],
    ['Responsables de ciudad', 'Fases 3 y 4', 'Por resultado', 'Una persona por plaza, con el manual en la mano'],
    ['Confianza y seguridad', 'Fase 4, al pasar de 5,000', 'Tiempo completo', 'Reportes, verificación y moderación'],
    ['Equipo central de cinco', 'Fase 4', 'Tiempo completo', 'Crecimiento, comunidad, producto, cuidado y contenido'],
  ] },

  { k: 'cabeza', e: 'El fundador', t: 'Lo que le toca a Ricardo' },
  { k: 'lista', l: [
    '**Dar la cara.** El video del fundador, la prensa y los pódcasts. Nadie más puede contar por qué existe esto.',
    '**Decidir.** Las decisiones marcadas en la lista: la regla del Cruce, la verificación de identidad, la cuenta demo de ella, si el código sigue público y «Mientras esperan a Cupido».',
    '**El producto.** Con IA: el termómetro, los códigos de campaña, la liga de madrina y lo que pida el embudo.',
    '**El lunes.** Treinta minutos de números con quien ejecuta.',
    '**Soltar lo demás.** El día a día es de quien se contrate. Para eso es esta página.',
  ] },
];

export const PLAN = {
  version: '1.5', fecha: '11 de octubre de 2026',
  titulo: 'El plan para que 10 millones de personas busquen pareja con Cupido',
  bajada: 'Primero el resumen y los atajos; después, la lista de todo lo que hay que hacer. Lo que dice «supuesto» se cambia por el dato real en cuanto exista.',
  pestanas: [
    { id: 'resumen', t: 'Resumen', bloques: resumen },
    { id: 'atajos', t: 'Atajos', bloques: atajos },
    { id: 'lanzamiento', t: 'Lanzamiento', bloques: lanzamiento },
    { id: 'creadores', t: 'Creadores', bloques: creadores },
    { id: 'alianzas', t: 'Alianzas', bloques: alianzas },
    { id: 'numeros', t: 'Números', bloques: numeros },
    { id: 'ritmo', t: 'Ritmo', bloques: ritmo },
    { id: 'equipo', t: 'Equipo', bloques: equipo },
  ],
};
