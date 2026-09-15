// Cupido Algorítmico · pruebas del motor v2 — RLR · Ricardo López Reyero
// Uso: node scripts/pruebas-motor.mjs   (sale con código 1 si algo se rompe)
import assert from 'node:assert/strict';
import { cruzar, vetos, esCandidato, pesos, calidad, cruzarTodos, lecturaHeuristica, UMBRAL } from '../public/js/motor.js';
import { ESQUELETOS } from '../seed/esqueletos.js';
import { PARTES, avance } from '../public/js/preguntas.js';

const P = Object.fromEntries(ESQUELETOS.map((p) => [p.id, p]));
const clon = (p, cambios = {}, id = p.id + 'x') => ({ ...p, id, r: { ...p.r, ...cambios }, l: p.l && JSON.parse(JSON.stringify(p.l)) });
let ok = 0;
const prueba = (nombre, fn) => { try { fn(); ok++; console.log('✓', nombre); } catch (e) { console.error('✗', nombre, '\n ', e.message); process.exitCode = 1; } };

prueba('cada respuesta estructurada del demo usa un código válido', () => {
  const validos = Object.fromEntries(PARTES.filter((p) => p.o).map((p) => [p.id, new Set(p.o.map((o) => o[0]))]));
  for (const p of ESQUELETOS) for (const [k, v] of Object.entries(p.r)) {
    if (!validos[k]) continue;
    for (const x of Array.isArray(v) ? v : [v]) assert.ok(validos[k].has(x), `${p.id}.${k} = ${x}`);
  }
});

prueba('los 20 perfiles del demo están completos para entrar al matching (con carta cuando hay textos)', () => {
  for (const p of ESQUELETOS) assert.equal(avance(p.r).estructuradas, avance(p.r).estructuradasTotal, p.id);
});

prueba('quién busca a quién se exige en las dos direcciones', () => {
  assert.ok(esCandidato(P.h01, P.m01));
  assert.ok(!esCandidato(P.h01, P.h02));
  assert.ok(!esCandidato(P.h01, clon(P.m01, { busca: ['mujer'] })));
});

prueba('innegociable íntimo: "lo necesito" contra "no lo acepto" elimina el par', () => {
  const v = vetos(P.m01, P.h07); // Mariana necesita esperar; Luis no lo acepta
  assert.ok(v.some((x) => x.id === 'sexual'));
  assert.equal(cruzar(P.h07, P.m01).pct, 0);
});

prueba('un dato que falta nunca veta', () => {
  const sinDato = clon(P.h07, { sx_esperar: null });
  assert.ok(!vetos(P.m01, sinDato).some((x) => x.id === 'sexual'));
  const sinPostura = clon(P.h01, { postura: 'reservada', politica: 'innegociable' });
  assert.ok(!vetos(sinPostura, P.m02).some((x) => x.id === 'politica'));
});

prueba('fe innegociable exige misma tradición y práctica parecida', () => {
  assert.ok(vetos(P.m01, P.h08).some((x) => x.id === 'fe')); // católica vs cristiano
  const casiNunca = clon(P.h01, { fe_practica: 'nunca' });
  assert.ok(vetos(P.m01, casiNunca).some((x) => x.id === 'fe_practica'));
});

prueba('hijos: certezas opuestas nunca se cruzan', () => {
  assert.ok(vetos(clon(P.m01, { hijos: 'si' }), clon(P.h05, { hijos: 'no' })).some((x) => x.id === 'hijos'));
});

prueba('los vetos son simétricos (A,B) = (B,A)', () => {
  for (const [a, b] of [['h01', 'm01'], ['h07', 'm01'], ['h04', 'm03'], ['h10', 'm07']])
    assert.equal(cruzar(P[a], P[b]).pct, cruzar(P[b], P[a]).pct, `${a}-${b}`);
});

prueba('reciprocidad: la armónica nunca supera al promedio y castiga lo unilateral', () => {
  for (const par of cruzarTodos(ESQUELETOS)) assert.ok(par.armonica <= (par.abS + par.baS) / 2 + 0.001); // tolerancia por redondeo a 3 decimales
});

prueba('techo de conflicto: perseguir-huir con reparación incompatible no pasa de 84', () => {
  const A = clon(P.h01, { conflicto: 'caliente', repara_necesito: 'hablar', repara_ofrezco: ['hablar'] });
  const B = clon(P.m01, { conflicto: 'evito', repara_necesito: 'espacio', repara_ofrezco: ['espacio'] });
  B.l.rubrica.responsabilidad = 2; A.l.rubrica.responsabilidad = 2;
  const par = cruzar(A, B);
  assert.ok(par.techos.some((t) => t.id === 'conflicto'), 'debió aplicar techo');
  assert.ok(par.sinVeto <= 84);
});

prueba('pesos personales: lo íntimo pesa más para quien es esencial y poco negociable', () => {
  const alto = pesos(clon(P.m01, { intimidad_importancia: 5, frecuencia_negociable: 'poco' })).w.intimidad;
  const bajo = pesos(clon(P.m01, { intimidad_importancia: 1, frecuencia_negociable: 'muy' })).w.intimidad;
  assert.ok(alto > bajo * 2, `${alto} vs ${bajo}`);
});

prueba('pesos personales: la fe pesa más para quien necesita compartirla y la practica', () => {
  const alto = pesos(clon(P.m01, { fe_compartir: 'necesito', fe_practica: 'diario' })).w.espiritual;
  const bajo = pesos(clon(P.m01, { fe_compartir: 'no_importa', fe_practica: 'nunca' })).w.espiritual;
  assert.ok(alto > bajo * 3, `${alto} vs ${bajo}`);
});

prueba('conflicto y valores nunca bajan de su peso base relativo', () => {
  for (const p of ESQUELETOS) { const { m } = pesos(p); assert.ok(m.conflicto >= 1 && m.valores >= 1, p.id); }
});

prueba('calidad Q vive entre 0.85 y 1', () => {
  for (const p of ESQUELETOS) { const q = calidad(p); assert.ok(q >= 0.85 && q <= 1, `${p.id} ${q}`); }
});

prueba('la persona nunca recibe notas íntimas con detalle del otro', () => {
  for (const par of cruzarTodos(ESQUELETOS).filter((x) => x.pct >= UMBRAL))
    for (const lado of ['ab', 'ba']) for (const n of par[lado].intimidad.notas)
      if (n.persona) assert.ok(!/veces por semana|\/5|al mes/.test(n.persona), n.persona);
});

prueba('el demo conserva su forma: coincidencias arriba del umbral y personas en silencio', () => {
  const pares = cruzarTodos(ESQUELETOS);
  const arriba = pares.filter((p) => p.pct >= UMBRAL).length;
  assert.ok(arriba >= 6 && arriba <= 14, `arriba ${arriba}`);
  const silencio = ESQUELETOS.filter((p) => !pares.some((q) => (q.a === p.id || q.b === p.id) && q.pct >= UMBRAL));
  assert.ok(silencio.length >= 2, 'debe haber gente en silencio para mostrar ese estado');
});

prueba('lectura heurística: nunca rompe y culpar al ex baja responsabilidad', () => {
  const buena = lecturaHeuristica({ discusion_hice: 'Reconozco que me equivoqué y pedí perdón primero. Aprendí a hablarlo pronto.', aprendi: 'Mi parte fue callarme.' });
  const mala = lecturaHeuristica({ discusion_hice: 'Por su culpa, ella siempre me hacía enojar. Era tóxica.', aprendi: 'Nunca me entendió.' });
  assert.ok(buena.rubrica.responsabilidad > mala.rubrica.responsabilidad);
  assert.ok(lecturaHeuristica({}).rubrica);
});

console.log(`\n${ok} pruebas pasaron${process.exitCode ? ' — HAY FALLAS' : ''}`);
// RLR
