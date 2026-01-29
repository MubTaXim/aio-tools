import type { NextConfig } from "next";

const nextConfig: NextConfig = {
  // Enable static export for GitHub Pages
  output: "export",
  
  // Disable image optimization (not supported in static export)
  images: {
    unoptimized: true,
  },
  
  // Uncomment and set to your repo name when deploying to GitHub Pages
  basePath: "/aio-tools",
};

export default nextConfig;
