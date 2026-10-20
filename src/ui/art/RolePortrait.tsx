/**
 * The five roles as church hand fans with a portrait on the front (ART_DIRECTION.md §5–6):
 * flat color, bold outline, warm and varied skin tones, hair and dress drawn with care.
 * The Machine has no face, so the Overlord gets none. Commissioned portraits replace these
 * through src/ui/art/manifest.ts.
 */
import type { ReactNode } from "react";
import { t } from "../../i18n";
import { ART } from "./manifest";

const INK = "#1B1530";
const GOLD = "#F2B632";
const o = { stroke: INK, strokeWidth: 1.4, strokeLinejoin: "round" as const };

/** a bust: shoulders, neck, head, simple warm face */
function Bust({ skin, shirt, children, hair }: { skin: string; shirt: string; children?: ReactNode; hair?: ReactNode }) {
  return (
    <g>
      <path d="M8 60 Q8 44 30 42 Q52 44 52 60 Z" fill={shirt} {...o} />
      <path d="M25 36 h10 v8 q-5 3 -10 0 Z" fill={skin} {...o} />
      {hair}
      <ellipse cx="30" cy="26" rx="10.5" ry="12.5" fill={skin} {...o} />
      <circle cx="26" cy="25" r="1.3" fill={INK} />
      <circle cx="34" cy="25" r="1.3" fill={INK} />
      <path d="M26 31.5 q4 3 8 0" stroke={INK} strokeWidth="1.3" fill="none" strokeLinecap="round" />
      {children}
    </g>
  );
}

const PORTRAITS: Record<string, { bg: string; draw: () => ReactNode }> = {
  // the bridge: fade, beard, a word in two languages
  Translator: {
    bg: "#F2B632",
    draw: () => (
      <>
        <g fontFamily="system-ui, sans-serif" fontWeight="900" fontSize="6">
          <path d="M9 13 h10 v7 h-6 l-3 3 v-3 h-1 Z" fill="white" {...o} strokeWidth={1} />
          <text x="14" y="18.6" textAnchor="middle" fill={INK}>A</text>
          <path d="M41 13 h10 v7 h-1 v3 l-3 -3 h-6 Z" fill="white" {...o} strokeWidth={1} />
          <text x="46" y="18.6" textAnchor="middle" fill={INK}>B</text>
        </g>
        <Bust skin="#8d5524" shirt="#1F7AE0" hair={<path d="M19.5 24 Q19 12 30 12 Q41 12 40.5 24 Q39 17 30 17 Q21 17 19.5 24 Z" fill="#1a1a1a" />}>
          <path d="M20.5 28 Q21 38 30 38.5 Q39 38 39.5 28 Q37 34 30 34.5 Q23 34 20.5 28 Z" fill="#1a1a1a" />
          <path d="M26 31.8 q4 2 8 0" stroke="#f1d6c0" strokeWidth="1.1" fill="none" strokeLinecap="round" />
        </Bust>
      </>
    ),
  },
  // the hungry one: puffs, backpack straps, a book
  Student: {
    bg: "#7cc4ff",
    draw: () => (
      <Bust
        skin="#a8693a"
        shirt="#F28C1B"
        hair={
          <>
            <circle cx="18" cy="13" r="7" fill="#2a1a10" {...o} />
            <circle cx="42" cy="13" r="7" fill="#2a1a10" {...o} />
            <path d="M19.5 25 Q19 13 30 13 Q41 13 40.5 25 Q38 18 30 18 Q22 18 19.5 25 Z" fill="#2a1a10" />
          </>
        }
      >
        <path d="M17 46 V60 M43 46 V60" stroke="#6b3a1e" strokeWidth="3" />
        <rect x="24" y="48" width="12" height="9" rx="1" fill="white" {...o} strokeWidth={1} />
        <path d="M30 48 V57" stroke={INK} strokeWidth="0.8" />
      </Bust>
    ),
  },
  // Grandma: church hat, pearls, and the red reading glasses that read the second number
  Elder: {
    bg: "#c79be0",
    draw: () => (
      <Bust
        skin="#5c3a1e"
        shirt="#8E3BB8"
        hair={<path d="M19.5 27 Q18 16 30 15 Q42 16 40.5 27 Q38 20 30 20 Q22 20 19.5 27 Z" fill="#d8d8d8" />}
      >
        <ellipse cx="30" cy="14" rx="20" ry="4.5" fill="#E03C31" {...o} />
        <path d="M20 14 Q20 4 30 4 Q40 4 40 14 Z" fill="#E03C31" {...o} />
        <circle cx="38" cy="9" r="3" fill={GOLD} {...o} strokeWidth={1} />
        <g {...o} strokeWidth={1.1}>
          <rect x="21.5" y="22.5" width="7.5" height="5.5" rx="2" fill="#E63946" fillOpacity="0.85" />
          <rect x="31" y="22.5" width="7.5" height="5.5" rx="2" fill="#E63946" fillOpacity="0.85" />
          <path d="M29 24.5 h2" />
        </g>
        {[22, 26, 30, 34, 38].map((x, i) => (
          <circle key={x} cx={x} cy={44 + (i === 0 || i === 4 ? 0 : i === 2 ? 2.4 : 1.6)} r="1.6" fill="white" stroke={INK} strokeWidth="0.6" />
        ))}
      </Bust>
    ),
  },
  // served, came home: veteran's cap, salt-and-pepper beard, dog tags
  Veteran: {
    bg: "#9fd38a",
    draw: () => (
      <Bust skin="#3d2516" shirt="#556b2f">
        <path d="M19 22 Q19 12 30 11.5 Q41 12 41 22 Z" fill="#2f3b22" {...o} />
        <path d="M18 22 H44 L41 25 H19 Z" fill="#2f3b22" {...o} />
        <path d="M30 14.5 l1.2 2.6 2.8.3 -2.1 1.9.6 2.8 -2.5 -1.5 -2.5 1.5.6 -2.8 -2.1 -1.9 2.8 -.3 Z" fill={GOLD} />
        <path d="M20.5 28 Q21 38.5 30 39 Q39 38.5 39.5 28 Q37 34 30 34.5 Q23 34 20.5 28 Z" fill="#b8b8b8" />
        <path d="M26 31.8 q4 2 8 0" stroke="#3d2516" strokeWidth="1.1" fill="none" strokeLinecap="round" />
        <path d="M27 44 L30 52 L33 44" stroke="#c0c0c0" strokeWidth="0.9" fill="none" />
        <rect x="28" y="51" width="4" height="5" rx="1" fill="#d0d0d0" {...o} strokeWidth={0.7} />
      </Bust>
    ),
  },
  // rallies the block: locs, megaphone
  Organizer: {
    bg: "#ff9a8a",
    draw: () => (
      <>
        <Bust
          skin="#6b4226"
          shirt="#E03C31"
          hair={
            <>
              {[17, 21, 39, 43].map((x) => (
                <rect key={x} x={x - 1.6} y="18" width="3.2" height="24" rx="1.6" fill="#1a1a1a" />
              ))}
              <path d="M19 26 Q18 12 30 12 Q42 12 41 26 Q39 17 30 17 Q21 17 19 26 Z" fill="#1a1a1a" />
            </>
          }
        />
        <g transform="translate(45 45) rotate(-25) scale(0.8)">
          <path d="M-6 -3 L6 -7 V7 L-6 3 Z" fill="white" {...o} strokeWidth={1.1} />
          <rect x="-9" y="-3" width="4" height="6" rx="1" fill={GOLD} {...o} strokeWidth={1} />
        </g>
      </>
    ),
  },
};

/** A church-fan portrait for a role (null for the Overlord: the Machine is faceless). */
export function RolePortrait({ role, size = 44, title }: { role: string; size?: number; title?: string }) {
  const img = ART.roles[role];
  const p = PORTRAITS[role];
  if (!img && !p) return null;
  const scallops = Array.from({ length: 18 }, (_, i) => {
    const a = (i / 18) * Math.PI * 2;
    return <circle key={i} cx={30 + 27 * Math.cos(a)} cy={30 + 27 * Math.sin(a)} r="4.2" fill={GOLD} stroke={INK} strokeWidth="1" />;
  });
  return (
    <svg viewBox="-2 -2 64 80" width={size} height={(size * 80) / 64} className="shrink-0" role="img" aria-label={title ?? t(`The ${role}`)}>
      <rect x="27" y="52" width="6" height="24" rx="2" fill="#8a5a2b" stroke={INK} strokeWidth="1.2" />
      {scallops}
      <circle cx="30" cy="30" r="27" fill={GOLD} stroke={INK} strokeWidth="1.2" />
      <clipPath id={`fan-${role}`}>
        <circle cx="30" cy="30" r="24" />
      </clipPath>
      <circle cx="30" cy="30" r="24" fill={p?.bg ?? "#ddd"} stroke={INK} strokeWidth="1.2" />
      <g clipPath={`url(#fan-${role})`}>{img ? <image href={img} x="6" y="6" width="48" height="48" preserveAspectRatio="xMidYMid slice" /> : p.draw()}</g>
    </svg>
  );
}
