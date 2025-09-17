/** @type {import('next').NextConfig} */
const nextConfig = {
  // For static hosting (cPanel, etc.)
  output: process.env.BUILD_MODE === "static" ? "export" : undefined,
  trailingSlash: false, // Vercel works better without trailing slashes
  images: {
    unoptimized: process.env.BUILD_MODE === "static", // Only unoptimized for static export
  },
  // For dynamic hosting (Vercel, VPS, etc.)
  experimental: {
    // serverActions are now stable in Next.js 15
  },
};

export default nextConfig;
