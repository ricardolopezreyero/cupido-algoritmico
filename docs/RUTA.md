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
- [x] **Demo**: 10 hombres y 10 mujeres ficticios con las 41 preguntas completas (estructuradas + textos).
- [x] **Panel de personas** sin login: coincidencias con razones y "lo que tendrían que cuidar", la puerta, lo que más pesa en tu cálculo, qué tan bien te conoce el algoritmo, lo que te está dejando fuera, lo más cerca que alguien ha estado.
- [x] **Panel admin**: resumen con cifras, distribución, vetos por tipo, matriz 10 × 10, detalle de cada par en las dos direcciones, personas con sus respuestas y pesos, puertas, corrida manual por fases, laboratorio de pesos en vivo, bitácora en vivo.
- [x] **Artículos**: cualquiera publica sin cuenta, lectura cuidada y lista para compartir por WhatsApp, borrador local, anti-spam básico (trampa para robots, límite por IP, palabras sospechosas a revisión) y moderación desde el admin. 6 artículos iniciales.
- [x] **Cuestionario conectado**: autoguardado, "lo pienso después", enlace privado sin contraseña y motor automático al terminar.
- [x] **Infraestructura**: Cloudflare Worker + D1, código en GitHub.

---

## 1 · Antes de abrirlo a personas reales (bloquea el lanzamiento)

### Acceso sin contraseñas
- [ ] **Enlace mágico por correo** para la persona: recuperar su panel en otro dispositivo y recibir avisos. El enlace privado que ya existe se vuelve la sesión.
- [ ] **Remitente de correo** con dominio propio verificado (Resend o Cloudflare Email Service) y plantillas: aviso de coincidencia, puerta abierta, enlace mágico.
- [ ] **Proteger el admin** con Cloudflare Access (código al correo, sin escribir login) y roles: operación del matching ≠ moderación de artículos.
- [ ] **Separar el pool demo del real.** Los datos reales nunca se mezclan con los ficticios; el selector "entra como cualquiera" solo existe en demo.

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
- [ ] Simulación Monte Carlo v2 del cuestionario de 41 preguntas con las anclas nuevas (la actual mide 33).

### Operación
- [ ] **Repositorio privado** (hoy es público: el motor con sus pesos queda visible, y el propio modelo dice que los pesos de producción no se publican).
- [ ] **Dominio propio** y ambiente de pruebas separado de producción.
- [ ] Respaldos automáticos de la base y prueba de restauración.
- [ ] Monitoreo y alertas: errores, tiempos, correos rebotados, cruces fallidos.
- [ ] Bitácora de quién vio qué en el admin.
- [ ] Pruebas automáticas del motor (casos conocidos: vetos, techos, reciprocidad) para que ningún cambio rompa la lógica en silencio.

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

## 5 · Decisiones pendientes (tuyas)

- [ ] ¿Hacer **privado** el repositorio?
- [ ] **Dominio** y nombre final.
- [ ] **Remitente de correo** para enlaces mágicos y avisos.
- [ ] **Proveedor y presupuesto de IA** para la lectura de respuestas abiertas.
- [ ] ¿**Verificación de identidad obligatoria** para abrir una puerta?
- [ ] ¿**Una puerta abierta a la vez** o varias?
- [ ] ¿Abierto a **todas las orientaciones** desde el lanzamiento? (el motor ya lo soporta)
- [ ] ¿Cuánto tiempo vive una puerta sin respuesta?

## Monetización (después — solo para no perderlo)

Ahorita no: primero el máximo valor para la persona. Cuando toque, el momento de más valor es **la puerta**, y hay caminos que no rompen la promesa (cobrar la verificación de identidad, una membresía, pagar al abrir). Lo que nunca: cobrar por "ver quién te vio" o por subir en una lista — ese estado no existe en este sistema.

<!-- fin · RLR -->
