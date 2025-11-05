import type { NextConfig } from "next";

const nextConfig: NextConfig = {
  /* config options here */
  reactCompiler: true,
  images: {
    remotePatterns: [
      {
        protocol: "https",
        hostname: "ilumarussia.ru",
        port: "",
        pathname: "/**",
      },
    ],
  },
};

export default nextConfig;
