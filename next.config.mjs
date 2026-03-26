/** @type {import('next').NextConfig} */
const nextConfig = {
  // Enable React Strict Mode for development best practices
  reactStrictMode: true,

  // Image optimization domains (add your API/CDN domains here later)
  images: {
    remotePatterns: [],
  },

  // Headers for SEO and security
  async headers() {
    return [
      {
        source: '/(.*)',
        headers: [
          {
            key: 'X-Content-Type-Options',
            value: 'nosniff',
          },
          {
            key: 'X-Frame-Options',
            value: 'DENY',
          },
          {
            key: 'X-XSS-Protection',
            value: '1; mode=block',
          },
        ],
      },
    ];
  },
};

export default nextConfig;
