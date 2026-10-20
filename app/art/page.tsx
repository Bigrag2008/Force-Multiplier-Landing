import { ArtSheet } from "./ArtSheet";

export const metadata = { title: "Art sheet — The Second Number" };

/**
 * Every drawn placeholder at full size: a reference for illustrators (game/ART_BRIEF.md) and the
 * source scripts/render_art.mjs captures for the print-and-play kit. The words are in ArtSheet.tsx.
 */
export default function Page() {
  return <ArtSheet />;
}
