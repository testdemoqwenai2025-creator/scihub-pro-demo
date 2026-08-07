import type { NextConfig } from "next";

const nextConfig: NextConfig = {
  output: "export",
  /* config options here */
  typescript: {
    ignoreBuildErrors: true,
  },
  reactStrictMode: false,
  trailingSlash: true,
  basePath: process.env.NODE_ENV === 'production' ? '/scihub-pro-demo' : '',
  
  // Image optimization disabled for static export
  images: {
    unoptimized: true,
  },
};

export default nextConfig;
