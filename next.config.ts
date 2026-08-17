import type { NextConfig } from "next";

const nextConfig: NextConfig = {
  reactCompiler: true,
  images: {
    remotePatterns: [
      // live landing-page screenshots for case-study previews
      { protocol: "https", hostname: "api.microlink.io" },
    ],
  },
};

export default nextConfig;
