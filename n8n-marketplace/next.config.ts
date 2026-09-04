import type { NextConfig } from "next";

const nextConfig: NextConfig = {
  output: "standalone",
  // PostHog: reverse-proxy the ingestion + asset endpoints through our own
  // origin so ad-blockers don't drop analytics. Paths are also disallowed in
  // robots.ts.
  skipTrailingSlashRedirect: true,
  async rewrites() {
    return [
      {
        source: "/ingest/static/:path*",
        destination: "https://us-assets.i.posthog.com/static/:path*",
      },
      {
        source: "/ingest/:path*",
        destination: "https://us.i.posthog.com/:path*",
      },
    ];
  },
  async redirects() {
    return [
      // Premium is not live yet — send the pricing page to the placeholder.
      { source: "/plans", destination: "/coming-soon", permanent: false },
    ];
  },
};

export default nextConfig;
