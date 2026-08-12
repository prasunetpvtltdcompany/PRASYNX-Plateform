import type { NextConfig } from "next";

const API_URL = process.env.API_BASE_URL ?? "http://localhost:4000";

const nextConfig: NextConfig = {
  reactStrictMode: true,
  transpilePackages: [
    "@prasynx/types",
    "@prasynx/validation",
    "@prasynx/config",
  ],
  async rewrites() {
    return [
      {
        source: "/api/v1/:path*",
        destination: `${API_URL}/api/v1/:path*`,
      },
      {
        source: "/api/:path*",
        destination: `${API_URL}/api/:path*`,
      },
    ];
  },
};

export default nextConfig;