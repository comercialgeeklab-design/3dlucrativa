/** @type {import('next').NextConfig} */
const nextConfig = {
  images: {
    domains: ['localhost'],
  },
  typescript: {
    ignoreBuildErrors: true,
  },
  eslint: {
    ignoreDuringBuilds: true,
  },
  // Packages that should not be bundled by webpack
  experimental: {
    serverComponentsExternalPackages: ['typeorm', 'mysql2', 'reflect-metadata'],
  },
  webpack: (config, { isServer }) => {
    if (isServer) {
      // Don't process TypeORM modules with webpack
      config.externals = [
        ...(config.externals || []),
        'typeorm',
        'mysql2',
        'mysql',
        'better-sqlite3',
        'sqlite3',
        'pg',
        'pg-native',
        'redis',
        'hiredis',
        'ioredis',
        'reflect-metadata',
      ];
      
      // Preserve class names for TypeORM
      config.optimization = {
        ...config.optimization,
        minimize: false,
      };
    }
    return config;
  },
};

module.exports = nextConfig;
