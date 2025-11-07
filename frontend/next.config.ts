// next.config.js
/** @type {import('next').NextConfig} */
const nextConfig = {
  images: {
    remotePatterns: [
      {
        protocol: "http",
        hostname: "217.198.9.128",
        port: "3001",
        pathname: "/images/**",
      },
      {
        protocol: "http",
        hostname: "localhost",
        port: "3001",
        pathname: "/images/**",
      },
      {
        protocol: "http",
        hostname: "127.0.0.1",
        port: "3001",
        pathname: "/images/**",
      },
      {
        protocol: "https",
        hostname: "iqos-24.ru",
        pathname: "/images/**",
      },
      {
        protocol: "http",
        hostname: "iqos-24.ru",
        pathname: "/images/**",
      },
    ],
    dangerouslyAllowSVG: true,
    contentDispositionType: "attachment",
    contentSecurityPolicy: "default-src 'self'; script-src 'none'; sandbox;",

    // 🔥 ИСПРАВЛЕНО: только webp и avif
    formats: ["image/webp", "image/avif"],
  },

  // 🔥 ИСПРАВЛЕНО: правильные rewrites
  async rewrites() {
    return [
      {
        source: "/api/:path*",
        destination: "http://217.198.9.128:3001/api/:path*",
      },
      {
        source: "/_next/image",
        destination: "http://217.198.9.128:3001/_next/image",
      },
    ];
  },

  logging: {
    fetches: {
      fullUrl: true,
    },
  },
};

module.exports = nextConfig;
