# La lista completa

Todo lo que falta para pasar del demo a **un millón de personas buscando pareja en serio** — en orden de prioridad. Marcado ✅ lo que ya quedó.

<!-- Autor: Ricardo López Reyero · RLR · rev 181218 -->

> **Cómo leerla:** la sección 1 bloquea el lanzamiento con personas reales (privacidad, ley, seguridad). La 2 es para que funcione bien con miles. La 3 es para el millón. La 4 es lo que convierte un buen algoritmo en el mejor: datos reales. La 5 son decisiones que solo tú puedes tomar.

---

## ✅ Lo que ya quedó (v2 · 14 de septiembre de 2026)

- [x] **Motor v2**: vetos de ida y vuelta con explicación, 10 dimensiones calculadas en las dos direcciones, pesos personales, media geométrica + media armónica, techos y calidad de lectura. ([MODELO.md](../MODELO.md))
- [x] **Revisión de lo sexual**: tipo de deseo (espontáneo / responsivo), comunicación íntima, importancia y negociabilidad como peso personal, qué enciende y qué apaga cruzado con cómo da cariño el otro, rejilla de innegociables (incluye esperar al matrimonio y planificación natural).
- [x] **Revisión de lo espiritual**: tradición, práctica e importancia separadas; veto de fe con práctica; formación espiritual de los hijos; prácticas reales y si se comparten o se respetan; cercanía entre tradiciones.
- [x] **Cuestionario v2** con anclas estructuradas junto a cada pregunta abierta y "quién eres / a quién buscas".
- [x] **Umbral de 90 %**: solo se muestran coincidencias de 90 hacia arriba, ordenadas (96, 95, 94…).
- [x] **Avisar sin dejar entrar**: aviso a los dos al mismo tiempo, identidad protegida, puerta que solo se abre con dos síes, nadie se entera de un no, retiro silencioso si baja del umbral.
- [x] **Demo**: 10 hombres y 10 mujeres ficticios con las 43 preguntas completas (estructuradas + textos).
- [x] **Tablero de la persona** (menú a la izquierda, contenido a la derecha) sin contraseña y con cerrar sesión: Inicio con cifras, camino de 5 pasos y logros · Mis coincidencias (con la puerta) · Aceptaciones agrupadas (esperan tu respuesta, tu sí esperando, puertas abiertas, preferiste no abrir) · Avisos · Lo que más pesa · Mis respuestas en las 10 categorías · Qué tan bien me conoce · Lo que me deja fuera · Privacidad y pausa del perfil.
- [x] **Panel admin**: resumen con cifras, distribución, vetos por tipo, matriz 10 × 10, detalle de cada par en las dos direcciones, personas con sus respuestas y pesos, puertas, corrida manual por fases, laboratorio de pesos en vivo, bitácora en vivo.
- [x] **Artículos**: cualquiera publica sin cuenta, lectura cuidada y lista para compartir por WhatsApp, borrador local, anti-spam básico (trampa para robots, límite por IP, palabras sospechosas a revisión) y moderación desde el admin. 6 artículos iniciales.
- [x] **Cuestionario conectado**: autoguardado, "lo pienso después" y motor automático al terminar; guarda en la cuenta de la persona.
- [x] **Privacidad en pantalla** (10 oct 2026): dos interruptores en el menú de la izquierda, junto al sonido, para grabar o enseñar Cupido sin enseñar de quién es. «Ocultar nombres» pone borrosos todos los nombres de personas y los correos, donde aparezcan (también la inicial de los círculos, el título de la pestaña y el botón de la cuenta); «Ocultar fotos», toda foto y todo video. Se quedan puestos al cambiar de sección o recargar, en ese equipo. No se marcó cada lugar a mano: lo que llega del servidor enseña qué nombres hay y un vigía los envuelve donde se pinten. En el teléfono, un botón arriba pone o quita los dos. La guía, en [PANTALLA.md](PANTALLA.md).
- [x] **El sonido, simple** (10 oct 2026): encender o apagar es un toque. El interruptor «Sonido» vive en el menú de la izquierda, pegado abajo y siempre a la vista (tablero y panel); en el teléfono también va arriba, y en el recorrido y el cuestionario, que no tenían cómo callarse, va en la barra. El engrane guarda lo fino: volumen y cuatro familias (antes seis). Se quitaron el botón de la charla, que en el teléfono ni se veía, y la tarjeta escondida en Privacidad. Apagar calla avisos y efectos; una nota de voz, un video o la voz de una llamada se oyen siempre. Mientras alguien graba, los efectos se callan solos. La preferencia ahora sí viaja con la cuenta (se sincronizaba una clave que ya no se usaba). Crear sonidos con ElevenLabs pide cuenta administradora. De paso: en el teléfono el botón de la cuenta tapaba el ☰ y el menú no se podía abrir. Catálogo para oírlos en `/admin#sonidos`; la guía, en [SONIDOS.md](SONIDOS.md).
- [x] **La experiencia auditiva** (4 oct 2026): 20 sonidos creados con ElevenLabs (efectos de sonido, familia cálida de madera y campana) en `src/sonidos.js` (prompts), guardados en R2 y servidos como estáticos desde `public/sonidos/` (cacheados un año). Motor `public/js/sonido.js`: Web Audio, todo precargado y decodificado al abrir la página, reproducción por AudioBufferSource (del evento al sonido ~0 ms), desbloqueo con el primer toque en iPhone/Android, respaldo por código si un archivo no llega, antimetralleta. Cinco familias apagables (charla, coincidencias y puertas, logros e hitos, interfaz, recorrido) con volumen y 'probar', en Privacidad y pausa y en el 🔈 de la charla. Eventos: mensaje, enviado, reacción, sticker, voz inicio/fin, en línea, coincidencia nueva, tu sí, puerta abierta, logro, hito, toque, guardado, aviso, error, estilo, paso del recorrido, bienvenida, gracias. Regenerar un sonido: `POST /api/admin/sonidos/generar {id}` y bajarlo de `/api/admin/sonidos/<id>.mp3` a `public/sonidos/`.
- [x] **El recorrido v3: una voz para ella y otra para él** (10 oct 2026): ocho pantallas en lugar de diez. La primera pregunta quién llega (nombre, soy, busco) y de ahí cambia todo: a ella se le habla de control («aquí nadie te ve hasta que tú dices que sí», «aquí mandas tú») y deja listos sus candados (decidir primero, modo discreta, no cruzarme con); a él, de llegar completo, y acepta la regla tocando tres compromisos. Lo completo se enseña con los números del motor (un cruce de 96 % se queda en 82 % con respuestas de una línea). Una pantalla dice que aquí no hay publicidad ni la habrá; también la portada y el pie de las páginas. El cuestionario abre con lo ya contestado, acompaña al entrar a cada bloque y dice qué tan nítida va cada respuesta abierta; el tablero estrena la tarjeta «Tu perfil». Sigue siendo obligatorio la primera vez. La guía, en [RECORRIDO.md](RECORRIDO.md).
- [x] **El recorrido v2** (4 oct 2026, decisión de Ricardo): nueve pantallas con movimiento (qué es Cupido, las 43 preguntas con dictado y pincel, el motor, el silencio, la puerta, la charla, la confianza por elementos, foto/voz/video al final, el tablero y el programa). **Obligatorio y sin salida** la primera vez: el Worker no deja entrar a /persona ni /cuestionario sin terminarlo (cuentas reales por `ajustes.bienvenida`; la cuenta demo por dispositivo). Tres segundos mínimo por pantalla con reloj antes de "Siguiente"; botón Automático que avanza solo cada 3 s; el avance se guarda (`bienvenida_paso`) y al volver sigue donde se quedó. Al terminar, "Volver al recorrido" en el menú durante 7 días (`bienvenida_fecha`); el repaso sí permite volver al tablero.
- [x] **Bienvenida** (16 sep 2026): onboarding de seis pasos en `/bienvenida` con mini-demos que se tocan (pregunta que se responde, motor en dos direcciones con barras y total, lista con una sola arriba del 90 %, puerta que se abre con dos síes, charla con hola automático y elementos que se liberan, tablero con camino y colores). Flechas, deslizar en celular, saltar, progreso. Las cuentas nuevas llegan aquí desde el enlace mágico; también desde la entrada, la landing y el tablero. Bandera `ajustes.bienvenida` al terminar.
- [x] **Dictar y pulir** (4 oct 2026): en cada respuesta abierta del cuestionario, 🎤 Dictar (reconocimiento de voz del navegador en español, sin instalar nada; cierra frases con punto y sigue escuchando) y 🖌️ Pulir (Workers AI, Llama 3.3 70B: quita muletillas y reacomoda sin cambiar hechos ni voz; la persona ve antes/después y decide). En la charla, 🗣️ dicta en la caja. Pendiente: Wispr u otro dictado externo si Ricardo lo prefiere.
- [x] **Charla v4** (4 oct 2026, con lo aprendido del chat de la Mina): aviso abajo un momento cuando llega un mensaje y estás en otra sección del tablero (clicable, con sonido suave por código y apagable), responder citando (con salto al original), guardados privados (🔖), buscar dentro de la charla (🔍, salta y resalta), historial que se carga hacia atrás al subir (ventanas de 80), hitos automáticos (50/200/1000 mensajes; 7/30/100 días desde la puerta, por cron), su carta siempre a la mano (✉️), contador de mensajes y antigüedad de la puerta, y limpieza del texto (sin caracteres de control ni marcas invisibles).
- [x] **Charla v3, en vivo de verdad** (16 sep 2026): Durable Object `CharlaViva` (uno por charla) con WebSockets: mensajes, reacciones, visto, "está escribiendo" y presencia llegan al instante; sondeo solo como respaldo (12 s conectado, 2.5 s si se cae) y reconexión con espera creciente. Presencia "en línea / última vez hace X". Mensajes agrupados por persona y minuto (avatar y hora solo al cierre del grupo), emojis grandes cuando van solos, enlaces clicables seguros, burbuja de "escribiendo" en el hilo, divisor "Mensajes nuevos", botón "↓ N" al estar arriba, borrador por charla, título "(1)" y avisos del navegador opcionales (🔔), barra de progreso al mandar archivos, límite de 40 mensajes por minuto, lista de charlas con no leídos primero, panel de perfil plegable en celular.
- [x] **Charla v2** (16 sep 2026): emojis por grupos y stickers, GIF por Tenor listo pero apagado, foto (se reduce en el navegador), video, nota de voz grabada, archivo, pegar y arrastrar, reacciones (❤️😂😮😢👍🔥, una por persona), "Visto ✓✓", separadores por día, rompehielos cuando solo hay saludos automáticos, envío optimista, sondeo cada 1.8 s solo con la pestaña visible.
- [x] **La charla** (16 sep 2026): nace sola al abrirse la puerta; el sistema manda el primer "hola" de parte del hombre y luego de la mujer; texto y archivos adjuntos (fotos, PDF, audio, video, documentos; 15 MB; en R2, solo para los dos); nada se borra; "está escribiendo" en tiempo real (sondeo cada 2.5 s); no leídos en el menú.
- [x] **Liberar el perfil por elementos** (16 sep 2026): al abrir la puerta nadie ve nada más que la carta. Diez elementos: seis suaves (quién soy, visión de vida, personalidad, afecto, vida cotidiana, profundidad) se proponen con confirmación; cuatro sensibles (fe/hijos/vida interior, valores/dinero/política, conflicto, intimidad) se liberan después, uno por uno, con doble confirmación y sin retirar. La otra persona solo recibe las respuestas de lo liberado; el servidor filtra por pregunta.
- [x] **Cuestionario v2.1** (16 sep 2026): dos preguntas íntimas más (P39 día a día: contacto, iniciativa, forma natural, después; P40 historia y "hoy no") + dos filas en innegociables (pruebas de salud sexual, fantasías sin juicio) + comida y cocinar en hábitos con veto suave "solo alguien que se cuida" vs "como lo que se me antoja". 43 preguntas. Los 20 perfiles del demo completados; misma forma (9 parejas ≥90).
- [x] **Mi vida hoy** (16 sep 2026): 10 elementos de la vida con icono (pareja, familia, hijos, amigos, trabajo, dinero, salud, espíritu, diversión, legado), deslizador de 0 a 100 %, rueda que cambia en vivo y lectura corta (promedio, lo más lleno, lo más vacío). Se guarda en la cuenta; el admin lo ve en el detalle de la persona. Es espejo, no filtro: no entra al cálculo. Idea de Ricardo para después: usarlo hacia un eneagrama.
- [x] **Mi estilo** (16 sep 2026): la persona elige color (Rosa Cupido, Vino, Azul profundo, Verde bosque) y tipografía (Clásica, Editorial, Moderna, Cálida) para su tablero; se guarda en su cuenta y se aplica sin parpadeo al entrar.
- [x] **Foto, voz y video** (16 sep 2026): sección del tablero que se abre solo con el cuestionario al 100 %; foto (se reduce en el navegador), voz (grabar hasta 90 s o subir) y video (grabar hasta 45 s o subir) en R2 `cupido-medios`; el avatar del menú se cambia tocándolo. La otra persona solo los ve cuando la puerta se abrió; el Worker verifica la puerta antes de servir cada archivo.
- [x] **Acceso sin contraseñas** (16 sep 2026): el correo es la cuenta → enlace mágico (20 min, un solo uso, límite por correo e IP); sesión en cookie HttpOnly de 90 días; cerrar sesión. **Cuenta demo a un clic** (`/demo`): tablero de Diego con puerta abierta, coincidencia esperando y avisos; se limpia en cada entrada; interruptor "cuenta demo" que no se apaga: invita a crear cuenta.
- [x] **Infraestructura**: Cloudflare Worker + D1, código en GitHub, 17 pruebas del motor que corren antes de cada despliegue.

---

- [x] **Aquí manda ella** (9 oct 2026): la regla de la casa, completa en [ELLA.md](ELLA.md) y en la página `/ella`. Si ella bloquea, queda bloqueado; **diez mujeres distintas → fuera para siempre** (la cuenta se retira y su correo no vuelve a entrar); tres reportes → sale del matching hasta que una persona lo revise. **Cerrar no es bloquear**: cerrar la puerta no castiga a nadie y se puede volver a abrir. Candados en la charla: él no manda fotos, video, voz ni archivos hasta que ella lo permite; cinco mensajes sin respuesta y le toca esperar; la foto, la voz y el video de ella los enseña ella, no la puerta; lo compartido del perfil se puede guardar de nuevo; borrar la charla. Además: modo discreta, «que nadie sepa de mí hasta que yo diga sí», «no cruzarme con» (por correo, guardado como huella), lo que ella ve de él antes de decidir (días aquí, charlas abiertas, bloqueos), la guía de primera cita con el aviso para alguien de confianza, pantalla nueva en el recorrido (10 pantallas) y panel «Aquí manda ella» en el admin. Lo básico (cerrar, bloquear, reportar, evitar) lo tiene cualquier persona. Código en `src/ella.js`.

- [x] **Fotos, audio y video en alta calidad** (9 oct 2026): nada se vuelve a comprimir. Las fotos se guardan a resolución completa (hasta 4096 px de lado) y sin los datos de dónde se tomaron; el audio (MP3, M4A, WAV, FLAC) y el video viajan tal cual, por partes de 8 MB que se reintentan solas (R2 multipart), con barra de avance real. Topes por archivo en la charla: foto 40 MB, audio 300 MB, video 800 MB; en el perfil: 40, 100 y 500 MB. La voz se graba a 256 kbps y 48 kHz sin cancelación de eco ni supresión de ruido; el video del perfil, a 1080p y 8 Mbps. Cada archivo lleva su vista ligera (miniatura o cuadro del video): la charla carga rápido y el original se pide al abrirlo o al darle play, por rangos. A los videos MP4/MOV se les borra la ubicación sin tocar imagen ni sonido. **Tu espacio**: se mide por persona (perfil + lo que mandó en sus charlas), 5 GB incluidos; el medidor ya existe para cuando el espacio extra tenga precio. Código en `src/subidas.js` y `public/js/subir.js`.

- [x] **La chispa: una charla hecha para relacionarse a gusto** (9 oct 2026). **El tono** de cada charla (amistad, conocernos, coqueteo): cada quien elige el suyo en privado y la charla toma el más tranquilo de los dos; el coqueteo, como la puerta, se enciende con dos síes, y ser amigos también es un buen final. **Cartas** (98, en cinco mazos; dos se abren solo en coqueteo): se saca una, la contestan los dos y nadie ve la respuesta del otro hasta que están las dos. **Detalles** (15: un café, un girasol, una rosa, un guiño…) con unas palabras opcionales y un efecto que flota sobre la charla. **Invitar a salir** con tres respuestas ya escritas (sí, otro día, sigamos platicando aquí): decir que no es tan fácil como decir que sí; al aceptar, a ella le arma el aviso para alguien de confianza. **Frases de su carta**: tocar una frase de la carta de la otra persona es empezar a platicar de ella. **Nuestro álbum**: fotos, videos, audios, cartas abiertas, planes y la historia de la charla. Además: doble toque para dar un corazón, un saludo a un toque en la mañana y en la noche, y una pausa amable antes de mandar algo subido de tono. Contestar una carta o reaccionar cuenta como respuesta para el candado de insistencia. Contenido en `public/js/chispa.js`, reglas en `src/chispa.js`.

- [x] **Llamada de voz dentro de la charla** (9 oct 2026): solo voz, sin video. **Solo existe cuando ella la autoriza**: el permiso «puede llamarme por voz» nace apagado frente a un hombre; ella le puede llamar cuando quiera, y cada llamada se contesta o no se contesta. Para quien llama, suena igual esté o no en línea la otra persona y «no contestó» se ve igual que «prefirió no contestar». **El audio no va de teléfono a teléfono: pasa por Cupido** (el objeto de la charla lo entrega cuadro por cuadro), así que nadie da su número ni ve la dirección de internet del otro, y funciona detrás de cualquier red. Voz en Opus a 32 kbps (si el navegador no puede, sin comprimir a 16 kHz), cancelación de eco y de ruido, colchón de unos 80 ms que se adapta solo, medidor de retraso, silenciar, reconexión sola si se corta la red (12 s de gracia), tope de 4 llamadas sin contestar por hora, y un renglón en la charla por cada llamada. No se graba nada. Código en `src/viva.js`, `public/js/llamada.js` y `public/js/voz-worklet.js`.

- [x] **Los correos, completos** (9 oct 2026): «aquí somos chismógrafos». De inicio se avisa de todo y cada quien apaga lo que no quiera, por categoría (11 que se apagan + la de acceso, que llega siempre), desde **Mis correos** en su tablero o con un clic desde el propio correo, sin entrar a la cuenta. 22 correos distintos; el mismo correo cambia según lo lea ella o él. **Lo de una charla se junta**: mensajes, fotos, cartas, detalles, invitaciones y llamadas perdidas salen en un solo correo a los tres minutos, como mucho uno cada media hora por charla, y solo si la persona no lo vio ya en Cupido. Nuevos: puerta cerrada (idéntico si cerró, bloqueó o reportó), volver a abrir, coincidencias sin responder (juntas, cada dos semanas), plan de mañana, **Tu semana en Cupido** los domingos, reporte recibido y reporte leído, cuenta en revisión y de regreso, alguien llegó por tu invitación, espacio al 80 %, y correo de prueba. **Correos discretos** (sin nombres ni contenido) y **sin correos de noche**. Nunca se manda: que alguien dijo que no, que bajó el tono, o que guardó de nuevo algo que había compartido. Galería de vista previa en el admin. Código en `src/correos.js`.
- [x] **Los correos, con diseño** (10 oct 2026): cada uno de los 22 correos se rehízo con marca arriba, portada de color según de qué se trata, bloques (cifras, burbujas, calendario, ficha, pasos), un solo botón, firma y pie. Llevan lo de cada persona: su nombre, en qué coinciden, lo que vemos de él, un pedazo de la carta, lo que le espera adentro. El más pesado anda en 14 KB (Gmail corta en 102). Galería con todos juntos y revisión automática en `/admin#correos`. La guía completa, en [CORREOS.md](CORREOS.md).

## 1 · Antes de abrirlo a personas reales (bloquea el lanzamiento)

### Acceso sin contraseñas
- [x] **Enlace mágico por correo** (hecho; ver arriba).
- [x] **Correos (4 oct 2026):** remitente `cupido@capitaltorreon.com` (dominio verificado en Resend). Plantilla única en `src/correos.js` y ocho correos: enlace para entrar, bienvenida, entraste al matching, coincidencia nueva, puerta abierta, mensaje nuevo (solo si no está en línea, máximo uno por hora por charla), te compartió parte de su perfil, recordatorio de cuestionario a los 2 días (cron diario 16:00 UTC, una sola vez). Registro en tabla `correos`; la persona puede apagar los avisos en Privacidad y pausa (los de acceso siempre llegan). Admin: `POST /api/admin/correos/muestra {para}` manda la serie completa.
- [ ] **Proteger el admin** con Cloudflare Access (código al correo, sin escribir login) y roles: operación del matching ≠ moderación de artículos.
- [ ] **Separar el pool demo del real.** Las cuentas reales ya nacen en `pool = real` y "Reiniciar demo" las respeta, pero el motor todavía las cruza con las 20 personas ficticias (útil para probar; hay que apagarlo antes de abrir).

### Privacidad y datos sensibles
- [ ] **Aviso de privacidad y consentimiento expreso.** Vida sexual, creencias religiosas y opiniones políticas son datos personales sensibles en México: requieren consentimiento expreso y por escrito (casilla separada, firma electrónica), finalidades claras y medidas de seguridad reforzadas. **Validar con abogado** contra la ley vigente de protección de datos en posesión de particulares.
- [ ] **Nadie humano lee lo íntimo**: quitar del admin las respuestas del Módulo Profundo; el admin ve números y vetos, no textos.
- [ ] **Cifrar en reposo** las respuestas sensibles (llave en secrets; el motor descifra solo en memoria).
- [ ] **Borrar todo** a petición y **descargar mis datos** (derechos de acceso, rectificación, cancelación y oposición).
- [ ] **Encargo de datos** con cada proveedor que los toque (nube, correo, IA): dónde se guardan y para qué.
- [ ] Términos y condiciones: solo mayores de 18, uso personal, conducta, qué pasa con cuentas falsas.

### Seguridad de las personas
- [ ] **Verificación de identidad antes de abrir una puerta** (selfie + identificación con un proveedor de verificación). Protege contra perfiles falsos y estafas románticas.
- [ ] **Verificación de mayoría de edad.**
- [x] **Reportar y bloquear** desde la puerta abierta, con bitácora, evidencia y panel (9 oct 2026). Falta el **protocolo de respuesta**: quién lee un reporte, en cuánto tiempo y qué se le contesta a ella.
- [x] **Guía de primera cita segura** (9 oct 2026): seis consejos y el aviso para alguien de confianza, en «Aquí mando yo».
- [ ] **El buzón de `cupido@capitaltorreon.com` debe recibir respuestas** (o poner una dirección de respuesta): el correo de «cuenta retirada» ofrece borrar los datos respondiendo a ese correo.
- [ ] **Revisión legal de la regla.** Dar derechos distintos por género puede leerse como trato desigual; hoy se declara de frente y se acepta al entrar, pero los términos los debe revisar un abogado.
- [ ] Una cuenta retirada puede volver con otro correo: se cierra con la verificación de identidad.
- [ ] El detalle de los reportes y los botones de retirar piden una cuenta administradora (`ADMINES`), pero el resto del admin sigue abierto.
- [ ] Detección de patrones de estafa (pedir dinero, sacar la conversación rápido, enlaces).
- [ ] Declaración de estado civil real y botón de pausa ("estoy conociendo a alguien").
- [ ] Protocolo de crisis: qué hacer si una respuesta revela violencia o riesgo (sin romper la promesa de privacidad: definirlo con especialistas).

### Anti-abuso
- [ ] **Turnstile** en cuestionario y artículos (verificación invisible, sin fricción).
- [ ] Límite de velocidad por IP y por enlace en toda la API.
- [ ] Moderación asistida por IA de artículos antes de publicar.

### Lectura con IA (lo que hoy hace la heurística)
- [ ] **Llave de IA como secreto** y lectura real de las respuestas abiertas: rúbrica de 4 ejes, etiquetas de la carta, respuestas-aparador y contradicciones entre anclas y textos.
- [ ] Prompt versionado, salida validada, pruebas contra ejemplos calificados a mano.
- [ ] **Auditoría de sesgo de la rúbrica** con psicólogos: escribir poco o con faltas no es ser inmaduro; distinto nivel educativo o región no debe bajar la calidad.

---

## 2 · Para que funcione bien con miles

### Producto
- [x] Avisos por correo de todo lo que pasa (9 oct 2026). Falta: WhatsApp opcional; aviso push para que suene con Cupido cerrado; saber si un correo rebotó o cayó en spam (hoy solo sabemos que salió); y la hora local de cada quien para «sin correos de noche» (hoy usa la del centro de México).
- [ ] **Conversación dentro de la puerta abierta**, en tiempo real (Durable Objects).
- [ ] **Primera impresión multimedia** en orden: carta → audio leyendo la carta → video de su martes → fotos (R2). El algoritmo nunca las ve.
- [ ] **Caducidad de puertas**: si en 14 días no hay dos síes, "la puerta se cerró sin abrirse" — sin decir por qué.
- [ ] Decidir **una puerta abierta a la vez** o varias (ver decisiones).
- [ ] Pausa y regreso al estado exacto; editar respuestas con aviso de que cambian las coincidencias.
- [ ] **Compatibilidad de video**: se guarda y se reproduce el original, sin convertir. Un video HEVC de iPhone no se ve en algunos Android viejos ni en Firefox; para eso hay «Descargar». Si un día hace falta que todo se vea en todo, se agrega una copia compatible (Cloudflare Stream o un convertidor propio), conservando el original.
- [ ] **Precio del espacio extra**: hoy 5 GB incluidos por persona (`TOPE_PERSONA`). Falta decidir cuánto incluye para siempre, cuánto cuesta ampliar y publicarlo en el programa antes de cobrarlo.
- [ ] Probar en un iPhone real que la galería entrega el video original (se pide con selección múltiple para que iOS no lo comprima).
- [ ] **La llamada, lo que falta**: probarla entre dos teléfonos reales (iPhone y Android, con datos móviles); que suene con la pantalla bloqueada o la pestaña cerrada (hoy solo suena con Cupido abierto: haría falta aviso push); elegir bocina o auricular (el navegador no deja); y decidir si algún día se graban o no (hoy no se graba nada). El video quedó fuera a propósito.
- [ ] Revisar con las primeras parejas reales las 98 cartas: cuáles se sacan, cuáles se contestan y cuáles sobran.
- [ ] **Geografía real** con coordenadas y radio, no solo ciudad; países y mudanza internacional.
- [ ] Todas las orientaciones e identidades desde el día uno (el motor ya cruza "quién busca a quién" en las dos direcciones).
- [ ] Explicar a la persona su "lo más cerca" con más contexto (qué dimensión le faltó a esa persona, sin decir quién).
- [ ] Accesibilidad (lector de pantalla, contraste, teclado) y rendimiento en celulares de gama baja.
- [ ] Simulación Monte Carlo v2 del cuestionario de 43 preguntas con las anclas nuevas (la actual mide 33).

### Operación
- [ ] **Repositorio privado** (hoy es público: el motor con sus pesos queda visible, y el propio modelo dice que los pesos de producción no se publican).
- [ ] **Dominio propio** y ambiente de pruebas separado de producción.
- [ ] Respaldos automáticos de la base y prueba de restauración.
- [ ] Monitoreo y alertas: errores, tiempos, correos rebotados, cruces fallidos.
- [ ] Bitácora de quién vio qué en el admin.
- [x] Pruebas automáticas del motor (`npm run pruebas`: vetos, dato faltante, reciprocidad, techos, pesos personales, privacidad de notas). Corren antes de cada despliegue.
- [ ] Pruebas de extremo a extremo de la API y los paneles.

### Artículos
- [ ] Autores verificados (psicólogos, terapeutas, acompañantes espirituales) con insignia.
- [ ] Enlace mágico para que cada autor edite su artículo.
- [ ] Reacciones o comentarios moderados.
- [ ] SEO: mapa del sitio, datos estructurados, imagen para compartir por artículo.

---

## 3 · Para el millón

- [ ] **No cruzar todos contra todos.** Con un millón de personas los pares posibles son del orden de cientos de miles de millones. Pipeline por etapas:
  1. **Bloques** por filtros duros indexables: quién busca a quién, edad, región con disposición a mudarse, hijos, fe innegociable.
  2. **Recuperación de candidatos** con búsqueda vectorial (Vectorize) sobre la huella de cada persona (visión, valores, vida cotidiana): los mejores 500–2,000.
  3. **Motor completo** solo sobre esos candidatos, en las dos direcciones.
- [ ] **Cruce incremental con colas** (Queues): cuando alguien entra o edita, solo se recalcula su fila.
- [ ] Guardar detalle solo de pares arriba de un piso (p. ej. 70 %); lo demás se recalcula bajo demanda.
- [ ] Base de datos por región (D1 por país) o Postgres vía Hyperdrive, con réplicas de lectura.
- [ ] Lectura con IA en lote y caché por respuesta: solo se relee lo que cambió.
- [ ] **Justicia de exposición**: tope de coincidencias simultáneas por persona para que nadie acapare avisos y nadie quede invisible por un sesgo del motor.
- [ ] Pruebas de carga y costo por persona activa (IA, base, correo, verificación).

---

## 4 · Para que sea el mejor algoritmo (con datos, no con intuición)

- [ ] **Preguntar después**, con consentimiento: ¿se abrió la puerta?, ¿hubo cita?, ¿siguen a los 3, 6 y 12 meses?
- [ ] **Calibrar el número**: que un 90 % signifique algo medible (tasa de puertas abiertas, segunda cita y relación a 12 meses por rango de porcentaje).
- [ ] **Ajustar pesos y matrices con resultados reales**, sin perder explicabilidad (cada cambio debe poder contarse en una frase).
- [ ] Pruebas A/B de umbral (88 / 90 / 92) y del orden de revelación.
- [ ] Revisión del cuestionario con especialistas: terapia de pareja, sexología clínica, acompañamiento espiritual de varias tradiciones.
- [ ] Auditoría de sesgos por género, edad, escolaridad, región y tradición religiosa.
- [ ] Detectar dimensiones que no predicen nada y quitarlas (menos preguntas, misma precisión).

---

## Mientras esperan a Cupido (propuesta, 4 oct 2026)

La misma tecnología de la charla (un objeto por sala, en vivo) sirve para que la plataforma tenga vida antes de la coincidencia. Regla que no se negocia: **nada de navegar perfiles**; aquí la gente se conoce por lo que dice, no por cómo se ve. En orden de valor:

1. **Círculos** (lo más fiel al producto): el motor ya calcula compatibilidad con todos; con quienes estás entre 70 y 89 % hay afinidad real aunque no haya "pareja". Un círculo de 8 a 12 personas con esa afinidad (mezcla de géneros, sin romance explícito), con una sala propia y una pregunta semanal. La gente se queda, se conoce, y a veces el 89 % sube.
2. **Salas por tema**: fe, hijos, cocina, deporte, lectura, dinero, duelo, volver a empezar. Abiertas, con nombre de pila y sin foto. Moderación mínima: reportar y silenciar (hoy no existe).
3. **La pregunta de la semana**: una de las 43, abierta: quien quiera publica su respuesta (firmada con nombre de pila) y los demás reaccionan. Da material al motor (claridad) y conversación a la comunidad.
4. **Diario guiado**: tres preguntas por semana que mejoran la claridad del perfil (y su Q) y se pueden liberar después a una charla como "lo que escribí entonces".
5. **Artículos con conversación**: comentarios bajo cada artículo con la misma charla; autores invitados (terapeutas, sexólogos, acompañantes espirituales) con sesiones en vivo de preguntas.
6. **Tu lectura con el tiempo**: cada mes el motor le muestra a la persona cómo cambió su rueda de la vida y su claridad, y qué dimensión le pide atención. Es el "mientras tanto" más honesto: trabajar en uno mismo.

Decisión de Ricardo: cuál primero. Mi recomendación: Círculos, porque usa lo que ya tenemos (motor + charla) y es lo que nadie más puede ofrecer.

## 5 · Decisiones pendientes (tuyas)

- [ ] ¿Hacer **privado** el repositorio?
- [x] **Dominio:** cupido.capitaltorreon.com (4 oct 2026); workers.dev redirige ahí.
- [ ] **Remitente de correo** para enlaces mágicos y avisos.
- [ ] **Proveedor y presupuesto de IA** para la lectura de respuestas abiertas.
- [ ] ¿**Verificación de identidad obligatoria** para abrir una puerta?
- [ ] ¿**Una puerta abierta a la vez** o varias?
- [ ] ¿Abierto a **todas las orientaciones** desde el lanzamiento? (el motor ya lo soporta)
- [ ] ¿Cuánto tiempo vive una puerta sin respuesta?
- [ ] **GIF (apagado por ahora, decisión de Ricardo 16 sep 2026):** el buscador vía Tenor ya está en el servidor y en el cliente; para encenderlo, crear la llave (Google Cloud → API Tenor), `wrangler secret put TENOR_KEY` y devolver el botón GIF a la barra de la charla en `public/persona.html`.
- [ ] **Charla:** avisos por correo de mensaje nuevo cuando la persona no está; reportar y bloquear; moderación.
- [ ] **¿Qué hace la persona adentro mientras no hay coincidencia?** (Ricardo, 16 sep 2026: "si en 5 años no encuentran a nadie, ¿qué tendrían que estar haciendo adentro?"). Ideas sobre la mesa: sala o chat de la comunidad; artículos y respuestas de especialistas; un "diario" guiado que mejora su claridad (y su Q); retos de pareja consigo mismo; ver cómo cambia su lectura con el tiempo. Regla que no se negocia: nada de navegar perfiles. Decisión pendiente de Ricardo.

## El programa: confianza primero, monetización después (4 oct 2026)

Razonamiento completo en `docs/monetizacion/Cupido_Algoritmico_Monetizacion_v1_2026-10-04_1215.docx`. Lo construido:

- **Todo gratis durante 2026 y 2027.** Sin anuncios, sin letra chica, nada compra ventaja. La persona lo ve en Inicio, al terminar el cuestionario, en Aceptaciones ("Abrir puertas: incluido") y en la página pública `/programa`.
- **El mapa, publicado desde hoy** (tabla `programa`, editable en Admin → Programa y apoyos): entrada con seriedad (2028, 690), abrir una puerta (2028, 1,490, la primera siempre gratis), Mientras esperas (2029, 199/mes), acompañamiento (2029, comisión), comunidades propias (2030, 30,000/año), regalar Cupido (2028, 690). Cada acción tiene estado `gratis` o `cobrando`; Ricardo acelera o frena desde el admin y el cambio se ve igual para todos.
- **Lo único que se puede pagar hoy, voluntario:** Fondo de atracción (una vez, desde 49) y Socio fundador (cada mes, cancelable), por Stripe Checkout con la llave de la bóveda `STRIPE_SECRET_KEY` (SuperLeads por ahora; se cambia a `STRIPE_CAPITALTORREON` cuando exista). Tope de cuidado 5,000/mes, devoluciones sin preguntas en 15 días, correo de gracias, lista de agradecimiento, transparencia pública (reunido, personas, socios).
- **Compartir Cupido:** cada cuenta tiene liga propia `/i/<código>` (WhatsApp y copiar); quien llega por ahí queda registrado como invitado y el tablero muestra cuántos llegaron. Es el motor de crecimiento mientras nadie paga.
- **Precio justo (4 oct 2026), el motor dinámico de precios por persona** (`src/precios.js`): el precio base es el mismo para todos; el factor es de cada quien y lo declara la persona (nunca se infiere): rango de ingreso mensual en cinco bandas (×0.25, ×0.5, ×1, ×1.6, ×2.5) y situación (bien ×1, momento difícil ×0.5, **sin trabajo = gratis al instante y sin preguntas**, con lo de especialistas incluido mientras dure). Privado, visible, cambiable en Apoyar a Cupido; revisión cada 180 días por correo junto con lo que cambia (ciudad, trabajo, hijos). El mapa muestra "después: $X para ti". Admin ve la distribución, nunca a quién. Por qué declarado y no inferido: la misma objeción honesta que quedó escrita en el ADN de la Mina: precios ocultos por persona se sienten espiados cuando se descubren, y adivinar lo que alguien gana por cómo usa el sistema se equivoca y es leer sin permiso. Nota: el cuestionario no pregunta ingreso; P12 pregunta cómo se maneja el dinero, no el monto. Decisión abierta: ¿meter el rango al cuestionario (P12) o dejarlo solo en Apoyar?
- **Cuando Ricardo diga "acelera":** falta construir el cobro real de cada acción (entrada al terminar el cuestionario, puerta al doble sí, suscripción de Mientras esperas). La infraestructura de pago ya está probada con el Fondo; es cuestión de conectar cada punto con `apoyar()` y respetar las reglas de arriba.

<!-- fin · RLR -->
