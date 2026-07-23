const nextConfig = {
  reactStrictMode: true,
  async rewrites() {
    return [
      // WOS endpoints (teacher + staff workforce operating system) — uses dual-auth
      {
        source: '/api/wos/:path*',
        destination: 'http://localhost:4002/api/wos/:path*',
      },
      // AI Teaching routes
      {
        source: '/api/v2/ai-teaching/:path*',
        destination: 'http://localhost:4002/api/v2/ai-teaching/:path*',
      },
      // Management backend routes (management-admin only features) — also accessible from staff
      {
        source: '/api/management/:path*',
        destination: 'http://localhost:4002/api/management/:path*',
      },
      // Staff backend routes (legacy staff routes: attendance, grades, classes, etc.)
      {
        source: '/api/:path*',
        destination: 'http://localhost:4003/api/:path*',
      },
    ];
  },
};

export default nextConfig;

