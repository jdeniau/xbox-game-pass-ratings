/**
 * @type {import('next').NextConfig}
 */
const nextConfig = {
  // Use the CDN in production and localhost for development.
  basePath:
    process.env.NODE_ENV === 'production'
      ? '/xbox-game-pass-ratings'
      : undefined,

  async redirects() {
    return [
      {
        source: '/',
        destination: '/games',
        permanent: true,
      },
    ];
  },
};

module.exports = nextConfig;
