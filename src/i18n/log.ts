/**
 * The game's log in Spanish. The engine writes English (it must match the Python engine line for line);
 * tLog() turns one line into the current language for the screen, the event feed and screen readers.
 *
 * Every shape the engine emits (src/engine/engine.ts, `this.emit(...)`) has a rule below: a RegExp over the
 * line without its leading indent, and a function that builds the Spanish. The indent, emoji, symbols and
 * numbers are kept. A line no rule knows comes back unchanged, in English.
 */
import { C, type District } from "../engine/content";
import { log as LOG_ES } from "./es/log";
import { getLang, t, tDistrict } from "./index";

type Rule = [RegExp, (m: RegExpMatchArray) => string];

const D = "(LENDING|HOUSING|LABOR|HEALTH|EDUCATION)";
const N = "(.+?)"; // a player's name (or "The Owner" in Overlord)
const NUM = "(\\d+)";

/** a district key as the board shows it */
const dd = (d: string) => tDistrict(d as District);
/** "LENDING, HOUSING" */
const dds = (s: string) => s.split(", ").map(dd).join(", ");
/** a player's name: names stay, "The Owner" (the Overlord's seat) is translated */
const nm = (n: string) => (n === "The Owner" ? t("The Owner") : n);
const nms = (s: string) => s.split(", ").map(nm).join(", ");
const LEVER: Record<string, string> = { red: "rojo", amber: "ámbar", blue: "azul" };
/** "in red" = "en rojo" */
const lever = (l: string) => LEVER[l] ?? l;
/** "the red lever / layer" = "la palanca / capa roja" */
const leverF = (l: string) => (l === "red" ? "roja" : lever(l));
const COVER = " The block has their back now: covered.";
const cover = (c: string | undefined) => (c ? " " + t(COVER.trim()) : "");
/** a run of stat changes: "Trust +2, Shady −1, Props +1, Read in LABOR 0→1" */
const stats = (s: string) =>
  s
    .replace(new RegExp(`Read in ${D}`, "g"), (_, d: string) => `Lectura en ${dd(d)}`)
    .replace(new RegExp(`${D} clarity`, "g"), (_, d: string) => `Claridad en ${dd(d)}`)
    .replace(/\bTrust\b/g, "Confianza")
    .replace(/\bShady\b/g, "Turbio")
    .replace(/\bProps\b/g, "Respeto")
    .replace(/\bSqueeze\b/g, "Presión")
    .replace(/\bClarity\b/g, "Claridad")
    .replace(/\bRead\b/g, "Lectura");

// content the log quotes: History stories, Owner texts, chapter faces
const HISTORY = Object.values(C.history).flat();
const STORIES = new Set(HISTORY.map((h) => h.story));
const FACE_TEXTS = new Set(Object.values(C.chapters).map((c) => c.face_text).filter(Boolean));

/** endless deals: their fronts are filled templates, so they are matched against the template and refilled in Spanish */
const DEAL_TEMPLATES: { re: RegExp; slots: string[]; front: string }[] = Object.values(C.dealTemplates)
  .flat()
  .map((tp) => {
    const slots: string[] = [];
    const src = tp.front
      .split(/(\{\w+\})/)
      .map((part) => {
        const k = /^\{(\w+)\}$/.exec(part);
        if (!k) return part.replace(/[.*+?^${}()|[\]\\]/g, "\\$&");
        slots.push(k[1]);
        return "(.+?)";
      })
      .join("");
    return { re: new RegExp(`^${src}$`), slots, front: tp.front };
  });
/** the endless-deal template a filled front came from, or -1 (tests use it) */
export function dealTemplateFor(front: string): number {
  return DEAL_TEMPLATES.findIndex((tp) => tp.re.test(front));
}
/** a deal's front in the current language, printed card or filled endless-deal template */
export function tFront(front: string): string {
  if (t(front) !== front) return t(front);
  for (const tp of DEAL_TEMPLATES) {
    const m = tp.re.exec(front);
    if (!m) continue;
    const es = t(tp.front);
    if (es === tp.front) return front; // the template has no Spanish yet
    const v: Record<string, string> = {};
    tp.slots.forEach((k, i) => (v[k] ??= m[i + 1]));
    return es.replace(/\{(\w+)\}/g, (all, k: string) => {
      const x = v[k];
      if (x === undefined) return all;
      return /^[\d,.]+$/.test(x) ? x : t(x);
    });
  }
  return front;
}

const CHOICE: Record<string, string> = { TAKE: "ACEPTAR", WALK: "IRTE", NEGOTIATE: "NEGOCIAR" };

/** the rules, in order; the first that matches the line (without its indent) wins */
export const LOG_RULES: Rule[] = [
  // ---- fixed lines (src/i18n/es/log.ts) ----
  [/^.*$/, (m) => (m[0] in LOG_ES ? LOG_ES[m[0]] : "\u0000")],

  // ---- campaign, chapters ----
  [
    /^🏘 The family's board: (.+)\.$/,
    (m) =>
      "🏘 El tablero de la familia: " +
      m[1]
        .split("; ")
        .map((p) => p.replace(new RegExp(`^${D}`), (d) => dd(d)).replace(/ Rebuilt ×/g, " Reconstruido ×").replace(/ Scarred ×/g, " Con cicatriz ×"))
        .join("; ") +
      ".",
  ],
  [new RegExp(`^✦ The family is settled: ${D} opens\\.$`), (m) => `✦ La familia ya se instaló: se abre ${dd(m[1])}.`],
  [
    /^🏘 The block remembers: (.+)\.$/,
    (m) =>
      "🏘 La cuadra se acuerda: " +
      m[1]
        .split("; ")
        .map((p) => {
          let x: RegExpExecArray | null;
          if ((x = /^(.+) starts? stronger \(Clarity \+1\)$/.exec(p))) return `${dds(x[1])} ${x[1].includes(",") ? "empiezan" : "empieza"} más fuerte${x[1].includes(",") ? "s" : ""} (Claridad +1)`;
          if ((x = /^(.+) carr(?:ies|y) a scar \(Squeeze \+1\)$/.exec(p))) return `${dds(x[1])} ${x[1].includes(",") ? "cargan" : "carga"} una cicatriz (Presión +1)`;
          return t(p);
        })
        .join("; ") +
      ".",
  ],

  // ---- the Crown, the Desk, the March ----
  [new RegExp(`^👑 ${N} wears the Crown\\. Everyone else pays for it: (.+) lose 1 Trust\\.$`), (m) => `👑 ${nm(m[1])} lleva la Corona. Todos los demás lo pagan: ${nms(m[2])} pierden 1 de Confianza.`],
  [new RegExp(`^${N} draws a county paycheck at the Desk\\. Trust \\+1\\.$`), (m) => `${nm(m[1])} cobra un cheque del condado en el Escritorio. Confianza +1.`],
  [
    new RegExp(`^🪑 ${N} takes the Desk: a county job\\. \\+1 Trust every round, but no facing deals and no teaching while you sit there\\.$`),
    (m) => `🪑 ${nm(m[1])} toma el Escritorio: un trabajo del condado. +1 de Confianza cada ronda, pero no puedes enfrentar tratos ni enseñar mientras estés ahí.`,
  ],
  [new RegExp(`^${N} isn't at the Desk\\.$`), (m) => `${nm(m[1])} no está en el Escritorio.`],
  [new RegExp(`^${N} quits the Desk, for good\\. Props \\+1\\.$`), (m) => `${nm(m[1])} deja el Escritorio, para siempre. Respeto +1.`],
  [new RegExp(`^👑 The Owner offers ${N} the Crown: a way up, out of the life\\.$`), (m) => `👑 El Dueño le ofrece la Corona a ${nm(m[1])}: una forma de subir, de salir de esa vida.`],
  [new RegExp(`^${N} puts it on\\. They can't Fall now, and the whole block pays for it every round\\.$`), (m) => `${nm(m[1])} se la pone. Ya no puede Caer, y toda la cuadra lo paga cada ronda.`],
  [
    new RegExp(`^${N} refuses the Crown\\. Props \\+2\\. The Owner takes it out on the block: one extra move this round\\.$`),
    (m) => `${nm(m[1])} rechaza la Corona. Respeto +2. El Dueño se desquita con la cuadra: un movimiento extra esta ronda.`,
  ],
  [new RegExp(`^✊🏾 ${N} calls the March\\. The whole family walks together\\. Props \\+2\\.$`), (m) => `✊🏾 ${nm(m[1])} convoca la Marcha. Toda la familia camina unida. Respeto +2.`],
  [new RegExp(`^👑 ${N} has ${NUM} Shady, and the Crown keeps them standing\\.$`), (m) => `👑 ${nm(m[1])} tiene ${m[2]} de Turbio, y la Corona lo mantiene en pie.`],

  // ---- the League ----
  [new RegExp(`^${N} has already signed\\.$`), (m) => `${nm(m[1])} ya firmó.`],
  [
    new RegExp(`^${N} signs the League pledge: we withhold together\\. Signatures ${NUM}/${NUM}\\. Props \\+1\\.$`),
    (m) => `${nm(m[1])} firma el compromiso de la Liga: retenemos juntos. Firmas ${m[2]}/${m[3]}. Respeto +1.`,
  ],
  [
    /^✦ THE LEAGUE FORMS\. Housing Squeeze (\d+)→(\d+)\. The families read their contracts together: every Housing and Lending trap can now be negotiated with Read 1\.$/,
    (m) =>
      `✦ SE FORMA LA LIGA. Presión en Vivienda ${m[1]}→${m[2]}. Las familias leen sus contratos juntas: ahora toda trampa de Vivienda y Préstamos se puede negociar con Lectura 1.`,
  ],
  [new RegExp(`^✦ The League withholds together: Squeeze in ${D} −1 \\((\\d+)/(\\d+)\\)\\.$`), (m) => `✦ La Liga retiene unida: Presión en ${dd(m[1])} −1 (${m[2]}/${m[3]}).`],
  [
    /^⚑ The sellers scare families off: the pledges fall apart \((\d+)\/(\d+) signed\)\. Everyone has to sign in the same round\.$/,
    (m) => `⚑ Los vendedores asustan a las familias: los compromisos se deshacen (${m[1]}/${m[2]} firmados). Todos tienen que firmar en la misma ronda.`,
  ],

  // ---- Study ----
  [new RegExp(`^${N} already reads ${D} fully\\.$`), (m) => `${nm(m[1])} ya lee ${dd(m[2])} por completo.`],
  [
    new RegExp(`^${N} studies ${D}( \\(practiced at Adventure Central\\))?\\. Read now (\\d+)/(\\d+)\\. Props \\+1\\.$`),
    (m) => `${nm(m[1])} estudia ${dd(m[2])}${m[3] ? " " + t(m[3].trim()) : ""}. Lectura ahora ${m[4]}/${m[5]}. Respeto +1.`,
  ],

  // ---- Face a deal ----
  [new RegExp(`^${N} is at the Desk and can't face deals\\. Quit the Desk first \\(an action\\)\\.$`), (m) => `${nm(m[1])} está en el Escritorio y no puede enfrentar tratos. Primero deja el Escritorio (una acción).`],
  [new RegExp(`^${N} faces a deal in ${D}: "(.*)"  → (TAKE|WALK|NEGOTIATE)$`), (m) => `${nm(m[1])} enfrenta un trato en ${dd(m[2])}: "${tFront(m[3])}"  → ${CHOICE[m[4]]}`],
  [new RegExp(`^Render\\? ${N} lets ${N} read it for them \\(Read (\\d+)\\)\\. Face left: (\\d+)\\.$`), (m) => `¿Render? ${nm(m[1])} deja que ${nm(m[2])} se lo lea (Lectura ${m[3]}). Fichas de Cara que quedan: ${m[4]}.`],
  [/^\(The fine print: rolled (\d+), so the lever sits in (\S+)\.\)$/, (m) => `(La letra chica: salió ${m[1]}, así que la palanca está en ${lever(m[2])}.)`],
  [
    new RegExp(`^It was a COUNTERFEIT: it only looked honest\\. Squeeze \\+1 in ${D} \\((\\d+)/(\\d+)\\)(?:, Trust −(\\d+))?\\.$`),
    (m) => `Era una FALSIFICACIÓN: solo parecía honesta. Presión +1 en ${dd(m[1])} (${m[2]}/${m[3]})${m[4] ? `, Confianza −${m[4]}` : ""}.`,
  ],
  [new RegExp(`^✖ ${D} CAPTURED\\.$`), (m) => `✖ ${dd(m[1])} CAPTURADO.`],
  [new RegExp(`^It was an HONEST deal — real help\\. Trust \\+2, ${D} clarity \\+1, Props \\+1\\.$`), (m) => `Era un trato HONESTO — ayuda de verdad. Confianza +2, Claridad en ${dd(m[1])} +1, Respeto +1.`],
  [
    new RegExp(`^TAKE the trap to patch ${D} NOW: Squeeze −(\\d+)… Shady \\+(\\d+) on you\\. \\(Props \\+0\\)$`),
    (m) => `ACEPTAR la trampa para parchar ${dd(m[1])} YA: Presión −${m[2]}… Turbio +${m[3]} para ti. (Respeto +0)`,
  ],
  [
    new RegExp(`^TAKE the trap for fast power: ${D} clarity \\+(\\d+)… Shady \\+(\\d+) on you\\. \\(Props \\+0\\)$`),
    (m) => `ACEPTAR la trampa por poder rápido: Claridad en ${dd(m[1])} +${m[2]}… Turbio +${m[3]} para ti. (Respeto +0)`,
  ],
  [new RegExp(`^${N} hasn't the Trust to negotiate with — the deal walks\\.$`), (m) => `${nm(m[1])} no tiene la Confianza para negociar — el trato se va.`],
  [
    new RegExp(`^NEGOTIATE on the (\\S+) lever \\(Read (\\d+)\\): defused\\. Squeeze −(\\d+), ${D} clarity \\+1, Props \\+2\\.$`),
    (m) => `NEGOCIAR en la palanca ${leverF(m[1])} (Lectura ${m[2]}): desactivada. Presión −${m[3]}, Claridad en ${dd(m[4])} +1, Respeto +2.`,
  ],
  [
    /^NEGOTIATE one layer short of the (\S+) lever \(Read (\d+)\): rolled (\d+), you talked them down\. Squeeze −1, Props \+1\.$/,
    (m) => `NEGOCIAR a una capa de la palanca ${leverF(m[1])} (Lectura ${m[2]}): salió ${m[3]}, los convenciste de bajarle. Presión −1, Respeto +1.`,
  ],
  [/^A close read \(Read (\d+), the lever's (\S+)\): rolled (\d+), not enough\.$/, (m) => `Una lectura cercana (Lectura ${m[1]}, la palanca está en ${lever(m[2])}): salió ${m[3]}, no alcanza.`],
  [
    /^NEGOTIATE without the (\S+) layer \(Read (\d+)\): you got played\. Squeeze \+1, Trust −(\d+)\.$/,
    (m) => `NEGOCIAR sin la capa ${leverF(m[1])} (Lectura ${m[2]}): te jugaron. Presión +1, Confianza −${m[3]}.`,
  ],
  [/^NEGOTIATE on an honest deal: you haggled away real help\. Trust −(\d+)\.$/, (m) => `NEGOCIAR un trato honesto: regateaste hasta perder ayuda de verdad. Confianza −${m[1]}.`],
  [
    new RegExp(`^⚠ It backfires: ${N} read it but nobody had their back\\. Squeeze \\+1 in ${D} \\((\\d+)/(\\d+)\\)\\.$`),
    (m) => `⚠ Le sale al revés: ${nm(m[1])} lo leyó pero nadie le cubría la espalda. Presión +1 en ${dd(m[2])} (${m[3]}/${m[4]}).`,
  ],
  [new RegExp(`^⚠ ${N} has (\\d+) Shady chips: hand them back and sit out your next turn\\.$`), (m) => `⚠ ${nm(m[1])} tiene ${m[2]} fichas de Turbio: las devuelve y pierde su próximo turno.`],
  [new RegExp(`^⚠⚠ ${N} HAS FALLEN\\. The Machine now moves through them\\.$`), (m) => `⚠⚠ ${nm(m[1])} HA CAÍDO. Ahora la Máquina se mueve a través de esa persona.`],

  // ---- Teach ----
  [new RegExp(`^${N} is at the Desk: no time to teach\\. Quit the Desk first \\(an action\\)\\.$`), (m) => `${nm(m[1])} está en el Escritorio: no hay tiempo para enseñar. Primero deja el Escritorio (una acción).`],
  [new RegExp(`^${N} can't teach ${N} ${D} — you can only teach what you read better\\.$`), (m) => `${nm(m[1])} no le puede enseñar ${dd(m[3])} a ${nm(m[2])} — solo puedes enseñar lo que lees mejor.`],
  [new RegExp(`^${N} lacks Trust to teach\\.$`), (m) => `A ${nm(m[1])} le falta Confianza para enseñar.`],
  // solo: the neighbors who aren't at the table
  [
    new RegExp(`^${N} teaches a neighbor to read ${D}, and they say the second number back\\. Clarity (\\d+)→(\\d+)\\. Props \\+2\\.$`),
    (m) => `${nm(m[1])} le enseña a un vecino a leer ${dd(m[2])}, y le repite el segundo número. Claridad ${m[3]}→${m[4]}. Respeto +2.`,
  ],
  [new RegExp(`^${N} can't teach ${D} yet: you need Read 1 there\\.$`), (m) => `${nm(m[1])} todavía no puede enseñar ${dd(m[2])}: necesitas Lectura 1 ahí.`],
  [new RegExp(`^There's someone at the table to teach\\.$`), () => `Hay alguien en la mesa a quien enseñarle.`],
  [
    new RegExp(`^${N} teaches ${N} to read ${D}\\. Read (\\d+)→(\\d+)( \\(free\\))?\\. Props \\+2\\.$`),
    (m) => `${nm(m[1])} le enseña a ${nm(m[2])} a leer ${dd(m[3])}. Lectura ${m[4]}→${m[5]}${m[6] ? " (gratis)" : ""}. Respeto +2.`,
  ],
  [new RegExp(`^The Veteran teaches the cover with it: ${N} is covered in ${D}\\.$`), (m) => `El Veterano también enseña a cubrirse: ${nm(m[1])} queda cubierto en ${dd(m[2])}.`],
  [new RegExp(`^Civic Armor: the cover comes with the lesson\\. ${N} is covered in ${D}\\.$`), (m) => `Armadura Cívica: la cobertura viene con la lección. ${nm(m[1])} queda cubierto en ${dd(m[2])}.`],
  [
    new RegExp(`^No cover yet: if ${N} confronts a trap in ${D} before the block has their back, it backfires\\.$`),
    (m) => `Todavía sin cobertura: si ${nm(m[1])} enfrenta una trampa en ${dd(m[2])} antes de que la cuadra le cubra la espalda, le sale al revés.`,
  ],
  [new RegExp(`^Call and response: ${N} says the second number back\\. Props \\+1 each\\.$`), (m) => `Llamada y respuesta: ${nm(m[1])} repite el segundo número. Respeto +1 cada uno.`],
  [new RegExp(`^⛓ The Chain: ${N} turns and teaches ${N}, right there, for free\\.$`), (m) => `⛓ La Cadena: ${nm(m[1])} se voltea y le enseña a ${nm(m[2])}, ahí mismo, gratis.`],

  // ---- Gather, the Commons, the Cookout, the March's roll call ----
  [new RegExp(`^${N} gathers with the block\\. Trust \\+2(, Shady −\\d+)?\\.( The block has their back now: covered\\.)?$`), (m) => `${nm(m[1])} se reúne con la cuadra. Confianza +2${stats(m[2] ?? "")}.${cover(m[3])}`],
  [
    new RegExp(`^${N} gathers at (.+) \\((.+)\\)\\. Trust \\+2(, Shady −\\d+)?\\.( The block has their back now: covered\\.)?$`),
    (m) => `${nm(m[1])} se reúne en ${t(m[2])} (${t(m[3])}). Confianza +2${stats(m[4] ?? "")}.${cover(m[5])}`,
  ],
  [
    new RegExp(`^${N}: (Trust \\+2(?:, Shady −1)?(?:, Props \\+1)?(?:, Read in ${D} \\d+→\\d+)?)\\.( The block has their back now: covered\\.)?$`),
    (m) => `${nm(m[1])}: ${stats(m[2])}.${cover(m[4])}`,
  ],

  // ---- the Sou-Sou ----
  [/^The block throws a hand in the Sou-Sou: (\d+) Trust in\. Pot (\d+)\/(\d+)\.$/, (m) => `La cuadra echa una mano al Sou-Sou: ${m[1]} de Confianza adentro. Bote ${m[2]}/${m[3]}.`],
  [
    new RegExp(`^It's ${N}'s hand\\. The debt in ${D} gets paid off clean: Squeeze (\\d+)→(\\d+), no Shady\\. Props \\+1\\.$`),
    (m) => `Le toca la mano a ${nm(m[1])}. La deuda en ${dd(m[2])} se paga limpia: Presión ${m[3]}→${m[4]}, sin Turbio. Respeto +1.`,
  ],

  // ---- Reach ----
  [new RegExp(`^${N} needs 2 Trust to reach someone\\.$`), (m) => `${nm(m[1])} necesita 2 de Confianza para alcanzar a alguien.`],
  [new RegExp(`^${N} reaches ${N} and pulls them home\\. Props \\+3\\.$`), (m) => `${nm(m[1])} alcanza a ${nm(m[2])} y lo trae de vuelta a casa. Respeto +3.`],

  // ---- the History ----
  [new RegExp(`^${N} teaches the History of ${D}: (.+) \\(([^()]+), (.+)\\)\\.$`), (m) => `${nm(m[1])} enseña la Historia de ${dd(m[2])}: ${t(m[3])} (${t(m[4])}, ${t(m[5])}).`],
  [new RegExp(`^"(.*)"  ${D} AWAKE\\. Props \\+2\\.$`), (m) => `"${t(m[1])}"  ${dd(m[2])} DESPIERTO. Respeto +2.`],
  [/^.+$/, (m) => (STORIES.has(m[0]) ? t(m[0]) : "\u0000")],

  // ---- the Underworld ----
  [
    new RegExp(`^${N} can't trace ${D} \\(needs the Underworld open, Read 3, and ${D} awake\\)\\.$`),
    (m) => `${nm(m[1])} no puede rastrear ${dd(m[2])} (necesita el Inframundo abierto, Lectura 3, y ${dd(m[3])} despierto).`,
  ],
  [
    new RegExp(`^${N} traces the blue thread under ${D} down into the Underworld\\. Threads (\\d+)/(\\d+)\\. Props \\+2\\.$`),
    (m) => `${nm(m[1])} rastrea el hilo azul bajo ${dd(m[2])} hasta el Inframundo. Hilos ${m[3]}/${m[4]}. Respeto +2.`,
  ],
  [/^Not enough threads traced to expose the Owner \((\d+)\/(\d+)\)\.$/, (m) => `No hay suficientes hilos rastreados para exponer al Dueño (${m[1]}/${m[2]}).`],
  [
    new RegExp(`^${N} drags the UNDERWORLD into the light\\. One Owner — (.+)\\. It was always one machine\\.$`),
    (m) => `${nm(m[1])} saca el INFRAMUNDO a la luz. Un solo Dueño — ${t(m[2])}. Siempre fue una sola máquina.`,
  ],
  [/^⚑ THE UNDERWORLD CRACKS OPEN\. Trace (\d+) threads and expose the Overlord\.$/, (m) => `⚑ EL INFRAMUNDO SE ABRE. Rastrea ${m[1]} hilos y expón al Amo.`],
  [
    /^⚑ THE UNDERWORLD CRACKS OPEN\. The Owner is (.+)$/,
    (m) => {
      const text = m[1];
      if (FACE_TEXTS.has(text)) return `⚑ EL INFRAMUNDO SE ABRE. El Dueño es ${t(text)}`;
      const [owner, ...rest] = text.split(" — ");
      const desc = rest.join(" — ");
      return `⚑ EL INFRAMUNDO SE ABRE. El Dueño es ${t(owner)}${rest.length ? " — " + t(desc) : ""}`;
    },
  ],
  [
    /^Trace (\d+) threads \(Read 3 in a woken district\) and expose it before it buries you\.$/,
    (m) => `Rastrea ${m[1]} hilos (Lectura 3 en un distrito despierto) y exponlo antes de que te entierre.`,
  ],
  [
    /^✖ (.+) redraws the lines: (.+) loses? 1 Clarity\.$/,
    (m) => `✖ ${t(m[1])} vuelve a trazar las líneas: ${dds(m[2])} ${m[2].includes(",") ? "pierden" : "pierde"} 1 de Claridad.`,
  ],
  [new RegExp(`^✖ (.+) re-captures ${D}\\.$`), (m) => `✖ ${t(m[1])} vuelve a capturar ${dd(m[2])}.`],
  [new RegExp(`^⚑ The Owner covers its tracks in ${D}\\. Clarity −1 \\(no longer awake\\)\\.$`), (m) => `⚑ El Dueño borra sus huellas en ${dd(m[1])}. Claridad −1 (ya no está despierto).`],

  // ---- the Machine, the Fallen, the Overlord ----
  [
    new RegExp(`^📗 The block opens the Green Book: a safe route around ${D}\\. That strike lands nowhere\\.$`),
    (m) => `📗 La cuadra abre el Libro Verde: una ruta segura alrededor de ${dd(m[1])}. Ese golpe no cae en ningún lado.`,
  ],
  [
    new RegExp(`^\\[${N}\\] already moved on ${D} this round — the Machine spreads, it doesn't snipe\\.$`),
    (m) => `[${nm(m[1])}] ya se movió sobre ${dd(m[2])} esta ronda — la Máquina se extiende, no le pega dos veces al mismo lugar.`,
  ],
  [new RegExp(`^\\[${N}\\] strikes ${D} for the Machine\\. Squeeze (\\d+)/(\\d+)\\.$`), (m) => `[${nm(m[1])}] golpea ${dd(m[2])} para la Máquina. Presión ${m[3]}/${m[4]}.`],
  [new RegExp(`^\\[${N}\\] can't muddy ${D} — the block is awake there\\.$`), (m) => `[${nm(m[1])}] no puede enturbiar ${dd(m[2])} — la cuadra está despierta ahí.`],
  [
    new RegExp(`^\\[${N}\\] muddies ${D}: the second number gets buried\\. Clarity −1\\.$`),
    (m) => `[${nm(m[1])}] enturbia ${dd(m[2])}: el segundo número queda enterrado. Claridad −1.`,
  ],
  [new RegExp(`^\\[${N}\\] has already slipped a counterfeit in this round\\.$`), (m) => `[${nm(m[1])}] ya metió una falsificación esta ronda.`],
  [new RegExp(`^\\[${N}\\] has no counterfeits left\\.$`), (m) => `[${nm(m[1])}] ya no tiene falsificaciones.`],
  [new RegExp(`^\\[${N}\\] already has a counterfeit waiting there\\.$`), (m) => `[${nm(m[1])}] ya tiene una falsificación esperando ahí.`],
  [new RegExp(`^\\[${N}\\] slips a counterfeit into a deal pile somewhere on the block\\.$`), (m) => `[${nm(m[1])}] mete una falsificación en algún montón de tratos de la cuadra.`],
  [new RegExp(`^\\[${N}\\] tempts ${N} with a sweeter deal\\. Trust −1\\.$`), (m) => `[${nm(m[1])}] tienta a ${nm(m[2])} con un trato más dulce. Confianza −1.`],
  [
    new RegExp(`^⚑ \\(hidden hand\\) the squeeze creeps onto your strongest work in ${D}\\. (\\d+)/(\\d+)\\.$`),
    (m) => `⚑ (mano oculta) la presión se le mete a tu mejor trabajo en ${dd(m[1])}. ${m[2]}/${m[3]}.`,
  ],
  [new RegExp(`^⚑ \\(hidden hand\\) a recruiter peels ${N} away from ${D}\\. Read −1\\.$`), (m) => `⚑ (mano oculta) un reclutador aparta a ${nm(m[1])} de ${dd(m[2])}. Lectura −1.`],
  [/^⚑ \(hidden hand\) collections calls: (.+) lose 1 Trust\.$/, (m) => `⚑ (mano oculta) llaman los cobradores: ${nms(m[1])} pierden 1 de Confianza.`],
  [new RegExp(`^⛨ ${N} shields ${D}\\. \\((\\d+) left\\)$`), (m) => `⛨ ${nm(m[1])} protege ${dd(m[2])}. (quedan ${m[3]})`],
  [
    new RegExp(`^✖ The Machine strikes ${D}\\. Squeeze (\\d+)/(\\d+)(, Clarity −1)?\\.$`),
    (m) => `✖ La Máquina golpea ${dd(m[1])}. Presión ${m[2]}/${m[3]}${m[4] ? ", Claridad −1" : ""}.`,
  ],
  [
    new RegExp(`^✖ The Desk's paperwork feeds the Machine: an extra strike while ${N} sits there\\.$`),
    (m) => `✖ El papeleo del Escritorio alimenta a la Máquina: un golpe extra mientras ${nm(m[1])} siga ahí.`,
  ],
  [new RegExp(`^✖ The Machine muddies ${D}\\. Clarity −1\\.$`), (m) => `✖ La Máquina enturbia ${dd(m[1])}. Claridad −1.`],

  // ---- Machine Patterns ----
  [
    new RegExp(`^⚠ The map compounds: REDLINING tightens again on ${D}\\. Squeeze (\\d+)/(\\d+)\\.$`),
    (m) => `⚠ El mapa se acumula: ${t("REDLINING")} vuelve a apretar ${dd(m[1])}. Presión ${m[2]}/${m[3]}.`,
  ],
  [new RegExp(`^⚠ (.+) tightens on ${D}\\. Squeeze (\\d+)/(\\d+)\\.$`), (m) => `⚠ ${t(m[1])} aprieta ${dd(m[2])}. Presión ${m[3]}/${m[4]}.`],
  [
    /^⚠⚠ MACHINE PATTERN — (.+?)  \[(.+?)\]: (.+)$/,
    (m) => `⚠⚠ PATRÓN DE LA MÁQUINA — ${t(m[1])}  [${m[2].split(" + ").map(dd).join(" + ")}]: ${t(m[3])}`,
  ],
  [/^✦ PATTERN BROKEN — (.+)\.$/, (m) => `✦ PATRÓN ROTO — ${t(m[1])}.`],

  // ---- the end, turns ----
  [/^✦ (\d+) of (\d+) districts awake\. The block party goes all night: you win\.$/, (m) => `✦ ${m[1]} de ${m[2]} distritos despiertos. La fiesta de la cuadra sigue toda la noche: ganan.`],
  [new RegExp(`^${N} sits this turn out\\.$`), (m) => `${nm(m[1])} no juega este turno.`],
];

/** the index of the rule that translates this line, or -1 when none does (the line then stays English) */
export function logRuleFor(line: string): number {
  const body = line.replace(/^ +/, "");
  for (let i = 0; i < LOG_RULES.length; i++) {
    const m = body.match(LOG_RULES[i][0]);
    if (m && LOG_RULES[i][1](m) !== "\u0000") return i;
  }
  return -1;
}

/** one line of the game's log in the current language */
export function tLog(line: string): string {
  if (getLang() === "en") return line;
  const indent = /^ */.exec(line)![0];
  const body = line.slice(indent.length);
  for (const [re, f] of LOG_RULES) {
    const m = body.match(re);
    if (!m) continue;
    const out = f(m);
    if (out !== "\u0000") return indent + out;
  }
  return line;
}
