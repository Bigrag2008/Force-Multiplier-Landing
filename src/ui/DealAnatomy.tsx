/** A labeled sample deal card: what each part of a real card means, and how to beat a trap. */
import { K } from "../engine/content";
import { Icon } from "./icons";
import { LAYER_COLOR } from "./theme";

const Num = ({ n }: { n: number }) => (
  <span className="grid h-4 w-4 shrink-0 place-items-center rounded-full bg-night text-[9px] font-black text-gold ring-1 ring-gold">{n}</span>
);

const PARTS: { n: number; title: string; body: string; color?: string }[] = [
  { n: 1, title: "The pitch", body: "What they tell you. Everyone can read it, and it always sounds good." },
  { n: 2, title: "Red · the cost (Read 1)", body: "The real price, and the verdict: TRAP or HONEST. A trap also names its lever: red, amber or blue.", color: LAYER_COLOR[1] },
  { n: 3, title: "Amber · the clock (Read 2)", body: "When it comes due, and how it grows.", color: LAYER_COLOR[2] },
  { n: 4, title: "Blue · the connection (Read 3)", body: "Who's really behind it. Reading blue lets you trace a thread once the Underworld opens.", color: LAYER_COLOR[3] },
  { n: 5, title: "The red glasses", body: "Layers you can read are printed in hidden ink. Drag the glasses over them, or press Put glasses on." },
];

export function DealAnatomy() {
  return (
    <figure className="mt-2 rounded-lg bg-black/20 p-2" aria-label="How to read a deal card">
      <div className="grid gap-3 sm:grid-cols-[150px_1fr]">
        {/* the sample card */}
        <div className="relative mx-auto w-[150px] overflow-hidden rounded-lg border border-black/40 bg-program text-ink shadow" aria-hidden>
          <div className="bg-lending px-2 py-0.5 text-[9px] font-black text-white">LENDING</div>
          <div className="flex items-start gap-1 border-b border-dashed border-black/20 px-1.5 py-1">
            <Num n={1} />
            <p className="text-[9px] font-extrabold leading-tight">&ldquo;Quick Cash: $375 today!&rdquo;</p>
          </div>
          {[1, 2, 3].map((n) => (
            <div key={n} className="flex items-center gap-1 px-1.5 py-1">
              <Num n={n + 1} />
              <span className="h-3 flex-1 rounded-sm" style={{ background: LAYER_COLOR[n], opacity: 0.85 }} />
            </div>
          ))}
          <div className="absolute bottom-3 right-1 flex items-center gap-0.5">
            <Num n={5} />
            <span className="inline-block h-4 w-9 rounded-full border-2 border-night bg-[#FF0000]/70" />
          </div>
        </div>
        {/* what each part means */}
        <ol className="space-y-1 text-[12px] leading-snug">
          {PARTS.map((p) => (
            <li key={p.n} className="flex gap-1.5">
              <Num n={p.n} />
              <span>
                <b style={{ color: p.color }}>{p.title}:</b> {p.body}
              </span>
            </li>
          ))}
        </ol>
      </div>
      <figcaption className="mt-2 rounded-md border border-gold/40 bg-night/60 p-2 text-[12px] leading-snug">
        <b className="text-gold">Beating a trap:</b> NEGOTIATE works when your <Icon name="sight" size={12} /> Read reaches the trap&apos;s lever:{" "}
        {[1, 2, 3].map((n) => (
          <span key={n} className="mx-0.5 inline-flex items-center gap-0.5 whitespace-nowrap rounded px-1 font-bold text-white" style={{ background: LAYER_COLOR[n] }}>
            {["red", "amber", "blue"][n - 1]} = Read {n}
          </span>
        ))}
        . It costs {K.NEG_COST} <Icon name="trust" size={12} /> Trust. Below the lever you get played, so WALK instead.
      </figcaption>
    </figure>
  );
}

/** What each icon means, for the first turn. */
export function StatKey() {
  const rows: [Parameters<typeof Icon>[0]["name"], string, string][] = [
    ["sight", "Read", "how well you read a district (0–3)"],
    ["trust", "Trust", "spend it to negotiate and teach"],
    ["corruption", "Shady", `shortcuts add it; at ${K.FLIP} you Fall (Block Party: at ${K.BP_SIT_OUT} you sit out a turn)`],
    ["legend", "Props", "earned by lifting people up"],
    ["clarity", "Clarity", `a district wakes at ${K.WAKE}`],
    ["pressure", "Squeeze", `the Machine's grip; ${K.CAPTURE} = captured`],
  ];
  return (
    <ul className="mt-2 grid gap-1 rounded-lg bg-black/20 p-2 text-[12px] sm:grid-cols-2">
      {rows.map(([icon, name, what]) => (
        <li key={name} className="flex items-center gap-1.5">
          <Icon name={icon} size={15} />
          <span>
            <b>{name}</b>: {what}
          </span>
        </li>
      ))}
    </ul>
  );
}
