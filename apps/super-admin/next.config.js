/** @type {import('next').NextConfig} */
const nextConfig = {
  rewrites: async () => {
    return [
      {
        source: '/replicate-api/:path*',
        destination: 'https://api.replicate.com/v1/:path*',
      },
    ];
  },
};

module.exports = nextConfig;
