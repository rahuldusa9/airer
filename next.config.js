/** @type {import('next').NextConfig} */
const nextConfig = {
  images: {
    remotePatterns: [],
  },
  transpilePackages: ['three'],
  webpack: (config, { isServer }) => {
    if (!isServer) {
      config.resolve.fallback = {
        ...config.resolve.fallback,
        net: false,
        tls: false,
        fs: false,
        dns: false,
        child_process: false,
        'mongodb-client-encryption': false,
      };
    }
    return config;
  },
  // Force unique build ID to prevent cache issues
  generateBuildId: async () => {
    return `build-${Date.now()}`;
  },
  // Disable static optimization to prevent aggressive caching
  experimental: {
    serverActions: true,
  },
};

module.exports = nextConfig;
