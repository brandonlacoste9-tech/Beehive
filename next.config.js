/** @type {import('next').NextConfig} */
const nextConfig = {
  output: 'export',
  
  // Note: Headers are configured via netlify.toml for deployed sites
  // since they don't work with static export
  
  images: {
    unoptimized: true, // Required for static export
  },
};

module.exports = nextConfig;
