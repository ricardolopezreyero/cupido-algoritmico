# Modelo de matching · versión 2

Cómo pasamos de 43 respuestas × 2 personas a un solo número — por qué solo mostramos coincidencias de **90 % hacia arriba**, y por qué la puerta no se abre sola.

<!-- Autor: Ricardo López Reyero · RLR · rev 181218 -->

> **Qué cambió contra la v1, en una línea cada cosa**
> 1. **Recíproco de verdad:** se calcula A→B y B→A por separado y se combinan con media armónica. Un match que solo es bueno para uno, se hunde.
> 2. **Pesos personales:** lo sexual y lo espiritual ya no pesan igual para todos. Se deducen de lo que cada quien *hace* y de qué tan negociable lo declara.
> 3. **Vetos explicados** (lección del motor de SUMA): un requisito incumplido no "empata menos", elimina el par — y el panel dice por qué. Un dato que falta nunca veta.
> 4. **Techos:** una dimensión desastrosa limita el total aunque todo lo demás brille.
> 5. **Anclas estructuradas** junto a cada pregunta abierta: el toque da la señal dura, el texto da el matiz y la verdad.
> 6. **Umbral de 90 %** (antes 95 %) y **puerta con doble sí:** te avisamos, pero no te dejamos entrar hasta que los dos quieran.

La implementación vive en [`public/js/motor.js`](public/js/motor.js) y el cuestionario en [`public/js/preguntas.js`](public/js/preguntas.js). Este documento describe la arquitectura; los pesos exactos son de la versión demo y se van a recalibrar con datos reales (ver [la lista completa](docs/RUTA.md)).

---

## Representación de cada persona

Cada persona queda en dos capas:

1. **Respuestas estructuradas** — opciones, escalas, rankings y la rejilla de innegociables. Se guardan con **códigos estables**, nunca con el texto visible: con un millón de personas los textos del cuestionario van a cambiar y los datos no se deben romper.
2. **Lectura de las respuestas abiertas** — un modelo de lenguaje las lee **una sola vez por persona** y deja:
   - Una **rúbrica 0–10** en cuatro ejes: autoconocimiento (P16, P32, P43), responsabilidad emocional (P20, P22, P37), calidez demostrada (P26, P31, P33) y coherencia interna (contradicciones entre P6↔P29, P16↔P32, P14↔P29).
   - Las **etiquetas de la carta** (P33): qué promete y qué pide, de un vocabulario cerrado.

   Sin llave de IA el sistema no se detiene: usa una lectura heurística que nunca premia, solo evita que el perfil quede ciego.

¿Por qué anclas estructuradas? Porque con texto libre solo, cada cruce depende de una interpretación semántica cara y frágil. Ahora cada pregunta abierta trae un toque rápido (dónde es tu martes, tus 3 ejes de vida, qué necesitas después de pelear, qué te enciende y qué te apaga, qué prácticas haces). El motor cruza el toque con precisión y el texto sigue ahí para la rúbrica, para el matiz y para la persona que un día abra la puerta.

---

## Paso 0 · Vetos de ida y vuelta

Antes de calcular nada, un par (A, B) tiene que pasar los innegociables **de los dos**. Cada veto registra de quién es el filtro y si es "suave" (algo que la persona podría reconsiderar).

| Veto | Regla | ¿Suave? |
|---|---|---|
| Quién busca a quién (P1) | el género de A está en lo que B busca **y** al revés | — |
| Edad (P1) | edad(A) ∈ rango(B) **y** edad(B) ∈ rango(A) | sí |
| Distancia (P2) | ciudades distintas y **ninguno** se movería | sí |
| Hijos (P3) | "Sí con certeza" / "tengo y quiero más" nunca cruzan con "No con certeza" / "tengo y no quiero más" | no |
| Hijos del otro (P3, nuevo) | quien no acepta pareja con hijos contra quien ya tiene | no |
| Exclusividad (P5) | "innegociable" contra "abierto a no exclusividad" | no |
| Fe innegociable (P4) | quien necesita compartir la fe exige **misma tradición y práctica parecida** (una distancia de 3 niveles o más de práctica también veta) | no |
| Formación de los hijos (P4, nuevo) | si los dos planean hijos y uno los educaría en su fe y el otro sin formación religiosa, con fe innegociable | no |
| Hábitos (P27) | un "acepto hasta X" contra un hábito por encima de X; mascotas "prefiero que no tenga" contra "tengo y son familia" | sí |
| Política (P13) | quien la declaró innegociable contra una postura distinta ("prefiero no decirlo" nunca veta) | no |
| **Innegociables íntimos** (P38, nuevo) | "Lo necesito" contra "No lo acepto" en cualquiera de las filas | no |

Tres reglas heredadas del motor de SUMA:

- **Un dealbreaker no es un 0 en una dimensión: es la inexistencia del par.**
- **Un dato que falta nunca veta.** Es duda, no incumplimiento: baja la confianza, no elimina a nadie.
- **El veto se explica.** El panel admin muestra "habría sido 89 % · veto: fe innegociable". Y a la persona le decimos qué de *sus propios* filtros suaves le está dejando fuera gente muy compatible — pero **nunca le sugerimos negociar hijos, fe, exclusividad ni sus límites íntimos**.

En el demo, 77 de los 100 pares posibles se eliminan aquí, con costo casi nulo.

---

## Paso 1 · Diez dimensiones, en dos direcciones

Para cada par sobreviviente se calcula **s(A→B)**: qué tan bien le queda B a A, desde las necesidades de A. Y por separado **s(B→A)**. La compatibilidad no es simétrica: que tú necesites palabras y la otra persona las dé natural no implica lo inverso.

| Dimensión | Peso base | Qué cruza |
|---|---|---|
| Visión de vida | 13 | Dónde es tu martes, 3 ejes de vida bien vivida, lo que esperas de la ambición del otro contra cómo vive su trabajo, lugar de la familia de origen |
| Proyecto de familia | 10 | Hijos (matriz con certezas e inclinaciones), aceptar hijos del otro, tipo de relación, **ritmo para formar hogar**, formación espiritual de los hijos |
| Valores en acción | 11 | 3 valores innegociables, estilo con el dinero, modelo de dinero en pareja, afinidad política ponderada por cuánto te importa |
| Conflicto y reparación | 14 | Matriz de estilos (Gottman: perseguir-huir y doble acumulador son lo peligroso), lo que A necesita tras pelear contra lo que B sabe ofrecer, responsabilidad demostrada de B |
| Afecto y cuidado | 11 | Lo que A necesita recibir contra lo que B da primero, cercanía (estricta: un escalón ya es fricción), cómo cuida B contra lo que A necesita |
| **Intimidad sexual** | 11 | Ver revisión abajo |
| **Fe y vida interior** | 8 | Ver revisión abajo |
| Vida cotidiana | 10 | Hábitos, ejercicio y mascotas en dirección, cronotipo, **brecha entre el orden de B y la tolerancia de A**, domingos, división de la casa (roles solo cruzan si son complementarios) |
| Personalidad y humor | 8 | Energía social, viernes, orden y planes, estabilidad-aventura (±1 tolerado), tipo de humor |
| Cartas | 4 | Lo que A pide en su carta contra lo que B promete en la suya |

Cada dimensión deja **notas** ✓ / ~ / ✗ en dos voces: la del admin (detalle: "Frecuencia: tú una o dos por semana, él varias") y la de la persona (respetuosa: "En lo íntimo quieren un ritmo parecido"). **La persona nunca ve el detalle íntimo del otro.**

---

## Revisión de lo sexual (v2)

En la v1 lo íntimo pesaba 12 % para todos y tres de sus cinco preguntas eran texto libre, con un veto "semántico" frágil. Cambios:

1. **Tipo de deseo (P34, nuevo): espontáneo, responsivo o depende.** En muchas personas el deseo no aparece de la nada: aparece cuando ya empezó la cercanía (el modelo circular de Rosemary Basson; Emily Nagoski lo popularizó). Si A quiere más frecuencia, B tiene deseo responsivo y A da contacto y tiempo de forma natural, la brecha de frecuencia pesa menos. No castigamos igual lo que se puede encender.
2. **Comunicación íntima (P25, nuevo, escala 1–5).** Hablar de lo que se necesita es de lo que más predice una vida sexual satisfecha. Dos personas a las que les cuesta mucho hablarlo son un riesgo, aunque "quieran lo mismo".
3. **Importancia de lo íntimo (P25, nuevo, escala 1–5)** × **negociabilidad de la frecuencia (P34)** → el **peso personal** de la dimensión va de ~5 % a ~18 %. Para quien es esencial y poco negociable, pesa más en su lado del cálculo; para quien importa poco, pesa menos.
4. **Qué enciende y qué apaga (P36, nuevo, hasta 3 y 3).** Casi nada de lo que enciende a alguien pasa en la cama: pasa durante el día. Se cruza contra cómo da cariño la otra persona (lenguajes, cuidado, humor, iniciativa, apertura), no contra prácticas. Y lo que apaga se cruza contra sus riesgos (presión, críticas, conflictos sin resolver, frialdad, prisa).
5. **Apertura en doble dirección (P35).** "Prefiero que sea como yo", "que me abra mundo" o "que respete mis límites sin presionarme" definen curvas distintas: un 2 que quiere que le abran mundo cruza con un 3 o un 4; un 2 que necesita respeto a sus límites, no con un 5.
6. **Innegociables en rejilla (P38, nuevo):** esperar al matrimonio, explorar cosas nuevas con regularidad, pornografía en la relación y planificación familiar solo con métodos naturales — cada fila con "lo necesito / lo acepto / no lo acepto". El veto se volvió **determinista y explicable**. El texto libre sigue para lo que no está en la lista.
7. **Techo íntimo:** si lo íntimo es muy importante para alguien (peso personal alto) y ahí el par está por debajo de 55 %, el total no puede pasar de 86.
8. **El día a día íntimo (v2.1, P39–P40).** Seis factores nuevos dentro de la misma dimensión, con pesos chicos que suman 24 %: contacto físico diario (distancia 1–5), iniciativa (complemento), forma natural (iguales o vecinas), lo que necesitan después, experiencia contra lo que cada uno espera de la del otro, y el «hoy no» (cómo se dice y cómo se recibe). Las notas a la persona nunca revelan el detalle del otro: «uno toma la iniciativa y al otro le gusta que la tomen», «a los dos les cuesta decir hoy no: cuídenlo». La rejilla de innegociables suma pruebas de salud sexual y fantasías sin juicio, con el mismo veto «lo necesito / no lo acepto».
9. **Comida (v2.1, P27).** En vida cotidiana: «solo alguien que se cuida» contra «como lo que se me antoja» es veto suave; el punto medio nunca veta y quien acepta «equilibrado» solo pierde puntos contra el antojo. Cocinar cuenta poco: dos que no cocinan reciben una nota.

## Revisión de lo espiritual (v2)

En la v1 la P4 mezclaba religión, práctica e importancia en una sola pregunta, y la vida interior pesaba 5 % para todos. Cambios:

1. **Tres cosas separadas en P4:** tradición (8 opciones), **qué tan presente está en tu semana** y qué tan importante es compartirla. Lo que protege a una pareja no es la etiqueta: es compartir la práctica y darle la misma importancia.
2. **Veto de fe con práctica:** quien necesita compartir su fe no cruza con la misma etiqueta vivida en otra intensidad (a diario contra casi nunca).
3. **Formación espiritual de los hijos (P4, nuevo).** La fuente de conflicto más previsible de las parejas de tradiciones distintas aparece cuando llegan los hijos. Se pregunta antes.
4. **Cercanía entre tradiciones:** católica–cristiana, agnóstica–atea, espiritual–agnóstica no están a la misma distancia que religión–ateísmo. La matriz lo refleja.
5. **Prácticas reales (P39, nuevo):** oración, culto, meditación, terapia, lectura, diario, naturaleza, cuerpo, retiros, servicio — y **si las quieres compartir o solo necesitas que te las respeten**. Son necesidades distintas: la primera exige coincidencia; la segunda, respeto.
6. **Crecimiento en dirección (P40):** si A necesita que su pareja crezca con ella, un escalón por debajo pesa; si basta con que acompañe, casi no.
7. **Peso personal de ~3 % a ~17 %:** para quien necesita compartir la fe y la practica cada semana, esta dimensión puede ser la más pesada de todas; para quien no le importa, casi desaparece.
8. **Techo espiritual:** si la fe es central para alguien y ahí el par está por debajo de 55 %, el total no puede pasar de 86.

Lo sexual y lo espiritual **se tocan** en un punto que la v1 no veía: esperar al matrimonio y la planificación natural. Ahora están en la rejilla de innegociables y cruzan con la fe de cada quien.

---

## Paso 2 · Pesos personales

```
peso_i(A) = base_i × multiplicador_i(A)      y se normaliza a 100 %
```

| Dimensión | Sube cuando… |
|---|---|
| Intimidad | la persona le da mucha importancia y la frecuencia es poco negociable |
| Fe y vida interior | necesita compartir la fe, la practica seguido y tiene varias prácticas |
| Proyecto de familia | tiene certeza sobre hijos o prisa por formar hogar |
| Vida cotidiana | le molesta mucho el desorden |
| Afecto | necesita compartirlo casi todo |

**No preguntamos "¿qué te importa más?"**: la investigación sobre preferencias declaradas en pareja muestra que lo que la gente dice que busca predice mal lo que de verdad le funciona. Deducimos la importancia de conductas y de lo que la persona declaró negociable o no. Y **conflicto y valores nunca bajan de su peso base**: son lo que la evidencia dice que importa, aunque alguien no lo crea.

## Paso 3 · Agregación no compensable

```
S(A→B) = exp( Σ peso_i(A) · ln s_i(A→B) )        media geométrica ponderada
```

Un 0.55 en conflicto no se compensa con un 0.98 en humor. En la media aritmética sí; en la geométrica, una dimensión mala hunde el total — como en la vida real.

## Paso 4 · Reciprocidad

```
S(A,B) = 2 · S(A→B) · S(B→A) / ( S(A→B) + S(B→A) )     media armónica
```

Es la forma estándar de los sistemas de recomendación recíproca: si para uno es 0.98 y para el otro 0.70, el par queda en 0.82 — no en 0.84 como en un promedio. **La coincidencia es del par, no de uno.** Por eso ambos ven el mismo número.

## Paso 5 · Techos y calidad

```
% = round( 100 × min(S(A,B), techo) × min(Q(A), Q(B)) )
```

- **Techos:** conflicto y reparación < 50 % en cualquier dirección → máximo 84. Lo íntimo o la fe < 55 % para quien son centrales → máximo 86. Cualquier dimensión < 35 % → máximo 80.
- **Q** ∈ [0.85, 1.0] sale de la rúbrica. Se toma el **mínimo** de los dos: la madurez del par la define el menos claro. Dos perfiles idénticos con bajo autoconocimiento no son un gran match: son dos personas que se describieron mal de la misma manera.

## Paso 6 · Umbral, aviso y puerta

- **Coincidencia = 90 % o más.** Abajo, silencio. A la persona le decimos lo más cerca que alguien ha estado ("tu mejor compatibilidad hoy: 88 %"), nunca quién.
- **Se avisa a los dos al mismo tiempo.** El aviso dice el porcentaje, las tres razones más fuertes (primero lo que más pesa para quien lo lee) y lo que tendrían que cuidar.
- **Avisar sí, dejar entrar no.** La identidad queda protegida detrás de una puerta. Se abre **solo si los dos dicen que sí**. Nadie se entera nunca de un no — ni de que el otro ya dijo que sí.
- Al abrirse, el orden de revelación es el de siempre: carta → nombre → voz → video → fotos.
- **Motor automático** (como SUMA: "si es manual no se va a hacer"): cuando alguien termina o edita su cuestionario, el cruce corre solo para esa persona. Si un par cae por debajo del umbral y su puerta nunca se abrió, se retira en silencio.
- **Corrida manual** desde el admin en cinco fases con números reales: inventario → filtros duros → dimensiones → reciprocidad y techos → umbral y avisos.

## Por qué 90 % funciona (y qué lo rompería)

- Con vetos + media geométrica + armónica + techos + calidad, un 90 % exige no tener ninguna dimensión mediocre **para ninguno de los dos**. En el demo: 9 de 100 pares posibles.
- 95 % era tan estricto que con pocos usuarios casi nadie recibiría nada. 90 % conserva la escasez con significado y deja ver una lista corta y ordenada (96, 95, 94…).
- **El número es un índice, no una probabilidad.** Hasta tener resultados reales (puertas abiertas, segundas citas, parejas a 12 meses), un 90 % significa "no encontramos ninguna dimensión débil". Calibrarlo contra resultados es la prioridad científica #1.
- Riesgo real: **con pocos usuarios el silencio desmotiva.** Mitigación honesta: el tamaño del pool, lo más cerca que alguien ha estado, qué tan bien te conoce el algoritmo y qué filtros suaves te están dejando fuera.

## Anti-gaming y honestidad

1. Los pesos exactos de producción no se publican.
2. Consistencia cruzada entre anclas y textos baja la rúbrica de coherencia.
3. Las respuestas-aparador ("mi defecto es ser demasiado entregado") bajan autoconocimiento.
4. Nadie navega perfiles: no hay audiencia ante la cual posar. Mentir solo te empareja con la pareja ideal de alguien que no existe.

## Privacidad

- Las respuestas nunca son públicas ni navegables. Lo íntimo solo lo lee el motor.
- Antes de la puerta: porcentaje y razones en voz respetuosa. Después de la puerta: carta y, paso a paso, lo demás.
- Derecho a pausar, editar (recalcula) y borrar todo.

## Roadmap técnico

Está completo y priorizado en [`docs/RUTA.md`](docs/RUTA.md): lo que falta antes de abrirlo a personas reales, para miles y para el millón.

<!-- fin · RLR -->
