// 검색 드롭다운 내 작품 항목 카드 — 썸네일·작품명(한/영)·화가명을 표시
// 클릭 시 onClick 콜백으로 상세 페이지 경로를 전달한다.
// ARIA role="option"과 keyboard activeIndex 기반 강조 스타일을 담당한다.

"use client";

import { useEffect, useRef } from "react";
import Image from "next/image";
import type { SearchArtworkItem as SearchArtworkItemData } from "@/types/search";

export type SearchArtworkItemProps = {
  artwork: SearchArtworkItemData;
  // 플랫 배열 내 인덱스 — SearchDropdown이 계산해 전달한다.
  index: number;
  // 현재 activeIndex와 일치하여 키보드 포커스가 머물고 있는지 여부
  isActive: boolean;
  onClick: (path: string) => void;
};

export function SearchArtworkItem({ artwork, index, isActive, onClick }: SearchArtworkItemProps) {
  // 상세 페이지 경로 — IA 문서 기준: /artworks/{id}
  const path = `/artworks/${artwork.id}`;

  // 활성 상태가 되면 버튼을 가시 영역으로 스크롤한다.
  const buttonRef = useRef<HTMLButtonElement | null>(null);
  useEffect(() => {
    if (isActive && buttonRef.current) {
      buttonRef.current.scrollIntoView({ block: "nearest" });
    }
  }, [isActive]);

  // 활성 상태의 배경 — hover와 동일한 색을 고정으로 적용
  const activeClass = isActive ? "bg-gray-100 dark:bg-gray-800" : "";

  return (
    <button
      ref={buttonRef}
      type="button"
      id={`search-option-${index}`}
      role="option"
      aria-selected={isActive}
      onClick={() => onClick(path)}
      className={`flex w-full items-center gap-3 px-3 py-2 text-left transition-colors hover:bg-gray-100 dark:hover:bg-gray-800 ${activeClass}`}
    >
      {/* 썸네일 — URL이 있으면 next/image, 없으면 회색 플레이스홀더 */}
      {artwork.image_url ? (
        <Image
          src={artwork.image_url}
          alt={`${artwork.title_ko} 썸네일`}
          width={32}
          height={32}
          className="h-8 w-8 shrink-0 rounded object-cover"
          unoptimized
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
