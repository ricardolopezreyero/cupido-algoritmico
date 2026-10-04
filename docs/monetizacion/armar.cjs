// Cupido Algorítmico · Documento de monetización — RLR · Ricardo López Reyero
const fs = require('fs');
const { Document, Packer, Paragraph, TextRun, HeadingLevel, AlignmentType, Table, TableRow, TableCell, WidthType, ShadingType, BorderStyle, LevelFormat, PageBreak, TableOfContents, Footer, Header, PageNumber } = require('docx');
const ROSA = 'B23349', TINTA = '211D24', GRIS = '75707C', CREMA = 'FBEEF1';
const F = 'Georgia', S = 'Calibri';
const p = (t, o = {}) => new Paragraph({ spacing: { after: 140, line: 300 }, ...o, children: (Array.isArray(t) ? t : [t]).map((x) => typeof x === 'string' ? new TextRun({ text: x, font: S, size: 22, color: TINTA }) : x) });
const b = (t) => new TextRun({ text: t, bold: true, font: S, size: 22, color: TINTA });
const it = (t) => new TextRun({ text: t, italics: true, font: S, size: 22, color: GRIS });
const h1 = (t) => new Paragraph({ heading: HeadingLevel.HEADING_1, spacing: { before: 420, after: 160 }, children: [new TextRun({ text: t, font: F, size: 34, bold: true, color: TINTA })] });
const h2 = (t) => new Paragraph({ heading: HeadingLevel.HEADING_2, spacing: { before: 280, after: 120 }, children: [new TextRun({ text: t, font: F, size: 27, bold: true, color: ROSA })] });
const li = (t, lvl = 0) => new Paragraph({ numbering: { reference: 'vinetas', level: lvl }, spacing: { after: 80, line: 290 }, children: (Array.isArray(t) ? t : [t]).map((x) => typeof x === 'string' ? new TextRun({ text: x, font: S, size: 22, color: TINTA }) : x) });
const num = (t) => new Paragraph({ numbering: { reference: 'numeros', level: 0 }, spacing: { after: 100, line: 290 }, children: (Array.isArray(t) ? t : [t]).map((x) => typeof x === 'string' ? new TextRun({ text: x, font: S, size: 22, color: TINTA }) : x) });
const cita = (t) => new Paragraph({ spacing: { before: 120, after: 200, line: 300 }, indent: { left: 480 }, border: { left: { style: BorderStyle.SINGLE, size: 18, color: ROSA, space: 12 } }, shading: { type: ShadingType.CLEAR, fill: CREMA, color: 'auto' }, children: [new TextRun({ text: t, font: F, size: 24, italics: true, color: TINTA })] });
const celda = (t, w, enc = false, fill) => new TableCell({ width: { size: w, type: WidthType.DXA }, shading: fill || enc ? { type: ShadingType.CLEAR, fill: fill || 'F3EEE9', color: 'auto' } : undefined, margins: { top: 90, bottom: 90, left: 120, right: 120 }, children: (Array.isArray(t) ? t : [t]).map((x) => new Paragraph({ spacing: { after: 0, line: 270 }, children: [new TextRun({ text: x, font: S, size: enc ? 20 : 20, bold: enc, color: TINTA })] })) });
const tabla = (anchos, filas) => new Table({ width: { size: anchos.reduce((a, x) => a + x, 0), type: WidthType.DXA }, columnWidths: anchos, rows: filas.map((f, i) => new TableRow({ tableHeader: i === 0, children: f.map((c, j) => celda(c, anchos[j], i === 0)) })) });

const doc = new Document({
  creator: 'Ing. Ricardo López Reyero', title: 'Cupido Algorítmico · Cómo monetizar sin traicionar el producto',
  styles: { default: { document: { run: { font: S, size: 22, color: TINTA } } } },
  numbering: { config: [
    { reference: 'vinetas', levels: [{ level: 0, format: LevelFormat.BULLET, text: '•', alignment: AlignmentType.LEFT, style: { paragraph: { indent: { left: 520, hanging: 260 } } } }, { level: 1, format: LevelFormat.BULLET, text: '–', alignment: AlignmentType.LEFT, style: { paragraph: { indent: { left: 980, hanging: 260 } } } }] },
    { reference: 'numeros', levels: [{ level: 0, format: LevelFormat.DECIMAL, text: '%1.', alignment: AlignmentType.LEFT, style: { paragraph: { indent: { left: 520, hanging: 320 } } } }] },
  ] },
  sections: [{
    properties: { page: { size: { width: 12240, height: 15840 }, margin: { top: 1300, bottom: 1200, left: 1400, right: 1400 } } },
    headers: { default: new Header({ children: [new Paragraph({ alignment: AlignmentType.RIGHT, children: [new TextRun({ text: '💘 Cupido Algorítmico · Monetización · v1 · 4 de octubre de 2026', font: S, size: 17, color: GRIS })] })] }) },
    footers: { default: new Footer({ children: [new Paragraph({ alignment: AlignmentType.CENTER, children: [new TextRun({ text: 'Confidencial · Ing. Ricardo López Reyero · Página ', font: S, size: 17, color: GRIS }), new TextRun({ children: [PageNumber.CURRENT], font: S, size: 17, color: GRIS })] })] }) },
    children: [
      new Paragraph({ spacing: { before: 2400, after: 120 }, children: [new TextRun({ text: 'CUPIDO ALGORÍTMICO', font: S, size: 22, bold: true, color: ROSA, characterSpacing: 60 })] }),
      new Paragraph({ spacing: { after: 240 }, children: [new TextRun({ text: 'Cómo monetizar sin traicionar el producto', font: F, size: 56, bold: true, color: TINTA })] }),
      new Paragraph({ spacing: { after: 160 }, children: [new TextRun({ text: 'Razonamiento a 20 años: dónde hay valor para la persona y para nosotros, en qué orden cobrarlo, y qué no haremos nunca.', font: S, size: 26, color: GRIS })] }),
      new Paragraph({ spacing: { before: 600, after: 60 }, children: [new TextRun({ text: 'Documento de trabajo · solo razonamiento, nada construido', font: S, size: 20, color: GRIS })] }),
      new Paragraph({ children: [new TextRun({ text: 'Preparado para Ing. Ricardo López Reyero · 4 de octubre de 2026 · versión 1', font: S, size: 20, color: GRIS })] }),
      new Paragraph({ children: [new PageBreak()] }),

      h1('1. La idea en una página'),
      p(['Cupido Algorítmico no es una app de citas. Es un sistema de detección de parejas: 43 preguntas una sola vez, un motor que cruza en las dos direcciones, silencio hasta el 90 % y una puerta que solo se abre con dos síes. La monetización tiene que respetar esa naturaleza o la destruye.']),
      cita('Una app de citas gana mientras no encuentras pareja. Cupido gana cuando sí la encuentras. Esa es toda la diferencia, y es la que hay que proteger con el modelo de negocio.'),
      p([b('La regla de oro: '), 'solo cobramos en los momentos en que la persona ya recibió un valor comprobable, y nunca por saltarse la fila, por ser visto, por ver a otros ni por "mejorar sus probabilidades". El algoritmo no se compra. Lo que se compra es acceso, acompañamiento y tiempo bien usado.']),
      p([b('A dónde va el dinero: '), 'a atraer más personas serias. Más personas, más cruces; más cruces, más coincidencias arriba del 90 %; más coincidencias, más ingresos. Es un volante que gira solo si cada peso regresa a la puerta de entrada. Propongo escribirlo como compromiso público: una fracción fija de cada peso cobrado se reinvierte en traer a la siguiente persona.']),
      p([b('El resumen de las fuentes, en orden de importancia a 20 años:')]),
      tabla([2400, 4300, 2740], [
        ['Fuente', 'Qué recibe la persona', 'Cuándo cobramos'],
        ['Entrada con seriedad', 'Un pool donde todos entraron en serio; identidad verificada', 'Una vez, al terminar las 43 preguntas'],
        ['La puerta', 'La coincidencia real, arriba del 90 %, con alguien que también dijo sí', 'Solo cuando los dos dicen sí'],
        ['Mientras esperas', 'Círculos, diario, lectura mensual, artículos y sesiones', 'Mes a mes, cancelable, sin ataduras'],
        ['Acompañamiento', 'Especialistas reales: pareja, sexualidad, fe, duelo', 'Por sesión; nosotros cobramos comisión'],
        ['Comunidades propias', 'Un Cupido cerrado para su parroquia, universidad o empresa', 'Licencia anual a la institución'],
        ['Regalo', 'Alguien te regala tu entrada: un hijo, una amiga', 'Lo paga quien regala'],
        ['Investigación', 'Un país que se entiende mejor a sí mismo en el amor', 'Datos agregados y anónimos, nunca personales'],
      ]),
      p(''),

      h1('2. Qué tenemos hoy (el inventario)'),
      p('Lo que ya existe y sobre lo que se construye cualquier cobro:'),
      li(['Cuestionario de 43 preguntas con dictado y pincel; motor recíproco con vetos explicados, pesos personales y techos; calidad Q por la claridad con que la persona se describe.']),
      li(['Puerta con doble sí; nadie se entera de un no; charla en vivo que nace sola, con el perfil liberado por elementos (seis suaves, cuatro sensibles).']),
      li(['Foto, voz y video solo al final; tablero personal con camino, logros, Mi vida hoy, estilo propio, pausa y control.']),
      li(['Acceso sin contraseña por correo, ocho correos cuidados, demo a un clic, artículos abiertos.']),
      li(['Lo que falta y bloquea el cobro real: admin protegido, aviso de privacidad para datos sensibles, verificación de identidad, moderación.']),
      p([it('Nada de lo anterior se vende por partes. Todo es el producto. La monetización se pone encima, en momentos, no en funciones recortadas.')]),

      h1('3. Principios que no se negocian'),
      num([b('El algoritmo no se compra. '), 'Nadie sube en el cálculo por pagar. El 90 % es el 90 % para todos.']),
      num([b('Nadie paga por ser visto. '), 'No existe "perfil destacado", "boost" ni "quién te vio". No hay perfiles que ver.']),
      num([b('Pagar nunca es la condición para decir sí. '), 'Si la puerta cuesta, cuesta igual para los dos y se devuelve si el otro dice no. El no sigue siendo invisible.']),
      num([b('Sin publicidad, nunca. '), 'La atención de una persona que busca pareja no se vende a terceros. Ni una sola.']),
      num([b('Los datos sensibles no son producto. '), 'Vida sexual, fe y política no se venden, no se comparten, no se "anonimizan creativamente". Solo cifras agregadas, y solo para investigación con nombre y apellido del propósito.']),
      num([b('Salir es tan fácil como entrar. '), 'Toda suscripción se cancela en un clic; toda pausa es gratis; toda cuenta se borra a petición.']),
      num([b('Transparencia radical. '), 'Cada peso que cobramos dice en qué se invierte, con cifras públicas una vez al año.']),

      h1('4. Las fuentes de valor, una por una'),
      h2('4.1 Entrada con seriedad (la cuota única)'),
      p(['Hoy entrar es gratis y sin fricción, y así debe seguir para responder. Pero el valor de Cupido depende de que el pool esté lleno de personas serias. Una cuota única, cobrada ', b('al terminar las 43 preguntas'), ' (no antes), hace tres cosas: filtra por seriedad y no por dinero (es una cantidad que cualquiera que busca pareja en serio puede pagar), paga la verificación de identidad que protege a todos, y financia la atracción de la siguiente persona.']),
      li(['Precio de referencia: 490 a 990 MXN, una sola vez en la vida. Anclado contra lo que cuesta una sola cena de una cita a ciegas que no funcionó.']),
      li(['Incluye: verificación de identidad (selfie + documento con un proveedor), entrada al matching y el tablero completo.']),
      li(['Becas: un porcentaje de entradas gratuitas cada mes para quien lo pida (estudiantes, madres solas). Lo decide un criterio público, no un algoritmo oculto.']),
      li(['Por qué le conviene a la persona: entra a un lugar donde nadie está "por curiosidad".']),
      h2('4.2 La puerta (cobrar en el momento de máximo valor)'),
      p(['El instante de más valor percibido en todo el sistema es cuando suena el teléfono: "apareció alguien al 96 % contigo". Ahí la persona ya recibió lo que nadie más le puede dar. Propongo que ', b('abrir la puerta tenga un costo igual para los dos'), ', que se cobra solo cuando los dos dijeron sí y la charla nació. Si uno dice no, al otro no se le cobra nada y nunca se entera.']),
      li(['Precio de referencia: 990 a 1,990 MXN por puerta abierta, por persona. Puertas posteriores del mismo par no cuestan.']),
      li(['Alternativa más suave: la primera puerta de cada persona es gratis; a partir de la segunda, cuesta. Esto premia a quien eligió bien.']),
      li(['Garantía incorporada: si en 24 meses nadie cruzó el 90 % contigo, te devolvemos la entrada o la conviertes en acompañamiento. Nadie en esta industria se atreve a prometer eso; nosotros podemos porque solo avisamos cuando vale.']),
      li(['Por qué le conviene a la persona: paga por una coincidencia real, no por la esperanza de una.']),
      h2('4.3 Mientras esperas (la suscripción que da valor sin match)'),
      p(['La mayoría del tiempo en Cupido es silencio. Ese tiempo puede ser el más valioso para la persona si lo usamos para que se conozca mejor y se relacione sin presión. Es la línea de ', b('Círculos'), ' (grupos de 8 a 12 personas con afinidad del 70 al 89 %, con sala en vivo), ', b('salas por tema'), ', ', b('la pregunta de la semana'), ', ', b('el diario guiado'), ' que mejora la claridad del perfil, y ', b('la lectura mensual'), ' de cómo cambia su vida.']),
      li(['Precio de referencia: 149 a 249 MXN al mes, cancelable en un clic. Incluye los Círculos y el diario; los artículos y las salas públicas siguen gratis.']),
      li(['Por qué le conviene a la persona: cada semana se entiende un poco más, y el motor la entiende mejor (sube su Q, suben sus coincidencias). Es la única suscripción de pareja que te sirve aunque no encuentres pareja.']),
      li(['Por qué nos conviene: ingreso estable que no depende de la suerte de los cruces, y una comunidad que se queda.']),
      h2('4.4 Acompañamiento humano (la capa de especialistas)'),
      p(['Las dimensiones que más predicen que una pareja dure (conflicto y reparación, intimidad, fe) son justo donde la gente más necesita ayuda y menos la pide. Cupido ya sabe, con permiso de la persona, qué dimensión le pide atención. De ahí a ofrecer ', b('una sesión con un especialista verificado'), ' hay un paso: terapeutas de pareja, sexólogos clínicos, acompañantes espirituales de varias tradiciones, asesores de dinero en pareja.']),
      li(['Modelo: el especialista cobra su sesión; Cupido cobra una comisión del 15 al 25 % por traerle a la persona correcta en el momento correcto.']),
      li(['Para parejas con puerta abierta: "Preparación para la pareja", un programa de 6 a 8 sesiones con ambos, que hoy nadie ofrece bien y que las iglesias hacen desde hace siglos. Cupido lo moderniza.']),
      li(['Por qué le conviene a la persona: ayuda exacta, no genérica, cuando la necesita.']),
      h2('4.5 Comunidades propias (licencias)'),
      p(['El motor y la charla no dependen del pool nacional. Una ', b('parroquia, una universidad, una empresa de bienestar o una comunidad de migrantes'), ' puede tener su Cupido cerrado: su gente, sus reglas de entrada, el mismo motor. Esto abre un negocio institucional que no depende del consumidor.']),
      li(['Precio de referencia: licencia anual por tamaño de comunidad, de 30,000 a 300,000 MXN; la institución decide si cobra o regala entradas.']),
      li(['Por qué conviene a todos: comunidades con valores compartidos tienen tasas de coincidencia más altas, y la institución gana una herramienta de pertenencia.']),
      h2('4.6 Regalo'),
      p(['"Te regalo tu Cupido." Un padre a su hija, una amiga a su amiga, una hermana a su hermano. La entrada con seriedad, pagada por otra persona, con una carta. Es el canal de crecimiento más natural que existe: la gente que ya encontró pareja regala el camino.']),
      li(['No requiere nada nuevo del motor: es la entrada 4.1 con otro pagador y una carta.']),
      h2('4.7 Investigación (a largo plazo)'),
      p(['Con decenas de miles de cuestionarios honestos, Cupido tendrá el retrato más fino que existe de cómo quieren amar los mexicanos. Eso vale para universidades, gobiernos y medios: ', b('"El estado del amor en México"'), ', un informe anual con datos agregados y anónimos. Nunca datos personales; nunca lo sensible por debajo de grupos grandes.']),
      li(['Ingreso modesto, prestigio enorme. Es lo que convierte a Cupido en institución.']),
      h2('4.8 Lo que no haremos'),
      li(['Publicidad de cualquier tipo. Boosts. Super likes. "Quién te vio". Perfiles destacados. Filas prioritarias.']),
      li(['Vender o compartir datos personales. Suscripciones difíciles de cancelar. Cobrar por pausar o por borrar.']),
      li(['Cobrar por decir no. Cobrar por leer la carta. Cobrar por la foto, la voz o el video de la otra persona.']),

      h1('5. La economía del volante'),
      p('Un ejemplo numérico, deliberadamente conservador, para ver si el volante gira. Supuestos: 10,000 personas que terminan el cuestionario en un año; cada año el motor cruza el 90 % con el 25 % de ellas (hoy el demo da 16 de 20, pero el demo está diseñado para lucir; en la realidad el silencio será la norma); de esas coincidencias, la mitad abre puerta.'),
      tabla([3600, 2000, 1900, 1940], [
        ['Fuente', 'Personas', 'Ticket (MXN)', 'Ingreso anual'],
        ['Entrada con seriedad', '10,000', '690', '6.9 M'],
        ['Puertas abiertas', '1,250', '1,490', '1.9 M'],
        ['Mientras esperas (30 % se suscribe, 8 meses)', '3,000', '199 × 8', '4.8 M'],
        ['Acompañamiento (10 % toma 2 sesiones, comisión 20 %)', '1,000', '2 × 1,200 × 20 %', '0.5 M'],
        ['Total', '', '', '≈ 14 M MXN'],
      ]),
      p(''),
      p([b('La reinversión: '), 'si el 50 % del ingreso (7 M) va a atraer personas y el costo de traer a una persona seria ronda los 350 MXN, el año siguiente entran 20,000 personas sin poner un peso de fuera. Más personas, más cruces: el 90 % se vuelve más probable para todos, y la tasa del 25 % sube sola. Ese es el volante: el dinero de los que ya encontraron paga que los siguientes encuentren.']),
      p([it('Lo que el ejemplo no dice: con 100,000 personas el motor cambia de naturaleza. A esa escala, la probabilidad de que exista alguien arriba del 90 % para casi cualquiera es alta, y la suscripción deja de ser "mientras esperas" para ser "mientras eliges".')]),

      h1('6. Veinte años en cuatro etapas'),
      tabla([1900, 3900, 3640], [
        ['Etapa', 'Qué se cobra', 'Qué tiene que ser verdad'],
        ['0 a 2 años', 'Nada o solo la entrada con seriedad. Puerta gratis.', 'Que el motor acierte y la gente lo cuente. Admin protegido, privacidad, verificación.'],
        ['2 a 5 años', 'Entrada + puerta + Mientras esperas + primeros especialistas.', 'Más de 10,000 personas activas; Círculos funcionando; informe anual.'],
        ['5 a 10 años', 'Comunidades propias (licencias); acompañamiento para parejas; otros países de habla hispana.', 'El motor calibrado con datos reales de parejas que duraron.'],
        ['10 a 20 años', 'Cupido como institución: investigación, becas de entrada, programas de preparación para la pareja.', 'Una fundación que sostiene las becas con una fracción fija del ingreso.'],
      ]),
      p(''),
      p(['En la etapa 0 a 2 el error más caro sería cobrar antes de que el motor haya demostrado que acierta. Por eso la secuencia: primero cien parejas reales que digan "funcionó"; después, la entrada; después, la puerta. Cada cobro se enciende cuando la evidencia lo permite, no cuando la caja lo pide.']),

      h1('7. Precios de referencia y su lógica'),
      tabla([3000, 1800, 4640], [
        ['Concepto', 'MXN', 'Anclaje'],
        ['Entrada con seriedad', '490 a 990, una vez', 'Una cena de cita que no funcionó; lo que cobra una app de citas en dos meses sin dar nada'],
        ['Puerta abierta', '990 a 1,990 por persona', 'Lo que alguien gastaría en tres primeras citas con desconocidos; aquí es con alguien al 90 %'],
        ['Mientras esperas', '149 a 249 al mes', 'Menos que una suscripción de series; cancelable en un clic'],
        ['Sesión con especialista', '900 a 1,800', 'Precio de mercado; Cupido no lo infla, solo lo acerca'],
        ['Licencia comunidad', '30,000 a 300,000 al año', 'Lo que una institución gasta en un evento de integración'],
        ['Regalo', 'Igual que la entrada', 'Más una carta de quien regala'],
      ]),
      p(''),
      p([it('Los rangos son para decidir, no para publicar. Mi recomendación de arranque: entrada 690, puerta 1,490 con la primera gratis, Mientras esperas 199.')]),

      h1('8. Riesgos y cómo se cuidan'),
      li([b('Que cobrar la puerta inhiba el sí. '), 'Mitigación: la primera puerta gratis; el cobro solo con doble sí; devolución si el otro dijo no. Medir la tasa de sí antes y después.']),
      li([b('Que la suscripción se vuelva ruido. '), 'Mitigación: nada de notificaciones para "engancharte"; solo lo que la persona pidió. Si no entra en un mes, se le pregunta si quiere pausar, no se le cobra en silencio.']),
      li([b('Datos sensibles y ley. '), 'Consentimiento expreso, cifrado en reposo, derecho a borrar. Validar con abogado antes del primer cobro: cobrar vuelve la relación formal.']),
      li([b('Perfiles falsos con dinero de por medio. '), 'La verificación de identidad va dentro de la entrada; sin ella no se abre ninguna puerta.']),
      li([b('La tentación de los boosts. '), 'Un día alguien propondrá "cobrar por subir en la lista". La respuesta está en los principios, por escrito, para que no dependa del humor de nadie.']),

      h1('9. Decisiones que son tuyas'),
      num('¿Cobramos la entrada desde el inicio o esperamos a las primeras cien parejas reales?'),
      num('¿La puerta cuesta desde la primera, o la primera es gratis?'),
      num('¿Qué fracción fija del ingreso se reinvierte en atracción, y la hacemos pública? (Propongo 50 % los primeros cinco años.)'),
      num('¿Becas de entrada: cuántas al mes y con qué criterio?'),
      num('¿Círculos como primera función de Mientras esperas, o salas por tema?'),
      num('¿Cupido es de Capital Torreón, o nace con entidad propia desde el día uno (pensando en la fundación de la etapa 4)?'),

      h1('10. Cierre'),
      p(['Monetizar Cupido no es ponerle precio al amor; es ponerle precio a la seriedad, al acompañamiento y al tiempo bien usado, y devolver cada peso a la puerta de entrada para que el siguiente encuentre a alguien. Si lo hacemos así, el negocio y el propósito empujan en la misma dirección: a todos les conviene que a Cupido Algorítmico le vaya muy bien.']),
      cita('Tú pon la verdad. Nosotros ponemos la lógica. El amor lo ponen ustedes dos. Y el dinero, cuando llegue, pone la siguiente puerta.'),
      new Paragraph({ spacing: { before: 400 }, children: [new TextRun({ text: 'Atentamente,', font: S, size: 22, color: TINTA })] }),
      new Paragraph({ children: [new TextRun({ text: 'Ing. Ricardo López Reyero', font: F, size: 24, bold: true, color: TINTA })] }),
      new Paragraph({ children: [new TextRun({ text: 'cupido.capitaltorreon.com', font: S, size: 20, color: GRIS })] }),
    ],
  }],
});
Packer.toBuffer(doc).then((buf) => { const f = 'Cupido_Algoritmico_Monetizacion_v1_2026-10-04_1215.docx'; fs.writeFileSync(f, buf); console.log('ok', f, buf.length); });
