# Compartir

> Autor: Ing. Ricardo López Reyero · RLR
> Código: [`public/js/piezas.js`](../public/js/piezas.js) (las frases, las medidas y el pintor), [`public/js/compartir.js`](../public/js/compartir.js) (la sección), [`public/compartir.html`](../public/compartir.html) (la página pública), [`public/incrustar.html`](../public/incrustar.html) (la tarjeta para páginas ajenas) y [`scripts/piezas-compartir.mjs`](../scripts/piezas-compartir.mjs) (las pocas piezas que sí son archivo).

Todo lo que alguien necesita para hablar de Cupido, en un solo lugar y a un toque. **Entre más se comparte, más fácil que cada quien encuentre a su persona.**

Está en dos lugares, y es la misma sección:

- **En el tablero:** menú de la izquierda → 📣 **Compartir** (`/persona#compartir`). Usa la liga personal de quien entró (`/i/<código>`), la que cuenta a cuántas personas trajo.
- **Pública:** [`/compartir`](https://cupido.capitaltorreon.com/compartir). Para quien quiere ayudar sin tener cuenta (alguien que ya tiene pareja, un creador, una amiga). Usa la liga de la casa; si la persona ya entró, usa la suya.

## Lo que trae

| Parte | Qué es |
|---|---|
| **Tu liga** | Copiar, WhatsApp, Facebook, X, Telegram, correo, «Más…» (la hoja de compartir del teléfono) y su código QR. |
| **Galería** | 64 frases en 8 series, en 5 medidas y 3 fondos. Se filtran por serie; cada pieza se abre en el taller. |
| **El taller** | Una pieza en grande: cambiar medida, fondo y acomodo; quitar la letra chica o la dirección; poner la liga personal o un código QR; descargar (PNG), copiar la imagen, compartir directo desde el teléfono, o bajarla **en video**. También «Con mi frase»: la persona escribe la suya con el estilo de la casa. |
| **Textos** | Para Instagram, TikTok, YouTube, Facebook y X, con la liga ya puesta, y las etiquetas. |
| **WhatsApp** | Cinco mensajes (para una amiga, un amigo, un grupo, quien ya tiene pareja y el estado) y el corazón para la foto del grupo. |
| **Qué va en cada red** | La tabla red → pieza → medida. Tocar una fila acomoda la galería. |
| **Código para tu página** | Botón (solo HTML), insignia (imagen), tarjeta con frase (iframe) e imagen con liga. Todos llevan la liga de quien los copia. |
| **La marca** | Logotipo, color, tipografía, cómo suena, tres reglas y la guía de estilos descargable. |
| **Descargar todo** | Un zip con todo lo anterior (339 archivos, unos 40 MB). |

## La idea de estilo

**Texto negro, fondo blanco y un solo color: el corazón.** Lo contrario a como se ven las apps de citas, porque Cupido es lo contrario.

- **Fraunces 600** para decir; su cursiva, para lo que importa. **Inter 500** para explicar, en gris y en chico. Las dos son libres (SIL OFL).
- El corazón es el mismo trazo del favicon, en rosa `#d6455f`. Texto `#111111` sobre `#ffffff`.
- El negro y el rosa de fondo existen para variar un muro, no como estilo principal.
- Tres acomodos: arriba, al centro y abajo. La marca siempre va al pie; la dirección, a su lado.
- Tres recursos de texto: `\n` parte el renglón, `*así*` va en cursiva y `~así~` va tachado (con la raya en rosa).

## Las piezas no son archivos

Cada pieza es una **receta** (frase + medida + fondo) que `piezas.js` pinta en un lienzo, en el navegador de quien la baja, a la medida exacta. Por eso:

- La galería no pesa: no hay 960 imágenes en el servidor.
- Una frase nueva aparece en las cinco medidas y los tres fondos el mismo día.
- La pieza puede llevar la liga personal o su código QR.
- El zip se arma en el equipo de la persona, con su liga adentro.

El pintor busca solo el tamaño de letra más grande que quepa, respeta los renglones partidos a mano mientras la letra no tenga que achicarse demasiado, y empareja los renglones para que no quede una palabra sola al final.

### Las medidas

| Medida | Tamaño | Para |
|---|---|---|
| Vertical 4:5 | 1080 × 1350 | Publicación de Instagram y Facebook |
| Cuadrado | 1080 × 1080 | Instagram, Facebook y grupos de WhatsApp |
| Historia 9:16 | 1080 × 1920 | Historias, Reels, TikTok, Shorts y estados. Lo importante va entre 270 y 1570 px: arriba y abajo lo tapan los botones de cada red. |
| Horizontal 16:9 | 1920 × 1080 | YouTube: miniatura, video y pantalla final |
| Liga | 1200 × 630 | Facebook, X y LinkedIn con liga |
| Portadas | 1640 × 624 · 2560 × 1440 · 1500 × 500 | Facebook, banner de YouTube (lo importante en el centro de 1546 × 423) y encabezado de X |
| Perfil | 1080 × 1080 | Todas las redes lo recortan en círculo: el corazón va al centro |

### El video

«En video» graba el mismo lienzo mientras las palabras van entrando una por una, luego la letra chica y al final la marca. Dura de 5 a 7 segundos según el largo de la frase. Sale en **MP4** (H.264) donde el navegador puede y en WebM donde no. Va **sin sonido**: la música la pone cada quien en su red. En el teléfono son dos toques: el primero graba y el segundo abre «guardar o mandar», porque el sistema pide un toque fresco para eso.

## Las frases dicen la verdad

Regla: **toda frase de la galería se puede comprobar en la plataforma.** Si el producto cambia, la frase se cambia o se quita.

| Serie | Lo que afirma | Dónde se comprueba |
|---|---|---|
| Ellas mandan | Bloquear es inmediato; diez bloqueos retiran la cuenta; su foto la enciende ella; él no insiste (cinco mensajes); modo discreta | [`docs/ELLA.md`](ELLA.md), `src/ella.js` |
| Lo contrario | No hay perfiles que navegar ni fotos que deslizar; el corte es 90 % | `/`, [`MODELO.md`](../MODELO.md) |
| El 90 % | 43 preguntas una sola vez; se avisa a los dos; el cruce es en las dos direcciones | `public/js/motor.js`, `public/js/preguntas.js` |
| Dos síes | La puerta se abre con dos síes; nadie se entera de un no; primero la carta; el perfil se libera por elementos | `src/datos.js`, `public/js/elementos.js` |
| Sin publicidad | Cero anuncios; nadie paga por aparecer primero; gratis en 2026 y 2027; sin contraseña | `/programa`, `src/programa.js` |
| En serio · Para él · Para invitar | Invitaciones y opinión de la casa; no prometen resultados | — |

**Lo que no se dice nunca:** «pareja garantizada», plazos («en 30 días»), «perfiles verificados» (todavía no se verifica identidad), cifras de usuarios, ni el nombre de otras apps.

Para agregar una frase: una línea en `FRASES` de `piezas.js` (`id`, serie `s`, acomodo `c`, texto `t`, explicación `e`). El `id` no se cambia después: es parte del nombre del archivo y de la dirección de la tarjeta (`/incrustar?frase=<id>`).

## Lo que sí vive como archivo

Solo lo que otra página tiene que pedir por dirección. Está en `public/img/compartir/` y se regenera con el servidor local corriendo:

```bash
node scripts/piezas-compartir.mjs fijas
```

- `liga.png`, `liga-ella.png`, `liga-gratis.png`: la imagen que sale al pegar la liga en WhatsApp, Facebook, X o LinkedIn (`og:image` de la portada, `/bienvenida`, `/entrar`, `/compartir`, los artículos, `/ella` y `/programa`). Antes de esto, la liga se veía sin imagen.
- `insignia-clara.png`, `insignia-oscura.png`: la insignia para páginas.
- `perfil-*.png`: el corazón para la foto de perfil.

El mismo script saca hojas de contacto con todas las frases (`hojas <carpeta>`), una pieza suelta (`una`) o un video (`video`), para revisar el pintor sin abrir el navegador. Abre un Chrome sin ventana y no usa librerías.

## La tarjeta para páginas ajenas

`/incrustar` es una página chica pensada para vivir dentro de un `iframe`. No guarda nada, no rastrea a nadie y solo carga sus letras.

- `?frase=<id>` fija una frase. Sin eso, la frase **cambia cada día** (la misma para todo el mundo ese día; las de «Para invitar» no entran).
- `?fondo=blanco|negro|rosa`
- `?i=<código>` hace que el botón lleve a la liga de quien la pegó.
- Si la frase es larga para el hueco, la letra se achica hasta que el botón cabe.

## Decisiones tomadas aquí

- **«Con mi frase» está abierto.** Cualquiera puede escribir su frase con el estilo y la marca de Cupido. Se le recuerda decir lo que es cierto, pero nada lo impide. Si se abusa, se quita con una línea (el botón `mia` de `compartir.js`).
- **Las piezas llevan la dirección de la casa, no la liga personal.** Una liga impresa en una imagen no se puede tocar; la personal va en el texto que acompaña. Quien quiera, la enciende («Que sea mi liga») o pone el código QR.
- **La liga personal no da ventaja en el motor.** Solo cuenta a cuántas personas trajo cada quien. Así se dice en la sección.
- **«Ocultar fotos» no emborrona las imágenes de la marca** de esta sección (`data-priv-no`): no son de nadie.
- La frase de Ricardo «Encuentra tu pareja perfecta» quedó como **«Encuentra a tu pareja ideal»**, y se agregó «No buscas a alguien perfecto. Buscas a alguien que embone contigo.»: el corte es 90 %, no 100.

## Lo que falta probar con las manos

- Compartir directo desde un teléfono de verdad (la hoja de compartir con la imagen y con el video).
- Cómo se ve la vista previa de la liga dentro de WhatsApp, Facebook y X (las etiquetas están; cada red guarda su copia y puede tardar en refrescar).
- Subir un MP4 de estos a TikTok, Reels y Shorts.
- La tarjeta incrustada en un sitio ajeno real.
