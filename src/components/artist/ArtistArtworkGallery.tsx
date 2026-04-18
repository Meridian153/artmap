// 화가 대표 작품 갤러리 — 페이지에서 prefetch한 작품 목록을 props로 받아 카드 그리드로 표시
// 서버 컴포넌트. artworks가 null이면 에러 fallback, 빈 배열이면 비어 있음 메시지, 그 외 그리드 렌더.
//
// 미술관 ID가 GET /artists/{id}/artworks 응답에 포함되지 않아 미술관 링크는 제공하지 않습니다 — 기술 부채 #2.

import Link from "next/link";
import type { ArtworkSummaryWithMuseum } from "@/types/artwork";
import { formatYearLabel } from "@/lib/format-year";

export type ArtistArtworkGalleryProps = {
  artworks: ArtworkSummaryWithMuseum[] | null;
};

export function ArtistArtworkGallery({ artworks }: ArtistArtworkGalleryProps) {
  return (
    <section className="mt-12">
      <h2 className="text-sm font-semibold tracking-wider text-zinc-500 uppercase">대표 작품</h2>

      {/* 분기: null(fetch 실패) → 에러 메시지 / 빈 배열 → 안내 / 그 외 → 그리드 */}
      {artworks === null ? (
        <p className="mt-6 text-zinc-500">작품 정보를 불러올 수 없습니다.</p>
      ) : artworks.length === 0 ? (
        <p className="mt-6 text-zinc-500">표시할 작품이 없습니다.</p>
      ) : (
        <ul className="mt-6 grid grid-cols-2 gap-6 sm:grid-cols-3 lg:grid-cols-4">
          {artworks.map((artwork) => {
            const yearLabel = formatYearLabel(artwork.year_created, null);
            return (
              <li key={artwork.id}>
                <Link href={`/artworks/${artwork.id}`} className="group block">
                  {/* 정사각형 썸네일 placeholder — next/image 미사용 */}
                  <div
                    className="flex aspect-square w-full items-center justify-center bg-zinc-100 text-xs text-zinc-400"
                    aria-label="작품 이미지 없음"
                  >
                    이미지 준비 중
                  </div>
                  <div className="mt-3">
                    <h3 className="text-sm font-medium text-zinc-900 group-hover:underline">
                      {artwork.title_ko}
                    </h3>
                    <p className="mt-1 text-xs text-zinc-500 italic">{artwork.title_en}</p>
                    {/* 미술관명만 텍스트 표시 (museum_id가 응답에 없어 링크 불가) */}
                    {artwork.museum_name_ko && (
                      <p className="mt-1 text-xs text-zinc-600">{artwork.museum_name_ko}</p>
                    )}
                    {yearLabel && <p className="mt-1 text-xs text-zinc-500">{yearLabel}</p>}
                  </div>
                </Link>
              </li>
            );
          })}
        </ul>
      )}
    </section>
  );
}
