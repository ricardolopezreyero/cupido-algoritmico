/* ─────────────────────────────────────────────────────────────────────────────
   Cupido Algorítmico · Artículos: publicar sin login, leer bonito, moderar fácil
   Autor: Ricardo López Reyero
   ───────────────────────────────────────────────────────────────────────────── */
// RLR
import { anotar } from './datos.js';

export const _RLR = 'Ricardo López Reyero';
const _rev = 181218;

export const CATEGORIAS = ['Cómo funciona', 'Intimidad', 'Vida interior', 'Conflicto y reparación', 'Proyecto de vida', 'Guías', 'Historias', 'Opinión'];

export const esc = (s) => String(s ?? '').replace(/&/g, '&amp;').replace(/</g, '&lt;').replace(/>/g, '&gt;').replace(/"/g, '&quot;').replace(/'/g, '&#39;');

/* ── Markdown mínimo y seguro: primero se escapa TODO, luego se da formato ── */
export function markdown(src = '') {
  const inline = (t) => esc(t)
    .replace(/\*\*(.+?)\*\*/g, '<strong>$1</strong>')
    .replace(/(^|[^*])\*(?!\s)(.+?)\*(?!\*)/g, '$1<em>$2</em>')
    .replace(/\[([^\]]{1,120})\]\((https?:\/\/[^\s)]{1,300})\)/g, '<a href="$2" rel="nofollow ugc noopener" target="_blank">$1</a>');
  const lineas = String(src).replace(/\r/g, '').split('\n');
  const out = [];
  let parrafo = [], lista = null, cita = [];
  const cerrar = () => {
    if (parrafo.length) { out.push(`<p>${inline(parrafo.join(' '))}</p>`); parrafo = []; }
    if (lista) { out.push(`<ul>${lista.map((li) => `<li>${inline(li)}</li>`).join('')}</ul>`); lista = null; }
    if (cita.length) { out.push(`<blockquote>${cita.map((c) => `<p>${inline(c)}</p>`).join('')}</blockquote>`); cita = []; }
  };
  for (const raw of lineas) {
    const l = raw.trimEnd();
    if (!l.trim()) { cerrar(); continue; }
    let m;
    if ((m = l.match(/^###\s+(.+)/))) { cerrar(); out.push(`<h3>${inline(m[1])}</h3>`); }
    else if ((m = l.match(/^##\s+(.+)/))) { cerrar(); out.push(`<h2>${inline(m[1])}</h2>`); }
    else if ((m = l.match(/^>\s?(.*)/))) { if (parrafo.length || lista) { const c = cita; cita = []; cerrar(); cita = c; } cita.push(m[1]); }
    else if ((m = l.match(/^[-*]\s+(.+)/))) { if (parrafo.length || cita.length) { const li = lista; lista = null; cerrar(); lista = li; } (lista = lista || []).push(m[1]); }
    else { if (lista || cita.length) cerrar(); parrafo.push(l.trim()); }
  }
  cerrar();
  return out.join('\n');
}

const minutos = (txt) => Math.max(1, Math.round(String(txt).split(/\s+/).length / 210));
const slugify = (s) => String(s).normalize('NFD').replace(/[̀-ͯ]/g, '').toLowerCase().replace(/[^a-z0-9]+/g, '-').replace(/^-|-$/g, '').slice(0, 70) || 'articulo';
const fecha = (iso) => new Intl.DateTimeFormat('es-MX', { day: 'numeric', month: 'long', year: 'numeric', timeZone: 'America/Monterrey' }).format(new Date(String(iso).replace(' ', 'T') + 'Z'));

async function hashIp(req) {
  const ip = req.headers.get('cf-connecting-ip') || 'local';
  const buf = await crypto.subtle.digest('SHA-256', new TextEncoder().encode('cupido·' + ip));
  return [...new Uint8Array(buf)].slice(0, 12).map((b) => b.toString(16).padStart(2, '0')).join('');
}

/* ── API ──────────────────────────────────────────────────────────────────── */
export async function listarPublicos(env, { categoria = null, limite = 60 } = {}) {
  const q = categoria
    ? env.DB.prepare(`SELECT id, slug, titulo, resumen, categoria, autor_nombre, destacado, lecturas, creado, length(cuerpo) AS largo FROM articulos WHERE estado = 'publicado' AND categoria = ? ORDER BY destacado DESC, creado DESC LIMIT ?`).bind(categoria, limite)
    : env.DB.prepare(`SELECT id, slug, titulo, resumen, categoria, autor_nombre, destacado, lecturas, creado, length(cuerpo) AS largo FROM articulos WHERE estado = 'publicado' ORDER BY destacado DESC, creado DESC LIMIT ?`).bind(limite);
  return (await q.all()).results;
}

const PALABRAS_ALERTA = /(viagra|casino|cripto|crypto|bitcoin|onlyfans|xxx|porn|escort|pr[eé]stamo|gana dinero|whatsapp\s*\+?\d)/i;

export async function publicar(env, req, body) {
  if (body.sitio_web) return { ok: true, slug: null }; // trampa para robots: fingimos éxito
  const titulo = String(body.titulo || '').trim().slice(0, 140);
  const cuerpo = String(body.cuerpo || '').trim().slice(0, 30000);
  const autor = String(body.autor_nombre || '').trim().slice(0, 60);
  const categoria = CATEGORIAS.includes(body.categoria) ? body.categoria : 'Opinión';
  const errores = [];
  if (titulo.length < 8) errores.push('El título necesita al menos 8 caracteres.');
  if (cuerpo.split(/\s+/).length < 120) errores.push('El artículo necesita al menos 120 palabras.');
  if (autor.length < 2) errores.push('Escribe tu nombre (o cómo quieres firmar).');
  if ((cuerpo.match(/https?:\/\//g) || []).length > 3) errores.push('Máximo 3 enlaces por artículo.');
  if (errores.length) return { ok: false, errores };
  const ip = await hashIp(req);
  const recientes = await env.DB.prepare(`SELECT COUNT(*) AS n FROM articulos WHERE ip_hash = ? AND creado > datetime('now', '-1 hour')`).bind(ip).first();
  if (recientes.n >= 3) return { ok: false, errores: ['Ya publicaste varios artículos en la última hora. Inténtalo más tarde.'] };
  // Lo que huele a spam no se publica solo: queda en revisión para el admin
  const estado = PALABRAS_ALERTA.test(titulo + ' ' + cuerpo) ? 'revision' : 'publicado';
  let slug = slugify(titulo);
  const existe = await env.DB.prepare(`SELECT 1 FROM articulos WHERE slug = ?`).bind(slug).first();
  if (existe) slug = `${slug}-${Date.now().toString(36).slice(-4)}`;
  const resumen = String(body.resumen || '').trim().slice(0, 280) || cuerpo.replace(/[#>*_\-\[\]()]/g, '').split(/\n+/).find((x) => x.trim().length > 40)?.slice(0, 220) || '';
  await env.DB.prepare(`INSERT INTO articulos (slug, titulo, resumen, categoria, cuerpo, autor_nombre, autor_bio, autor_correo, estado, ip_hash) VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?)`)
    .bind(slug, titulo, resumen, categoria, cuerpo, autor, String(body.autor_bio || '').trim().slice(0, 160), String(body.autor_correo || '').trim().slice(0, 120), estado, ip).run();
  await anotar(env, 'articulo', estado === 'publicado' ? 'Se publicó un artículo' : 'Llegó un artículo a revisión', `${titulo} · ${autor}`);
  return { ok: true, slug, estado };
}

export async function moderar(env, id, accion) {
  const cambios = {
    publicar: `UPDATE articulos SET estado = 'publicado' WHERE id = ?`, ocultar: `UPDATE articulos SET estado = 'oculto' WHERE id = ?`,
    destacar: `UPDATE articulos SET destacado = 1 WHERE id = ?`, quitar_destacado: `UPDATE articulos SET destacado = 0 WHERE id = ?`,
  };
  if (!cambios[accion]) throw new Error('Acción inválida');
  await env.DB.prepare(cambios[accion]).bind(id).run();
  const a = await env.DB.prepare(`SELECT titulo FROM articulos WHERE id = ?`).bind(id).first();
  await anotar(env, 'admin', `Artículo: ${accion.replace('_', ' ')}`, a?.titulo || id);
}

/* ── Páginas del servidor (para que se compartan bien por WhatsApp) ───────── */
export function layout({ titulo, descripcion = '', cuerpo, url = '', activo = '' }) {
  return `<!doctype html><html lang="es"><head><meta charset="utf-8">
<meta name="viewport" content="width=device-width,initial-scale=1">
<title>${esc(titulo)}</title>
<meta name="description" content="${esc(descripcion)}">
<meta name="author" content="Ricardo López Reyero"><meta name="rev" content="181218">
<meta property="og:title" content="${esc(titulo)}"><meta property="og:description" content="${esc(descripcion)}"><meta property="og:type" content="article">${url ? `<meta property="og:url" content="${esc(url)}">` : ''}
<link rel="icon" href="/favicon.svg" type="image/svg+xml">
<link rel="preconnect" href="https://fonts.googleapis.com"><link rel="preconnect" href="https://fonts.gstatic.com" crossorigin>
<link href="https://fonts.googleapis.com/css2?family=Fraunces:opsz,wght@9..144,400;9..144,600;9..144,700&family=Inter:wght@400;500;600;700&display=swap" rel="stylesheet">
<link rel="stylesheet" href="/css/cupido.css">
</head><body data-author="RLR">
<!-- RLR · Ricardo López Reyero -->
${barra(activo)}
${cuerpo}
<footer class="pie"><div class="envoltura"><span>💘 Cupido Algorítmico · demo</span><span><a href="/">Inicio</a> · <a href="/articulos">Artículos</a> · <a href="/entrar">Entrar</a> · <a href="/demo">Demo</a> · <a href="/admin">Admin</a></span></div></footer>
</body></html>`;
}

export function barra(activo) {
  const item = (href, txt, id) => `<a href="${href}" class="${activo === id ? 'activo' : ''}">${txt}</a>`;
  return `<header class="barra"><div class="envoltura barra-in">
  <a class="marca" href="/"><span class="corazon">💘</span><b>Cupido Algorítmico</b></a>
  <nav class="menu">${item('/demo', 'Ver el demo', 'demo')}${item('/articulos', 'Artículos', 'articulos')}</nav>
  <a class="boton boton-chico" href="/entrar">Ingresar</a>
</div></header>`;
}

export async function paginaLista(env, url) {
  const cat = url.searchParams.get('categoria');
  const categoria = CATEGORIAS.includes(cat) ? cat : null;
  const lista = await listarPublicos(env, { categoria });
  const destacado = !categoria ? lista.find((a) => a.destacado) : null;
  const resto = lista.filter((a) => a !== destacado);
  const tarjeta = (a) => `<a class="art-tarjeta" href="/articulos/${esc(a.slug)}">
    <span class="chip">${esc(a.categoria)}</span>
    <h3>${esc(a.titulo)}</h3>
    <p>${esc(a.resumen)}</p>
    <span class="art-meta">${esc(a.autor_nombre)} · ${Math.max(1, Math.round(a.largo / 6 / 210))} min · ${fecha(a.creado)}</span>
  </a>`;
  const cuerpo = `<main class="envoltura art-lista">
  <section class="art-hero">
    <p class="eyebrow">Artículos</p>
    <h1>Lo que se aprende buscando en serio</h1>
    <p class="lead">Ciencia de la pareja, historias y guías — escritas por el equipo y por cualquier persona que tenga algo verdadero que contar.</p>
    <a class="boton" href="/articulos/escribir">Escribir un artículo</a>
  </section>
  <nav class="chips-filtro">${['Todas', ...CATEGORIAS].map((c) => {
    const on = (c === 'Todas' && !categoria) || c === categoria;
    return `<a class="chip ${on ? 'on' : ''}" href="/articulos${c === 'Todas' ? '' : '?categoria=' + encodeURIComponent(c)}">${esc(c)}</a>`;
  }).join('')}</nav>
  ${destacado ? `<a class="art-destacado" href="/articulos/${esc(destacado.slug)}">
    <span class="chip">${esc(destacado.categoria)} · Destacado</span>
    <h2>${esc(destacado.titulo)}</h2><p>${esc(destacado.resumen)}</p>
    <span class="art-meta">${esc(destacado.autor_nombre)} · ${fecha(destacado.creado)}</span></a>` : ''}
  <section class="art-grid">${resto.map(tarjeta).join('') || '<p class="vacio">Todavía no hay artículos en esta categoría. <a href="/articulos/escribir">Escribe el primero</a>.</p>'}</section>
</main>`;
  return new Response(layout({ titulo: 'Artículos · Cupido Algorítmico', descripcion: 'Ciencia de la pareja, historias y guías para buscar pareja en serio.', cuerpo, url: url.href, activo: 'articulos' }), { headers: { 'content-type': 'text/html; charset=utf-8' } });
}

export async function paginaArticulo(env, url, slug) {
  const a = await env.DB.prepare(`SELECT * FROM articulos WHERE slug = ?`).bind(slug).first();
  if (!a || a.estado === 'oculto') return new Response(layout({ titulo: 'No encontrado · Cupido Algorítmico', cuerpo: `<main class="envoltura art-vacio"><h1>Este artículo no existe o ya no está publicado.</h1><p><a class="boton" href="/articulos">Ver artículos</a></p></main>` }), { status: 404, headers: { 'content-type': 'text/html; charset=utf-8' } });
  await env.DB.prepare(`UPDATE articulos SET lecturas = lecturas + 1 WHERE id = ?`).bind(a.id).run();
  const relacionados = (await env.DB.prepare(`SELECT slug, titulo, categoria FROM articulos WHERE estado = 'publicado' AND id != ? ORDER BY (categoria = ?) DESC, destacado DESC, creado DESC LIMIT 3`).bind(a.id, a.categoria).all()).results;
  const aviso = a.estado === 'revision' ? `<div class="aviso-revision">Este artículo está en revisión: solo lo ve quien tiene el enlace.</div>` : '';
  const cuerpo = `<main class="art-leer">
  <article class="envoltura-texto">
    ${aviso}
    <a class="volver" href="/articulos">← Artículos</a>
    <span class="chip">${esc(a.categoria)}</span>
    <h1>${esc(a.titulo)}</h1>
    ${a.resumen ? `<p class="lead">${esc(a.resumen)}</p>` : ''}
    <div class="autor"><span class="avatar" style="background:#d6455f">${esc(a.autor_nombre.slice(0, 1))}</span>
      <div><b>${esc(a.autor_nombre)}</b>${a.autor_bio ? `<span>${esc(a.autor_bio)}</span>` : ''}<span>${fecha(a.creado)} · ${minutos(a.cuerpo)} min de lectura</span></div></div>
    <div class="prosa">${markdown(a.cuerpo)}</div>
  </article>
  <section class="envoltura-texto art-cierre">
    <div class="caja-cta"><h3>¿Buscas en serio?</h3><p>43 preguntas, una sola vez. Si alguien cruza el 90 % contigo, te avisamos — y la puerta solo se abre si los dos dicen que sí.</p><a class="boton" href="/cuestionario">Responder el cuestionario</a> <a class="boton boton-claro" href="/articulos/escribir">Escribir un artículo</a></div>
    ${relacionados.length ? `<h3 class="rel-t">Sigue leyendo</h3><div class="rel">${relacionados.map((r) => `<a href="/articulos/${esc(r.slug)}"><span class="chip">${esc(r.categoria)}</span><b>${esc(r.titulo)}</b></a>`).join('')}</div>` : ''}
  </section>
</main>`;
  return new Response(layout({ titulo: `${a.titulo} · Cupido Algorítmico`, descripcion: a.resumen || a.titulo, cuerpo, url: url.href, activo: 'articulos' }), { headers: { 'content-type': 'text/html; charset=utf-8' } });
}
// fin · RLR
