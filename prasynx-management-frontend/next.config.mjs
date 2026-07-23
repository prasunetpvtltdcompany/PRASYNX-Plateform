const nextConfig = {
  reactStrictMode: true,
  async rewrites() {
    return [
      {
        source: '/api/workforce/:path*',
        destination: 'http://localhost:4003/api/workforce/:path*',
      },
      {
        source: '/api/:path*',
        destination: 'http://localhost:4002/api/:path*',
      },
    ];
  },
};

export default nextConfig;
