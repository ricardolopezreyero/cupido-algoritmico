/* ─────────────────────────────────────────────────────────────────────────────
   Cupido Algorítmico · Worker (Cloudflare) — enrutador y API
   Autor: Ricardo López Reyero
   Acceso sin contraseñas: tu correo es tu cuenta (enlace mágico) y el demo
   está a un clic (/demo). Lo que falta para abrirlo a personas reales está
   en docs/RUTA.md (admin protegido, privacidad, verificación…).
   ───────────────────────────────────────────────────────────────────────────── */
// RLR
import { asegurar, vistaPersona, vistaAdmin, detallePar, detallePersona, persona, decidir, correrFase, reiniciarDemo, guardarCuestionario, anotar, recalcularTodo } from './datos.js';
import { quien, entrarDemo, pedirEnlace, canjearEnlace, cerrarSesion, cookieSesion, DEMO_ID } from './acceso.js';
import { publicar, moderar, paginaLista, paginaArticulo, CATEGORIAS } from './articulos.js';
import { guardarMedio, borrarMedio, servirMedio } from './medios.js';
import { limpiarVida } from '../public/js/vida.js';
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

const json = (data, status = 200, extra = {}) => new Response(JSON.stringify(data), { status, headers: { 'content-type': 'application/json; charset=utf-8', 'cache-control': 'no-store', ...extra } });
const error = (msg, status = 400) => json({ error: msg }, status);
const irA = (ruta, url, cookie) => new Response(null, { status: 302, headers: { location: new URL(ruta, url).href, 'cache-control': 'no-store', ...(cookie ? { 'set-cookie': cookie } : {}) } });

async function leerJson(req, max = 250_000) {
  const txt = await req.text();
  if (txt.length > max) throw new Error('Demasiado grande');
  return txt ? JSON.parse(txt) : {};
}

export default {
  async fetch(req, env, ctx) {
    const url = new URL(req.url);
    const ruta = url.pathname.replace(/\/$/, '') || '/';
    try {
      if (ruta.startsWith('/docs/')) {
        const d = DOCS[ruta.slice(6)];
        return d ? new Response(d, { headers: { 'content-type': 'text/markdown; charset=utf-8' } }) : new Response('No existe', { status: 404 });
      }
      await asegurar(env);
      if (ruta.startsWith('/api/')) return await api(req, env, ctx, url);

      /* ── acceso ── */
      if (ruta === '/demo' || ruta === '/demo.html') {
        // El demo a un clic: sesión sobre la persona demo, siempre limpia
        return irA('/persona', url, cookieSesion(await entrarDemo(env), url));
      }
      if (ruta === '/persona' && url.searchParams.get('id')) {
        // Desde el admin: "ver su panel" entra como esa persona ficticia (solo pool demo)
        try { return irA('/persona', url, cookieSesion(await entrarDemo(env, url.searchParams.get('id')), url)); }
        catch { return irA('/entrar', url); }
      }
      let x;
      if ((x = ruta.match(/^\/entrar\/([a-z0-9]{20,40})$/))) {
        const r = await canjearEnlace(env, x[1]);
        if (!r.ok) return irA(`/entrar?error=${r.motivo}`, url);
        return irA(r.completo ? '/persona' : '/cuestionario', url, cookieSesion(r.sesion, url));
      }
      if (ruta === '/persona' || ruta === '/cuestionario') {
        // Sin sesión no hay tablero ni cuestionario: a la puerta de entrada
        if (!(await quien(env, req))) return irA(`/entrar${ruta === '/cuestionario' ? '?luego=cuestionario' : ''}`, url);
      }

      if (ruta === '/articulos') return await paginaLista(env, url);
      if (ruta === '/articulos/escribir') return env.ASSETS.fetch(new Request(new URL('/escribir', url), req));
      if (ruta.startsWith('/articulos/')) return await paginaArticulo(env, url, decodeURIComponent(ruta.slice(11)));
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

  /* ── Acceso: correo (enlace mágico) o demo ─────────────────────────────── */
  if (ruta === '/api/entrar' && metodo === 'POST') {
    const b = await leerJson(req, 2000);
    const r = await pedirEnlace(env, req, url, b.correo);
    return json(r, r.ok ? 200 : 422);
  }
  if (ruta === '/api/demo' && metodo === 'POST') {
    const b = await leerJson(req, 2000);
    const id = String(b.persona || DEMO_ID);
    if (!/^[a-z0-9]{2,20}$/.test(id)) return error('Persona inválida');
    return json({ ok: true }, 200, { 'set-cookie': cookieSesion(await entrarDemo(env, id), url) });
  }
  if (ruta === '/api/salir' && metodo === 'POST') {
    await cerrarSesion(env, req);
    return json({ ok: true }, 200, { 'set-cookie': cookieSesion('', url, true) });
  }

  /* ── La persona (siempre desde su sesión; nunca por id) ────────────────── */
  const yo = await quien(env, req);
  const sinSesion = () => error('Sin sesión. Entra de nuevo.', 401);
  if (ruta === '/api/yo' && metodo === 'GET') {
    if (!yo) return sinSesion();
    return json({ ...(await vistaPersona(env, yo.P)), sesion: yo.sesion });
  }
  if (ruta === '/api/puerta' && metodo === 'POST') {
    if (!yo) return sinSesion();
    const b = await leerJson(req);
    const r = await decidir(env, yo.P.id, String(b.otra || ''), b.decision);
    return json({ ok: true, ...r, vista: await vistaPersona(env, yo.P) });
  }
  if (ruta === '/api/yo/estado' && metodo === 'POST') {
    // la persona pausa o reactiva su perfil ("estoy conociendo a alguien")
    if (!yo) return sinSesion();
    const b = await leerJson(req);
    if (!['activa', 'pausada'].includes(b.estado)) return error('Estado inválido');
    await env.DB.prepare(`UPDATE personas SET estado = ? WHERE id = ?`).bind(b.estado, yo.P.id).run();
    await anotar(env, 'persona', b.estado === 'pausada' ? 'Una persona pausó su perfil' : 'Una persona reactivó su perfil', yo.P.nombre);
    await recalcularTodo(env, { avisar: true, motivo: 'estado' });
    return json({ ok: true, vista: await vistaPersona(env, await persona(env, yo.P.id)) });
  }
  if (ruta === '/api/yo/ajustes' && metodo === 'POST') {
    // cómo quiere ver su tablero: 4 colores y 4 tipografías (se guarda en su cuenta)
    if (!yo) return sinSesion();
    const b = await leerJson(req, 2000);
    const COLORES = ['rosa', 'vino', 'azul', 'verde'], TIPOS = ['clasica', 'editorial', 'moderna', 'calida'];
    const aj = { color: COLORES.includes(b.color) ? b.color : 'rosa', tipo: TIPOS.includes(b.tipo) ? b.tipo : 'clasica' };
    if (!(yo.sesion.demo && yo.P.origen === 'demo')) await env.DB.prepare(`UPDATE personas SET ajustes = ? WHERE id = ?`).bind(JSON.stringify(aj), yo.P.id).run();
    return json({ ok: true, ajustes: aj });
  }
  if (ruta === '/api/yo/vida' && metodo === 'POST') {
    // los elementos de su vida, del 0 al 100 %, como ella misma se ve hoy
    if (!yo) return sinSesion();
    const v = limpiarVida(await leerJson(req, 4000));
    if (!(yo.sesion.demo && yo.P.origen === 'demo')) await env.DB.prepare(`UPDATE personas SET vida = ? WHERE id = ?`).bind(JSON.stringify(v), yo.P.id).run();
    return json({ ok: true, vida: v });
  }
  /* ── Medios: foto, voz y video (solo con cuestionario completo; se ven solo con puerta abierta) ── */
  if ((x = m(/^\/api\/medio\/(foto|audio|video)$/)) && (metodo === 'PUT' || metodo === 'DELETE')) {
    if (!yo) return sinSesion();
    if (yo.sesion.demo && yo.P.origen === 'demo') return error('En la cuenta demo no se suben archivos. Crea tu cuenta con tu correo.', 403);
    const r = metodo === 'PUT' ? await guardarMedio(env, yo.P, x[1], req) : await borrarMedio(env, yo.P, x[1]);
    return r.error ? error(r.error, r.status) : json(r);
  }
  if ((x = m(/^\/api\/medio\/([a-z0-9]+)\/(foto|audio|video)$/)) && metodo === 'GET') {
    if (!yo) return new Response('Sin sesión', { status: 401 });
    return await servirMedio(env, req, yo.P.id, x[1], x[2]);
  }
  if (ruta === '/api/avisos/leer' && metodo === 'POST') {
    if (!yo) return sinSesion();
    await env.DB.prepare(`UPDATE avisos SET leido = 1 WHERE persona = ?`).bind(yo.P.id).run();
    return json({ ok: true });
  }

  /* ── Cuestionario conectado ─────────────────────────────────────────────── */
  if (ruta === '/api/cuestionario' && metodo === 'GET') {
    if (!yo) return sinSesion();
    return json({ id: yo.P.id, nombre: yo.P.nombre === 'Sin nombre' ? '' : yo.P.nombre, respuestas: yo.P.r, completo: !!yo.P.completo, sesion: yo.sesion, ficticia: yo.P.origen === 'demo' });
  }
  if (ruta === '/api/cuestionario' && metodo === 'POST') {
    const b = await leerJson(req);
    // `nueva`: herramienta de demo "crear una persona al azar" (nace ficticia, con su propia sesión demo)
    const P = b.nueva ? null : yo?.P || null;
    if (!P && !b.nueva) return sinSesion();
    if (P && yo.sesion.demo && P.origen === 'demo') return error('En la cuenta demo el cuestionario ya está respondido. Crea tu cuenta con tu correo para responder el tuyo.', 403);
    const r = await guardarCuestionario(env, ctx, P, b);
    if (r.nueva) return json(r, 200, { 'set-cookie': cookieSesion(await entrarDemo(env, r.id), url) });
    return json(r);
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
