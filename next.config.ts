import type { NextConfig } from "next";

const withPWA = require("next-pwa")({
  dest: "public",
  register: true,
  skipWaiting: true,
  disable: process.env.NODE_ENV === "development",
});

const isDev = process.env.NODE_ENV !== "production";

const nextConfig: NextConfig = {
  /* config options here */
  reactStrictMode: true,
  turbopack: {},
  async headers() {
    const cspDev = [
      "default-src 'self'",
      "script-src 'self' 'unsafe-eval'",
      "connect-src 'self' http://localhost:3000 ws://localhost:3000 http://127.0.0.1:7242",
      "img-src 'self' data:",
      "style-src 'self' 'unsafe-inline'",
    ].join("; ");

    const cspProd = [
      "default-src 'self'",
      "script-src 'self'",
      "connect-src 'self'",
      "img-src 'self'",
      "style-src 'self'",
    ].join("; ");

    return [
      {
        source: "/:path*",
        headers: [
          {
            key: "Content-Security-Policy",
            value: isDev ? cspDev : cspProd,
          },
        ],
      },
    ];
  },
};

export default withPWA(nextConfig);
