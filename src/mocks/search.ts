// Mock 검색 데이터 — 통합 검색 쿼리에 대한 필터링된 결과 반환
// 새 Types(SearchResult: page/per_page/totals 포함)에 맞춰 정합화됨.

import type { SearchResult } from "@/types/search";
import { mockArtists } from "./artists";
import { mockArtworks, mockArtworkDetail } from "./artworks";
import { mockMuseums } from "./museums";

const DEFAULT_PER_PAGE = 20;

type MockSearchOptions = {
  type?: string;
  /** 카테고리별 최대 반환 수. page 없이 사용하는 자동완성 모드에 적용. */
  limit?: number;
  page?: number;
  per_page?: number;
};

/** 검색어로 필터링된 통합 검색 결과 반환 */
export function mockSearchResults(query: string, options?: MockSearchOptions): SearchResult {
  const resolvedPage = options?.page ?? 1;
  const resolvedPerPage = options?.per_page ?? DEFAULT_PER_PAGE;

  // 검색어가 없으면 빈 결과 반환 (페이지/총계는 0/0/0)
  if (!query.trim()) {
    return {
      query,
      page: resolvedPage,
      per_page: resolvedPerPage,
      artists_total: 0,
      artworks_total: 0,
      museums_total: 0,
      artists: [],
      artworks: [],
      museums: [],
    };
  }

  const q = query.toLowerCase();
  // type 파라미터: "all" 또는 미지정이면 모든 카테고리 반환
  const typeFilter = options?.type ?? "all";

  // 화가 이름(한/영) 필터링 → SearchArtistItem 형태로 매핑
  const allArtists =
    typeFilter === "all" || typeFilter === "artist"
      ? mockArtists
          .filter((a) => a.name_ko.toLowerCase().includes(q) || a.name_en.toLowerCase().includes(q))
          .map((a) => ({
            id: a.id,
            name_ko: a.name_ko,
            name_en: a.name_en,
            thumbnail_url: a.thumbnail_url,
          }))
      : [];

  // 작품명(한/영) 및 화가명 필터링 → SearchArtworkItem 형태로 매핑
  // 화가명은 ArtworkSummaryWithMuseum에 없으므로 mockArtworkDetail에서 조회
  const allArtworks =
    typeFilter === "all" || typeFilter === "artwork"
      ? mockArtworks
          .filter((aw) => {
            const detail = mockArtworkDetail[aw.id];
            const artistKo = detail?.artist?.name_ko ?? "";
            const artistEn = detail?.artist?.name_en ?? "";
            return (
              aw.title_ko.toLowerCase().includes(q) ||
              aw.title_en.toLowerCase().includes(q) ||
              artistKo.toLowerCase().includes(q) ||
              artistEn.toLowerCase().includes(q)
            );
          })
          .map((aw) => {
            const detail = mockArtworkDetail[aw.id];
            return {
              id: aw.id,
              title_ko: aw.title_ko,
              title_en: aw.title_en,
              artist_name_ko: detail?.artist?.name_ko ?? null,
              image_url: aw.image_url,
            };
          })
      : [];

  // 미술관명(한/영) 및 도시명 필터링 → SearchMuseumItem 형태로 매핑
  const allMuseums =
    typeFilter === "all" || typeFilter === "museum"
      ? mockMuseums
          .filter(
            (m) =>
              m.name_ko.toLowerCase().includes(q) ||
              m.name_en.toLowerCase().includes(q) ||
              (m.city ?? "").toLowerCase().includes(q),
          )
          .map((m) => ({
            id: m.id,
            name_ko: m.name_ko,
            name_en: m.name_en,
            city: m.city,
            country_code: m.country_code,
          }))
      : [];

  // limit이 지정된 경우 각 카테고리 반환 수를 제한 (자동완성 모드)
  const cap = options?.limit;
  const artists = cap !== undefined ? allArtists.slice(0, cap) : allArtists;
  const artworks = cap !== undefined ? allArtworks.slice(0, cap) : allArtworks;
  const museums = cap !== undefined ? allMuseums.slice(0, cap) : allMuseums;

  return {
    query,
    page: resolvedPage,
    per_page: resolvedPerPage,
    artists_total: allArtists.length,
    artworks_total: allArtworks.length,
    museums_total: allMuseums.length,
    artists,
    artworks,
    museums,
  };
}
