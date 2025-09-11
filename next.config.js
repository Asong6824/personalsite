/** @type {import('next').NextConfig} */
const nextConfig = {
  images: {
    remotePatterns: [
      {
        protocol: 'https',
        hostname: 'images.unsplash.com',
        port: '',
        pathname: '/**',
      },
      {
        protocol: 'https',
        hostname: 'blog-assets-asong.tos-cn-beijing.volces.com',
        port: '',
        pathname: '/**',
      },
    ],
  },
}

module.exports = nextConfig