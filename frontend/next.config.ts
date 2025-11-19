import type { NextConfig } from "next";

const nextConfig: NextConfig = {
  /* config options here */
  // Completely disable all development indicators
  devIndicators: false,

  // Disable strict build checks
  eslint: {
    ignoreDuringBuilds: true,
  },
  typescript: {
    ignoreBuildErrors: true,
  },

  // Add webpack config for MapBox GL CSS and externals
  webpack: (config, { isServer }) => {
    // Externalize MapBox GL for server-side rendering
    if (isServer) {
      config.externals = [...(config.externals || []), "mapbox-gl"];
    }

    return config;
  },

  // Add environment variables
  env: {
    NEXT_PUBLIC_MAPBOX_ACCESS_TOKEN:
      process.env.NEXT_PUBLIC_MAPBOX_ACCESS_TOKEN,
    NEXT_PUBLIC_MAPBOX_TOKEN: process.env.NEXT_PUBLIC_MAPBOX_TOKEN,
    NEXT_PUBLIC_API_URL: process.env.NEXT_PUBLIC_API_URL,
  },

  // Transpile packages that might have issues
  transpilePackages: ["react-map-gl", "mapbox-gl"],
};

export default nextConfig;
