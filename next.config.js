/** @type {import('next').NextConfig} */
const nextConfig = {
  reactStrictMode: true,
  swcMinify: false,
  images: {
    domains: ['assets.dummyjson.com', 'images.unsplash.com'],
  },
};

module.exports = nextConfig;
