# Los correos de Cupido Algorítmico

> Autor: Ing. Ricardo López Reyero · RLR
> Código: [`src/correos.js`](../src/correos.js) (qué se manda y cuándo) y [`src/correo-diseno.js`](../src/correo-diseno.js) (cómo se ve).
> Para verlos todos juntos: **[/admin#correos](https://cupido.capitaltorreon.com/admin#correos)**.

Los correos son el camino de regreso a Cupido: alguien que no ha entrado en una semana vuelve porque un correo le contó algo suyo. Por eso se hacen con el mismo cuidado que una pantalla.

## Lo que todo correo cumple

1. **No se vende.** Cuenta algo que es de esa persona y la invita a **una** cosa. Todos traen un botón, y solo uno.
2. **Lleva lo suyo.** Su nombre, el porcentaje, en qué coinciden, lo que le espera adentro. Nunca «Estimado usuario».
3. **Cambia según quién lo lee.** A ella le recuerda que manda; a él, que ella decide el ritmo.
4. **Dice por qué llegó y cómo apagarlo**, con un clic y sin entrar a la cuenta.
5. **Pesa poco.** Gmail corta un correo a partir de **102 KB** de HTML y esconde el resto tras «Ver mensaje completo». Nuestro tope es **60 KB**; hoy el más pesado anda en 14 KB.
6. **Se lee sin lentes.** Letra de 16 px o más, contraste alto, botón grande para el pulgar.
7. **Se entiende sin imágenes.** La única imagen es el corazón de la marca. Con las imágenes apagadas no se pierde nada.

## Las partes, de arriba abajo

| Parte | Qué lleva |
|---|---|
| **Marca** | El corazón, «Cupido Algorítmico» y, a la derecha, la categoría del correo. |
| **Portada** | Un color según de qué se trata (el tono), una figura, el título y una línea. |
| **Cuerpo** | Bloques: párrafo, lista, cifras, burbujas, pasos, ficha, cita, aviso, chips, barra. |
| **Botón** | Lo que queremos que la persona haga. Ancho completo, con una línea chica debajo. |
| **Firma** | «Con cariño y con lógica, Cupido Algorítmico». Los serios firman «El equipo». |
| **Pie** | Las tres promesas de la casa, la invitación si se presta a reenviarse, por qué llegó y cómo apagarlo. |

## Los tonos

El color de la portada dice de qué se trata antes de leer una palabra.

| Tono | Para qué | Correos |
|---|---|---|
| `amor` (rosa) | Lo que casi nunca pasa | bienvenida, coincidencia, puerta, invitado |
| `noche` (oscuro) | Tu cuenta y tu llave | enlace, prueba, retirada, semana en silencio |
| `claro` (rosa pálido) | Lo de todos los días | matching, novedades, reabrir, semana |
| `sol` (ámbar) | Recordatorios y fechas | recordatorio, pendiente, cita_manana, revision, espacio |
| `calma` (verde) | Cuidado y gracias | reporte_recibido, reporte_atendido, regreso, gracias |
| `sereno` (arena) | Lo serio, dicho con calma | cierre, en_revision, los discretos |

Los colores y las letras son los del sitio (`TK` en `correo-diseno.js`): rosa `#d6455f`, tinta `#211d24`, crema `#faf7f4`, Fraunces para títulos e Inter para el texto, con Georgia y Helvetica de respaldo donde el buzón no carga letras.

## Los 22 correos

| Correo | Categoría | Tono | Invita a | Lo que lleva de la persona |
|---|---|---|---|---|
| `enlace` | Acceso | noche | Entrar a mi tablero | Su nombre y lo que le espera adentro (mensajes sin leer, coincidencias por responder) |
| `bienvenida` | Acceso | amor | Empezar mi cuestionario | Los tres pasos de cómo funciona |
| `matching` | Tu búsqueda | claro | Subir lo que le falta | Pares evaluados y qué ya subió (foto, voz, video) |
| `recordatorio` | Tu búsqueda | sol | Seguir donde iba | Su avance en una barra y cuántas preguntas le faltan |
| `coincidencia` | Tu búsqueda | amor | Ver por qué coinciden | El porcentaje, en qué coinciden y, a ella, lo que vemos de él |
| `pendiente` | Tu búsqueda | sol | Verlas y decidir | Cada coincidencia sin responder, con su porcentaje y sus días |
| `puerta` | Puertas | amor | Abrir mi charla con… | Las dos iniciales, el porcentaje y un pedazo de la carta de la otra persona |
| `cierre` | Puertas | sereno | Ir a mi tablero | El nombre. Es idéntico si cerró, bloqueó o reportó |
| `reabrir` | Puertas | claro | Ver y decidir | El porcentaje y en qué coincidían |
| `novedades` | Mensajes | claro | Contestarle a… | Todo lo que pasó en esa charla, como burbujas |
| `cita_manana` | Planes | sol | Abrir mi charla con… | El plan en una hoja de calendario; a ella, el aviso a alguien de confianza |
| `semana` | Tu semana | claro / noche | Lo que más le conviene hoy | Sus cifras de la semana. El botón cambia según la persona |
| `en_revision` | Acceso | sereno | Leer las reglas de la casa | Qué cambia y qué no mientras se revisa |
| `regreso` | Acceso | calma | Ir a mi tablero | — |
| `retirada` | Acceso | noche | Leer la regla de la casa | — |
| `reporte_recibido` | Seguridad | calma | Ver mis candados | A quién bloqueó y qué pasa ahora |
| `reporte_atendido` | Seguridad | calma | Ir a mi tablero | Si la cuenta reportada se retiró |
| `invitado` | Tu cuenta | amor | Compartir mi liga otra vez | Cuántas personas han llegado por ella, y su liga |
| `gracias` | Tu cuenta | calma | Ver el programa | Su apoyo, en una ficha |
| `revision` | Tu cuenta | sol | Revisar en un minuto | Lo que se pregunta cada seis meses |
| `espacio` | Tu cuenta | sol | Ver mi espacio | Cuánto lleva usado, en una barra |
| `prueba` | Acceso | noche | Elegir qué correos recibo | Todas las categorías de las que se le cuenta |

## Lo que se cuida

- **Lo íntimo no viaja por correo.** «En qué coinciden» nunca incluye la dimensión de intimidad: eso se lee adentro.
- **El enlace para entrar no se reenvía.** Los dos correos que lo llevan lo dicen claro y no traen la invitación al pie.
- **La invitación al pie** («¿Te reenviaron este correo?») solo va en los correos que no traen nada de otra persona. Lleva la liga de invitación de quien lo recibió, para que quien entre por ahí llegue por ella.
- **Correos discretos:** quien los enciende recibe todo sin nombres, sin contenido y sin la categoría arriba.
- **Lo que no se manda nunca:** que alguien dijo que no, que alguien bajó el tono, que alguien guardó de nuevo algo que había compartido.

## Cómo se agrega un correo

En `CORREOS` (`src/correos.js`) se agrega una entrada con:

- `cat`: la categoría, para que se pueda apagar.
- `cuando`: en una frase, cuándo sale (se enseña en el panel).
- `muestra()`: datos de ejemplo, completos, para la galería.
- `prepara(env, P, datos)` (opcional): lo que hay que buscar en la base para personalizarlo. Si falla, el correo sale igual, más sencillo.
- `arma(env, datos)`: devuelve `{ asunto, contenido }`, con `tono`, `figura`, `eyebrow`, `titulo`, `sub`, `vista` (la línea que se ve en la bandeja), `cuerpo` (bloques) y `boton`.
- `reenvio: true` si se presta a reenviarse y no trae nada de otra persona.

Todo texto que venga de una persona pasa por `esc()` antes de entrar a un bloque.

## La revisión

`GET /api/admin/correos/revision` arma cada correo como lo lee ella, él y alguien sin género, en su versión normal y en la discreta, más los casos más cargados (122 en total). A cada uno le exige: marca arriba, título, línea de bandeja, un botón, firma, por qué llegó, ligas que abren desde un correo, texto alterno en las imágenes, versión de puro texto, asunto de menos de 78 letras, ningún dato vacío y pesar menos de 60 KB. El resultado se ve en el panel, en «La revisión».

Además, cada envío real mide su peso: si alguno pasa del tope, queda anotado en la bitácora.

## La marca en PNG

Gmail y Outlook no pintan SVG. El corazón se genera a partir del mismo trazo del favicon con `python3 scripts/marca-correo.py` y queda en `public/img/correo/`.
