import type { NextConfig } from "next";

const nextConfig: NextConfig = {
  /* config options here */
  images: {
    remotePatterns: [
      {
        protocol: 'https',
        hostname: 'cards.scryfall.io',
        port: '',
      },
      {
        protocol: 'https',
        hostname: 'svgs.scryfall.io',
        port: '',
      }
    ]
  }
};

export default nextConfig;
