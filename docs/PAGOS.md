# El libro de cobros

Cómo sabe Cupido cuánto dinero entró, quién sigue de socio y qué se devolvió. Vive en [`src/pagos.js`](../src/pagos.js) y se prueba con [`scripts/pruebas-pagos.mjs`](../scripts/pruebas-pagos.mjs).

**La regla:** ningún peso se queda sin anotar y ninguno se anota dos veces.

Hoy solo se cobran apoyos voluntarios (el Fondo de atracción y los socios fundadores). El libro ya está hecho para lo que el [programa](../public/programa.html) cobre después: cada cobro lleva su `tipo`, y agregar uno nuevo no cambia nada de lo que sigue.

## Por qué no se pierde nada

| Qué puede salir mal | Qué lo cubre |
|---|---|
| El aviso de Stripe no llega (se cayó la red, el Worker estaba ocupado) | **El jalón:** cada pocos minutos Cupido le pide a Stripe los eventos nuevos. Lleva su propio lugar y no lo mueve hasta haber visto todo. |
| El mismo evento llega dos, tres o veinte veces | Cada renglón del libro usa la clave que le dio Stripe (`pi_…`, `in_…`, `re_…`). Anotar lo mismo otra vez no hace nada. |
| Los eventos llegan en desorden (la factura antes que la sesión, una baja antes que una actualización vieja) | Cada pieza se puede anotar sola. Una suscripción guarda la hora del último evento aplicado: uno más viejo no la pisa, y de «cancelada» no se regresa. |
| La persona paga y cierra la ventana antes de volver a Cupido | El aviso y el jalón confirman el apoyo sin ella. Y una vez al día la **conciliación** le pregunta a Stripe por cada pago que quedó abierto. |
| Stripe se cae a la mitad de un evento | El evento se guarda con su error y se reintenta hasta doce veces. Si Stripe ya no lo tiene, queda marcado como perdido y el panel lo enseña. |
| Hay un atraso grande (días sin leer) | Se recoge por partes, del más nuevo al más viejo, guardando dónde se quedó. El lugar no avanza hasta terminar. |
| Dos caminos confirman el mismo apoyo al mismo tiempo | El cambio a «confirmado» es una sola instrucción: solo uno gana y solo ese manda el correo de gracias. |
| Alguien manda un aviso falso | Con secreto de firma, se comprueba la firma de Stripe. Sin secreto, del aviso solo se toma la clave del evento y el evento se le pide a Stripe con nuestra llave: gana lo que diga Stripe. |
| La cuenta de Stripe se comparte con otras casas | De cada evento se comprueba que sea de Cupido: la sesión la abrió Cupido, o la suscripción y el cliente son nuestros. Lo ajeno se anota como «ajeno» (solo clave, tipo y hora) y no se vuelve a mirar. |
| Una devolución o una disputa | Restan del libro con su propia clave. Si el banco rechaza la devolución, el renglón se quita. Un aporte de una vez devuelto por completo deja de salir en la lista de agradecimiento. |

## Qué hay en la base

| Tabla | Qué guarda |
|---|---|
| `cobros` | **El libro.** Un renglón por movimiento: `clase` (cobro, devolucion, disputa), `tipo` (fondo, socio), `centavos` con signo, de quién es, `cuando` (la hora del dinero según Stripe) y las claves de Stripe para ligar cada cosa con la siguiente. |
| `suscripciones` | Un renglón por socio fundador: cuánto da al mes, su estado según Stripe (`active`, `past_due`, `canceled`…), hasta cuándo está pagado y cuándo se dio de baja. |
| `pagos_eventos` | Cada evento de Stripe que se miró: `hecho`, `ajeno`, `error` o `perdido`. Sin datos de nadie. |
| `pagos_estado` | Dónde va el jalón, cuándo salió bien, el último error y el resultado de la última conciliación. |
| `aportes` | Lo de antes: cada vez que alguien abre un pago. Ahora guarda además su suscripción, su pago y su cliente. |

Todo lo que se enseña sale de `cobros` y `suscripciones`: el ingreso al mes de `/gtm`, lo reunido y los socios de la página del programa, «Lo que has dado» en el tablero y el tope de cuidado de $5,000 al mes.

## Los tres caminos

1. **El aviso** · `POST /api/stripe/aviso`. Stripe llama en el momento. Es el camino rápido, y es opcional: si no está encendido, todo entra por el jalón con unos minutos de retraso.
2. **El jalón** · corre dentro de la tarea de cada tres minutos. Pide eventos nuevos cada vuelta si alguien está pagando en ese momento; si no, cada 15 minutos. Si la llave no tiene permiso de leer eventos, lo intenta cada hora y lo dice en el panel.
3. **La conciliación** · una vez al día (10 de la mañana, hora del centro). Revisa los pagos que quedaron abiertos, el estado y las facturas de cada suscripción (por turnos, las que llevan más tiempo sin revisarse) y las devoluciones de los últimos 35 días.

Además, cuando la persona vuelve del pago, su tablero confirma en ese instante (`/api/apoyar/confirmar`). Los cuatro terminan en la misma función, `confirmarSesion`.

## Lo que ve cada quien

- **La persona**, en su tablero → Apoyar: si es socio, desde cuándo, cuánto y cuándo es el siguiente cobro; el botón **Dejar de ser socio** (un clic, se cancela en Stripe en ese momento y llega un correo de confirmación); y «Lo que has dado», con cada cobro y cada devolución.
- **Admin → Programa → El libro de cobros:** si está al día, cuántos eventos se han anotado, los pagos abiertos, la última conciliación, los movimientos, los socios y los eventos por resolver. De quién es cada cobro solo lo ve una cuenta administradora, que además tiene el botón «Leer Stripe y conciliar ahora».
- **`/gtm`:** el ingreso al mes es lo cobrado en 30 días, ya restado lo devuelto. Si el libro no está al día con Stripe, la franja lo avisa: el número puede estar corto, nunca inflado.

## Encender el aviso de Stripe (opcional, lo hace Ricardo)

Sin esto el sistema ya funciona. Con esto, las confirmaciones llegan en segundos en vez de minutos.

1. En el panel de Stripe: Desarrolladores → Webhooks → Agregar destino.
2. Dirección: `https://cupido.capitaltorreon.com/api/stripe/aviso`
3. Eventos: los quince de la lista `TIPOS` de `src/pagos.js` (sesiones de pago, facturas, suscripciones, devoluciones y disputas).

No hace falta nada más: el aviso se comprueba pidiéndole el evento a Stripe. Si después se quiere comprobar también con la firma (ahorra una pregunta a Stripe por aviso): copiar el «secreto de firma» que Stripe enseña al crear el destino y guardarlo en la bóveda con

```bash
~/superleads-secretos/secreto del-portapapeles STRIPE_WEBHOOK_CUPIDO
```

y avisar para ligarlo en `wrangler.jsonc` como `STRIPE_WEBHOOK_SECRET` y desplegar. (No se liga antes: un secreto que no existe en la bóveda rompe el despliegue.)

## Probarlo

```bash
node scripts/pruebas-pagos.mjs
```

Son 34 pruebas contra una base en memoria y un Stripe de mentira: eventos repetidos, en los seis órdenes posibles, dos caminos a la vez, devoluciones parciales y simultáneas, disputas, bajas, cobros atrasados, pagos de otras casas, avisos falsos, un atraso de 270 eventos recogido por partes, caídas de Stripe a medio evento y, al final, todo junto y revuelto: el libro tiene que cuadrar al centavo con lo que Stripe cobró. Corren solas antes de cada despliegue (`npm run deploy`).

## Lo que falta

- **Devolver desde el panel.** Hoy una devolución se hace en el panel de Stripe (la casa devuelve sin preguntas en 15 días); el libro la anota sola.
- **Cuando llegue la cuenta de Stripe de CapitalTorreon:** al cambiar la llave, el jalón sigue donde iba, pero los socios que se hicieron en la cuenta vieja se siguen cobrando allá y Cupido ya no podría leerlos (la conciliación lo avisa; no da de baja a nadie por eso). Antes de cambiar la llave hay que decidir si esos socios se migran o se dejan terminar.
- **Lo que cobre el programa en 2028** (entrada, puerta) entra al mismo libro con su propio `tipo`; falta construir esos cobros.
