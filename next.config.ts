import type { NextConfig } from "next";

const nextConfig: NextConfig = {
  output: "export",
  /* config options here */
  typescript: {
    ignoreBuildErrors: true,
  },
  reactStrictMode: false,
  
  // GitHub Pages requires trailing slashes for SPA-like behavior
  trailingSlash: true,
  
  // Base path for GitHub Pages (update with your repo name)
  basePath: process.env.NODE_ENV === 'production' ? '/scihub-pro-demo' : '',
  
  // Disable image optimization for static export
  images: {
    unoptimized: true,
  },
};

export default nextConfig;
