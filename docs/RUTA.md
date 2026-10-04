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
- [ ] **Reportar y bloquear** desde la puerta abierta, con protocolo de respuesta y bitácora.
- [ ] **Guía de primera cita segura** al abrir la puerta (lugar público, avisar a alguien, no enviar dinero).
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
- [ ] Avisos por correo (y WhatsApp opcional) cuando aparece una coincidencia o se abre una puerta.
- [ ] **Conversación dentro de la puerta abierta**, en tiempo real (Durable Objects).
- [ ] **Primera impresión multimedia** en orden: carta → audio leyendo la carta → video de su martes → fotos (R2). El algoritmo nunca las ve.
- [ ] **Caducidad de puertas**: si en 14 días no hay dos síes, "la puerta se cerró sin abrirse" — sin decir por qué.
- [ ] Decidir **una puerta abierta a la vez** o varias (ver decisiones).
- [ ] Pausa y regreso al estado exacto; editar respuestas con aviso de que cambian las coincidencias.
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
- **Cuando Ricardo diga "acelera":** falta construir el cobro real de cada acción (entrada al terminar el cuestionario, puerta al doble sí, suscripción de Mientras esperas). La infraestructura de pago ya está probada con el Fondo; es cuestión de conectar cada punto con `apoyar()` y respetar las reglas de arriba.

<!-- fin · RLR -->
