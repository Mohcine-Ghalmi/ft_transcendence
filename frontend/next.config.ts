import type { NextConfig } from 'next'

const nextConfig: NextConfig = {
  /* config options here */
  reactStrictMode: false,
  eslint: {
    ignoreDuringBuilds: true,
  },
  output: 'standalone',
  images: {
    remotePatterns: [
      {
        protocol: 'https',
        hostname: '*',
      },
      {
        protocol: 'http',
        hostname: '*',
      },
    ],
  },
  async rewrites() {
    return [
      {
        source: '/images/:path*',
        destination: `${process.env.USER_BACKEND_URL}/images/:path*`,
      },
      // user
      {
        source: '/api/user-service/:path*',
        destination: `${process.env.USER_BACKEND_URL}/api/user-service/:path*`,
      },
      // chat
      {
        source: '/api/chat-service/:path*',
        destination: `${process.env.CHAT_BACKEND_URL}/api/chat-service/:path*`,
      },

      // game
      {
        source: '/api/game-service/:path*',
        destination: `${process.env.GAME_BACKEND_URL}/api/game-service/:path*`,
      },
    ]
  },
}

export default nextConfig
