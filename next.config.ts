import type { NextConfig } from "next";
import path from "path";

const nextConfig: NextConfig = {
  // Next.js was auto-detecting the workspace root as C:\Users\khush because
  // a stray package-lock.json exists there too, several levels above this
  // project — pin it explicitly so Turbopack resolves modules from here.
  turbopack: {
    root: path.join(__dirname),
  },
};

export default nextConfig;
