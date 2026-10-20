/**
 * The game's sounds, made in the browser with the Web Audio API: no audio files, nothing to license,
 * nothing to download. Every sound is a few oscillators or a burst of filtered noise with an envelope.
 * Off with the mute button (remembered on this device). Browsers only allow sound after a tap or a
 * key press, which every game action is, so the audio context starts on the first one.
 */
const KEY = "sn-sound";
let ctx: AudioContext | null = null;
let master: GainNode | null = null;

export function soundOn(): boolean {
  try {
    return window.localStorage.getItem(KEY) !== "off";
  } catch {
    return true;
  }
}
export function setSoundOn(on: boolean) {
  try {
    window.localStorage.setItem(KEY, on ? "on" : "off");
  } catch {
    // no storage: the setting lasts this visit
  }
  if (master) master.gain.value = on ? 0.5 : 0;
}

function audio(): AudioContext | null {
  if (typeof window === "undefined" || !soundOn()) return null;
  try {
    if (!ctx) {
      const AC = window.AudioContext ?? (window as unknown as { webkitAudioContext?: typeof AudioContext }).webkitAudioContext;
      if (!AC) return null;
      ctx = new AC();
      master = ctx.createGain();
      master.gain.value = 0.5;
      master.connect(ctx.destination);
    }
    if (ctx.state === "suspended") void ctx.resume();
    return ctx;
  } catch {
    return null;
  }
}

/** one tone with a quick attack and an exponential fall */
function tone(freq: number, at: number, dur: number, opts: { type?: OscillatorType; vol?: number; to?: number } = {}) {
  const a = audio();
  if (!a || !master) return;
  const t = a.currentTime + at;
  const o = a.createOscillator();
  const g = a.createGain();
  o.type = opts.type ?? "sine";
  o.frequency.setValueAtTime(freq, t);
  if (opts.to) o.frequency.exponentialRampToValueAtTime(opts.to, t + dur);
  g.gain.setValueAtTime(0.0001, t);
  g.gain.exponentialRampToValueAtTime(opts.vol ?? 0.3, t + 0.012);
  g.gain.exponentialRampToValueAtTime(0.0001, t + dur);
  o.connect(g).connect(master);
  o.start(t);
  o.stop(t + dur + 0.05);
}

/** a burst of filtered noise: paper, a stamp, a drawer */
function noise(at: number, dur: number, opts: { freq?: number; q?: number; vol?: number; type?: BiquadFilterType } = {}) {
  const a = audio();
  if (!a || !master) return;
  const t = a.currentTime + at;
  const buf = a.createBuffer(1, Math.ceil(a.sampleRate * dur), a.sampleRate);
  const data = buf.getChannelData(0);
  for (let i = 0; i < data.length; i++) data[i] = (Math.random() * 2 - 1) * (1 - i / data.length);
  const src = a.createBufferSource();
  src.buffer = buf;
  const f = a.createBiquadFilter();
  f.type = opts.type ?? "lowpass";
  f.frequency.value = opts.freq ?? 900;
  f.Q.value = opts.q ?? 0.8;
  const g = a.createGain();
  g.gain.setValueAtTime(opts.vol ?? 0.5, t);
  g.gain.exponentialRampToValueAtTime(0.0001, t + dur);
  src.connect(f).connect(g).connect(master);
  src.start(t);
}

export const sounds = {
  /** a rubber stamp on a contract: the verdict lands */
  stamp(at = 0) {
    noise(at, 0.12, { freq: 500, vol: 0.9 });
    tone(110, at, 0.16, { type: "triangle", vol: 0.45, to: 60 });
  },
  /** a good read: defused, exposed, talked them down */
  good(at = 0) {
    tone(659, at, 0.18, { type: "triangle", vol: 0.22 });
    tone(988, at + 0.08, 0.3, { type: "triangle", vol: 0.2 });
  },
  /** real help: a warm major chord */
  help(at = 0) {
    for (const [i, f] of [523, 659, 784].entries()) tone(f, at + i * 0.04, 0.45, { type: "sine", vol: 0.14 });
  },
  /** got played, conned, backfired: a low buzz */
  bad(at = 0) {
    tone(140, at, 0.32, { type: "sawtooth", vol: 0.12, to: 95 });
    tone(147, at, 0.32, { type: "square", vol: 0.05, to: 98 });
  },
  /** the shortcut: a sly slide down */
  shady(at = 0) {
    tone(440, at, 0.35, { type: "triangle", vol: 0.16, to: 220 });
  },
  /** walked away: a soft paper shuffle */
  paper(at = 0) {
    noise(at, 0.18, { freq: 2600, type: "bandpass", q: 0.7, vol: 0.25 });
  },
  /** a Machine strike: a low hit */
  strike(at = 0) {
    tone(85, at, 0.22, { type: "sine", vol: 0.5, to: 45 });
    noise(at, 0.08, { freq: 300, vol: 0.35 });
  },
  /** a district wakes: the porch lights come on (a rising arpeggio) */
  wake(at = 0) {
    for (const [i, f] of [392, 494, 587, 784].entries()) tone(f, at + i * 0.09, 0.5, { type: "triangle", vol: 0.15 });
  },
  /** a capture, a Fall, the lights going out: a falling minor line */
  loss(at = 0) {
    for (const [i, f] of [392, 311, 262, 196].entries()) tone(f, at + i * 0.14, 0.55, { type: "sine", vol: 0.16 });
  },
  /** the block wins */
  win(at = 0) {
    for (const [i, f] of [523, 659, 784, 1047].entries()) tone(f, at + i * 0.1, 0.7, { type: "triangle", vol: 0.16 });
  },
  /** a sign-now clock: tick, sharper near zero */
  tick(urgent: boolean) {
    tone(urgent ? 1500 : 1100, 0, 0.04, { type: "square", vol: urgent ? 0.09 : 0.05 });
  },
  /** the dollar count adds up: a cash register's bell and drawer */
  register(at = 0) {
    noise(at, 0.09, { freq: 3000, type: "highpass", vol: 0.25 });
    tone(2093, at + 0.1, 0.6, { type: "sine", vol: 0.16 });
    tone(2637, at + 0.1, 0.6, { type: "sine", vol: 0.1 });
    noise(at + 0.25, 0.22, { freq: 700, vol: 0.4 });
  },
};
