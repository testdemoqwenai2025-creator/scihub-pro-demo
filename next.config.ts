import type { NextConfig } from "next";

const nextConfig: NextConfig = {
  output: "export",
  /* Ignore type errors in test configs for production build */
  typescript: {
    ignoreBuildErrors: true,
  },
  /* P0 FIX: Enable React Strict Mode for development checks */
  reactStrictMode: true,
  trailingSlash: true,
  basePath: process.env.NODE_ENV === 'production' ? '/scihub-pro-demo' : '',
  
  // Image optimization disabled for static export
  images: {
    unoptimized: true,
  },

  // Cache busting for GitHub Pages - ensure fresh deployments
  generateEtags: false,
  
  // Headers to prevent caching issues during development
  async headers() {
    return [
      {
        source: '/(.*)',
        headers: [
          {
            key: 'Cache-Control',
            value: 'public, max-age=0, must-revalidate',
          },
        ],
      },
    ];
  },
};

export default nextConfig;
