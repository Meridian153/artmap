// 화가 대표 작품 갤러리 — 페이지에서 prefetch한 작품 목록을 props로 받아 카드 그리드로 표시
// 서버 컴포넌트. artworks가 null이면 에러 fallback, 빈 배열이면 비어 있음 메시지, 그 외 그리드 렌더.

import Link from "next/link";
import type { ArtworkSummaryWithMuseum } from "@/types/artwork";

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
          {artworks.map((artwork) => (
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
                  {/* current_museum이 null일 수 있으므로 옵셔널 체이닝 필수 */}
                  {artwork.current_museum?.name_ko && (
                    <p className="mt-1 text-xs text-zinc-600">
                      {artwork.current_museum.name_ko}
                      {artwork.current_museum.country_ko && (
                        <>, {artwork.current_museum.country_ko}</>
                      )}
                    </p>
                  )}
                </div>
              </Link>
            </li>
          ))}
        </ul>
      )}
    </section>
  );
}
