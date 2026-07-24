import type { NextConfig } from "next";

const nextConfig: NextConfig = {
  images: {
    // Local /public assets; formats help Lighthouse / mobile.
    formats: ["image/avif", "image/webp"],
  },
};

export default nextConfig;
