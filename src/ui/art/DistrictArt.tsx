/**
 * Five West Dayton scenes, one per district, drawn flat with bold outlines (ART_DIRECTION.md:
 * Emory Douglas outlines, AfriCOBRA "Kool-Aid" color). Commissioned art replaces these through
 * src/ui/art/manifest.ts without touching the board.
 */
import type { ReactNode } from "react";
import type { District } from "../../engine/content";
import { ART } from "./manifest";

const INK = "#1B1530";
const PAPER = "#F6EEDC";
const GOLD = "#F2B632";
const LIT = "#ffe08a";
const o = { stroke: INK, strokeWidth: 1.6, strokeLinejoin: "round" as const };

const Sky = ({ top, bottom }: { top: string; bottom: string }) => (
  <>
    <defs>
      <linearGradient id={`sky-${top.slice(1)}`} x1="0" y1="0" x2="0" y2="1">
        <stop offset="0" stopColor={top} />
        <stop offset="1" stopColor={bottom} />
      </linearGradient>
    </defs>
    <rect width="200" height="70" fill={`url(#sky-${top.slice(1)})`} />
  </>
);
const Sign = ({ x, y, w, text, fg = INK, bg = PAPER, size = 6 }: { x: number; y: number; w: number; text: string; fg?: string; bg?: string; size?: number }) => (
  <g>
    <rect x={x} y={y} width={w} height={size + 4} fill={bg} {...o} strokeWidth={1.2} />
    <text x={x + w / 2} y={y + size + 1.2} textAnchor="middle" fontSize={size} fontWeight="900" fill={fg} fontFamily="system-ui, sans-serif">
      {text}
    </text>
  </g>
);
const Ground = ({ color = "#2a2140" }: { color?: string }) => <rect y="62" width="200" height="8" fill={color} />;

/** Lending: storefront lenders where the bank branch closed */
function Lending() {
  return (
    <>
      <Sky top="#2f6b3a" bottom="#9fd38a" />
      <rect x="6" y="24" width="56" height="38" fill="#cfc4a8" {...o} />
      <path d="M2 24 L34 12 L66 24 Z" fill="#a89c80" {...o} />
      <rect x="14" y="34" width="40" height="22" fill="#8a7f68" {...o} />
      <path d="M14 34 L54 56 M54 34 L14 56" stroke={INK} strokeWidth="2" />
      <Sign x={12} y={26} w={44} text="BANK · CLOSED" size={5.5} />
      <rect x="70" y="20" width="60" height="42" fill="#3FA34D" {...o} />
      <Sign x={74} y={23} w={52} text="CHECKS CA$HED" fg="#E63946" size={6} />
      <rect x="76" y="36" width="22" height="18" fill={LIT} {...o} />
      <rect x="104" y="36" width="20" height="26" fill={INK} {...o} />
      <rect x="136" y="26" width="58" height="36" fill="#E0A526" {...o} />
      <Sign x={140} y={29} w={50} text="PAYDAY $$$" fg="#E63946" bg={LIT} size={6.5} />
      <rect x="142" y="42" width="20" height="14" fill={LIT} {...o} />
      <rect x="168" y="42" width="20" height="20" fill={INK} {...o} />
      <Ground />
    </>
  );
}

/** Housing: Wright-Dunbar row houses, the Dunbar House, and a lot for sale */
function Housing() {
  return (
    <>
      <Sky top="#8b1e1e" bottom="#f2a07a" />
      {/* the Dunbar House: two-story brick Italianate */}
      <rect x="8" y="20" width="44" height="42" fill="#a0442f" {...o} />
      <path d="M4 20 H56 L52 14 H8 Z" fill={INK} />
      {[12, 26, 40].map((x) => (
        <rect key={`u${x}`} x={x} y="25" width="8" height="12" fill={LIT} {...o} strokeWidth={1} />
      ))}
      <rect x="12" y="44" width="8" height="12" fill={LIT} {...o} strokeWidth={1} />
      <rect x="25" y="44" width="10" height="18" fill={INK} />
      <rect x="40" y="44" width="8" height="12" fill={LIT} {...o} strokeWidth={1} />
      {/* row houses */}
      {[
        [62, "#E03C31"],
        [92, "#f28c6b"],
        [122, "#c0392b"],
      ].map(([x, c]) => (
        <g key={x as number}>
          <path d={`M${x} 62 V30 L${(x as number) + 14} 20 L${(x as number) + 28} 30 V62 Z`} fill={c as string} {...o} />
          <rect x={(x as number) + 5} y="34" width="7" height="8" fill={LIT} {...o} strokeWidth={1} />
          <rect x={(x as number) + 16} y="34" width="7" height="8" fill={LIT} {...o} strokeWidth={1} />
          <rect x={(x as number) + 9} y="48" width="10" height="14" fill={INK} />
        </g>
      ))}
      {/* the empty lot */}
      <path d="M154 62 Q170 56 196 62 Z" fill="#6b8f3a" />
      <rect x="171" y="38" width="2" height="22" fill={INK} />
      <Sign x={160} y={32} w={26} text="FOR SALE" fg="#E03C31" size={5} />
      <Ground />
    </>
  );
}

/** Labor: the plant gate, chained, smokestacks cold */
function Labor() {
  return (
    <>
      <Sky top="#123f7a" bottom="#8fbfee" />
      <rect x="40" y="10" width="9" height="30" fill="#4a5a6e" {...o} />
      <rect x="56" y="16" width="9" height="24" fill="#4a5a6e" {...o} />
      <path d="M20 62 V36 L42 28 V36 L64 28 V36 L86 28 V36 L108 28 V62 Z" fill="#1F7AE0" {...o} />
      {[28, 50, 72, 94].map((x) => (
        <rect key={x} x={x} y="42" width="10" height="8" fill="#0f2f55" {...o} strokeWidth={1} />
      ))}
      <Sign x={34} y={52} w={56} text="PLANT CLOSED" fg="#E63946" size={5.5} />
      {/* gate */}
      <g stroke={INK} strokeWidth="1.6">
        {[120, 128, 136, 144, 152, 160, 168, 176].map((x) => (
          <path key={x} d={`M${x} 62 V36`} />
        ))}
        <path d="M116 38 H182 M116 50 H182" />
      </g>
      <path d="M140 42 q8 8 16 0" stroke="#9aa5b1" strokeWidth="2.4" fill="none" />
      <rect x="144" y="44" width="8" height="7" rx="1" fill="#9aa5b1" {...o} strokeWidth={1} />
      <Ground />
    </>
  );
}

/** Health: the hospital, closed */
function Health() {
  return (
    <>
      <Sky top="#4b1f66" bottom="#c79be0" />
      <rect x="40" y="16" width="96" height="46" fill="#d9cfe6" {...o} />
      <rect x="76" y="8" width="24" height="12" fill="#d9cfe6" {...o} />
      <path d="M85 10 h6 v3 h3 v6 h-3 v3 h-6 v-3 h-3 v-6 h3 Z" fill="#8E3BB8" />
      {[46, 60, 74, 102, 116].map((x) =>
        [24, 38].map((y) => <rect key={`${x}-${y}`} x={x} y={y} width="9" height="9" fill="#8a7f98" {...o} strokeWidth={1} />),
      )}
      <rect x="80" y="42" width="16" height="20" fill={INK} />
      <path d="M78 46 L98 58 M98 46 L78 58" stroke="#c9a46a" strokeWidth="3" />
      <Sign x={56} y={28} w={64} text="CLOSED · 2018" fg="#8E3BB8" size={6} />
      {/* the long road to care */}
      <path d="M140 62 Q170 52 200 50" stroke={GOLD} strokeWidth="1.5" strokeDasharray="4 3" fill="none" />
      <rect x="180" y="44" width="14" height="7" rx="2" fill="white" {...o} strokeWidth={1} />
      <text x="166" y="40" fontSize="5" fontWeight="900" fill={PAPER} fontFamily="system-ui, sans-serif">
        care →
      </text>
      <Ground />
    </>
  );
}

/** Education: Dunbar High, the bus, a cap in the air */
function Education() {
  return (
    <>
      <Sky top="#a8550f" bottom="#ffd08a" />
      <rect x="14" y="26" width="92" height="36" fill="#b5651d" {...o} />
      <rect x="48" y="12" width="24" height="16" fill="#b5651d" {...o} />
      <path d="M46 12 L60 4 L74 12 Z" fill={INK} />
      <circle cx="60" cy="20" r="5" fill={PAPER} {...o} strokeWidth={1} />
      <path d="M60 17 V20 L62 21" stroke={INK} strokeWidth="1" />
      {[20, 34, 76, 90].map((x) => (
        <rect key={x} x={x} y="34" width="9" height="10" fill={LIT} {...o} strokeWidth={1} />
      ))}
      <rect x="52" y="44" width="16" height="18" fill={INK} />
      <Sign x={26} y={47} w={22} text="DUNBAR" size={4.6} />
      {/* bus */}
      <rect x="120" y="42" width="56" height="18" rx="3" fill="#F28C1B" {...o} />
      {[126, 136, 146, 156].map((x) => (
        <rect key={x} x={x} y="45" width="8" height="6" fill={LIT} {...o} strokeWidth={0.8} />
      ))}
      <circle cx="132" cy="61" r="3.5" fill={INK} />
      <circle cx="166" cy="61" r="3.5" fill={INK} />
      {/* graduation cap */}
      <g transform="translate(166 14) rotate(-14)">
        <path d="M-12 0 L0 -5 L12 0 L0 5 Z" fill={INK} />
        <path d="M-6 3 V8 Q0 11 6 8 V3" fill={INK} />
        <path d="M10 1 V9" stroke={GOLD} strokeWidth="1.4" />
      </g>
      <Ground />
    </>
  );
}

const SCENES: Record<District, () => ReactNode> = { LENDING: Lending, HOUSING: Housing, LABOR: Labor, HEALTH: Health, EDUCATION: Education };

/** The district's scene: a Your City edition's own picture, else commissioned art if the manifest has it, else the drawn one. */
export function DistrictArt({ d, src, className = "" }: { d: District; src?: string; className?: string }) {
  const img = src ?? ART.districts[d];
  // eslint-disable-next-line @next/next/no-img-element -- a plain static file, so the site stays hostable anywhere
  if (img) return <img src={img} alt="" className={`h-full w-full object-cover ${className}`} />;
  const Scene = SCENES[d];
  return (
    <svg viewBox="0 0 200 70" preserveAspectRatio="xMidYMid slice" className={`h-full w-full ${className}`} aria-hidden>
      <Scene />
    </svg>
  );
}
