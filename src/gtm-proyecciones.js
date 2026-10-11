/* ─────────────────────────────────────────────────────────────────────
   Cupido Algorítmico · Proyecciones (/gtm → Proyecciones)
   RLR · Ricardo López Reyero
   Los próximos 18 años en dos curvas: lo que entra y lo que se gasta.
   No es un pronóstico: es la consecuencia de los supuestos de este archivo.
   Sale de lo que ya está razonado en el plan y no inventa una escalera nueva:

     usuarios  hasta 2030, los puntos de control de gtm-tareas.js (la escalera).
               De 2031 en adelante se crece cada año un poco menos, hacia un techo.
     ingreso   usuarios × pesos por usuario al mes (POR_USUARIO): 2 mientras todo
               es gratis, 40 desde que cobra el programa.
     gastos    mientras no se cobra, montos fijos tomados del plan (el tope de
               arranque, quien ejecuta, el equipo de cinco, la verificación). Si el
               cobro se recorre, esos montos crecen con la gente: sin cobrar siempre se pierde.
               Desde que se cobra, cada renglón es una parte del ingreso.

   La cuenta se hace mes por mes y se entrega por año. Todo en pesos de hoy.
   Se prueba con scripts/pruebas-proyecciones.mjs.
   ───────────────────────────────────────────────────────────────────── */
import { CONTROLES, POR_USUARIO } from './gtm-tareas.js';

export const _RLR = 'Ricardo López Reyero';
const _k = 'EYE', _rev = 181218;

export const MODELO = {
  desde: 2026, mes: 10,          // la cuenta arranca en octubre de 2026, con la casa lista
  hasta: 2044,                   // 2026 es el arranque (tres meses); de 2027 a 2044 son los 18 años
  ritmo: 0.45,                   // después de 2030: cada año se llena 45 % de lo que se podría crecer rumbo al techo
  cobro: 0.08,                   // tarjeta y devoluciones, sobre todo lo que entra
  verificacion: 15,              // pesos por perfil nuevo mientras no se cobra (identidad): «por cotizar» en el plan
  tamano2027: 100000,            // los montos de 2027 están pensados para cien mil usuarios: si se sigue sin cobrar con más gente, crecen en proporción
  // Los gastos. [clave, nombre, parte del ingreso desde que se cobra, al mes en 2026, al mes en 2027 (y piso después), de dónde sale]
  renglones: [
    ['equipo', 'Equipo', 0.25, 45000, 180000, '2026: quien ejecuta el plan (supuesto; el plan lo deja «por definir»). 2027: se suman confianza y seguridad y el equipo central de cinco.'],
    ['crecer', 'Crecimiento y comunidad', 0.18, 35000, 90000, '2026: el tope de arranque del plan, $105,000 en 90 días. 2027: ese tope más abrir nueve ciudades a unos $70,000 cada una (supuesto). Después, la misma parte de su ingreso que gasta el grupo dueño de Tinder.'],
    ['cuidado', 'Cuidado y seguridad', 0.12, 0, 20000, 'Verificación de identidad ($15 por perfil nuevo, supuesto: el plan la deja «por cotizar»), reportes, soporte, asesoría de psicología y abogado.'],
    ['tecnologia', 'Tecnología', 0.07, 3000, 10000, 'Servidores, correo y herramientas. Hoy cuesta casi nada; crece con la gente.'],
  ],
  // Tres maneras de mirar el mismo futuro. escalera: qué tanto de cada punto de control se logra · techo: usuarios al mes al final
  escenarios: [
    { id: 'prudente', nombre: 'Prudente', escalera: 0.4, cobra: 2029, porUsuario: 25, techo: 12e6,
      nota: 'Se logra 40 % de cada escalón (4 millones en 2030), el cobro se recorre a 2029, cada usuario deja $25 al mes y el techo son 12 millones.' },
    { id: 'plan', nombre: 'El plan', escalera: 1, cobra: 2028, porUsuario: POR_USUARIO.programa, techo: 30e6,
      nota: 'Se cumplen los puntos de control (10 millones en 2030), el programa cobra desde 2028, cada usuario deja $40 al mes y el techo son 30 millones.' },
    { id: 'ambicioso', nombre: 'Ambicioso', escalera: 1.3, cobra: 2028, porUsuario: 50, techo: 45e6,
      nota: 'Se logra 130 % de cada escalón (13 millones en 2030), cada usuario deja $50 al mes y el techo son 45 millones.' },
  ],
};

// Qué pasa cada año según el plan escrito (Resumen → «De mil a diez millones» y «Los cinco pasos»). Después de 2030 no hay plan: solo la curva
export const HITOS = {
  2026: 'La casa lista y las primeras mil en La Laguna',
  2027: 'El Gran Cruce y diez ciudades de México',
  2028: 'México completo y los hispanos de Estados Unidos',
  2029: 'Colombia, Argentina, Chile, Perú y España',
  2030: 'El mundo que habla español',
};

export const SUPUESTOS_PROYECCION = [
  '**Usuarios, hasta 2030:** la escalera del plan, punto de control por punto de control. No hay una meta nueva: es la misma de Tareas.',
  '**Usuarios, de 2031 en adelante:** ya no hay plan escrito, así que se supone un techo y que cada año se crece menos. En «El plan» el techo son 30 millones de usuarios al mes: cerca de uno de cada siete adultos sin pareja que hablan español (unos 200 millones, estimación propia y gruesa: los 635.7 millones del Instituto Cervantes con la proporción que el INEGI mide en México). Para comparar: hoy en México usan una app de citas 8.6 de 47.5 millones de adultos sin pareja, casi uno de cada cinco.',
  '**Ingreso:** usuarios por pesos por usuario al mes. Dos pesos mientras todo es gratis (apoyos voluntarios) y cuarenta desde que cobra el programa. Se dejan los cuarenta fijos los 18 años: con el tiempo pesa menos la entrada y más «Mientras esperas», las puertas, el acompañamiento y las comunidades propias.',
  '**Gastos antes de cobrar:** salen del plan. El tope de arranque ($105,000 en 90 días, sin sueldos), quien ejecuta, el equipo central de cinco de la fase 4 y la verificación de identidad. Los sueldos y la verificación son supuestos: el plan los deja por definir y por cotizar. Con apoyos voluntarios nunca alcanza: si el cobro se recorre, cada mes sin cobrar cuesta más que el anterior.',
  '**Gastos desde que se cobra:** 70 de cada 100 pesos que entran. Equipo 25, crecimiento y comunidad 18, cuidado y seguridad 12, cobro con tarjeta y devoluciones 8, tecnología 7. Quedan 30 antes de impuestos. Para comparar: al grupo dueño de Tinder le quedaron cerca de 25 de cada 100 en 2025, y gastó 18 en mercadotecnia ([informe anual 2025](https://www.sec.gov/Archives/edgar/data/891103/000089110326000025/mtch-20251231.htm)).',
  '**Lo que no está:** impuestos, inflación (todo va en pesos de hoy), dinero de inversionistas y la comisión de las tiendas de apps. Si un día se cobra dentro de la app de Apple o de Google, ellos se quedan entre 15 y 30 de cada 100 pesos y lo que queda baja en esa medida. El plan supone cobrar en la web.',
  '**Es un mapa, no una promesa.** Cada diciembre se cambia lo supuesto por lo real y se vuelve a correr. Lo de 2028 en adelante depende de un dato que todavía no existe: cuánto paga de verdad cada usuario.',
];

/* ── la cuenta ────────────────────────────────────────────────────────── */
const diasDe = (a, m) => new Date(Date.UTC(a, m, 0)).getUTCDate();
// El tiempo se mide en meses desde enero del año de arranque: el último día de octubre de 2026 es 10
const tiempoDe = (iso, desde) => { const [a, m, d] = iso.split('-').map(Number); return (a - desde) * 12 + (m - 1) + d / diasDe(a, m); };

// Usuarios al cierre de cada diciembre después de 2030: se crece sobre lo que falta para llenar el techo
function haciaElTecho(u, techo, ritmo) { return u >= techo ? u : u + ritmo * u * (1 - u / techo); }

export function proyectar(e, M = MODELO) {
  // 1 · las anclas: cada punto de control y, después de 2030, cada diciembre
  const anclas = CONTROLES.map((c) => [tiempoDe(c[3], M.desde), c[4] * e.escalera]);
  const ultimo = Number(CONTROLES[CONTROLES.length - 1][3].slice(0, 4));
  let u = anclas[anclas.length - 1][1];
  for (let a = ultimo + 1; a <= M.hasta; a++) { u = haciaElTecho(u, e.techo, M.ritmo); anclas.push([(a - M.desde) * 12 + 12, u]); }
  // entre dos anclas se crece parejo en porcentaje (no en personas): así se comporta algo que se duplica
  const usuariosEn = (t) => {
    if (t <= anclas[0][0]) return anclas[0][1];
    for (let i = 1; i < anclas.length; i++) {
      const [t0, u0] = anclas[i - 1], [t1, u1] = anclas[i];
      if (t <= t1) return u0 * Math.pow(u1 / u0, (t - t0) / (t1 - t0));
    }
    return anclas[anclas.length - 1][1];
  };

  // 2 · mes por mes
  const filas = [], piso = { suma: 0, anio: 0, mes: 0 };
  let antes = 0, acumulado = 0, primerMesBueno = null;
  for (let a = M.desde; a <= M.hasta; a++) {
    const cobra = a >= e.cobra, porUsuario = cobra ? e.porUsuario : POR_USUARIO.voluntario;
    const f = { anio: a, cobra, porUsuario, usuarios: 0, ingresoMes: 0, ingreso: 0, gastos: 0, partes: { cobro: 0 } };
    for (const r of M.renglones) f.partes[r[0]] = 0;
    for (let m = a === M.desde ? M.mes : 1; m <= 12; m++) {
      const usuarios = usuariosEn((a - M.desde) * 12 + m), nuevos = Math.max(0, usuarios - antes), ingreso = usuarios * porUsuario;
      let gastos = ingreso * M.cobro; f.partes.cobro += ingreso * M.cobro;
      for (const [clave, , parte, en2026, en2027] of M.renglones) {
        // mientras no se cobra: el monto del plan (y si pasa 2027 sin cobrar, crece con la gente). Desde que se cobra: su parte del ingreso, nunca menos que lo de 2027
        let g = a === M.desde ? en2026 : en2027 * (a > M.desde + 1 && !cobra ? Math.max(1, usuarios / M.tamano2027) : 1);
        if (clave === 'cuidado') g += M.verificacion * nuevos;
        if (cobra) g = Math.max(g, parte * ingreso);
        f.partes[clave] += g; gastos += g;
      }
      f.ingreso += ingreso; f.gastos += gastos; f.usuarios = usuarios; f.ingresoMes = ingreso;
      acumulado += ingreso - gastos; antes = usuarios;
      if (acumulado < piso.suma) Object.assign(piso, { suma: acumulado, anio: a, mes: m });
      if (!primerMesBueno && ingreso > gastos) primerMesBueno = { anio: a, mes: m };
    }
    f.queda = f.ingreso - f.gastos; f.acumulado = acumulado;
    for (const k of Object.keys(f)) if (typeof f[k] === 'number') f[k] = Math.round(f[k]);
    for (const k of Object.keys(f.partes)) f.partes[k] = Math.round(f.partes[k]);
    filas.push(f);
  }
  const bueno = filas.find((f) => f.queda > 0), sale = filas.find((f) => f.acumulado > 0 && f.anio >= piso.anio);
  return {
    id: e.id, nombre: e.nombre, nota: e.nota, cobra: e.cobra, porUsuario: e.porUsuario, techo: e.techo, filas,
    // lo más hondo del acumulado: el dinero que hace falta poner antes de que Cupido se pague solo
    hacenFalta: Math.round(-piso.suma), fondoEn: { anio: piso.anio, mes: piso.mes },
    primerMesBueno, primerAnioBueno: bueno ? bueno.anio : null, recuperaEn: sale ? sale.anio : null,
  };
}

/* ── lo que se le manda a la página ───────────────────────────────────── */
export function proyecciones() {
  return {
    desde: MODELO.desde, hasta: MODELO.hasta, anios: MODELO.hasta - MODELO.desde,
    escenarios: MODELO.escenarios.map((e) => proyectar(e)),
    renglones: [...MODELO.renglones.map(([clave, nombre, parte, en2026, en2027, de]) => ({ clave, nombre, parte, en2026, en2027, de })),
      { clave: 'cobro', nombre: 'Cobro con tarjeta y devoluciones', parte: MODELO.cobro, en2026: null, en2027: null, de: 'Sobre todo lo que entra, desde el primer peso: la comisión de la tarjeta y lo que se devuelve sin preguntas en 15 días.' }],
    verificacion: MODELO.verificacion, hitos: HITOS, planHasta: Number(CONTROLES[CONTROLES.length - 1][3].slice(0, 4)),
    supuestos: SUPUESTOS_PROYECCION,
  };
}
