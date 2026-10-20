"use client";

export function PrintButton() {
  return (
    <button className="rounded-lg bg-gold px-4 py-2 font-bold text-night" onClick={() => window.print()}>
      Print the guide
    </button>
  );
}
