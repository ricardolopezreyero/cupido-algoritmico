# Experiencia del cuestionario

Diseño de la experiencia de respuesta, informado por una simulación Monte Carlo de **1,000 participantes sintéticos** recorriendo las 33 preguntas (`montecarlo.py`). Se corrieron dos brazos con las mismas personas: **A) sin ayudas ni guardado** y **B) con el diseño de este documento**.

## Qué encontró la simulación

| Métrica | A · Sin diseño | B · Con diseño |
|---|---|---|
| Completan el cuestionario | 4% | **91%** |
| Respuestas pobres en abiertas (promedio) | ~44% | ~16% |
| Tiempo mediano total | 60 min | 50 min |
| Sesiones para terminar | fracasa al pausar | 1–2, retomables |

> **Nota honesta:** los parámetros de la simulación son supuestos razonados, no datos de campo. Los números no predicen la realidad; sirven para **rankear el riesgo por pregunta** y dimensionar qué rescata cada mecanismo. Se recalibra con datos reales en cuanto existan.

Los 5 hallazgos que definen el diseño:

1. **El asesino #1 no es ninguna pregunta: es pausar sin guardado.** Un cuestionario de ~50 minutos garantiza pausas; sin autoguardado, casi nadie que pausa vuelve. Por eso el brazo A colapsa a 4%. El autoguardado + retomar es la palanca más grande de todo el sistema.
2. **Hay una "zona de la muerte" en el bloque de conflicto (P19–P25).** Llega la fatiga acumulada justo cuando llegan las preguntas emocionalmente más caras. Ahí se concentró el abandono (18–23% por pantalla en el brazo A). Respuesta: descanso guiado antes del bloque 5 y botón "lo pienso después".
3. **Las 3 preguntas donde más se atoran:** P32 "¿por qué sigues soltero/a?" (65% se atoró), P11 "principios sobre conveniencia" (51%) y P20 "tu última discusión" (52%). No se reescriben — son las de mayor señal — se les pone la mejor ayuda.
4. **Las abiertas del final (P31–33) producen respuestas pobres por cansancio** (61–67% en el brazo A), no por dificultad. Respuesta: descanso previo + recordar que son las últimas 3 + permitir volver después con la mente fresca.
5. **Dos preguntas se atoran por interfaz, no por contenido:** P23 (doble ranking) y P27 (matriz de hábitos). Se resuelven con UI, no con texto.

---

## Principios de la experiencia

1. **Una pregunta por pantalla.** Nada más compite por atención. Sin cronómetro, sin presión: esto no se hace con prisa.
2. **Transparencia desde el inicio.** Pantalla de bienvenida antes de la pregunta 1:
   > *"Son **33 preguntas**. A la mayoría le toma entre 40 y 60 minutos hacerlo bien — no tiene que ser de corrido. **Todo se guarda solo**: puedes salir cuando quieras y seguir exactamente donde ibas, hoy o en una semana. Puedes editar cualquier respuesta cuando quieras. No hay respuestas correctas: hay respuestas tuyas."*
3. **Avance siempre visible.** Arriba: barra de progreso + "**Pregunta 12 de 33**" + el bloque actual ("Conflicto y reparación · 3 de 4"). Al cerrar cada bloque, pantalla de respiro: "Llevas 5 de 8 bloques ✓".
4. **Autoguardado real.** Cada tecla (debounce ~1 s) y cada selección se persisten. Indicador discreto "Guardado ✓". Cerrar la app, cambiar de dispositivo o quedarse sin batería nunca pierde nada.
5. **"Lo pienso después"** en toda pregunta. La difiere sin culpa y reaparece al final, cuando ya se agarró ritmo. En la simulación, este botón convirtió el 75% de los atorones en preguntas contestadas más tarde en vez de abandonos.
6. **Edición permanente.** Terminado el cuestionario, un "Mi cuestionario" lista las 33 respuestas, editables una por una para siempre. Editar recalcula matches en el siguiente batch. Si la vida cambió (ciudad, hijos, prioridades), el perfil cambia con ella.
7. **Ayuda que no estorba.** Cada pantalla trae hasta 3 módulos colapsados — se abren solo si se necesitan: **¿Por qué preguntamos esto?** · **Ejemplo real** (respuesta anónima de muestra, imperfecta a propósito) · **¿No sabes por dónde empezar?** (arrancadores).

## Anatomía de una pantalla (abierta)

```
━━━━━━━━━━━━━━━━━━━━━━━  ▓▓▓▓▓▓▓░░░░  Pregunta 20 de 33
Bloque 5 · Conflicto y reparación

  Describe tu última discusión importante con alguien
  que amas: por qué fue, cómo actuaste tú y cómo terminó.

  ▸ ¿Por qué preguntamos esto?
  ▸ Ejemplo de respuesta real
  ▸ ¿No sabes por dónde empezar?

  ┌─────────────────────────────────────────────┐
  │  (campo de texto, crece solo)               │
  └─────────────────────────────────────────────┘
                                    Guardado ✓
  [← Atrás]     [Lo pienso después]    [Siguiente →]
```

---

## Ayuda por pregunta

Formato: **riesgo detectado en la simulación** (brazo A → brazo B) y **la ayuda que lo ataca**. Los porcentajes son de atoro salvo que se indique.

### Bloque 1 · Filtros (P1–P5) — riesgo bajo, pero aquí se decide la confianza

- **P1 edad** (11%): slider doble para el rango, con la nota *"Sé honesto con el rango: solo te presentaremos a quien de verdad considerarías."*
- **P2 ciudad/mudanza** (17%): autocompletado de ciudad. Ayuda: *"No respondas lo romántico, responde lo real: ¿de verdad te irías?"*
- **P3 hijos** (23% — duda entre "seguro" y "me inclino"): ¿Por qué preguntamos? *"Es la pregunta que más parejas rompe. 'Me inclino' es una respuesta perfectamente válida — no la conviertas en 'seguro' para verte decidido."*
- **P4 religión** (24%): aclarar que "qué practicas" admite dos líneas; el filtro solo actúa si alguien marca innegociable.
- **P5 qué buscas** (25%): ¿Por qué? *"No hay respuesta que te haga ver mejor. Hay respuesta que te empareja con quien quiere lo mismo."*

### Bloque 2 · Visión de vida (P6–P9) — primer muro: pasar de taps a escribir

- **P6 martes en 10 años** (40% → 20%): el primer texto largo del cuestionario; muchos se congelan ante el lienzo en blanco. Arrancadores: *"¿A qué hora despiertas? ¿Qué ves por la ventana? ¿Quién más está en la casa? ¿Qué haces a las 2 pm? ¿Y a las 9 de la noche?"* Ejemplo real colapsado. Nota: *"No describas tus sueños: describe un martes."*
- **P7 familia de origen** (35%): arrancador: *"¿Cada cuánto los ves o les hablas hoy? ¿Qué opinión esperas que tengan sobre tu pareja: mucha, poca, ninguna?"*
- **P8 trabajo y ambición** (31%): recordatorio de doble dirección: *"Son dos preguntas: cómo eres tú, y qué buscas en el otro. Responde ambas."* (la simulación marcó que la segunda mitad se omite con frecuencia).
- **P9 vida bien vivida** (45% → 23%, la más abstracta): arrancador que la aterriza: *"Imagina que tienes 80 años y miras atrás con paz. ¿Qué tuvo que haber pasado? ¿Qué habría hecho que sintieras que la desperdiciaste?"*

### Bloque 3 · Valores (P10–P13) — el muro de los ejemplos

- **P10 valores con ejemplos** (39%): estructura sugerida en placeholder: *"Valor 1: ___. Se ve en mi vida así: ___"* × 3. Nota: *"'Honestidad' no dice nada. 'Devolví un pago duplicado que nadie habría notado' lo dice todo."*
- **P11 principios sobre conveniencia** (51% → 29%, tercera más difícil — cuesta recordar un caso): ayuda de memoria: *"Piensa en: una renuncia, una devolución, una verdad que te costó decir, un favor que negaste, algo que pagaste sin que nadie viera. Vale un caso pequeño: importa el patrón, no la épica."* Y honestidad estructural: *"Si de verdad no encuentras ninguno, escríbelo — eso también es una respuesta."*
- **P12 dinero / P13 política** (19%): ¿Por qué? de P13: *"No te preguntamos por quién votas. Solo cuánto te importa coincidir."*

### Bloque 4 · Personalidad (P14–P18) — respiro intencional

- **P14–P15, P18** (10–13%): sin fricción; son el descanso después de dos bloques pesados. Mantenerlas ligeras y visuales (tarjetas, slider).
- **P16 lo mejor / lo más difícil de ti** (43% → 27%, pobres 46% → 16%): la primera pregunta que pide autocrítica. Ayuda: *"Truco: no respondas tú. Escucha a tu mejor amigo diciéndolo. ¿Qué diría con cariño… y qué diría con una cerveza encima?"* Anti-aparador: *"'Soy demasiado perfeccionista' no cuenta. Lo difícil de ti es algo que le ha costado a alguien que te quiere."*
- **P17 humor** (33%): cuesta recordar ejemplos bajo demanda. Arrancador: *"Abre tu app de mensajes mentalmente: ¿qué fue lo último que reenviaste riéndote? ¿Con quién te ríes hasta que duele, y de qué?"*

### Bloque 5 · Conflicto (P19–P22) — la zona de la muerte

> La simulación concentró aquí el abandono del brazo A (18–23% por pantalla): fatiga acumulada + máximo costo emocional. **Antes de P19 hay una pantalla de descanso obligada:** *"Llevas más de la mitad ✓. Las siguientes 4 preguntas son las más importantes del cuestionario — y las menos cómodas. Si quieres, toma aire, o continúa mañana: todo está guardado."*

- **P19 qué haces cuando algo te molesta** (26%): la instrucción "la de verdad, no la ideal" va en grande. ¿Por qué? *"No hay opción buena y mala: hay combinaciones de pareja que funcionan y otras que explotan. Mentir aquí es comprarte la explosión."*
- **P20 tu última discusión** (52% → 28%, pobres 54% → 17%): estructura en 3 campos para bajar el muro: **¿Por qué fue?** / **¿Qué hiciste tú?** / **¿Cómo terminó?** Nota de seguridad: *"Nadie va a leer esto más que el algoritmo. No busca culpables: busca cómo reparas."*
- **P21 qué necesitas después de una pelea** (39%): arrancador: *"¿Espacio o abrazo? ¿Hablarlo ya o mañana? ¿Qué gesto del otro te desarma? ¿Y qué eres capaz de dar tú aunque sigas enojado/a?"*
- **P22 qué aprendiste de tu ex** (44%, emocionalmente cara): permiso explícito: *"No te pedimos revivir la historia ni contar qué hizo la otra persona. Solo una cosa: ¿qué harías diferente TÚ?"* Botón "lo pienso después" especialmente visible aquí.

### Bloque 6 · Afecto (P23–P26)

- **P23 doble ranking** (21% con pico de abandono en el brazo A — fricción de interfaz, no de contenido): nada de arrastrar 2 listas de 5. UI por pasos: *"De estas 5, ¿cuál te llega MÁS? (tap) ¿Y de las 4 restantes?"* — dos rondas de taps, 20 segundos. En móvil, drag-and-drop de listas es donde muere la gente.
- **P24 cercanía** (23%): ¿Por qué? *"Ni la simbiosis ni la independencia son mejores: son incompatibles entre sí."*
- **P25 intimidad física** (48% → 29%, pobres 61% → 20% — la de mayor pudor): encuadre primero: *"Respondes solo lo que quieras y al nivel de detalle que tú elijas. No preguntamos prácticas: preguntamos importancia y comunicación."* Arrancador suave: *"¿Qué lugar ocupa en tu lista de lo que hace funcionar una relación? ¿Te resulta fácil pedir lo que necesitas, o te cuesta?"*
- **P26 cómo cuidas** (32%): ayuda de memoria: *"Piensa en la última vez que alguien que amas estuvo enfermo, triste o quebrado. ¿Qué hiciste — no qué sentiste, qué HICISTE?"*

### Bloque 7 · Cotidiano (P27–P30) — segundo respiro

- **P27 matriz de hábitos** (17% por UI): jamás mostrar la matriz completa. Una tarjeta por hábito: *"Alcohol: ¿tú? (3 opciones) ¿y en tu pareja aceptas…? (3 opciones)"* → siguiente tarjeta. Cuatro tarjetas de 10 segundos en vez de una tabla de 24 celdas.
- **P28 ritmo y orden** (12%): el "¿qué tan ordenada está tu casa HOY?" con nota: *"Hoy. No después de limpiar el sábado."*
- **P29 domingo perfecto** (23%, pobres 45% → 15% — pobre por cansancio, no dificultad): es la abierta más disfrutable; pedirla con ganas: *"De principio a fin: ¿a qué hora abres los ojos? ¿Qué desayunas? ¿Con quién? ¿Qué NO puede pasar en tu domingo perfecto?"*
- **P30 división del hogar** (18%): ¿Por qué? *"No hay modelo correcto. Hay parejas donde los dos quieren lo mismo — y parejas condenadas a pelear cada carga de lavadora."*

### Bloque 8 · Profundidad (P31–P33) — el cierre cansado

> Antes de P31: *"Últimas 3. Son las que tu futuro match va a sentir más. Si estás en modo 'ya acabemos', mejor guárdalo y termina mañana fresco — el cuestionario no se va a ningún lado."* (La simulación mostró 61–67% de respuestas pobres aquí por fatiga en el brazo A; el descanso y el retorno diferido son la cura.)

- **P31 qué malinterpretan de ti** (33%): arrancador: *"Completa: 'La gente cree que soy ___, pero en realidad ___'. ¿Qué primera impresión das que no te hace justicia?"*
- **P32 por qué sigues soltero/a** (65% → 36%, pobres 67% → 17% — **la más difícil de todo el cuestionario**): triple ayuda. ¿Por qué?: *"Es la pregunta que más dice de ti en todo el cuestionario. No te castiga por la respuesta: te premia por la honestidad."* Arrancador: *"Prohibido responder 'no he encontrado a la persona correcta' — eso es la pregunta, no la respuesta. ¿Qué has elegido, evitado, priorizado o temido TÚ?"* Y el ejemplo real colapsado muestra una respuesta vulnerable e imperfecta, para bajar el estándar de 'respuesta perfecta' que congela.
- **P33 carta a tu futura pareja** (53% → 29%): estructura mínima: *"Dos párrafos bastan: 'Te prometo…' y 'Te pido…'. Escríbela a UNA persona, no a un público."* Aviso importante: *"Esta carta es lo primero que tu match leerá de ti."* — la simulación no lo mide, pero es el mejor incentivo natural de calidad de todo el sistema. Al enviarla: pantalla de cierre con resumen editable de las 33.

### Módulo Profundo (P34–P41) — máxima incomodidad, máximo cuidado

> Se responde después de la P33, con pantalla de entrada propia (ver `PREGUNTAS.md`). Reglas de la simulación aplicadas al extremo: aquí el pudor es el atoro dominante, así que cada pantalla abre con el encuadre de privacidad, no lo esconde en un colapsable.

- **P34 frecuencia / P35 apertura** (OM): tono clínico y neutro, cero ilustraciones juguetonas. ¿Por qué?: *"El desajuste de deseo es de las primeras causas reales de ruptura. Preguntarlo hoy es más barato que descubrirlo en el año dos."*
- **P36 qué te enciende / qué te apaga**: arrancador: *"No pienses en técnica: piensa en la última vez que te sentiste verdaderamente deseado/a. ¿Qué lo provocó? ¿Y qué gesto, frase o actitud te ha sacado por completo del momento?"*
- **P37 cuando uno quería y el otro no**: permiso: *"Todas las parejas del mundo viven esto. No te descalifica haberlo manejado mal: descalifica no saber cómo lo manejas."*
- **P38 innegociables**: la advertencia va en la pantalla, en grande: *"Esta respuesta decide matches. Un límite callado hoy es una ruptura programada. Nadie humano la lee."* Botón "lo pienso después" disponible, pero el perfil no entra al matching sin ella.
- **P39–P41 conciencia**: el riesgo es la respuesta-postal ("soy muy espiritual"). Anti-aparador en P39: *"No nos digas qué crees: dinos qué HACES, y cada cuánto."*

---

## Primera impresión multimedia

El algoritmo es ciego a los medios — esa es la tesis del producto. Pero cuando hay match ≥90 % y los dos abren la puerta, la primera impresión sí importa, y debe ser tuya, no una foto elegida por miedo. Cada perfil incluye:

| Medio | Spec | Guía en pantalla |
|---|---|---|
| **Fotos (3–5)** | Al menos 1 de rostro claro y 1 de cuerpo completo; sin filtros pesados | *"Fotos de tu vida real, no de tu mejor ángulo de 2019. Tu match ya te eligió por quién eres: las fotos solo confirman que existes."* |
| **Audio (30–90 s)** | Leer tu carta (P33) en tu propia voz — guion ya resuelto, cero pánico de "¿qué digo?" | *"Tu voz diciendo tu carta. Es lo segundo que tu match conocerá de ti, después de leerla."* |
| **Video (30–60 s)** | Prompt guiado: "Muéstranos tu domingo perfecto" o "¿Qué verá tu pareja un martes normal contigo?" | Grabación vertical, sin edición requerida; se puede regrabar las veces que sea |

**Orden de revelación al abrirse la puerta (doble sí)** (diseñado para que lo físico llegue al final, ya con contexto): 1) % y top-3 dimensiones → 2) carta escrita → 3) audio con su voz → 4) video → 5) fotos. Cada paso se abre cuando el receptor lo decide: la primera impresión se construye en el orden inverso al de Tinder.

Los medios se suben al final del cuestionario (o después — el perfil puede entrar al matching sin ellos, pero se avisa: *"Si hay match, esto es lo que la otra persona verá. No lo dejes al azar"*). Reemplazables cuando quieras, como todo lo demás.

---

## Guardado y edición (spec)

| Comportamiento | Detalle |
|---|---|
| Autoguardado | Cada cambio se persiste (debounce 1 s en texto, inmediato en selecciones). Indicador "Guardado ✓" |
| Retomar | Al volver, se abre exactamente la pregunta donde quedó, con su texto a medias intacto. Nunca hay "empezar de nuevo" |
| Multi-dispositivo | El estado vive en servidor; empezar en el teléfono y terminar en la laptop es transparente |
| Diferidas | "Lo pienso después" las encola al final; el contador de avance las sigue contando como pendientes |
| Edición perpetua | "Mi cuestionario" lista las 33 respuestas y fecha de última edición; cualquier cambio recalcula matches en el siguiente batch |
| Cambios grandes | Si edita un filtro duro (P1–P5), avisar: *"Esto puede cambiar tus matches posibles"* |
| Sin castigo por lentitud | Ninguna métrica de tiempo se muestra al usuario; los 50 min son informativos en la bienvenida, no un cronómetro |

## Cómo reproducir la simulación

```bash
python3 montecarlo.py   # imprime ambos brazos y genera resultados_montecarlo.json
```

Los parámetros por pregunta (carga cognitiva, emocional, escritura, fricción de UI) están al inicio del script y son el lugar correcto para recalibrar cuando haya datos reales de campo.
