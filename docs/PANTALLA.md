# Privacidad en pantalla

> Autor: Ing. Ricardo López Reyero · RLR
> Código: [`public/js/privado.js`](../public/js/privado.js) y el final de [`public/css/cupido.css`](../public/css/cupido.css).

Para grabar la pantalla, hacer un video o enseñarle Cupido a alguien sin enseñar de quién es.

## Dónde está

En el menú de la izquierda, pegado abajo junto al sonido, hay dos interruptores:

| Interruptor | Qué pone borroso |
|---|---|
| 🙈 **Ocultar nombres** | Todos los nombres de personas y todos los correos, donde aparezcan: saludo, menú, charlas, mensajes, avisos, panel. También la inicial de los círculos, el título de la pestaña y el botón de la cuenta de arriba a la derecha. |
| 🖼️ **Ocultar fotos** | Toda foto y todo video de la página: las fotos de perfil, las del menú y las que se mandan en la charla. |

En el teléfono hay además un botón arriba (👁️ / 🙈) que pone o quita los dos de un toque. El recorrido y el cuestionario, que no tienen menú, traen ese mismo botón.

Se quedan puestos al cambiar de sección, de página y al recargar, hasta que la persona los quita. Se guardan en ese equipo (`cupido.privado`) y **no viajan con la cuenta**: es para ese momento y esa pantalla.

## Cómo se logra que sean todos los nombres

Marcar a mano cada lugar donde sale un nombre no aguanta: el día que se agrega una pantalla, se olvida. Por eso:

1. **Se aprende de lo que llega.** Toda respuesta del servidor pasa por `aprender` antes de pintarse (`api()` en `ui.js`). De ahí salen los nombres que esa pantalla conoce. Solo cuenta el `nombre` de algo que parece una persona: un archivo o una dimensión del motor también tienen «nombre», y esos no se tocan.
2. **Un vigía mira lo que se pinta.** Envuelve cada nombre conocido y cada correo que encuentra en el texto, también en lo que aparece después: un mensaje que llega, un aviso.
3. **El borrón es CSS** sobre esa envoltura, así que quitarlo es instantáneo.

Lo que no es texto pintado se cuida aparte: el título de la pestaña (queda «•••»), los textos que salen al pasar el cursor, los campos donde se escribe el nombre y el aviso del sistema, que con los nombres ocultos dice solo «Tienes un mensaje nuevo».

Las fotos no necesitan vigía: con el interruptor puesto, toda imagen y todo video de la página se ven borrosos.

## Lo que no cubre

- **Un nombre que la pantalla no conoce.** Si alguien escribe en un mensaje el nombre de una tercera persona, ese no se borra.
- **Las vistas previas de correos del panel.** Van en su propio marco y traen nombres de ejemplo, no de personas reales.
- **No protege datos.** Es para la vista: quien tenga la pantalla puede quitarlo con un toque. No sustituye a cerrar sesión.
