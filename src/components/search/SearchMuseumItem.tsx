// 검색 드롭다운 내 미술관 항목 카드 — 미술관명(한/영)·도시·국가 코드를 표시
// 클릭 시 onClick 콜백으로 상세 페이지 경로를 전달한다.
// ARIA role="option"과 keyboard activeIndex 기반 강조 스타일을 담당한다.

"use client";

import { useEffect, useRef } from "react";
import type { SearchMuseumItem as SearchMuseumItemData } from "@/types/search";

export type SearchMuseumItemProps = {
  museum: SearchMuseumItemData;
  // 플랫 배열 내 인덱스 — SearchDropdown이 계산해 전달한다.
  index: number;
  // 현재 activeIndex와 일치하여 키보드 포커스가 머물고 있는지 여부
  isActive: boolean;
  onClick: (path: string) => void;
};

export function SearchMuseumItem({ museum, index, isActive, onClick }: SearchMuseumItemProps) {
  // 상세 페이지 경로 — IA 문서 기준: /museums/{id}
  const path = `/museums/${museum.id}`;

  // 위치 표기 — city가 있으면 "city, country_code", 없으면 country_code만
  const location =
    museum.city !== null ? `${museum.city}, ${museum.country_code}` : museum.country_code;

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
      {/* 미술관 아이콘 — 미술관은 썸네일 필드가 API에 없으므로 고정 아이콘 */}
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
          strokeLinecap="round"
          strokeLinejoin="round"
        >
          <path d="M3 10l9-6 9 6" />
          <path d="M5 10v9h14v-9" />
          <path d="M9 19v-5h6v5" />
        </svg>
      </div>
      {/* 텍스트 영역 — 한글명/영문명/위치 */}
      <div className="min-w-0 flex-1">
        <p className="truncate text-sm font-semibold text-gray-900 dark:text-gray-100">
          {museum.name_ko}
        </p>
        <p className="truncate text-xs text-gray-500 italic dark:text-gray-400">{museum.name_en}</p>
        <p className="truncate text-xs text-gray-600 dark:text-gray-300">{location}</p>
      </div>
    </button>
  );
}
