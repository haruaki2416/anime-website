/** @type {import('next').NextConfig} */
const nextConfig = {
  typescript: { ignoreBuildErrors: true },
  eslint: { ignoreDuringBuilds: true },
  experimental: { cpus: 1, workerThreads: false },
  async redirects() {
    return [
      { source: "/media", destination: "/", permanent: true },
      { source: "/watch", destination: "/", permanent: true },
      { source: "/read", destination: "/", permanent: true },
      { source: "/news/:path", destination: "/news", permanent: true },
    ];
  },
  images: {
    unoptimized: true,
    remotePatterns: [
      { protocol: "https", hostname: "s4.anilist.co", pathname: "/**" },
      { protocol: "https", hostname: "img1.ak.crunchyroll.com", pathname: "/**" },
      { protocol: "https", hostname: "animenewsnetwork.com", pathname: "/**" },
      { protocol: "https", hostname: "lh3.googleusercontent.com", pathname: "/**" },
      { protocol: "https", hostname: "avatars.githubusercontent.com", pathname: "/**" },
      { protocol: "https", hostname: "**", pathname: "/**" },
    ],
  },
  webpack(config) {
    const fileLoaderRule = config.module.rules.find((rule) => rule.test?.test?.(".svg"));
    config.module.rules.push(
      { ...fileLoaderRule, test: /\.svg$/i, resourceQuery: /url/ },
      { test: /\.svg$/i, issuer: fileLoaderRule.issuer, resourceQuery: { not: [...fileLoaderRule.resourceQuery.not, /url/] }, use: ["@svgr/webpack"] }
    );
    fileLoaderRule.exclude = /\.svg$/i;
    return config;
  },
};
export default nextConfig;
