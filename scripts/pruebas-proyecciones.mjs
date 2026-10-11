// Cupido Algorítmico · RLR · Ricardo López Reyero
// Pruebas de las proyecciones (/gtm → Proyecciones): que la cuenta de 18 años
// salga de la misma escalera que las Tareas y que los números cuadren entre sí.
//   node scripts/pruebas-proyecciones.mjs
import assert from 'node:assert/strict';
import { CONTROLES, POR_USUARIO } from '../src/gtm-tareas.js';
import { MODELO, proyectar, proyecciones } from '../src/gtm-proyecciones.js';

let n = 0;
const prueba = (nombre, f) => { f(); n++; console.log('✓ ' + nombre); };
const P = proyecciones(), de = (id) => P.escenarios.find((e) => e.id === id), plan = de('plan');
const fila = (e, anio) => e.filas.find((f) => f.anio === anio);

prueba('son 18 años después del arranque: de 2026 a 2044, una fila por año', () => {
  assert.equal(P.anios, 18);
  for (const e of P.escenarios) assert.deepEqual(e.filas.map((f) => f.anio), Array.from({ length: 19 }, (_, i) => 2026 + i));
});

prueba('«El plan» pasa por cada punto de control de diciembre: mismos usuarios y mismo ingreso al mes', () => {
  const dic = CONTROLES.filter((c) => c[3].endsWith('-12-31'));
  assert.ok(dic.length >= 5);
  for (const c of dic) { const f = fila(plan, Number(c[3].slice(0, 4))); assert.equal(f.usuarios, c[4], c[3]); assert.equal(f.ingresoMes, c[5], c[3]); }
});

prueba('mientras todo es gratis entran 2 pesos por usuario; desde que cobra el programa, lo que dice POR_USUARIO', () => {
  assert.equal(fila(plan, 2027).porUsuario, POR_USUARIO.voluntario);
  assert.equal(fila(plan, 2028).porUsuario, POR_USUARIO.programa);
  assert.equal(fila(de('prudente'), 2028).porUsuario, POR_USUARIO.voluntario, 'en el prudente el cobro se recorre un año');
});

prueba('en cada fila: lo que queda es ingreso menos gastos, los gastos son la suma de sus renglones y el acumulado se arrastra', () => {
  for (const e of P.escenarios) {
    let acumulado = 0;
    for (const f of e.filas) {
      assert.ok(Math.abs(f.queda - (f.ingreso - f.gastos)) <= 1, `${e.id} ${f.anio}: queda`);
      assert.ok(Math.abs(f.gastos - Object.values(f.partes).reduce((s, x) => s + x, 0)) <= 6, `${e.id} ${f.anio}: partes`);
      acumulado += f.queda; assert.ok(Math.abs(f.acumulado - acumulado) <= 20, `${e.id} ${f.anio}: acumulado`);
    }
  }
});

prueba('el arranque de 2026 gasta lo que dice el plan: $105,000 de tope en 90 días, más quien ejecuta', () => {
  const p = fila(plan, 2026).partes;
  assert.equal(p.crecer, 105000);
  assert.equal(p.equipo, 3 * MODELO.renglones.find((r) => r[0] === 'equipo')[3]);
});

prueba('desde que se cobra, de cada 100 pesos se gastan 70 y quedan 30', () => {
  const partes = MODELO.renglones.reduce((s, r) => s + r[2], 0) + MODELO.cobro;
  assert.ok(Math.abs(partes - 0.7) < 1e-9);
  for (const a of [2030, 2036, 2044]) { const f = fila(plan, a); assert.ok(Math.abs(f.queda / f.ingreso - 0.3) < 0.005, String(a)); }
});

prueba('antes de cobrar se pierde dinero, y «hacen falta» es lo más hondo del acumulado', () => {
  for (const e of P.escenarios) {
    assert.ok(fila(e, 2026).queda < 0 && fila(e, 2027).queda < 0, e.id);
    assert.ok(e.hacenFalta > 0);
    assert.ok(e.hacenFalta >= -Math.min(...e.filas.map((f) => f.acumulado)) - 1, e.id);
    assert.equal(e.primerAnioBueno, e.cobra, `${e.id}: el primer año con ganancia es el año en que empieza el cobro`);
  }
  assert.ok(de('prudente').hacenFalta > plan.hacenFalta, 'recorrer el cobro un año pide más dinero');
});

prueba('los usuarios nunca bajan, nunca pasan del techo y cada año crecen menos después de 2030', () => {
  for (const e of P.escenarios) {
    for (let i = 1; i < e.filas.length; i++) assert.ok(e.filas[i].usuarios >= e.filas[i - 1].usuarios, `${e.id} ${e.filas[i].anio}`);
    assert.ok(e.filas.at(-1).usuarios <= e.techo);
    const crece = e.filas.filter((f) => f.anio >= 2030).map((f, i, l) => (i ? f.usuarios / l[i - 1].usuarios : 0)).slice(1);
    for (let i = 1; i < crece.length; i++) assert.ok(crece[i] <= crece[i - 1] + 1e-6, `${e.id}: el crecimiento afloja`);
  }
});

prueba('prudente < el plan < ambicioso, en usuarios y en ingreso, todos los años', () => {
  const [a, b, c] = ['prudente', 'plan', 'ambicioso'].map(de);
  for (let i = 0; i < b.filas.length; i++) {
    assert.ok(a.filas[i].usuarios < b.filas[i].usuarios && b.filas[i].usuarios < c.filas[i].usuarios);
    assert.ok(a.filas[i].ingreso < b.filas[i].ingreso && b.filas[i].ingreso < c.filas[i].ingreso);
  }
});

prueba('un escenario sin cobro nunca deja de perder: la cuenta no inventa ganancia', () => {
  const e = proyectar({ id: 'x', nombre: 'x', nota: '', escalera: 1, cobra: 9999, porUsuario: 40, techo: 30e6 });
  assert.equal(e.primerAnioBueno, null);
  assert.ok(e.filas.every((f) => f.porUsuario === POR_USUARIO.voluntario));
});

console.log(`${n} pruebas de las proyecciones pasaron.`);
