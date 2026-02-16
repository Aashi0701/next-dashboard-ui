/** @type {import('next').NextConfig} */
const nextConfig = {
  experimental: {
    appDir: "./src/app",
  },

  reactCompiler: {
    removeJsxTransformInImports: true,
  },

  images: {
    remotePatterns: [
      {
        protocol: "https",
        hostname: "images.pexels.com",
      },
      {
        protocol: "https",
        hostname: "res.cloudinary.com",
      },
      {
        protocol: "https",
        hostname: "img.clerk.com", // ✅ REQUIRED for Clerk avatars
      },
    ],
  },
};

export default nextConfig;
