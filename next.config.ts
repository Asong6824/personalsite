import type { NextConfig } from "next";

const nextConfig: NextConfig = {
  images: {
    remotePatterns: [
      {
        protocol: "https",
        hostname: "blog-assets-asong.tos-cn-beijing.volces.com",
        pathname: "**",
      },
      {
        protocol: "https",
        hostname: "p1-juejin.byteimg.com",
        pathname: "**",
      },
      {
        protocol: "https",
        hostname: "p3-juejin.byteimg.com",
        pathname: "**",
      },
      {
        protocol: "https",
        hostname: "p6-juejin.byteimg.com",
        pathname: "**",
      },
      {
        protocol: "https",
        hostname: "p9-juejin.byteimg.com",
        pathname: "**",
      },
    ],
  },
};

export default nextConfig;
