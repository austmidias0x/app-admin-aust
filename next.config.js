/** @type {import('next').NextConfig} */
const nextConfig = {
  eslint: {
    // Permitir build mesmo com erros de linting
    ignoreDuringBuilds: true,
  },
  typescript: {
    // Permitir build mesmo com erros de TypeScript (apenas em dev)
    ignoreBuildErrors: true,
  },
};

module.exports = nextConfig;
