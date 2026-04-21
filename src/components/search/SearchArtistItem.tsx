// 검색 드롭다운 내 화가 항목 카드 — 썸네일·한글명·영문명을 한 줄로 표시
// 클릭 시 onClick 콜백으로 상세 페이지 경로를 전달한다.

"use client";

import Image from "next/image";
import type { SearchArtistItem as SearchArtistItemData } from "@/types/search";

export type SearchArtistItemProps = {
  artist: SearchArtistItemData;
  onClick: (path: string) => void;
};

export function SearchArtistItem({ artist, onClick }: SearchArtistItemProps) {
  // 상세 페이지 경로 — IA 문서 기준: /artists/{id}
  const path = `/artists/${artist.id}`;

  return (
    <button
      type="button"
      onClick={() => onClick(path)}
      className="flex w-full items-center gap-3 px-3 py-2 text-left transition-colors hover:bg-gray-100 dark:hover:bg-gray-800"
    >
      {/* 썸네일 — URL이 있으면 next/image로 원형 표시, 없으면 회색 아바타 아이콘 */}
      {artist.thumbnail_url ? (
        <Image
          src={artist.thumbnail_url}
          alt=""
          width={32}
          height={32}
          className="h-8 w-8 shrink-0 rounded-full object-cover"
        />
      ) : (
        <div
          className="flex h-8 w-8 shrink-0 items-center justify-center rounded-full bg-gray-200 text-gray-400 dark:bg-gray-700"
          aria-hidden="true"
        >
          <svg width={16} height={16} viewBox="0 0 24 24" fill="currentColor">
            <path d="M12 12c2.7 0 5-2.3 5-5s-2.3-5-5-5-5 2.3-5 5 2.3 5 5 5zm0 2c-3.3 0-10 1.7-10 5v3h20v-3c0-3.3-6.7-5-10-5z" />
          </svg>
        </div>
      )}
      {/* 이름 영역 — 한글명 강조, 영문명은 이탤릭 회색 */}
      <div className="min-w-0 flex-1">
        <p className="truncate text-sm font-semibold text-gray-900 dark:text-gray-100">
          {artist.name_ko}
        </p>
        <p className="truncate text-xs text-gray-500 italic dark:text-gray-400">{artist.name_en}</p>
      </div>
    </button>
  );
}
