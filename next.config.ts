import type { NextConfig } from "next";
import path from "path";

// pnpm의 심볼릭 링크 구조로 인한 Turbopack 경로 오탐 방지
const nextConfig: NextConfig = {
  turbopack: {
    root: path.resolve(__dirname),
  },
};

export default nextConfig;
