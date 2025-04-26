/** @type {import('next').NextConfig} */

const nextConfig = {
    images: {
        remotePatterns: [
            {
                protocol: 'https',
                hostname: '7rlcwopzswv1kzog.public.blob.vercel-storage.com',
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
            bodySizeLimit: '500mb',
        }
    }
}

module.exports = nextConfig