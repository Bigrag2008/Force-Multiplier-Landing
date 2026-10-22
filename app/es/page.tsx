"use client";
import Link from "next/link";
import { useEffect } from "react";
import { setLang } from "@/i18n";

/**
 * play.getcivicarmor.com/es: the game in Spanish, at an address with no "?" in it (getcivicarmor.com/juega
 * forwards here; Cloudflare's short-address rules don't carry a query string). Sets Spanish on this device,
 * then opens the home page.
 */
export default function Spanish() {
  useEffect(() => {
    setLang("es");
    window.location.replace("/");
  }, []);
  return (
    <main className="mx-auto max-w-xl px-4 py-16 text-center">
      <p className="text-lg">
        <Link className="text-gold underline" href="/?lang=es">The Second Number, en español →</Link>
      </p>
    </main>
  );
}
