import withBundleAnalyzer from "@next/bundle-analyzer";
import withPWA from "next-pwa";

const isProd = process.env.NODE_ENV === "production";

/** @type {import('next').NextConfig} */
const nextConfig = {
  reactStrictMode: true,
  webpack: (config, { isServer }) => {
    if (!isServer) {
      config.resolve.fallback = {
        fs: false,
        path: false,
        os: false,
        crypto: false,
      };
    }
    return config;
  },
};

const withPWAConfig = withPWA({
  dest: "public",
  disable: !isProd,
  register: true,
  skipWaiting: true,
  buildExcludes: [/middleware-manifest.json$/],
  fallbacks: {
    document: "/_offline",
  },
})(nextConfig);

export default withBundleAnalyzer({
  enabled: process.env.ANALYZE === "true",
})(withPWAConfig);
