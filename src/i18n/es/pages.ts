/** Spanish for pages (see src/i18n/index.ts). English string → Spanish; {slots} stay as they are. */
export const pages: Record<string, string> = {
  // ── shared
  "← The Second Number": "← El Segundo Número",
  "Play now": "Jugar ya",
  "Learn to play": "Aprende a jugar",
  "Delete": "Borrar",
  "Delete {name}": "Borrar {name}",
  "Saved on this device": "Guardado en este dispositivo",

  // ── error
  "Something broke at the table": "Algo se rompió en la mesa",
  "Sorry about that. Take a screenshot of this box and send it along, then try again.": "Perdón por eso. Toma una captura de pantalla de este recuadro y mándala, y luego intenta otra vez.",
  "Try again": "Intentar otra vez",
  "Home": "Inicio",

  // ── home
  "read the machine · wake the block · don't become it": "lee a la máquina · despierta a la cuadra · no te conviertas en ella",
  "A cooperative game about the hidden cost in every deal: the payday loan, the rent-to-own couch, the “free” first month. Learn to read the second number, teach your whole block to read it, and drag the one machine behind them all into the light. Set on the West Side of Dayton, Ohio.":
    "Un juego cooperativo sobre el costo escondido en cada trato: el préstamo de día de pago, el sofá en renta con opción a compra, el primer mes “gratis”. Aprende a leer el segundo número, enséñale a toda tu cuadra a leerlo y saca a la luz la máquina que está detrás de todos. En el West Side de Dayton, Ohio.",
  "📱 Join a game": "📱 Únete a un juego",
  "How to play": "Cómo se juega",
  "🔍 Read your own deal": "🔍 Lee tu propio trato",
  "🍎 Teacher's view": "🍎 Vista del maestro",
  "🏘 Your City editions": "🏘 Ediciones de tu ciudad",
  "1–5 players": "1 a 5 jugadores",
  "On one device, passed around the table: the cookout, the classroom, the kitchen table. Or alone, the night you finish the book.": "En un solo dispositivo que pasa de mano en mano: en la parrillada, en el salón de clases, en la mesa de la cocina. O solo, la noche que terminas el libro.",
  "25 to 60 minutes": "De 25 a 60 minutos",
  "Start with the Block Party (25 minutes), then the full game: co-op, Overlord, or Chapter 3 of the campaign.": "Empieza con el Block Party (25 minutos) y luego el juego completo: cooperativo, modo Amo o el Capítulo 3 de la campaña.",
  "Real traps": "Trampas reales",
  "Every deal card is a real, documented trap, with honest deals mixed in.": "Cada carta de trato es una trampa real y documentada, con tratos honestos mezclados.",

  // ── play / learn
  "Set the table": "Pon la mesa",
  "Setting the table…": "Poniendo la mesa…",

  // ── endless deals
  "Every deal here is rolled fresh from a template, so the numbers are new every time and nobody can learn them by heart. Read the pitch, work out the second number, then put the glasses on and check. Turn the same templates on in a game with <b>Endless deals</b> in the house rules.":
    "Cada trato aquí sale nuevo de una plantilla, así que los números cambian cada vez y nadie se los puede aprender de memoria. Lee la oferta, saca el segundo número y luego ponte los lentes y comprueba. Activa las mismas plantillas en un juego con <b>Tratos sin fin</b> en las reglas de la casa.",
  "Your Read": "Tu Lectura",
  "Another deal": "Otro trato",
  "{n} dealt": "{n} repartidos",
  "Have a real one? <a>Read your own deal</a>.": "¿Tienes uno de verdad? <a>Lee tu propio trato</a>.",
  "This deal": "Este trato",

  // ── read your own deal
  "Read your own deal": "Lee tu propio trato",
  "Got a real offer: a phone plan, a car loan, a rent-to-own receipt? Put in its numbers and read its second number with the same glasses you use in the game.":
    "¿Tienes una oferta real: un plan de teléfono, un préstamo de carro, un recibo de renta con opción a compra? Pon sus números y lee su segundo número con los mismos lentes que usas en el juego.",
  "🔒 Nothing you type leaves this device. There's no account and no upload; saved deals stay in this browser.": "🔒 Nada de lo que escribes sale de este dispositivo. No hay cuenta ni se sube nada; los tratos guardados se quedan en este navegador.",
  "My deal": "Mi trato",
  "What kind of deal?": "¿Qué tipo de trato?",
  "Payments": "Pagos",
  "Rent-to-own, store financing, a car or personal loan, buy now pay later": "Renta con opción a compra, financiamiento de la tienda, préstamo de carro o personal, compra ahora y paga después",
  "A fee to borrow": "Un cargo por prestar",
  "Payday loan, cash advance app, pawn, tax refund advance": "Préstamo de día de pago, app de adelantos de efectivo, empeño, adelanto del reembolso de impuestos",
  "A monthly plan": "Un plan mensual",
  "Phone plan, subscription, insurance: the ad's price vs your bill": "Plan de teléfono, suscripción, seguro: el precio del anuncio contra tu factura",
  "What is it?": "¿Qué es?",
  "Rent-to-own couch at the store on Third": "Sofá en renta con opción a compra en la tienda de la Third",
  "Cash price": "Precio de contado",
  "what it costs if you pay all at once (or how much you're borrowing)": "lo que cuesta si pagas todo de una vez (o cuánto te prestan)",
  "Down payment": "Enganche",
  "paid today (0 if none)": "lo que pagas hoy (0 si no hay)",
  "Each payment": "Cada pago",
  "how much each payment is": "de cuánto es cada pago",
  "How many payments": "Cuántos pagos",
  "the number on the contract": "el número que dice el contrato",
  "One-time fees": "Cargos únicos",
  "sign-up, processing, delivery, 'protection' (0 if none)": "inscripción, trámite, entrega, 'protección' (0 si no hay)",
  "Amount you get": "Cantidad que recibes",
  "the cash in your hand": "el efectivo en tu mano",
  "The fee": "El cargo",
  "what they charge for it": "lo que te cobran por eso",
  "Days until it's due": "Días hasta que vence",
  "usually 14 for a payday loan": "casi siempre 14 en un préstamo de día de pago",
  "Times you might extend it": "Veces que podrías extenderlo",
  "0 if you'll pay it all back on time": "0 si lo vas a pagar todo a tiempo",
  "Advertised monthly price": "Precio mensual anunciado",
  "the big number in the ad": "el número grande del anuncio",
  "What you're really charged a month": "Lo que de verdad te cobran al mes",
  "with taxes, fees, and after any promo ends": "con impuestos, cargos y después de que termine la promoción",
  "Months": "Meses",
  "the contract, or how long you'll keep it": "el contrato, o cuánto tiempo lo vas a tener",
  "activation, setup, early-termination (0 if none)": "activación, instalación, cancelación anticipada (0 si no hay)",
  "How often?": "¿Cada cuánto?",
  "Every week": "Cada semana",
  "Every 2 weeks": "Cada 2 semanas",
  "Every month": "Cada mes",
  "Let me work out the second number first": "Déjame sacar primero el segundo número",
  "Read it": "Léelo",
  "second number": "segundo número",
  "{rate} a year": "{rate} al año",
  "over 999%": "más de 999%",
  "Practice on <deals>endless deals</deals>, or <play>play the game</play>. This page does the arithmetic on the numbers you give it; it isn't financial advice. Check them against the paper.":
    "Practica con los <deals>tratos sin fin</deals>, o <play>juega el juego</play>. Esta página hace las cuentas con los números que le das; no es asesoría financiera. Compáralos con el papel.",
  "The second number: {total} in all ({math}). That's {extra} more than {looks}.": "El segundo número: {total} en total ({math}). Son {extra} más que {looks}.",
  " That's about {rate} a year.": " Es como {rate} al año.",
  "the cash price": "el precio de contado",
  "the amount you get": "la cantidad que recibes",
  "the advertised price": "el precio anunciado",
  "The clock: what happens if you miss one payment? Is there a grace period, a late fee, or do they take it back? Is there a big last payment? Can you pay it off early with no penalty?":
    "El reloj: ¿qué pasa si te falta un pago? ¿Hay periodo de gracia, un cargo por atraso, o te lo quitan? ¿Hay un último pago grande? ¿Puedes liquidarlo antes sin penalidad?",
  "The clock: when is it due, and what if you can't pay all of it? Rolling it over means paying the whole fee again, every time.":
    "El reloj: ¿cuándo vence y qué pasa si no puedes pagarlo todo? Renovarlo significa pagar el cargo completo otra vez, cada vez.",
  "The clock: when does the promo price end? Is there a contract, and what does it cost to leave early?": "El reloj: ¿cuándo termina el precio de promoción? ¿Hay contrato, y cuánto cuesta salirte antes?",
  "Who's behind it: who owns this debt after you sign? Store 'financing' is often a separate lender, and contracts get sold. A credit union loan may cost far less.":
    "Quién está detrás: ¿de quién es esta deuda después de que firmas? El 'financiamiento' de la tienda muchas veces es otro prestamista, y los contratos se venden. Un préstamo de una cooperativa de crédito (credit union) puede costar mucho menos.",
  "Who's behind it: is the lender licensed in your state? Some rent an out-of-state bank to get around the cap. A credit union small loan, or your job's pay advance, may cost far less.":
    "Quién está detrás: ¿el prestamista tiene licencia en tu estado? Algunos usan un banco de otro estado para saltarse el límite. Un préstamo pequeño de una cooperativa de crédito, o el adelanto de sueldo de tu trabajo, puede costar mucho menos.",
  "Who's behind it: some 'taxes and fees' are real taxes; some are the company's own charges with an official-sounding name. Ask which is which.":
    "Quién está detrás: algunos 'impuestos y cargos' son impuestos de verdad; otros son cobros de la propia compañía con un nombre que suena oficial. Pregunta cuál es cuál.",
  "The second number": "El segundo número",
  "About {rate} a year. That's over {cap}%, the cap the law puts on loans to service members. This is priced like a trap.":
    "Como {rate} al año. Eso es más del {cap}%, el límite que la ley pone a los préstamos a militares. Esto tiene precio de trampa.",
  "You'd pay {pct}% more than it looks like it costs.": "Pagarías {pct}% más de lo que parece que cuesta.",
  "There's a second number. Make sure it's worth it to you.": "Hay un segundo número. Asegúrate de que te valga la pena.",
  "No hidden cost in these numbers. Read the rest of the paper anyway.": "No hay costo escondido en estos números. Lee el resto del papel de todos modos.",
  "YOUR DEAL": "TU TRATO",
  "Save it on this device": "Guárdalo en este dispositivo",

  // ── how to play
  "Start with the Block Party": "Empieza con el Block Party",
  "Three districts (Lending, Housing, Education), {rounds} rounds, about 25 minutes, no roles and no hidden Owner. Wake {wake} of the 3 to win; lose 2 to the Machine, or run out of rounds, and you lose.":
    "Tres distritos (Préstamos, Vivienda, Educación), {rounds} rondas, unos 25 minutos, sin roles y sin Dueño oculto. Despierta {wake} de los 3 para ganar; si la Máquina captura 2, o se acaban las rondas, pierden.",
  "Taking a trap costs {take} Shady chips; at {out} you sit out a turn. The Machine strikes the district closest to waking: +1 Squeeze and −1 Clarity.":
    "Aceptar una trampa cuesta {take} fichas de Turbio; con {out} pierdes un turno. La Máquina golpea el distrito más cerca de despertar: +1 Presión y −1 Claridad.",
  "Then climb the ladder: the Full Block (all five districts, roles, the Owner, the Commons), then the Cookout, Sou-Sou and Green Book, then the house rules, then Overlord.":
    "Luego sube la escalera: la Cuadra Completa (los cinco distritos, roles, el Dueño, los Comunes), luego el Cookout, el Sou-Sou y el Libro Verde, luego las reglas de la casa y al final el modo Amo.",
  "The words": "Las palabras",
  "Read: how deep you can read a district's deals (0–3). Trust: what you spend. Shady: what shortcuts put on you. Squeeze: the Machine's grip (3 captures). Clarity: how awake a district is (3 wakes it). Props: what you earn for lifting people.":
    "Lectura: qué tan hondo puedes leer los tratos de un distrito (0–3). Confianza: lo que gastas. Turbio: lo que los atajos te dejan encima. Presión: el agarre de la Máquina (con 3 captura). Claridad: qué tan despierto está un distrito (con 3 despierta). Respeto: lo que ganas por levantar a la gente.",
  "Every Machine move is a strike (+1 Squeeze), a muddy (−1 Clarity) or a tempt (−1 Trust), whoever makes it.":
    "Cada jugada de la Máquina es un golpe (+1 Presión), enturbiar (−1 Claridad) o tentar (−1 Confianza), la haga quien la haga.",
  "The full game: the goal": "El juego completo: la meta",
  "Wake districts by reading their deals. When total Clarity reaches {n}, the Underworld cracks open and the hidden Owner is revealed.":
    "Despierta distritos leyendo sus tratos. Cuando la Claridad total llega a {n}, el Inframundo se abre y se revela el Dueño oculto.",
  "Trace {n} blue threads (Read 3 in an awake district), then Expose the Owner to win.": "Rastrea {n} hilos azules (Lectura 3 en un distrito despierto) y luego Expón al Dueño para ganar.",
  "You lose if 2 districts are captured, everyone Falls, or round {n} ends.": "Pierden si capturan 2 distritos, si todos Caen o si termina la ronda {n}.",
  "Reading a deal": "Leer un trato",
  "Every deal has a pitch you can see, and three hidden layers: red (the cost, Read 1), amber (the clock, Read 2) and blue (the connection, Read 3).":
    "Cada trato tiene una oferta que puedes ver y tres capas escondidas: rojo (el costo, Lectura 1), ámbar (el reloj, Lectura 2) y azul (la conexión, Lectura 3).",
  "Drag Grandma's red reading glasses over the card to read the layers your Read unlocks. Locked layers stay locked.":
    "Arrastra los lentes rojos de lectura de la abuela sobre la carta para leer las capas que tu Lectura desbloquea. Las capas bloqueadas siguen bloqueadas.",
  "Seeing isn't beating: the red layer tells you trap or honest and shows the lever. To NEGOTIATE a trap down, your Read must reach its lever.":
    "Ver no es vencer: la capa roja te dice si es trampa u honesto y te muestra la palanca. Para NEGOCIAR una trampa, tu Lectura tiene que llegar a su palanca.",
  "Honest deal: TAKE it for +2 Trust and +1 Clarity. WALKing away from real help costs Trust.": "Trato honesto: ACEPTARLO da +2 Confianza y +1 Claridad. IRTE de la ayuda de verdad cuesta Confianza.",
  "Trap: TAKE is the shortcut (fixes the district now, but +{shady} Shady; at {fall} you Fall). WALK is safe. NEGOTIATE costs Trust and defuses it if your Read reaches the lever, or you get played.":
    "Trampa: ACEPTAR es el atajo (arregla el distrito ahora, pero +{shady} Turbio; con {fall} Caes). IRTE es seguro. NEGOCIAR cuesta Confianza y la desactiva si tu Lectura llega a la palanca; si no, te jugaron.",
  "Study (+1 Read), Face a deal, Teach a teammate (call and response: read the second number aloud and have them say it back), gather at the Commons, Reach a Fallen friend, and later Trace and Expose.":
    "Estudiar (+1 Lectura), Enfrentar un trato, Enseñar a un compañero (llamada y respuesta: lee el segundo número en voz alta y que te lo repita), Reunirse en los Comunes, Alcanzar a un amigo caído, y más adelante Rastrear y Exponer.",
  "The Commons are West Side places: {places}": "Los Comunes son lugares del West Side: {places}",
  "Together": "Juntos",
  "The Sou-Sou: at the end of turns, everyone with Trust puts 1 in the can. At {n}, the next player's hand clears 2 Squeeze with no Shady.":
    "El Sou-Sou (la tanda): al final de los turnos, todos los que tienen Confianza ponen 1 en la lata. Al llegar a {n}, la mano del siguiente jugador quita 2 de Presión sin Turbio.",
  "The Cookout: once per game, skip a round's actions so everyone catches up to the best reader at the table.":
    "El Cookout (la parrillada del barrio): una vez por juego, sáltense las acciones de una ronda para que todos alcancen al mejor lector de la mesa.",
  "The Green Book: once per game, a strike that would capture a district lands nowhere.": "El Libro Verde: una vez por juego, un golpe que capturaría un distrito no cae en ninguna parte.",
  "After the block's turns the Machine strikes the districts closest to waking, at most once per district per round, then muddies your best unfinished work. Machine Patterns (like Redlining) tighten on their own.":
    "Después de los turnos de la cuadra, la Máquina golpea los distritos más cerca de despertar, máximo una vez por distrito por ronda, y luego enturbia su mejor trabajo sin terminar. Los Patrones de la Máquina (como REDLINING, las líneas rojas) aprietan solos.",
  "A hidden Owner bends the rules from round 1. Watch the board and work out who it is.": "Un Dueño oculto tuerce las reglas desde la ronda 1. Miren el tablero y descubran quién es.",
  "How many strikes a round depends on how many of you there are: it is printed on the round track (and shown on the board here).":
    "Cuántos golpes hay por ronda depende de cuántos son ustedes: viene impreso en el marcador de rondas (y aquí se muestra en el tablero).",
  "Fine-print dice: roll a d6 when a trap is drawn to set its lever (1–3 red, 4–5 amber, 6 blue), so nobody can learn the deck by heart.":
    "Dados de la letra chica: tira un d6 cuando salga una trampa para fijar su palanca (1–3 rojo, 4–5 ámbar, 6 azul), así nadie se aprende el mazo de memoria.",
  "The Terrell rule: teaching gives Read, not cover. Confront a trap in a district you were taught before the block has your back (any Commons, or the Veteran's lesson) and it backfires: +1 Squeeze.":
    "La regla de Terrell: enseñar da Lectura, no protección. Si enfrentas una trampa en un distrito que te enseñaron antes de que la cuadra te respalde (cualquier Común, o la lección del Veterano), te sale al revés: +1 Presión.",
  "Endless deals: deals are rolled from templates with new numbers every time. With the math variant, you work out the second number before the red layer opens. Try them on the Endless deals page.":
    "Tratos sin fin: los tratos salen de plantillas con números nuevos cada vez. Con la variante de cuentas, sacas el segundo número antes de que se abra la capa roja. Pruébalos en la página de Tratos sin fin.",
  "Rather learn by playing? <a>Learn to play</a> starts a guided game: the Coach glows on the move it would make, says why, and explains each rule the first time it comes up.":
    "¿Prefieres aprender jugando? <a>Aprende a jugar</a> empieza un juego guiado: el Coach ilumina la jugada que haría, te dice por qué y explica cada regla la primera vez que aparece.",

  // ── teacher's view
  "Teacher's view": "Vista del maestro",
  "Overlord": "Amo",
  "Every game your class sends in, added up: which traps fooled them, how their reading grew, and what the deals would have cost in real money. At the end of a game each table opens <b>Send this game to your teacher</b> and copies its result code to you. Paste the codes here.":
    "Todos los juegos que manda tu clase, sumados: qué trampas los engañaron, cómo creció su lectura y cuánto habrían costado los tratos en dinero real. Al final de un juego, cada mesa abre <b>Envíale este juego a tu maestro</b> y te copia su código de resultado. Pega los códigos aquí.",
  "🔒 No accounts and no upload. Codes hold only the first names students typed and how the game went, and they stay in this browser.":
    "🔒 Sin cuentas y sin subir nada. Los códigos solo llevan los primeros nombres que escribieron los estudiantes y cómo fue el juego, y se quedan en este navegador.",
  "📄 The teacher's guide: goals, a 50-minute plan and questions for after": "📄 La guía del maestro: metas, un plan de 50 minutos y preguntas para después",
  "Paste result codes (one or many)": "Pega códigos de resultado (uno o muchos)",
  "Add to the class": "Agregar a la clase",
  "Include games played on this device ({n})": "Incluir juegos jugados en este dispositivo ({n})",
  "1 game added": "1 juego agregado",
  "{n} games added": "{n} juegos agregados",
  ", {n} already here": ", {n} ya estaban",
  ", 1 line wasn't a result code": ", 1 línea no era un código de resultado",
  ", {n} lines weren't result codes": ", {n} líneas no eran códigos de resultado",
  "No games yet. Play one (a <a>Block Party</a> fits a class period), or paste the codes your tables send.":
    "Todavía no hay juegos. Jueguen uno (un <a>Block Party</a> cabe en una clase), o pega los códigos que mandan tus mesas.",
  "Across 1 game, the class signed <r>{taken}</r> of traps": "En 1 juego, la clase firmó <r>{taken}</r> en trampas",
  "Across {n} games, the class signed <r>{taken}</r> of traps": "En {n} juegos, la clase firmó <r>{taken}</r> en trampas",
  " and walked away from <a>{refused}</a> of real help": " y se fue de <a>{refused}</a> en ayuda de verdad",
  ". They stayed out of <g>{out}</g>.": ". Se libraron de <g>{out}</g>.",
  "Games": "Juegos",
  "Block wins": "La cuadra gana",
  "{a} of {b}": "{a} de {b}",
  "Average Read at the end": "Lectura promedio al final",
  "0 = can't read · 3 = reads blue": "0 = no puede leer · 3 = lee el azul",
  "Got played or conned": "Les jugaron o los estafaron",
  "The deals that fooled the class most": "Los tratos que más engañaron a la clase",
  "Times a table signed it as a shortcut, got played or conned by it, or walked away from it when it was honest.":
    "Veces que una mesa lo firmó como atajo, le jugaron o la estafaron con él, o se fue cuando era honesto.",
  "Nothing fooled anyone yet.": "Todavía nada ha engañado a nadie.",
  "signed as a shortcut": "firmado como atajo",
  "got played": "te jugaron",
  "conned (a counterfeit)": "estafa (una falsificación)",
  "walked away from real help": "se fue de la ayuda de verdad",
  "Talk it through: “{front}”": "Platíquenlo: “{front}”",
  "What it really was (Read 3, the blue layer):": "Lo que era de verdad (Lectura 3, la capa azul):",
  "Why it was honest:": "Por qué era honesto:",
  "Real money:": "Dinero real:",
  "Ask: it read exactly like honest help. Who checks who's really behind a deal before you sign?": "Pregunta: se leía igualito que ayuda honesta. ¿Quién revisa quién está de verdad detrás de un trato antes de firmar?",
  "Ask: what would you have to know to see this one coming? Who in your life could you ask?": "Pregunta: ¿qué tendrías que saber para verla venir? ¿A quién en tu vida le podrías preguntar?",
  "Ask: this one was honest, and the table walked away. What made real help look like a trap?": "Pregunta: este era honesto, y la mesa se fue. ¿Qué hizo que la ayuda de verdad pareciera trampa?",
  "Sign-now clocks": "Relojes de “firma ya”",
  "Of 1 decision on a deal with a fake deadline, <b>{rushed}</b> were made with the clock still running and <b>{waited}</b> waited it out.":
    "De 1 decisión en un trato con fecha límite falsa, <b>{rushed}</b> se tomaron con el reloj corriendo y <b>{waited}</b> esperaron a que pasara.",
  "Of {n} decisions on a deal with a fake deadline, <b>{rushed}</b> were made with the clock still running and <b>{waited}</b> waited it out.":
    "De {n} decisiones en tratos con fecha límite falsa, <b>{rushed}</b> se tomaron con el reloj corriendo y <b>{waited}</b> esperaron a que pasara.",
  "{pct}% rushed": "{pct}% con prisa",
  "Red: decided under the clock. Green: waited it out.": "Rojo: decidieron con el reloj encima. Verde: esperaron a que pasara.",
  "Every game": "Todos los juegos",
  "Download a spreadsheet (CSV)": "Descargar una hoja de cálculo (CSV)",
  "Date": "Fecha",
  "Table": "Mesa",
  "Mode": "Modo",
  "Result": "Resultado",
  "Rounds": "Rondas",
  "Avg Read": "Lectura prom.",
  "Signed": "Firmado",
  "Clock: rushed / waited": "Reloj: con prisa / esperaron",
  "✦ won": "✦ ganó",
  "lost": "perdió",
  "Remove the game from {date}": "Quitar el juego del {date}",
  "remove": "quitar",
  "this device": "este dispositivo",
  "Dollar figures are typical real-world amounts for one household, from each card (see the rulebook's answer key). Games played on this device can be hidden with the checkbox above.":
    "Las cifras en dólares son cantidades típicas de la vida real para un hogar, de cada carta (ver la clave de respuestas del reglamento). Los juegos jugados en este dispositivo se pueden ocultar con la casilla de arriba.",

  // ── teacher's guide (two printed pages: keep it tight)
  "Print the guide": "Imprimir la guía",
  "← Teacher's view": "← Vista del maestro",
  "Download the PDF": "Descargar el PDF",
  "Teacher's guide · one class period": "Guía del maestro · una clase",
  "A cooperative game about the hidden cost in every deal: the payday loan, the rent-to-own couch, the “free” first month. Students work as one block against the Machine, read the fine print together, and learn to spot the second number before they sign.":
    "Un juego cooperativo sobre el costo escondido en cada trato: el préstamo de día de pago, el sofá en renta con opción a compra, el primer mes “gratis”. Los estudiantes juegan como una cuadra contra la Máquina, leen juntos la letra chica y aprenden a ver el segundo número antes de firmar.",
  "<b>Ages</b> 12+ · <b>Players</b> 2–5 per table · <b>Time</b> one 50-minute period · <b>Needs</b> one device per table (laptop, tablet or Chromebook), or the free print-and-play kit · <b>Cost</b> free, no accounts":
    "<b>Edad</b> 12+ · <b>Jugadores</b> 2–5 por mesa · <b>Tiempo</b> una clase de 50 minutos · <b>Equipo</b> un dispositivo por mesa (laptop, tableta o Chromebook) o el kit gratis para imprimir · <b>Costo</b> gratis, sin cuentas",
  "Learning goals": "Metas de aprendizaje",
  "By the end of the period, students can:": "Al final de la clase, los estudiantes pueden:",
  "<b>Find the total cost</b> of an offer from its fee and its term, and turn a flat fee into a yearly rate (APR).":
    "<b>Sacar el costo total</b> de una oferta con su cargo y su plazo, y convertir un cargo fijo en tasa anual (APR).",
  "<b>Name the three places a trap hides:</b> the cost (red), the terms and the clock (amber), and who profits behind it (blue).":
    "<b>Nombrar dónde se esconde una trampa:</b> el costo (rojo), los términos y el reloj (ámbar), y quién gana detrás (azul).",
  "<b>Spot pressure:</b> a deadline that is fake (“Approved!”, “Move in today”) is part of the sale, not a reason to sign.":
    "<b>Ver la presión:</b> una fecha límite falsa (“¡Aprobado!”, “Múdate hoy”) es parte de la venta, no razón para firmar.",
  "<b>Tell a trap from real help,</b> and name the honest options: a credit-union loan, free tax prep (VITA), federal student aid, a community college with guaranteed transfer.":
    "<b>Distinguir trampa de ayuda de verdad,</b> y nombrar opciones honestas: préstamo de cooperativa de crédito, impuestos gratis (VITA), becas federales, colegio comunitario con transferencia garantizada.",
  "<b>Explain why it takes a community:</b> the block only wins when everyone can read, not one strong reader.":
    "<b>Explicar por qué hace falta una comunidad:</b> la cuadra solo gana cuando todos leen, no con un solo lector.",
  "Fits the <i>Managing Credit</i> and <i>Spending</i> areas of the National Standards for Personal Financial Education, and works in math (rates, percents, totals), economics, and civics.":
    "Cubre <i>Managing Credit</i> y <i>Spending</i> de los National Standards for Personal Financial Education; sirve en matemáticas (tasas, porcentajes, totales), economía y civismo.",
  "Before class (10 minutes, once)": "Antes de la clase (10 minutos, una vez)",
  "Open the site on a school device and play a few turns of <b>Learn to play</b>. It runs in the browser; nothing to install.":
    "Abre el sitio en la escuela y juega unos turnos de <b>Aprende a jugar</b>; corre en el navegador, sin instalar nada.",
  "Groups of 3 are best (2–5 work). One device per group, passed around the table. <i>Play on everyone's phones</i> is optional; some school networks block it, and one device always works.":
    "Lo mejor: grupos de 3 (de 2 a 5 funciona). Un dispositivo por grupo, de mano en mano. <i>Jugar en los teléfonos de todos</i> es opcional; algunas redes escolares lo bloquean, y un dispositivo siempre funciona.",
  "No devices? Print the <a>print-and-play kit</a> (the cards, board and rules on paper).": "¿Sin dispositivos? Imprime el <a>kit para imprimir y jugar</a> (cartas, tablero y reglas en papel).",
  "Built for every student: keyboard-only play, screen-reader support, <b>Plain cards</b> for anyone the red lens doesn't work for, color-blind-safe districts, and 🔊 to mute.":
    "Para todos: se juega solo con teclado o con lector de pantalla, <b>Cartas simples</b> para quien no pueda usar el lente rojo, distritos seguros para daltónicos y 🔊 para silenciar.",
  "The 50-minute plan": "El plan de 50 minutos",
  "<b>Warm-up: one deal.</b> Open <b>Endless deals</b> on the projector and read one offer aloud. Ask: <i>“What does this really cost?”</i> Take three guesses, then reveal the second number.":
    "<b>Calentamiento: un trato.</b> Abre <b>Tratos sin fin</b> en el proyector y lee una oferta en voz alta. Pregunta: <i>“¿Cuánto cuesta esto de verdad?”</i> Oye tres respuestas y revela el segundo número.",
  "<b>Set the tables.</b> Each group chooses <b>Learn to play</b>: a 30-second comic, then the Coach explains each rule as it comes up. Groups that aren't three choose <b>Play now → Block Party</b> with <b>Coach me as we play</b> on.":
    "<b>Pongan las mesas.</b> Cada grupo elige <b>Aprende a jugar</b>: un cómic de 30 segundos y luego el Coach explica cada regla cuando aparece. Los grupos de 2, 4 o 5 eligen <b>Jugar ya → Block Party</b> con <b>Que el Coach me guíe mientras jugamos</b>.",
  "<b>Play the Block Party</b> (3 districts: Lending, Housing, Education; {rounds} rounds; about 25 minutes). The block wins by waking {wake} districts before the Machine captures 2. Walk the room. Listen for students reading the cost aloud to each other: that is the lesson working.":
    "<b>Jueguen el Block Party</b> (3 distritos: Préstamos, Vivienda, Educación; {rounds} rondas; unos 25 minutos). La cuadra gana si despierta {wake} distritos antes de que la Máquina capture 2. Recorre el salón. Si los oyes leerse el costo en voz alta, la lección funciona.",
  "<b>The dollar count.</b> Win or lose, the end screen turns the game into real money: what the table signed, what it walked away from, what it stayed out of. Each table opens <b>Send this game to your teacher</b> and copies its result code to you (a chat, a form, or the board).":
    "<b>La cuenta en dólares.</b> Ganen o pierdan, la pantalla final convierte el juego en dinero real: lo que la mesa firmó, de lo que se fue, de lo que se libró. Cada mesa abre <b>Envíale este juego a tu maestro</b> y te copia su código de resultado (chat, formulario o pizarrón).",
  "<b>Debrief.</b> Paste the codes into the <b>Teacher's view</b> on your device. It adds up the class, shows the deals that fooled the most tables, and opens a <i>Talk it through</i> for the top one. Use the questions on the next page.":
    "<b>Repaso.</b> Pega los códigos en la <b>Vista del maestro</b>. Suma a la clase, muestra los tratos que engañaron a más mesas y abre un <i>Platíquenlo</i> para el primero. Usa las preguntas de la página 2.",
  "<b>Exit ticket / homework:</b> bring one real offer from home (a phone plan, a store card, a rent-to-own receipt) and work out its second number on the <b>Read your own deal</b> page. Nothing typed there leaves the device.":
    "<b>Boleto de salida / tarea:</b> trae una oferta real de casa (plan de teléfono, tarjeta de tienda, recibo de renta con opción a compra) y saca su segundo número en <b>Lee tu propio trato</b>. Lo que se escribe ahí no sale del dispositivo.",
  "How the game teaches it": "Cómo lo enseña el juego",
  "Every deal has a front,": "Cada trato tiene un frente,",
  "the pitch everyone sees, and three hidden layers. Students unlock them by building <b>Read</b>, and drag Grandma's red reading glasses over the card to see them.":
    "la oferta que todos ven, y tres capas escondidas. Se desbloquean subiendo la <b>Lectura</b>, y se ven arrastrando los lentes rojos de lectura de la abuela sobre la carta.",
  "Red: the cost.": "Rojo: el costo.",
  "“Quick Cash: $375 today, one flat fee of $56.25.” Under the glasses: that fee is a 391% APR.": "“Efectivo Rápido: $375 hoy, un solo cargo fijo de $56.25.” Bajo los lentes: ese cargo es un APR (tasa anual) de 391%.",
  "Amber: the clock.": "Ámbar: el reloj.",
  "Due in full in 14 days; can't pay, and you roll it over and owe the fee again. Sign-now deals run a countdown on screen. <b>The deadline is always fake</b>: when it runs out, nothing happens.":
    "Se paga completo en 14 días; si no puedes, lo renuevas y debes el cargo otra vez. Los tratos de “firma ya” tienen cuenta regresiva en pantalla. <b>La fecha límite siempre es falsa</b>: cuando se acaba, no pasa nada.",
  "Blue: the connection.": "Azul: la conexión.",
  "The storefront and the debt buyer that hounds you later share one owner. Every trap is part of one Machine.": "La tienda y el comprador de deudas que luego te persigue tienen el mismo dueño. Cada trampa es parte de una sola Máquina.",
  "The shortcut.": "El atajo.",
  "Signing a trap fixes a problem now and leaves a mark on you (<b>Shady</b>). Students feel why people sign: it works, for a while.":
    "Firmar una trampa arregla un problema ahora y te deja una marca (<b>Turbio</b>). Los estudiantes sienten por qué la gente firma: funciona, por un rato.",
  "Teaching.": "Enseñar.",
  "A player can teach another to read a district (call and response: read the second number aloud, have them say it back). The block can't win on one reader.":
    "Un jugador puede enseñarle a otro a leer un distrito (llamada y respuesta: lee el segundo número en voz alta y que te lo repita). Con un solo lector, la cuadra no gana.",
  "Questions for after the game": "Preguntas para después del juego",
  "<b>What would you have to know to see this coming?</b> Pick the deal that fooled your table. What one fact would have changed your move?":
    "<b>¿Qué tendrías que saber para verlo venir?</b> Escoge el trato que engañó a tu mesa. ¿Qué dato habría cambiado tu jugada?",
  "<b>Which layer got you:</b> the cost, the clock, or who was behind it? Which is hardest to see in real life, and why?":
    "<b>¿Qué capa te atrapó:</b> el costo, el reloj o quién estaba detrás? ¿Cuál es la más difícil de ver en la vida real, y por qué?",
  "<b>The countdown was always fake.</b> Where have you seen a fake deadline outside the game? What does a seller gain by rushing you?":
    "<b>La cuenta regresiva siempre fue falsa.</b> ¿Dónde has visto una fecha límite falsa fuera del juego? ¿Qué gana un vendedor con apurarte?",
  "<b>Why would someone sign a trap they know is a trap?</b> (In the game, shortcuts worked for a while.) What would they need instead? No wrong answers: this is about choices under pressure, not blame.":
    "<b>¿Por qué alguien firmaría una trampa sabiendo que lo es?</b> (En el juego, los atajos funcionaron un rato.) ¿Qué necesitaría en su lugar? No hay respuestas malas: se trata de decidir bajo presión, no de culpar.",
  "<b>Which honest deal surprised you?</b> Where could someone in our town find a credit union, free tax prep, or a sliding-scale clinic?":
    "<b>¿Qué trato honesto te sorprendió?</b> ¿Dónde encontraría alguien en nuestra ciudad una cooperativa de crédito, impuestos gratis o una clínica con cuota según ingresos?",
  "<b>Your block only won by teaching.</b> Who taught you to read a bill or a contract? Who could you teach this week?":
    "<b>Tu cuadra solo ganó enseñando.</b> ¿Quién te enseñó a leer una factura o un contrato? ¿A quién podrías enseñarle esta semana?",
  "<b>The Machine.</b> The blue layers showed traps sharing owners. Is that true in our town? How could you find out?":
    "<b>La Máquina.</b> Las capas azules mostraron trampas con los mismos dueños. ¿Pasa eso en nuestra ciudad? ¿Cómo podrías averiguarlo?",
  "Quick math (answer key)": "Cuentas rápidas (clave de respuestas)",
  "<b>Payday loan.</b> $56.25 on $375 for 14 days = 15% every two weeks. 15% × about 26 two-week periods = <b>391% a year</b>. The typical borrower pays that fee 8 times: 8 × $56.25 = <b>$450 in fees</b> on a $375 loan.":
    "<b>Préstamo de día de pago.</b> $56.25 sobre $375 por 14 días = 15% cada dos semanas. 15% × unos 26 periodos de dos semanas = <b>391% al año</b>. El prestatario típico paga esa tarifa 8 veces: 8 × $56.25 = <b>$450 en cargos</b> por $375.",
  "<b>Rent-to-own.</b> $20 a week × 78 weeks = <b>$1,560</b> for a couch that retails around $500, about 3× the price.":
    "<b>Renta con opción a compra.</b> $20 a la semana × 78 semanas = <b>$1,560</b> por un sofá que en tienda cuesta unos $500, como 3× el precio.",
  "<b>Overdraft.</b> A $4 coffee plus a ~$35 fee = <b>$39</b>: an extra 875%, from one swipe.": "<b>Sobregiro.</b> Un café de $4 más un cargo de ~$35 = <b>$39</b>: un 875% extra, por una sola pasada de tarjeta.",
  "For more, turn on <b>House rules → Endless deals → Work it out</b>: students calculate every second number before the red layer opens.":
    "Para más, activa <b>Reglas de la casa → Tratos sin fin → Haz la cuenta</b>: los estudiantes calculan cada segundo número antes de que se abra la capa roja.",
  "Going further": "Para ir más lejos",
  "<b>A week of it:</b> one day per district (Lending, Housing, Education), each opening with three Endless deals and closing with question 1.":
    "<b>Una semana:</b> un día por distrito (Préstamos, Vivienda, Educación), cada uno empieza con tres Tratos sin fin y cierra con la pregunta 1.",
  "<b>Your City edition:</b> put your own neighborhoods, gathering places and real local help on the board, in the browser, with no code.":
    "<b>Edición de tu ciudad:</b> pon tus barrios, lugares de reunión y ayuda local de verdad en el tablero, desde el navegador, sin programar.",
  "<b>The novel:</b> <i>The Second Number</i> (Book One) is built on the same rules. Assign its opening chapters the same week; the lens on the table and the Sight on the page explain each other.":
    "<b>La novela:</b> <i>The Second Number</i> (Libro Uno) usa las mismas reglas. Asigna sus primeros capítulos esa semana; el lente en la mesa y la Vista en la página se explican mutuamente.",
  "<b>Privacy:</b> no accounts and nothing uploaded. Result codes hold only the first names students type and how the game went, and the Teacher's view keeps them in your browser.":
    "<b>Privacidad:</b> sin cuentas y sin subir nada. Los códigos solo llevan los primeros nombres que escriben los estudiantes y cómo fue el juego; la Vista del maestro los guarda en tu navegador.",

  // ── art sheet
  "Art sheet": "Hoja de arte",
  "The drawn placeholders for the five districts and the five roles. Commissioned art replaces them; see the brief in <code>game/ART_BRIEF.md</code>.":
    "Los dibujos provisionales de los cinco distritos y los cinco roles. El arte encargado los reemplaza; mira el encargo en <code>game/ART_BRIEF.md</code>.",
  "Districts": "Distritos",
  "Roles, as church fans": "Los roles, como abanicos de iglesia",

  // ── Your City editions
  "Saved “{name}” on this device.": "Se guardó “{name}” en este dispositivo.",
  "untitled": "sin nombre",
  "That isn't an edition code or file.": "Eso no es un código ni un archivo de edición.",
  "Added “{name}”.": "Se agregó “{name}”.",
  "The traps are the same everywhere. The place isn't. Make the game about your own side of town: what the five districts are called where you live, where people gather, the true history your elders tell, and where to get real help. Same rules, same balance.":
    "Las trampas son iguales en todas partes. El lugar no. Haz el juego sobre tu lado de la ciudad: cómo se llaman los cinco distritos donde vives, dónde se reúne la gente, la historia verdadera que cuentan tus mayores y dónde conseguir ayuda de verdad. Las mismas reglas, el mismo equilibrio.",
  "Read <b>game/YOUR_CITY.md</b> first: how to research it, check every history card, and make it with your community, not just about it.":
    "Lee primero <b>game/YOUR_CITY.md</b> (en inglés): cómo investigar, comprobar cada carta de historia y hacerla con tu comunidad, no solo sobre ella.",
  "The reference edition, as the game ships.": "La edición de referencia, tal como viene el juego.",
  "Play": "Jugar",
  "Start from it": "Empezar desde esta",
  "1 thing to finish before it can be played": "Falta 1 cosa antes de poder jugarla",
  "{n} things to finish before it can be played": "Faltan {n} cosas antes de poder jugarla",
  "Ready to play and share": "Lista para jugar y compartir",
  "Edit": "Editar",
  "Delete “{name}” from this device?": "¿Borrar “{name}” de este dispositivo?",
  "Start a new edition": "Empezar una edición nueva",
  "Add an edition someone shared": "Agregar una edición que alguien compartió",
  "Edition code": "Código de edición",
  "Add it": "Agregarla",
  "Or open a .json file": "O abre un archivo .json",
  "Untitled edition": "Edición sin nombre",
  "← Your editions": "← Tus ediciones",
  "A new edition": "Una edición nueva",
  "The edition": "La edición",
  "Its name": "Su nombre",
  "“East Side Detroit Edition”": "“Edición East Side Detroit”",
  "The city": "La ciudad",
  "“Detroit, Michigan”": "“Detroit, Michigan”",
  "What the board is called in play": "Cómo se llama el tablero en el juego",
  "“the East Side” (used as: every deal on the East Side…)": "“el East Side” (se usa así: cada trato en el East Side…)",
  "Made by": "Hecha por",
  "your group, school or neighborhood": "tu grupo, escuela o barrio",
  "The five districts": "Los cinco distritos",
  "The deals in each district stay the same; this is where they happen in your city.": "Los tratos de cada distrito no cambian; esto es dónde pasan en tu ciudad.",
  "Where people borrow and bank: payday lenders, check cashers, title loans, the bank branch that closed.":
    "Donde la gente pide prestado y hace sus trámites de banco: prestamistas de día de pago, casas de cambio de cheques, préstamos sobre título, la sucursal que cerró.",
  "Where people live: the neighborhoods, the landlords, the houses sold on contract, the blocks that were redlined.":
    "Donde vive la gente: los barrios, los caseros, las casas vendidas por contrato, las cuadras marcadas con redlining.",
  "Where people work, or used to: the plant that closed, the warehouses, the staffing agencies.": "Donde la gente trabaja, o trabajaba: la planta que cerró, los almacenes, las agencias de empleo temporal.",
  "Where people get care, or can't: the hospital that left, the clinics, the bills.": "Donde la gente recibe atención médica, o no puede: el hospital que se fue, las clínicas, las facturas.",
  "Where people learn: the high school everyone knows, the community college, the for-profit school on the highway.":
    "Donde la gente aprende: la prepa que todos conocen, el colegio comunitario, la escuela con fines de lucro en la carretera.",
  "West Dayton:": "West Dayton:",
  "Nickname": "Apodo",
  "shows under the district's name": "sale debajo del nombre del distrito",
  "What it's like there": "Cómo es ahí",
  "one or two true sentences": "una o dos oraciones verdaderas",
  "Who made the pictures": "Quién hizo las imágenes",
  "an artist, a class, a photographer: they said yes to their work being used here": "un artista, una clase, un fotógrafo: dieron permiso para usar su trabajo aquí",
  "Pictures travel in the downloaded <b>.json</b> file (and in saved games), not in the share code, which stays short enough to paste. Use art you made or have permission to use, and ask before showing anyone's face. Never draw the Machine as people from the neighborhood.":
    "Las imágenes viajan en el archivo <b>.json</b> descargado (y en los juegos guardados), no en el código para compartir, que sigue siendo corto para poder pegarlo. Usa arte que hiciste o que tienes permiso de usar, y pide permiso antes de mostrar la cara de alguien. Nunca dibujes a la Máquina como gente del barrio.",
  "Where the block gathers": "Donde se reúne la cuadra",
  "Five places people really go. What each one does in the game stays the same.": "Cinco lugares a donde la gente de verdad va. Lo que hace cada uno en el juego no cambia.",
  "in the game:": "en el juego:",
  "Your place": "Tu lugar",
  "Where it is": "Dónde queda",
  "Why people go": "Por qué va la gente",
  "Local history": "Historia local",
  "True stories of how your community fought back. The Elder tells them in play. Every card needs a source: a book, an archive, a museum, or an elder by name.":
    "Historias verdaderas de cómo tu comunidad se defendió. La Anciana las cuenta en el juego. Cada carta necesita una fuente: un libro, un archivo, un museo o un mayor con nombre.",
  "Use only our cards in districts where we wrote some (otherwise yours join the base game's)": "Usar solo nuestras cartas en los distritos donde escribimos algunas (si no, las tuyas se suman a las del juego base)",
  "Any district": "Cualquier distrito",
  "+ Add a story": "+ Agregar una historia",
  "Title": "Título",
  "Year": "Año",
  "Place": "Lugar",
  "The story (read aloud)": "La historia (se lee en voz alta)",
  "The lesson, in one line": "La lección, en una línea",
  "Source (where you checked it)": "Fuente (dónde lo comprobaste)",
  "Remove this story": "Quitar esta historia",
  "Local deals": "Tratos locales",
  "Deals from your own city or state, shuffled in with the base deck. Each one needs a source: the law, ordinance, policy or public record it comes from. Write the fine print the way it really reads.":
    "Tratos de tu propia ciudad o estado, mezclados con el mazo base. Cada uno necesita una fuente: la ley, ordenanza, política o registro público de donde viene. Escribe la letra chica tal como se lee de verdad.",
  "+ Add a deal": "+ Agregar un trato",
  "Ideas: {ideas}.": "Ideas: {ideas}.",
  "your state's rules for payday and title loans, a local rent-to-own store's contract, a check casher's posted fees":
    "las reglas de tu estado para préstamos de día de pago y sobre título, el contrato de una tienda local de renta con opción a compra, los cargos que anuncia una casa de cambio de cheques",
  "your city's rental rules (deposits, notice, inspections), a local lease's fee addendum, a land-contract sale on the county record":
    "las reglas de renta de tu ciudad (depósitos, avisos, inspecciones), el anexo de cargos de un contrato de renta local, una venta por contrato de tierra en el registro del condado",
  "your state's minimum wage or wage-theft law, a local staffing agency's terms": "el salario mínimo de tu estado o su ley contra el robo de salarios, los términos de una agencia local de empleo temporal",
  "your local hospital's charity-care policy, a medical-credit card offered at a local clinic": "la política de atención caritativa de tu hospital local, una tarjeta de crédito médico que ofrecen en una clínica local",
  "a local for-profit school's published costs, your state's grant program and its deadline": "los costos publicados de una escuela local con fines de lucro, el programa de becas de tu estado y su fecha límite",
  "What it says (the pitch everyone sees)": "Lo que dice (la oferta que todos ven)",
  "🔴 The cost (Read 1)": "🔴 El costo (Lectura 1)",
  "🟠 The clock (Read 2)": "🟠 El reloj (Lectura 2)",
  "🔵 The connection (Read 3)": "🔵 La conexión (Lectura 3)",
  "It's an honest deal (real help)": "Es un trato honesto (ayuda de verdad)",
  "Which layer beats it": "Qué capa la vence",
  "Red: the cost is the weak point": "Rojo: el costo es el punto débil",
  "Amber: the deadline or your rights window": "Ámbar: la fecha límite o el plazo de tus derechos",
  "Blue: name who's behind it": "Azul: nombrar quién está detrás",
  "Real money ($)": "Dinero real ($)",
  "what signing it typically costs one household": "lo que firmarlo le cuesta normalmente a un hogar",
  "what the real help is worth": "lo que vale la ayuda de verdad",
  "Why that much": "Por qué esa cantidad",
  "one line, like the answer key's": "una línea, como en la clave de respuestas",
  "Source": "Fuente",
  "the law or ordinance by name and number, the policy, or the public record": "la ley u ordenanza por nombre y número, la política o el registro público",
  "Remove this deal": "Quitar este trato",
  "Real help near you": "Ayuda de verdad cerca de ti",
  "Shown at the end of every game in this edition, and on Read your own deal. Only list places you've confirmed are open and do what you say.":
    "Se muestra al final de cada juego en esta edición, y en Lee tu propio trato. Pon solo lugares que confirmaste que están abiertos y hacen lo que dices.",
  "Name": "Nombre",
  "What it helps with": "En qué ayuda",
  "free tax prep": "preparación de impuestos gratis",
  "Where / how to reach it": "Dónde está / cómo contactarlo",
  "Remove": "Quitar",
  "+ Add a place": "+ Agregar un lugar",
  "Preview": "Vista previa",
  "The Commons on {area}: {places}": "Los Comunes en {area}: {places}",
  "1 thing to finish before it can be played or shared": "Falta 1 cosa antes de poder jugarla o compartirla",
  "{n} things to finish before it can be played or shared": "Faltan {n} cosas antes de poder jugarla o compartirla",
  "Ready to play and share.": "Lista para jugar y compartir.",
  "Save on this device": "Guardar en este dispositivo",
  "Save and play": "Guardar y jugar",
  "Code copied ✓": "Código copiado ✓",
  "Copy a share code": "Copiar un código para compartir",
  "Download as a file": "Descargar como archivo",
  "Making it small…": "Haciéndola pequeña…",
  "Change the picture": "Cambiar la imagen",
  "Add a picture": "Agregar una imagen",
  "A picture of {d}": "Una imagen de {d}",
  "That picture didn't work.": "Esa imagen no funcionó.",
  "That file isn't a picture.": "Ese archivo no es una imagen.",
  "This browser can't resize pictures.": "Este navegador no puede cambiar el tamaño de las imágenes.",
  "That picture is too detailed to fit. Try a simpler one.": "Esa imagen tiene demasiado detalle para caber. Prueba una más sencilla.",
  "That picture couldn't be opened.": "No se pudo abrir esa imagen.",
  "Use West Dayton's drawing": "Usar el dibujo de West Dayton",
  // the edition check's problems, piece by piece (tProblem in app/edition/page.tsx)
  "ANY": "CUALQUIERA",
  "{d}: its nickname": "{d}: su apodo",
  "{d}: its description": "{d}: su descripción",
  "{place} (your version): its name": "{place} (tu versión): su nombre",
  "{place}: where it is": "{place}: dónde queda",
  "History {d} #{n}": "Historia {d} n.º {n}",
  "Local deal {d} #{n}": "Trato local {d} n.º {n}",
  "Resource #{n}": "Recurso n.º {n}",
  "title": "título",
  "story": "historia",
  "lesson": "lección",
  "name": "nombre",
  "what it helps with": "en qué ayuda",
  "what it says": "lo que dice",
  "the cost (red)": "el costo (rojo)",
  "the clock (amber)": "el reloj (ámbar)",
  "the connection (blue)": "la conexión (azul)",
  "{label} is empty.": "{label}: está vacío.",
  "{label} is too long ({n} of {max} characters).": "{label}: es demasiado largo ({n} de {max} caracteres).",
  "say where you checked it (source). History cards have to be true.": "di dónde lo comprobaste (fuente). Las cartas de Historia tienen que ser verdad.",
  "name the law, ordinance or record it comes from (source).": "nombra la ley, ordenanza o registro de donde viene (fuente).",
  "pick which layer beats it (red, amber or blue).": "escoge qué capa la vence (rojo, ámbar o azul).",
  "Pictures: say who made them (and that they said yes to them being used here).": "Imágenes: di quién las hizo (y que dieron permiso para usarlas aquí).",
  "📄 The easy guide to print: the rules in plain words, with examples and a cheat sheet (PDF)": "📄 La guía fácil para imprimir: las reglas en palabras sencillas, con ejemplos y una hoja de repaso (PDF, en inglés)",
"📖 Read the novel": "📖 Lee la novela",
  "The Second Number, Book One: Marcus Ellison's story, the world this game comes from.": "The Second Number, Libro Uno: la historia de Marcus Ellison, el mundo de donde viene este juego.",
  "🛡 The Third Option": "🛡 The Third Option (La Tercera Opción)",
  "The real-life version: how to recognize, document and prove what's happening at your job. A Civic Armor guide.": "La versión de la vida real: cómo reconocer, documentar y probar lo que pasa en tu trabajo. Una guía de Civic Armor (en inglés).",
  "Where this goes next": "A dónde lleva esto",
  "You read the machine at the table. Now read it in your own life.": "Leíste la máquina en la mesa. Ahora léela en tu propia vida.",
  "✉ Stay in the loop": "✉ Mantente al tanto",
  "New chapters, the boxed game, and the Civic Armor course. A few emails a year.": "Capítulos nuevos, el juego en caja y el curso de Civic Armor. Unos pocos correos al año.",
  "A Civic Armor game": "Un juego de Civic Armor",
};
