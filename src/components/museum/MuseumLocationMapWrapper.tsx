// 미술관 미니맵 클라이언트 래퍼 — 서버 컴포넌트(page.tsx)에서 안전하게 사용하기 위한 dynamic import 래퍼
// MapLibre는 브라우저 전용이므로 ssr: false 옵션이 필요하고,
// Next.js 15+에서는 ssr: false dynamic import가 클라이언트 컴포넌트 안에서만 허용됨.

"use client";

import dynamic from "next/dynamic";
import type { MuseumLocationMapProps } from "./MuseumLocationMap";

// MuseumLocationMap을 SSR 없이 동적 로드. 로딩 중에는 동일한 크기의 placeholder.
const MuseumLocationMap = dynamic(
  () => import("./MuseumLocationMap").then((m) => m.MuseumLocationMap),
  {
    ssr: false,
    loading: () => <div className="mt-3 h-[300px] rounded-lg border border-zinc-200 bg-zinc-100" />,
  },
);

// 서버 컴포넌트에서 import 가능한 래퍼. props는 그대로 통과.
export function MuseumLocationMapWrapper(props: MuseumLocationMapProps) {
  return <MuseumLocationMap {...props} />;
}
