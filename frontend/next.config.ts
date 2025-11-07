// next.config.js
/** @type {import('next').NextConfig} */
const nextConfig = {
  images: {
    // 🔥 ЗАМЕНА: domains на remotePatterns
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
      // 🔥 ДОБАВЛЕНО: для production домена
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

    // 🔥 ДОБАВЛЕНО: для лучшей поддержки русских путей
    formats: ["image/webp", "image/avif", "image/png", "image/jpeg"],
  },

  // 🔥 ИСПРАВЛЕНО: rewrites должны проксировать запросы, а не создавать цикл
  async rewrites() {
    return [
      {
        source: "/api/:path*",
        destination: "http://217.198.9.128:3001/api/:path*",
      },
      // 🔥 ДОБАВЛЕНО: для image optimization
      {
        source: "/_next/image",
        destination: "http://217.198.9.128:3001/_next/image",
      },
    ];
  },

  // 🔥 ДОБАВЛЕНО: для отладки
  logging: {
    fetches: {
      fullUrl: true,
    },
  },
};

module.exports = nextConfig;
