import type { Metadata } from "next";
import Script from "next/script";
import "./globals.css";
import { LangSwitch } from "@/ui/LangSwitch";

// Links shared from the live site need its full address for the preview card. Vercel sets this one itself;
// on another host, set SITE_URL (e.g. https://thesecondnumber.org).
const SITE = process.env.SITE_URL ?? (process.env.VERCEL_PROJECT_PRODUCTION_URL ? `https://${process.env.VERCEL_PROJECT_PRODUCTION_URL}` : "http://localhost:3000");

export const metadata: Metadata = {
  metadataBase: new URL(SITE),
  title: "The Second Number — West Dayton Edition",
  description: "A cooperative game about reading the hidden cost in every deal, and teaching your whole block to read it too.",
  // browser translation rewrites the page's text behind React's back (and would scramble the decoder ink), which crashes the game on the next update
  other: { google: "notranslate" },
  openGraph: { type: "website", siteName: "The Second Number" },
  twitter: { card: "summary_large_image" },
};

/**
 * Safety net for translators and extensions that still rewrite the page: when the text React wants to move
 * or remove has already been moved, skip it instead of crashing (facebook/react#11538).
 */
const TOLERATE_REWRITTEN_TEXT = `(function(){if(typeof Node!=="function"||!Node.prototype)return;
var rm=Node.prototype.removeChild;Node.prototype.removeChild=function(c){if(c.parentNode!==this)return c;return rm.apply(this,arguments)};
var ins=Node.prototype.insertBefore;Node.prototype.insertBefore=function(n,r){if(r&&r.parentNode!==this)return n;return ins.apply(this,arguments)}})();`;

export default function RootLayout({ children }: Readonly<{ children: React.ReactNode }>) {
  return (
    <html lang="en" translate="no">
      <body className="min-h-screen antialiased">
        <Script id="tolerate-rewritten-text" strategy="beforeInteractive">
          {TOLERATE_REWRITTEN_TEXT}
        </Script>
        {children}
        <LangSwitch />
      </body>
    </html>
  );
}
