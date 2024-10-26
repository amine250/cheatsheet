import type { NextConfig } from "next";

const nextConfig: NextConfig = {
  reactStrictMode: true,
  output: 'export',
  images: {
    unoptimized: true,
  },
  basePath: '/cheatsheet',
  assetPrefix: '/cheatsheet/',
};

export default nextConfig;
