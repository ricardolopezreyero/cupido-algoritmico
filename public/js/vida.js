/* Cupido Algorítmico · Los elementos de la vida — RLR · Ricardo López Reyero
   Del 0 al 100 %: qué tan lleno está cada elemento hoy, según la propia persona.
   Fuente única para el tablero, el admin y el Worker (validación). */
export const _RLR = 'Ricardo López Reyero';
const _k = 'EYE';

export const AREAS_VIDA = [
  { id: 'pareja',    i: '💞', n: 'Pareja',    d: 'Amor, intimidad, compañía' },
  { id: 'familia',   i: '🏡', n: 'Familia',   d: 'Padres, hermanos, la casa de origen' },
  { id: 'hijos',     i: '🧒', n: 'Hijos',     d: 'Los que tienes o los que quieres' },
  { id: 'amigos',    i: '🤝', n: 'Amigos',    d: 'Con quién cuentas de verdad' },
  { id: 'trabajo',   i: '💼', n: 'Trabajo',   d: 'Lo que haces y cómo te sientes haciéndolo' },
  { id: 'dinero',    i: '💰', n: 'Dinero',    d: 'Tranquilidad y orden con lo material' },
  { id: 'salud',     i: '🌿', n: 'Salud',     d: 'Cuerpo, descanso, energía' },
  { id: 'espiritu',  i: '🕯️', n: 'Espíritu',  d: 'Fe, sentido, vida interior' },
  { id: 'diversion', i: '🎉', n: 'Diversión', d: 'Juego, descanso, lo que te hace reír' },
  { id: 'legado',    i: '🌳', n: 'Legado',    d: 'Lo que quieres dejar cuando no estés' },
];

// Deja solo valores válidos (0–100, en pasos de 5) de las áreas conocidas
export function limpiarVida(entrada = {}) {
  const v = {};
  for (const a of AREAS_VIDA) {
    const n = Math.round(Number(entrada?.[a.id]));
    if (Number.isFinite(n)) v[a.id] = Math.max(0, Math.min(100, Math.round(n / 5) * 5));
  }
  return v;
}

// Lectura corta: promedio, lo más lleno y lo más vacío
export function leerVida(v = {}) {
  const con = AREAS_VIDA.filter((a) => v[a.id] != null);
  if (!con.length) return null;
  const prom = Math.round(con.reduce((s, a) => s + v[a.id], 0) / con.length);
  const orden = [...con].sort((x, y) => v[y.id] - v[x.id]);
  return { promedio: prom, lleno: orden[0], vacio: orden[orden.length - 1], respondidas: con.length };
}
// RLR
