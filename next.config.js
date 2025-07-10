/** @type {import('next').NextConfig} */
const nextConfig = {
  // Production optimizations
  reactStrictMode: true,
  swcMinify: true,
  
  // Performance optimizations
  compress: true,
  poweredByHeader: false,
  generateEtags: false,
  
  // Image optimization
  images: {
    domains: ['localhost', 'nextalk-u0y1.onrender.com'],
    formats: ['image/webp', 'image/avif'],
  },
  
  // Environment variables
  env: {
    CUSTOM_KEY: process.env.CUSTOM_KEY,
  },
  
  // Headers for security and performance
  async headers() {
    return [
      {
        source: '/(.*)',
        headers: [
          {
            key: 'X-Frame-Options',
            value: 'DENY',
          },
          {
            key: 'X-Content-Type-Options',
            value: 'nosniff',
          },
          {
            key: 'Referrer-Policy',
            value: 'origin-when-cross-origin',
          },
          {
            key: 'Cache-Control',
            value: 'public, max-age=31536000, immutable',
          },
        ],
      },
    ];
  },
  
  // Webpack configuration for production
  webpack: (config, { buildId, dev, isServer, defaultLoaders, webpack }) => {
    // Production optimizations
    if (!dev) {
      config.optimization.splitChunks = {
        chunks: 'all',
        cacheGroups: {
          vendor: {
            test: /[\\/]node_modules[\\/]/,
            name: 'vendors',
            chunks: 'all',
          },
        },
      };
    }
    
    return config;
  },
  
  // Output configuration for deployment
  output: 'standalone',
  
  // Experimental features for better performance
  experimental: {
    optimizeCss: true,
    optimizePackageImports: ['socket.io-client', 'axios'],
  },
  
  // Redirects for better SEO
  async redirects() {
    return [
      {
        source: '/home',
        destination: '/',
        permanent: true,
      },
    ];
  },
  
  // API routes configuration
  async rewrites() {
    return [
      {
        source: '/api/:path*',
        destination: `${process.env.NEXT_PUBLIC_SERVER_URL || 'https://nextalk-u0y1.onrender.com'}/:path*`,
      },
    ];
  },
};

module.exports = nextConfig;
