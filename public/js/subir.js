/* ─────────────────────────────────────────────────────────────────────────────
   Cupido Algorítmico · Subir en alta calidad — RLR · Ricardo López Reyero
   Reglas: lo que la persona manda llega en la calidad en que lo mandó. La
   foto se guarda a resolución completa (hasta 4096 px), el audio y el video
   viajan tal cual, sin volver a comprimirse, cortados en partes que se
   reintentan solas. Lo único que se quita es la ubicación: una foto o un
   video nunca deben decir desde dónde se tomaron.
   ───────────────────────────────────────────────────────────────────────────── */
export const _RLR = 'Ricardo López Reyero';
const _k = 'EYE', _rev = 181218;

const MB = 1024 * 1024;
export const legible = (n) => (n >= 1024 * MB ? `${(n / 1024 / MB).toFixed(1)} GB` : n >= MB ? `${(n / MB).toFixed(n >= 10 * MB ? 0 : 1)} MB` : `${Math.max(1, Math.round(n / 1024))} KB`);
export const duracionTxt = (s) => { s = Math.round(s || 0); const m = Math.floor(s / 60); return `${m}:${String(s % 60).padStart(2, '0')}`; };

/* ── grabar: micrófono sin filtros que ensucien y a una tasa alta ────────── */
// Sin cancelación de eco ni supresión de ruido (son las que dejan la voz "de lata"); el nivel sí se cuida solo.
export const MICROFONO = { echoCancellation: false, noiseSuppression: false, autoGainControl: true, channelCount: { ideal: 2 }, sampleRate: { ideal: 48000 }, sampleSize: { ideal: 24 } };
export const CAMARA = { facingMode: 'user', width: { ideal: 1920 }, height: { ideal: 1080 }, frameRate: { ideal: 30 } };
export const TASA_AUDIO = 256000;   // bits por segundo
export const TASA_VIDEO = 8000000;
export const mimeDeGrabacion = (tipo) => (tipo === 'audio' ? ['audio/mp4;codecs=mp4a.40.2', 'audio/mp4', 'audio/webm;codecs=opus', 'audio/webm'] : ['video/mp4;codecs=avc1.640028,mp4a.40.2', 'video/mp4', 'video/webm;codecs=vp9,opus', 'video/webm'])
  .find((m) => window.MediaRecorder && MediaRecorder.isTypeSupported(m));
export function grabadora(stream, tipo) {
  const mime = mimeDeGrabacion(tipo);
  const op = { audioBitsPerSecond: TASA_AUDIO, ...(tipo === 'video' ? { videoBitsPerSecond: TASA_VIDEO } : {}), ...(mime ? { mimeType: mime } : {}) };
  try { return new MediaRecorder(stream, op); } catch { return new MediaRecorder(stream, mime ? { mimeType: mime } : {}); }
}

/* ── fotos: resolución completa, sin ubicación, y una vista ligera ──────── */
const aJpeg = (bmp, max, q) => new Promise((res) => {
  const k = Math.min(1, max / Math.max(bmp.width, bmp.height));
  const c = document.createElement('canvas'); c.width = Math.round(bmp.width * k); c.height = Math.round(bmp.height * k);
  const x = c.getContext('2d'); x.fillStyle = '#fff'; x.fillRect(0, 0, c.width, c.height); x.imageSmoothingQuality = 'high'; x.drawImage(bmp, 0, 0, c.width, c.height);
  c.toBlob((b) => res(b ? { blob: b, ancho: c.width, alto: c.height } : null), 'image/jpeg', q);
});
// Devuelve { cuerpo, mime, vista, ancho, alto }. Al redibujarla se van los datos ocultos de la foto (entre ellos, dónde se tomó).
export async function prepararFoto(archivo, { max = 4096, calidad = 0.93, vistaMax = 720 } = {}) {
  const bmp = await createImageBitmap(archivo).catch(() => null);
  if (!bmp) return { cuerpo: archivo, mime: (archivo.type || 'image/jpeg').split(';')[0], vista: null };
  const vista = (await aJpeg(bmp, vistaMax, 0.8))?.blob || null;
  if (archivo.type === 'image/gif') return { cuerpo: archivo, mime: 'image/gif', vista, ancho: bmp.width, alto: bmp.height }; // un GIF animado se manda tal cual
  const hd = await aJpeg(bmp, max, calidad);
  if (!hd) return { cuerpo: archivo, mime: (archivo.type || 'image/jpeg').split(';')[0], vista };
  return { cuerpo: hd.blob, mime: 'image/jpeg', vista, ancho: hd.ancho, alto: hd.alto };
}

/* ── video: un cuadro como cartel, la duración y el tamaño ──────────────── */
export function cartelDeVideo(blob, vistaMax = 720) {
  return new Promise((res) => {
    const v = document.createElement('video'); const url = URL.createObjectURL(blob);
    let listo = false; const fin = (r) => { if (listo) return; listo = true; clearTimeout(t); URL.revokeObjectURL(url); res(r || {}); };
    const t = setTimeout(() => fin({}), 6000);
    v.muted = true; v.playsInline = true; v.preload = 'auto'; v.src = url;
    v.onerror = () => fin({});
    v.onloadeddata = () => { try { v.currentTime = Math.min(1, (v.duration || 2) / 3); } catch { fin({}); } };
    v.onseeked = async () => {
      try {
        const k = Math.min(1, vistaMax / Math.max(v.videoWidth, v.videoHeight));
        const c = document.createElement('canvas'); c.width = Math.round(v.videoWidth * k); c.height = Math.round(v.videoHeight * k);
        c.getContext('2d').drawImage(v, 0, 0, c.width, c.height);
        c.toBlob((b) => fin({ vista: b, ancho: v.videoWidth, alto: v.videoHeight, duracion: Number.isFinite(v.duration) ? v.duration : null }), 'image/jpeg', 0.8);
      } catch { fin({}); }
    };
  });
}
export function duracionDeAudio(blob) {
  return new Promise((res) => { const a = document.createElement('audio'); const url = URL.createObjectURL(blob); const fin = (d) => { URL.revokeObjectURL(url); res(Number.isFinite(d) ? d : null); }; const t = setTimeout(() => fin(null), 4000); a.preload = 'metadata'; a.onloadedmetadata = () => { clearTimeout(t); fin(a.duration); }; a.onerror = () => { clearTimeout(t); fin(null); }; a.src = url; });
}

/* ── quitarle la ubicación a un video (MP4/MOV) sin tocar ni un cuadro ───── */
// Los teléfonos guardan dónde se grabó como un texto del estilo +25.5428-103.4068 dentro de la cabecera (moov).
// Se pone en ceros ese texto, del mismo largo, así que el video queda idéntico: misma imagen, mismo sonido, mismo peso.
export async function sinUbicacion(blob) {
  try {
    if (!/^(video\/(mp4|quicktime|x-m4v)|audio\/(mp4|x-m4a))/.test(blob.type || '')) return blob;
    const total = blob.size; let off = 0;
    while (off + 8 <= total) {
      const cab = new DataView(await blob.slice(off, off + 16).arrayBuffer());
      let tam = cab.getUint32(0), cabTam = 8;
      const tipo = String.fromCharCode(cab.getUint8(4), cab.getUint8(5), cab.getUint8(6), cab.getUint8(7));
      if (tam === 1 && cab.byteLength >= 16) { tam = Number(cab.getBigUint64(8)); cabTam = 16; } else if (tam === 0) tam = total - off;
      if (tam < cabTam) break;
      if (tipo === 'moov') {
        if (tam > 96 * MB) return blob;
        const b = new Uint8Array(await blob.slice(off, off + tam).arrayBuffer());
        const dig = (c) => c >= 48 && c <= 57, signo = (c) => c === 43 || c === 45;
        let cambios = 0;
        for (let i = 0; i < b.length - 13; i++) {
          if (!signo(b[i]) || !dig(b[i + 1]) || !dig(b[i + 2]) || b[i + 3] !== 46) continue;
          let j = i + 4, d = 0; while (dig(b[j])) { j++; d++; }
          if (d < 2 || !signo(b[j]) || !dig(b[j + 1]) || !dig(b[j + 2]) || !dig(b[j + 3]) || b[j + 4] !== 46) continue;
          let k = j + 5; d = 0; while (dig(b[k])) { k++; d++; }
          if (d < 2) continue;
          if (signo(b[k])) { k++; while (dig(b[k]) || b[k] === 46) k++; } // altitud
          for (let z = i + 1; z < k; z++) if (dig(b[z])) b[z] = 48;
          cambios++; i = k;
        }
        return cambios ? new Blob([blob.slice(0, off), b, blob.slice(off + tam)], { type: blob.type }) : blob;
      }
      off += tam;
    }
  } catch { /* si algo no cuadra, el archivo va como llegó */ }
  return blob;
}

/* ── la subida por partes ────────────────────────────────────────────────── */
function poner(url, cuerpo, tipo, alAvance) {
  return new Promise((res, rej) => {
    const x = new XMLHttpRequest(); x.open('PUT', url); x.setRequestHeader('content-type', tipo);
    x.upload.onprogress = (e) => alAvance && alAvance(e.loaded);
    x.onload = () => { let j = null; try { j = JSON.parse(x.responseText); } catch {} if (x.status >= 200 && x.status < 300) res(j); else rej(Object.assign(new Error(j?.error || 'Algo falló'), { status: x.status })); };
    x.onerror = () => rej(Object.assign(new Error('Se cortó la conexión. Revisa tu internet.'), { status: 0 }));
    x.send(cuerpo);
  });
}
const json = async (ruta, metodo, datos) => { const r = await fetch(ruta, { method: metodo, headers: datos ? { 'content-type': 'application/json' } : {}, body: datos ? JSON.stringify(datos) : undefined }); let j = null; try { j = await r.json(); } catch {} if (!r.ok) throw Object.assign(new Error(j?.error || 'Algo falló'), { status: r.status }); return j; };
const espera = (ms) => new Promise((r) => setTimeout(r, ms));
// inicio = { destino: 'charla', otra, nombre } o { destino: 'medio', tipo }; extra = { vista, ancho, alto, duracion }
export async function subirPorPartes(inicio, cuerpo, { mime, vista = null, ancho = null, alto = null, duracion = null, alProgreso = null } = {}) {
  const tipo = (mime || cuerpo.type || 'application/octet-stream').split(';')[0];
  const s = await json('/api/subida', 'POST', { ...inicio, mime: tipo, tamano: cuerpo.size, ancho, alto, duracion });
  try {
    const n = s.partes, partes = [], avance = new Array(n + 1).fill(0);
    const pintar = () => alProgreso && alProgreso(Math.min(1, avance.reduce((x, y) => x + y, 0) / cuerpo.size));
    let sig = 1;
    const obrero = async () => {
      while (sig <= n) {
        const k = sig++, trozo = cuerpo.slice((k - 1) * s.parte, Math.min(cuerpo.size, k * s.parte));
        for (let intento = 1; ; intento++) {
          try { const r = await poner(`/api/subida/${s.id}/parte/${k}`, trozo, 'application/octet-stream', (c) => { avance[k] = c; pintar(); }); avance[k] = trozo.size; pintar(); partes.push({ n: k, etag: r.etag }); break; }
          catch (e) { avance[k] = 0; if (intento >= 4 || [401, 403, 404, 413, 415].includes(e.status)) throw e; await espera(800 * 2 ** intento); }
        }
      }
    };
    await Promise.all(Array.from({ length: Math.min(3, n) }, obrero));
    if (vista) { try { await poner(`/api/subida/${s.id}/vista`, vista, 'image/jpeg'); } catch { /* sin vista también vale */ } }
    return await json(`/api/subida/${s.id}/fin`, 'POST', { partes });
  } catch (e) { fetch(`/api/subida/${s.id}`, { method: 'DELETE' }).catch(() => {}); throw e; }
}
// RLR
