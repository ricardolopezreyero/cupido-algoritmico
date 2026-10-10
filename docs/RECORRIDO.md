# El recorrido: cómo recibe Cupido a cada persona

> Autor: Ing. Ricardo López Reyero · RLR
> Código: [`public/bienvenida.html`](../public/bienvenida.html) (el recorrido), [`public/cuestionario.html`](../public/cuestionario.html) (las 43 preguntas) y la tarjeta «Tu perfil» de [`public/persona.html`](../public/persona.html).

El recorrido no es una parte del producto: es lo que decide si el producto se usa. Va desde que alguien abre su enlace hasta que su perfil está completo, y tiene tres tramos: **las ocho pantallas**, **el cuestionario** y **el tablero el primer día**.

## La idea

1. **Primero se pregunta quién llega.** Con el nombre, «soy» y «busco» se elige la voz de todo lo demás. Y no es una pregunta de más: son las dos primeras respuestas del cuestionario, que ya llegan contestadas.
2. **A ella se le habla de control; a él, de llegar completo.** Las mismas pantallas, textos distintos y opciones distintas.
3. **Lo completo se enseña, no se exige.** Nadie lee «debes llenar todo». Ven los números del motor: el mismo cruce, contado con una línea o con ejemplos, queda abajo o arriba del 90 %.
4. **Cada pantalla es una idea y algo que se toca.** Lo que no hace falta para decidir contestar con la verdad no va aquí: se explica cuando llega su momento.
5. **Lo que se elige se queda.** Los candados de ella y la aceptación de él se guardan al tocarlos.

## Las tres voces

| Voz | Para quién | De qué le habla |
|---|---|---|
| `ella` | Quien no es hombre y busca hombres | «Aquí nadie te ve hasta que tú dices que sí». Tu verdad completa es tu filtro. Aquí mandas tú. |
| `el` | Hombre que busca mujeres | «Aquí no compites por atención: aquí te encuentran». El motor solo presenta a quien conoce completo. Aquí manda ella, y eso te conviene. |
| `par` | Todos los demás | La versión sin género: la regla de la casa se explica y se acepta al seguir. |

## Las ocho pantallas

| # | Pantalla | Ella | Él | Lo que se toca |
|---|---|---|---|---|
| 1 | Quién llega | — | — | Nombre, «soy», «busco». Sin esto no se avanza. |
| 2 | Qué es Cupido | Nadie te ve sin tu sí | Aquí te encuentran | Lo que aquí no existe, tachado |
| 3 | El motor y el silencio | Abajo del 90 % nadie te ve | El silencio no es rechazo | Seis cruces, uno suena |
| 4 | La puerta | Elige: «nos avisan a los dos» o «primero a mí» | Nadie se entera de un no, tampoco del tuyo | La puerta que se abre con dos síes |
| 5 | Cuando se abre | Tu foto sigue guardada | Primero su carta, al final su foto | La charla que ya empezó |
| 6 | La regla de la casa | «Aquí mandas tú»: modo discreta y «no cruzarme con» | Tres compromisos que acepta tocándolos | Sus candados / sus compromisos |
| 7 | La palabra de la casa | Sin publicidad, ni la habrá | Igual | — |
| 8 | Tu parte | Tu verdad completa es tu filtro | El motor solo presenta a quien conoce completo | La nitidez: una línea, lo justo o con ejemplos |

Reglas que no cambian: obligatorio y sin salida la primera vez; tres segundos mínimo por pantalla; el avance se guarda. Quien ya lo recorrió como visita y después crea su cuenta entra directo a la pantalla 6, que es la que se acepta con cuenta.

## Los números detrás de «completo»

No son un recurso de venta: es como calcula el motor (`public/js/motor.js`).

- **Sin todas las de opción y sin la carta, el perfil no entra al matching.** No cruza con nadie.
- **Cómo están contadas las abiertas multiplica cada cruce** por un factor entre 0.85 y 1. Con respuestas de una línea, el techo es 85 %: nadie cruza el 90 % con esa persona, aunque embonen. Cuenta el menos claro de los dos.
- La pantalla 8 usa esos números tal cual: un cruce de 96 % se ve como 82 %, 88 % o 96 %.

## El cuestionario

- Abre con el nombre y con lo ya contestado en el recorrido.
- Una línea al entrar a cada bloque, que acompaña y no regaña.
- Debajo de cada respuesta abierta, qué tan nítida va quedando. No bloquea nada.
- Al cerrar sin terminar: cuántas **preguntas** faltan (no partes) y un botón que lleva a la primera.
- Al terminar: lo que sigue (foto, voz y video), dicho a cada quien.

## El tablero el primer día

La tarjeta **«Tu perfil»**: preguntas, carta, abiertas con ejemplos, foto, voz y video. Lo que todavía no se puede hacer aparece con candado y dice por qué. Quien no ha terminado la ve antes que las cifras; quien ya está en el matching, después. Desaparece cuando está todo.

## Lo que salió del recorrido y a dónde fue

La charla a detalle, la chispa, las llamadas, la liberación del perfil por elementos y el paseo por el tablero ya no se explican antes de la pregunta 1. Se quedó una sola pantalla («Cuando se abre») que enseña la recompensa. Lo demás se aprende adentro, cuando toca.

## Lo que se cuida al escribir aquí

- No se prometen cifras de personas. «Con todas las mujeres que están en Cupido y con cada una que llegue» es cierto con diez y con diez mil.
- A ella nunca se le habla en tercera persona de «ella».
- A él la regla se le presenta como lo que es: la razón por la que una mujer seria se queda.
- «Sin publicidad» va en el recorrido, en la portada, en el pie de las páginas y en el tablero.
