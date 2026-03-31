import type { NextConfig } from "next";

const nextConfig: NextConfig = {
  async rewrites() {
    return [
      {
        source: '/supabase-api/:path*',
        destination: 'http://10.128.49.91:54321/:path*',
      },
    ];
  },
};

export default nextConfig;
