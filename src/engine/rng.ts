/**
 * mulberry32 — a tiny deterministic RNG shared with the Python engine's parity
 * harness (scripts/shared_rng.py). The engine only needs random, choice and sample.
 */
export class Rng {
  private a = 0;
  constructor(seed = 1) {
    this.seed(seed);
  }
  seed(s: number) {
    this.a = s >>> 0;
  }
  random(): number {
    this.a = (this.a + 0x6d2b79f5) >>> 0;
    let t = this.a;
    t = Math.imul(t ^ (t >>> 15), t | 1) >>> 0;
    t = (((t + (Math.imul(t ^ (t >>> 7), t | 61) >>> 0)) >>> 0) ^ t) >>> 0;
    return ((t ^ (t >>> 14)) >>> 0) / 4294967296;
  }
  choice<T>(seq: readonly T[]): T {
    return seq[Math.floor(this.random() * seq.length)];
  }
  sample<T>(seq: readonly T[], k: number): T[] {
    const pool = [...seq];
    const out: T[] = [];
    for (let i = 0; i < k; i++) out.push(pool.splice(Math.floor(this.random() * pool.length), 1)[0]);
    return out;
  }
}
