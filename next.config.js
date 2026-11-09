/** @type {import('next').NextConfig} */

const nextConfig = {
    images: {
        remotePatterns: [
            {
                protocol: 'https',
                hostname: 'ocfgzb68xebcfzul.public.blob.vercel-storage.com',
                port: '',
            },
            {
                protocol: 'https',
                hostname: 'vnruzfzvnvdhb848.public.blob.vercel-storage.com',
                port: '',
            },
        ],
    },
    logging: {
        fetches: {
            fullUrl: true,
        },
    },
    experimental: {
        agentUpgrade: 'security',
        serverActions: {
            bodySizeLimit: '1000mb',
        }
    },
    allowedDevOrigins: ['192.168.253.242']
}

module.exports = nextConfig
