/** @type {import('next').NextConfig} */
const nextConfig = {
  // 외부 API 호출 허용
  async headers() {
    return [
      {
        source: '/api/:path*',
        headers: [
          { key: 'Cache-Control', value: 's-maxage=300, stale-while-revalidate=600' },
        ],
      },
    ];
  },
};

module.exports = nextConfig;
