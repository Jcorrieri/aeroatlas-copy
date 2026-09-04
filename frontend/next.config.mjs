/** @type {import('next').NextConfig} */
const nextConfig = {
  reactStrictMode: true,
  swcMinify: true,
  images: {
    remotePatterns: [
      {
        protocol: "https",
        hostname: "flagcdn.com",
        pathname: "/**",
      },
      {
        protocol: "https",
        hostname: "images.unsplash.com",
        pathname: "/**"
      },
    ],
  },
  experimental: {
    // Add this line to force Turbopack to use ESM
    turbo: {
      resolveEsm: true,
    },
  },
};

export default nextConfig;