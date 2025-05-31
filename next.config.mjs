/** @type {import('next').NextConfig} */

const nextConfig = {
    images: {
        remotePatterns: [
            {
                protocol: 'https',
                hostname: 'blog-assets-asong.tos-cn-beijing.volces.com',
                pathname: '**', // 支持所有路径
            },
        ],
    }
};

export default nextConfig;
