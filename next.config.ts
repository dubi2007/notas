import type { NextConfig } from 'next'

const nextConfig: NextConfig = {
  allowedDevOrigins: ['192.168.31.217'],
  images: {
    remotePatterns: [
      {
        protocol: 'https',
        // Allow your Supabase storage domain. Replace with your project ref.
        hostname: '*.supabase.co',
        pathname: '/storage/v1/object/public/**',
      },
    ],
  },
}

export default nextConfig
