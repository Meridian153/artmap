// 화가 국가 분포 미니맵 클라이언트 래퍼 — 서버 컴포넌트(page.tsx)에서 안전하게 사용하기 위한 dynamic import 래퍼
// MapLibre는 브라우저 전용이므로 ssr: false 옵션이 필요하고,
// Next.js 15+에서는 ssr: false dynamic import가 클라이언트 컴포넌트 안에서만 허용됨.

"use client";

import dynamic from "next/dynamic";
import type { ArtistCountryDistribution } from "@/types/artist";

// ArtistCountryMap을 SSR 없이 동적 로드. 로딩 중에는 동일한 크기의 placeholder.
const ArtistCountryMap = dynamic(
  () => import("./ArtistCountryMap").then((m) => m.ArtistCountryMap),
  {
    ssr: false,
    loading: () => <div className="mt-3 h-[300px] rounded-lg border border-zinc-200 bg-zinc-100" />,
  },
);

export type ArtistCountryMapWrapperProps = {
  /** 화가 작품의 국가별 분포 (null이면 fetch 실패 fallback) */
  distribution: ArtistCountryDistribution[] | null;
};

// 서버 컴포넌트에서 import 가능한 래퍼 — null/empty 분기 처리
export function ArtistCountryMapWrapper({ distribution }: ArtistCountryMapWrapperProps) {
  // fetch 실패 시 fallback 메시지
  if (distribution === null) {
    return (
      <section className="mt-12">
        <h2 className="text-sm font-semibold tracking-wider text-zinc-500 uppercase">
          국가별 작품 분포
        </h2>
        <p className="mt-3 text-sm text-zinc-500">국가 분포 정보를 불러올 수 없습니다.</p>
      </section>
    );
  }

  // 빈 배열일 때 안내 메시지
  if (distribution.length === 0) {
    return (
      <section className="mt-12">
        <h2 className="text-sm font-semibold tracking-wider text-zinc-500 uppercase">
          국가별 작품 분포
        </h2>
        <p className="mt-3 text-sm text-zinc-500">국가 분포 정보가 없습니다.</p>
      </section>
    );
  }

  return <ArtistCountryMap distribution={distribution} />;
}
