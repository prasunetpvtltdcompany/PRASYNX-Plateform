import path from "node:path";
import { fileURLToPath } from "node:url";

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);


/** @type {import('next').NextConfig} */
const nextConfig = {
  turbopack: {
    root: __dirname,
  },
  reactStrictMode: true,
allowedDevOrigins: ['mug-assure-linking-louisville.trycloudflare.com'],
  async rewrites() {
    return [
      {
        source: "/api/workforce/:path*",
        destination: "http://localhost:4003/api/workforce/:path*",
      },
      {
        source: "/api/:path*",
        destination: "http://localhost:4002/api/:path*",
      },
    ];
  },
};

export default nextConfig;