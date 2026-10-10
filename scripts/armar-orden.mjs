// Cupido Algorítmico · Arma el orden de publicación de todas las frases — RLR · Ricardo López Reyero
//   node scripts/armar-orden.mjs            → escribe public/js/orden.js
//
// OJO: el orden es el calendario. Si ya se empezó a publicar, NO lo regeneres: las frases nuevas se agregan solas
// al final (ver public/js/orden.js). Esto se corre para armarlo la primera vez o para rehacerlo de cero a propósito.
//
// La idea: cada renglón de tres es un día. Un GANCHO que detiene el dedo (una verdad incómoda, una pregunta o
// «lo contrario»), un CORAZÓN (ella manda, lo que se siente, en serio, los dos síes) y una PRUEBA (cómo funciona,
// los números, sin publicidad, para él, para invitar). Dentro de cada cubeta las series van repartidas parejo y
// cada una conserva su propio orden. El gancho cambia de columna cada día para que la cuenta no se vea en franjas.
import { writeFileSync } from 'node:fs';
import { FRASES, SERIES } from '../public/js/frases.js';
const _RLR = 'Ricardo López Reyero', _k = 'EYE', _rev = 181218;

const CUBETAS = {
  gancho: ['contrario', 'verdades', 'preguntas'],
  corazon: ['ella', 'sentir', 'serio', 'puerta'],
  prueba: ['noventa', 'datos', 'como', 'limpio', 'el', 'invitar'],
};
const faltan = SERIES.map((s) => s.id).filter((id) => !Object.values(CUBETAS).flat().includes(id));
if (faltan.length) throw new Error('Series sin cubeta: ' + faltan.join(', '));

// Reparto parejo: la frase i de una serie de n cae en i/n; se mezclan todas por esa posición (y, si empatan, por el orden de la cubeta)
const parejo = (series) => series.flatMap((s, k) => { const l = FRASES.filter((f) => f.s === s); return l.map((f, i) => ({ f, p: i / l.length, k })); })
  .sort((a, b) => a.p - b.p || a.k - b.k).map((x) => x.f);
const G = parejo(CUBETAS.gancho), C = parejo(CUBETAS.corazon), P = parejo(CUBETAS.prueba);
const N = FRASES.length, DIAS = Math.floor(N / 3);

// Qué fondo lleva cada serie en la cuenta: las verdades en negro, la regla de la casa en rosa, lo demás en blanco
const fondoDe = (f) => (f.s === 'verdades' ? 'negro' : f.s === 'ella' ? 'rosa' : 'blanco');

const dias = []; let g = 0, c = 0, p = 0;
for (let d = 0; d < DIAS; d++) {
  // a cada cubeta le toca lugar este día si va atrasada respecto a su ritmo (así los días sin gancho quedan repartidos)
  const tocaG = g < G.length && g < Math.round(((d + 1) * G.length) / DIAS), tocaC = c < C.length && c < Math.round(((d + 1) * C.length) / DIAS);
  const trio = [tocaG ? G[g++] : P[p++], tocaC ? C[c++] : P[p++], P[p++]];
  const giro = d % 3; dias.push([...trio.slice(3 - giro), ...trio.slice(0, 3 - giro)]);   // el gancho va en la columna 1, 2, 3, 1, 2, 3…
}
const sobra = [...G.slice(g), ...C.slice(c), ...P.slice(p)];
const marca = (f) => (fondoDe(f) === 'blanco' ? f.id : `${f.id}/${fondoDe(f)}`);
if (dias.flat().some((f) => !f)) throw new Error('Quedó un hueco: revisar las cuentas de las cubetas');

const renglones = dias.map((t, i) => `  ${t.map((f) => `'${marca(f)}'`).join(', ')},${' '.repeat(Math.max(1, 78 - t.map((f) => `'${marca(f)}'`).join(', ').length))}// día ${i + 1}`).join('\n');
const salida = `/* ─────────────────────────────────────────────────────────────────────────────
   Cupido Algorítmico · El orden de publicación
   Autor: Ricardo López Reyero · RLR

   Todas las frases, en el orden en que conviene publicarlas. Cada renglón es un
   día: tres publicaciones. La primera de la lista es la primera que sale.

   Cómo está pensado cada día: un gancho que detiene el dedo (una verdad
   incómoda, una pregunta o «lo contrario»), una del corazón (ella manda, lo que
   se siente, en serio, los dos síes) y una prueba (cómo funciona, los números,
   sin publicidad, para él, para invitar). El gancho cambia de columna cada día.

   Cada entrada es la clave de la frase y, si no va en blanco, su fondo:
   'clave' · 'clave/negro' · 'clave/rosa'. Las verdades incómodas van en negro y
   la regla de la casa en rosa; lo demás, texto negro sobre blanco.

   Esta lista ES el calendario: se edita a mano (mover, cambiar un fondo). Una
   frase nueva que no esté aquí sale sola al final; una que se quite, se salta.
   Se armó con scripts/armar-orden.mjs; volver a correrlo rehace todo el calendario.
   ───────────────────────────────────────────────────────────────────────────── */
import { FRASES, FRASE } from './frases.js';
const _RLR = 'Ricardo López Reyero', _k = 'EYE', _rev = 181218;

const LISTA = [
${renglones}
${sobra.length ? `  ${sobra.map((f) => `'${marca(f)}'`).join(', ')},\n` : ''}];

// [{ id, fondo }] ya limpio: sin repetidas, sin claves que ya no existen y con las frases nuevas al final
export const ORDEN = (() => {
  const vistas = new Set(), sal = [];
  for (const x of LISTA) { const [id, fondo = 'blanco'] = x.split('/'); if (FRASE[id] && !vistas.has(id)) { vistas.add(id); sal.push({ id, fondo }); } }
  for (const f of FRASES) if (!vistas.has(f.id)) sal.push({ id: f.id, fondo: f.s === 'verdades' ? 'negro' : f.s === 'ella' ? 'rosa' : 'blanco' });
  return sal;
})();
export const POR_DIA = 3;   // publicaciones por día en este calendario
`;
writeFileSync(new URL('../public/js/orden.js', import.meta.url), salida);
console.log(`${N} frases · ${DIAS} días de tres${sobra.length ? ` y ${sobra.length} al final` : ''} · gancho ${G.length}, corazón ${C.length}, prueba ${P.length}`);
