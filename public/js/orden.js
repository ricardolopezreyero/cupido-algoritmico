/* ─────────────────────────────────────────────────────────────────────────────
   Cupido Algorítmico · El orden de publicación
   Autor: Ricardo López Reyero · RLR

   Todas las frases, en el orden en que conviene publicarlas. Cada renglón es un
   día: tres publicaciones. La primera de la lista es la primera que sale.

   Cómo está pensado cada día: un gancho que detiene el dedo (una verdad
   incómoda, una pregunta o «lo contrario»), una del corazón (ella manda, lo que
   se siente, en serio, los dos síes) y una prueba (cómo funciona, los números,
   sin publicidad, para él, para invitar). El gancho cambia de columna cada día.

   Cada entrada es la clave de la frase y, si no va en blanco, su fondo:
   'clave' · 'clave/negro' · 'clave/rosa'. Las verdades incómodas van en negro y
   la regla de la casa en rosa; lo demás, texto negro sobre blanco.

   Esta lista ES el calendario: se edita a mano (mover, cambiar un fondo). Una
   frase nueva que no esté aquí sale sola al final; una que se quite, se salta.
   Se armó con scripts/armar-orden.mjs; volver a correrlo rehace todo el calendario.
   ───────────────────────────────────────────────────────────────────────────── */
import { FRASES, FRASE } from './frases.js';
const _RLR = 'Ricardo López Reyero', _k = 'EYE', _rev = 181218;

const LISTA = [
  'pareja-ideal', 'mandan/rosa', 'noventa',                                      // día 1
  'diez-dimensiones', 'entre-pocos/negro', 'mereces',                            // día 2
  'en-serio', 'tres-pasos', 'otra-app',                                          // día 3
  'divorcios-100/negro', 'dos-sies', 'sin-publicidad',                           // día 4
  'compartas', 'verdad-gana', 'no-pides',                                        // día 5
  'manda-ella/rosa', 'cinco', 'cara-caracter/negro',                             // día 6
  'no-app', 'no-es-tarde', 'producto',                                           // día 7
  'avisamos', 'lo-que-piensas', 'llena-todo',                                    // día 8
  'verdad', 'enterarse', 'alcanzo/negro',                                        // día 9
  'cinco-cuadras/negro', 'la-prisa', 'tu-vida',                                  // día 10
  'tres', 'lo-contrario', 'dijo-no',                                             // día 11
  'bloquea/rosa', 'veinte-minutos', 'cuantas-veces',                             // día 12
  'solo-fisico/negro', 'quien-si', 'primero',                                    // día 13
  'silencio', 'seguras', 'su-foto/rosa',                                         // día 14
  'a-todos', 'pasaselo', 'agotados/negro',                                       // día 15
  'responder', 'ejemplos', 'tu-llave',                                           // día 16
  'cero-perfiles', 'sin-permiso', 'tu-historia',                                 // día 17
  'carta-foto', 'no-se-venden', 'la-prima/negro',                                // día 18
  'solo-mental/negro', 'sin-tu-si/rosa', 'no-compites',                          // día 19
  'una-vez-n', 'tres-sin', 'convencer',                                          // día 20
  'trabajo', 'cuarenta-tres', 'coahuila-48/negro',                               // día 21
  'que-necesitas', 'insistir/rosa', 'cada-persona',                              // día 22
  'hasta-2027', 'como-app', 'hola',                                              // día 23
  'gratis', 'bienvenidos', 'corazonada/negro',                                   // día 24
  'por-foto', 'te-lean', 'al-reves',                                             // día 25
  'ya-encontraste', 'solo-espiritual/negro', 'piensa',                           // día 26
  'no-obliga/rosa', 'una-hora', 'sin-competir',                                  // día 27
  'anos-192/negro', 'se-vale', 'pausas',                                         // día 28
  'diez-partes', 'te-vayas', 'de-cero',                                          // día 29
  'clara', 'algoritmo', 'los-tres/negro',                                        // día 30
  'al-sesenta', 'diez/rosa', 'sin-posar',                                        // día 31
  'conoces', 'para-uno', 'exigente',                                             // día 32
  'dos', 'se-oyen', 'la-dejaron/negro',                                          // día 33
  'catalogo', 'mejor', 'cuatro-al-final',                                        // día 34
  'cero', 'te-cansaste/negro', 'en-control/rosa',                                // día 35
  'tu-tiempo', 'para-abrir', 'sin-juzgar',                                       // día 36
  'curriculums/negro', 'mariposas', 'tres-tonos',                                // día 37
  'anos', 'mejor-foto', 'discreta/rosa',                                         // día 38
  'amiga', 'no-cruzarme', 'insatisfechos/negro',                                 // día 39
  'lo-guapo/negro', 'distraida', 'cuatro-salidas',                               // día 40
  'tambien-quiso', 'tres-sin-2', 'ningun-lado',                                  // día 41
  'a-tu-ritmo', 'embona', 'diez-anos',                                           // día 42
  'embone', 'primero-tu/rosa', 'mas-somos',                                      // día 43
  'un-clic', 'una-entre-mil/negro', 'ya-se-canso',                               // día 44
  'te-complete', 'te-decimos', 'ciudad-chica/negro',                             // día 45
  'despues-de-pelear', 'sin-fotos/rosa', 'no-eres-producto',                     // día 46
  'claras', 'match', 'una-vez',                                                  // día 47
  'paciencia', 'cien', 'veinte-anos/negro',                                      // día 48
  'poco-romantico/negro', 'avisamos-no', 'ochenta-ocho',                         // día 49
  'quince', 'merece', 'no-es-suerte',                                            // día 50
  'cerrar-bloquear/rosa', 'ciego', 'una-foto',                                   // día 51
  'likes', 'los-martes', 'tu-atencion',                                          // día 52
  'regla-clara', 'miedo-sola/negro', 'dejar-las-citas',                          // día 53
  'ves-antes/rosa', 'nueve', 'otro-algoritmo/negro',                             // día 54
  'bio', 'no-compensa', 'en-el-grupo',                                           // día 55
  'mas-pesa', 'secretaria/negro', 'lo-multiplica',                               // día 56
  'por-que-embonan', 'publicado', 'cuanto-mas',                                  // día 57
  'no-sale-en-foto/negro', 'pon-la-verdad', 'ventaja',                           // día 58
  'reirse', 'aparador', 'tu-ex/rosa',                                            // día 59
  'no-es-rapido', 'tu-prima', 'tres-anos/negro',                                 // día 60
  'veinte', 'no-prometemos', 'un-martes-p',                                      // día 61
  'el-mapa', 'la-verdad', 'llamada/rosa',                                        // día 62
  'mentir', 'completo', 'lo-obvio/negro',                                        // día 63
  'la-boda/negro', 'ni-su-nombre', 'no-hacemos',                                 // día 64
  'domingo-perfecto', 'en-paz', 'nadie-posa',                                    // día 65
  'una-hora-s', 'noventa-ocho', 'un-algoritmo',                                  // día 66
  'deslizar-cansa/negro', 'guardar/rosa', 'el-camino',                           // día 67
  'destacado', 'pregunta-32', 'tu-telefono',                                     // día 68
  'al-azar', 'todas-las-que', 'sin-saber-hijos/negro',                           // día 69
  'filtro', 'innegociables', 'carta-dos',                                        // día 70
  'no-preguntamos', 'los-perfiles', 'reporte/rosa',                              // día 71
  'sin-explicar', 'tu-liga', 'cuatro-de-diez/negro',                             // día 72
  'cien-en-la-vida/negro', 'dos-segundos-s', 'un-anuncio',                       // día 73
  'esperas', 'superlike', 'dos-segundos',                                        // día 74
  'coqueteo/rosa', 'distinto-tu', 'cien-veces/negro',                            // día 75
  'cuanto-cuesta', 'en-algun-lugar', 'sin-cronometro',                           // día 76
  'una-mas', 'se-parezca', 'cansa',                                              // día 77
  'publico/rosa', 'votas', 'en-edad/negro',                                      // día 78
  'azar', 'el-metodo', 'voluntarios',                                            // día 79
  'por-una-foto', 'sin-razon/negro', 'reabrir',                                  // día 80
  'sin-pareja', 'espacio-abrazo', 'el-truco',                                    // día 81
  'quince-minutos/negro', 'dinero/rosa', 'con-ayuda',                            // día 82
  'poquitas', 'ni-foto', 'valientes',                                            // día 83
  'la-mitad', 'tu-ciudad', 'sin-pareja-satisfecha/negro',                        // día 84
  'por-que-ella', 'honestidad', 'salir',                                         // día 85
  'no-diario', 'no-es-bloqueo', 'confiar',                                       // día 86
  'te-vas/rosa', 'nunca-descarta', 'no-habia-herramienta/negro',                 // día 87
  'se-responde', 'tu-si', 'ninguna-debil',                                       // día 88
  'no-cuesta', 'lo-volverias/negro', 'un-martes',                                // día 89
  'elegirse', 'abierto', 'si-digo-no',                                           // día 90
  'prueba-y-error/negro', 'avisale/rosa', 'tu-tambien',                          // día 91
  'mismo-numero', 'diez-citas', 'no-para-todos',                                 // día 92
  'cuidado', 'discretos', 'solo-una-cara/negro',                                 // día 93
  'te-conformas/negro', 'borrar/rosa', 'la-cama',                                // día 94
  'que-tan-cerca', 'etiqueta', 'promete-pide',                                   // día 95
  'querer-bonito', 'ninguna-persona', 'si-no-llega',                             // día 96
  'acompanado', 'historia', 'el-respeto',                                        // día 97
  'no-promesa', 'los-que-habia/negro', 'domingos',                               // día 98
  'captura/rosa', 'borrosos', 'ya-no-eres/negro',                                // día 99
  'si-miente', 'a-donde-llegar', 'practica',                                     // día 100
  'gana-cuando', 'cruce', 'guardalo',                                            // día 101
  'reglas-el/rosa', 'no-a-ligar', 'ganarle-a-la-muestra/negro',                  // día 102
  'fisico-primero/negro', 'nadie-solo', 'se-guarda',                             // día 103
  'editas', 'lo-pienso', 'menos-ruido',                                          // día 104
  'como-adulto', 'hijos', 'ya-tengo',                                            // día 105
  'en-visto', 'vienes-a-ser', 'sin-decir-nada',                                  // día 106
  'sin-banners', 'vida-plena/negro', 'cuando-quieras/rosa',                      // día 107
  'te-cuiden', 'a-una-persona', 'no-la-menos-peor/negro',                        // día 108
  'diez-bloques',
];

// [{ id, fondo }] ya limpio: sin repetidas, sin claves que ya no existen y con las frases nuevas al final
export const ORDEN = (() => {
  const vistas = new Set(), sal = [];
  for (const x of LISTA) { const [id, fondo = 'blanco'] = x.split('/'); if (FRASE[id] && !vistas.has(id)) { vistas.add(id); sal.push({ id, fondo }); } }
  for (const f of FRASES) if (!vistas.has(f.id)) sal.push({ id: f.id, fondo: f.s === 'verdades' ? 'negro' : f.s === 'ella' ? 'rosa' : 'blanco' });
  return sal;
})();
export const POR_DIA = 3;   // publicaciones por día en este calendario
