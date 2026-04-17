// 화가 상세 페이지 — 특정 화가의 정보, 대표 작품, 국가 분포를 표시
// 연결 API:
//   GET /artists/{id}
//   GET /artists/{id}/artworks
//   GET /artists/{id}/map-data
// 세 호출은 Promise.allSettled로 병렬 처리되며, 부분 실패는 plan.md §2 정책에 따라 처리됩니다.

import type { Metadata } from "next";
import { notFound } from "next/navigation";
import { getArtistById, getArtistArtworks, getArtistMapData } from "@/lib/api";
import { ApiError } from "@/lib/errors";
import { ArtistHero } from "@/components/artist/ArtistHero";
import { ArtistInfo } from "@/components/artist/ArtistInfo";
import { ArtistArtworkGallery } from "@/components/artist/ArtistArtworkGallery";
import { ArtistCountryMapWrapper } from "@/components/artist/ArtistCountryMapWrapper";
import type { ArtworkSummaryWithMuseum } from "@/types/artwork";
import type { ArtistCountryDistribution } from "@/types/artist";

const MAX_GALLERY_ITEMS = 12;

type ArtistDetailPageProps = {
  params: Promise<{ id: string }>;
};

/**
 * 페이지 메타데이터 생성 — 화가 이름과 약력을 제목/디스크립션으로 반영
 * 화가가 없거나 ApiError 발생 시 404용 제목 반환
 */
export async function generateMetadata({ params }: ArtistDetailPageProps): Promise<Metadata> {
  const { id } = await params;
  try {
    const artist = await getArtistById(id);
    if (!artist) return { title: "Artist Not Found - ArtMap" };
    return {
      title: `${artist.name_ko} - ArtMap`,
      description: artist.biography_ko ?? undefined,
    };
  } catch {
    return { title: "Artist Not Found - ArtMap" };
  }
}

export default async function ArtistDetailPage({ params }: ArtistDetailPageProps) {
  // Next.js 15+ App Router: params는 Promise로 전달됨
  const { id } = await params;

  // 세 API를 병렬 호출 — 한 호출이 실패해도 다른 결과는 보존
  const [artistResult, artworksResult, mapDataResult] = await Promise.allSettled([
    getArtistById(id),
    getArtistArtworks(id, { limit: MAX_GALLERY_ITEMS }),
    getArtistMapData(id),
  ]);

  // 1. 화가 상세 fetch 자체가 reject된 경우
  //    - ApiError(404 등) → notFound()로 fallthrough
  //    - 그 외 에러 → 그대로 throw해서 가까운 error.tsx로 bubble up
  if (artistResult.status === "rejected") {
    if (artistResult.reason instanceof ApiError && artistResult.reason.status === 404) {
      notFound();
    }
    throw artistResult.reason;
  }

  // 2. fulfilled이지만 값이 null인 경우 (Mock 모드에서 미존재 ID) → notFound()
  const artist = artistResult.value;
  if (!artist) {
    notFound();
  }

  // 3. 작품 목록: 실패 시 null로 변환 → Gallery가 fallback 메시지 렌더
  const artworks: ArtworkSummaryWithMuseum[] | null =
    artworksResult.status === "fulfilled" ? artworksResult.value.data : null;

  // 4. 국가 분포: 실패 시 null로 변환 → MapWrapper가 fallback 메시지 렌더
  const distribution: ArtistCountryDistribution[] | null =
    mapDataResult.status === "fulfilled" ? mapDataResult.value : null;

  return (
    <main className="mx-auto max-w-4xl px-6 py-8">
      <ArtistHero artist={artist} />
      <ArtistInfo artist={artist} />
      <ArtistArtworkGallery artworks={artworks} />
      <ArtistCountryMapWrapper distribution={distribution} />
    </main>
  );
}
