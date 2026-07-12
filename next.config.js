/**
 * next.config.js
 * Proxy configuration for MediConnect frontend.
 * All requests to /api/* are forwarded to the backend server (default localhost:5000).
 */

/** @type {import('next').NextConfig} */
const nextConfig = {
  async rewrites() {
    return [
      {
        source: '/api/:path*',
        destination: 'http://localhost:5000/api/:path*', // adjust port if backend runs elsewhere
      },
    ];
  },
  // Optional: enable React strict mode
  reactStrictMode: true,
};

module.exports = nextConfig;
