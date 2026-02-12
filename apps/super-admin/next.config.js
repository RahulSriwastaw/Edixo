/** @type {import('next').NextConfig} */
const nextConfig = {
  rewrites: async () => {
    return [
      {
        source: '/replicate-api/:path*',
        destination: 'https://api.replicate.com/v1/:path*',
      },
      { source: '/favicon.ico', destination: '/icon' },
    ];
  },
  webpack: (config, { isServer }) => {
    if (!isServer) {
      config.resolve.fallback = {
        ...config.resolve.fallback,
        fs: false,
        path: false,
        https: false,
        http: false,
        stream: false,
        crypto: false,
        zlib: false,
        net: false,
        tls: false,
      };
      // Handle node: imports
      config.plugins.push(
        new (require('webpack')).NormalModuleReplacementPlugin(
          /^node:/,
          (resource) => {
            resource.request = resource.request.replace(/^node:/, '');
          }
        )
      );
    }
    return config;
  },
};

module.exports = nextConfig;
