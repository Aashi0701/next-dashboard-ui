/** @type {import('next').NextConfig} */
const nextConfig = {
  experimental: {
    appDir: './src/app',
  },

  reactCompiler: {
    removeJsxTransformInImports: true,
  },

  images: {
    remotePatterns: [
      { hostname: "images.pexels.com" },
      { protocol: "https", hostname: "res.cloudinary.com" }
    ]
  }
};

export default nextConfig;
