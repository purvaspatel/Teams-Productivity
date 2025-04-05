import type { NextConfig } from "next";

const nextConfig: NextConfig = {
  /* config options here */
  images: {
    domains: ['lh3.googleusercontent.com','img.freepik.com','res.cloudinary.com'],
  },
  eslint: {
    ignoreDuringBuilds: true, // Disables ESLint errors during build
  },
  typescript: {
    ignoreBuildErrors: true, // Disables TypeScript errors during build
  },
};

export default nextConfig;
