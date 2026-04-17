// ArtworkLocationMap의 SSR 비활성화 래퍼
// MapLibre는 브라우저 전용이므로 ssr: false dynamic import가 필요하며,
// Next.js 15+에서는 클라이언트 컴포넌트 안에서만 허용됨.

"use client";

import dynamic from "next/dynamic";
import type { ArtworkLocationMapProps } from "./ArtworkLocationMap";

// ArtworkLocationMap을 SSR 없이 동적 로드. 로딩 중에는 동일한 크기의 placeholder.
const ArtworkLocationMap = dynamic(
  () => import("./ArtworkLocationMap").then((m) => m.ArtworkLocationMap),
  {
    ssr: false,
    loading: () => (
      <div className="rounded-lg border border-zinc-200 p-6">
        <div className="h-64 rounded-lg bg-zinc-100 md:h-80" />
      </div>
    ),
  },
);

// 서버 컴포넌트에서 import 가능한 래퍼. primaryMuseum이 null이면 렌더 생략.
export function ArtworkLocationMapWrapper(props: ArtworkLocationMapProps) {
  if (!props.primaryMuseum) return null;
  return <ArtworkLocationMap {...props} />;
}
