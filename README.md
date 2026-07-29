# Cupido Algorítmico 💘

**No es una app de citas. Es un sistema de detección de parejas.**

Te registras, respondes 33 preguntas una sola vez, y no pasa nada más. No hay swipes, no hay fotos como moneda de cambio, no hay conversaciones forzadas. Si algún día el algoritmo encuentra a alguien con quien tu compatibilidad supera el **95%**, les avisamos a los dos. Si nunca pasa, nunca te molestamos.

## Por qué

Las apps de citas actuales optimizan lo contrario a lo que prometen:

- **Optimizan atención, no matches.** Su negocio es que sigas dentro, no que salgas emparejado.
- **El filtro primario es físico.** La foto decide en 2 segundos algo que debería decidirse con información de años: valores, planes de vida, forma de pelear, forma de amar.
- **Generan incertidumbre infinita.** Cientos de opciones mediocres producen parálisis, no pareja.

Cupido Algorítmico invierte la lógica: **máxima información, mínimo ruido**. Solo te enteras de que alguien existe cuando la evidencia de compatibilidad es abrumadora.

## Por qué 33 preguntas

- Es un número **alto pero llenable**: suficiente para cubrir todas las dimensiones que predicen éxito de pareja, sin agotar a quien responde con seriedad.
- El costo de responderlas es un **filtro en sí mismo**: quien no invierte 40 minutos en describir su vida, no está buscando en serio.
- Cada pregunta existe porque su respuesta **alimenta el algoritmo**. No hay preguntas decorativas.

## Las dimensiones que medimos (y por qué)

La investigación sobre parejas de largo plazo (Gottman, teoría del apego, Big Five, estudios longitudinales de satisfacción marital) es sorprendentemente consistente: lo que predice que una pareja dure y sea feliz **no es lo que las apps miden**. Estas son las 8 dimensiones del cuestionario:

| # | Dimensión | Qué predice | Lógica de matching |
|---|-----------|-------------|--------------------|
| 1 | **Filtros duros y logística** | Viabilidad básica | Eliminatoria: edad mutua, hijos, exclusividad, religión innegociable, disposición geográfica |
| 2 | **Visión de vida** | Que ambos remen hacia el mismo lugar | Similitud alta requerida |
| 3 | **Valores en acción** | Confianza y respeto a largo plazo | Similitud semántica (no de palabras, de conducta) |
| 4 | **Personalidad y energía** | Convivencia diaria sin fricción | Similitud en algunas cosas, complementariedad tolerada en otras |
| 5 | **Conflicto y reparación** | El predictor #1 de divorcio (Gottman) | Compatibilidad de estilos: no importa cuánto pelees, importa cómo reparas |
| 6 | **Afecto e intimidad** | Satisfacción emocional sostenida | **Cruzada**: lo que A necesita recibir vs. lo que B da naturalmente, en ambas direcciones |
| 7 | **Vida cotidiana** | El 90% del tiempo real de una pareja | Similitud en hábitos, tolerancias explícitas |
| 8 | **Profundidad y autoconocimiento** | Madurez emocional: capacidad de estar en pareja | Evaluada por rúbrica, no comparada — es un multiplicador de calidad |

Tres decisiones de diseño importantes:

1. **El cuestionario es idéntico para hombres y mujeres.** El matching no necesita preguntas distintas por sexo; necesita cruzar *lo que tú eres* con *lo que la otra persona busca*, en ambas direcciones. Preguntas asimétricas meterían sesgo sin agregar señal.
2. **Casi todas las preguntas capturan dos cosas: cómo eres tú y qué necesitas del otro.** El match no es "se parecen", es "A ofrece lo que B necesita **y** B ofrece lo que A necesita".
3. **Mayoría abiertas, minoría de opción múltiple — cada una con su función.** Las abiertas dan señal semántica y autenticidad (es muy difícil fingir profundidad en texto libre). Las de opción múltiple dan señal dura, comparable y sin ambigüedad para filtros y pesos.

## Estructura del repo

- [`MANIFIESTO.md`](MANIFIESTO.md) — Por qué existe esto, en una página.
- [`PREGUNTAS.md`](PREGUNTAS.md) — Las 33 preguntas base + el Módulo Profundo (P34–P41: intimidad sexual y nivel de conciencia), con el razonamiento de cada una.
- [`MODELO.md`](MODELO.md) — Cómo se calcula el % de compatibilidad y por qué el umbral es 95%.
- [`EXPERIENCIA.md`](EXPERIENCIA.md) — La experiencia de respuesta (una pregunta por pantalla, ayudas, autoguardado, edición) y la primera impresión multimedia (fotos, audio, video — que el algoritmo nunca ve y solo se revelan al hacer match).
- [`montecarlo.py`](montecarlo.py) — Simulación de 1,000 participantes que informó el diseño de la experiencia.

## El contrato con el usuario

1. Respondes una vez, con honestidad. Puedes actualizar tus respuestas cuando tu vida cambie.
2. Nadie ve tu perfil. Ni siquiera existe un "perfil" navegable.
3. Solo recibes una notificación si hay un match ≥95% — y la otra persona recibe la suya al mismo tiempo.
4. Mentir solo te garantiza hacer match con la pareja ideal de alguien que no eres tú.
