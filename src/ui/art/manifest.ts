/**
 * Commissioned art drops in here. Put the files in public/art/ and add their paths, e.g.
 *   districts: { LENDING: "/art/districts/lending.webp" },
 *   roles: { Elder: "/art/roles/elder.webp" },
 * Anything left out keeps the drawn placeholder. Sizes and style: game/ART_BRIEF.md.
 */
import type { District } from "../../engine/content";

export const ART: { districts: Partial<Record<District, string>>; roles: Partial<Record<string, string>> } = {
  districts: {},
  roles: {},
};
