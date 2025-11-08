// next.config.js
/** @type {import('next').NextConfig} */
const nextConfig = {
  images: {
    domains: [
      "placehold.net",
      "placehold.co",
      "via.placeholder.com",
      "217.198.9.128", // ваш IP для изображений
      "localhost",
    ],
    remotePatterns: [
      {
        protocol: "http",
        hostname: "217.198.9.128",
        port: "",
        pathname: "/**",
      },
      {
        protocol: "https",
        hostname: "placehold.net",
        pathname: "/**",
      },
      {
        protocol: "https",
        hostname: "placehold.co",
        pathname: "/**",
      },
    ],
    unoptimized: process.env.NODE_ENV === "development", // опционально для разработки
  },
};

module.exports = nextConfig;
