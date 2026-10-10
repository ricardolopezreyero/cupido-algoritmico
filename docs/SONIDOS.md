# El sonido de Cupido Algorítmico

> Autor: Ing. Ricardo López Reyero · RLR
> Código: [`public/js/sonido.js`](../public/js/sonido.js) (el motor, el interruptor y los ajustes) y [`src/sonidos.js`](../src/sonidos.js) (cómo se creó cada sonido).
> Para oírlos todos: **[/admin#sonidos](https://cupido.capitaltorreon.com/admin#sonidos)**.

## Cómo se apaga

**Un toque.** El interruptor «Sonido» vive en el menú de la izquierda, pegado abajo, siempre a la vista: en el tablero y en el panel. En el teléfono también va arriba, junto al ☰. En el recorrido y en el cuestionario, que no tienen menú, el mismo botón va arriba a la derecha.

Al lado del interruptor hay un engrane con lo fino: el volumen y qué familia suena. Nadie tiene que entrar ahí para callar a Cupido.

## Qué apaga y qué no

| Se calla | Se oye siempre |
|---|---|
| Los avisos y efectos: un mensaje que llega, una coincidencia, una puerta, el timbre de una llamada, los toques | Lo que la persona pone a sonar a propósito: una nota de voz, un video, la voz de una llamada |

Con el sonido apagado, una llamada entra sin timbre: se ve en pantalla. El aviso del sistema que sale cuando la pestaña está oculta también llega en silencio.

## Las cuatro familias

Antes eran seis. «Interfaz», «logros» y «recorrido» se juntaron en una.

| Familia | Sonidos |
|---|---|
| 💬 La charla | mensaje, enviado, reaccion, sticker, voz_inicio, voz_fin, en_linea, detalle, carta |
| 💘 Coincidencias y puertas | coincidencia, si, puerta, tono |
| 📞 Llamadas | timbre, marcando, colgar |
| ✨ Toques de la app | toque, guardado, aviso, error, estilo, paso, bienvenida, logro, hito, gracias |

Son 26. Cuándo suena cada uno está en el catálogo (`SONIDOS`, campo `c`) y se ve en el panel.

## Reglas del motor

- **Todo precargado.** Del evento al sonido no hay espera. Si un archivo no llega, suena una campana hecha por código: nunca silencio por error.
- **Mientras alguien graba** una nota de voz, su voz o su video, los efectos se callan solos (`callar`), para que no queden grabados. El aviso de «empiezas a grabar» suena *antes* de que arranque la grabación.
- **La preferencia** se guarda en el equipo (`cupido.sonido.v2`) y viaja con la cuenta: `login.js` la sincroniza por esa clave. Si cambia en otra pestaña, el interruptor se pone al día solo.
- **Crear un sonido nuevo** con ElevenLabs (`/api/admin/sonidos/generar`) pide cuenta administradora: gasta créditos.

## Cómo se agrega un sonido

1. Una entrada en `PROMPTS` (`src/sonidos.js`) con la descripción para crearlo y su duración.
2. La misma clave en `SONIDOS` (`public/js/sonido.js`) con su familia, su volumen, su respaldo por código y **cuándo suena**.
3. El archivo en `public/sonidos/<clave>.mp3`.
4. `tocar('<clave>')` donde pase el evento. Un sonido que nadie toca no se queda en el catálogo.
