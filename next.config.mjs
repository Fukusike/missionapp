
/** @type {import('next').NextConfig} */
const nextConfig = {
  experimental: {
    allowedDevOrigins: [
      '*.replit.dev',
      '*.repl.co',
      'localhost:3000'
    ]
  },
  images: {
    unoptimized: true
  },
  reactStrictMode: false,
  async headers() {
    return [
      {
        source: '/api/:path*',
        headers: [
          {
            key: 'Cache-Control',
            value: 'no-store, must-revalidate',
          },
        ],
      },
    ]
  }
}

export default nextConfig
