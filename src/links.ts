/**
 * Where the game sends people next: the Civic Armor hub (hub/ in this repo, live at getcivicarmor.com) and its
 * pages for the novel and The Third Option. One place to change them; NEXT_PUBLIC_HUB_URL overrides the address
 * when the site is built (e.g. while the hub is still on a preview link).
 */
export const HUB_URL = (process.env.NEXT_PUBLIC_HUB_URL ?? "https://getcivicarmor.com").replace(/\/+$/, "");

export const LINKS = {
  hub: HUB_URL,
  /** The Second Number, Book One: the novel the game comes from */
  novel: `${HUB_URL}/book/`,
  /** The Third Option: the Civic Armor guide for reading your own job */
  guide: `${HUB_URL}/third-option/`,
  /** the email list: new chapters, the box, the course */
  list: `${HUB_URL}/#list`,
} as const;
