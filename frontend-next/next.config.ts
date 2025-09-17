import type { NextConfig } from "next";

const nextConfig: NextConfig = {
  /* config options here */
  // Completely disable all development indicators
  devIndicators: false,
  experimental: {
    turbo: {
      loaders: {},
    },
  },
};

export default nextConfig;
