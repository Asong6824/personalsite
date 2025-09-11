/** @type {import('next').NextConfig} */

const nextConfig = {
    images: {
        remotePatterns: [
            {
                protocol: 'https',
                hostname: 'blog-assets-asong.tos-cn-beijing.volces.com',
                pathname: '**', // 支持所有路径
            },
            {
                protocol: 'https',
                hostname: 'p1-juejin.byteimg.com',
                pathname: '**', // 支持所有路径
            },
            {
                protocol: 'https',
                hostname: 'p3-juejin.byteimg.com',
                pathname: '**', // 支持所有路径
            },
            {
                protocol: 'https',
                hostname: 'p6-juejin.byteimg.com',
                pathname: '**', // 支持所有路径
            },
            {
                protocol: 'https',
                hostname: 'p9-juejin.byteimg.com',
                pathname: '**', // 支持所有路径
            },
        ],
    }
};

export default nextConfig;
