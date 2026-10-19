/**
 * The connection between phones: PeerJS (WebRTC). Phones talk to each other directly; the free
 * public PeerJS server only introduces them, so there is nothing to sign up for or run.
 * Tests (and anyone self-hosting) can point at another PeerJS server with ?peer=host:port.
 */
import type { DataConnection, Peer, PeerOptions } from "peerjs";
import { ROOM_PREFIX, type ToGuest, type ToHost } from "./protocol";

function options(): PeerOptions {
  if (typeof window === "undefined") return {};
  const custom = new URLSearchParams(window.location.search).get("peer");
  if (!custom) return {};
  const [host, port] = custom.split(":");
  return { host, port: Number(port) || 443, path: "/", secure: !port || port === "443" };
}

async function makePeer(id?: string): Promise<Peer> {
  const { Peer } = await import("peerjs");
  return new Promise((resolve, reject) => {
    const peer = id ? new Peer(id, options()) : new Peer(options());
    peer.once("open", () => resolve(peer));
    peer.once("error", (e) => reject(e));
  });
}

export interface HostLink {
  peer: Peer;
  close: () => void;
}

/** open a room; `onJoin` hears each phone that connects */
export async function hostRoom(
  code: string,
  handlers: { onJoin: (conn: DataConnection) => void; onMessage: (conn: DataConnection, msg: ToHost) => void; onLeave: (conn: DataConnection) => void },
): Promise<HostLink> {
  const peer = await makePeer(ROOM_PREFIX + code);
  peer.on("connection", (conn) => {
    conn.on("open", () => handlers.onJoin(conn));
    conn.on("data", (data) => handlers.onMessage(conn, data as ToHost));
    conn.on("close", () => handlers.onLeave(conn));
    conn.on("error", () => handlers.onLeave(conn));
  });
  // the public server drops idle hosts now and then: quietly reconnect
  peer.on("disconnected", () => {
    if (!peer.destroyed) peer.reconnect();
  });
  return { peer, close: () => peer.destroy() };
}

export interface GuestLink {
  send: (msg: ToHost) => void;
  close: () => void;
}

/** join a room by its code */
export async function joinRoom(code: string, handlers: { onMessage: (msg: ToGuest) => void; onClose: () => void }): Promise<GuestLink> {
  const peer = await makePeer();
  const conn = peer.connect(ROOM_PREFIX + code, { reliable: true });
  await new Promise<void>((resolve, reject) => {
    const timer = setTimeout(() => reject(new Error("No game with that code answered.")), 12000);
    conn.once("open", () => (clearTimeout(timer), resolve()));
    peer.once("error", (e) => (clearTimeout(timer), reject(e)));
  });
  conn.on("data", (data) => handlers.onMessage(data as ToGuest));
  conn.on("close", handlers.onClose);
  return { send: (msg) => conn.send(msg), close: () => peer.destroy() };
}
