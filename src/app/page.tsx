// 홈 페이지 — 세계 지도에 국가별 작품 수 버블 마커 표시
"use client";

import dynamic from "next/dynamic";

// MapLibre는 브라우저 전용 → SSR 방지 dynamic import
const HomeMap = dynamic(() => import("@/components/map/HomeMap").then((mod) => mod.HomeMap), {
  ssr: false,
  loading: () => (
    <div className="flex h-full items-center justify-center text-gray-500">
      지도를 불러오는 중...
    </div>
  ),
});

export default function Home() {
  return (
    <div className="h-[calc(100vh-56px)]">
      <HomeMap />
    </div>
  );
}
