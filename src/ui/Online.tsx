"use client";
/**
 * Online play's two sides. HostGame: the device that set up the game opens a room, referees every
 * phone's move and passes it on. JoinGame: a phone joins with the room code, takes a seat, and
 * plays it. See src/net/protocol.ts for the rules of the room.
 */
import type { DataConnection } from "peerjs";
import { useCallback, useEffect, useMemo, useRef, useState } from "react";
import type { Move } from "../game/moves";
import type { Session } from "../game/session";
import { hostRoom, joinRoom, type GuestLink, type HostLink } from "../net/peer";
import { mayMove, PHONE_GONE_MS, PING_MS, seatsOf, type SeatMap, type ToGuest, type ToHost } from "../net/protocol";
import { t, useLang } from "../i18n";
import { RolePortrait } from "./art/RolePortrait";
import { GameScreen, type Net } from "./GameScreen";
import { theRole } from "./Players";
import type { GameStart } from "./useSession";

const joinUrl = (code: string) => `${window.location.origin}/join?room=${code}${window.location.search.includes("peer=") ? `&${window.location.search.slice(1).split("&").find((x) => x.startsWith("peer="))}` : ""}`;

// ---------------- the host ----------------
export function HostGame({ start, code, onQuit }: { start: GameStart; code: string; onQuit: () => void }) {
  const [status, setStatus] = useState<"opening" | "open" | "failed">("opening");
  const [error, setError] = useState("");
  /** each phone's connection id → the seat it took (null: still choosing) */
  const [phones, setPhones] = useState<Map<string, { conn: DataConnection; seat: string | null }>>(new Map());
  /** the same map, for the connection's callbacks (kept in step with every setPhones) */
  const phonesRef = useRef(phones);
  /** when each phone was last heard from: a closed phone doesn't always say goodbye */
  const lastHeard = useRef(new Map<string, number>());
  const game = useRef<{ s: Session; apply: (m: Move) => boolean } | null>(null);

  const seatMap = useCallback((): SeatMap => {
    const s = game.current?.s;
    if (!s) return {};
    const taken = new Set([...phonesRef.current.values()].map((p) => p.seat));
    return Object.fromEntries(seatsOf(s).map((name) => [name, taken.has(name) ? "phone" : "host"]));
  }, []);
  const sendState = useCallback(
    (conn: DataConnection, you: string | null) => {
      const s = game.current?.s;
      if (s) conn.send({ type: "state", config: s.config, moves: s.moves, seats: seatMap(), you } satisfies ToGuest);
    },
    [seatMap],
  );
  const tellSeats = useCallback(() => {
    for (const p of phonesRef.current.values()) p.conn.send({ type: "seats", seats: seatMap(), you: p.seat } satisfies ToGuest);
  }, [seatMap]);
  const broadcast = useCallback((m: Move) => {
    const n = game.current?.s.moves.length ?? 0;
    for (const p of phonesRef.current.values()) p.conn.send({ type: "move", m, n } satisfies ToGuest);
  }, []);

  useEffect(() => {
    let link: HostLink | null = null;
    let dead = false;
    const drop = (id: string) => {
      const next = new Map(phonesRef.current);
      next.get(id)?.conn.close();
      next.delete(id);
      lastHeard.current.delete(id);
      phonesRef.current = next;
      setPhones(next);
      tellSeats();
    };
    const sweep = setInterval(() => {
      const now = Date.now();
      // tell the phones the table is still here (they reconnect if it goes quiet)
      for (const p of phonesRef.current.values()) {
        try {
          p.conn.send({ type: "ping" } satisfies ToGuest);
        } catch {
          // that phone is on its way out
        }
      }
      for (const id of phonesRef.current.keys()) if (now - (lastHeard.current.get(id) ?? now) > PHONE_GONE_MS) drop(id);
    }, PING_MS);
    const open = () => hostRoom(code, {
      onJoin: (conn) => {
        lastHeard.current.set(conn.connectionId, Date.now());
        setPhones((old) => new Map(old).set(conn.connectionId, { conn, seat: null }));
        phonesRef.current = new Map(phonesRef.current).set(conn.connectionId, { conn, seat: null });
        sendState(conn, null);
      },
      onLeave: (conn) => {
        if (phonesRef.current.has(conn.connectionId)) drop(conn.connectionId);
      },
      onMessage: (conn, msg: ToHost) => {
        lastHeard.current.set(conn.connectionId, Date.now());
        const me = phonesRef.current.get(conn.connectionId);
        const g = game.current;
        if (!me || !g || msg.type === "ping") return;
        if (msg.type === "sync") return sendState(conn, me.seat);
        if (msg.type === "claim") {
          if (seatMap()[msg.seat] !== "host") return conn.send({ type: "refused", reason: `${msg.seat} is already taken.` } satisfies ToGuest);
          const next = new Map(phonesRef.current).set(conn.connectionId, { conn, seat: msg.seat });
          phonesRef.current = next;
          setPhones(next);
          sendState(conn, msg.seat);
          return tellSeats();
        }
        if (msg.type === "move") {
          if (!me.seat || !mayMove(g.s, msg.m, new Set([me.seat]))) return conn.send({ type: "refused", reason: "Not your move right now." } satisfies ToGuest);
          if (g.apply(msg.m)) broadcast(msg.m);
        }
      },
    });
    // a reopened room (the host reloaded) can find its code still held for a few seconds: retry
    const attempt = (tries: number): Promise<HostLink> =>
      open().catch((e: { type?: string }) => {
        if (e?.type === "unavailable-id" && tries > 0 && !dead) return new Promise<HostLink>((r) => setTimeout(() => r(attempt(tries - 1)), 2500));
        throw e;
      });
    attempt(6)
      .then((l) => {
        if (dead) return l.close();
        link = l;
        setStatus("open");
      })
      .catch((e: { type?: string; message?: string }) => {
        if (dead) return;
        setStatus("failed");
        setError(e?.type === "unavailable-id" ? "That room code is in use. Start the game again for a new one." : e?.type === "network" || e?.type === "server-error" ? "Couldn't reach the connection service. Check the internet connection." : (e?.message ?? "The room couldn't open."));
      });
    return () => {
      dead = true;
      clearInterval(sweep);
      link?.close();
    };
  }, [code, sendState, tellSeats, broadcast, seatMap]);

  const taken = useMemo(() => new Set([...phones.values()].map((p) => p.seat).filter(Boolean) as string[]), [phones]);
  const [seatNames, setSeatNames] = useState<string[]>([]);
  const net: Net = useMemo(
    () => ({
      // the host plays every seat no phone has taken
      mine: new Set(seatNames.filter((n) => !taken.has(n))),
      onApplied: broadcast,
      onReady: (s, apply) => {
        game.current = { s, apply };
        s.room = code;
        setSeatNames((old) => (old.length ? old : seatsOf(s)));
      },
      room: <RoomCard code={code} status={status} error={error} seats={seatNames} taken={taken} />,
    }),
    [seatNames, taken, broadcast, code, status, error],
  );
  return <GameScreen start={start} onQuit={onQuit} net={net} />;
}

function RoomCard({ code, status, error, seats, taken }: { code: string; status: string; error: string; seats: string[]; taken: Set<string> }) {
  useLang();
  const [open, setOpen] = useState(true);
  const url = typeof window === "undefined" ? "" : joinUrl(code);
  return (
    <section aria-label={t("Online room")} className="mb-4 rounded-xl border-2 border-[#7CFFB2]/60 bg-[#7CFFB2]/10 p-3 text-sm">
      <div className="flex items-center justify-between gap-2">
        <p className="font-black">
          📱 {status === "open" ? t("Room open") : status === "opening" ? t("Opening the room…") : t("Room closed")}{" "}
          <span className="ml-1 rounded bg-night px-2 py-0.5 font-mono text-base tracking-[0.3em] text-[#7CFFB2]" data-room-code={code}>
            {code}
          </span>
        </p>
        <button className="text-xs underline" onClick={() => setOpen(!open)}>
          {open ? t("Hide") : t("Show")}
        </button>
      </div>
      {status === "failed" && <p className="mt-1 text-[#ff9b9b]">{t(error)} {t("You can still play on this device.")}</p>}
      {open && status !== "failed" && (
        <>
          <p className="mt-1 text-program/85">
            {t("On each phone, open")} <b className="break-all">{url.replace(/^https?:\/\//, "").split("?")[0]}</b> {t("and enter")} <b>{code}</b>{t(", or share")}{" "}
            <button className="font-bold text-[#7CFFB2] underline" onClick={() => navigator.clipboard?.writeText(url)}>
              {t("the join link")}
            </button>
            . {t("Seats nobody takes are played here.")}
          </p>
          <ul className="mt-2 flex flex-wrap gap-2">
            {seats.map((n) => (
              <li key={n} className={`rounded-full px-2 py-0.5 text-xs font-bold ${taken.has(n) ? "bg-[#7CFFB2] text-night" : "bg-white/10"}`}>
                {n}: {taken.has(n) ? t("on a phone") : t("here")}
              </li>
            ))}
          </ul>
        </>
      )}
    </section>
  );
}

// ---------------- a phone ----------------
type JoinState =
  | { k: "enter"; error?: string }
  | { k: "connecting" }
  | { k: "seat"; seats: SeatMap; names: Record<string, string> }
  | { k: "playing"; start: GameStart; you: string; key: number; names: Record<string, string> }
  | { k: "lost" };

export function JoinGame({ initialCode }: { initialCode: string }) {
  useLang();
  const [code, setCode] = useState(initialCode);
  const [state, setState] = useState<JoinState>({ k: "enter" });
  const link = useRef<GuestLink | null>(null);
  const applyRef = useRef<((m: Move) => boolean) | null>(null);
  const sessionRef = useRef<Session | null>(null);
  const queue = useRef<{ m: Move; n: number }[]>([]);
  /** the seat this phone had, to take back after a dropped connection */
  const lastSeat = useRef<string | null>(null);
  const retries = useRef(0);
  /** when the host was last heard from */
  const heardHost = useRef(0);
  /** connect(), for its own retry timers */
  const connectRef = useRef<((room: string, auto?: boolean) => Promise<void>) | null>(null);
  /** the room this phone is in, for reconnecting */
  const roomRef = useRef<string | null>(null);

  const take = useCallback((m: Move, n: number) => {
    const s = sessionRef.current;
    const apply = applyRef.current;
    if (!s || !apply) return void queue.current.push({ m, n });
    if (n <= s.moves.length) return; // already have it
    if (n !== s.moves.length + 1 || !apply(m)) link.current?.send({ type: "sync" }); // out of step: ask for the whole game
  }, []);

  const connect = useCallback(
    async (room: string, auto = false) => {
      if (!auto) setState({ k: "connecting" });
      roomRef.current = room;
      try {
        link.current?.close();
        heardHost.current = Date.now();
        // onClose can only fire once joinRoom has resolved, so thisLink is set by then
        const thisLink: GuestLink = await joinRoom(room, {
          onClose: () => {
            if (link.current !== thisLink) return; // an older connection, already replaced
            setState({ k: "lost" });
            // the host may be reloading: try again for about half a minute
            const again = () => {
              if (retries.current++ < 10) setTimeout(() => connectRef.current?.(room, true), 3000);
            };
            again();
          },
          onMessage: (msg: ToGuest) => {
            heardHost.current = Date.now();
            if (msg.type === "ping") return;
            if (msg.type === "move") return take(msg.m, msg.n);
            if (msg.type === "refused") return console.warn(msg.reason);
            if (msg.type === "state") {
              retries.current = 0;
              const names: Record<string, string> = Object.fromEntries(msg.config.roster.map((r) => [r.name, r.role]));
              if (msg.config.mode === "overlord") names["The Owner"] = "Overlord";
              // back after a dropped connection: take the same seat again
              if (!msg.you && lastSeat.current && msg.seats[lastSeat.current] === "host") return link.current?.send({ type: "claim", seat: lastSeat.current });
              if (msg.you) {
                lastSeat.current = msg.you;
                applyRef.current = null;
                sessionRef.current = null;
                queue.current = [];
                return setState((old) => ({ k: "playing", start: { config: msg.config, moves: msg.moves }, you: msg.you!, key: (old.k === "playing" ? old.key : 0) + 1, names }));
              }
              return setState({ k: "seat", seats: msg.seats, names });
            }
            if (msg.type === "seats") setState((old) => (old.k === "seat" ? { ...old, seats: msg.seats } : old));
          },
        });
        link.current = thisLink;
      } catch (e) {
        if (auto) {
          if (retries.current++ < 10) setTimeout(() => connectRef.current?.(room, true), 3000);
          return;
        }
        setState({ k: "enter", error: (e as Error)?.message?.includes("answered") ? t("No game is open with the code {room}. Check the code on the host's screen.", { room }) : t("Couldn't connect. Check the internet connection and the code.") });
      }
    },
    [take],
  );
  useEffect(() => {
    connectRef.current = connect;
  }, [connect]);
  useEffect(() => () => link.current?.close(), []);
  // check in with the host while connected, so it knows this phone is still here
  useEffect(() => {
    const t = setInterval(() => {
      if (!link.current) return;
      try {
        link.current.send({ type: "ping" });
      } catch {
        // not connected right now
      }
      // the host went quiet (it reloaded, or the table device slept): drop this link and reconnect
      if (Date.now() - heardHost.current > PHONE_GONE_MS) {
        const old = link.current;
        link.current = null;
        old.close();
        setState({ k: "lost" });
        retries.current = 0;
        const room = roomRef.current;
        if (room) setTimeout(() => connectRef.current?.(room, true), 1000);
      }
    }, PING_MS);
    return () => clearInterval(t);
  }, []);
  const send = useCallback((m: Move) => link.current?.send({ type: "move", m }), []);
  const onReady = useCallback(
    (s: Session, apply: (m: Move) => boolean) => {
      sessionRef.current = s;
      applyRef.current = apply;
      const waiting = queue.current;
      queue.current = [];
      for (const q of waiting) take(q.m, q.n);
    },
    [take],
  );
  const leave = useCallback(() => {
    link.current?.close();
    setState({ k: "enter" });
  }, []);

  const net: Net | null = useMemo(
    () =>
      state.k === "playing"
        ? {
            mine: new Set([state.you]),
            send,
            autosave: false,
            onReady,
            room: (
              <p className="mb-3 flex items-center gap-2 rounded-lg border border-[#7CFFB2]/50 bg-[#7CFFB2]/10 p-2 text-sm">
                <RolePortrait role={state.names[state.you] ?? ""} size={28} />
                <span>
                  📱 {t("Room")} <b className="font-mono tracking-widest">{code}</b> · {t("you're")} <b>{state.you}</b>
                </span>
              </p>
            ),
          }
        : null,
    [state, code, send, onReady],
  );

  // net's callbacks read the connection refs when they run (effects, taps), never during render
  // eslint-disable-next-line react-hooks/refs
  if (state.k === "playing" && net) return <GameScreen key={state.key} start={state.start} net={net} onQuit={leave} />;

  return (
    <main className="mx-auto max-w-md px-4 py-10">
      <h1 className="text-3xl font-black text-gold">{t("Join a game")}</h1>
      {(state.k === "enter" || state.k === "connecting") && (
        <form
          className="mt-6 space-y-3"
          onSubmit={(e) => {
            e.preventDefault();
            if (code.length === 4) connect(code);
          }}
        >
          <label htmlFor="room" className="block font-bold">
            {t("Room code")} <span className="text-sm font-normal text-program/70">{t("(on the host's screen)")}</span>
          </label>
          <input
            id="room"
            inputMode="text"
            autoCapitalize="characters"
            autoComplete="off"
            className="w-full rounded-xl border border-white/25 bg-white/10 px-4 py-3 text-center font-mono text-3xl tracking-[0.5em] uppercase"
            value={code}
            maxLength={4}
            onChange={(e) => setCode(e.target.value.toUpperCase().replace(/[^A-Z]/g, ""))}
          />
          {state.k === "enter" && state.error && <p className="text-sm text-[#ff9b9b]">{t(state.error)}</p>}
          <button type="submit" disabled={code.length !== 4 || state.k === "connecting"} className="w-full rounded-xl bg-gold px-4 py-3 text-lg font-black text-night disabled:opacity-50">
            {state.k === "connecting" ? t("Connecting…") : t("Join")}
          </button>
        </form>
      )}
      {state.k === "seat" && (
        <section className="mt-6">
          <h2 className="text-lg font-black">{t("Which seat is yours?")}</h2>
          <div className="mt-3 grid gap-2">
            {Object.entries(state.seats).map(([name, where]) => (
              <button key={name} disabled={where !== "host"} onClick={() => link.current?.send({ type: "claim", seat: name })} className="flex items-center gap-3 rounded-xl border border-white/20 px-3 py-2 text-left font-bold disabled:opacity-40">
                <RolePortrait role={state.names[name] ?? ""} size={34} />
                <span>
                  {name} <span className="block text-xs font-normal text-program/70">{theRole(state.names[name])}{where !== "host" ? ` · ${t("taken")}` : ""}</span>
                </span>
              </button>
            ))}
          </div>
        </section>
      )}
      {state.k === "lost" && (
        <section className="mt-6 space-y-3">
          <p>{t("Lost the connection to the host. Trying to reconnect…")}</p>
          <button className="w-full rounded-xl bg-gold px-4 py-3 font-black text-night" onClick={() => connect(code)}>
            {t("Rejoin {code}", { code })}
          </button>
        </section>
      )}
    </main>
  );
}
