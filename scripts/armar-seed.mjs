// Cupido Algorítmico · une esqueletos + textos en seed/personas.json — RLR · Ricardo López Reyero
import { readFileSync, writeFileSync, existsSync } from 'node:fs';
import { ESQUELETOS } from '../seed/esqueletos.js';

const faltan = [];
const personas = ESQUELETOS.map((p) => {
  const f = new URL(`../seed/textos/${p.id}.json`, import.meta.url);
  if (!existsSync(f)) { faltan.push(p.id); return p; }
  const { textos } = JSON.parse(readFileSync(f, 'utf8'));
  return { ...p, r: { ...p.r, ...textos } };
});
writeFileSync(new URL('../seed/personas.json', import.meta.url), JSON.stringify(personas, null, 1));
if (!existsSync(new URL('../seed/articulos.json', import.meta.url))) writeFileSync(new URL('../seed/articulos.json', import.meta.url), '[]');
console.log(`seed/personas.json · ${personas.length} personas${faltan.length ? ` · sin textos: ${faltan.join(', ')}` : ' · todas con textos'}`);
