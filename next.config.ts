import type { NextConfig } from "next";

const nextConfig: NextConfig = {
  async redirects() {
    return [
      {
        source: '/',
        destination: '/home',
        permanent: true, 
      },
      {
        source: '/login',
        destination: '/home',
        permanent: true,
      },
    ];
  },
};

export default nextConfig;
