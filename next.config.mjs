/** @type {import('next').NextConfig} */
const nextConfig = {
  reactStrictMode: true,
  basePath: "/app",
  output: "standalone",
  // Empêche le référencement par les moteurs et les robots IA (phase de préparation).
  async headers() {
    return [
      {
        source: "/:path*",
        headers: [
          { key: "X-Robots-Tag", value: "noindex, nofollow, noarchive, nosnippet, noai, noimageai" },
        ],
      },
    ];
  },
};

export default nextConfig;
