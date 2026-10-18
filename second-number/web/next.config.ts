import type { NextConfig } from "next";

const nextConfig: NextConfig = {
  // The game lives in its own folder of a larger repo; keep Next's file tracing here.
  outputFileTracingRoot: __dirname,
};

export default nextConfig;
