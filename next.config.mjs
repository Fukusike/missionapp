
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
  reactStrictMode: false
}

export default nextConfig
