// 검색 드롭다운 내 화가 항목 카드 — 썸네일·한글명·영문명을 한 줄로 표시
// 클릭 시 onClick 콜백으로 상세 페이지 경로를 전달한다.
// ARIA role="option"과 keyboard activeIndex 기반 강조 스타일을 담당한다.

"use client";

import { useEffect, useRef } from "react";
import Image from "next/image";
import type { SearchArtistItem as SearchArtistItemData } from "@/types/search";

export type SearchArtistItemProps = {
  artist: SearchArtistItemData;
  // 플랫 배열 내 인덱스 — SearchDropdown이 계산해 전달한다.
  index: number;
  // 현재 activeIndex와 일치하여 키보드 포커스가 머물고 있는지 여부
  isActive: boolean;
  onClick: (path: string) => void;
};

export function SearchArtistItem({ artist, index, isActive, onClick }: SearchArtistItemProps) {
  // 상세 페이지 경로 — IA 문서 기준: /artists/{id}
  const path = `/artists/${artist.id}`;

  // 활성 상태가 되면 버튼을 가시 영역으로 스크롤한다. (block: "nearest"로 최소 이동)
  const buttonRef = useRef<HTMLButtonElement | null>(null);
  useEffect(() => {
    if (isActive && buttonRef.current) {
      buttonRef.current.scrollIntoView({ block: "nearest" });
    }
  }, [isActive]);

  // 활성 상태의 배경 — hover와 동일한 색을 고정으로 적용해 키보드/마우스 경험을 일치시킨다
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
      {/* 썸네일 — URL이 있으면 next/image로 원형 표시, 없으면 회색 아바타 아이콘 */}
      {artist.thumbnail_url ? (
        <Image
          src={artist.thumbnail_url}
          alt={`${artist.name_ko} 프로필 사진`}
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
