/** @type {import('next').NextConfig} */
const nextConfig = {
  eslint: {
    ignoreDuringBuilds: true,
  },
  typescript: {
    ignoreBuildErrors: true,
  },
  images: {
    unoptimized: true,
  },
  output: 'standalone',
  env: {
    NEXT_PUBLIC_API_URL: process.env.NEXT_PUBLIC_API_URL || 'http://localhost',
  },
  // Allow access from network IPs in development
  // This allows Next.js dev server to serve _next/* resources to network clients
  // In Next.js 15+, you need to explicitly allow origins that access the dev server
  // Note: allowedDevOrigins doesn't support CIDR notation, so we generate the IP range
  allowedDevOrigins: process.env.NODE_ENV === 'development' ? (() => {
    const origins = ['localhost', '127.0.0.1']
    
    // If ALLOWED_DEV_ORIGINS is set, use it (comma-separated IPs)
    if (process.env.ALLOWED_DEV_ORIGINS) {
      origins.push(...process.env.ALLOWED_DEV_ORIGINS.split(',').map(ip => ip.trim()))
    } else {
      // Generate 192.168.9.* range (192.168.9.1 to 192.168.9.254)
      // This covers all IPs in your local network subnet
      for (let i = 1; i <= 254; i++) {
        origins.push(`192.168.9.${i}`)
      }
    }
    
    return origins
  })() : undefined,
  experimental: {
    serverActions: {
      allowedOrigins: [
        'localhost:3000',
        '127.0.0.1:3000',
        // Allow network IPs - CIDR notation for serverActions
        '192.168.9.0/24',  // 192.168.9.* range (correct CIDR: /24, not /16)
        '192.168.0.0/16',  // Entire 192.168.x.x range
        '10.0.0.0/8',      // 10.x.x.x range
        '172.16.0.0/12',   // 172.16-31.x.x range
      ],
    },
  },
}

export default nextConfig
