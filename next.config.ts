import type { NextConfig } from "next";

const nextConfig: NextConfig = {
  eslint: {
    // Permitir build mesmo com erros de linting
    ignoreDuringBuilds: true,
  },
  typescript: {
    // Permitir build mesmo com erros de TypeScript (apenas em dev)
    ignoreBuildErrors: false,
  },
};

export default nextConfig;
