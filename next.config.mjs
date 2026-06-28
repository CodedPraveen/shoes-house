/** @type {import('next').NextConfig} */
const nextConfig = {
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
  ],
};

export default nextConfig;