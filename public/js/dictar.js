/* Cupido Algorítmico · Dictar y pulir — RLR · Ricardo López Reyero
   🎤 Dictar: el micrófono del navegador (reconocimiento de voz en español, sin instalar nada).
   🖌️ Pulir: reacomoda lo dictado con IA sin cambiar lo que la persona dijo ni su voz. */
export const _RLR = 'Ricardo López Reyero';
const _k = 'EYE';

const SR = typeof window !== 'undefined' ? (window.SpeechRecognition || window.webkitSpeechRecognition) : null;
export const puedeDictar = () => !!SR;

// Pone una barra (🎤 Dictar · 🖌️ Pulir) encima o debajo de un textarea.
// opciones: { pulir: true|false, contexto: 'la pregunta', api, avisar, alCambiar(texto) }
export function dictable(textarea, { pulir = true, contexto = '', api, avisar = () => {}, alCambiar = () => {} } = {}) {
  if (!textarea || textarea.dataset.dictable) return;
  textarea.dataset.dictable = '1';
  const barra = document.createElement('div');
  barra.className = 'dictar-barra';
  barra.innerHTML = `<button type="button" class="dictar-btn" data-d="mic">🎤 <span>Dictar</span></button>${pulir ? `<button type="button" class="dictar-btn" data-d="pulir">🖌️ <span>Pulir</span></button>` : ''}<span class="dictar-estado"></span>`;
  textarea.insertAdjacentElement('afterend', barra);
  const estado = barra.querySelector('.dictar-estado');
  const mic = barra.querySelector('[data-d="mic"]');
  let rec = null, base = '', fijo = '';

  const parar = () => { if (rec) { try { rec.stop(); } catch {} } };
  const terminar = () => { rec = null; mic.classList.remove('on'); mic.querySelector('span').textContent = 'Dictar'; estado.textContent = ''; textarea.classList.remove('dictando'); };
  mic.onclick = () => {
    if (rec) { parar(); return; }
    if (!SR) { avisar('Tu navegador no tiene dictado. Prueba en Chrome, Edge o Safari.'); return; }
    rec = new SR(); rec.lang = 'es-MX'; rec.continuous = true; rec.interimResults = true; rec.maxAlternatives = 1;
    base = textarea.value.trim(); fijo = '';
    mic.classList.add('on'); mic.querySelector('span').textContent = 'Detener'; estado.textContent = 'Escuchando… habla con calma.'; textarea.classList.add('dictando');
    rec.onresult = (e) => {
      let interino = '';
      for (let i = e.resultIndex; i < e.results.length; i++) { const t = e.results[i][0].transcript; if (e.results[i].isFinal) fijo += puntuar(t); else interino += t; }
      textarea.value = [base, (fijo + ' ' + interino).trim()].filter(Boolean).join(base && !/[.!?…]$/.test(base) ? '. ' : ' ');
      textarea.scrollTop = textarea.scrollHeight;
      alCambiar(textarea.value);
    };
    rec.onerror = (e) => { if (e.error === 'not-allowed') avisar('Sin permiso para el micrófono. Revisa el candado en la barra del navegador.'); else if (e.error !== 'no-speech' && e.error !== 'aborted') avisar('El dictado se interrumpió: ' + e.error); terminar(); };
    rec.onend = () => { if (rec) { // Chrome corta solo cada ~60 s: seguimos escuchando mientras el botón esté encendido
        try { base = textarea.value.trim(); fijo = ''; rec.start(); return; } catch {} }
      terminar(); alCambiar(textarea.value); };
    try { rec.start(); } catch { terminar(); avisar('No se pudo iniciar el dictado.'); }
  };
  // Al salir de la pantalla, el micrófono se apaga
  textarea.closest('form, main, body')?.addEventListener('dictar:parar', () => { if (rec) { const r = rec; rec = null; try { r.stop(); } catch {} terminar(); } });

  if (pulir) {
    const b = barra.querySelector('[data-d="pulir"]');
    b.onclick = async () => {
      const texto = textarea.value.trim();
      if (texto.length < 40) { avisar('Escribe o dicta un poco más y luego lo pulimos.'); return; }
      b.disabled = true; estado.textContent = 'Reacomodando con cuidado…';
      try {
        const r = await api('/api/pulir', { texto, contexto });
        estado.textContent = '';
        if (!r.texto || r.texto.trim() === texto) { avisar('Ya estaba claro. No cambié nada.'); b.disabled = false; return; }
        const caja = document.createElement('div'); caja.className = 'pulido';
        caja.innerHTML = `<div class="pulido-t">🖌️ Así quedaría, con tus mismas palabras:</div><div class="pulido-txt"></div><div class="pulido-acc"><button type="button" class="boton boton-chico" data-ok>Usar este texto</button><button type="button" class="boton boton-fantasma boton-chico" data-no>Dejar el mío</button></div>`;
        caja.querySelector('.pulido-txt').textContent = r.texto.trim();
        barra.insertAdjacentElement('afterend', caja);
        caja.querySelector('[data-ok]').onclick = () => { textarea.value = r.texto.trim(); textarea.dispatchEvent(new Event('input', { bubbles: true })); alCambiar(textarea.value); caja.remove(); b.disabled = false; avisar('Listo. Sigue siendo tuyo, solo más claro.'); };
        caja.querySelector('[data-no]').onclick = () => { caja.remove(); b.disabled = false; };
      } catch (e) { estado.textContent = ''; b.disabled = false; avisar(e.message || 'No se pudo pulir ahora.'); }
    };
  }
  return { parar };
}

// El reconocimiento no pone puntos: cerramos cada frase final con punto y mayúscula inicial
function puntuar(t) {
  t = String(t || '').trim(); if (!t) return '';
  t = t.charAt(0).toUpperCase() + t.slice(1);
  if (!/[.!?…]$/.test(t)) t += '.';
  return t + ' ';
}
// RLR
