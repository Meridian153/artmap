import type { NextConfig } from "next";
import path from "path";

// pnpm의 심볼릭 링크 구조로 인한 Turbopack 경로 오탐 방지
const nextConfig: NextConfig = {
  turbopack: {
    root: path.resolve(__dirname),
  },
  images: {
    remotePatterns: [
      // 메트로폴리탄 미술관 작품 이미지 CDN
      { protocol: "https", hostname: "images.metmuseum.org" },
      // 위키미디어 공용 이미지 파일 서버 — 화가 초상화 등 퍼블릭 도메인 이미지
      { protocol: "https", hostname: "upload.wikimedia.org" },
    ],
  },
};

export default nextConfig;
