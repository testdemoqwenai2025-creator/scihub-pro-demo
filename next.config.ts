import type { NextConfig } from "next";

const nextConfig: NextConfig = {
  output: "export",
  /* P0 FIX: Enable strict type checking - catch errors at build time */
  typescript: {
    ignoreBuildErrors: false,
  },
  /* P0 FIX: Enable React Strict Mode for development checks */
  reactStrictMode: true,
  trailingSlash: true,
  basePath: process.env.NODE_ENV === 'production' ? '/scihub-pro-demo' : '',
  
  // Image optimization disabled for static export
  images: {
    unoptimized: true,
  },
};

export default nextConfig;
