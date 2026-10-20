import { ImageResponse } from "next/og";

// The card a shared link shows (a text, a group chat, an email to a teacher). Rendered once at build time.
export const alt = "The Second Number: a cooperative game about the hidden cost in every deal";
export const size = { width: 1200, height: 630 };
export const contentType = "image/png";

const DISTRICTS = ["#1E9E78", "#E03C31", "#1F7AE0", "#8E3BB8", "#F28C1B"];

export default function OpenGraphImage() {
  return new ImageResponse(
    (
      <div style={{ width: "100%", height: "100%", display: "flex", flexDirection: "column", justifyContent: "center", padding: "0 90px", background: "#1B1530", color: "#F6EEDC" }}>
        <div style={{ display: "flex", gap: 14, marginBottom: 36 }}>
          {DISTRICTS.map((c) => (
            <div key={c} style={{ width: 70, height: 14, borderRadius: 7, background: c }} />
          ))}
        </div>
        <div style={{ fontSize: 96, fontWeight: 900, color: "#F2B632", lineHeight: 1 }}>The Second Number</div>
        <div style={{ fontSize: 40, marginTop: 28, maxWidth: 980, lineHeight: 1.25 }}>
          A cooperative game about the hidden cost in every deal. Read the machine. Wake the block.
        </div>
        <div style={{ fontSize: 28, marginTop: 40, color: "#E63946", fontWeight: 700 }}>Free to play in the browser · 1–5 players · classrooms welcome</div>
      </div>
    ),
    size,
  );
}
