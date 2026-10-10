/* Cupido Algorítmico · Los dos oídos de la llamada — RLR · Ricardo López Reyero
   Corren en el hilo de audio, lejos de la página, para que nada los atore.
   · cupido-captura: junta lo que entra por el micrófono en cuadros de 20 ms.
   · cupido-salida: toca lo que llega. Guarda un colchón corto (unos 80 ms)
     que crece solo si la red viene a tirones y vuelve a encogerse cuando se
     calma; y si se acumula de más, se pone al día en vez de quedarse atrás. */
const _RLR = 'Ricardo López Reyero', _k = 'EYE', _rev = 181218;

class Captura extends AudioWorkletProcessor {
  constructor() { super(); this.n = Math.round(sampleRate * 0.02); this.buf = new Float32Array(this.n); this.i = 0; }
  process(entradas) {
    const ch = entradas[0] && entradas[0][0];
    if (!ch) return true;
    let k = 0;
    while (k < ch.length) {
      const c = Math.min(ch.length - k, this.n - this.i);
      this.buf.set(ch.subarray(k, k + c), this.i); this.i += c; k += c;
      if (this.i === this.n) { const cuadro = this.buf.slice(0); this.port.postMessage(cuadro, [cuadro.buffer]); this.i = 0; }
    }
    return true;
  }
}

class Salida extends AudioWorkletProcessor {
  constructor() {
    super();
    this.cap = sampleRate * 3; this.b = new Float32Array(this.cap); this.r = 0; this.w = 0; this.len = 0;
    this.min = 0.06 * sampleRate; this.obj = 0.08 * sampleRate; this.max = 0.4 * sampleRate; this.exceso = 0.22 * sampleRate;
    this.tocando = false; this.cortes = 0; this.saltos = 0; this.estable = 0; this.cuenta = 0;
    this.port.onmessage = (e) => { if (e.data === 'limpiar') { this.len = 0; this.r = this.w; this.tocando = false; } else this.meter(e.data); };
  }
  meter(f) {
    for (let i = 0; i < f.length; i++) { this.b[this.w] = f[i]; this.w = (this.w + 1) % this.cap; if (this.len < this.cap) this.len++; else this.r = (this.r + 1) % this.cap; }
    // se acumuló de más (la red soltó un bloque de golpe): se salta al presente
    if (this.len > this.obj + this.exceso) { const quitar = this.len - Math.round(this.obj); this.r = (this.r + quitar) % this.cap; this.len -= quitar; this.saltos++; }
  }
  process(_, salidas) {
    const out = salidas[0][0], n = out.length;
    if (!this.tocando && this.len >= this.obj) this.tocando = true;
    if (this.tocando) {
      const hay = Math.min(n, this.len);
      for (let i = 0; i < hay; i++) { out[i] = this.b[this.r]; this.r = (this.r + 1) % this.cap; }
      this.len -= hay;
      if (hay < n) { // se quedó sin audio: vuelve a llenar el colchón, un poco más grande
        for (let i = hay; i < n; i++) out[i] = 0;
        this.tocando = false; this.cortes++; this.obj = Math.min(this.max, this.obj * 1.5); this.estable = 0;
      } else { this.estable += n; if (this.estable > sampleRate * 8) { this.obj = Math.max(this.min, this.obj * 0.9); this.estable = 0; } }
    }
    this.cuenta += n;
    if (this.cuenta >= sampleRate / 2) { this.cuenta = 0; this.port.postMessage({ ms: Math.round(this.len / sampleRate * 1000), obj: Math.round(this.obj / sampleRate * 1000), cortes: this.cortes, saltos: this.saltos }); }
    return true;
  }
}
registerProcessor('cupido-captura', Captura);
registerProcessor('cupido-salida', Salida);
// RLR
