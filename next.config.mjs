/** @type {import('next').NextConfig} */

const nextConfig = {
  // Use an immutable release value (normally the Git commit SHA) so Next.js can
  // detect clients that still have assets from the previous container image.
  deploymentId: process.env.DEPLOYMENT_VERSION,

  experimental: {
    serverActions: {
      // Total Server Action request size.
      bodySizeLimit: "100mb",
    },

    // Proxy has its own 10 MB default limit.
    proxyClientMaxBodySize: "100mb",
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
    "10.23.12.155",
  ],
};

export default nextConfig;
