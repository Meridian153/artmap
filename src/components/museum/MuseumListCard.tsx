// 미술관 목록 카드 — /museums 페이지 그리드에서 개별 미술관을 나타낸다.
// 카드 크기는 항상 고정되며 데이터 유무와 관계없이 레이아웃이 무너지지 않는다.
// 상단 클릭 영역(이미지·이름·위치·통계)은 미술관 상세 페이지로 이동하고,
// 하단 구글맵 링크는 별도 <a>로 분리하여 중첩 앵커를 방지한다.

import Link from "next/link";
import type { MuseumSummary } from "@/types/museum";
import { buildGoogleMapsUrl } from "@/lib/google-maps-url";

export type MuseumListCardProps = {
  museum: MuseumSummary;
};

export function MuseumListCard({ museum }: MuseumListCardProps) {
  const googleMapsUrl = buildGoogleMapsUrl(museum.name_en, museum.city);

  return (
    <div className="flex flex-col overflow-hidden rounded-lg border border-gray-200 bg-white transition-shadow hover:shadow-md dark:border-gray-700 dark:bg-gray-900">
      {/* 상세 페이지 링크 영역 — 이미지·이름·위치·통계·대표 작품을 감싼다 */}
      <Link
        href={`/museums/${museum.id}`}
        className="flex flex-1 flex-col hover:opacity-95"
        aria-label={`${museum.name_ko} 상세 보기`}
      >
        {/* TODO: thumbnail_url 필드 추가 시 이 영역을 next/image로 교체 */}
        {/* 이미지 플레이스홀더 — h-40 고정으로 모든 카드에서 동일한 높이를 보장 */}
        <div
          className="flex h-40 w-full shrink-0 items-center justify-center bg-gray-100 text-sm text-gray-400 dark:bg-gray-800 dark:text-gray-500"
          aria-label="미술관 이미지 준비 중"
        >
          이미지 준비 중
        </div>

        <div className="flex flex-1 flex-col gap-2 p-3">
          {/* 미술관 이름 — 한국어(굵게 크게) / 영문(작게 회색), 모두 1줄 truncate */}
          <div>
            <p className="truncate text-sm font-semibold text-gray-900 dark:text-gray-100">
              {museum.name_ko}
            </p>
            <p className="truncate text-xs text-gray-500 dark:text-gray-400">{museum.name_en}</p>
          </div>

          {/* 위치 — "도시 · 국가코드" 형식 */}
          <p className="truncate text-xs text-gray-500 dark:text-gray-400">
            {museum.city} · {museum.country_code}
          </p>

          {/* 소장 작품 수 */}
          <p className="text-xs text-gray-500 dark:text-gray-400">
            작품 {museum.artwork_count.toLocaleString()}점
          </p>

          {/* TODO: featured_artwork 필드 추가 시 이 영역을 실제 작품 이미지로 교체 */}
          {/* 대표 작품 플레이스홀더 — h-16 고정으로 카드 높이 일관성 유지 */}
          <div className="flex h-16 shrink-0 items-center justify-center rounded bg-gray-100 text-xs text-gray-400 dark:bg-gray-800 dark:text-gray-500">
            대표 작품 준비 중
          </div>
        </div>
      </Link>

      {/* 구글맵 링크 — 상단 Link와 중첩 앵커 방지를 위해 카드 외부(Link 밖)에 배치 */}
      <div className="px-3 pb-3">
        <a
          href={googleMapsUrl}
          target="_blank"
          rel="noopener noreferrer"
          className="flex w-full items-center justify-center gap-1 rounded-md border border-gray-200 py-1.5 text-xs text-gray-600 transition-colors hover:bg-gray-50 dark:border-gray-700 dark:text-gray-400 dark:hover:bg-gray-800"
        >
          구글맵으로 보기
          <span aria-hidden="true">↗</span>
        </a>
      </div>
    </div>
  );
}
