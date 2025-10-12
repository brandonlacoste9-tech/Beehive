/** @type {import('next').NextConfig} */
const nextConfig = {
  reactStrictMode: true,
  swcMinify: true,
  // Removed 'output: export' to enable API routes for NextAuth
};

module.exports = nextConfig;