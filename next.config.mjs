
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
  }
}

export default nextConfig
