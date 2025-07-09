/** @type {import('next').NextConfig} */
const nextConfig = {
  // Server Actions are now enabled by default in Next.js 14.2.3
  // experimental: {
  //   serverActions: true,
  // },
  images: {
    domains: ['placehold.co'],
  },
};

module.exports = nextConfig; 