// Cupido Algorítmico · prueba local del motor sobre las 20 personas del demo
// Uso: node scripts/probar-motor.mjs [idA idB]   — RLR
import { cruzarTodos, cruzar, razonesPersona, pesos, calidad, DIMENSIONES, UMBRAL } from '../public/js/motor.js';
import { ESQUELETOS } from '../seed/esqueletos.js';

const P = Object.fromEntries(ESQUELETOS.map((p) => [p.id, p]));
const [x, y] = process.argv.slice(2);

if (x && y) {
  const par = cruzar(P[x], P[y]);
  console.log(`${P[x].nombre} × ${P[y].nombre}: ${par.pct}% (sin veto ${par.sinVeto}%) · A→B ${par.abS} · B→A ${par.baS} · armónica ${par.armonica} · Q ${par.q.a}/${par.q.b}`);
  if (par.vetos.length) console.log('VETOS:', par.vetos.map((v) => v.txt));
  if (par.techos.length) console.log('TECHOS:', par.techos);
  for (const d of DIMENSIONES) console.log(`  ${d.nombre.padEnd(24)} A→B ${String(par.ab[d.id].s).padEnd(6)} (w ${par.ab[d.id].w})  B→A ${String(par.ba[d.id].s).padEnd(6)} (w ${par.ba[d.id].w})`);
  console.log('Notas A:', par.ab && Object.values(par.ab).flatMap((d) => d.notas.map((n) => `${n.ok > 0 ? '✓' : n.ok < 0 ? '✗' : '~'} ${n.txt}`)));
  console.log('Persona A:', razonesPersona(par, x));
  console.log('Persona B:', razonesPersona(par, y));
  process.exit(0);
}

const pares = cruzarTodos(ESQUELETOS);
const hombres = ESQUELETOS.filter((p) => p.r.genero === 'hombre'), mujeres = ESQUELETOS.filter((p) => p.r.genero === 'mujer');
const get = (a, b) => pares.find((p) => (p.a === a && p.b === b) || (p.a === b && p.b === a));
console.log('Matriz (filas hombres × columnas mujeres) — ⛔ = veto (entre paréntesis lo que habría sido)');
console.log('      ' + mujeres.map((m) => m.id.padStart(8)).join(''));
for (const h of hombres) {
  console.log(h.id.padEnd(6) + mujeres.map((m) => {
    const p = get(h.id, m.id);
    return (p.veto ? `⛔(${p.sinVeto})` : String(p.pct) + (p.pct >= UMBRAL ? '★' : '')).padStart(8);
  }).join(''));
}
const fuertes = pares.filter((p) => p.pct >= UMBRAL).sort((a, b) => b.pct - a.pct);
console.log(`\nPares evaluados ${pares.length} · vetados ${pares.filter((p) => p.veto).length} · arriba de ${UMBRAL}: ${fuertes.length}`);
for (const f of fuertes) console.log(`  ${f.pct}%  ${P[f.a].nombre} × ${P[f.b].nombre}${f.techos.length ? '  techos: ' + f.techos.map((t) => t.id).join(',') : ''}`);
console.log('\nPor persona (≥90):');
for (const p of ESQUELETOS) {
  const mis = pares.filter((q) => (q.a === p.id || q.b === p.id)).sort((a, b) => b.pct - a.pct);
  const top = mis.filter((q) => q.pct >= UMBRAL).map((q) => q.pct);
  const cerca = mis.find((q) => q.pct < UMBRAL && !q.veto);
  const w = pesos(p).w;
  console.log(`  ${p.id} ${p.nombre.padEnd(18)} Q ${calidad(p)}  ≥90: [${top.join(', ')}]  más cerca bajo 90: ${cerca?.pct ?? '-'}  · peso sexual ${(100 * w.intimidad).toFixed(0)}% espiritual ${(100 * w.espiritual).toFixed(0)}%`);
}
const vet = pares.filter((p) => p.veto).sort((a, b) => b.sinVeto - a.sinVeto).slice(0, 8);
console.log('\nVetos más dolorosos:');
for (const v of vet) console.log(`  habría sido ${v.sinVeto}%  ${P[v.a].nombre} × ${P[v.b].nombre}: ${v.vetos.map((z) => z.txt).join(' | ')}`);
