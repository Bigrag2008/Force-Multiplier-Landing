import type { Metadata } from "next";
import "./globals.css";

export const metadata: Metadata = {
  title: "The Second Number — West Dayton Edition",
  description: "A cooperative game about reading the hidden cost in every deal, and teaching your whole block to read it too.",
};

export default function RootLayout({ children }: Readonly<{ children: React.ReactNode }>) {
  return (
    <html lang="en">
      <body className="min-h-screen antialiased">{children}</body>
    </html>
  );
}
