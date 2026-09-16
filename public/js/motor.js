/* ─────────────────────────────────────────────────────────────────────────────
   Cupido Algorítmico · Motor de compatibilidad v2
   Autor: Ricardo López Reyero
   ─────────────────────────────────────────────────────────────────────────────
   Qué cambió contra la v1 (MODELO.md explica el porqué de cada punto):
   1. RECÍPROCO: se calcula A→B (¿B tiene lo que A necesita?) y B→A por separado
      y se combinan con media armónica. Un match que solo es bueno para uno, se hunde.
   2. PESOS PERSONALES: lo sexual y lo espiritual no pesan igual para todos. Se
      deducen de lo que la persona HACE y de qué tan negociable lo declara, no de
      lo que dice que le importa. Conflicto y valores nunca bajan de su peso base.
   3. VETOS EXPLICADOS (lección de SUMA): un requisito incumplido no "empata menos":
      elimina el par, y el panel dice por qué. Un dato que falta NUNCA veta: es
      duda, no incumplimiento.
   4. TECHOS: una dimensión desastrosa pone techo al total aunque todo lo demás brille.
   5. RAZONES: cada dimensión deja notas ✓ / ~ / ✗ en dos voces: la del admin
      (detalle) y la de la persona (respetuosa: nunca expone lo íntimo del otro).
   ───────────────────────────────────────────────────────────────────────────── */
// RLR · motor
export const _RLR = 'Ricardo López Reyero';
const _k = 'EYE', _rev = 181218; // candado de autoría

export const MOTOR_VERSION = '2.0';
export const UMBRAL = 90; // solo se muestran coincidencias de 90 % hacia arriba

export const DIMENSIONES = [
  { id: 'vision', nombre: 'Visión de vida', base: 13 },
  { id: 'familia', nombre: 'Proyecto de familia', base: 10 },
  { id: 'valores', nombre: 'Valores en acción', base: 11 },
  { id: 'conflicto', nombre: 'Conflicto y reparación', base: 14 },
  { id: 'afecto', nombre: 'Afecto y cuidado', base: 11 },
  { id: 'intimidad', nombre: 'Intimidad sexual', base: 11 },
  { id: 'espiritual', nombre: 'Fe y vida interior', base: 8 },
  { id: 'cotidiano', nombre: 'Vida cotidiana', base: 10 },
  { id: 'personalidad', nombre: 'Personalidad y humor', base: 8 },
  { id: 'cartas', nombre: 'Cartas', base: 4 },
];
export const DIM = Object.fromEntries(DIMENSIONES.map((d) => [d.id, d]));

/* ── utilidades ──────────────────────────────────────────────────────────── */
const clamp = (x, a = 0, b = 1) => Math.max(a, Math.min(b, x));
const hay = (v) => v !== undefined && v !== null && v !== '' && !(Array.isArray(v) && v.length === 0);
const arr = (v) => (Array.isArray(v) ? v : hay(v) ? [v] : []);
const comun = (a, b) => arr(a).filter((x) => arr(b).includes(x));
const nivel = (orden, v) => { const i = orden.indexOf(v); return i < 0 ? null : i; };
const dist = (orden, a, b) => { const x = nivel(orden, a), y = nivel(orden, b); return x == null || y == null ? null : Math.abs(x - y); };
const porDist = (d, tabla) => (d == null ? null : tabla[Math.min(d, tabla.length - 1)]);
const media = (xs) => (xs.length ? xs.reduce((s, x) => s + x, 0) / xs.length : null);
const armonica = (x, y) => (x + y > 0 ? (2 * x * y) / (x + y) : 0);
const r3 = (x) => Math.round(x * 1000) / 1000;
const matriz = (claves, filas) => Object.fromEntries(claves.map((k, i) => [k, Object.fromEntries(claves.map((c, j) => [c, filas[i][j]]))]));

// Promedio ponderado que ignora componentes sin dato (duda ≠ incumplimiento)
function mezcla(items) {
  let s = 0, w = 0;
  for (const [v, p] of items) if (v != null && Number.isFinite(v)) { s += v * p; w += p; }
  return w ? s / w : null;
}

// Pronombres para que las razones suenen humanas
const el = (P) => (P.r.genero === 'mujer' ? 'ella' : P.r.genero === 'hombre' ? 'él' : 'esa persona');
const El = (P) => { const x = el(P); return x[0].toUpperCase() + x.slice(1); };
const oa = (P) => (P.r.genero === 'mujer' ? 'a' : 'o');
const feDe = (P) => (P.r.genero === 'hombre' ? T.feM : T.fe)[P.r.fe] || '';
const lista = (xs) => (xs.length <= 1 ? xs.join('') : xs.slice(0, -1).join(', ') + ' y ' + xs[xs.length - 1]);

/* ── catálogos legibles (en minúsculas para frases) ──────────────────────── */
const T = {
  entorno: { ciudad_grande: 'una ciudad grande', ciudad_media: 'una ciudad mediana', campo: 'el campo', playa: 'cerca del mar', nomada: 'viajando sin lugar fijo' },
  ejes: { familia: 'la familia', fe: 'la fe', servicio: 'servir a otros', logro: 'el logro', libertad: 'la libertad', aventura: 'la aventura', conocimiento: 'aprender', creatividad: 'crear', paz: 'la paz interior', disfrutar: 'disfrutar la vida' },
  valores: { honestidad: 'honestidad', lealtad: 'lealtad', familia: 'familia', fe: 'fe', libertad: 'libertad', justicia: 'justicia', generosidad: 'generosidad', disciplina: 'disciplina', respeto: 'respeto', humildad: 'humildad', valentia: 'valentía', alegria: 'alegría', esfuerzo: 'trabajo duro', empatia: 'empatía' },
  lenguaje: { tiempo: 'tiempo de calidad', palabras: 'palabras y reconocimiento', contacto: 'contacto físico', detalles: 'detalles', servicio: 'actos de servicio' },
  hijos: { si: 'quiere hijos con certeza', inc_si: 'se inclina a tener hijos', inc_no: 'se inclina a no tener hijos', no: 'no quiere hijos', tengo_mas: 'tiene hijos y quiere más', tengo_no: 'tiene hijos y no quiere más' },
  fe: { catolica: 'católica', cristiana: 'cristiana', judia: 'judía', musulmana: 'musulmana', otra: 'de otra religión', espiritual: 'espiritual sin religión', agnostica: 'agnóstica', atea: 'atea' },
  feM: { catolica: 'católico', cristiana: 'cristiano', judia: 'judío', musulmana: 'musulmán', otra: 'de otra religión', espiritual: 'espiritual sin religión', agnostica: 'agnóstico', atea: 'ateo' },
  feP: { catolica: 'católicos', cristiana: 'cristianos', judia: 'judíos', musulmana: 'musulmanes', otra: 'de otra religión', espiritual: 'espirituales sin religión', agnostica: 'agnósticos', atea: 'ateos' },
  practica: { diario: 'a diario', semana: 'cada semana', aveces: 'de vez en cuando', casi_nunca: 'casi nunca', nunca: 'nunca' },
  conflicto: { caliente: 'lo dice en caliente', calma: 'se calma y lo habla pronto', acumulo: 'se lo guarda hasta que explota', evito: 'evita el tema' },
  necesito: { hablar: 'hablarlo pronto', rato: 'un rato a solas y luego hablar', gesto: 'un gesto de cariño', espacio: 'varios días de espacio' },
  frecuencia: { varias: 'varias veces por semana', una_dos: 'una o dos veces por semana', mes: 'algunas veces al mes', conexion: 'la frecuencia le importa poco' },
  domingo: { descanso: 'descanso', familia: 'familia', culto: 'misa o culto', deporte: 'deporte', naturaleza: 'naturaleza', amigos: 'amigos', cultura: 'cultura', fiesta: 'fiesta', proyectos: 'proyectos propios' },
  sx: { sx_esperar: 'esperar al matrimonio', sx_explorar: 'explorar cosas nuevas con regularidad', sx_porno: 'pornografía en la relación', sx_natural: 'solo métodos naturales de planificación', sx_pruebas: 'pruebas de salud sexual antes de intimar', sx_fantasias: 'contarse fantasías sin juzgarse' },
};

/* ── matrices de compatibilidad ──────────────────────────────────────────── */
const ENTORNO = matriz(['ciudad_grande', 'ciudad_media', 'campo', 'playa', 'nomada'], [
  [1, 0.7, 0.3, 0.45, 0.4], [0.7, 1, 0.65, 0.6, 0.4], [0.3, 0.65, 1, 0.7, 0.45], [0.45, 0.6, 0.7, 1, 0.55], [0.4, 0.4, 0.45, 0.55, 1]]);
const AMBICION = { // lo que A espera de la ambición del otro × cómo es B
  fuerte: { central: 1, equilibrio: 0.75, vida: 0.35 },
  equilibrio: { central: 0.65, equilibrio: 1, vida: 0.8 },
  igual: { central: 0.95, equilibrio: 0.95, vida: 0.95 } };
const HIJOS = matriz(['si', 'inc_si', 'inc_no', 'no', 'tengo_mas', 'tengo_no'], [
  [1, 0.82, 0.35, 0, 0.95, 0], [0.82, 0.95, 0.55, 0.3, 0.8, 0.35], [0.35, 0.55, 0.95, 0.85, 0.35, 0.85],
  [0, 0.3, 0.85, 1, 0, 0.9], [0.95, 0.8, 0.35, 0, 1, 0], [0, 0.35, 0.85, 0.9, 0, 1]]);
const RELACION = matriz(['vida_matrimonio', 'vida', 'seria'], [[1, 0.8, 0.5], [0.8, 1, 0.75], [0.5, 0.75, 1]]);
const FE_HIJOS = matriz(['mi_fe', 'acordada', 'elijan', 'sin'], [[1, 0.7, 0.45, 0.15], [0.7, 1, 0.8, 0.6], [0.45, 0.8, 1, 0.8], [0.15, 0.6, 0.8, 1]]);
// Gottman: importa CÓMO discuten, no cuánto. Perseguir-huir (caliente+evito) y doble acumulador son las combinaciones peligrosas.
const CONFLICTO = matriz(['caliente', 'calma', 'acumulo', 'evito'], [
  [0.6, 0.8, 0.45, 0.25], [0.8, 1, 0.65, 0.6], [0.45, 0.65, 0.3, 0.3], [0.25, 0.6, 0.3, 0.55]]);
const REPARA = { // lo que A necesita tras pelear × lo que B sabe ofrecer
  hablar: { hablar: 1, espacio: 0.35, perdon: 0.75, gesto: 0.6, escuchar: 0.85 },
  rato: { hablar: 0.7, espacio: 1, perdon: 0.7, gesto: 0.6, escuchar: 0.75 },
  gesto: { hablar: 0.55, espacio: 0.4, perdon: 0.85, gesto: 1, escuchar: 0.6 },
  espacio: { hablar: 0.3, espacio: 1, perdon: 0.5, gesto: 0.45, escuchar: 0.55 } };
const TAREAS = matriz(['cincuenta', 'flexible', 'roles', 'conversa'], [
  [1, 0.7, 0.35, 0.8], [0.7, 1, 0.45, 0.9], [0.35, 0.45, 1, 0.45], [0.8, 0.9, 0.45, 1]]);

const ORD = {
  familia_origen: ['muy', 'limites', 'distante'], ritmo: ['pronto', 'calma', 'sin'],
  dinero: ['ahorro', 'equilibrado', 'gasto'], dinero_pareja: ['comun', 'mixto', 'separado'],
  postura: ['progresista', 'centro', 'conservadora'], energia: ['solo', 'depende', 'gente'],
  viernes: ['casa', 'pequeno', 'fiesta'], planes: ['planifico', 'flexible', 'fluyo'],
  cercania: ['todo', 'juntos', 'independencia'], alcohol: ['nada', 'social', 'frecuente'],
  tabaco: ['no', 'ocasional', 'si'], cronotipo: ['madrugador', 'flexible', 'nocturno'], comida: ['cuido', 'equilibrio', 'antojo'], experiencia: ['poca', 'algo', 'bastante'],
  frecuencia: ['varias', 'una_dos', 'mes'], fe_practica: ['diario', 'semana', 'aveces', 'casi_nunca', 'nunca'],
  crecimiento: ['paz', 'cuando', 'central'],
};

/* ── fe: grupos y cercanía entre tradiciones ─────────────────────────────── */
const GRUPO_FE = { catolica: 'catolica', cristiana: 'cristiana', judia: 'judia', musulmana: 'musulmana', otra: 'otra', espiritual: 'espiritual', agnostica: 'secular', atea: 'secular' };
const RELIGION = new Set(['catolica', 'cristiana', 'judia', 'musulmana']);
function cercaniaFe(a, b) {
  if (!hay(a) || !hay(b)) return null;
  if (a === b) return 1;
  const par = (x, y) => (a === x && b === y) || (a === y && b === x);
  if (par('catolica', 'cristiana')) return 0.7;
  if (par('agnostica', 'atea')) return 0.85;
  if (par('espiritual', 'agnostica')) return 0.7;
  if (par('espiritual', 'atea')) return 0.5;
  if (RELIGION.has(a) && RELIGION.has(b)) return 0.42;
  if (a === 'otra' || b === 'otra') return (a === 'espiritual' || b === 'espiritual') ? 0.5 : (a === 'agnostica' || b === 'agnostica' || a === 'atea' || b === 'atea') ? 0.3 : 0.45;
  if ((RELIGION.has(a) && b === 'espiritual') || (RELIGION.has(b) && a === 'espiritual')) return 0.5;
  if ((RELIGION.has(a) && b === 'agnostica') || (RELIGION.has(b) && a === 'agnostica')) return 0.3;
  return 0.2; // religión ↔ atea
}
const planeaHijos = (h) => ['si', 'inc_si', 'tengo_mas'].includes(h);

/* ═══════════════════════════════════════════════════════════════════════════
   PASO 0 · VETOS (filtros duros, de ida y vuelta)
   Cada veto dice de quién es el filtro ('a', 'b' o 'ambos') y si es "suave"
   (edad, distancia, hábitos: la persona podría reconsiderarlo). Nunca le
   sugerimos a nadie negociar hijos, fe, exclusividad ni límites sexuales.
   ═══════════════════════════════════════════════════════════════════════════ */
export function esCandidato(A, B) {
  const ga = A.r.genero, gb = B.r.genero;
  if (!hay(ga) || !hay(gb)) return false;
  return arr(B.r.busca).includes(ga) && arr(A.r.busca).includes(gb);
}

export function vetos(A, B) {
  const v = [];
  const add = (id, de, suave, admin, persona) => v.push({ id, de, suave, txt: admin, persona });
  const ra = A.r, rb = B.r;

  // Edad
  for (const [X, Y, de] of [[A, B, 'b'], [B, A, 'a']]) {
    const rg = Y.r.edad_rango, e = X.r.edad;
    if (Array.isArray(rg) && hay(e) && (e < rg[0] || e > rg[1]))
      add('edad', de, true, `${X.nombre} tiene ${e} y ${Y.nombre} busca de ${rg[0]} a ${rg[1]} años`, 'La edad queda fuera de uno de los dos rangos');
  }
  // Geografía
  if (hay(ra.ciudad) && hay(rb.ciudad) && ra.ciudad !== 'otra' && rb.ciudad !== 'otra' && ra.ciudad !== rb.ciudad && ra.mudanza === 'no' && rb.mudanza === 'no')
    add('distancia', 'ambos', true, `Viven en ciudades distintas y ninguno se movería`, 'Viven en ciudades distintas y ninguno se movería');
  // Hijos: certezas opuestas nunca se cruzan
  if (hay(ra.hijos) && hay(rb.hijos) && HIJOS[ra.hijos][rb.hijos] === 0)
    add('hijos', 'ambos', false, `Hijos: ${A.nombre} ${T.hijos[ra.hijos]}; ${B.nombre} ${T.hijos[rb.hijos]}`, 'No coinciden en tener hijos');
  for (const [X, Y, de] of [[A, B, 'a'], [B, A, 'b']])
    if (X.r.acepta_hijos === 'no' && String(Y.r.hijos || '').startsWith('tengo'))
      add('hijos_pareja', de, false, `${X.nombre} no acepta pareja con hijos y ${Y.nombre} ya tiene`, 'Uno no acepta pareja con hijos');
  // Exclusividad
  if ((ra.exclusividad === 'innegociable' && rb.exclusividad === 'abierta') || (rb.exclusividad === 'innegociable' && ra.exclusividad === 'abierta'))
    add('exclusividad', 'ambos', false, 'Uno necesita exclusividad y el otro está abierto a no tenerla', 'No coinciden en exclusividad');
  // Fe innegociable: misma tradición Y práctica parecida (la etiqueta sola no protege a nadie)
  for (const [X, Y, de] of [[A, B, 'a'], [B, A, 'b']]) {
    if (X.r.fe_compartir !== 'necesito' || !hay(X.r.fe) || !hay(Y.r.fe)) continue;
    const gx = GRUPO_FE[X.r.fe], gy = GRUPO_FE[Y.r.fe];
    if (gx !== gy) add('fe', de, false, `${X.nombre} necesita compartir su fe (${feDe(X)}) y ${Y.nombre} es ${feDe(Y)}`, 'Uno necesita compartir la fe y no la comparten');
    else if (gx !== 'secular') {
      const d = dist(ORD.fe_practica, X.r.fe_practica, Y.r.fe_practica);
      if (d != null && d >= 3) add('fe_practica', de, false, `Misma fe, pero ${X.nombre} la vive ${T.practica[X.r.fe_practica]} y ${Y.nombre} ${T.practica[Y.r.fe_practica]}`, 'Comparten la fe pero no la forma de vivirla');
    }
  }
  // Formación espiritual de los hijos (solo si los dos los planean)
  if (planeaHijos(ra.hijos) && planeaHijos(rb.hijos)) {
    const par = [ra.fe_hijos, rb.fe_hijos];
    if (par.includes('mi_fe') && par.includes('sin') && (ra.fe_compartir === 'necesito' || rb.fe_compartir === 'necesito'))
      add('fe_hijos', 'ambos', false, 'Uno educaría a los hijos en su fe y el otro sin formación religiosa, y es innegociable', 'No coinciden en la formación espiritual de los hijos');
  }
  // Hábitos: un "no acepto" contra un hábito declarado
  for (const [X, Y, de] of [[A, B, 'a'], [B, A, 'b']]) {
    const alc = nivel(ORD.alcohol, Y.r.alcohol), alcOk = nivel(ORD.alcohol, X.r.alcohol_acepto);
    if (alc != null && alcOk != null && alc > alcOk)
      add('alcohol', de, true, `${X.nombre} acepta alcohol hasta "${X.r.alcohol_acepto}" y ${Y.nombre} bebe "${Y.r.alcohol}"`, 'Un hábito de uno no lo acepta el otro');
    const tab = nivel(ORD.tabaco, Y.r.tabaco), tabOk = nivel(ORD.tabaco, X.r.tabaco_acepto);
    if (tab != null && tabOk != null && tab > tabOk)
      add('tabaco', de, true, `${X.nombre} no acepta tabaco a ese nivel y ${Y.nombre} fuma (${Y.r.tabaco})`, 'Un hábito de uno no lo acepta el otro');
    // Comida: "solo alguien que se cuida" contra "como lo que se me antoja" (el punto medio nunca veta)
    const com = nivel(ORD.comida, Y.r.comida), comOk = nivel(ORD.comida, X.r.comida_acepto);
    if (com != null && comOk != null && com > comOk + 1)
      add('comida', de, true, `${X.nombre} solo acepta a alguien que se cuida en la comida y ${Y.nombre} come lo que se le antoja`, 'La forma de comer de uno no la acepta el otro');
    if (X.r.mascotas_acepto === 'no' && Y.r.mascotas === 'familia')
      add('mascotas', de, true, `${X.nombre} prefiere pareja sin mascotas y ${Y.nombre} tiene y son familia`, 'Mascotas: uno tiene y el otro prefiere que no');
  }
  // Política innegociable
  for (const [X, Y, de] of [[A, B, 'a'], [B, A, 'b']]) {
    const d = dist(ORD.postura, X.r.postura, Y.r.postura); // "prefiero no decirlo" = sin dato = nunca veta
    if (X.r.politica === 'innegociable' && d != null && d >= 1)
      add('politica', de, false, `${X.nombre} declaró innegociable la afinidad política y sus posturas difieren`, 'Uno declaró innegociable la afinidad política');
  }
  // Innegociables sexuales: "lo necesito" contra "no lo acepto"
  for (const k of Object.keys(T.sx)) {
    if ((ra[k] === 'necesito' && rb[k] === 'no') || (rb[k] === 'necesito' && ra[k] === 'no')) {
      const quien = ra[k] === 'necesito' ? [A, B] : [B, A];
      add('sexual', ra[k] === 'necesito' ? 'b' : 'a', false, `Innegociable íntimo: ${quien[0].nombre} necesita ${T.sx[k]} y ${quien[1].nombre} no lo acepta`, 'Un innegociable íntimo de uno es un límite del otro');
    }
  }
  return v;
}

/* ═══════════════════════════════════════════════════════════════════════════
   PASO 1 · DIMENSIONES DIRECCIONALES  s(A→B): ¿qué tan bien le queda B a A?
   Cada función devuelve { s, notas:[{ ok: 1|0|-1, txt (admin), persona }] }
   ═══════════════════════════════════════════════════════════════════════════ */
const nota = (ok, txt, persona = txt) => ({ ok, txt, persona });

function dVision(A, B) {
  const a = A.r, b = B.r, n = [];
  const ent = hay(a.entorno) && hay(b.entorno) ? ENTORNO[a.entorno][b.entorno] : null;
  if (ent === 1) n.push(nota(1, `Los dos se ven viviendo en ${T.entorno[a.entorno]}`, 'Se imaginan su vida en el mismo tipo de lugar'));
  else if (ent != null && ent < 0.5) n.push(nota(-1, `Tú te ves en ${T.entorno[a.entorno]} y ${el(B)} en ${T.entorno[b.entorno]}`));
  else if (ent != null) n.push(nota(0, `Lugares cercanos: tú ${T.entorno[a.entorno]}, ${el(B)} ${T.entorno[b.entorno]}`, 'Se imaginan vivir en lugares distintos pero cercanos'));

  const ce = comun(a.ejes, b.ejes);
  const ejes = hay(a.ejes) && hay(b.ejes) ? 0.4 + 0.6 * ce.length / Math.min(3, arr(a.ejes).length, arr(b.ejes).length) : null;
  if (ce.length >= 2) n.push(nota(1, `Para los dos, una vida bien vivida es ${lista(ce.map((x) => T.ejes[x]))}`));
  else if (ce.length === 1) n.push(nota(0, `Coinciden en que una vida bien vivida pasa por ${T.ejes[ce[0]]}`));
  else if (ejes != null) n.push(nota(-1, 'Definen distinto qué es una vida bien vivida'));

  const amb = hay(a.ambicion_pareja) && hay(b.ambicion) ? AMBICION[a.ambicion_pareja][b.ambicion] : null;
  if (amb != null && amb >= 0.95 && a.ambicion_pareja !== 'igual') n.push(nota(1, `Lo que esperas de su ambición es justo como ${el(B)} vive su trabajo`));
  else if (amb != null && amb < 0.5) n.push(nota(-1, `Esperas otra relación con el trabajo de la que ${el(B)} tiene`));

  const df = dist(ORD.familia_origen, a.familia_origen, b.familia_origen);
  const fam = porDist(df, [1, 0.65, 0.3]);
  if (df === 0) n.push(nota(1, 'Le dan el mismo lugar a su familia de origen'));
  else if (df === 2) n.push(nota(-1, 'Una familia muy presente y otra distante: la familia política será tema'));

  return { s: mezcla([[ent, 0.3], [ejes, 0.3], [amb, 0.25], [fam, 0.15]]), notas: n };
}

function dFamilia(A, B) {
  const a = A.r, b = B.r, n = [];
  let hij = hay(a.hijos) && hay(b.hijos) ? HIJOS[a.hijos][b.hijos] : null;
  if (hij != null && String(b.hijos).startsWith('tengo') && a.acepta_hijos === 'depende') hij *= 0.8;
  if (hij != null) {
    if (a.hijos === b.hijos) n.push(nota(1, a.hijos === 'si' || a.hijos === 'tengo_mas' ? 'Los dos quieren hijos' : a.hijos === 'no' ? 'Ninguno de los dos quiere hijos' : a.hijos === 'tengo_no' ? 'Los dos ya tienen hijos y no quieren más' : `Los dos ${a.hijos === 'inc_si' ? 'se inclinan a tener hijos' : 'se inclinan a no tener hijos'}`));
    else if (hij >= 0.8) n.push(nota(1, `En hijos van en la misma dirección: tú ${T.hijos[a.hijos].replace('quiere', 'quieres').replace('se inclina', 'te inclinas').replace('tiene', 'tienes')}; ${el(B)} ${T.hijos[b.hijos]}`, 'En hijos van en la misma dirección'));
    else if (hij >= 0.5) n.push(nota(0, `Hijos: una certeza y una inclinación, hay que platicarlo`, 'En hijos hay una diferencia que conviene platicar pronto'));
    else if (hij > 0) n.push(nota(-1, `Hijos: tú ${T.hijos[a.hijos].replace('quiere', 'quieres').replace('se inclina', 'te inclinas').replace('tiene', 'tienes')}; ${el(B)} ${T.hijos[b.hijos]}`, 'En hijos van en direcciones distintas'));
  }
  const rel = hay(a.relacion) && hay(b.relacion) ? RELACION[a.relacion][b.relacion] : null;
  if (rel === 1) n.push(nota(1, 'Buscan exactamente el mismo tipo de relación'));
  else if (rel != null && rel <= 0.5) n.push(nota(-1, 'Uno busca matrimonio y el otro "ver hasta dónde llega"'));
  const dr = dist(ORD.ritmo, a.ritmo, b.ritmo);
  const rit = porDist(dr, [1, 0.7, 0.45]);
  if (dr === 0 && a.ritmo === 'pronto') n.push(nota(1, 'Los dos quieren formar un hogar pronto'));
  else if (dr === 2) n.push(nota(-1, 'Uno tiene prisa por formar hogar y el otro no tiene calendario'));
  let fh = null;
  if (planeaHijos(a.hijos) && planeaHijos(b.hijos) && hay(a.fe_hijos) && hay(b.fe_hijos) && a.fe_hijos !== 'no_aplica' && b.fe_hijos !== 'no_aplica') {
    fh = FE_HIJOS[a.fe_hijos][b.fe_hijos];
    if (a.fe_hijos === 'mi_fe' && b.fe_hijos === 'mi_fe') fh = GRUPO_FE[a.fe] === GRUPO_FE[b.fe] ? 1 : 0.25;
    if (fh >= 0.95) n.push(nota(1, 'Imaginan igual la formación espiritual de sus hijos'));
    else if (fh < 0.5) n.push(nota(-1, 'Imaginan distinta la formación espiritual de sus hijos'));
  }
  return { s: mezcla([[hij, 0.45], [rel, 0.2], [rit, 0.2], [fh, 0.15]]), notas: n };
}

function dValores(A, B) {
  const a = A.r, b = B.r, n = [];
  const cv = comun(a.valores, b.valores);
  const val = hay(a.valores) && hay(b.valores) ? 0.35 + 0.65 * cv.length / 3 : null;
  if (cv.length >= 2) n.push(nota(1, `Comparten dos de sus tres valores innegociables: ${lista(cv.map((x) => T.valores[x]))}`, `Sus valores innegociables coinciden: ${lista(cv.map((x) => T.valores[x]))}`));
  else if (cv.length === 1) n.push(nota(0, `Coinciden en un valor innegociable: ${T.valores[cv[0]]}`));
  else if (val != null) n.push(nota(-1, 'Sus tres valores innegociables son distintos'));
  const d1 = dist(ORD.dinero, a.dinero, b.dinero), d2 = dist(ORD.dinero_pareja, a.dinero_pareja, b.dinero_pareja);
  const din = porDist(d1, [1, 0.75, 0.35]), dp = porDist(d2, [1, 0.7, 0.3]);
  if (d1 === 0 && d2 === 0) n.push(nota(1, 'Manejan y se imaginan el dinero en pareja igual'));
  else if (d1 === 2) n.push(nota(-1, 'Uno ahorra y el otro disfruta gastar: el dinero pedirá acuerdos'));
  else if (d2 === 2) n.push(nota(-1, 'Uno imagina todo en común y el otro cuentas separadas'));
  let pol = null;
  const dp2 = dist(ORD.postura, a.postura, b.postura);
  if (dp2 != null && hay(a.politica)) {
    pol = { nada: [1, 1, 1], algo: [1, 0.8, 0.6], mucho: [1, 0.55, 0.25], innegociable: [1, 0.2, 0] }[a.politica][dp2];
    if (a.politica !== 'nada' && dp2 === 0) n.push(nota(1, 'Tienen afinidad en su visión social'));
    else if (pol < 0.6) n.push(nota(-1, 'Te importa la afinidad política y sus posturas están lejos'));
  }
  return { s: mezcla([[val, 0.4], [din, 0.2], [dp, 0.2], [pol, 0.2]]), notas: n };
}

function dConflicto(A, B) {
  const a = A.r, b = B.r, n = [];
  const est = hay(a.conflicto) && hay(b.conflicto) ? CONFLICTO[a.conflicto][b.conflicto] : null;
  if (a.conflicto === 'calma' && b.conflicto === 'calma') n.push(nota(1, 'Cuando algo les molesta, los dos se calman y lo hablan pronto'));
  else if (est != null && est >= 0.8) n.push(nota(1, `Discuten de formas que se entienden: tú ${T.conflicto[a.conflicto].replace(/^lo dice/, 'lo dices').replace(/^se calma/, 'te calmas').replace(/^se lo guarda/, 'te lo guardas').replace(/^evita/, 'evitas')}; ${el(B)} ${T.conflicto[b.conflicto]}`, 'Discuten de formas que se entienden'));
  else if (est != null && est <= 0.3) n.push(nota(-1, `Combinación de riesgo al pelear: ${T.conflicto[a.conflicto]} + ${T.conflicto[b.conflicto]}`, 'Su forma de discutir choca: tendrían que aprenderla juntos'));
  else if (a.conflicto === 'caliente' && b.conflicto === 'caliente') n.push(nota(0, 'Los dos dicen las cosas en caliente: la reparación tiene que ser rápida y sin rencor', 'Los dos dicen las cosas en caliente: reparen rápido'));
  else if (a.conflicto === 'evito' && b.conflicto === 'evito') n.push(nota(0, 'Los dos evitan el conflicto: cuidado con lo que se acumula sin decirse', 'Los dos evitan el conflicto: cuiden lo que no se dice'));
  else if (est != null && est < 0.8) n.push(nota(0, 'Discuten distinto: habrá que acordar cómo', 'Discuten distinto: habrá que acordar cómo'));

  let rep = null;
  if (hay(a.repara_necesito) && hay(b.repara_ofrezco)) {
    const vals = arr(b.repara_ofrezco).map((o) => REPARA[a.repara_necesito][o] ?? 0.5);
    rep = clamp(Math.max(...vals) + 0.05 * Math.max(0, vals.filter((x) => x >= 0.7).length - 1));
    if (rep >= 0.95) n.push(nota(1, `Lo que necesitas después de una pelea (${T.necesito[a.repara_necesito]}) es algo que ${el(B)} sabe dar`));
    else if (rep < 0.55) n.push(nota(-1, `Después de pelear necesitas ${T.necesito[a.repara_necesito]} y ${el(B)} repara de otra forma`, 'Reparan de maneras distintas después de pelear'));
  }
  const resp = B.l?.rubrica?.responsabilidad;
  const rs = hay(resp) ? 0.5 + 0.05 * resp : null;
  if (hay(resp) && resp >= 8) n.push(nota(1, `${El(B)} asume su parte cuando cuenta sus conflictos (lectura ${resp}/10)`, `${El(B)} asume su parte en los conflictos`));
  else if (hay(resp) && resp <= 5) n.push(nota(-1, `Al contar sus conflictos, ${el(B)} tiende a poner la culpa afuera (lectura ${resp}/10)`, null));
  return { s: mezcla([[est, 0.45], [rep, 0.35], [rs, 0.2]]), notas: n };
}

const top2 = (rank) => arr(rank).slice(0, 2);
function dAfecto(A, B) {
  const a = A.r, b = B.r, n = [];
  let len = null;
  if (hay(a.amor_recibo) && hay(b.amor_doy)) {
    const pos = (x) => { const i = arr(b.amor_doy).indexOf(x); return [1, 0.85, 0.6, 0.35, 0.15][i < 0 ? 4 : i]; };
    const [r1, r2] = arr(a.amor_recibo);
    len = 0.65 * pos(r1) + 0.35 * pos(r2);
    if (pos(r1) >= 0.85) n.push(nota(1, `Lo que más te llega (${T.lenguaje[r1]}) es lo que ${el(B)} da con más naturalidad`));
    else if (pos(r1) <= 0.35) n.push(nota(-1, `Lo que más te llega (${T.lenguaje[r1]}) no es lo primero que ${el(B)} sabe dar`));
  }
  const dc = dist(ORD.cercania, a.cercania, b.cercania);
  const cer = porDist(dc, [1, 0.55, 0.15]);
  if (dc === 0) n.push(nota(1, 'Necesitan la misma cercanía en pareja'));
  else if (dc === 1) n.push(nota(0, 'Uno necesita un poco más de cercanía que el otro: ojo con el ciclo perseguir-huir', 'Uno necesita un poco más de cercanía que el otro'));
  else if (dc === 2) n.push(nota(-1, 'Uno quiere compartirlo casi todo y el otro mucha independencia'));
  let cui = null;
  if (hay(a.amor_recibo) && hay(b.cuidado)) {
    const mapa = { tiempo: 'presencia', palabras: 'animo', contacto: 'presencia', detalles: 'consentir', servicio: 'resolver' };
    const [r1, r2] = arr(a.amor_recibo);
    cui = arr(b.cuidado).includes(mapa[r1]) ? 1 : arr(b.cuidado).includes(mapa[r2]) ? 0.8 : 0.55;
    if (cui === 1) n.push(nota(1, `Cuando estés en tu peor momento, ${el(B)} cuida justo como lo necesitas`));
  }
  return { s: mezcla([[len, 0.45], [cer, 0.35], [cui, 0.2]]), notas: n };
}

function dIntimidad(A, B) {
  const a = A.r, b = B.r, n = [];
  const P = 'En lo íntimo'; // la persona nunca ve el detalle íntimo del otro
  // Frecuencia, leída con la negociabilidad propia y el tipo de deseo
  let fre = null;
  if (hay(a.frecuencia) && hay(b.frecuencia)) {
    if (a.frecuencia === 'conexion' || b.frecuencia === 'conexion') {
      const otro = a.frecuencia === 'conexion' ? b : a;
      fre = a.frecuencia === b.frecuencia ? 1 : otro.frecuencia === 'varias' && otro.frecuencia_negociable === 'poco' ? 0.7 : 0.9;
    } else {
      const la = nivel(ORD.frecuencia, a.frecuencia), lb = nivel(ORD.frecuencia, b.frecuencia), d = Math.abs(la - lb);
      const neg = a.frecuencia_negociable || 'algo';
      fre = d === 0 ? 1 : d === 1 ? { muy: 0.85, algo: 0.75, poco: 0.6 }[neg] : { muy: 0.6, algo: 0.45, poco: 0.25 }[neg];
      const daCercania = (X) => top2(X.r.amor_doy).some((x) => x === 'contacto' || x === 'tiempo');
      if (d > 0 && la < lb && b.deseo === 'responsivo' && daCercania(A)) {
        fre = clamp(fre + 0.12);
        n.push(nota(0, `Su deseo es responsivo y tú das contacto y tiempo: la brecha de frecuencia pesa menos`, null));
      } else if (d > 0 && la > lb && a.deseo === 'responsivo' && daCercania(B)) fre = clamp(fre + 0.08);
    }
    if (fre >= 0.95) n.push(nota(1, `Frecuencia ideal compatible (${T.frecuencia[a.frecuencia]} / ${T.frecuencia[b.frecuencia]})`, `${P} quieren un ritmo parecido`));
    else if (fre < 0.5) n.push(nota(-1, `Frecuencia lejana: tú ${T.frecuencia[a.frecuencia]} (${a.frecuencia_negociable} negociable), ${el(B)} ${T.frecuencia[b.frecuencia]}`, `${P} sus ritmos están lejos`));
    else if (fre < 0.8) n.push(nota(0, `Frecuencia distinta pero con margen`, `${P} sus ritmos son distintos, pero hay margen`));
  }
  // Apertura en doble dirección
  let ape = null;
  if (hay(a.apertura) && hay(b.apertura) && hay(a.apertura_pareja)) {
    const x = a.apertura, y = b.apertura;
    if (a.apertura_pareja === 'como_yo') ape = clamp(1 - 0.22 * Math.abs(x - y));
    else if (a.apertura_pareja === 'abra') ape = y === x + 1 || y === x + 2 ? 1 : y === x ? 0.8 : y >= x + 3 ? 0.6 : clamp(0.5 - 0.1 * (x - y));
    else ape = y <= x ? 1 : y === x + 1 ? 0.75 : y === x + 2 ? 0.45 : 0.2;
    if (ape >= 0.95) n.push(nota(1, `Apertura compatible: tú ${x}/5 (${a.apertura_pareja === 'respete' ? 'necesitas respeto a tus límites' : a.apertura_pareja === 'abra' ? 'quieres que te abran mundo' : 'prefieres alguien como tú'}), ${el(B)} ${y}/5`, `${P} viven la sexualidad de formas que embonan`));
    else if (ape < 0.5) n.push(nota(-1, `Apertura: tú ${x}/5 y ${el(B)} ${y}/5 con tu necesidad "${a.apertura_pareja}"`, `${P} esperan cosas distintas`));
  }
  // Comunicación íntima: la predictora más fuerte de satisfacción sexual
  let com = null;
  if (hay(a.hablar_intimo) && hay(b.hablar_intimo)) {
    const m = Math.min(a.hablar_intimo, b.hablar_intimo);
    com = a.hablar_intimo <= 2 && b.hablar_intimo <= 2 ? 0.4 : m >= 4 ? 1 : m === 3 ? 0.85 : m === 2 ? 0.65 : 0.45;
    if (com === 1) n.push(nota(1, 'A los dos les resulta fácil hablar de lo íntimo'));
    else if (com <= 0.45) n.push(nota(-1, 'Hablar de lo íntimo les costaría a los dos', 'Hablar de lo íntimo les va a costar: vale la pena cuidarlo'));
  }
  // Lo que enciende a A, contra cómo da cariño B durante el día
  let enc = null;
  if (hay(a.enciende)) {
    const dB = top2(b.amor_doy);
    const da = {
      escucha: dB.includes('tiempo') || dB.includes('palabras') || arr(b.cuidado).includes('presencia'),
      palabras: dB.includes('palabras'),
      ternura: dB.includes('contacto'),
      iniciativa: b.deseo === 'espontaneo' || (nivel(ORD.frecuencia, b.frecuencia) != null && nivel(ORD.frecuencia, a.frecuencia) != null && nivel(ORD.frecuencia, b.frecuencia) <= nivel(ORD.frecuencia, a.frecuencia)),
      juego: comun(a.humor, b.humor).length > 0,
      novedad: (b.apertura || 0) >= 4 || (b.aventura || 0) >= 4,
      equipo: ['cincuenta', 'conversa', 'flexible'].includes(b.tareas),
      cuidado: dB.includes('servicio') || arr(b.cuidado).includes('resolver'),
    };
    const pide = arr(a.enciende), si = pide.filter((x) => da[x]);
    enc = 0.45 + 0.55 * si.length / pide.length;
    if (si.length === pide.length) n.push(nota(1, `Lo que te enciende lo da ${el(B)} en lo cotidiano (${si.length} de ${pide.length})`, 'Lo que te hace sentir deseado' + oa(A) + ' coincide con cómo ' + el(B) + ' da cariño'));
    else if (si.length === 0) n.push(nota(-1, `Nada de lo que te enciende aparece en cómo ${el(B)} da cariño`, null));
  }
  // Lo que apaga a A, contra los riesgos de B
  let apa = null;
  if (hay(a.apaga)) {
    const la = nivel(ORD.frecuencia, a.frecuencia), lb = nivel(ORD.frecuencia, b.frecuencia);
    const riesgo = {
      presion: (la != null && lb != null && lb + 2 <= la && b.frecuencia_negociable === 'poco') || (b.apertura_pareja === 'abra' && (a.apertura || 5) <= 2) ? 1 : 0,
      criticas: b.conflicto === 'caliente' ? 1 : comun(b.humor, ['ironia', 'negro']).length ? 0.5 : 0,
      pendientes: ['acumulo', 'evito'].includes(b.conflicto) ? 1 : 0,
      frialdad: !top2(b.amor_doy).some((x) => ['contacto', 'palabras', 'tiempo'].includes(x)) || b.cercania === 'independencia' ? 1 : 0,
      prisa: b.deseo === 'espontaneo' && a.deseo === 'responsivo' ? 0.5 : 0,
    };
    const r = arr(a.apaga).reduce((s, x) => s + (riesgo[x] || 0), 0);
    apa = Math.max(0.4, 1 - 0.15 * r);
    if (r >= 2) n.push(nota(-1, `Dos o más cosas que te apagan aparecen en su forma de ser`, 'Hay cosas que te apagan que tendrían que cuidar'));
  }
  const resp = B.l?.rubrica?.responsabilidad;
  const man = hay(resp) ? 0.55 + 0.045 * resp : null;
  // v2.1 · el día a día íntimo: contacto, iniciativa, estilo, después, experiencia y el "no tengo ganas"
  let con = null;
  if (hay(a.contacto_diario) && hay(b.contacto_diario)) {
    const d = Math.abs(a.contacto_diario - b.contacto_diario);
    con = [1, 0.85, 0.6, 0.4, 0.25][d];
    if (d === 0 && a.contacto_diario >= 4) n.push(nota(1, 'Los dos necesitan mucho contacto físico a diario', `${P} necesitan la misma cercanía física en el día a día`));
    else if (d >= 3) n.push(nota(-1, `Contacto diario: tú ${a.contacto_diario}/5 y ${el(B)} ${b.contacto_diario}/5`, `${P} uno necesita mucho más contacto diario que el otro`));
  }
  let ini = null;
  if (hay(a.iniciativa) && hay(b.iniciativa)) {
    const x = a.iniciativa, y = b.iniciativa;
    ini = x === 'ambos' || y === 'ambos' ? (x === y ? 1 : 0.9) : x !== y ? 1 : x === 'yo' ? 0.75 : 0.5;
    if (ini === 1 && x !== y) n.push(nota(1, 'Uno toma la iniciativa y al otro le gusta que la tomen', `${P} embonan en quién da el primer paso`));
    else if (ini === 0.5) n.push(nota(-1, 'A los dos les gusta que el otro inicie: nadie daría el primer paso', `${P} a los dos les gusta que el otro inicie: alguien tendría que animarse`));
  }
  let est = null;
  if (hay(a.estilo) && hay(b.estilo)) {
    const VECINOS = { lento: ['tierno'], tierno: ['lento', 'jugueton'], jugueton: ['tierno', 'aventurero'], intenso: ['aventurero'], aventurero: ['intenso', 'jugueton'] };
    const iguales = comun(a.estilo, b.estilo).length, vecinos = arr(a.estilo).some((x) => arr(b.estilo).some((y) => (VECINOS[x] || []).includes(y)));
    est = iguales ? 1 : vecinos ? 0.8 : 0.5;
    if (iguales) n.push(nota(1, `Su forma natural en lo íntimo se parece (${comun(a.estilo, b.estilo).join(', ')})`, `${P} su forma natural se parece`));
    else if (est === 0.5) n.push(nota(-1, `Estilos distintos: tú ${arr(a.estilo).join('/')} y ${el(B)} ${arr(b.estilo).join('/')}`, null));
  }
  let des = null;
  if (hay(a.despues) && hay(b.despues)) {
    des = a.despues === b.despues || a.despues === 'depende' || b.despues === 'depende' ? 1 : [a.despues, b.despues].includes('dormir') ? 0.5 : 0.8;
    if (des === 0.5) n.push(nota(-1, 'Después: uno quiere cercanía y el otro dormir', `${P} lo que necesitan después es distinto: vale la pena hablarlo`));
  }
  let exp = null;
  if (hay(a.experiencia_pareja) && hay(b.experiencia)) {
    const d = hay(a.experiencia) ? Math.abs(nivel(ORD.experiencia, a.experiencia) - nivel(ORD.experiencia, b.experiencia)) : 0;
    exp = a.experiencia_pareja === 'igual' ? 1 : a.experiencia_pareja === 'parecida' ? [1, 0.7, 0.4][d] : { poca: 1, algo: 0.6, bastante: 0.3 }[b.experiencia];
    if (exp <= 0.4) n.push(nota(-1, `Prefieres experiencia ${a.experiencia_pareja === 'poca' ? 'poca' : 'parecida a la tuya'} y la de ${el(B)} es ${b.experiencia}`, `${P} lo que esperan de la historia del otro no embona`));
  }
  let sg = null;
  if (hay(a.sin_ganas) && hay(b.sin_ganas)) {
    const dice = { directo: 1, senal: 0.8, cedo: 0.55, cuesta: 0.6 };
    const recibe = { bien: 1, duele: 0.8, insisto: 0.5 };
    sg = mezcla([[dice[b.sin_ganas], 1], [hay(b.sin_ganas_pareja) ? recibe[b.sin_ganas_pareja] : null, 1]]);
    if (a.sin_ganas === 'cuesta' && b.sin_ganas === 'cuesta') { sg = 0.35; n.push(nota(-1, 'A los dos les cuesta decir cuando no hay ganas', `${P} a los dos les cuesta decir "hoy no": cuídenlo desde el principio`)); }
    else if (b.sin_ganas_pareja === 'insisto' && ['cedo', 'cuesta'].includes(a.sin_ganas)) { sg = 0.3; n.push(nota(-1, `${el(B)} suele insistir y a ti te cuesta decir que no`, `${P} hay un riesgo de presión que tendrían que cuidar`)); }
    else if (b.sin_ganas === 'directo' && b.sin_ganas_pareja === 'bien') n.push(nota(1, `${el(B)} dice "hoy no" con cariño y lo recibe bien`, `${P} saben decir y recibir un "hoy no"`));
  }
  return { s: mezcla([[fre, 0.22], [ape, 0.15], [com, 0.12], [enc, 0.12], [apa, 0.08], [man, 0.07], [con, 0.08], [ini, 0.05], [est, 0.04], [des, 0.03], [exp, 0.02], [sg, 0.02]]), notas: n };
}

function dEspiritual(A, B) {
  const a = A.r, b = B.r, n = [];
  const F = cercaniaFe(a.fe, b.fe);
  const dp = dist(ORD.fe_practica, a.fe_practica, b.fe_practica);
  const sp = porDist(dp, [1, 0.82, 0.6, 0.38, 0.2]);
  let fe = null;
  if (F != null) {
    const base = sp == null ? F : 0.6 * F + 0.4 * sp;
    fe = a.fe_compartir === 'no_importa' ? 0.8 + 0.2 * F : a.fe_compartir === 'necesito' ? base : 0.3 + 0.7 * base;
    if (F === 1 && dp != null && dp <= 1) n.push(nota(1, GRUPO_FE[a.fe] === 'secular' ? `Ninguno de los dos es religioso y lo espiritual les pesa parecido` : `Los dos son ${T.feP[a.fe]} y viven su fe con intensidad parecida`, GRUPO_FE[a.fe] === 'secular' ? 'Ven lo espiritual desde el mismo lugar' : 'Su vida espiritual va en la misma sintonía'));
    else if (F >= 0.7 && (dp == null || dp <= 1)) n.push(nota(1, `Tradiciones cercanas (${feDe(A)} / ${feDe(B)}) y práctica parecida`, 'Viven lo espiritual de formas cercanas'));
    else if (fe < 0.55) n.push(nota(-1, `Fe distinta: tú ${feDe(A)} (${T.practica[a.fe_practica] || '—'}), ${el(B)} ${feDe(B)} (${T.practica[b.fe_practica] || '—'})`, 'Viven lo espiritual de formas muy distintas'));
  }
  let pra = null;
  const pa = arr(a.practicas).filter((x) => x !== 'ninguna'), pb = arr(b.practicas).filter((x) => x !== 'ninguna');
  if (hay(a.practicas_pareja)) {
    const cp = comun(pa, pb);
    if (a.practicas_pareja === 'juntos') {
      pra = pa.length ? 0.3 + 0.7 * Math.min(1, cp.length / Math.min(3, pa.length)) : 1;
      if (pa.length && cp.length >= Math.min(2, pa.length)) n.push(nota(1, `Quieres compartir tus prácticas y ${el(B)} ya las vive`, 'Podrían compartir sus prácticas interiores'));
      else if (pa.length && !cp.length) n.push(nota(-1, `Quieres compartir tus prácticas y ${el(B)} no practica ninguna de ellas`, 'Te gustaría compartir prácticas que no tienen en común'));
    } else pra = a.practicas_pareja === 'espacio' ? 0.9 + (cp.length ? 0.1 : 0) : 0.95;
  }
  let cre = null;
  const ca = nivel(ORD.crecimiento, a.crecimiento), cb = nivel(ORD.crecimiento, b.crecimiento);
  if (ca != null && cb != null && hay(a.crecimiento_pareja)) {
    const d = Math.abs(ca - cb);
    cre = a.crecimiento_pareja === 'conmigo' ? (cb >= ca ? 1 : ca - cb === 1 ? 0.55 : 0.15) : [1, 0.85, 0.6][d];
    if (d === 0 && a.crecimiento === 'central') n.push(nota(1, 'Para los dos crecer por dentro es central'));
    else if (cre < 0.6) n.push(nota(-1, `Necesitas que tu pareja crezca contigo y ${el(B)} está en otro momento`, 'Están en momentos distintos de crecimiento personal'));
  }
  const auto = B.l?.rubrica?.autoconocimiento;
  const con = hay(auto) ? 0.6 + 0.04 * auto : null;
  return { s: mezcla([[fe, 0.35], [pra, 0.25], [cre, 0.25], [con, 0.15]]), notas: n };
}

function dCotidiano(A, B) {
  const a = A.r, b = B.r, n = [];
  const hab = mezcla([[porDist(dist(ORD.alcohol, a.alcohol, b.alcohol), [1, 0.75, 0.45]), 1], [porDist(dist(ORD.tabaco, a.tabaco, b.tabaco), [1, 0.6, 0.3]), 1]]);
  let eje = null;
  if (hay(a.ejercicio_pareja) && hay(b.ejercicio)) {
    eje = a.ejercicio_pareja === 'igual' ? 1 : a.ejercicio_pareja === 'algo' ? (b.ejercicio === 'nada' ? 0.6 : 1) : { vida: 1, aveces: 0.65, nada: 0.3 }[b.ejercicio];
    if (a.ejercicio_pareja === 'activo' && b.ejercicio === 'vida') n.push(nota(1, `Buscas a alguien activ${oa(B)} y el ejercicio es parte de su vida`));
    else if (eje <= 0.3) n.push(nota(-1, `Buscas a alguien activ${oa(B)} y ${el(B)} no hace ejercicio`));
  }
  let mas = null;
  if (hay(a.mascotas_acepto) && hay(b.mascotas)) mas = a.mascotas_acepto === 'si' ? 1 : a.mascotas_acepto === 'gustan' ? (b.mascotas === 'familia' ? 0.75 : 1) : { familia: 0, gustan: 0.8, sin: 1 }[b.mascotas];
  const dcr = dist(ORD.cronotipo, a.cronotipo, b.cronotipo);
  const cro = porDist(dcr, [1, 0.8, 0.5]);
  if (dcr === 0 && a.cronotipo !== 'flexible') n.push(nota(1, `Los dos son ${a.cronotipo === 'madrugador' ? 'madrugadores' : 'nocturnos'}`));
  else if (dcr === 2) n.push(nota(-1, 'Uno madruga y el otro trasnocha'));
  let ord = null;
  if (hay(a.molesta_desorden) && hay(b.orden_casa)) {
    const gap = Math.max(0, { poco: 2, algo: 3, mucho: 4 }[a.molesta_desorden] - b.orden_casa);
    ord = Math.max(0.25, 1 - 0.25 * gap);
    if (gap >= 2) n.push(nota(-1, `Te molesta el desorden y su casa hoy está en ${b.orden_casa}/5`, 'El orden de la casa va a pedir acuerdos'));
  }
  const cd = comun(a.domingo_tipo, b.domingo_tipo);
  const dom = hay(a.domingo_tipo) && hay(b.domingo_tipo) ? 0.4 + 0.6 * cd.length / Math.min(3, arr(a.domingo_tipo).length, arr(b.domingo_tipo).length) : null;
  if (cd.length >= 2) n.push(nota(1, `Su domingo perfecto se parece: ${lista(cd.map((x) => T.domingo[x]))}`));
  else if (dom != null && !cd.length) n.push(nota(-1, 'Sus domingos perfectos no se parecen en nada'));
  let tar = null;
  if (hay(a.tareas) && hay(b.tareas)) {
    tar = TAREAS[a.tareas][b.tareas];
    if (a.tareas === 'roles' && b.tareas === 'roles') tar = hay(a.rol) && hay(b.rol) ? (a.rol === 'ninguno' || b.rol === 'ninguno' ? 0.7 : a.rol !== b.rol ? 1 : 0.3) : 0.7;
    if (tar >= 0.9) n.push(nota(1, 'Imaginan igual la división de la casa'));
    else if (tar < 0.5) n.push(nota(-1, 'Imaginan muy distinta la división de la casa'));
  }
  // Comida: cómo come el otro contra lo que yo acepto; el punto medio siempre cruza
  let comi = null;
  if (hay(a.comida_acepto) && hay(b.comida)) {
    const lb = nivel(ORD.comida, b.comida);
    comi = a.comida_acepto === 'antojo' ? [1, 0.9, 0.75][Math.abs(nivel(ORD.comida, a.comida ?? 'equilibrio') - lb)] : a.comida_acepto === 'equilibrio' ? [1, 1, 0.4][lb] : [1, 0.6, 0.2][lb];
    if (hay(a.comida) && a.comida === b.comida && a.comida !== 'antojo') n.push(nota(1, `Comen parecido: los dos ${a.comida === 'cuido' ? 'se cuidan' : 'van en equilibrio'}`));
    else if (comi <= 0.4) n.push(nota(-1, `Tú ${a.comida_acepto === 'cuido' ? 'quieres a alguien que se cuide' : 'aceptas hasta equilibrado'} y ${el(B)} come lo que se le antoja`, 'La forma de comer les va a pedir acuerdos'));
  }
  let coc = null;
  if (hay(a.cocinar) && hay(b.cocinar)) {
    coc = a.cocinar === 'no' && b.cocinar === 'no' ? 0.7 : 1;
    if (coc < 1) n.push(nota(0, 'Ninguno cocina: van a comer fuera o pedir mucho', 'Ninguno de los dos cocina: conviene hablarlo'));
    else if (a.cocinar === 'me_gusta' && b.cocinar === 'me_gusta') n.push(nota(1, 'A los dos les gusta cocinar'));
  }
  return { s: mezcla([[hab, 0.17], [comi, 0.12], [coc, 0.04], [eje, 0.09], [mas, 0.09], [cro, 0.13], [ord, 0.13], [dom, 0.12], [tar, 0.11]]), notas: n };
}

function dPersonalidad(A, B) {
  const a = A.r, b = B.r, n = [];
  const de = dist(ORD.energia, a.energia, b.energia), dv = dist(ORD.viernes, a.viernes, b.viernes), dpl = dist(ORD.planes, a.planes, b.planes);
  const en = porDist(de, [1, 0.8, 0.35]), vi = porDist(dv, [1, 0.8, 0.35]), pl = porDist(dpl, [1, 0.8, 0.4]);
  const da = hay(a.aventura) && hay(b.aventura) ? Math.abs(a.aventura - b.aventura) : null;
  const av = porDist(da, [1, 0.85, 0.55, 0.25]);
  const ch = comun(a.humor, b.humor);
  const hu = hay(a.humor) && hay(b.humor) ? 0.35 + 0.65 * ch.length / Math.min(arr(a.humor).length, arr(b.humor).length) : null;
  if (ch.length >= 2) n.push(nota(1, 'Se ríen de lo mismo'));
  else if (hu != null && !ch.length) n.push(nota(-1, 'Su humor no se parece: vale la pena probarlo en persona'));
  if (de === 0 && dv === 0) n.push(nota(1, `Recargan energía igual y su viernes ideal es el mismo`));
  else if (de === 2 || dv === 2) n.push(nota(-1, 'Uno recarga con gente y el otro en calma'));
  if (dpl === 2) n.push(nota(-1, 'Uno planifica todo y el otro fluye: fricción diaria'));
  if (da != null && da >= 2) n.push(nota(-1, 'Estabilidad contra aventura: uno necesita mucho más cambio que el otro'));
  else if (da === 0) n.push(nota(1, 'El mismo equilibrio entre rutina y aventura'));
  return { s: mezcla([[en, 0.2], [vi, 0.15], [pl, 0.2], [av, 0.2], [hu, 0.25]]), notas: n };
}

function dCartas(A, B) {
  const pide = arr(A.l?.carta?.pide), promete = arr(B.l?.carta?.promete), n = [];
  if (!pide.length || !promete.length) return { s: null, notas: n };
  const c = comun(pide, promete);
  if (c.length) n.push(nota(1, `Lo que le pides a tu futura pareja (${lista(c)}) es lo que ${el(B)} promete en su carta`, `Lo que pides en tu carta es lo que ${el(B)} promete en la suya`));
  return { s: 0.5 + 0.5 * c.length / pide.length, notas: n };
}

const FUNCIONES = { vision: dVision, familia: dFamilia, valores: dValores, conflicto: dConflicto, afecto: dAfecto, intimidad: dIntimidad, espiritual: dEspiritual, cotidiano: dCotidiano, personalidad: dPersonalidad, cartas: dCartas };

/* ═══════════════════════════════════════════════════════════════════════════
   PASO 2 · PESOS PERSONALES
   Lo sexual pesa más para quien le da importancia y lo declara poco negociable;
   lo espiritual, para quien necesita compartir la fe y la practica seguido.
   Nadie puede "apagar" conflicto ni valores: son lo que la evidencia dice que importa.
   ═══════════════════════════════════════════════════════════════════════════ */
export function multiplicadores(P) {
  const r = P.r, m = Object.fromEntries(DIMENSIONES.map((d) => [d.id, 1])), por = {};
  if (hay(r.intimidad_importancia)) {
    m.intimidad = clamp((0.6 + 0.2 * (r.intimidad_importancia - 1)) * ({ muy: 0.9, algo: 1, poco: 1.2 }[r.frecuencia_negociable] || 1), 0.5, 1.7);
    por.intimidad = `importancia ${r.intimidad_importancia}/5${r.frecuencia_negociable ? `, frecuencia ${r.frecuencia_negociable} negociable` : ''}`;
  }
  if (hay(r.fe_compartir)) {
    const f = { no_importa: 0.55, prefiero: 1, necesito: 1.6 }[r.fe_compartir] * ({ diario: 1.3, semana: 1.15, aveces: 1, casi_nunca: 0.85, nunca: 0.8 }[r.fe_practica] || 1) * (arr(r.practicas).filter((x) => x !== 'ninguna').length >= 3 ? 1.1 : 1);
    m.espiritual = clamp(f, 0.45, 2.2);
    por.espiritual = `${{ no_importa: 'no le importa compartirla', prefiero: 'prefiere compatibilidad', necesito: 'necesita compartirla' }[r.fe_compartir]}, practica ${T.practica[r.fe_practica] || 'sin dato'}`;
  }
  if (['si', 'no', 'tengo_mas'].includes(r.hijos)) { m.familia = 1.25; por.familia = 'certeza sobre hijos'; }
  else if (r.hijos === 'tengo_no') { m.familia = 1.1; por.familia = 'ya tiene hijos'; }
  if (r.ritmo === 'pronto') { m.familia *= 1.1; por.familia = (por.familia ? por.familia + ', ' : '') + 'prisa por formar hogar'; }
  if (r.molesta_desorden === 'mucho') { m.cotidiano = 1.15; por.cotidiano = 'le molesta mucho el desorden'; }
  if (r.cercania === 'todo') { m.afecto = 1.1; por.afecto = 'necesita mucha cercanía'; }
  m.conflicto = Math.max(1, m.conflicto); m.valores = Math.max(1, m.valores);
  return { m, por };
}

export function pesos(P, base = null) {
  const { m, por } = multiplicadores(P);
  const b = base || Object.fromEntries(DIMENSIONES.map((d) => [d.id, d.base]));
  const bruto = Object.fromEntries(DIMENSIONES.map((d) => [d.id, (b[d.id] ?? d.base) * m[d.id]]));
  const total = Object.values(bruto).reduce((s, x) => s + x, 0);
  return { w: Object.fromEntries(Object.entries(bruto).map(([k, v]) => [k, v / total])), m, por };
}

/* ── Calidad Q: qué tan bien se describió la persona (rúbricas de la lectura) ── */
export function calidad(P) {
  const rb = P.l?.rubrica;
  if (!rb) return 0.92; // sin lectura aún: neutro, nunca premia
  const vals = ['autoconocimiento', 'responsabilidad', 'calidez', 'coherencia'].map((k) => rb[k]).filter((x) => Number.isFinite(x));
  if (!vals.length) return 0.92;
  return r3(0.85 + 0.15 * clamp((media(vals) - 4) / 5));
}

/* ═══════════════════════════════════════════════════════════════════════════
   PASOS 3–5 · DIRECCIÓN, RECIPROCIDAD, TECHOS Y CALIDAD
   ═══════════════════════════════════════════════════════════════════════════ */
function direccional(A, B, base) {
  const { w, m } = pesos(A, base);
  const dims = {};
  let lnSum = 0, wSum = 0;
  for (const d of DIMENSIONES) {
    const { s, notas } = FUNCIONES[d.id](A, B);
    dims[d.id] = { s: s == null ? null : r3(s), w: r3(w[d.id]), notas };
    if (s != null) { lnSum += w[d.id] * Math.log(Math.max(0.01, s)); wSum += w[d.id]; }
  }
  // media geométrica ponderada: una dimensión mala no se compensa con otra brillante
  return { S: wSum ? Math.exp(lnSum / wSum) : 0, dims, m };
}

export function cruzar(A, B, { base = null } = {}) {
  const vs = vetos(A, B);
  const ab = direccional(A, B, base), ba = direccional(B, A, base);
  const S = armonica(ab.S, ba.S);
  const techos = [];
  const techo = (valor, id, txt) => techos.push({ valor, id, txt });
  const cA = ab.dims.conflicto.s, cB = ba.dims.conflicto.s;
  if (cA != null && cB != null && Math.min(cA, cB) < 0.5) techo(0.84, 'conflicto', 'Su forma de pelear y reparar es de alto riesgo');
  for (const [X, dir] of [[A, ab], [B, ba]]) {
    if (dir.dims.intimidad.s != null && dir.dims.intimidad.s < 0.55 && dir.m.intimidad >= 1.2) techo(0.86, 'intimidad', `Lo íntimo es muy importante para ${X.nombre} y ahí no embonan`);
    if (dir.dims.espiritual.s != null && dir.dims.espiritual.s < 0.55 && dir.m.espiritual >= 1.5) techo(0.86, 'espiritual', `La fe es central para ${X.nombre} y ahí no embonan`);
    for (const d of DIMENSIONES) if (dir.dims[d.id].s != null && dir.dims[d.id].s < 0.35) techo(0.8, d.id, `${DIM[d.id].nombre} por debajo de 35 % para ${X.nombre}`);
  }
  const tope = techos.length ? Math.min(...techos.map((t) => t.valor)) : 1;
  const qa = calidad(A), qb = calidad(B), q = Math.min(qa, qb);
  const sinVeto = Math.round(100 * Math.min(S, tope) * q);
  const dims = Object.fromEntries(DIMENSIONES.map((d) => {
    const x = ab.dims[d.id].s, y = ba.dims[d.id].s;
    return [d.id, { ab: x, ba: y, par: x == null || y == null ? (x ?? y) : r3(armonica(x, y)) }];
  }));
  return {
    a: A.id, b: B.id, version: MOTOR_VERSION,
    pct: vs.length ? 0 : sinVeto, sinVeto, veto: vs.length > 0, vetos: vs,
    abS: r3(ab.S), baS: r3(ba.S), armonica: r3(S), techos, q: { a: qa, b: qb },
    dims, ab: ab.dims, ba: ba.dims, mA: ab.m, mB: ba.m,
  };
}

/* ── Razones para la persona: sus 3 más fuertes y la que hay que cuidar ─── */
export function razonesPersona(par, visorId) {
  const lado = par.a === visorId ? 'ab' : 'ba';
  const dirs = par[lado];
  const dims = DIMENSIONES.map((d) => ({ id: d.id, nombre: d.nombre, par: par.dims[d.id].par, w: dirs[d.id].w, notas: dirs[d.id].notas.filter((x) => x.persona) }))
    .filter((d) => d.par != null);
  // Fuertes: entre lo que brilla (≥ 90 %), primero lo que más pesa para quien mira
  const conNota = (d, f) => ({ ...d, nota: d.notas.find(f) });
  const brillan = dims.filter((d) => d.par >= 0.9).map((d) => conNota(d, (x) => x.ok === 1)).filter((d) => d.nota).sort((x, y) => y.w - x.w || y.par - x.par);
  const resto = dims.filter((d) => d.par < 0.9).map((d) => conNota(d, (x) => x.ok === 1)).filter((d) => d.nota).sort((x, y) => y.par - x.par);
  const fuertes = [...brillan, ...resto].slice(0, 3).map((d) => ({ dim: d.nombre, pct: Math.round(d.par * 100), txt: d.nota.persona }));
  // A cuidar: la dimensión más baja por debajo de 90 % que tenga algo concreto que decir
  const debil = dims.filter((d) => d.par < 0.9).sort((x, y) => x.par - y.par).map((d) => conNota(d, (x) => x.ok <= 0)).find((d) => d.nota);
  return { fuertes, cuidar: debil ? { dim: debil.nombre, pct: Math.round(debil.par * 100), txt: debil.nota.persona } : null };
}

/* ── Cruce de todo el pool (con candidatos de ida y vuelta) ─────────────── */
export function cruzarTodos(personas, opts = {}) {
  const pares = [];
  for (let i = 0; i < personas.length; i++)
    for (let j = i + 1; j < personas.length; j++)
      if (esCandidato(personas[i], personas[j])) pares.push(cruzar(personas[i], personas[j], opts));
  return pares;
}

/* ═══════════════════════════════════════════════════════════════════════════
   LECTURA DE RESPALDO (sin IA)
   En producción un modelo lee las respuestas abiertas una sola vez por persona
   y deja rúbricas + etiquetas. Si no hay llave de IA, esta lectura heurística
   mantiene el sistema andando: nunca premia, solo evita que el perfil quede ciego.
   ═══════════════════════════════════════════════════════════════════════════ */
const PISTAS_CARTA = {
  presencia: ['presen', 'estar ahí', 'estar ahi', 'acompañ', 'tiempo'], honestidad: ['verdad', 'honest', 'sincer', 'mentir'],
  paciencia: ['pacien', 'esperar'], humor: ['reír', 'reir', 'risa', 'humor'], aventura: ['aventur', 'viaj', 'explor'],
  fe: ['dios', ' fe ', 'orar', 'rezar', 'misa', 'iglesia'], familia: ['familia', 'hijos', 'hogar'], cuidado: ['cuid', 'consent'],
  libertad: ['libertad', 'espacio', 'libre'], crecimiento: ['crecer', 'crecimiento', 'aprender'], lealtad: ['leal', 'fiel'],
  ternura: ['ternura', 'tiern', 'abraz', 'cariño', 'beso'], calma: ['calma', ' paz', 'tranquil'], pasion: ['pasión', 'pasion', 'deseo'],
  respeto: ['respet'], equipo: ['equipo', 'juntos', 'compañer'], orden: ['orden', 'organiz', 'puntual'], alegria: ['alegr', 'feliz', 'celebr'],
};
export function lecturaHeuristica(r = {}) {
  const txt = (k) => String(r[k] || '').trim();
  const largo = (k) => clamp(3 + txt(k).length / 70, 0, 10);
  const conTexto = (ks) => ks.filter((k) => txt(k).length > 0);
  const prom = (ks, f) => { const c = conTexto(ks); return c.length ? media(c.map(f)) : 6; };
  const baja = (s) => s.toLowerCase();
  let auto = prom(['amigos', 'soltero', 'cambie', 'aprendi'], largo);
  if (/no he encontrado|no ha llegado|no se ha dado/.test(baja(txt('soltero')))) auto -= 2;
  const RESP = /(me equivoqu|mi parte|reconozc|deb[ií]|aprend[ií]|ped[ií] perd[oó]n|fui yo|mi culpa)/g;
  const CULPA = /(por su culpa|me engañ|t[oó]xic|nunca me|siempre me|ella siempre|[ée]l siempre|loca|loco)/g;
  const resTxt = baja(['discusion_hice', 'aprendi', 'desajuste'].map(txt).join(' '));
  let resp = prom(['discusion_hice', 'aprendi', 'desajuste'], largo) + 1.2 * (resTxt.match(RESP) || []).length - 1.5 * (resTxt.match(CULPA) || []).length;
  const cal = prom(['cuidado_texto', 'malinterpretan', 'carta'], largo) + ((baja(txt('cuidado_texto')).match(/acompañ|cuid|abraz|escuch|estuve/g) || []).length ? 1 : 0);
  let coh = 7;
  if (r.energia === 'solo' && arr(r.domingo_tipo).includes('fiesta')) coh -= 1.5;
  if (r.fe === 'atea' && arr(r.practicas).some((x) => x === 'oracion' || x === 'culto')) coh -= 1.5;
  if (arr(r.ejes).includes('fe') && r.fe_practica === 'nunca') coh -= 1;
  const carta = baja(' ' + txt('carta') + ' ');
  const corte = carta.search(/te pido|le pido|necesito que|quiero que/);
  const [pro, pid] = corte > 0 ? [carta.slice(0, corte), carta.slice(corte)] : [carta, carta];
  const tags = (s) => Object.entries(PISTAS_CARTA).filter(([, ps]) => ps.some((p) => s.includes(p))).map(([t]) => t).slice(0, 4);
  const R = (x) => Math.round(clamp(x, 0, 10));
  return { fuente: 'heuristica', rubrica: { autoconocimiento: R(auto), responsabilidad: R(resp), calidez: R(cal), coherencia: R(coh) }, carta: { promete: tags(pro), pide: tags(pid) } };
}
// fin del motor · RLR · Ricardo López Reyero
