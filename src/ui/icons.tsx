/**
 * One small icon per idea, used everywhere that idea shows up (board, player cards, buttons, the Coach),
 * so players learn to read the picture instead of the word.
 */
import type { ReactNode } from "react";

export type IconName =
  | "sight" | "trust" | "corruption" | "legend" | "clarity" | "pressure"
  | "clue" | "door" | "expose" | "deal" | "teach" | "commons" | "reach" | "history" | "league" | "clock";

const paths: Record<IconName, ReactNode> = {
  // an open eye: how well you read
  sight: (
    <>
      <path d="M2 12s3.6-6.5 10-6.5S22 12 22 12s-3.6 6.5-10 6.5S2 12 2 12Z" />
      <circle cx="12" cy="12" r="3.2" fill="currentColor" />
    </>
  ),
  // a heart: goodwill you spend
  trust: <path d="M12 20.5s-7.5-4.6-7.5-10.2A4.3 4.3 0 0 1 12 7.6a4.3 4.3 0 0 1 7.5 2.7c0 5.6-7.5 10.2-7.5 10.2Z" fill="currentColor" />,
  // a dark drip: the stain shortcuts leave
  corruption: <path d="M12 3c3.2 4.6 6 8 6 11.2A6 6 0 0 1 6 14.2C6 11 8.8 7.6 12 3Z" fill="currentColor" />,
  // a star: respect for lifting people
  legend: <path d="m12 3 2.7 5.6 6.1.8-4.5 4.2 1.1 6.1L12 16.8l-5.4 2.9 1.1-6.1-4.5-4.2 6.1-.8Z" fill="currentColor" />,
  // a sunrise: a district waking up
  clarity: (
    <>
      <path d="M5 17a7 7 0 0 1 14 0Z" fill="currentColor" />
      <path d="M12 3.5v3M4.2 8.2l2.1 2.1M19.8 8.2l-2.1 2.1M2.5 20.5h19" />
    </>
  ),
  // a weight pressing down on a bar: the Machine's grip
  pressure: (
    <>
      <path d="M6 3h12l-6 8Z" fill="currentColor" />
      <rect x="3" y="13" width="18" height="3.5" rx="1" fill="currentColor" />
      <path d="M5 20h14" />
    </>
  ),
  // a magnifying glass: a thread traced
  clue: (
    <>
      <circle cx="10.5" cy="10.5" r="6" />
      <path d="m15 15 6 6" />
    </>
  ),
  // a door ajar: the Underworld opening
  door: (
    <>
      <path d="M5 21V4h11v17" />
      <path d="M16 4 10 6v17l6-2" fill="currentColor" />
      <path d="M3 21h16" />
    </>
  ),
  // a spotlight beam: dragging the Owner into the light
  expose: (
    <>
      <path d="M4 5h5l2 4H6Z" fill="currentColor" />
      <path d="m8.5 9 3.5 11.5h8L13 9" />
    </>
  ),
  // a form with a signature line
  deal: (
    <>
      <path d="M6 2.5h9l4 4v15H6Z" />
      <path d="M9 9h7M9 12.5h7M9 18h4" />
    </>
  ),
  // two people, one speaking
  teach: (
    <>
      <circle cx="7.5" cy="8" r="3" />
      <path d="M2.5 20a5 5 0 0 1 10 0" />
      <path d="M15 6.5h6v5h-3l-2 2v-2h-1Z" fill="currentColor" />
    </>
  ),
  // a coffee cup: gathering on the West Side
  commons: (
    <>
      <path d="M4 9h12v6a5 5 0 0 1-5 5H9a5 5 0 0 1-5-5Z" fill="currentColor" />
      <path d="M16 11h1.5a2.5 2.5 0 0 1 0 5H16M8 3.5c0 1.5 1.5 1.5 1.5 3M12 3.5c0 1.5 1.5 1.5 1.5 3" />
    </>
  ),
  // an outstretched hand
  reach: <path d="M3 13h4l4-3c1-.7 2.3-.3 2.5.8L11 12.5h6.5a1.5 1.5 0 0 1 0 3H10M3 19h4l3 1.5h6l4.5-3" />,
  // an open book
  history: (
    <>
      <path d="M3 5c3-1 6-1 9 1v14c-3-2-6-2-9-1Z" />
      <path d="M21 5c-3-1-6-1-9 1v14c3-2 6-2 9-1Z" />
    </>
  ),
  // a pen signing
  league: <path d="m4 20 1-4L16 5l3 3L8 19ZM14 7l3 3M4 20h16" />,
  // a clock
  clock: (
    <>
      <circle cx="12" cy="12" r="8.5" />
      <path d="M12 7v5l3.5 2" />
    </>
  ),
};

export const ICON_COLOR: Partial<Record<IconName, string>> = {
  sight: "#7cc4ff",
  trust: "#ff7a90",
  corruption: "#b07cff",
  legend: "#F2B632",
  clarity: "#F2B632",
  pressure: "#E63946",
  clue: "#2F8FD8",
};

export function Icon({ name, size = 16, color, title, className = "" }: { name: IconName; size?: number; color?: string; title?: string; className?: string }) {
  return (
    <svg
      viewBox="0 0 24 24"
      width={size}
      height={size}
      fill="none"
      stroke="currentColor"
      strokeWidth={1.8}
      strokeLinecap="round"
      strokeLinejoin="round"
      className={`inline-block shrink-0 align-[-0.15em] ${className}`}
      style={{ color: color ?? ICON_COLOR[name] }}
      role={title ? "img" : undefined}
      aria-hidden={title ? undefined : true}
      aria-label={title}
    >
      {title && <title>{title}</title>}
      {paths[name]}
    </svg>
  );
}

/** A row of pips: filled up to `value`, out of `max`. Reads faster than "3/5". */
export function Pips({ value, max, color, danger }: { value: number; max: number; color: string; danger?: number }) {
  return (
    <span className="inline-flex gap-0.5 align-middle" aria-hidden>
      {Array.from({ length: max }, (_, i) => (
        <span
          key={i}
          className="inline-block h-2 w-2 rounded-full border"
          style={{ borderColor: danger !== undefined && i + 1 >= danger ? "#ff8a8a" : color, background: i < value ? color : "transparent" }}
        />
      ))}
    </span>
  );
}
