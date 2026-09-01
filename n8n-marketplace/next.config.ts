import type { NextConfig } from "next";

const nextConfig: NextConfig = {
  output: 'standalone',
  async redirects() {
    return [
      // Premium is not live yet — send the pricing page to the placeholder.
      { source: '/plans', destination: '/coming-soon', permanent: false },
    ];
  },
};

export default nextConfig;
