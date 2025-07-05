
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
  api: {
    responseLimit: '8mb',
    bodyParser: {
      sizeLimit: '1mb',
    },
    externalResolver: true,
  },
  httpAgentOptions: {
    keepAlive: true,
  }
}

export default nextConfig
