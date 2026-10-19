import Link from "next/link";
import { C, DISTRICTS } from "@/engine/content";
import { DistrictArt } from "@/ui/art/DistrictArt";
import { RolePortrait } from "@/ui/art/RolePortrait";
import { titleCase } from "@/ui/theme";

export const metadata = { title: "Art sheet — The Second Number" };

/**
 * Every drawn placeholder at full size: a reference for illustrators (game/ART_BRIEF.md) and the
 * source scripts/render_art.mjs captures for the print-and-play kit.
 */
export default function ArtSheet() {
  return (
    <main className="mx-auto max-w-5xl px-4 py-10">
      <Link href="/" className="text-sm text-gold underline">← The Second Number</Link>
      <h1 className="mt-4 text-4xl font-black text-gold">Art sheet</h1>
      <p className="mt-2 max-w-2xl text-program/85">
        The drawn placeholders for the five districts and the five roles. Commissioned art replaces them; see the brief in <code>game/ART_BRIEF.md</code>.
      </p>
      <h2 className="mt-8 text-2xl font-black text-gold">Districts</h2>
      <div className="mt-3 grid gap-6">
        {DISTRICTS.map((d) => (
          <figure key={d}>
            <div data-art={`district-${d.toLowerCase()}`} className="aspect-[20/7] w-full overflow-hidden rounded-lg border-4" style={{ borderColor: C.districtColors[d] }}>
              <DistrictArt d={d} />
            </div>
            <figcaption className="mt-1 text-sm">
              <b>{titleCase(d)}</b> · {C.dayton[d].sub}. <span className="text-program/70">{C.dayton[d].flavor}</span>
            </figcaption>
          </figure>
        ))}
      </div>
      <h2 className="mt-10 text-2xl font-black text-gold">Roles, as church fans</h2>
      <div className="mt-3 grid grid-cols-2 gap-6 sm:grid-cols-3 lg:grid-cols-5">
        {Object.keys(C.roles).map((role) => (
          <figure key={role} className="text-center">
            <div data-art={`role-${role.toLowerCase()}`} className="inline-block">
              <RolePortrait role={role} size={160} />
            </div>
            <figcaption className="mt-1 text-sm font-bold">The {role}</figcaption>
          </figure>
        ))}
      </div>
    </main>
  );
}
