/* ─────────────────────────────────────────────────────────────────────────────
   Cupido Algorítmico · Worker (Cloudflare) — enrutador y API
   Autor: Ricardo López Reyero
   Demo sin login a propósito: cero fricción. Lo que falta para abrirlo a
   personas reales está en docs/RUTA.md (magic link, admin protegido, etc.).
   ───────────────────────────────────────────────────────────────────────────── */
// RLR
import { asegurar, vistaPersona, vistaAdmin, detallePar, detallePersona, persona, personaPorToken, decidir, correrFase, reiniciarDemo, guardarCuestionario, anotar, recalcularTodo } from './datos.js';
import { publicar, moderar, paginaLista, paginaArticulo, CATEGORIAS } from './articulos.js';
import { cruzarTodos, UMBRAL } from '../public/js/motor.js';
import { personas } from './datos.js';
import MANIFIESTO from '../MANIFIESTO.md';
import README from '../README.md';
import PREGUNTAS from '../PREGUNTAS.md';
import MODELO from '../MODELO.md';
import EXPERIENCIA from '../EXPERIENCIA.md';
import RUTA from '../docs/RUTA.md';

const _RLR = 'Ricardo López Reyero'; // sin export: el módulo principal solo puede exportar manejadores
const _k = 'EYE', _rev = 181218;

const DOCS = { 'MANIFIESTO.md': MANIFIESTO, 'README.md': README, 'PREGUNTAS.md': PREGUNTAS, 'MODELO.md': MODELO, 'EXPERIENCIA.md': EXPERIENCIA, 'RUTA.md': RUTA };

const json = (data, status = 200) => new Response(JSON.stringify(data), { status, headers: { 'content-type': 'application/json; charset=utf-8', 'cache-control': 'no-store' } });
const error = (msg, status = 400) => json({ error: msg }, status);

async function leerJson(req, max = 250_000) {
  const txt = await req.text();
  if (txt.length > max) throw new Error('Demasiado grande');
  return txt ? JSON.parse(txt) : {};
}

export default {
  async fetch(req, env, ctx) {
    const url = new URL(req.url);
    const ruta = url.pathname;
    try {
      if (ruta === '/demo.html' || ruta === '/demo') return Response.redirect(new URL('/cuestionario', url).href, 301);
      if (ruta.startsWith('/docs/')) {
        const d = DOCS[ruta.slice(6)];
        return d ? new Response(d, { headers: { 'content-type': 'text/markdown; charset=utf-8' } }) : new Response('No existe', { status: 404 });
      }
      await asegurar(env);
      if (ruta.startsWith('/api/')) return await api(req, env, ctx, url);
      if (ruta === '/articulos' || ruta === '/articulos/') return await paginaLista(env, url);
      if (ruta === '/articulos/escribir' || ruta === '/articulos/escribir/') return env.ASSETS.fetch(new Request(new URL('/escribir', url), req));
      if (ruta.startsWith('/articulos/')) return await paginaArticulo(env, url, decodeURIComponent(ruta.slice(11).replace(/\/$/, '')));
      return env.ASSETS.fetch(req);
    } catch (e) {
      console.error(ruta, e.stack || e.message);
      return ruta.startsWith('/api/') ? error('Algo falló de nuestro lado. Intenta de nuevo.', 500) : new Response('Algo falló de nuestro lado.', { status: 500 });
    }
  },
};

async function api(req, env, ctx, url) {
  const ruta = url.pathname.replace(/\/$/, '');
  const m = (re) => ruta.match(re);
  const metodo = req.method;
  let x;

  /* ── Personas (demo: se entra eligiendo a quién ser; reales: enlace privado) ── */
  if (ruta === '/api/pool' && metodo === 'GET') {
    const todas = await personas(env);
    const nuevos = new Map((await env.DB.prepare(`SELECT persona, COUNT(*) AS n FROM avisos WHERE leido = 0 GROUP BY persona`).all()).results.map((r) => [r.persona, r.n]));
    return json(todas.filter((p) => p.pool === 'demo').map((p) => ({ id: p.id, nombre: p.nombre, edad: p.edad, genero: p.genero, color: p.color, ciudad: p.r.ciudad, origen: p.origen, completo: !!p.completo, bio: p.origen === 'demo' ? p.bio : null, avisos: nuevos.get(p.id) || 0 })));
  }
  if ((x = m(/^\/api\/persona\/([a-z0-9]+)$/)) && metodo === 'GET') {
    const P = await persona(env, x[1]);
    if (!P || P.pool !== 'demo') return error('No existe', 404);
    return json(await vistaPersona(env, P));
  }
  if ((x = m(/^\/api\/yo\/([a-z0-9]{20,40})$/)) && metodo === 'GET') {
    const P = await personaPorToken(env, x[1]);
    if (!P) return error('Enlace inválido', 404);
    return json({ ...(await vistaPersona(env, P)), token: true });
  }
  if (ruta === '/api/puerta' && metodo === 'POST') {
    const b = await leerJson(req);
    const P = b.token ? await personaPorToken(env, b.token) : await persona(env, b.persona);
    if (!P) return error('No existe', 404);
    const r = await decidir(env, P.id, String(b.otra || ''), b.decision);
    return json({ ok: true, ...r, vista: await vistaPersona(env, P) });
  }
  if (ruta === '/api/yo/estado' && metodo === 'POST') {
    // la persona pausa o reactiva su perfil ("estoy conociendo a alguien")
    const b = await leerJson(req);
    const P = b.token ? await personaPorToken(env, b.token) : await persona(env, b.persona);
    if (!P) return error('No existe', 404);
    if (!['activa', 'pausada'].includes(b.estado)) return error('Estado inválido');
    await env.DB.prepare(`UPDATE personas SET estado = ? WHERE id = ?`).bind(b.estado, P.id).run();
    await anotar(env, 'persona', b.estado === 'pausada' ? 'Una persona pausó su perfil' : 'Una persona reactivó su perfil', P.nombre);
    await recalcularTodo(env, { avisar: true, motivo: 'estado' });
    return json({ ok: true, vista: await vistaPersona(env, await persona(env, P.id)) });
  }
  if (ruta === '/api/avisos/leer' && metodo === 'POST') {
    const b = await leerJson(req);
    const P = b.token ? await personaPorToken(env, b.token) : await persona(env, b.persona);
    if (!P) return error('No existe', 404);
    await env.DB.prepare(`UPDATE avisos SET leido = 1 WHERE persona = ?`).bind(P.id).run();
    return json({ ok: true });
  }

  /* ── Cuestionario conectado ─────────────────────────────────────────────── */
  if (ruta === '/api/cuestionario' && metodo === 'POST') {
    const b = await leerJson(req);
    return json(await guardarCuestionario(env, ctx, b));
  }
  if ((x = m(/^\/api\/cuestionario\/([a-z0-9]{20,40})$/)) && metodo === 'GET') {
    const P = await personaPorToken(env, x[1]);
    if (!P) return error('Enlace inválido', 404);
    return json({ id: P.id, nombre: P.nombre, respuestas: P.r, completo: !!P.completo });
  }

  /* ── Artículos ──────────────────────────────────────────────────────────── */
  if (ruta === '/api/articulos' && metodo === 'POST') {
    const b = await leerJson(req, 60_000);
    const r = await publicar(env, req, b);
    return json(r, r.ok ? 200 : 422);
  }
  if (ruta === '/api/articulos/categorias') return json(CATEGORIAS);

  /* ── Admin (demo abierto; ver docs/RUTA.md antes de datos reales) ───────── */
  if (ruta === '/api/admin/resumen' && metodo === 'GET') return json(await vistaAdmin(env));
  if ((x = m(/^\/api\/admin\/par\/([a-z0-9]+)\/([a-z0-9]+)$/))) { const d = await detallePar(env, x[1], x[2]); return d ? json(d) : error('No existe ese par', 404); }
  if ((x = m(/^\/api\/admin\/persona\/([a-z0-9]+)$/))) { const d = await detallePersona(env, x[1]); return d ? json(d) : error('No existe', 404); }
  if (ruta === '/api/admin/correr' && metodo === 'POST') { const b = await leerJson(req); return json(await correrFase(env, Number(b.fase))); }
  if (ruta === '/api/admin/reiniciar' && metodo === 'POST') { await reiniciarDemo(env); return json({ ok: true }); }
  if (ruta === '/api/admin/bitacora') {
    const despues = Number(url.searchParams.get('despues') || 0);
    return json((await env.DB.prepare(`SELECT * FROM bitacora WHERE id > ? ORDER BY id DESC LIMIT 30`).bind(despues).all()).results);
  }
  if (ruta === '/api/admin/laboratorio' && metodo === 'POST') {
    // Pesos base alternos: vista previa, no guarda nada
    const b = await leerJson(req);
    const base = Object.fromEntries(Object.entries(b.base || {}).map(([k, v]) => [k, Math.max(0, Math.min(40, Number(v) || 0))]));
    const act = (await personas(env)).filter((p) => p.estado === 'activa' && p.completo);
    const pares = cruzarTodos(act, { base });
    return json({ pares: pares.map((p) => ({ a: p.a, b: p.b, pct: p.pct, sinVeto: p.sinVeto, veto: p.veto })), arriba: pares.filter((p) => p.pct >= UMBRAL).length });
  }
  if (ruta === '/api/admin/articulos' && metodo === 'GET') {
    return json((await env.DB.prepare(`SELECT id, slug, titulo, categoria, autor_nombre, autor_correo, estado, destacado, lecturas, creado FROM articulos ORDER BY creado DESC`).all()).results);
  }
  if ((x = m(/^\/api\/admin\/articulos\/(\d+)$/)) && metodo === 'POST') {
    const b = await leerJson(req);
    await moderar(env, Number(x[1]), b.accion);
    return json({ ok: true });
  }
  if ((x = m(/^\/api\/admin\/persona\/([a-z0-9]+)\/estado$/)) && metodo === 'POST') {
    const b = await leerJson(req);
    if (!['activa', 'pausada'].includes(b.estado)) return error('Estado inválido');
    await env.DB.prepare(`UPDATE personas SET estado = ? WHERE id = ?`).bind(b.estado, x[1]).run();
    await anotar(env, 'admin', b.estado === 'pausada' ? 'Se pausó un perfil' : 'Se reactivó un perfil', x[1]);
    await recalcularTodo(env, { avisar: true, motivo: 'estado' });
    return json({ ok: true });
  }
  return error('Ruta no encontrada', 404);
}
// fin · RLR
