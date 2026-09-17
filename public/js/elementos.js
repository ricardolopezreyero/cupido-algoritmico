/* Cupido Algorítmico · Los elementos del perfil que se liberan a la otra persona — RLR · Ricardo López Reyero
   Cuando la puerta se abre, nadie ve nada más que la carta. Cada persona libera
   sus respuestas por elementos, con confirmación. Seis son suaves (se proponen
   de entrada); cuatro son los más sensibles para la mayoría (fe e hijos, dinero
   y política, conflicto, intimidad) y se liberan después, uno por uno. */
export const _RLR = 'Ricardo López Reyero';
const _k = 'EYE';

export const ELEMENTOS = [
  { id: 'quien',        i: '🧭', n: 'Quién soy y qué busco',        q: [1, 2, 5],               suave: true },
  { id: 'vision',       i: '🌅', n: 'Visión de vida',               q: [6, 7, 8, 9],            suave: true },
  { id: 'personalidad', i: '⚡', n: 'Personalidad y energía',       q: [14, 15, 16, 17, 18],    suave: true },
  { id: 'afecto',       i: '🤍', n: 'Afecto',                       q: [23, 24, 26],            suave: true },
  { id: 'cotidiano',    i: '🏠', n: 'Vida cotidiana',               q: [27, 28, 29, 30],        suave: true },
  { id: 'profundidad',  i: '🪞', n: 'Profundidad y verdad',         q: [31, 32, 33],            suave: true },
  { id: 'valores',      i: '⚖️', n: 'Valores, dinero y política',   q: [10, 11, 12, 13],        suave: false },
  { id: 'conflicto',    i: '🔥', n: 'Conflicto y reparación',       q: [19, 20, 21, 22],        suave: false },
  { id: 'fe',           i: '🕯️', n: 'Fe, hijos y vida interior',    q: [3, 4, 41, 42, 43],      suave: false },
  { id: 'intimidad',    i: '🔐', n: 'Intimidad sexual',             q: [25, 34, 35, 36, 37, 38, 39, 40], suave: false },
];
export const ELEMENTO = Object.fromEntries(ELEMENTOS.map((e) => [e.id, e]));
export const SUAVES = ELEMENTOS.filter((e) => e.suave).map((e) => e.id);
export const SENSIBLES = ELEMENTOS.filter((e) => !e.suave).map((e) => e.id);
// RLR
