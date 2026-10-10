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
import { CATEGORIAS as CATEGORIAS_CORREO, mandarMuestra, correoA, despacharNovedades, correosDelDia, paginaBaja, prefsDe, ponerPrefs, catalogoCorreos, vistaPrevia, revisarCorreos, armar, plantilla as plantillaCorreo } from './correos.js';
import { verPrograma, apoyar, confirmarApoyo, ajustarPrograma, aportesAdmin, distribucionPrecios } from './programa.js';
import { limpiarPrecioJusto, REVISION_DIAS } from './precios.js';
import { generarSonido, servirSonido, estadoSonidos } from './sonidos.js';
import { avance } from '../public/js/preguntas.js';
import { llamada, conectarVoz, cambiarTono, responderChispa, verAlbum, misCharlas, verCharla, enviar, escribiendo, adjuntar, servirAdjunto, liberar, retirar, perfilCompartido, reaccionar, buscarGif, conectarVivo, guardar, losGuardados, buscarEnCharla, hitosDelDia } from './charla.js';
import { empezarSubida, subirParte, subirVista, terminarSubida, cancelarSubida, limpiarSubidas } from './subidas.js';
import { esHombre, esAdmin, ponerControl, cerrarPuerta, bloquear, desbloquear, agregarEvitar, quitarEvitar, seguridadAdmin, accionAdmin } from './ella.js';
export { CharlaViva } from './viva.js'; // el objeto durable de la charla en vivo (debe exportarse desde el módulo principal)
import { cruzarTodos, UMBRAL } from '../public/js/motor.js';
import { personas } from './datos.js';
import MANIFIESTO from '../MANIFIESTO.md';
import README from '../README.md';
import PREGUNTAS from '../PREGUNTAS.md';
import MODELO from '../MODELO.md';
import EXPERIENCIA from '../EXPERIENCIA.md';
import RUTA from '../docs/RUTA.md';
import ELLA from '../docs/ELLA.md';

const _RLR = 'Ricardo López Reyero'; // sin export: el módulo principal solo puede exportar manejadores
const _k = 'EYE', _rev = 181218;

const DOCS = { 'MANIFIESTO.md': MANIFIESTO, 'README.md': README, 'PREGUNTAS.md': PREGUNTAS, 'MODELO.md': MODELO, 'EXPERIENCIA.md': EXPERIENCIA, 'RUTA.md': RUTA, 'ELLA.md': ELLA };

const json = (data, status = 200, extra = {}) => new Response(JSON.stringify(data), { status, headers: { 'content-type': 'application/json; charset=utf-8', 'cache-control': 'no-store', ...extra } });
const error = (msg, status = 400) => json({ error: msg }, status);
const irA = (ruta, url, cookie) => new Response(null, { status: 302, headers: { location: new URL(ruta, url).href, 'cache-control': 'no-store', ...(cookie ? { 'set-cookie': cookie } : {}) } });

async function leerJson(req, max = 250_000) {
  const txt = await req.text();
  if (txt.length > max) throw new Error('Demasiado grande');
  return txt ? JSON.parse(txt) : {};
}

export default {
  // Cada día: recordar el cuestionario a quien lo dejó a medias hace 2 días o más (una sola vez)
  async scheduled(ev, env, ctx) {
    await asegurar(env);
    // Cada tres minutos: lo que pasó en las charlas mientras alguien no estaba sale junto, en un solo correo
    if (ev.cron === '*/3 * * * *') { await despacharNovedades(env); return; }
    const lista = (await env.DB.prepare(`SELECT * FROM personas WHERE pool = 'real' AND completo = 0 AND correo IS NOT NULL AND creada < datetime('now', '-2 days')`).all()).results;
    for (const fila of lista) {
      const P = await persona(env, fila.id);
      const av = avance(P.r);
      // se cuentan preguntas, no partes: la persona sabe que son 43
      await correoA(env, P, 'recordatorio', { faltan: Math.max(1, av.preguntasFaltan), pct: av.pct }, { cadaMinutos: 60 * 24 * 3650 });
    }
    await hitosDelDia(env); // aniversarios de las charlas
    await limpiarSubidas(env); // lo que se quedó a medias no ocupa espacio
    await correosDelDia(env); // coincidencias sin responder, planes de mañana y, los domingos, «Tu semana en Cupido»
    // precio justo: cada 180 días, ¿sigue igual tu situación? (junto con lo que cambia: ciudad, trabajo, hijos)
    const reales = (await env.DB.prepare(`SELECT id FROM personas WHERE pool = 'real' AND correo IS NOT NULL AND completo = 1`).all()).results;
    for (const f of reales) { const P = await persona(env, f.id); let aj = {}; try { aj = JSON.parse(P.ajustes || '{}'); } catch {} const rev = aj.precio_revisado ? Date.parse(aj.precio_revisado) : Date.parse(P.creada + 'Z'); if (Date.now() - rev >= REVISION_DIAS * 86400000) await correoA(env, P, 'revision', {}, { cadaMinutos: 60 * 24 * (REVISION_DIAS - 1) }); }
  },
  async fetch(req, env, ctx) {
    const url = new URL(req.url);
    const ruta = url.pathname.replace(/\/$/, '') || '/';
    let x;
    // Casa única: todo vive en cupido.capitaltorreon.com; la dirección vieja de workers.dev redirige
    if (url.hostname.endsWith('.workers.dev')) return Response.redirect(`https://cupido.capitaltorreon.com${url.pathname}${url.search}`, 301);
    try {
      if ((x = ruta.match(/^\/sonidos\/([a-z_]+)\.mp3$/))) return await servirSonido(env, x[1]); // los sonidos, desde R2, cacheados un año
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
      if ((x = ruta.match(/^\/i\/([a-z0-9]{5,12})$/))) {
        // invitación: se recuerda quién invitó y se va a la entrada
        return new Response(null, { status: 302, headers: { location: new URL('/bienvenida', url).href, 'set-cookie': `cupido_inv=${x[1]}; Path=/; Max-Age=2592000; SameSite=Lax${url.protocol === 'https:' ? '; Secure' : ''}` } });
      }
      if ((x = ruta.match(/^\/entrar\/([a-z0-9]{20,40})$/))) {
        const inv = (req.headers.get('cookie') || '').match(/(?:^|;\s*)cupido_inv=([a-z0-9]{5,12})/)?.[1] || null;
        const r = await canjearEnlace(env, x[1], inv);
        if (!r.ok) return irA(`/entrar?error=${r.motivo}`, url);
        return irA(r.completo ? '/persona' : r.nueva ? '/bienvenida?luego=cuestionario' : '/cuestionario', url, cookieSesion(r.sesion, url));
      }
      if (ruta === '/persona' || ruta === '/cuestionario') {
        // Sin sesión no hay tablero ni cuestionario: a la puerta de entrada. Y sin el recorrido completo, tampoco (no se puede saltar).
        const q = await quien(env, req);
        if (!q) return irA(`/entrar${ruta === '/cuestionario' ? '?luego=cuestionario' : ''}`, url);
        if (!q.sesion.demo) { let aj = {}; try { aj = JSON.parse(q.P.ajustes || '{}'); } catch {} if (!aj.bienvenida) return irA(`/bienvenida${ruta === '/cuestionario' ? '?luego=cuestionario' : ''}`, url); }
      }

      if (ruta === '/correo/baja') return await paginaBaja(env, req, url); // dejar de recibir una categoría, con un clic y sin entrar
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
    let r; try { r = await decidir(env, yo.P.id, String(b.otra || ''), b.decision); } catch (e) { return error(e.message, 404); }
    return json({ ok: true, ...r, vista: await vistaPersona(env, yo.P) });
  }
  if (ruta === '/api/yo/estado' && metodo === 'POST') {
    // la persona pausa o reactiva su perfil ("estoy conociendo a alguien")
    if (!yo) return sinSesion();
    const b = await leerJson(req);
    if (!['activa', 'pausada'].includes(b.estado)) return error('Estado inválido');
    if (!['activa', 'pausada'].includes(yo.P.estado)) return error('Tu cuenta está en revisión. Te avisamos en cuanto alguien del equipo la vea.', 403);
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
    let previo = {}; try { previo = JSON.parse(yo.P.ajustes || '{}'); } catch {}
    const aj = { ...previo, color: COLORES.includes(b.color) ? b.color : previo.color || 'rosa', tipo: TIPOS.includes(b.tipo) ? b.tipo : previo.tipo || 'clasica', bienvenida: b.bienvenida === true || !!previo.bienvenida, avisos_correo: typeof b.avisos_correo === 'boolean' ? b.avisos_correo : previo.avisos_correo !== false };
    if (Number.isInteger(b.bienvenida_paso)) aj.bienvenida_paso = Math.max(0, Math.min(9, b.bienvenida_paso)); // dónde se quedó en el recorrido
    // Aquí manda ella: las reglas de la casa se aceptan una vez; el modo discreta y «decido primero» son de ella
    if (b.reglas === true && !previo.reglas) { aj.reglas = new Date().toISOString(); await anotar(env, 'ella', esHombre(yo.P) ? 'Un hombre aceptó las reglas de la casa' : 'Alguien leyó las reglas de la casa', ''); }
    if (!esHombre(yo.P)) { if (typeof b.discreta === 'boolean') aj.discreta = b.discreta; if (typeof b.primero === 'boolean') aj.primero = b.primero; }
    const pj = limpiarPrecioJusto(b); if (Object.keys(pj).length) { Object.assign(aj, pj); aj.precio_revisado = new Date().toISOString(); await anotar(env, 'programa', 'Una persona actualizó su precio justo', `${aj.banda || 'sin rango'} · ${aj.situacion || 'bien'}`); }
    if (b.bienvenida === true && !previo.bienvenida) aj.bienvenida_fecha = new Date().toISOString();
    if (!(yo.sesion.demo && yo.P.origen === 'demo')) await env.DB.prepare(`UPDATE personas SET ajustes = ? WHERE id = ?`).bind(JSON.stringify(aj), yo.P.id).run();
    return json({ ok: true, ajustes: aj });
  }
  /* ── Mis correos: de inicio llega todo; cada quien apaga lo que no quiera ── */
  if (ruta === '/api/yo/correos') {
    if (!yo) return sinSesion();
    if (metodo === 'GET') return json(await prefsDe(env, yo.P));
    if (metodo === 'POST') { if (yo.sesion.demo && yo.P.origen === 'demo') return error('En la cuenta demo esto no se guarda. Con tu cuenta sí.', 403); return json(await ponerPrefs(env, yo.P, await leerJson(req, 2000))); }
  }
  if (ruta === '/api/yo/correos/prueba' && metodo === 'POST') {
    if (!yo) return sinSesion();
    if (!yo.P.correo || yo.sesion.demo) return error('La cuenta demo no tiene correo. Con tu cuenta sí.', 403);
    const r = await correoA(env, yo.P, 'prueba', {}, { cadaMinutos: 5, forzar: true });
    return r === 'reciente' ? error('Ya te mandamos uno hace un momento. Revisa tu bandeja (y el spam).', 429) : r ? json({ ok: true, correo: yo.P.correo }) : error('No pudimos mandarlo. Intenta de nuevo en un momento.', 502);
  }
  if (ruta === '/api/yo/vida' && metodo === 'POST') {
    // los elementos de su vida, del 0 al 100 %, como ella misma se ve hoy
    if (!yo) return sinSesion();
    const v = limpiarVida(await leerJson(req, 4000));
    if (!(yo.sesion.demo && yo.P.origen === 'demo')) await env.DB.prepare(`UPDATE personas SET vida = ? WHERE id = ?`).bind(JSON.stringify(v), yo.P.id).run();
    return json({ ok: true, vida: v });
  }
  /* ── La charla: solo entre dos con puerta abierta; nada se borra ───────── */
  if (ruta === '/api/charla' && metodo === 'GET') { if (!yo) return sinSesion(); return json(await misCharlas(env, yo.P.id)); }
  if ((x = m(/^\/api\/charla\/([a-z0-9]+)$/))) {
    if (!yo) return sinSesion();
    if (metodo === 'GET') { const v = await verCharla(env, yo.P.id, x[1], Number(url.searchParams.get('despues') || 0), { antes: Number(url.searchParams.get('antes') || 0), desde: Number(url.searchParams.get('desde') || 0), todo: url.searchParams.get('todo') === '1' }); return v ? json(v) : error('No hay una puerta abierta con esa persona', 404); }
    if (metodo === 'POST') { const b = await leerJson(req, 10_000); const r = await enviar(env, yo.P.id, x[1], b); return r.error ? error(r.error, r.status) : json(r); }
  }
  if ((x = m(/^\/api\/charla\/([a-z0-9]+)\/guardar$/)) && metodo === 'POST') { if (!yo) return sinSesion(); const b = await leerJson(req, 2000); const r = await guardar(env, yo.P.id, x[1], b.mensaje); return r.error ? error(r.error, r.status) : json(r); }
  if ((x = m(/^\/api\/charla\/([a-z0-9]+)\/guardados$/)) && metodo === 'GET') { if (!yo) return sinSesion(); const r = await losGuardados(env, yo.P.id, x[1]); return r ? json(r) : error('No hay charla', 404); }
  if ((x = m(/^\/api\/charla\/([a-z0-9]+)\/buscar$/)) && metodo === 'GET') { if (!yo) return sinSesion(); const r = await buscarEnCharla(env, yo.P.id, x[1], url.searchParams.get('q') || '', url.searchParams.get('de') || ''); return r ? json(r) : error('No hay charla', 404); }
  if ((x = m(/^\/api\/charla\/([a-z0-9]+)\/reaccion$/)) && metodo === 'POST') { if (!yo) return sinSesion(); const b = await leerJson(req, 2000); const r = await reaccionar(env, yo.P.id, x[1], b.mensaje, b.emoji); return r.error ? error(r.error, r.status) : json(r); }
  if (ruta === '/api/gif' && metodo === 'GET') { if (!yo) return sinSesion(); return json(await buscarGif(env, url.searchParams.get('q') || '')); }
  if ((x = m(/^\/api\/charla\/([a-z0-9]+)\/ws$/)) && metodo === 'GET') { if (!yo) return new Response('Sin sesión', { status: 401 }); return await conectarVivo(env, req, yo.P.id, x[1]); }
  if ((x = m(/^\/api\/charla\/([a-z0-9]+)\/escribiendo$/)) && metodo === 'POST') { if (!yo) return sinSesion(); const r = await escribiendo(env, yo.P.id, x[1]); return r.error ? error(r.error, r.status) : json(r); }
  if ((x = m(/^\/api\/charla\/([a-z0-9]+)\/archivo$/)) && metodo === 'PUT') {
    if (!yo) return sinSesion();
    if (yo.sesion.demo && yo.P.origen === 'demo') return error('En la cuenta demo no se mandan archivos. Con tu cuenta sí.', 403);
    const r = await adjuntar(env, req, yo.P.id, x[1], url.searchParams.get('nombre')); return r.error ? error(r.error, r.status) : json(r);
  }
  if ((x = m(/^\/api\/charla\/([a-z0-9]+)\/archivo\/(\d+)$/)) && metodo === 'GET') { if (!yo) return new Response('Sin sesión', { status: 401 }); return await servirAdjunto(env, req, yo.P.id, x[1], Number(x[2])); }
  if ((x = m(/^\/api\/charla\/([a-z0-9]+)\/liberar$/)) && metodo === 'POST') { if (!yo) return sinSesion(); const b = await leerJson(req, 4000); const r = await liberar(env, yo.P.id, x[1], b.elementos); return r.error ? error(r.error, r.status) : json(r); }
  if ((x = m(/^\/api\/charla\/([a-z0-9]+)\/perfil$/)) && metodo === 'GET') { if (!yo) return sinSesion(); const r = await perfilCompartido(env, yo.P.id, x[1]); return r ? json(r) : error('No hay charla', 404); }
  /* ── La llamada de voz: solo si ella la autorizó; el audio pasa por Cupido ── */
  if ((x = m(/^\/api\/charla\/([a-z0-9]+)\/llamada$/)) && metodo === 'POST') { if (!yo) return sinSesion(); const b = await leerJson(req, 2000); const r = await llamada(env, yo.P.id, x[1], String(b.accion || '')); return r.error ? error(r.error, r.status) : json(r); }
  if ((x = m(/^\/api\/charla\/([a-z0-9]+)\/voz$/)) && metodo === 'GET') { if (!yo) return new Response('Sin sesión', { status: 401 }); return await conectarVoz(env, req, yo.P.id, x[1]); }
  /* ── La chispa: el tono (dos síes), responder cartas e invitaciones, y el álbum ── */
  if ((x = m(/^\/api\/charla\/([a-z0-9]+)\/tono$/)) && metodo === 'POST') { if (!yo) return sinSesion(); const b = await leerJson(req, 2000); const r = await cambiarTono(env, yo.P.id, x[1], b.tono); return r.error ? error(r.error, r.status) : json(r); }
  if ((x = m(/^\/api\/charla\/([a-z0-9]+)\/responder$/)) && metodo === 'POST') { if (!yo) return sinSesion(); const b = await leerJson(req, 6000); const r = await responderChispa(env, yo.P.id, x[1], b.mensaje, b.valor); return r.error ? error(r.error, r.status) : json(r); }
  if ((x = m(/^\/api\/charla\/([a-z0-9]+)\/album$/)) && metodo === 'GET') { if (!yo) return sinSesion(); const r = await verAlbum(env, yo.P.id, x[1]); return r ? json(r) : error('No hay charla', 404); }
  /* ── Aquí manda ella: controles de la charla, cerrar, bloquear, reportar y «no cruzarme con» ── */
  if ((x = m(/^\/api\/charla\/([a-z0-9]+)\/control$/)) && metodo === 'POST') { if (!yo) return sinSesion(); const b = await leerJson(req, 2000); const r = await ponerControl(env, yo.P, x[1], String(b.k || ''), !!b.v); return r.error ? error(r.error, r.status) : json(r); }
  if ((x = m(/^\/api\/charla\/([a-z0-9]+)\/retirar$/)) && metodo === 'POST') { if (!yo) return sinSesion(); const b = await leerJson(req, 4000); const r = await retirar(env, yo.P.id, x[1], b.elementos); return r.error ? error(r.error, r.status) : json(r); }
  if (ruta === '/api/ella/cerrar' && metodo === 'POST') { if (!yo) return sinSesion(); const b = await leerJson(req, 2000); const r = await cerrarPuerta(env, yo.P, String(b.otra || ''), { borrar: b.borrar === true }); return r.error ? error(r.error, r.status) : json({ ...r, vista: await vistaPersona(env, await persona(env, yo.P.id)) }); }
  if (ruta === '/api/ella/bloquear' && metodo === 'POST') { if (!yo) return sinSesion(); const b = await leerJson(req, 6000); const r = await bloquear(env, yo.P, String(b.otra || ''), { reporte: b.reporte === true, motivo: b.motivo ? String(b.motivo) : null, detalle: String(b.detalle || ''), borrar: b.borrar === true }); return r.error ? error(r.error, r.status) : json({ ok: true, vista: await vistaPersona(env, await persona(env, yo.P.id)) }); }
  if (ruta === '/api/ella/desbloquear' && metodo === 'POST') { if (!yo) return sinSesion(); const b = await leerJson(req, 2000); const r = await desbloquear(env, yo.P, String(b.otra || '')); return r.error ? error(r.error, r.status) : json({ ...r, vista: await vistaPersona(env, await persona(env, yo.P.id)) }); }
  if ((ruta === '/api/ella/evitar' || ruta === '/api/ella/evitar/quitar') && metodo === 'POST') {
    if (!yo) return sinSesion();
    if (yo.sesion.demo) return error('En la cuenta demo esta lista no se guarda. Con tu cuenta sí.', 403);
    const b = await leerJson(req, 2000);
    const r = ruta.endsWith('/quitar') ? await quitarEvitar(env, yo.P, b.huella) : await agregarEvitar(env, yo.P, b.correo);
    return r.error ? error(r.error, r.status) : json(r);
  }
  if (ruta === '/api/admin/seguridad' && metodo === 'GET') return json(await seguridadAdmin(env, await esAdmin(env, yo)));
  if (ruta === '/api/admin/seguridad' && metodo === 'POST') {
    // retirar para siempre o regresar al matching: solo una cuenta administradora (con su enlace mágico)
    if (!(await esAdmin(env, yo))) return error('Esta acción pide entrar con una cuenta administradora.', 403);
    const r = await accionAdmin(env, await leerJson(req, 2000)); return r.error ? error(r.error, r.status) : json(r);
  }
  /* ── Subidas en alta calidad: por partes, sin volver a comprimir (src/subidas.js) ── */
  if (ruta.startsWith('/api/subida')) {
    if (!yo) return sinSesion();
    if (yo.sesion.demo && yo.P.origen === 'demo') return error('En la cuenta demo no se suben archivos. Con tu cuenta sí.', 403);
    let r = null;
    if (ruta === '/api/subida' && metodo === 'POST') r = await empezarSubida(env, yo.P, await leerJson(req, 4000));
    else if ((x = m(/^\/api\/subida\/([a-z0-9]{10,40})\/parte\/(\d{1,4})$/)) && metodo === 'PUT') r = await subirParte(env, yo.P, x[1], Number(x[2]), req);
    else if ((x = m(/^\/api\/subida\/([a-z0-9]{10,40})\/vista$/)) && metodo === 'PUT') r = await subirVista(env, yo.P, x[1], req);
    else if ((x = m(/^\/api\/subida\/([a-z0-9]{10,40})\/fin$/)) && metodo === 'POST') r = await terminarSubida(env, yo.P, x[1], (await leerJson(req, 200_000)).partes);
    else if ((x = m(/^\/api\/subida\/([a-z0-9]{10,40})$/)) && metodo === 'DELETE') r = await cancelarSubida(env, yo.P, x[1]);
    if (r) return r.error ? error(r.error, r.status) : json(r);
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

  /* ── El programa: todo gratis hoy; apoyar es voluntario ─────────────────── */
  if (ruta === '/api/programa' && metodo === 'GET') return json(await verPrograma(env, yo && !yo.sesion.demo ? yo.P : null));
  if (ruta === '/api/admin/sonidos' && metodo === 'GET') return json(await estadoSonidos(env));
  if ((x = m(/^\/api\/admin\/sonidos\/([a-z_]+)\.mp3$/)) && metodo === 'GET') return await servirSonido(env, x[1]); // el original en R2, para bajarlo a public/sonidos
  // Crear un sonido gasta créditos de ElevenLabs y reemplaza el original: solo una cuenta administradora
  if (ruta === '/api/admin/sonidos/generar' && metodo === 'POST') { if (!(await esAdmin(env, yo))) return error('Crear un sonido pide entrar con una cuenta administradora.', 403); const b = await leerJson(req, 2000); const r = await generarSonido(env, String(b.id || '')); return r.error ? error(r.error, r.status) : json(r); }
  if (ruta === '/api/admin/precios' && metodo === 'GET') return json(await distribucionPrecios(env));
  if (ruta === '/api/apoyar' && metodo === 'POST') { if (!yo) return sinSesion(); const b = await leerJson(req, 4000); const r = await apoyar(env, url, yo.P, b); return r.error ? error(r.error, r.status) : json(r); }
  if (ruta === '/api/apoyar/confirmar' && metodo === 'POST') { if (!yo) return sinSesion(); const b = await leerJson(req, 2000); const r = await confirmarApoyo(env, yo.P, b.sid); return r.error ? error(r.error, r.status) : json(r); }
  if (ruta === '/api/admin/programa' && metodo === 'POST') { const b = await leerJson(req, 2000); const r = await ajustarPrograma(env, b); return r.error ? error(r.error, r.status) : json(r); }
  if (ruta === '/api/admin/aportes' && metodo === 'GET') return json(await aportesAdmin(env));

  /* ── Pulir: reacomoda un texto dictado sin cambiar lo que dijo la persona ── */
  if (ruta === '/api/pulir' && metodo === 'POST') {
    if (!yo) return sinSesion();
    if (!env.AI) return error('El pincel no está disponible ahora.', 503);
    const b = await leerJson(req, 20_000);
    const texto = String(b.texto || '').trim().slice(0, 4000), contexto = String(b.contexto || '').slice(0, 200);
    if (texto.length < 40) return error('Escribe o dicta un poco más.');
    const sistema = `Eres un editor discreto de un cuestionario de pareja en español de México. Te dan un texto dictado por una persona. Tu única tarea: devolverlo reacomodado para que se lea claro y fluido, con puntuación y párrafos, QUITANDO muletillas y repeticiones del habla ("este", "o sea", "eh", "como que", frases repetidas). Reglas estrictas: conserva la primera persona, sus palabras, su tono, sus ejemplos y TODOS sus hechos; no agregues ideas, datos, adjetivos ni conclusiones; no resumas ni alargues (largo parecido, como mucho 10 % más corto); no uses tú ni consejos; no expliques nada. Responde solo con el texto final, sin comillas ni comentarios.`;
    try {
      const r = await env.AI.run('@cf/meta/llama-3.3-70b-instruct-fp8-fast', { messages: [{ role: 'system', content: sistema }, { role: 'user', content: `${contexto ? `Pregunta a la que responde: ${contexto}\n\n` : ''}Texto dictado:\n${texto}` }], max_tokens: 1200, temperature: 0.2 });
      const salida = String(r?.response || '').trim().replace(/^["«]+|["»]+$/g, '');
      if (!salida || salida.length < texto.length * 0.5 || salida.length > texto.length * 1.6) return json({ texto }); // si se pasó de listo, se deja tal cual
      await anotar(env, 'persona', 'Se pulió un texto dictado', `${texto.length} → ${salida.length} caracteres`);
      return json({ texto: salida });
    } catch (e) { console.error('pulir', e.message); return error('No se pudo pulir ahora. Intenta de nuevo.', 502); }
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
  // El catálogo y la vista previa son de ejemplo y los ve cualquiera; mandar la serie y ver lo enviado piden cuenta administradora
  if (ruta === '/api/admin/correos/catalogo' && metodo === 'GET') return json({ correos: await catalogoCorreos(env), categorias: CATEGORIAS_CORREO.filter((c) => !c.fijo).length, admin: await esAdmin(env, yo), enviados: (await env.DB.prepare(`SELECT tipo, COUNT(*) AS n, SUM(estado != 'enviado') AS fallas FROM correos WHERE creado > datetime('now', '-30 days') GROUP BY tipo`).all()).results, enEspera: (await env.DB.prepare(`SELECT COUNT(*) AS n FROM novedades`).first()).n });
  if (ruta === '/api/admin/correos/vista' && metodo === 'GET') { const v = await vistaPrevia(env, String(url.searchParams.get('tipo') || ''), String(url.searchParams.get('genero') || 'mujer'), url.searchParams.get('discreto') === '1'); if (v && url.searchParams.get('texto') === '1') return new Response(v.text, { headers: { 'content-type': 'text/plain; charset=utf-8', 'cache-control': 'no-store' } }); return v ? new Response(v.html, { headers: { 'content-type': 'text/html; charset=utf-8', 'cache-control': 'no-store', 'x-asunto': encodeURIComponent(v.asunto), 'x-peso': String(v.peso) } }) : error('No existe ese correo', 404); }
  // Solo en desarrollo (CORREO_SIMULADO): el correo de verdad de una persona de la base local, para probar lo que se busca al armarlo
  if (ruta === '/api/admin/correos/real' && metodo === 'GET' && env.CORREO_SIMULADO) {
    const Pr = await persona(env, String(url.searchParams.get('persona') || '')); if (!Pr) return error('No existe esa persona', 404);
    let d = {}; try { d = JSON.parse(url.searchParams.get('d') || '{}'); } catch {}
    if (d.O) d.O = await persona(env, String(d.O));
    const c = await armar(env, Pr, String(url.searchParams.get('tipo') || ''), d), v = plantillaCorreo(env, c.contenido);
    return new Response(url.searchParams.get('texto') === '1' ? `${c.asunto}\n\n${v.text}` : v.html, { headers: { 'content-type': `text/${url.searchParams.get('texto') === '1' ? 'plain' : 'html'}; charset=utf-8`, 'cache-control': 'no-store', 'x-asunto': encodeURIComponent(c.asunto) } });
  }
  // La revisión corre sobre correos de ejemplo: no enseña nada de nadie
  if (ruta === '/api/admin/correos/revision' && metodo === 'GET') return json(await revisarCorreos(env));
  if (ruta === '/api/admin/correos/muestra' && metodo === 'POST') {
    if (!(await esAdmin(env, yo))) return error('Mandar la serie pide entrar con una cuenta administradora.', 403);
    const b = await leerJson(req, 2000); if (!/^[^\s@]+@[^\s@]+\.[a-z]{2,}$/i.test(String(b.para || ''))) return error('Correo inválido');
    return json(await mandarMuestra(env, String(b.para).toLowerCase(), ['mujer', 'hombre'].includes(b.genero) ? b.genero : 'mujer'));
  }
  if (ruta === '/api/admin/correos/despachar' && metodo === 'POST') { if (!(await esAdmin(env, yo))) return error('Pide una cuenta administradora.', 403); return json({ novedades: await despacharNovedades(env), ...(await correosDelDia(env, { domingo: (await leerJson(req, 500)).semana === true })) }); }
  if (ruta === '/api/admin/correos' && metodo === 'GET') {
    if (!(await esAdmin(env, yo))) return json([]); // quién recibió qué no se enseña sin cuenta administradora
    return json((await env.DB.prepare(`SELECT id, persona, tipo, asunto, estado, creado FROM correos ORDER BY id DESC LIMIT 80`).all()).results);
  }
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
    const actual = await persona(env, x[1]);
    if (!actual || !['activa', 'pausada'].includes(actual.estado)) return error('Esa cuenta está retirada o en revisión: se atiende desde Seguridad.', 403);
    await env.DB.prepare(`UPDATE personas SET estado = ? WHERE id = ?`).bind(b.estado, x[1]).run();
    await anotar(env, 'admin', b.estado === 'pausada' ? 'Se pausó un perfil' : 'Se reactivó un perfil', x[1]);
    await recalcularTodo(env, { avisar: true, motivo: 'estado' });
    return json({ ok: true });
  }
  return error('Ruta no encontrada', 404);
}
// fin · RLR
