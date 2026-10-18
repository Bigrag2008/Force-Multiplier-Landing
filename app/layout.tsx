import type { Metadata } from "next";
import Script from "next/script";
import "./globals.css";

export const metadata: Metadata = {
  title: "The Second Number — West Dayton Edition",
  description: "A cooperative game about reading the hidden cost in every deal, and teaching your whole block to read it too.",
  // browser translation rewrites the page's text behind React's back (and would scramble the decoder ink), which crashes the game on the next update
  other: { google: "notranslate" },
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
      </body>
    </html>
  );
}
