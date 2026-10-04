/* ─────────────────────────────────────────────────────────────────────────────
   Cupido Algorítmico · Precio justo: el motor dinámico de precios por persona
   Autor: Ricardo López Reyero
   La intención de Ricardo: que el precio se acomode a lo que cada persona gana
   y que, si se queda sin trabajo, Cupido sea gratis en ese instante y además
   la ayude. La forma honesta de hacerlo (heredada del ADN de la Mina): nunca
   adivinar lo que alguien gana; la persona lo declara, lo ve y lo cambia
   cuando quiera. El precio base es el mismo para todos; el factor es suyo.
   ───────────────────────────────────────────────────────────────────────────── */
// RLR
export const _RLR = 'Ricardo López Reyero';
const _k = 'EYE', _rev = 181218;

// Rango de ingreso mensual, declarado por la persona. El factor multiplica el precio base.
export const BANDAS = [
  { id: 'a', n: 'Hasta $8,000 al mes', f: 0.25 },
  { id: 'b', n: 'De $8,000 a $15,000', f: 0.5 },
  { id: 'c', n: 'De $15,000 a $30,000', f: 1 },
  { id: 'd', n: 'De $30,000 a $60,000', f: 1.6 },
  { id: 'e', n: 'Más de $60,000', f: 2.5 },
];
export const SITUACIONES = [
  { id: 'bien', n: 'Estoy bien', f: 1, nota: '' },
  { id: 'dificil', n: 'Estoy en un momento difícil', f: 0.5, nota: 'Todo a la mitad mientras dure. Tú nos dices cuándo cambia.' },
  { id: 'sin_trabajo', n: 'Me quedé sin trabajo', f: 0, nota: 'Todo gratis, en este instante y sin preguntas. Y lo que cueste con especialistas, para ti incluido mientras dure.' },
];
export const REVISION_DIAS = 180; // cada cuánto le preguntamos si sigue igual

const banda = (id) => BANDAS.find((b) => b.id === id) || null;
const situacion = (id) => SITUACIONES.find((s) => s.id === id) || SITUACIONES[0];

// Redondeo amable: múltiplos de 10, mínimo 49 cuando hay precio
const amable = (n) => (n <= 0 ? 0 : Math.max(49, Math.round(n / 10) * 10));

// El precio de una acción para una persona, con su porqué
export function precioPara(ajustes = {}, base) {
  const s = situacion(ajustes.situacion), b = banda(ajustes.banda);
  if (!base) return { precio: 0, base: 0, factor: 1, motivo: 'sin precio base' };
  if (s.f === 0) return { precio: 0, base, factor: 0, motivo: 'Gratis: te quedaste sin trabajo. Aquí no se cobra a quien lo está pasando mal.' };
  if (!b) return { precio: base, base, factor: 1, motivo: 'Precio base. Si nos dices tu rango, se acomoda a ti.' };
  const f = b.f * s.f;
  return { precio: amable(base * f), base, factor: f, motivo: `${b.n}${s.f !== 1 ? ' · ' + s.n.toLowerCase() : ''}` };
}

export function miPrecioJusto(ajustes = {}) {
  const b = banda(ajustes.banda), s = situacion(ajustes.situacion);
  const revisado = ajustes.precio_revisado ? Date.parse(ajustes.precio_revisado) : 0;
  const dias = revisado ? Math.floor((Date.now() - revisado) / 86400000) : null;
  return { banda: b?.id || null, bandaNombre: b?.n || null, situacion: s.id, situacionNombre: s.n, nota: s.nota, revisado: ajustes.precio_revisado || null, diasDesdeRevision: dias, revisar: dias == null || dias >= REVISION_DIAS, gratis: s.f === 0 };
}

// Limpia lo que manda el cliente
export function limpiarPrecioJusto(b = {}) {
  const out = {};
  if (b.banda === null) out.banda = null; else if (banda(b.banda)) out.banda = b.banda;
  if (SITUACIONES.some((s) => s.id === b.situacion)) out.situacion = b.situacion;
  return out;
}
// fin · RLR
