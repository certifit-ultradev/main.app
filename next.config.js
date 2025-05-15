/** @type {import('next').NextConfig} */

const nextConfig = {
    images: {
        remotePatterns: [
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
        forceSwcTransforms: true,
        serverActions: {
            bodySizeLimit: '900mb',
        }
    }
}

module.exports = nextConfig