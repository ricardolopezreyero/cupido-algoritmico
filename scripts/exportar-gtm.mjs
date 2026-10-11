// Cupido Algorítmico · RLR · Ricardo López Reyero
// Sacar todo el go-to-market a un solo archivo Markdown: Estrategia, Tareas,
// El CEO (el perfil, cómo elegir y las pruebas recibidas), Candidatas y
// Proyecciones. Lee lo mismo que pinta /gtm, así que no se desfasa.
//
//   node scripts/exportar-gtm.mjs                      → a ~/Downloads, con lo que hay en el código
//   node scripts/exportar-gtm.mjs --remote             → además lee de producción las palomitas, el estado y las
//                                                        notas de cada ficha y las pruebas recibidas
//   node scripts/exportar-gtm.mjs --remote ruta/archivo.md
//
// OJO: el archivo que sale trae nombres y fichas de personas (vienen de
// privado/candidatas-ceo.json y de la base). No va al repositorio, que es público.
import { readFileSync, writeFileSync, existsSync } from 'node:fs';
import { homedir } from 'node:os';
import { join, dirname } from 'node:path';
import { fileURLToPath } from 'node:url';
import { spawnSync } from 'node:child_process';
import { PLAN } from '../src/gtm-plan.js';
import { TAREAS, FASES, AREAS, QUIENES, ESFUERZOS, RITMOS, PASOS, CONTROLES, SUPUESTOS_CONTROL } from '../src/gtm-tareas.js';
import { proyecciones } from '../src/gtm-proyecciones.js';

const _RLR = 'Ricardo López Reyero', _k = 'EYE', _rev = 181218;
const raiz = join(dirname(fileURLToPath(import.meta.url)), '..');
const args = process.argv.slice(2), remoto = args.includes('--remote');
const CASA = 'https://cupido.capitaltorreon.com';
const ahora = new Date(), p2 = (n) => String(n).padStart(2, '0');
const sello = `${ahora.getFullYear()}-${p2(ahora.getMonth() + 1)}-${p2(ahora.getDate())}_${p2(ahora.getHours())}${p2(ahora.getMinutes())}`;
const salida = args.find((a) => !a.startsWith('--')) || join(homedir(), 'Downloads', `Cupido_Go-To-Market_v${PLAN.version}_${sello}.md`);

/* ── utilerías de texto ───────────────────────────────────────────────── */
const MESES = ['enero', 'febrero', 'marzo', 'abril', 'mayo', 'junio', 'julio', 'agosto', 'septiembre', 'octubre', 'noviembre', 'diciembre'];
const num = (n) => Math.round(Number(n || 0)).toLocaleString('es-MX');
const diaLargo = (iso) => { const [a, m, d] = String(iso).slice(0, 10).split('-').map(Number); return `${d} de ${MESES[m - 1]} de ${a}`; };
function plata(n) {
  const a = Math.abs(n), s = n < 0 ? '−' : '';
  if (a < 1e4) return s + '$' + num(a);
  if (a < 1e6) return s + '$' + num(Math.round(a / 1000) * 1000);
  if (a < 1e7) return s + '$' + (a / 1e6).toLocaleString('es-MX', { maximumFractionDigits: 1 }) + ' millones';
  return s + '$' + num(a / 1e6) + ' millones';
}
const gentes = (n) => (n < 1e6 ? num(n < 1e4 ? n : Math.round(n / 100) * 100) : (n / 1e6).toLocaleString('es-MX', { maximumFractionDigits: 1 }) + (Math.round(n / 1e5) === 10 ? ' millón' : ' millones'));
// las ligas de adentro (/ceo, /programa…) se vuelven completas para que sirvan fuera de la página
const tx = (s) => String(s ?? '').replace(/\]\(\//g, `](${CASA}/`).replace(/\s*\n\s*/g, ' ').trim();
const celda = (s) => tx(s).replace(/\|/g, '\\|') || ' ';
const tabla = (cab, filas) => [`| ${cab.map(celda).join(' | ')} |`, `|${cab.map(() => ' --- ').join('|')}|`, ...filas.map((f) => `| ${f.map(celda).join(' | ')} |`)].join('\n');
const cita = (s) => String(s).split('\n').map((l) => '> ' + l).join('\n');

/* ── leer producción (solo con --remote) ──────────────────────────────── */
function d1(sql) {
  const r = spawnSync('npx', ['wrangler', 'd1', 'execute', 'cupido-db', '--remote', '--json', '--command', sql], { cwd: raiz, encoding: 'utf8', maxBuffer: 64 * 1024 * 1024 });
  if (r.status !== 0) throw new Error('No se pudo leer la base: ' + (r.stderr || r.stdout).slice(0, 400));
  return JSON.parse(r.stdout.slice(r.stdout.indexOf('[')))[0].results;
}
const vivo = { hechas: {}, fichas: {}, agregadas: [], pruebas: null };
if (remoto) {
  for (const f of d1(`SELECT id, hecha_por, hecha_nombre, hecha_at FROM gtm_tareas`)) vivo.hechas[f.id] = f;
  for (const f of d1(`SELECT id, grupo, estado, notas, updated_por, CASE WHEN id LIKE 'cand\\_%' ESCAPE '\\' THEN datos END datos FROM candidatos WHERE vacante = 'ceo' AND grupo != 'meta'`)) {
    vivo.fichas[f.id] = f;
    if (f.datos) { try { const d = JSON.parse(f.datos); delete d.foto; vivo.agregadas.push({ ...d, id: f.id, grupo: 'banca', orden: 900 }); } catch { /* ficha rota: se salta */ } }
  }
  vivo.pruebas = d1(`SELECT nombre, correo, whatsapp, ciudad, sala, diez_dias, cambiarias, correcto, video, enlace, creado FROM ceo_postulaciones ORDER BY creado DESC LIMIT 100`);
}

/* ── los bloques del plan, en Markdown ────────────────────────────────── */
const BLOQUE = {
  cabeza: (b, h) => `${'#'.repeat(h)} ${tx(b.t)}\n\n${b.e ? `_${tx(b.e)}_\n\n` : ''}${b.s ? tx(b.s) + '\n' : ''}`,
  p: (b) => tx(b.t) + '\n',
  cifras: (b) => b.l.map((c) => `- **${tx(c.n)}** — ${tx(c.t)}.${c.s ? ' ' + tx(c.s) : ''}`).join('\n') + '\n',
  tarjetas: (b) => b.l.map((c, i) => `${b.num ? `${i + 1}.` : '-'} **${tx(c.t)}**${c.e ? ` _(${tx(c.e)})_` : ''}${c.d ? '\n   ' + tx(c.d) : ''}${c.l ? '\n' + c.l.map((x) => `   - ${tx(x)}`).join('\n') : ''}${c.pie ? '\n   _' + tx(c.pie) + '_' : ''}`).join('\n') + '\n',
  pasos: (b) => b.l.map((c, i) => `${i + 1}. **${tx(c.t)}**${c.cuando ? ` · _${tx(c.cuando)}_` : ''}\n   ${tx(c.d)}${c.l ? '\n' + c.l.map((x) => `   - ${tx(x)}`).join('\n') : ''}`).join('\n') + '\n',
  tabla: (b) => tabla(b.cab, b.filas) + '\n' + (b.nota ? '\n_' + tx(b.nota) + '_\n' : ''),
  lista: (b) => b.l.map((x) => `- ${tx(x)}`).join('\n') + '\n',
  nota: (b) => cita(`${b.e ? `**${tx(b.e)}** ` : ''}${tx(b.t)}`) + '\n',
  gente: (b) => b.l.map((g) => `- **${g.u ? `[${tx(g.n)}](${g.u})` : tx(g.n)}**${g.r ? ` · ${tx(g.r)}` : ''}\n   ${tx(g.q)}${g.a ? `\n   _Por dónde entrarle:_ ${tx(g.a)}` : ''}`).join('\n') + '\n',
  fuentes: (b) => `**${tx(b.t || 'De dónde salen los datos')}**\n\n` + b.l.map((f, i) => `${i + 1}. ${f.u ? `[${tx(f.t)}](${f.u})` : tx(f.t)}`).join('\n') + '\n',
  calc: () => `_(Aquí va la calculadora de ciudad, que solo funciona en la página: ${CASA}/gtm#numeros)_\n`,
  boton: () => '',
};
const bloques = (l, h) => l.map((b) => (BLOQUE[b.k] ? BLOQUE[b.k](b, h) : '')).filter(Boolean).join('\n');
const pestana = (id) => PLAN.pestanas.find((p) => p.id === id);

/* ═══ 1 · ESTRATEGIA ═════════════════════════════════════════════════ */
const DE_ESTRATEGIA = ['resumen', 'atajos', 'lanzamiento', 'creadores', 'alianzas', 'numeros', 'ritmo'];
const estrategia = DE_ESTRATEGIA.map((id) => `## 1.${DE_ESTRATEGIA.indexOf(id) + 1} · ${pestana(id).t}\n\n${bloques(pestana(id).bloques, 3)}`).join('\n\n');

/* ═══ 2 · TAREAS ═════════════════════════════════════════════════════ */
const de = (l, k, v) => (l.find((x) => x[k] === v) || {}).t || v;
const T = new Map(TAREAS.map((t) => [t[0], t]));
function tarea(id) {
  const t = T.get(id); if (!t) return '';
  const h = vivo.hechas[id];
  return `- [${h ? 'x' : ' '}] **${tx(t[6])}** \`${t[0]}\` · ${de(AREAS, 'id', t[2])} · ${de(QUIENES, 'id', t[3])} · ${de(ESFUERZOS, 'n', t[4])} · ${de(RITMOS, 'id', t[5])}${h ? ` · _hecha por ${h.hecha_por} el ${String(h.hecha_at).slice(0, 16)} (UTC)_` : ''}\n   ${tx(t[7])}`;
}
const control = (c) => cita(`🎯 **Punto de control \`${c[0]}\` · ${diaLargo(c[3])} · ${tx(c[6])}**${vivo.hechas[c[0]] ? ' _(alcanzado)_' : ''}\n**${num(c[4])} usuarios al mes · ${plata(c[5])} de ingreso al mes.**\n${tx(c[7])}\n_Si no se llega:_ ${tx(c[8])}`);
const tareas = FASES.map((f) => {
  const pasos = PASOS.filter((p) => p[0] === f.n), enPaso = new Set(pasos.flatMap((p) => p[3]));
  const sueltas = TAREAS.filter((t) => t[1] === f.n && !enPaso.has(t[0])).map((t) => t[0]);
  const puestos = new Set();
  const lista = (ids) => ids.map((id) => [tarea(id), ...CONTROLES.filter((c) => c[2] === id).map((c) => { puestos.add(c[0]); return '\n' + control(c) + '\n'; })].join('\n')).join('\n');
  const cuerpo = pasos.map((p, k) => `### Paso ${k + 1} · ${tx(p[2])}${p[1] ? ` _(${tx(p[1])})_` : ''}\n\n${lista(p[3])}`).join('\n\n')
    + (sueltas.length ? `\n\n### Lo demás de la fase\n\n${lista(sueltas)}` : '');
  const faltan = CONTROLES.filter((c) => c[1] === f.n && !puestos.has(c[0])).map(control).join('\n\n');
  const n = TAREAS.filter((t) => t[1] === f.n), hechas = n.filter((t) => vivo.hechas[t[0]]).length;
  return `## 2.${f.n} · Fase ${f.n}: ${tx(f.t)}\n\n_${tx(f.cuando)}_ · **Meta:** ${tx(f.meta)} · ${n.length} actividades${remoto ? `, ${hechas} hechas` : ''}.\n\n${cuerpo}${faltan ? '\n\n' + faltan : ''}`;
}).join('\n\n');
const tablaControles = tabla(['Clave', 'Para cuándo', 'Usuarios al mes', 'Ingreso al mes', 'Qué es'], CONTROLES.map((c) => [c[0], diaLargo(c[3]), num(c[4]), plata(c[5]), c[6]]));

/* ═══ 3 · EL CEO: el perfil sale de la página pública /ceo ═══════════ */
function perfilCeo() {
  let h = readFileSync(join(raiz, 'public/ceo.html'), 'utf8');
  const lee = (nombre) => { const m = h.match(new RegExp(`const ${nombre} = (\\[[\\s\\S]*?\\n\\]);`)); return m ? new Function(`return ${m[1]}`)() : []; };
  const RASGOS = lee('RASGOS'), SABER = lee('SABER'), PODER = lee('PODER');
  h = h.slice(h.indexOf('<main'), h.indexOf('</main>'));
  const pon = (id, md) => { h = h.replace(new RegExp(`<(div|ol)[^>]*id="${id}"[^>]*></\\1>`), `\n\n${md}\n\n`); };
  pon('ceo-rasgos', RASGOS.map((r, i) => `${i + 1}. **${r[0]} · ${r[1]}**\n   ${r[2]}\n   _Se nota en que_ ${r[3]}`).join('\n'));
  pon('ceo-saber', SABER.map((s) => `- **${s[0]}.** ${s[1]}`).join('\n'));
  pon('ceo-poder', PODER.map((x, i) => `${i + 1}. ${x}`).join('\n'));
  // la prueba es un formulario: se queda con lo que pregunta
  h = h.replace(/<form[\s\S]*?<\/form>/, (f) => '\n\n' + [...f.matchAll(/<label class="ceo-campo"><span>([\s\S]*?)<\/span><small>([\s\S]*?)<\/small>/g)].map((m) => `- **${m[1].replace(/<i>(\d+)<\/i>\s*/, '$1 · ').replace(/<[^>]+>/g, '')}** ${m[2]}`).join('\n') + '\n\nAdemás pide nombre, correo, WhatsApp y ciudad. La lee solo el equipo de Cupido.\n\n')
    .replace(/<div class="ceo-recibido"[\s\S]*?<\/div>/, '');
  return h
    .replace(/<p class="eyebrow">([\s\S]*?)<\/p>/g, '\n\n_$1_\n\n')
    .replace(/<h1[^>]*>([\s\S]*?)<\/h1>/g, '\n\n### $1\n\n').replace(/<h2[^>]*>([\s\S]*?)<\/h2>/g, '\n\n### $1\n\n')
    .replace(/<article><h3>([\s\S]*?)<\/h3><p>([\s\S]*?)<\/p><\/article>/g, '\n- **$1.** $2').replace(/<article><span>([\s\S]*?)<\/span><p>([\s\S]*?)<\/p><\/article>/g, '\n- **$1:** $2')
    .replace(/<h3[^>]*>([\s\S]*?)<\/h3>/g, '\n\n**$1**\n\n').replace(/<li[^>]*>([\s\S]*?)<\/li>/g, '\n- $1')
    .replace(/<a [^>]*href="([^"]+)"[^>]*>([\s\S]*?)<\/a>/g, (_, u, t) => `[${t}](${u.startsWith('/') ? CASA + u : u})`)
    .replace(/<(b|strong)>([\s\S]*?)<\/\1>/g, '**$2**').replace(/<(em|i)>([\s\S]*?)<\/\1>/g, '*$2*')
    .replace(/<\/p>/g, '\n\n').replace(/<[^>]+>/g, '')
    .replace(/&amp;/g, '&').replace(/&lt;/g, '<').replace(/&gt;/g, '>').replace(/&nbsp;/g, ' ')
    .split('\n').map((l) => (/^\s+(\d+\.|-|_)/.test(l) && !/^ {3}\S/.test(l) ? l.trimStart() : /^ {3}\S/.test(l) ? l : l.trim())).join('\n')
    .replace(/\n{3,}/g, '\n\n').trim();
}
function pruebasRecibidas() {
  if (!vivo.pruebas) return '_No se leyeron de producción (el archivo se generó sin `--remote`). Se ven en /gtm → El CEO → Pruebas recibidas._';
  if (!vivo.pruebas.length) return `Todavía no llega ninguna. La liga para mandar es ${CASA}/ceo`;
  const parte = (t, v) => (v ? `**${t}**\n\n${String(v).trim()}\n` : '');
  return vivo.pruebas.map((p) => `### ${p.nombre} · ${p.ciudad || 'sin ciudad'} · ${String(p.creado).slice(0, 10)}\n\n${[p.correo, p.whatsapp, p.video ? `[su video](${p.video})` : '', p.enlace ? `[lo que construyó](${p.enlace})` : ''].filter(Boolean).join(' · ')}\n\n${[parte('1 · La vez que juntó gente desde cero', p.sala), parte('2 · Diez días y cero pesos', p.diez_dias), parte('3 · Tres cosas que cambiaría', p.cambiarias), parte('4 · Lo correcto sobre lo conveniente', p.correcto)].filter(Boolean).join('\n')}`).join('\n\n');
}

/* ═══ 4 · CANDIDATAS: las fichas viven fuera del repositorio ════════ */
const NIVEL = { 3: ['Se ve', '●'], 2: ['Probable', '◉'], 1: ['Por comprobar', '○'], 0: ['Bandera', '◆'] };
const ESTADOS = { por_contactar: 'Por contactar', contactado: 'Contactado', en_platica: 'En plática', prueba: 'Mandó la prueba', descartado: 'Descartado' };
function candidatas() {
  const ruta = join(raiz, 'privado/candidatas-ceo.json');
  if (!existsSync(ruta)) return '_No está el archivo `privado/candidatas-ceo.json` en esta máquina: las fichas se ven en /gtm → Candidatas._';
  const j = JSON.parse(readFileSync(ruta, 'utf8')), m = j.meta || {};
  const F = [...j.fichas, ...vivo.agregadas].map((f) => ({ ...f, estado: vivo.fichas[f.id]?.estado || 'por_contactar', notas: vivo.fichas[f.id]?.notas || '', quien: vivo.fichas[f.id]?.updated_por || '' }));
  const top = F.filter((f) => f.grupo === 'top').sort((a, b) => a.orden - b.orden), banca = F.filter((f) => f.grupo !== 'top').sort((a, b) => a.orden - b.orden);
  const R = m.rasgos?.length ? m.rasgos : [...new Set(top.flatMap((f) => Object.keys(f.rasgos || {})))];
  const letrero = m.etiqueta_clave || 'Por qué';
  const ficha = (f, h) => {
    const L = [`${'#'.repeat(h)} ${f.grupo === 'top' ? String(f.orden).padStart(2, '0') + ' · ' : ''}${f.nombre}`, ''];
    if (f.titular) L.push(`**${tx(f.titular)}**`, '');
    if (f.clave) L.push(cita(`**${letrero}:** ${tx(f.clave)}`), '');
    L.push([f.ciudad, f.grado ? `contacto de ${f.grado} grado` : '', f.comun?.n ? `${f.comun.n} en común` : '', f.escuela, f.nuevo].filter(Boolean).join(' · '));
    if (f.liga) L.push(`Perfil: ${f.liga}`);
    L.push(`Estado: **${ESTADOS[f.estado] || f.estado}**${f.quien ? ` (último cambio: ${f.quien})` : ''}`);
    if (f.notas) L.push('', `**Notas del equipo:** ${tx(f.notas)}`);
    if (f.resumen) L.push('', tx(f.resumen));
    if (f.por_que_no) L.push('', `**Por qué no quedó entre las principales:** ${tx(f.por_que_no)}`);
    if (f.proposito) L.push('', `**Por qué esto le estaba destinado.** ${tx(f.proposito)}`);
    if (f.trayectoria?.length) L.push('', '**Trayectoria**', '', ...f.trayectoria.map((t) => `- **${tx(t.puesto)}**${t.empresa ? ` · ${tx(t.empresa)}` : ''}${t.fechas ? ` _(${tx(t.fechas)})_` : ''}${t.nota ? `. ${tx(t.nota)}` : ''}`));
    if (f.senales?.length) L.push('', '**Señales**', '', ...f.senales.map((x) => `- ${tx(x)}`));
    if (f.prensa?.length) L.push('', '**Lo que se ha publicado de su trabajo**', '', ...f.prensa.map((x) => `- [${tx(x.titulo || x.liga)}](${x.liga})${x.medio ? ` · ${tx(x.medio)}` : ''}`));
    if (Object.keys(f.rasgos || {}).length) L.push('', `**Los ${R.length} rasgos, uno por uno**`, '', ...R.map((k) => { const r = f.rasgos[k] || [1, '']; return `- ${NIVEL[r[0]][1]} **${k}** _(${NIVEL[r[0]][0].toLowerCase()})_: ${tx(r[1])}`; }));
    if (f.banderas?.length) L.push('', '**Qué revisar antes de ilusionarse**', '', ...f.banderas.map((b) => `- ${tx(b)}`));
    if (f.comun?.n) L.push('', `**Quién puede hacer la presentación:** ${f.comun.n === 1 ? 'un contacto' : f.comun.n + ' contactos'} en común${f.comun.nombres?.length ? `: ${f.comun.nombres.join(', ')}${f.comun.n > f.comun.nombres.length ? ` y ${f.comun.n - f.comun.nombres.length} más` : ''}` : ''}.${f.comun.nota ? ' ' + tx(f.comun.nota) : ''}`);
    if (f.nota_conexion) L.push('', `**Nota de invitación** _(${f.nota_conexion.length} de 200 caracteres; no se ha enviado)_`, '', cita(f.nota_conexion));
    if (f.mensaje) L.push('', '**Mensaje para cuando acepte** _(no se ha enviado)_', '', cita(f.mensaje));
    if (f.preguntas?.length) L.push('', '**Preguntas para la primera llamada**', '', ...f.preguntas.map((x, i) => `${i + 1}. ${tx(x)}`));
    return L.join('\n');
  };
  const cuenta = (f) => Object.values(f.rasgos || {}).filter((r) => r[0] === 3).length;
  return [
    `_${tx(m.ceja || 'Búsqueda de personas')}_`, '', `**${tx(m.titulo || 'Candidatas')}**`, '', tx(m.bajada || ''), '',
    (m.cifras || []).map((c) => `**${c[0]}** ${c[1]}`).join(' · '), '',
    m.metodo?.length ? `### Cómo se hizo la búsqueda${m.fecha ? ` · ${m.fecha}` : ''}\n\n${m.metodo.map((x) => `- ${tx(x)}`).join('\n')}\n` : '',
    `## 4.1 · Las ${top.length} de un vistazo`, '',
    tabla(['#', 'Nombre', letrero, ...R, 'Se ven'], top.map((f) => [String(f.orden).padStart(2, '0'), `**${f.nombre}**<br>${[f.ciudad, f.comun?.n ? f.comun.n + ' en común' : ''].filter(Boolean).join(' · ')}`, f.clave || '', ...R.map((k) => NIVEL[(f.rasgos?.[k] || [1])[0]][1]), `${cuenta(f)} de ${R.length}`])), '',
    `${[3, 2, 1, 0].map((n) => `${NIVEL[n][1]} ${NIVEL[n][0]}`).join(' · ')}. «Se ve» quiere decir que su perfil lo demuestra con hechos. «Por comprobar» no es malo: es lo que hay que preguntar. La honradez nunca se ve en un perfil; se comprueba con quien le confió dinero.`, '',
    `## 4.2 · Las ${top.length} fichas principales`, '', top.map((f) => ficha(f, 3)).join('\n\n---\n\n'), '',
    `## 4.3 · La banca (${banca.length})`, '', 'Gente que vale una llamada, y la razón por la que no quedó arriba.', '', banca.map((f) => ficha(f, 3)).join('\n\n---\n\n'),
  ].join('\n');
}

/* ═══ 5 · PROYECCIONES ═══════════════════════════════════════════════ */
function proyeccionesMd() {
  const P = proyecciones(), pct = (x) => Math.round(x * 100) + ' %', alMes = (v) => (v == null ? `${pct(P.renglones.find((r) => r.clave === 'cobro').parte)} de lo que entra` : v ? plata(v) + ' al mes' : '—');
  const escenario = (e, k) => {
    const F = e.filas, fin = F[F.length - 1], a30 = F.find((f) => f.anio === P.planHasta);
    const etapa = (f) => (f.anio === P.desde ? 'Arranque · todo gratis' : !f.cobra ? 'Todo gratis · apoyos voluntarios' : f.anio === e.cobra ? 'Empieza a cobrar el programa' : f.anio <= P.planHasta ? 'La escalera del plan' : 'Hacia el techo (supuesto)');
    return [`## 5.${k + 1} · Escenario: ${e.nombre}`, '', tx(e.nota), '',
      `- **${plata(e.hacenFalta)}** hacen falta antes de que Cupido se pague solo. Lo más hondo de la cuenta es ${MESES[e.fondoEn.mes - 1]} de ${e.fondoEn.anio}.`,
      `- **${e.primerAnioBueno || '—'}** es el primer año en que entra más de lo que se gasta.`,
      `- **${plata(a30.ingreso)}** entran en ${a30.anio}, con ${gentes(a30.usuarios)} de usuarios al mes. Quedan ${plata(a30.queda)} antes de impuestos.`,
      `- **${plata(fin.ingreso)}** entran en ${fin.anio}, con ${gentes(fin.usuarios)} de usuarios al mes. Quedan ${plata(fin.queda)} antes de impuestos.`, '',
      tabla(['Año', 'Qué pasa', 'Usuarios al mes', 'Pesos por usuario', 'Entra al mes (dic.)', 'Entra en el año', 'Se gasta en el año', 'Queda en el año', 'Acumulado'],
        F.map((f) => [f.anio + (f.anio === P.desde ? ' (oct–dic)' : ''), etapa(f) + (e.id === 'plan' && P.hitos[f.anio] ? `: ${P.hitos[f.anio]}` : ''), gentes(f.usuarios), '$' + f.porUsuario, plata(f.ingresoMes), plata(f.ingreso), plata(f.gastos), plata(f.queda), plata(f.acumulado)])), '',
      '**En qué se va el gasto, año por año**', '',
      tabla(['Año', ...P.renglones.map((r) => r.nombre), 'Total'], F.map((f) => [f.anio, ...P.renglones.map((r) => plata(f.partes[r.clave])), plata(f.gastos)])),
    ].join('\n');
  };
  return [
    `Los próximos ${P.anios} años: lo que entra y lo que se gasta, de ${P.desde} (el arranque, de octubre a diciembre) a ${P.hasta}. La misma escalera de Tareas, llevada hasta ${P.planHasta}, y de ahí en adelante un supuesto de techo. Sirve para dar una idea del tamaño de lo que se está armando; **no es un pronóstico**. Todo en pesos mexicanos de hoy, antes de impuestos y sin inflación. Las cantidades grandes van redondeadas al millón.`, '',
    // «El plan» va primero: es el que se discute; los otros dos son para comparar
    [...P.escenarios].sort((x, y) => (y.id === 'plan') - (x.id === 'plan')).map(escenario).join('\n\n'), '',
    `## 5.${P.escenarios.length + 1} · Los gastos: de dónde sale cada renglón`, '',
    tabla(['Renglón', `En ${P.desde}`, `En ${P.desde + 1}`, 'Desde que se cobra', 'De dónde sale'], P.renglones.map((r) => [r.nombre, alMes(r.en2026), alMes(r.en2027), pct(r.parte) + ' de lo que entra', r.de])), '',
    `_Suma ${pct(P.renglones.reduce((s, r) => s + r.parte, 0))} de lo que entra; el resto queda antes de impuestos. Cuidado y seguridad lleva además $${P.verificacion} por cada perfil nuevo mientras no se cobra._`, '',
    `## 5.${P.escenarios.length + 2} · Los supuestos, a la vista`, '', P.supuestos.map((x) => `- ${tx(x)}`).join('\n'),
  ].join('\n');
}

/* ═══ el archivo ═════════════════════════════════════════════════════ */
const hechas = Object.keys(vivo.hechas).filter((id) => T.has(id)).length;
const md = [
  `# Cupido Algorítmico · Go-to-market completo`, '',
  `**${tx(PLAN.titulo)}**`, '',
  `Versión ${PLAN.version} del plan · sacado el ${ahora.getDate()} de ${MESES[ahora.getMonth()]} de ${ahora.getFullYear()} a las ${p2(ahora.getHours())}:${p2(ahora.getMinutes())} · en vivo: ${CASA}/gtm (solo correos de la casa)`, '',
  cita(`**Privado.** Este archivo trae nombres, perfiles y lo que pensamos de personas a las que todavía no se les ha escrito. No se sube al repositorio (es público) ni se comparte fuera de la casa. A nadie se le ha mandado mensaje ni invitación.`), '',
  `## Qué trae`, '',
  `1. **Estrategia** — ${DE_ESTRATEGIA.map((id) => pestana(id).t).join(', ')}.`,
  `2. **Tareas** — ${TAREAS.length} actividades en ${PASOS.length} pasos y ${FASES.length} fases, con ${CONTROLES.length} puntos de control${remoto ? ` (${hechas} hechas al sacar el archivo)` : ''}.`,
  `3. **El CEO** — el perfil de quien va a dirigir, cómo elegir y las pruebas recibidas.`,
  `4. **Candidatas** — las fichas de a quién salimos a buscar.`,
  `5. **Proyecciones** — ${proyecciones().anios} años de ingresos y gastos, en tres escenarios.`, '',
  tx(PLAN.bajada || ''), '',
  '---', '', `# 1 · Estrategia`, '', estrategia, '',
  '---', '', `# 2 · Tareas`, '',
  `${TAREAS.length} actividades, en el orden en que conviene hacerlas. Cada una dice de qué área es, quién la hace (persona, IA o las dos), cuánto lleva y si se repite. ${remoto ? `Las palomitas son las que había en producción al sacar el archivo: ${hechas} de ${TAREAS.length}.` : 'Las palomitas no se leyeron de producción.'} Mezclados van los puntos de control (🎯): no se palomean, se alcanzan solos cuando los dos números llegan.`, '',
  `## 2.0 · Los ${CONTROLES.length} puntos de control, juntos`, '', tablaControles, '', SUPUESTOS_CONTROL.map((x) => `- ${tx(x)}`).join('\n'), '', tareas, '',
  '---', '', `# 3 · El CEO`, '',
  `## 3.1 · El perfil de quien va a dirigir Cupido`, '', `Es la página pública que se le manda a quien queremos que dirija: ${CASA}/ceo (no está listada en buscadores). Va tal como se lee ahí.`, '', perfilCeo(), '',
  `## 3.2 · Cómo elegir`, '', bloques(pestana('equipo').bloques, 3), '',
  `## 3.3 · Pruebas recibidas${vivo.pruebas ? ` (${vivo.pruebas.length})` : ''}`, '', pruebasRecibidas(), '',
  '---', '', `# 4 · Candidatas`, '', candidatas(), '',
  '---', '', `# 5 · Proyecciones`, '', proyeccionesMd(), '',
].join('\n').replace(/\n{3,}/g, '\n\n') + '\n';

writeFileSync(salida, md);
console.log(`Listo: ${salida}\n${md.split('\n').length.toLocaleString('es-MX')} renglones · ${Math.round(md.length / 1024)} KB${remoto ? ` · leído de producción: ${hechas} palomitas, ${Object.keys(vivo.fichas).length} fichas, ${vivo.pruebas.length} pruebas` : ''}`);
