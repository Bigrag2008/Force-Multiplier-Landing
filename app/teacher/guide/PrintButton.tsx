"use client";
import { t, useLang } from "@/i18n";

export function PrintButton() {
  useLang();
  return (
    <button className="rounded-lg bg-gold px-4 py-2 font-bold text-night" onClick={() => window.print()}>
      {t("Print the guide")}
    </button>
  );
}
