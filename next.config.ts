import type { NextConfig } from "next";

const nextConfig: NextConfig = {
  output: "standalone",
  outputFileTracingRoot: process.cwd(),
  poweredByHeader: false,
  reactStrictMode: true,
  async headers() {
    return [{
      source: "/p/:path*",
      headers: [
        { key: "X-Robots-Tag", value: "noindex, nofollow, noarchive, noimageindex" },
        { key: "Referrer-Policy", value: "strict-origin-when-cross-origin" },
        { key: "Cache-Control", value: "private, no-store" },
      ],
    }];
  },
};

export default nextConfig;
