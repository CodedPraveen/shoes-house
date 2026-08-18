/** @type {import('next').NextConfig} */
const nextConfig = {
  experimental: {
    serverActions: {
      // Keep room for multipart headers while actions enforce a 10 MB file limit.
      bodySizeLimit: "11mb",
    },
  },

  images: {
    remotePatterns: [
      {
        protocol: "https",
        hostname: "images.unsplash.com",
      },
      {
        protocol: "https",
        hostname: "res.cloudinary.com",
      },
    ],
    qualities: [75, 80, 85],
  },

  allowedDevOrigins: [
    "192.168.31.89",
    "*.trycloudflare.com",
    "10.161.145.155",
  ],
};

export default nextConfig;
