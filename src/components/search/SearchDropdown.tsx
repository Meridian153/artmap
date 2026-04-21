// 검색 드롭다운 — SearchBar 아래에 붙어 상태별(idle/typing/loading/success/empty/error) UI를 렌더
// 카테고리(화가·작품·미술관)별로 섹션을 나누어 항목을 나열하고, 전체 매칭 수가 표시 수를 초과하면 안내 문구를 붙인다.
// 루트 컨테이너는 ARIA listbox로 노출되어 SearchBar의 combobox와 연결된다.

"use client";

import type { SearchResult } from "@/types/search";
import { SearchArtistItem } from "./SearchArtistItem";
import { SearchArtworkItem } from "./SearchArtworkItem";
import { SearchMuseumItem } from "./SearchMuseumItem";

// 검색 UI 전반에서 공유되는 상태 타입 — SearchBar와 SearchDropdown이 함께 사용한다.
export type SearchStatus = "idle" | "typing" | "loading" | "success" | "empty" | "error";

export type SearchDropdownProps = {
  status: SearchStatus;
  results: SearchResult | null;
  // 현재 활성화된 플랫 인덱스(-1이면 활성 항목 없음) — SearchBar가 관리한다.
  activeIndex: number;
  onItemClick: (path: string) => void;
};

// 드롭다운 컨테이너 공통 스타일
const DROPDOWN_WRAPPER_CLASS =
  "absolute top-full left-0 z-50 mt-1 max-h-80 w-full overflow-y-auto rounded-lg border border-gray-200 bg-white shadow-lg dark:border-gray-700 dark:bg-gray-900";

// 루트 컨테이너 공통 ARIA 속성 — combobox의 aria-controls 대상이다.
const LISTBOX_ARIA = {
  id: "search-listbox",
  role: "listbox" as const,
  "aria-label": "검색 결과",
};

export function SearchDropdown({ status, results, activeIndex, onItemClick }: SearchDropdownProps) {
  // idle/typing은 드롭다운을 닫아야 하므로 null 반환 (SearchBar에서도 isOpen=false로 제어됨)
  if (status === "idle" || status === "typing") {
    return null;
  }

  // loading 중 이전 결과가 없으면 중앙 스피너, 있으면 기존 결과 위에 로딩 바 오버레이
  if (status === "loading" && results === null) {
    return (
      <div {...LISTBOX_ARIA} className={DROPDOWN_WRAPPER_CLASS}>
        <div className="flex items-center justify-center py-8">
          <div
            className="h-5 w-5 animate-spin rounded-full border-2 border-gray-300 border-t-gray-600"
            aria-label="검색 중"
            role="status"
          />
        </div>
      </div>
    );
  }

  if (status === "empty") {
    return (
      <div {...LISTBOX_ARIA} className={DROPDOWN_WRAPPER_CLASS}>
        <p className="py-6 text-center text-sm text-gray-500 dark:text-gray-400">
          검색 결과가 없습니다
        </p>
      </div>
    );
  }

  if (status === "error") {
    return (
      <div {...LISTBOX_ARIA} className={DROPDOWN_WRAPPER_CLASS}>
        <p className="py-6 text-center text-sm text-red-600 dark:text-red-400">
          검색 중 오류가 발생했습니다
        </p>
      </div>
    );
  }

  // success 또는 (loading + 이전 results 보존) 상태 — 카테고리별 섹션 렌더
  if (results === null) {
    return null;
  }

  const { artists, artworks, museums, artists_total, artworks_total, museums_total } = results;
  const hasAny = artists.length > 0 || artworks.length > 0 || museums.length > 0;

  if (!hasAny) {
    return (
      <div {...LISTBOX_ARIA} className={DROPDOWN_WRAPPER_CLASS}>
        <p className="py-6 text-center text-sm text-gray-500 dark:text-gray-400">
          검색 결과가 없습니다
        </p>
      </div>
    );
  }

  // 카테고리별 시작 인덱스 — 화가→작품→미술관 순서로 연속 번호를 부여한다.
  // 자식 카드의 index는 이 시작값에 각 카테고리 내 인덱스를 더해 구한다.
  const artistStart = 0;
  const artworkStart = artists.length;
  const museumStart = artists.length + artworks.length;

  return (
    <div {...LISTBOX_ARIA} className={DROPDOWN_WRAPPER_CLASS}>
      {/* loading 중이지만 이전 결과가 있으면 상단에 2px 로딩 바로 진행 중임을 표시 */}
      {status === "loading" && (
        <div
          className="sticky top-0 h-0.5 w-full animate-pulse bg-gray-400"
          aria-label="검색 중"
          role="status"
        />
      )}

      {/* 화가 섹션 — 우선순위 1 */}
      {artists.length > 0 && (
        <section className="border-b border-gray-100 py-2 last:border-b-0 dark:border-gray-800">
          <h3 className="px-3 py-1 text-xs font-semibold tracking-wider text-gray-500 uppercase dark:text-gray-400">
            화가
          </h3>
          <ul>
            {artists.map((artist, i) => {
              const index = artistStart + i;
              return (
                <li key={artist.id}>
                  <SearchArtistItem
                    artist={artist}
                    index={index}
                    isActive={activeIndex === index}
                    onClick={onItemClick}
                  />
                </li>
              );
            })}
          </ul>
          {/* 전체 매칭 수가 표시 수보다 많으면 안내 문구로 나머지가 더 있음을 알림 */}
          {artists_total > artists.length && (
            <p className="px-3 py-1 text-xs text-gray-500 dark:text-gray-400">
              화가 {artists_total}명 중 {artists.length}명 표시
            </p>
          )}
        </section>
      )}

      {/* 작품 섹션 — 우선순위 2 */}
      {artworks.length > 0 && (
        <section className="border-b border-gray-100 py-2 last:border-b-0 dark:border-gray-800">
          <h3 className="px-3 py-1 text-xs font-semibold tracking-wider text-gray-500 uppercase dark:text-gray-400">
            작품
          </h3>
          <ul>
            {artworks.map((artwork, i) => {
              const index = artworkStart + i;
              return (
                <li key={artwork.id}>
                  <SearchArtworkItem
                    artwork={artwork}
                    index={index}
                    isActive={activeIndex === index}
                    onClick={onItemClick}
                  />
                </li>
              );
            })}
          </ul>
          {artworks_total > artworks.length && (
            <p className="px-3 py-1 text-xs text-gray-500 dark:text-gray-400">
              작품 {artworks_total}개 중 {artworks.length}개 표시
            </p>
          )}
        </section>
      )}

      {/* 미술관 섹션 — 우선순위 3 */}
      {museums.length > 0 && (
        <section className="border-b border-gray-100 py-2 last:border-b-0 dark:border-gray-800">
          <h3 className="px-3 py-1 text-xs font-semibold tracking-wider text-gray-500 uppercase dark:text-gray-400">
            미술관
          </h3>
          <ul>
            {museums.map((museum, i) => {
              const index = museumStart + i;
              return (
                <li key={museum.id}>
                  <SearchMuseumItem
                    museum={museum}
                    index={index}
                    isActive={activeIndex === index}
                    onClick={onItemClick}
                  />
                </li>
              );
            })}
          </ul>
          {museums_total > museums.length && (
            <p className="px-3 py-1 text-xs text-gray-500 dark:text-gray-400">
              미술관 {museums_total}개 중 {museums.length}개 표시
            </p>
          )}
        </section>
      )}
    </div>
  );
}
