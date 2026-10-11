# El go-to-market (`/gtm`)

**Ver en vivo: https://cupido.capitaltorreon.com/gtm** (privado: solo entran correos @ingenieriadigital.mx y @superleads.mx)

<!-- Autor: Ricardo López Reyero · RLR · rev 181218 -->

El plan para llevar a Cupido a 10 millones de perfiles vivos, y la lista de todo lo que hay que hacer para llegar. A quien llegue a ejecutar se le dice una sola cosa: **«sigue el go-to-market»**.

## Las cinco partes

La página se recorre en el orden en que se trabaja:

1. **Estrategia** — lo que se lee una vez: Resumen, Atajos, Lanzamiento, Creadores, Alianzas, Números y Ritmo.
2. **Tareas** — la lista de 244 actividades en orden, con sus puntos de control y el marcador de palomitas.
3. **El CEO** — el perfil de quien va a dirigir (la página pública `/ceo`, vista adentro), cómo elegir y las pruebas que han llegado.
4. **Candidatas** — las fichas de quien salimos a buscar, con su foto.
5. **Proyecciones** — los próximos 18 años en una gráfica y una tabla: lo que entra, lo que se gasta y lo que queda.

Las direcciones de antes siguen sirviendo (`#checklist`, `#control`, `#equipo`, `#candidatos`, `#numeros`…): cada una lleva a su parte nueva.

## Qué trae

| Pestaña | Para qué |
|---|---|
| **Resumen** | La idea («no llenamos una app: encendemos ciudades»), por qué ahora, las siete ideas, la escalera de mil a diez millones, los cinco pasos y las fuentes de todos los datos. |
| **Lista** | 244 actividades en cinco fases, **en el orden en que conviene hacerlas**: 29 pasos, y cada paso termina en su punto de control. Cada una dice el área, quién la hace (persona, IA o las dos), cuánto esfuerzo pide y si se repite. La palomita se guarda con el correo de quien la puso y la hora, y solo la ponen los correos de la casa. Mezclados van **19 puntos de control**: las metas de usuarios al mes y de ingreso al mes. Arriba, el marcador: cuántas palomitas van, quién lleva más, las últimas y cuántas faltan para el punto de control que sigue. |
| **Atajos** | Dieciséis caminos cortos que hoy no se están usando, cada uno con por qué funciona, el primer paso y lo que cuesta. |
| **Lanzamiento** | Cómo lucimos, cómo se acomoda cada red, en qué ciudades y en qué orden, para qué sirve cada red y el calendario de fechas. |
| **Creadores** | A quién buscar, con nombre, tamaño y por dónde entrarle: los veinte para empezar, terapeutas, pódcasts, creadores y medios del norte, y prensa. |
| **Alianzas** | Dónde ya se junta la gente en La Laguna, Monterrey y Saltillo: sedes, egresados, clubes, iglesias, bodas y las fechas de cada ciudad. |
| **Números** | La calculadora de ciudad, de dónde salen los primeros 5,000 perfiles, el embudo, cuántas publicaciones, la propuesta de presupuesto, **los dos números de control con sus supuestos** y las señales para decidir cada lunes. |
| **Ritmo** | La semana tipo, qué hace la persona y qué hace la IA, y lo que no se hace. |
| **Equipo** | A quién buscar para dirigir y ejecutar, cómo reconocerla, las dos pruebas, **la guía para leer una prueba**, quién más y cuándo, y lo que le toca al fundador. Aquí llegan las pruebas de `/ceo` (solo las ven las cuentas administradoras) y se da acceso a la página. |

Arriba de todo, la franja **«Dónde vamos hoy»** enseña los números de verdad (sin la demo): primero los dos de control (usuarios al mes e ingreso al mes, con la meta que toca), y luego perfiles vivos, mujeres y hombres, cuentas, invitados, cruces arriba de 90 %, puertas abiertas y cuánto de la lista está hecho. Cuando hay suficientes cruces entre personas reales, la calculadora usa la tasa de par real en lugar del supuesto.

## El perfil de quien dirige (`/ceo`)

**https://cupido.capitaltorreon.com/ceo** es la página que se le manda a quien podría dirigir Cupido y ejecutar este plan. Es pública pero no está listada en buscadores (`noindex`). No pide currículum: pide una prueba.

- **Lo que dice:** de qué se trata, «no se llena una app: se enciende una ciudad», doce rasgos en espejo (cada uno con «se nota en que…»), nueve cosas que tiene que saber, diez que tiene que poder hacer, las metas con fecha y su marcador (perfiles vivos con equilibrio), de dónde viene probablemente, para quién no es, y lo que tiene desde el primer día.
- **La prueba:** la vez que juntó gente desde cero · diez días y cero pesos para cien perfiles · tres cosas que cambiaría · lo correcto sobre lo conveniente · un minuto a cámara (opcional). Más nombre, correo, WhatsApp y ciudad.
- **A dónde llega:** `POST /api/ceo/postular` la guarda en `ceo_postulaciones` (`src/ceo.js`). Se lee en `/gtm` → Equipo, y a las cuentas administradoras que ya abrieron `/gtm` (tabla `gtm_avisos`) les llega un correo corto con un botón. Candados: casilla trampa, una por correo al día, tres por conexión y cuarenta en total al día.
- **Lo que hay que decidir antes de mandar la liga** (está escrito en Equipo): la paga, si vivir en La Laguna de noviembre a febrero es requisito, y cómo se llama el puesto.
- La vacante no pide género ni edad.

## Candidatas: a quién salimos a buscar (`/gtm` → Candidatas)

`/ceo` espera a que alguien llegue. Esta pestaña es lo contrario: con el perfil en la mano se sale a buscar, y se guarda una ficha por persona. La ve cualquier correo de la casa que entre a `/gtm`.

- **Qué trae cada ficha:** quién es y su liga, por qué esto le estaba destinado, trayectoria, lo publicado sobre su trabajo, los doce rasgos uno por uno (se ve, probable, por comprobar o bandera, con su evidencia), qué revisar, quién puede presentarla, la nota de invitación (cabe en 200 caracteres), el mensaje completo y tres preguntas para la primera llamada.
- **La foto:** la de su perfil de LinkedIn (320 px), guardada dentro de la ficha. Se ve grande en la tabla y en cada ficha, y con un toque se abre más grande todavía. Quien no la tiene sale con sus iniciales.
- **La línea de cada ficha** (`clave`): una sola frase con lo que esa persona hizo o tiene que le serviría a Cupido. Sale debajo del nombre en la tabla, en la ficha y junto a la foto en grande. El letrero lo pone la búsqueda (`meta.etiqueta_clave`). Las fotos viven en `privado/fotos/<id>.jpg` y en la base; nunca en el repositorio. El sembrador las mete solo.
- **Seguimiento:** estado (por contactar, contactada, en plática, mandó la prueba, descartada) y notas, que se guardan solas con quién y cuándo. Se puede agregar a alguien a mano: entra a la banca.
- **Cómo se buscó** (está escrito en la propia pestaña): solo trayectoria profesional, por oficio y no por nombre. La primera ronda usó una sola fuente (LinkedIn). En la segunda la cuenta llegó al límite mensual de búsquedas de LinkedIn, que entonces enseña tres resultados por consulta: los nombres se descubren en prensa sobre su trabajo (nombramientos, entrevistas de negocio, notas de sus proyectos) y la trayectoria se lee completa en LinkedIn, que sigue abierto. Si una ficha sale de prensa y no de un perfil, lo avisa y su botón dice «Abrir la nota». **No se busca la vida personal de nadie**: ni estado civil, ni divorcios, ni familia. Si a alguien le importa el problema por su historia, lo cuenta ella; para eso está el rasgo «Motivo», que se pregunta. Solo se escribe en femenino de quien así se presenta en su perfil.
- **Rondas:** el orden es uno solo. Cada ronda marca sus fichas con una etiqueta (campo `nuevo`), y la que baja a la banca conserva su ficha completa y la razón (campo `por_que_no`).
- **Nadie contacta por nosotros:** de la búsqueda no sale ningún mensaje. Los textos están listos para que los mande quien firma.
- **Privacidad (importante):** el repositorio es público. Las fichas viven solo en la tabla `candidatos` y en `privado/candidatas-ceo.json`, que está en `.gitignore`. **Ningún nombre va en el código.**
- **Sembrar o actualizar** (respeta el estado y las notas ya escritas; `--podar` quita las que ya no vengan en el archivo):

  ```bash
  node scripts/sembrar-candidatos.mjs privado/candidatas-ceo.json --local
  ```

  ```bash
  node scripts/sembrar-candidatos.mjs privado/candidatas-ceo.json --remote
  ```

- **De dónde salió:** es el módulo suelto de Video Room (`public/js/candidatos.js`, `public/css/candidatos.css`, `src/candidatos.js`, tres rutas bajo `/api/gtm/candidatos` y el sembrador). Aquí se le agregó la opción `cabeceras`, para mandar el pase del login en cada petición.

## Proyecciones: los próximos 18 años (`/gtm` → Proyecciones)

Para dar una idea del tamaño de lo que se está armando. Arriba cuatro cifras, en medio la gráfica de lo que entra y lo que se gasta por año, y abajo la tabla año por año (2026, que es el arranque, y de 2027 a 2044). **No es un pronóstico:** es la consecuencia de unos supuestos, y todos están escritos al final de la pantalla.

- **No inventa una escalera nueva.** Hasta 2030 los usuarios son los puntos de control de Tareas (`CONTROLES`). De 2031 en adelante ya no hay plan escrito: se supone un techo y que cada año se crece menos.
- **El ingreso** es usuarios por pesos por usuario al mes (`POR_USUARIO`): $2 mientras todo es gratis, $40 desde que cobra el programa.
- **Los gastos**, mientras no se cobra, son montos que salen del plan: el tope de arranque ($105,000 en 90 días), quien ejecuta, el equipo de cinco y la verificación de identidad. Desde que se cobra, 70 de cada 100 pesos: equipo 25, crecimiento y comunidad 18, cuidado y seguridad 12, cobro con tarjeta y devoluciones 8, tecnología 7.
- **Tres escenarios:** Prudente (40 % de la escalera, el cobro se recorre a 2029, $25 por usuario), El plan y Ambicioso (130 %, $50 por usuario).
- **Lo que dice «El plan»:** hacen falta unos $4.6 millones antes de que Cupido se pague solo (lo más hondo es diciembre de 2027), 2028 es el primer año en que entra más de lo que se gasta, y en 2044 entran unos $14,400 millones al año con 30 millones de usuarios al mes.
- **Dónde vive:** todo el modelo está en `src/gtm-proyecciones.js` (`MODELO`, los supuestos y la cuenta, mes por mes). Para mover un supuesto se cambia ahí y la página se recalcula sola. La página solo dibuja.
- **Se prueba** con `node scripts/pruebas-proyecciones.mjs` (10 pruebas: que pase por cada punto de control, que las sumas cuadren, que sin cobrar nunca haya ganancia). Corre sola antes de cada despliegue.
- **Lo que no trae:** impuestos, inflación, dinero de inversionistas ni la comisión de las tiendas de apps.

## Quién entra

- **Solo correos de la casa:** `@ingenieriadigital.mx` y `@superleads.mx` (`DOMINIOS_CASA` en `src/gtm.js`). Nadie más, aunque se le quiera dar acceso: ya no hay lista de invitados.
- Quien entra ve **todo**: la Estrategia, las Tareas, El CEO con las pruebas recibidas, las Candidatas con sus fichas y fotos, y las Proyecciones. Y pone palomitas (cada una queda con su correo y su hora).
- Ya no hay distinción de cuenta administradora dentro de `/gtm`: la decide el dominio del correo. Por eso conviene no darle correo de la casa a nadie que no deba leer lo que se escribió de las candidatas.
- Se entra con el **login de la casa** (el botón de Google de `login.capitaltorreon.com`); también abre con una sesión de Cupido hecha con uno de esos correos.
- La página (`public/gtm.html`) es un cascarón: todo viaja solo en `/api/gtm`, y solo a quien tiene permiso. Sin sesión responde 401; con un correo de otro dominio, 403.

**Ojo:** el repositorio es público. Mientras lo sea, el texto del plan se puede leer en GitHub aunque la página esté cerrada. Por eso aquí no se copian correos ni teléfonos de nadie: cada persona lleva a su página oficial. Decidir si el repositorio sigue abierto es una actividad de la fase 1.

## Puntos de control: usuarios al mes e ingreso al mes

Todo lo que hay en la Lista existe para mover dos números. Por eso van metidos entre las actividades, como tarjetas oscuras con 🎯: se ven distintas a propósito, porque **no son actividades, son objetivos**.

- **Qué dice cada uno:** la fecha, la meta de usuarios al mes, la meta de ingreso al mes, el dato real de hoy junto a cada meta, de dónde sale el número y qué se decide si no se llega.
- **Dónde aparece:** al final de su paso: arriba quedan las actividades que tienen que estar andando para que ese número llegue (por ejemplo, el de 300 usuarios cierra el paso «Del 19 al 30 de noviembre» y va tras «A los 300 perfiles: primera lectura seria»). Cada fase enseña además sus puntos de control en una tira, en orden de fecha, y el filtro «🎯 Solo puntos de control» (o `/gtm#control`) los pone todos seguidos: la escalera completa.
- **No se palomean.** Se alcanzan solos: el día en que los dos números reales llegan a la meta, el servidor lo anota con su fecha y ya no se borra aunque después bajen. Si la fecha pasa y no se llegó, la tarjeta dice hace cuántos días venció.
- **Cómo se mide un usuario al mes:** una cuenta de verdad que abrió Cupido en los últimos 30 días. Para eso se guarda la última visita de cada cuenta (columna `personas.visita`, a lo más una escritura por hora; no se guarda qué hizo ni dónde).
- **Cómo se mide el ingreso al mes:** lo que dice el libro de cobros ([PAGOS.md](PAGOS.md)): cada cobro de los últimos 30 días, del Fondo y de cada mensualidad de socio, ya restado lo que se devolvió. Los socios que se cuentan son los que siguen al corriente hoy. Si el libro no está al día con Stripe, la franja lo avisa: el número puede estar corto, nunca inflado.
- **De dónde salen las metas** (está escrito en la Lista y en Números): los usuarios siguen la escalera del plan, tantos usuarios al mes como perfiles vivos; el ingreso son 2 pesos al mes por usuario en 2026 y 2027 (todo es gratis: solo apoyos voluntarios) y 40 pesos al mes por usuario de 2028 en adelante, cuando empieza a cobrarse el programa. Son supuestos y lo dicen.

## Dónde vive cada cosa

| Archivo | Qué es |
|---|---|
| `src/gtm-plan.js` | El texto de todas las pestañas, como bloques (`cabeza`, `p`, `cifras`, `tarjetas`, `pasos`, `tabla`, `lista`, `nota`, `gente`, `calc`, `boton`, `fuentes`). Ahí se corrige una cifra o se agrega un creador. |
| `src/gtm-tareas.js` | La lista: un renglón por actividad, `[clave, fase, área, quién, esfuerzo, ritmo, título, detalle]`, y los catálogos de fases y áreas. Luego el orden (`PASOS`): `[fase, cuándo, título, [claves en orden]]`. Al final, los puntos de control (`CONTROLES`): `[clave, fase, tras, fecha, usuarios al mes, ingreso al mes, título, de dónde sale, si no se llega]`, y sus supuestos (`SUPUESTOS_CONTROL`). |
| `src/gtm-proyecciones.js` | Las proyecciones a 18 años: el modelo (`MODELO`), los tres escenarios, los supuestos escritos y la cuenta mes por mes. Lee `CONTROLES` y `POR_USUARIO` de `gtm-tareas.js`; no repite ningún número de la escalera. |
| `src/gtm.js` | Quién entra (`quienGtm`), quién palomea (`DOMINIOS_PALOMITA`), los números de hoy (con usuarios e ingreso al mes), guardar una palomita, anotar el punto de control que se alcanza y cambiar el equipo. Tablas `gtm_tareas` y `gtm_equipo`. |
| `src/verificar.js` | Verifica el pase del login de la casa (copia de `Login_CapitalTorreon/publico/verificar.js`). |
| `public/gtm.html`, `public/js/gtm.js`, `public/css/gtm.css` | El cascarón, lo que pinta y el estilo. |
| `public/ceo.html`, `public/css/ceo.css`, `src/ceo.js` | El perfil de quien dirige, su estilo, y el guardado de las pruebas con su aviso. |

Rutas: `GET /api/gtm` (todo), `POST /api/gtm/tarea {id, hecha}`, `POST /api/gtm/equipo {email, quitar}`.

## Reglas para tocar la lista

- **Quién pone palomitas:** quien entra, es decir, solo correos `@ingenieriadigital.mx` y `@superleads.mx`. Pueden ponerlas y quitarlas. Cada palomita guarda el correo y la hora, y se ve en la tarjeta.
- **Mover una actividad** es cambiar su clave de lugar en `PASOS`; el renglón de `TAREAS` no se toca. Una actividad que no esté en ningún paso sale al final de su fase, en «Lo demás». Si se mueve la última de un paso, hay que actualizar el `tras` de su punto de control.
- **La clave de una actividad nunca cambia** (`f2-17`): ahí se guarda su palomita. Para agregar, se usa un número nuevo; para retirar, se borra el renglón.
- Las que se repiten (↻ diario, semanal, mensual) se palomean cuando la rutina ya quedó andando.
- **Un punto de control se cambia en un solo lugar** (`CONTROLES`): la tabla de Números y las tarjetas de la Lista salen de ahí. Su clave (`pc-07`) tampoco cambia. Si se retira la actividad a la que está pegado, se va al final de su fase; conviene pegarlo a otra.
- **Todo dato lleva de dónde salió y de cuándo es.** Lo que es supuesto dice «supuesto» y tiene, en la fase 1, la actividad que lo cambia por el dato real.

## De dónde salió

Los datos se verificaron el 10 de octubre de 2026: INEGI (situación conyugal, matrimonios, divorcios, uso de internet), los informes trimestrales de Match Group y Bumble, The CIU, DataReportal, la ley de datos personales de 2025 y los casos de Marriage Pact, Timeleft, OkCupid y Tinder. Los creadores y medios se leyeron ese día en el canal de cada quien. Lo que no se pudo confirmar no aparece o dice «sin verificar». La lista completa de fuentes está al final del Resumen, de Creadores y de Alianzas.

## Lo que falta

- Decidir por escrito si quien entró cuando era gratis paga la entrada en 2028: las metas suponen que no.
- Completar las listas que quedaron cortas: creadores que hablan solo de citas, parejas, y grupos de Facebook de solteros de cada ciudad.
- Varias actividades de la fase 1 son decisiones de Ricardo: la regla del Gran Cruce, la verificación de identidad, la cuenta demo de ella, si el código sigue público y «Mientras esperan a Cupido».
- El termómetro de ciudad, los códigos de campaña y la liga de madrina todavía no existen: son actividades de producto de la fase 1.
