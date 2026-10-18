"use client";
import Link from "next/link";

/** Shown instead of a blank "Application error" page, with the real message so it can be reported. */
export default function GameError({ error, reset }: { error: Error & { digest?: string }; reset: () => void }) {
  return (
    <main className="mx-auto max-w-xl space-y-4 px-4 py-12">
      <h1 className="text-3xl font-black text-gold">Something broke at the table</h1>
      <p className="text-program/90">Sorry about that. Take a screenshot of this box and send it along, then try again.</p>
      <pre className="whitespace-pre-wrap break-words rounded-lg border border-[#ff9b9b]/50 bg-black/40 p-3 font-mono text-xs text-[#ff9b9b]">
        {error.name}: {error.message}
        {error.digest ? `\ndigest ${error.digest}` : ""}
        {error.stack ? `\n\n${error.stack.split("\n").slice(0, 6).join("\n")}` : ""}
        {typeof navigator !== "undefined" ? `\n\n${navigator.userAgent}` : ""}
      </pre>
      <div className="flex flex-wrap gap-3">
        <button className="rounded-xl bg-gold px-5 py-2 font-black text-night" onClick={reset}>
          Try again
        </button>
        <Link href="/" className="rounded-xl border border-gold/60 px-5 py-2 font-bold text-gold">
          Home
        </Link>
      </div>
    </main>
  );
}
