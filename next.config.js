/** @type {import('next').NextConfig} */
const nextConfig = {
  reactStrictMode: true,
  typescript: {
    // Remove configFileName option as it's not recognized
  },
  images: {
    domains: ['firebasestorage.googleapis.com'],
  }
}

module.exports = nextConfig; 