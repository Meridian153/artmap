// 검색 드롭다운 내 작품 항목 카드 — 썸네일·작품명(한/영)·화가명을 표시
// 클릭 시 onClick 콜백으로 상세 페이지 경로를 전달한다.

"use client";

import Image from "next/image";
import type { SearchArtworkItem as SearchArtworkItemData } from "@/types/search";

export type SearchArtworkItemProps = {
  artwork: SearchArtworkItemData;
  onClick: (path: string) => void;
};

export function SearchArtworkItem({ artwork, onClick }: SearchArtworkItemProps) {
  // 상세 페이지 경로 — IA 문서 기준: /artworks/{id}
  const path = `/artworks/${artwork.id}`;

  return (
    <button
      type="button"
      onClick={() => onClick(path)}
      className="flex w-full items-center gap-3 px-3 py-2 text-left transition-colors hover:bg-gray-100 dark:hover:bg-gray-800"
    >
      {/* 썸네일 — URL이 있으면 next/image, 없으면 회색 플레이스홀더 */}
      {artwork.image_url ? (
        <Image
          src={artwork.image_url}
          alt=""
          width={32}
          height={32}
          className="h-8 w-8 shrink-0 rounded object-cover"
        />
      ) : (
        <div
          className="flex h-8 w-8 shrink-0 items-center justify-center rounded bg-gray-200 text-gray-400 dark:bg-gray-700"
          aria-hidden="true"
        >
          <svg
            width={16}
            height={16}
            viewBox="0 0 24 24"
            fill="none"
            stroke="currentColor"
            strokeWidth={2}
          >
            <rect x="3" y="3" width="18" height="18" rx="2" />
            <circle cx="9" cy="9" r="1.5" fill="currentColor" />
            <path d="M21 15l-5-5L5 21" />
          </svg>
        </div>
      )}
      {/* 텍스트 영역 — 한글 제목/영문 제목/화가명(있을 때만) */}
      <div className="min-w-0 flex-1">
        <p className="truncate text-sm font-semibold text-gray-900 dark:text-gray-100">
          {artwork.title_ko}
        </p>
        <p className="truncate text-xs text-gray-500 italic dark:text-gray-400">
          {artwork.title_en}
        </p>
        {artwork.artist_name_ko !== null && (
          <p className="truncate text-xs text-gray-600 dark:text-gray-300">
            {artwork.artist_name_ko}
          </p>
        )}
      </div>
    </button>
  );
}
