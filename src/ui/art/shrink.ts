/**
 * Make a picture small enough to live inside a Your City edition: crop it to the board's 5:2 strip,
 * scale it to 800 × 320, and save it as WebP (JPEG where the browser can't), stepping the quality
 * down until it fits under MAX_ART. Nothing leaves the device.
 */
import { MAX_ART } from "../../engine/edition";

export const ART_W = 800;
export const ART_H = 320;

export async function shrinkPicture(file: File): Promise<string> {
  if (!file.type.startsWith("image/")) throw new Error("That file isn't a picture.");
  const img = await loadImage(file);
  const canvas = document.createElement("canvas");
  canvas.width = ART_W;
  canvas.height = ART_H;
  const ctx = canvas.getContext("2d");
  if (!ctx) throw new Error("This browser can't resize pictures.");
  // cover: fill the strip, crop what's left over, centered
  const scale = Math.max(ART_W / img.width, ART_H / img.height);
  const w = img.width * scale;
  const h = img.height * scale;
  ctx.drawImage(img, (ART_W - w) / 2, (ART_H - h) / 2, w, h);
  for (const q of [0.8, 0.7, 0.6, 0.5, 0.4]) {
    let url = canvas.toDataURL("image/webp", q);
    if (!url.startsWith("data:image/webp")) url = canvas.toDataURL("image/jpeg", q);
    if (url.length <= MAX_ART) return url;
  }
  throw new Error("That picture is too detailed to fit. Try a simpler one.");
}

function loadImage(file: File): Promise<HTMLImageElement> {
  return new Promise((resolve, reject) => {
    const url = URL.createObjectURL(file);
    const img = new Image();
    img.onload = () => (URL.revokeObjectURL(url), resolve(img));
    img.onerror = () => (URL.revokeObjectURL(url), reject(new Error("That picture couldn't be opened.")));
    img.src = url;
  });
}
