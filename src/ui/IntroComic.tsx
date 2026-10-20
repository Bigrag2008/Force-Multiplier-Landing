"use client";
/**
 * The story in four panels, before round 1: the block, the deals, the Machine, your mission.
 * About 30 seconds to read; every panel is drawn inline (no image files), in the West Dayton palette.
 */
import { useEffect, useRef, useState, type ReactNode } from "react";
import { C } from "../engine/content";

const NIGHT = "#1B1530";
const GOLD = "#F2B632";
const CREAM = "#F6EEDC";
const RED = "#E63946";
const SKIN = ["#8d5524", "#5c3a1e", "#a8693a", "#3d2516"];

// ---------- drawing helpers ----------
function Person({ x, y, skin, shirt, glasses, s = 1, wave }: { x: number; y: number; skin: string; shirt: string; glasses?: boolean; s?: number; wave?: boolean }) {
  return (
    <g transform={`translate(${x} ${y}) scale(${s})`}>
      <path d="M-13 30 Q-13 8 0 8 Q13 8 13 30 Z" fill={shirt} />
      {wave && <path d="M10 14 L20 -2" stroke={shirt} strokeWidth="5" strokeLinecap="round" />}
      <circle cx="0" cy="-2" r="9" fill={skin} />
      <path d="M-9 -5 Q-8 -13 0 -12 Q8 -13 9 -5 Q4 -9 0 -8 Q-4 -9 -9 -5Z" fill="#1a1a1a" />
      {glasses && (
        <g stroke={NIGHT} strokeWidth="1.2">
          <rect x="-8" y="-4" width="7" height="5" rx="2" fill={RED} fillOpacity="0.85" />
          <rect x="1" y="-4" width="7" height="5" rx="2" fill={RED} fillOpacity="0.85" />
        </g>
      )}
    </g>
  );
}

function Bubble({ x, y, w, children, tail = "left" }: { x: number; y: number; w: number; children: ReactNode; tail?: "left" | "right" }) {
  const tx = tail === "left" ? x + 14 : x + w - 14;
  return (
    <g>
      <rect x={x} y={y} width={w} height="22" rx="11" fill="white" stroke={NIGHT} strokeWidth="1.5" />
      <path d={`M${tx - 5} ${y + 21} L${tx + (tail === "left" ? -4 : 4)} ${y + 31} L${tx + 5} ${y + 21}`} fill="white" stroke={NIGHT} strokeWidth="1.5" strokeLinejoin="round" />
      <rect x={tx - 5} y={y + 19} width="10" height="3" fill="white" />
      <text x={x + w / 2} y={y + 15} textAnchor="middle" fontSize="10" fontWeight="800" fill={NIGHT} fontFamily="system-ui, sans-serif">
        {children}
      </text>
    </g>
  );
}

/** a gear outline centred on (cx, cy) */
function gearPath(cx: number, cy: number, r: number, teeth: number) {
  const pts: string[] = [];
  for (let i = 0; i < teeth * 2; i++) {
    const a = (Math.PI * i) / teeth;
    const rr = i % 2 ? r : r * 1.18;
    const a1 = a - Math.PI / teeth / 2.4;
    const a2 = a + Math.PI / teeth / 2.4;
    pts.push(`${cx + rr * Math.cos(a1)} ${cy + rr * Math.sin(a1)}`, `${cx + rr * Math.cos(a2)} ${cy + rr * Math.sin(a2)}`);
  }
  return `M${pts.join(" L")} Z`;
}

const Halftone = ({ id, color }: { id: string; color: string }) => (
  <pattern id={id} width="6" height="6" patternUnits="userSpaceOnUse">
    <circle cx="3" cy="3" r="1.1" fill={color} />
  </pattern>
);

// ---------- the four scenes (viewBox 0 0 320 180) ----------
function SceneBlock() {
  return (
    <svg viewBox="0 0 320 180" className="h-full w-full" aria-hidden>
      <defs>
        <linearGradient id="dusk" x1="0" y1="0" x2="0" y2="1">
          <stop offset="0" stopColor="#3b2a6b" />
          <stop offset="0.6" stopColor="#e07a3a" />
          <stop offset="1" stopColor={GOLD} />
        </linearGradient>
        <Halftone id="ht1" color="#ffffff22" />
      </defs>
      <rect width="320" height="180" fill="url(#dusk)" />
      <rect width="320" height="180" fill="url(#ht1)" />
      <circle cx="250" cy="70" r="22" fill="#ffd27a" />
      {/* church */}
      <path d="M20 140 V80 L45 58 L70 80 V140 Z" fill="#5a3d7a" />
      <path d="M45 58 V38 M38 46 H52" stroke={CREAM} strokeWidth="3" />
      <rect x="38" y="104" width="14" height="36" rx="7" fill={GOLD} />
      {/* row houses */}
      {[
        [78, "#8b1e1e"],
        [126, "#1f5f8b"],
        [174, "#2f6b3a"],
      ].map(([x, c]) => (
        <g key={x as number}>
          <path d={`M${x} 140 V92 L${(x as number) + 22} 76 L${(x as number) + 44} 92 V140 Z`} fill={c as string} />
          <rect x={(x as number) + 8} y="100" width="10" height="10" fill="#ffe08a" />
          <rect x={(x as number) + 26} y="100" width="10" height="10" fill="#ffe08a" />
          <rect x={(x as number) + 16} y="118" width="12" height="22" fill={NIGHT} />
        </g>
      ))}
      {/* barbershop */}
      <rect x="226" y="96" width="70" height="44" fill="#6b4a2b" />
      <rect x="226" y="88" width="70" height="12" fill={CREAM} />
      <text x="261" y="97.5" textAnchor="middle" fontSize="8" fontWeight="900" fill={NIGHT} fontFamily="system-ui, sans-serif">
        BARBERSHOP
      </text>
      <rect x="234" y="106" width="30" height="20" fill="#ffe08a" />
      <rect x="300" y="98" width="7" height="34" rx="3" fill="white" />
      <path d="M300 104 L307 99 M300 112 L307 106 M300 120 L307 114 M300 128 L307 122" stroke={RED} strokeWidth="2.4" />
      <rect y="140" width="320" height="40" fill="#2a2140" />
      <path d="M0 160 H320" stroke="#ffffff33" strokeWidth="2" strokeDasharray="12 10" />
      <Person x={118} y={150} skin={SKIN[0]} shirt={GOLD} wave />
      <Person x={150} y={152} skin={SKIN[1]} shirt="#7cc4ff" s={0.8} />
      <Person x={196} y={150} skin={SKIN[2]} shirt="#ff7a90" />
      <Bubble x={60} y={46} w={78}>
        Hey neighbor!
      </Bubble>
    </svg>
  );
}

function SceneDeals() {
  return (
    <svg viewBox="0 0 320 180" className="h-full w-full" aria-hidden>
      <defs>
        <Halftone id="ht2" color="#ffffff14" />
        <clipPath id="lens">
          <circle cx="216" cy="138" r="32" />
        </clipPath>
      </defs>
      <rect width="320" height="180" fill="#2a2140" />
      <rect width="320" height="180" fill="url(#ht2)" />
      {/* storefront */}
      <rect x="14" y="20" width="132" height="130" fill="#3a2f55" />
      <rect x="22" y="28" width="116" height="30" rx="4" fill={NIGHT} stroke={RED} strokeWidth="2.5" />
      <text x="80" y="49" textAnchor="middle" fontSize="17" fontWeight="900" fill={RED} fontFamily="system-ui, sans-serif" style={{ filter: "drop-shadow(0 0 4px #E63946)" }}>
        QUICK CA$H
      </text>
      <rect x="28" y="70" width="44" height="80" fill="#ffe08a" opacity="0.85" />
      <rect x="84" y="70" width="52" height="40" fill="#ffe08a" opacity="0.85" />
      <text x="110" y="95" textAnchor="middle" fontSize="9" fontWeight="900" fill={RED} fontFamily="system-ui, sans-serif">
        OPEN
      </text>
      {/* the flyer */}
      <g transform="rotate(-4 220 95)">
        <rect x="160" y="24" width="140" height="140" rx="4" fill={CREAM} stroke={NIGHT} strokeWidth="2" />
        <text x="230" y="52" textAnchor="middle" fontSize="13" fontWeight="900" fill={NIGHT} fontFamily="system-ui, sans-serif">
          NEED CASH?
        </text>
        <text x="230" y="84" textAnchor="middle" fontSize="26" fontWeight="900" fill="#2f6b3a" fontFamily="system-ui, sans-serif">
          $375
        </text>
        <text x="230" y="100" textAnchor="middle" fontSize="11" fontWeight="800" fill={NIGHT} fontFamily="system-ui, sans-serif">
          TODAY! EASY!
        </text>
        {[112, 118, 124, 130, 136, 142, 148].map((y) => (
          <rect key={y} x="172" y={y} width={y % 12 ? 112 : 96} height="2.2" fill="#00000055" />
        ))}
      </g>
      {/* the glasses reveal the fine print */}
      <g clipPath="url(#lens)">
        <rect x="180" y="100" width="72" height="72" fill="#fff2b8" />
        {["$56 FEE", "EVERY 2 WKS", "= 391% APR"].map((t, k) => (
          <text key={t} x="216" y={128 + k * 11} textAnchor="middle" fontSize="8" fontWeight="900" fill={RED} fontFamily="system-ui, sans-serif">
            {t}
          </text>
        ))}
      </g>
      <circle cx="216" cy="138" r="32" fill="none" stroke={NIGHT} strokeWidth="5" />
      <circle cx="216" cy="138" r="32" fill="none" stroke={RED} strokeWidth="2.5" />
      <path d="M240 160 L256 176" stroke={NIGHT} strokeWidth="7" strokeLinecap="round" />
      <Bubble x={20} y={156} w={112} tail="right">
        What&apos;s the catch?
      </Bubble>
    </svg>
  );
}

function SceneMachine() {
  return (
    <svg viewBox="0 0 320 180" className="h-full w-full" aria-hidden>
      <defs>
        <radialGradient id="redglow" cx="0.5" cy="0.35" r="0.7">
          <stop offset="0" stopColor="#7a1020" />
          <stop offset="1" stopColor="#120c22" />
        </radialGradient>
        <Halftone id="ht3" color="#ff000018" />
      </defs>
      <rect width="320" height="180" fill="url(#redglow)" />
      <rect width="320" height="180" fill="url(#ht3)" />
      <path d={gearPath(160, 62, 48, 12)} fill="#2a1a2e" stroke={RED} strokeWidth="2" />
      <circle cx="160" cy="62" r="22" fill="#120c22" stroke={RED} strokeWidth="2" />
      <path d={gearPath(82, 48, 26, 9)} fill="#2a1a2e" stroke="#8b1e1e" strokeWidth="2" />
      <path d={gearPath(240, 52, 30, 10)} fill="#2a1a2e" stroke="#8b1e1e" strokeWidth="2" />
      {/* the hidden Owner */}
      <g transform="translate(160 66)">
        <rect x="-11" y="-26" width="22" height="16" fill="#000" />
        <rect x="-17" y="-11" width="34" height="4" fill="#000" />
        <circle cx="0" cy="0" r="8" fill="#000" />
        <text x="0" y="4" textAnchor="middle" fontSize="11" fontWeight="900" fill={RED} fontFamily="system-ui, sans-serif">
          ?
        </text>
      </g>
      {/* pressing down on the five districts */}
      {Object.values(C.districtColors).map((c, i) => {
        const x = 26 + i * 58;
        return (
          <g key={c}>
            <path d={`M${x + 16} 112 v12 m-6 -6 l6 6 l6 -6`} stroke={RED} strokeWidth="3" fill="none" strokeLinecap="round" strokeLinejoin="round" />
            <path d={`M${x} 172 V140 L${x + 16} 128 L${x + 32} 140 V172 Z`} fill={c} opacity="0.55" />
            <rect x={x + 11} y="152" width="10" height="20" fill="#120c22" />
          </g>
        );
      })}
      <rect y="172" width="320" height="8" fill="#120c22" />
    </svg>
  );
}

function SceneMission() {
  return (
    <svg viewBox="0 0 320 180" className="h-full w-full" aria-hidden>
      <defs>
        <linearGradient id="dawn" x1="0" y1="0" x2="0" y2="1">
          <stop offset="0" stopColor={NIGHT} />
          <stop offset="1" stopColor="#3b2a6b" />
        </linearGradient>
        <Halftone id="ht4" color="#F2B63222" />
      </defs>
      <rect width="320" height="180" fill="url(#dawn)" />
      <rect width="320" height="180" fill="url(#ht4)" />
      {/* the spotlight drags the Owner into the light */}
      <path d="M96 150 L232 20 L282 52 Z" fill={GOLD} opacity="0.35" />
      <g transform="translate(258 44)">
        <rect x="-11" y="-26" width="22" height="16" fill="#000" />
        <rect x="-17" y="-11" width="34" height="4" fill="#000" />
        <circle cx="0" cy="0" r="9" fill="#6b6b6b" />
        <path d="M-4 -2 h2 M2 -2 h2 M-3 4 q3 -3 6 0" stroke="#000" strokeWidth="1.5" />
      </g>
      <text x="258" y="80" textAnchor="middle" fontSize="9" fontWeight="900" fill={GOLD} fontFamily="system-ui, sans-serif">
        EXPOSED
      </text>
      <rect x="84" y="140" width="24" height="12" rx="2" fill="#555" transform="rotate(-40 96 146)" />
      {/* five districts, waking up */}
      {Object.values(C.districtColors).map((c, i) => (
        <g key={c} transform={`translate(${16 + i * 22} 30)`}>
          <path d="M0 0 V34" stroke={CREAM} strokeWidth="2" />
          <path d="M0 0 H16 L12 6 L16 12 H0 Z" fill={c} />
        </g>
      ))}
      <text x="60" y="80" textAnchor="middle" fontSize="8" fontWeight="900" fill={CREAM} fontFamily="system-ui, sans-serif">
        5 DISTRICTS AWAKE
      </text>
      <rect y="160" width="320" height="20" fill="#2a2140" />
      <Person x={40} y={140} skin={SKIN[0]} shirt={GOLD} glasses s={1.15} />
      <Person x={78} y={142} skin={SKIN[3]} shirt="#7cc4ff" glasses s={1.15} />
      <Person x={148} y={140} skin={SKIN[2]} shirt="#ff7a90" glasses s={1.15} wave />
      <Bubble x={112} y={88} w={124}>
        We read it. Together.
      </Bubble>
    </svg>
  );
}

const PANELS: { title: string; scene: () => ReactNode; text: ReactNode }[] = [
  {
    title: "The block",
    scene: SceneBlock,
    text: (
      <>
        The West Side of Dayton. The barbershop, the church, Grandma&apos;s kitchen. <b>Your block</b>: people who look out for each other.
      </>
    ),
  },
  {
    title: "The deals",
    scene: SceneDeals,
    text: (
      <>
        Every corner has a deal that sounds good. But every deal has a <b>second number</b>: the real cost, hidden in the fine print. You have to learn to read it.
      </>
    ),
  },
  {
    title: "The Machine",
    scene: SceneMachine,
    text: (
      <>
        Behind every trap is one <b>Machine</b>. It squeezes the block, district by district. And someone is hiding behind it: <b>the Owner</b>.
      </>
    ),
  },
  {
    title: "Your mission",
    scene: SceneMission,
    text: (
      <>
        <b>Read</b> the deals. <b>Teach</b> each other. <b>Wake</b> the five districts, then drag the Owner into the light. You win or lose <b>together</b>, and every shortcut has a cost: don&apos;t become the Machine.
      </>
    ),
  },
];

/** The four-panel story. `onDone` starts the game. */
/** `where`: a Your City edition's setting ("The East Side of Detroit"); the first panel names it */
export function IntroComic({ onDone, where }: { onDone: () => void; where?: string }) {
  const [i, setI] = useState(0);
  const next = useRef<HTMLButtonElement>(null);
  const last = i === PANELS.length - 1;
  const P = PANELS[i];
  useEffect(() => next.current?.focus(), [i]);
  useEffect(() => {
    const onKey = (e: globalThis.KeyboardEvent) => {
      if (e.key === "ArrowRight") setI((x) => Math.min(PANELS.length - 1, x + 1));
      if (e.key === "ArrowLeft") setI((x) => Math.max(0, x - 1));
      if (e.key === "Escape") onDone();
    };
    window.addEventListener("keydown", onKey);
    return () => window.removeEventListener("keydown", onKey);
  }, [onDone]);

  return (
    <div role="dialog" aria-modal="true" aria-labelledby="intro-title" className="fixed inset-0 z-50 flex items-center justify-center overflow-y-auto bg-night/95 p-3">
      <div className="w-full max-w-2xl">
        <div className="mb-2 flex items-center justify-between text-xs text-program/70">
          <span className="font-black uppercase tracking-[0.25em] text-gold">The Second Number</span>
          <button className="rounded-md border border-white/25 px-2 py-1 hover:bg-white/10" onClick={onDone}>
            Skip the story
          </button>
        </div>
        <figure className="overflow-hidden rounded-xl border-4 border-black bg-program shadow-[6px_6px_0_#000]">
          <div className="relative aspect-[16/9] border-b-4 border-black">
            <P.scene />
            <span id="intro-title" className="absolute left-2 top-2 rotate-[-2deg] border-2 border-black bg-gold px-2 py-0.5 text-sm font-black uppercase text-night shadow-[2px_2px_0_#000]">
              {i + 1}. {P.title}
            </span>
          </div>
          <figcaption className="min-h-[88px] p-3 text-[15px] leading-snug text-ink sm:text-base">{i === 0 && where ? <>{where}. The barbershop, the church, Grandma&apos;s kitchen. <b>Your block</b>: people who look out for each other.</> : P.text}</figcaption>
        </figure>
        <div className="mt-3 flex items-center justify-between gap-2">
          <button className="rounded-lg border border-white/25 px-4 py-2 font-bold text-program disabled:opacity-30" disabled={i === 0} onClick={() => setI(i - 1)}>
            Back
          </button>
          <div className="flex gap-1.5" aria-label={`Panel ${i + 1} of ${PANELS.length}`}>
            {PANELS.map((_, k) => (
              <button key={k} aria-label={`Panel ${k + 1}`} className={`h-2.5 w-2.5 rounded-full ${k === i ? "bg-gold" : "bg-white/30"}`} onClick={() => setI(k)} />
            ))}
          </div>
          <button ref={next} className="rounded-lg bg-gold px-5 py-2 font-black text-night hover:brightness-110" onClick={() => (last ? onDone() : setI(i + 1))}>
            {last ? "Let's play" : "Next"}
          </button>
        </div>
      </div>
    </div>
  );
}
