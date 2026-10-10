# Cupido como app

> Autor: Ing. Ricardo López Reyero · RLR
> Código: [`public/manifest.webmanifest`](../public/manifest.webmanifest), [`public/sw.js`](../public/sw.js), [`public/js/app.js`](../public/js/app.js) y los iconos en `public/app/` (se generan con `python3 scripts/iconos-app.py`).

Cupido se puede instalar en el teléfono (Android y iPhone) y en la computadora (Chrome, Edge, Safari). **Es opcional:** en el navegador funciona igual. Instalada abre en su propia ventana, con su icono, sin la barra del navegador.

## Cómo se instala en cada equipo

| Equipo | Cómo |
|---|---|
| Android (Chrome) | Un toque en «Instalar Cupido». |
| Computadora (Chrome, Edge) | Un toque en «Instalar Cupido», o el icono de instalar en la barra de direcciones. |
| iPhone y iPad | Compartir → «Agregar a inicio». El navegador no deja hacerlo con un botón: Cupido enseña los pasos. |
| Mac (Safari) | Archivo → «Agregar al Dock». |
| Firefox en computadora | No instala apps web. Se le dice, sin rodeos. |
| Dentro de Instagram, Facebook u otra app | Primero hay que abrirlo en el navegador. También se le dice. |

«Instalar Cupido» está en el menú de la izquierda del tablero y del panel, en la página de entrar y al pie de la portada. Desaparece cuando ya está instalada.

## Qué hace el trabajador de servicio

- **Los datos vivos nunca se guardan.** Todo lo de `/api/` (la charla, las fotos, los videos, las respuestas) va siempre a la red.
- **Páginas y código: primero la red.** Cada quien tiene la versión de hoy; la copia guardada solo se usa si no hay conexión. Así un despliegue nuevo nunca deja a alguien con código viejo.
- **Lo que no cambia: primero la copia.** Sonidos, iconos y letras se bajan una vez. La segunda visita abre de inmediato.
- **Sin conexión**, una página propia lo dice y se actualiza sola cuando vuelve la red.

Para tirar todo lo guardado en la siguiente visita se sube `VERSION` en `sw.js`.

## Pantalla completa

El botón «Pantalla completa» está en el menú de la izquierda, junto a «Ocultar nombres» y «Ocultar fotos». Sirve para dejar Cupido abierto en un segundo monitor. Mientras dura, la pantalla no se duerme sola. En iPhone el navegador no lo permite, y ahí el botón no aparece: la app instalada ya ocupa toda la pantalla.

## Entrar desde la app en iPhone

En iPhone la app instalada guarda su sesión aparte de Safari, igual que el navegador de adentro de Gmail. El enlace del correo abre en Safari y la app se queda sin entrar. Por eso el correo trae también un **código de ocho números**: se escribe donde se pidió entrar.

- Vale lo mismo que el enlace: 20 minutos y una sola vez.
- Solo sirve el del último correo.
- Cinco intentos por código y diez al día por correo. Después, solo el enlace.
- Sigue sin haber contraseña.

## Lo demás

- **El icono trae la cuenta** de lo que espera (coincidencias por responder, mensajes sin leer y avisos), donde el sistema lo permite.
- **Si se va la conexión**, una franja lo dice; al volver, el tablero y la charla se ponen al día solos.
- **Atajos** al dejar presionado el icono: Mis charlas, Mis coincidencias, Mi cuestionario.
- **Cajas de texto a 16 px** en pantallas táctiles: abajo de eso el iPhone hace zoom solo al escribir.

## Lo que la app todavía no hace

- **No avisa con Cupido cerrado.** Para oírlo hay que tenerlo abierto y con el sonido encendido. Los avisos con la app cerrada (notificaciones push) son otro trabajo: piden una llave nueva y guardar a qué equipo avisarle.
- **No funciona sin internet.** Cupido cruza y conversa en vivo; sin red solo puede decir que no hay red.
