# El go-to-market (`/gtm`)

**Ver en vivo: https://cupido.capitaltorreon.com/gtm** (privado: pide entrar con una cuenta del equipo)

<!-- Autor: Ricardo López Reyero · RLR · rev 181218 -->

El plan para llevar a Cupido a 10 millones de perfiles vivos, y la lista de todo lo que hay que hacer para llegar. A quien llegue a ejecutar se le dice una sola cosa: **«sigue el go-to-market»**.

## Qué trae

| Pestaña | Para qué |
|---|---|
| **Resumen** | La idea («no llenamos una app: encendemos ciudades»), por qué ahora, las siete ideas, la escalera de mil a diez millones, los cinco pasos y las fuentes de todos los datos. |
| **Lista** | 244 actividades en cinco fases. Cada una dice el área, quién la hace (persona, IA o las dos), cuánto esfuerzo pide y si se repite. La palomita se guarda con nombre y fecha, para todo el equipo. |
| **Atajos** | Dieciséis caminos cortos que hoy no se están usando, cada uno con por qué funciona, el primer paso y lo que cuesta. |
| **Lanzamiento** | Cómo lucimos, cómo se acomoda cada red, en qué ciudades y en qué orden, para qué sirve cada red y el calendario de fechas. |
| **Creadores** | A quién buscar, con nombre, tamaño y por dónde entrarle: los veinte para empezar, terapeutas, pódcasts, creadores y medios del norte, y prensa. |
| **Alianzas** | Dónde ya se junta la gente en La Laguna, Monterrey y Saltillo: sedes, egresados, clubes, iglesias, bodas y las fechas de cada ciudad. |
| **Números** | La calculadora de ciudad, de dónde salen los primeros 5,000 perfiles, el embudo, cuántas publicaciones, la propuesta de presupuesto y las señales para decidir cada lunes. |
| **Ritmo** | La semana tipo, qué hace la persona y qué hace la IA, y lo que no se hace. |
| **Equipo** | A quién buscar para dirigir y ejecutar, cómo reconocerla, las dos pruebas, **la guía para leer una prueba**, quién más y cuándo, y lo que le toca al fundador. Aquí llegan las pruebas de `/ceo` (solo las ven las cuentas administradoras) y se da acceso a la página. |

Arriba de todo, la franja **«Dónde vamos hoy»** enseña los números de verdad (sin la demo): perfiles vivos, mujeres y hombres, cuentas, invitados, cruces arriba de 90 %, puertas abiertas y cuánto de la lista está hecho. Cuando hay suficientes cruces entre personas reales, la calculadora usa la tasa de par real en lugar del supuesto.

## El perfil de quien dirige (`/ceo`)

**https://cupido.capitaltorreon.com/ceo** es la página que se le manda a quien podría dirigir Cupido y ejecutar este plan. Es pública pero no está listada en buscadores (`noindex`). No pide currículum: pide una prueba.

- **Lo que dice:** de qué se trata, «no se llena una app: se enciende una ciudad», doce rasgos en espejo (cada uno con «se nota en que…»), nueve cosas que tiene que saber, diez que tiene que poder hacer, las metas con fecha y su marcador (perfiles vivos con equilibrio), de dónde viene probablemente, para quién no es, y lo que tiene desde el primer día.
- **La prueba:** la vez que juntó gente desde cero · diez días y cero pesos para cien perfiles · tres cosas que cambiaría · lo correcto sobre lo conveniente · un minuto a cámara (opcional). Más nombre, correo, WhatsApp y ciudad.
- **A dónde llega:** `POST /api/ceo/postular` la guarda en `ceo_postulaciones` (`src/ceo.js`). Se lee en `/gtm` → Equipo, y a las cuentas administradoras que ya abrieron `/gtm` (tabla `gtm_avisos`) les llega un correo corto con un botón. Candados: casilla trampa, una por correo al día, tres por conexión y cuarenta en total al día.
- **Lo que hay que decidir antes de mandar la liga** (está escrito en Equipo): la paga, si vivir en La Laguna de noviembre a febrero es requisito, y cómo se llama el puesto.
- La vacante no pide género ni edad.

## Candidatas: a quién salimos a buscar (`/gtm` → Candidatas)

`/ceo` espera a que alguien llegue. Esta pestaña es lo contrario: con el perfil en la mano se sale a buscar, y se guarda una ficha por persona. Solo la ven las **cuentas administradoras** (ni siquiera el equipo: quien sea contratada no debe leer lo que se pensó de las demás).

- **Qué trae cada ficha:** quién es y su liga, por qué esto le estaba destinado, trayectoria, los doce rasgos uno por uno (se ve, probable, por comprobar o bandera, con su evidencia), qué revisar, quién puede presentarla, la nota de invitación (cabe en 200 caracteres), el mensaje completo y tres preguntas para la primera llamada.
- **Seguimiento:** estado (por contactar, contactada, en plática, mandó la prueba, descartada) y notas, que se guardan solas con quién y cuándo. Se puede agregar a alguien a mano: entra a la banca.
- **Cómo se buscó** (está escrito en la propia pestaña): una sola fuente (LinkedIn), solo trayectoria profesional, por oficio y no por nombre. **No se busca la vida personal de nadie**: ni estado civil, ni divorcios, ni familia. Si a alguien le importa el problema por su historia, lo cuenta ella; para eso está el rasgo «Motivo», que se pregunta. Solo se escribe en femenino de quien así se presenta en su perfil.
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

## Quién entra

- Las **cuentas administradoras** de Cupido (las huellas de la variable `ADMINES`) entran siempre.
- Una cuenta administradora agrega a quien haga falta en **Equipo → Dar acceso**, con su correo de Google. Esa persona puede palomear la lista; no puede cambiar el equipo.
- Se entra con el **login de la casa** (el botón de Google de `login.capitaltorreon.com`); también abre con una sesión de Cupido de una cuenta administradora.
- La página (`public/gtm.html`) es un cascarón: el plan y la lista viajan solo en `/api/gtm`, y solo a quien tiene permiso. Sin sesión responde 401; con una cuenta que no es del equipo, 403.

**Ojo:** el repositorio es público. Mientras lo sea, el texto del plan se puede leer en GitHub aunque la página esté cerrada. Por eso aquí no se copian correos ni teléfonos de nadie: cada persona lleva a su página oficial. Decidir si el repositorio sigue abierto es una actividad de la fase 1.

## Dónde vive cada cosa

| Archivo | Qué es |
|---|---|
| `src/gtm-plan.js` | El texto de todas las pestañas, como bloques (`cabeza`, `p`, `cifras`, `tarjetas`, `pasos`, `tabla`, `lista`, `nota`, `gente`, `calc`, `boton`, `fuentes`). Ahí se corrige una cifra o se agrega un creador. |
| `src/gtm-tareas.js` | La lista: un renglón por actividad, `[clave, fase, área, quién, esfuerzo, ritmo, título, detalle]`, y los catálogos de fases y áreas. |
| `src/gtm.js` | Quién entra (`quienGtm`), los números de hoy, guardar una palomita y cambiar el equipo. Tablas `gtm_tareas` y `gtm_equipo`. |
| `src/verificar.js` | Verifica el pase del login de la casa (copia de `Login_CapitalTorreon/publico/verificar.js`). |
| `public/gtm.html`, `public/js/gtm.js`, `public/css/gtm.css` | El cascarón, lo que pinta y el estilo. |
| `public/ceo.html`, `public/css/ceo.css`, `src/ceo.js` | El perfil de quien dirige, su estilo, y el guardado de las pruebas con su aviso. |

Rutas: `GET /api/gtm` (todo), `POST /api/gtm/tarea {id, hecha}`, `POST /api/gtm/equipo {email, quitar}`.

## Reglas para tocar la lista

- **La clave de una actividad nunca cambia** (`f2-17`): ahí se guarda su palomita. Para agregar, se usa un número nuevo; para retirar, se borra el renglón.
- Las que se repiten (↻ diario, semanal, mensual) se palomean cuando la rutina ya quedó andando.
- **Todo dato lleva de dónde salió y de cuándo es.** Lo que es supuesto dice «supuesto» y tiene, en la fase 1, la actividad que lo cambia por el dato real.

## De dónde salió

Los datos se verificaron el 10 de octubre de 2026: INEGI (situación conyugal, matrimonios, divorcios, uso de internet), los informes trimestrales de Match Group y Bumble, The CIU, DataReportal, la ley de datos personales de 2025 y los casos de Marriage Pact, Timeleft, OkCupid y Tinder. Los creadores y medios se leyeron ese día en el canal de cada quien. Lo que no se pudo confirmar no aparece o dice «sin verificar». La lista completa de fuentes está al final del Resumen, de Creadores y de Alianzas.

## Lo que falta

- Completar las listas que quedaron cortas: creadores que hablan solo de citas, parejas, y grupos de Facebook de solteros de cada ciudad.
- Varias actividades de la fase 1 son decisiones de Ricardo: la regla del Gran Cruce, la verificación de identidad, la cuenta demo de ella, si el código sigue público y «Mientras esperan a Cupido».
- El termómetro de ciudad, los códigos de campaña y la liga de madrina todavía no existen: son actividades de producto de la fase 1.
