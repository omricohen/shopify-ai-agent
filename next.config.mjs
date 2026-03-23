/** @type {import('next').NextConfig} */
const nextConfig = {
  images: {
    remotePatterns: [
      {
        protocol: "https",
        hostname: "cdn.shopify.com",
      },
    ],
  },
  // Allow pdf-parse to work in server-side
  webpack: (config, { isServer }) => {
    if (isServer) {
      config.externals.push({
        "pdf-parse": "commonjs pdf-parse",
      });
    }
    return config;
  },
};

export default nextConfig;
