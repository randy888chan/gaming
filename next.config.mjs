/** @type {import('next').NextConfig} */
const nextConfig = {
  reactStrictMode: true,
  transpilePackages: ['ahooks', '@particle-network/auth-connectors', 'rc-util', 'rc-pagination', 'rc-picker', '@ant-design/icons-svg'],
  experimental: {
    esmExternals: 'loose',
  },
  webpack: (config, { isServer }) => {
    if (!isServer) {
      config.resolve.fallback = {
        fs: false,
        path: false,
        os: false,
        crypto: false,
        uuid: false,
      };
    }
    return config;
  },
};

export default nextConfig;
