# Modelo de matching

Cómo pasamos de 33 respuestas × 2 personas a un solo número — y por qué solo avisamos arriba de 95%.

## Representación de cada persona

De las 33 respuestas se construyen tres capas por usuario:

1. **Vector duro** — las 16 OM, normalizadas. Sin ambigüedad, comparables directo.
2. **Vector semántico** — embeddings de cada respuesta abierta (una respuesta = un embedding; no se promedia todo junto, porque el domingo perfecto y la carta final miden cosas distintas).
3. **Rúbricas de calidad** — un LLM evalúa las abiertas en 4 ejes con escala 0–10: autoconocimiento (16, 22, 32), responsabilidad emocional (20, 21, 22), calidez demostrada (26, 31, 33) y coherencia interna (contradicciones entre 6↔29, 16↔32, 14↔29). Estas rúbricas **no se comparan entre personas**: miden qué tan "matcheable" es alguien y actúan como multiplicador.

## Pipeline de matching

### Paso 0 · Filtros duros (eliminatorios, bidireccionales)

Antes de calcular nada, un par (A, B) debe pasar **todos**:

| Filtro | Regla |
|---|---|
| Edad (P1) | edad(A) ∈ rango(B) **y** edad(B) ∈ rango(A) |
| Hijos (P3) | "Sí con certeza" nunca cruza con "No con certeza"; inclinaciones opuestas cruzan con penalización, no con veto |
| Intención y exclusividad (P5) | exclusividad innegociable requiere reciprocidad; "de por vida con matrimonio" no cruza con quien descarta casarse |
| Religión (P4) | solo filtra si alguno la marcó innegociable y el otro no es compatible |
| Geografía (P2) | distancia real vs. disposición a moverse de al menos uno |
| Hábitos vetados (P27) | un "no acepto" contra un hábito declarado del otro |
| Política (P13) | solo si alguien marcó innegociable |
| Innegociables sexuales (P38) | una necesidad declarada de A contra un límite declarado de B (cruce semántico, revisado con umbral conservador) |

Esto elimina ~80–95% de los pares posibles con costo computacional casi nulo. **Un dealbreaker no es un 0 en una dimensión: es la inexistencia del par.**

### Paso 1 · Score por dimensión

Para los pares sobrevivientes se calculan 7 sub-scores (0–1), cada uno con su lógica propia:

| Dimensión | Peso | Preguntas | Lógica |
|---|---|---|---|
| Visión de vida | 17% | 6, 7, 8, 9 | Similitud semántica de escenarios y definiciones de éxito |
| Valores en acción | 15% | 10, 11, 12, 13 | Similitud semántica de valores demostrados + match exacto en manejo de dinero |
| Conflicto y reparación | 15% | 19, 20, 21, 22 | **Compatibilidad de estilos**, no similitud: matriz de combinaciones (acumulador+acumulador penaliza aunque sean "iguales"); cruce necesidades⟷oferta de reparación (21) |
| Afecto | 12% | 23, 24, 25, 26 | **Cruzada**: lo que A necesita recibir vs. lo que B da naturalmente, promediado en ambas direcciones; cercanía (24) por similitud estricta |
| **Intimidad sexual** | 12% | 34–38 | Frecuencia por cercanía ponderada por negociabilidad (34); apertura en doble dirección (35); mapa deseo⟷oferta cruzado (36); rúbrica de manejo del desajuste (37); innegociables como filtro (38) |
| Vida cotidiana | 12% | 27, 28, 29, 30 | Similitud de hábitos y ritmos; brecha orden-vs-tolerancia (28); domingos comparados semánticamente |
| Personalidad y humor | 9% | 14, 15, 17, 18 | Similitud con tolerancia ±1 en escalas; humor (17) por similitud semántica pura |
| **Conciencia y vida interior** | 5% | 39, 40, 41 | Similitud de prácticas reales (39); desnivel de crecimiento cruzado con la expectativa del otro (40); P41 alimenta la rúbrica Q, no el score del par |
| Cartas y necesidades | 3% | 31, 33 | Promesas de A contra peticiones de B, y viceversa |

> La dimensión sexual pesa 12% — igual que la vida cotidiana — y además tiene veto propio vía P38. No es un tema lateral: es de las primeras causas reales de ruptura, y la única que las apps actuales fingen medir con fotos.

Dos mecánicas distintas conviven aquí a propósito:

- **Similitud** para valores, visión y estilo de vida — la evidencia es clara: en lo fundamental, los parecidos duran.
- **Complementariedad dirigida** para afecto y reparación — ahí lo que importa es que la oferta de uno calce con la necesidad del otro, no que sean idénticos.

### Paso 2 · Agregación no compensable

```
S_base(A,B) = Π ( sᵢ ^ wᵢ )        # media geométrica ponderada
```

**Media geométrica, no aritmética.** Es la decisión más importante del modelo: un 0.55 en conflicto no se puede "compensar" con un 0.98 en hobbies. En la media aritmética sí; en la geométrica, una dimensión mala hunde el total — exactamente como en la vida real.

### Paso 3 · Multiplicador de calidad

```
S_final(A,B) = S_base × min(Q(A), Q(B))
```

donde Q ∈ [0.85, 1.0] se deriva de las rúbricas. Dos perfiles idénticos con bajo autoconocimiento no son un gran match: son dos personas que se describieron mal de la misma manera. Se toma el **mínimo** de los dos, porque la madurez del par la define el menos maduro.

### Paso 4 · Umbral y notificación

- **Match = S_final ≥ 0.95.** Doble ciego: se notifica a ambos a la vez, o a ninguno. Nunca existe el estado "él ya vio tu perfil".
- La notificación incluye el % global, las 3 dimensiones más fuertes del par, y la **primera impresión** del otro en orden de revelación: carta (P33) → audio → video → fotos (ver `EXPERIENCIA.md`). El algoritmo nunca ve los medios; los medios solo existen para el momento del match.
- Si alguien tiene varios matches ≥95% simultáneos, se notifica **solo el mejor** y los demás quedan en cola: el producto es escasez con significado, no otra bandeja de opciones.

## Por qué 95% funciona (y qué lo rompería)

- Con media geométrica + filtros duros, 95% es **de verdad raro**: exige no tener ninguna dimensión mediocre. Eso es el producto — si el 30% de los usuarios tuviera matches, seríamos Tinder con encuesta.
- **El umbral es absoluto, no un percentil.** Con pocos usuarios habrá meses sin un solo match, y eso está bien: la promesa es "si te avisamos, va en serio", no "te avisaremos seguido".
- Riesgo real: **con pocos usuarios el silencio desmotiva**. Mitigación honesta: comunicar el tamaño del pool ("hay 1,240 personas en tu región; aún nadie supera tu umbral") sin revelar jamás a nadie en particular.

## Anti-gaming y honestidad

1. **No se publica el modelo de scoring por dimensión** (este doc describe la arquitectura, no los pesos exactos de producción).
2. **Consistencia cruzada**: contradicciones entre 6↔29, 16↔32, 14↔29 bajan Q. Mentir bien 17 veces seguidas en texto libre es muy difícil.
3. **Detección de deseabilidad social**: respuestas-aparador ("mi mayor defecto es que soy demasiado entregado") son un patrón detectable y penalizan la rúbrica de autoconocimiento.
4. **El incentivo está alineado**: como nadie navega perfiles, no hay audiencia ante la cual posar. Mentir solo consigue matchear con la pareja ideal de alguien que no existe.

## Privacidad

- Las respuestas nunca son públicas ni navegables; solo las lee el pipeline.
- Al hacer match solo se comparte: % global, top-3 dimensiones y la carta (P33). Todo lo demás se revela como debe revelarse: conversando.
- Derecho a actualizar respuestas (recalcula matches) y a borrar todo.

## Roadmap técnico sugerido

1. **MVP**: formulario (33 preguntas) → SQLite/D1 → batch nocturno: filtros duros en SQL, embeddings + rúbricas vía API LLM, scoring en un script. A <10k usuarios no se necesita nada más sofisticado.
2. **Calibración**: cuando existan matches reales, pedir feedback post-encuentro y ajustar pesos wᵢ con datos, no con intuición.
3. **Escala**: índice vectorial para pre-filtrar candidatos semánticos antes del scoring completo.
