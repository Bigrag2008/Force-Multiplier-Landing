// Copies the printable PDFs from game/ into public/ so the website serves them (run before every build).
import { copyFileSync, mkdirSync, readdirSync } from "node:fs";

mkdirSync("public", { recursive: true });
for (const f of readdirSync("game")) if (f.endsWith(".pdf")) copyFileSync(`game/${f}`, `public/${f}`);
