import type { NextConfig } from "next";

const nextConfig: NextConfig = {
  experimental: {
    serverActions: {
      allowedOrigins: ['barchartrace.thisnexus.cn'],
    },
  },
};

export default nextConfig;
