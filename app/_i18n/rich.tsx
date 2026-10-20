import { Fragment, type ReactNode } from "react";

/**
 * A translated sentence with a little markup kept inside it, so the words can move around in Spanish:
 * <b>…</b>, <i>…</i> and <code>…</code> become those elements, and any other <name>…</name> is drawn by
 * parts[name] (a link, a colored word). No nesting.
 *   rich(t("Read <b>game/YOUR_CITY.md</b> first"))
 *   rich(t("Have a real one? <a>Read your own deal</a>."), { a: (c) => <Link href="/my-deal">{c}</Link> })
 */
export function rich(s: string, parts: Record<string, (children: ReactNode) => ReactNode> = {}): ReactNode {
  const out: ReactNode[] = [];
  const re = /<(\w+)>([\s\S]*?)<\/\1>/g;
  let last = 0;
  let m: RegExpExecArray | null;
  let i = 0;
  while ((m = re.exec(s))) {
    if (m.index > last) out.push(s.slice(last, m.index));
    const [, tag, inner] = m;
    const el = parts[tag] ? parts[tag](inner) : tag === "b" ? <b>{inner}</b> : tag === "i" ? <i>{inner}</i> : tag === "code" ? <code>{inner}</code> : inner;
    out.push(<Fragment key={i++}>{el}</Fragment>);
    last = m.index + m[0].length;
  }
  if (last < s.length) out.push(s.slice(last));
  return <>{out}</>;
}
