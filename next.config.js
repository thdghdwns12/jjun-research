/** @type {import('next').NextConfig} */
const nextConfig = {
  output: 'export',
  trailingSlash: true,
  basePath: process.env.GITHUB_ACTIONS ? '/jjun-research' : '',
  images: { unoptimized: true },
};

module.exports = nextConfig;
