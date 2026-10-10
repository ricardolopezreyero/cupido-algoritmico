# Compartir

> Autor: Ing. Ricardo López Reyero · RLR
> Código: [`public/js/frases.js`](../public/js/frases.js) (las frases), [`public/js/piezas.js`](../public/js/piezas.js) (las medidas y el pintor), [`public/js/compartir.js`](../public/js/compartir.js) (la sección), [`public/compartir.html`](../public/compartir.html) (la página pública), [`public/incrustar.html`](../public/incrustar.html) (la tarjeta para páginas ajenas), [`scripts/videos-compartir.mjs`](../scripts/videos-compartir.mjs) (la fábrica de videos) y [`scripts/piezas-compartir.mjs`](../scripts/piezas-compartir.mjs) (las piezas fijas y las hojas de revisión).

Todo lo que alguien necesita para hablar de Cupido, en un solo lugar y a un toque. **Entre más se comparte, más fácil que cada quien encuentre a su persona.**

Está en dos lugares, y es la misma sección:

- **En el tablero:** menú de la izquierda → 📣 **Compartir** (`/persona#compartir`). Usa la liga personal de quien entró (`/i/<código>`), la que cuenta a cuántas personas trajo.
- **Pública:** [`/compartir`](https://cupido.capitaltorreon.com/compartir). Para quien quiere ayudar sin tener cuenta (alguien que ya tiene pareja, un creador, una amiga). Usa la liga de la casa; si la persona ya entró, usa la suya.

## Lo que trae

| Parte | Qué es |
|---|---|
| **Tu liga** | Copiar, WhatsApp, Facebook, X, Telegram, correo, «Más…» (la hoja de compartir del teléfono) y su código QR. |
| **Galería · Imágenes** | 325 frases en 13 series, en 5 medidas y 3 fondos. «Todas» sale mezclada, una de cada serie por vuelta. |
| **Galería · La cuenta** | Las 325 juntas y **en el orden en que conviene publicarlas**, como se vería el perfil de una red: tres por renglón, cada renglón un día. Se bajan numeradas, con su calendario. Liga directa: `/compartir#cuenta`. |
| **Galería · Videos** | 154 de esas frases como video vertical de 5 a 9 segundos. Ya vienen hechos: bajan al instante, **sin audio** o **con música**. |
| **El taller** | Una pieza en grande, con dos pestañas. **Imagen:** descargar, compartir, copiar; cambiar medida, fondo y acomodo; liga personal o código QR. **Video:** verlo, oír la música, elegir otra, y los dos botones: «Video sin audio» y «Video con música». También «Con mi frase». |
| **Textos** | Para Instagram, TikTok, YouTube, Facebook y X. La sección está plegada: cada imagen ya trae su texto. |
| **WhatsApp** | Cinco mensajes, vistos como llegan en el chat (con la vista previa de la liga), y el corazón para la foto del grupo. |
| **Qué va en cada red** | La tabla red → pieza → medida. Tocar una fila acomoda la galería. |
| **Código para tu página** | Botón, insignia, tarjeta con frase e imagen con liga. Un solo selector de color (negro, blanco, rosa) cambia las cuatro. |
| **La marca** | Logotipo, color, tipografía (se descarga de aquí, con licencia), cómo suena, tres reglas y la guía de estilos. |
| **Descargar todo** | Cuatro paquetes: las 325 imágenes en vertical, los 154 videos sin audio, los 154 con música y el kit de marca. |

## La idea de estilo

**Texto negro, fondo blanco y un solo color: el corazón.** Lo contrario a como se ven las apps de citas, porque Cupido es lo contrario.

- **Fraunces 600** para decir; su cursiva, para lo que importa. **Inter 500** para explicar, en gris y en chico. Las dos son libres (SIL OFL) y se descargan desde `/letras/`.
- El corazón es el mismo trazo del favicon, en rosa `#d6455f`. Texto `#111111` sobre `#ffffff`.
- El negro y el rosa de fondo existen para variar un muro, no como estilo principal.
- Tres acomodos: arriba, al centro y abajo. La marca siempre va al pie; la dirección, a su lado.

### Cómo se escribe una frase (`frases.js`)

| Campo | Qué es |
|---|---|
| `t` | La frase. `\n` parte el renglón, `*así*` va en cursiva y `~así~` va tachado (con la raya en rosa). |
| `e` | La letra chica: el dato, la cifra o la razón. |
| `g` | El gancho: la pregunta o el pie que abre la pieza. Va arriba, en cursiva y más chico («¿Y cuánto cuesta?» → «Nada.»). |
| `n` | El número gigante, cuando la pieza es una cantidad. |
| `gr` | El dibujo de esa cantidad: `{ puntos: 43 }`, `{ puntos: 100, llenos: 9 }` o `{ barra: 88, raya: 90 }`. |
| `c` | El acomodo de inicio. |
| `v` | `1` si también es video. |

El `id` no se cambia nunca: es el nombre del archivo y la dirección de la tarjeta (`/incrustar?frase=<id>`).

## Las imágenes no son archivos

Cada imagen es una **receta** (frase + medida + fondo) que `piezas.js` pinta en un lienzo, en el navegador de quien la baja, a la medida exacta. Por eso la galería no pesa (no hay 4,125 imágenes en el servidor), una frase nueva aparece en todas las medidas el mismo día, y la pieza puede llevar la liga personal o su código QR.

El pintor busca solo el tamaño de letra más grande que quepa, respeta los renglones partidos a mano mientras la letra no tenga que achicarse demasiado, y empareja los renglones para que no quede una palabra sola al final.

| Medida | Tamaño | Para |
|---|---|---|
| Vertical 4:5 | 1080 × 1350 | Publicación de Instagram y Facebook |
| Cuadrado | 1080 × 1080 | Instagram, Facebook y grupos de WhatsApp |
| Historia 9:16 | 1080 × 1920 | Historias, Reels, TikTok, Shorts y estados. Lo importante va entre 270 y 1570 px. |
| Horizontal 16:9 | 1920 × 1080 | YouTube: miniatura, video y pantalla final |
| Liga | 1200 × 630 | Facebook, X y LinkedIn con liga |
| Portadas | 1640 × 624 · 2560 × 1440 · 1500 × 500 | Facebook, banner de YouTube y encabezado de X |
| Perfil | 1080 × 1080 | Todas las redes lo recortan en círculo |

## Los videos sí son archivos

Para que bajen al instante y se vean igual en cualquier teléfono, los 154 videos de la galería se hacen una vez y viven en `public/videos/`: `<id>.mp4` (sin audio) y `<id>-audio.mp4` (con música). La lista con duración y peso es `public/videos/lista.json`.

**Cómo es cada video:** vertical, 1080 × 1920, 30 cuadros por segundo, H.264 con AAC, de 5 a 9 segundos. El mismo pintor dibuja cada instante:

1. **Abre con la pieza completa** un instante y se desvanece. Así su primer cuadro —la portada que enseñan WhatsApp, TikTok y la galería del teléfono— nunca es un cuadro en blanco, y cuando la red lo repite en bucle, el final empata con el principio.
2. El gancho entra primero y se queda arriba.
3. El número cuenta desde cero, y su dibujo (puntos o barra) se va llenando.
4. Las palabras entran una por una. Lo tachado aparece entero, y luego la raya rosa lo cruza.
5. Entra la letra chica; después la marca, y el corazón late dos veces.
6. La pieza completa se queda quieta de dos a tres segundos, para leerla.

**Cómo se hacen** (con el servidor local corriendo):

```bash
node scripts/videos-compartir.mjs
```

Hace los que falten. Con `--todos` los rehace todos (si cambió el pintor o una frase); con nombres, solo esos. Un Chrome sin ventana pinta cada cuadro y ffmpeg los une: el video es idéntico a lo que se ve en la galería y no pierde cuadros. Tarda unos 2 segundos por video.

**En el taller**, si la combinación es la de la galería (vertical, fondo blanco, su acomodo y su música), el video baja ya hecho. Con cualquier cambio —otra medida, otro fondo, otra música, una frase propia— se graba en el navegador, en lo que dura el video (MP4 en Chrome y Safari; WebM en Firefox).

### La música

Cuatro fondos de 16 segundos, suaves y sin voz, **hechos con ElevenLabs**: piano, guitarra, cuerdas y ritmo suave. Cada serie tiene el suyo (`m` en `SERIES`).

- Los crea el servidor con la llave que ya tiene ligada (`generarMusica` en `src/sonidos.js`): primero intenta el compositor de música de ElevenLabs y, si esa llave no lo tiene, usa el de efectos. La tarea de cada tres minutos crea la que falte, una por vuelta y con tope de tres intentos. Los originales quedan en R2 (`musica/<id>.mp3`).
- Los que suenan están en `public/musica/`, ya emparejados de volumen (−16 LUFS) y sin silencio al inicio.
- En el video la música entra suave y se va suave segundo y medio antes del final.
- En **Admin → Sonidos** se oyen y se vuelven a crear (gasta créditos; solo una cuenta administradora). Después de crear una nueva: bajarla de R2, emparejarla y rehacer los videos con `--todos`.

## Las frases dicen la verdad

Regla: **toda frase se puede comprobar en la plataforma, o es una invitación de corazón. Ninguna promete pareja.** Si el producto cambia, la frase se cambia o se quita.

| Serie | Frases | Lo que afirma | Dónde se comprueba |
|---|---|---|---|
| Ellas mandan | 27 | Bloquear es inmediato; 10 bloqueos retiran la cuenta; 3 reportes sacan del matching; 5 mensajes sin respuesta y espera; ella enciende foto, llamada y coqueteo; ve cuántas lo han bloqueado | [`ELLA.md`](ELLA.md), `src/ella.js` |
| Con sentimiento | 43 | Nada del producto: lo que se siente buscar en serio. Varias son del manifiesto, tal cual | [`MANIFIESTO.md`](../MANIFIESTO.md) |
| En números | 32 | 43 preguntas, 10 dimensiones, 10 bloques, 10 partes del perfil (4 delicadas), 3 tonos, 4 maneras de irse, enlace de 20 minutos, 40 a 60 minutos, 9 de 100 en el demo | `preguntas.js`, `elementos.js`, `motor.js`, [`MODELO.md`](../MODELO.md) |
| Lo contrario | 24 | No hay perfiles que navegar ni fotos que deslizar | `/` |
| Preguntas | 22 | Las que la gente se hace, con su respuesta verdadera | — |
| El 90 % | 19 | El corte, el cruce en dos direcciones, que una dimensión mala no se compensa | [`MODELO.md`](../MODELO.md) |
| Dos síes | 14 | La puerta, la carta primero, nadie se entera de un no, se puede reabrir | `src/datos.js`, `src/chispa.js` |
| Cómo funciona | 18 | Correo como llave, pausa, llamadas, «No cruzarme con», correos discretos | el tablero |
| Sin publicidad | 20 | Cero anuncios, nada compra ventaja, gratis en 2026 y 2027, código abierto | `/programa` |
| En serio · Para él · Para invitar | 56 | Invitaciones y opinión de la casa | — |

**Lo que no se dice nunca:** «pareja garantizada», plazos («en 30 días»), «perfiles verificados» (todavía no se verifica identidad), cifras de usuarios, ni el nombre de otras apps. El dato del demo («9 de cada 100 cruces») siempre dice que es del demo.

## Verdades incómodas (la serie controversial)

Cincuenta frases que cuestionan cómo se ha escogido pareja hasta hoy: por lo físico, de entre muy pocos y a ciegas. Son más duras que el resto a propósito; por lo mismo, la regla es más estricta. Hay tres clases y cada una se sostiene distinto:

| Clase | Ejemplo | Qué la sostiene |
|---|---|---|
| **El dato** | «32 divorcios por cada 100 bodas.» | La fuente va escrita en la letra chica y ligada en el campo `f`. El taller enseña «📎 Ver la fuente del dato» y el texto para acompañarla la incluye. |
| **La cuenta** | «192 años te tomaría tener 10,000 primeras citas.» | Aritmética, con su supuesto dicho en la misma pieza («a una por semana», «si es una entre mil»). |
| **La tesis de la casa** | «Cuerpo, mente y espíritu. Los tres, o falta algo.» | Es lo que Cupido cree y lo que cruza (intimidad, forma de pensar y de pelear, fe y vida interior). No se presenta como dato. |

Lo que **no** dice ninguna, aunque suene bien: que las apps de deslizar «causan» divorcios (los estudios no coinciden: uno de 2021 en Reino Unido y otro de 2024 apuntan a matrimonios algo más frágiles; otro de 2013, pagado por eHarmony, dice lo contrario), que Cupido esté «comprobado por la ciencia» ni que use inteligencia artificial para cruzar (el motor es lógica publicada; la IA solo acomoda un texto dictado, si la persona lo pide). Tampoco promete pareja: lo que afirma es de la **muestra** (cuánta gente puede comparar un motor contra cuánta alcanza a conocer una persona) y de la **información** (lo que se pregunta antes de verse).

Cuando la frase habla de cuánta gente cruza Cupido, va en condicional («cuando tu ciudad llegue a 10,000 perfiles», «todas las personas que estén»): hoy no hay miles.

**De dónde sale cada dato** (verificado el 10 de octubre de 2026):

| Frase | Dato | Fuente |
|---|---|---|
| `divorcios-100`, `veinte-anos`, `sin-razon` | 31.6 divorcios por cada 100 matrimonios (25.7 en 2016); 33.1 % de los disueltos duró 21 años o más; 66.4 % incausados | [INEGI, Estadística de Divorcios 2025](https://www.inegi.org.mx/contenidos/saladeprensa/boletines/2026/ed/ED2025_CP.pdf) |
| `coahuila-48` | Coahuila 48.2 y Nuevo León 56.4 divorcios por cada 100 matrimonios | [INEGI, reporte de resultados 2025](https://www.inegi.org.mx/contenidos/saladeprensa/boletines/2026/ed/ED2025_RR.pdf) |
| `cuatro-de-diez` | 39.9 % de las mujeres de 15 años o más que han tenido pareja vivió violencia de su pareja a lo largo de la relación | [INEGI, ENDIREH 2021](https://www.inegi.org.mx/programas/endireh/2021/) |
| `la-dejaron` | 38.7 millones han descargado una app de citas; 8.6 millones activos | [The CIU, feb 2026 (Crónica)](https://www.cronica.com.mx/nacional/2026/02/13/citas-digitales-en-mexico-mas-de-86-millones-de-personas-buscan-el-amor-por-aplicacion/) |
| `agotados` | 78 % con fatiga de apps (Estados Unidos, 2024) | [Forbes Health, vía Global Dating Insights](https://www.globaldatinginsights.com/featured/survey-finds-over-three-quarters-are-suffering-dating-app-fatigue/) |
| `insatisfechos`, `sin-pareja-satisfecha` | 31 % no está satisfecho con su vida romántica; 82 % de quienes tienen pareja dice estar satisfecho con ella (29 países) | [Ipsos, Love Life Satisfaction 2026](https://www.ipsos.com/es-mx/mayor%C3%ADas-fuertes-se-sienten-amadas-satisfechas-con-su-pareja-el-d%C3%ADa-de-san-valent%C3%ADn) |
| `tres-anos` | 12 % de quienes se conocieron en línea se divorció en los primeros tres años, contra 2 % de los presentados por familia o amigos (Reino Unido, 2,000 personas; correlación, no causa) | [Marriage Foundation, 2021](https://marriagefoundation.org.uk/wp-content/uploads/2021/10/MF-press-release-online-weddings.pdf) |
| `deslizar-cansa` | La probabilidad de aceptar cae 27 % del primer perfil al último | [Pronk y Denissen, 2020](https://research.tilburguniversity.edu/en/publications/a-rejection-mind-set-choice-overload-in-online-dating/) |
| `miedo-sola` | El miedo a la soltería predice conformarse con menos | [Spielmann y otros, 2013](https://www.utoronto.ca/news/bad-relationships-and-fear-being-single) |
| `cinco-cuadras` | Una de cada tres parejas vivía a cinco cuadras o menos (5,000 actas, Filadelfia) | [Bossard, American Journal of Sociology, 1932](https://www.journals.uchicago.edu/doi/10.1086/216031) |
| `secretaria` | Conociendo candidatos de uno en uno, la mejor estrategia acierta 1/e ≈ 37 % | Resultado matemático: el problema de la secretaria |
| `una-entre-mil`, `anos-192`, `cien-veces` | 1 − 0.999¹⁰⁰ = 9.5 %; 1 − 0.999¹⁰⁰⁰⁰ > 99.9 %; 10,000 ÷ 52 = 192 | Cuenta propia, con el supuesto escrito en la pieza |

La tarjeta para páginas ajenas **no** saca estas frases en su rotación diaria: solo aparecen si quien pega la tarjeta las pide por su clave.

## La cuenta: el orden de publicación

`public/js/orden.js` es el calendario: todas las frases en el orden en que conviene publicarlas, tres por renglón (un día). Cada día lleva un **gancho** que detiene el dedo (una verdad incómoda, una pregunta o «lo contrario»), una **del corazón** (ella manda, lo que se siente, en serio, los dos síes) y una **prueba** (cómo funciona, los números, sin publicidad, para él, para invitar). El gancho cambia de columna cada día para que la cuenta no se vea en franjas.

- Cada entrada es `'clave'` (fondo blanco), `'clave/negro'` o `'clave/rosa'`. Las verdades incómodas van en negro y la regla de la casa en rosa.
- **La lista es el calendario y se edita a mano.** Una frase nueva que no esté en la lista sale sola al final; una que se quite, se salta.
- Se armó con `node scripts/armar-orden.mjs`. Volver a correrlo rehace todo: no hacerlo si ya se empezó a publicar.
- En la galería, «📱 La cuenta» las pinta todas (como imágenes, no lienzos, para que cientos no pesen) con la cabecera de un perfil. Al tocar una, el taller dice su turno («Publicación 10 de 325 · día 4»).
- «⬇ Bajar las 325 numeradas, en orden» arma un `.zip` con `001_…png` a `325_…png` y `000_calendario.txt` (día por día, con el texto para acompañar cada una y su fuente).
- A tres por día alcanza para 109 días; a una por día, para casi un año.

## Lo que sí vive como archivo

| Carpeta | Qué | Cómo se rehace |
|---|---|---|
| `public/videos/` | Los 154 videos, en dos versiones, y `lista.json` | `node scripts/videos-compartir.mjs` |
| `public/musica/` | Los cuatro fondos, emparejados | Bajar de R2 y pasar por ffmpeg (ver arriba) |
| `public/img/compartir/` | La imagen de la liga (blanca, negra y rosa, más la de «ella» y la de «gratis»), las tres insignias y los perfiles | `node scripts/piezas-compartir.mjs fijas` |
| `public/letras/` | Fraunces e Inter, cada una en un zip con su licencia y cómo instalarla | Bajarlas de Google Fonts y volver a empacar |

`piezas-compartir.mjs` también saca hojas de contacto con todas las frases (`hojas <carpeta> [medida]`), una lista suelta (`lista`), la tira de cuadros de un video (`pelicula`) o una grabación de prueba (`video`), para revisar el pintor sin abrir el navegador.

## La tarjeta para páginas ajenas

`/incrustar` es una página chica pensada para vivir dentro de un `iframe`. No guarda nada, no rastrea a nadie y solo carga sus letras.

- `?frase=<id>` fija una frase. Sin eso, la frase **cambia cada día**.
- `?fondo=blanco|negro|rosa`
- `?i=<código>` hace que el botón lleve a la liga de quien la pegó.

## Decisiones tomadas aquí

- **154 videos, no 100.** Se pidieron 100; salieron 154 porque había frases que lo merecían. Bajar la cuenta es quitar `v: 1` y borrar el archivo.
- **Los videos van en el repositorio** (66 MB: 24 sin audio y 41 con música). Es lo más simple y cualquier copia puede publicar. Cada vez que se rehacen todos, el repositorio crece otro tanto: si eso llega a estorbar, se mudan a R2.
- **Cada video trae una sola música**, la de su serie. Las otras tres se graban en el navegador al pedirlas.
- **«Con mi frase» está abierto.** Cualquiera puede escribir su frase con el estilo y la marca de Cupido. Se quita con una línea (el botón `mia`).
- **Las piezas llevan la dirección de la casa, no la liga personal.** Una liga impresa no se puede tocar; la personal va en el texto que acompaña. Quien quiera, la enciende o pone el código QR.
- **La liga personal no da ventaja en el motor.** Solo cuenta a cuántas personas trajo cada quien.
- «Encuentra tu pareja perfecta» quedó como **«Encuentra a tu pareja ideal»**: el corte es 90 %, no 100.

## Lo que falta probar con las manos

- **Oír la música.** Se midió (duración, volumen, que empiece de inmediato), pero no la oyó nadie antes de publicarla.
- Subir un video a TikTok, Reels y Shorts, y mandarlo por WhatsApp.
- Compartir directo desde un teléfono de verdad (la hoja de compartir con la imagen y con el video).
- Cómo se ve la vista previa de la liga dentro de WhatsApp, Facebook y X.
- La tarjeta incrustada en un sitio ajeno real.
