# Cupido Algorítmico 💘

**No es una app de citas. Es un sistema de detección de parejas.**

<!-- Autor: Ricardo López Reyero · RLR · rev 181218 -->

Te registras, respondes 41 preguntas una sola vez, y no pasa nada más. No hay swipes, no hay fotos como moneda de cambio, no hay conversaciones forzadas. Si algún día el algoritmo encuentra a alguien con quien tu compatibilidad supera el **90 %**, les avisamos a los dos al mismo tiempo — pero **la puerta no se abre hasta que los dos digan que sí**. Si nunca pasa, nunca te molestamos.

## El demo

| | |
|---|---|
| **Entrar** · `/entrar` | Sin contraseñas. Con tu correo te mandamos un enlace mágico (vale 20 minutos, un solo uso); si no tienes cuenta, se crea con ese correo. O la **cuenta demo a un clic** (`/demo`): entras al tablero de Diego, una persona ficticia, con el interruptor "cuenta demo" encendido que no se apaga: si lo tocas, te invita a crear tu cuenta. |
| **Tablero de la persona** · `/persona` | Menú lateral: inicio con camino y logros, coincidencias de 90 % hacia arriba, aceptaciones, avisos, lo que más pesa, sus respuestas por categoría, privacidad, pausa y cerrar sesión. |
| **Panel administrativo** · `/admin` | Cifras, matriz 10 × 10, vetos explicados, el cálculo de cada par en las dos direcciones, puertas, corrida del matching por fases, laboratorio de pesos, artículos y bitácora en vivo. |
| **Artículos** · `/articulos` | Cualquiera publica sin crear cuenta. |
| **Cuestionario** · `/cuestionario` | Las 41 preguntas conectadas a tu cuenta: autoguardado y el motor te cruza al terminar. |

Sin contraseñas a propósito: el correo es la cuenta (enlace mágico) y el demo está a un clic. Lo que falta para abrirlo a personas reales (admin protegido, privacidad de datos sensibles, verificación de identidad, dominio propio para el correo…) está en **[la lista completa](docs/RUTA.md)**.

## Por qué

Las apps de citas actuales optimizan lo contrario a lo que prometen:

- **Optimizan atención, no parejas.** Su negocio es que sigas dentro, no que salgas emparejado.
- **El filtro primario es físico.** La foto decide en dos segundos algo que debería decidirse con información de años: valores, planes de vida, forma de pelear, forma de amar.
- **Generan incertidumbre infinita.** Cientos de opciones mediocres producen parálisis, no pareja.

Cupido Algorítmico invierte la lógica: **máxima información, mínimo ruido**. Solo te enteras de que alguien existe cuando la evidencia de compatibilidad es abrumadora — y aun así, nadie entra a tu vida si tú no dices que sí.

## Cómo decide (versión 2)

1. **Vetos de ida y vuelta**: los innegociables de los dos (edad, distancia, hijos, exclusividad, fe con práctica, hábitos, política, innegociables íntimos). Eliminan el par y se explican. Un dato que falta nunca veta.
2. **Diez dimensiones en las dos direcciones**: lo que tú necesitas contra lo que la otra persona da natural, y al revés.
3. **Pesos personales**: lo sexual y lo espiritual pesan distinto para cada quien, según lo que hace y qué tan negociable lo declara. Conflicto y valores nunca bajan.
4. **Media geométrica + media armónica**: una dimensión mala no se compensa, y un match bueno solo para uno se hunde.
5. **Techos y calidad**: una dimensión desastrosa limita el total; la claridad con la que se describió el menos claro de los dos también.
6. **Umbral de 90 % y puerta con doble sí.**

Detalle completo, incluida la revisión de lo sexual y lo espiritual: **[MODELO.md](MODELO.md)**.

## Estructura del repo

- [`MANIFIESTO.md`](MANIFIESTO.md) — Por qué existe esto, en una página.
- [`PREGUNTAS.md`](PREGUNTAS.md) — Las 41 preguntas con el razonamiento de cada una y los cambios de la v2.
- [`MODELO.md`](MODELO.md) — Cómo se calcula el porcentaje, por qué 90 % y por qué la puerta.
- [`EXPERIENCIA.md`](EXPERIENCIA.md) — La experiencia de respuesta y la primera impresión multimedia.
- [`docs/RUTA.md`](docs/RUTA.md) — **La lista completa** de lo que falta, priorizada.
- `public/js/preguntas.js` — el cuestionario v2 (fuente única de verdad).
- `public/js/motor.js` — el motor de compatibilidad v2 (lo usan el servidor y el navegador).
- `src/` — Worker de Cloudflare: API, base de datos D1, puertas, avisos, artículos.
- `public/` — landing, panel de personas, panel admin, cuestionario, editor de artículos.
- `seed/` — las 20 personas ficticias (respuestas estructuradas + textos) y los artículos iniciales.
- `scripts/probar-motor.mjs` — imprime la matriz 10 × 10 y el detalle de cualquier par.
- `scripts/pruebas-motor.mjs` — 17 pruebas del motor; `npm run deploy` no despliega si alguna falla.
- [`montecarlo.py`](montecarlo.py) — simulación de 1,000 participantes que informó el diseño de la experiencia.

## Correrlo

```bash
npm run pruebas
```

```bash
npm run probar
```

```bash
node scripts/probar-motor.mjs h01 m01
```

```bash
npm run dev
```

```bash
npm run deploy
```

`npm run dev` y `npm run deploy` primero arman `seed/personas.json`. La base se crea y se siembra sola en la primera petición; "Reiniciar demo" en el admin la regresa al estado inicial.

## El contrato con el usuario

1. Respondes una vez, con honestidad. Puedes actualizar tus respuestas cuando tu vida cambie.
2. Nadie ve tu perfil. Ni siquiera existe un "perfil" navegable.
3. Solo te avisamos si hay una coincidencia de 90 % o más — y la otra persona recibe su aviso al mismo tiempo.
4. La puerta solo se abre si los dos dicen que sí. Nadie se entera nunca de un no.
5. Mentir solo te garantiza hacer match con la pareja ideal de alguien que no eres tú.
