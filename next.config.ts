import type { NextConfig } from "next";

const nextConfig: NextConfig = {
  // The game lives in its own folder of a larger repo; keep Next's file tracing here.
  outputFileTracingRoot: __dirname,
  // STATIC_EXPORT=1 writes the whole site to out/ as plain files, for hosts that serve files only (Cloudflare Pages)
  ...(process.env.STATIC_EXPORT ? { output: "export" as const, trailingSlash: true } : {}),
};

export default nextConfig;
