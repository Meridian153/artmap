// Mock 검색 데이터 — 통합 검색 쿼리에 대한 필터링된 결과 반환
// 새 Types(SearchResult: page/per_page/totals 포함)에 맞춰 정합화됨.

import type { SearchResult } from "@/types/search";
import { mockArtists } from "./artists";
import { mockArtworks, mockArtworkDetail } from "./artworks";
import { mockMuseums } from "./museums";

const DEFAULT_PER_PAGE = 20;

/** 검색어로 필터링된 통합 검색 결과 반환 */
export function mockSearchResults(query: string): SearchResult {
  // 검색어가 없으면 빈 결과 반환 (페이지/총계는 0/0/0)
  if (!query.trim()) {
    return {
      query,
      page: 1,
      per_page: DEFAULT_PER_PAGE,
      artists_total: 0,
      artworks_total: 0,
      museums_total: 0,
      artists: [],
      artworks: [],
      museums: [],
    };
  }

  const q = query.toLowerCase();

  // 화가 이름(한/영) 필터링 → SearchArtistItem 형태로 매핑
  const artists = mockArtists
    .filter((a) => a.name_ko.toLowerCase().includes(q) || a.name_en.toLowerCase().includes(q))
    .map((a) => ({
      id: a.id,
      name_ko: a.name_ko,
      name_en: a.name_en,
      thumbnail_url: a.thumbnail_url,
    }));

  // 작품명(한/영) 및 화가명 필터링 → SearchArtworkItem 형태로 매핑
  // 화가명은 ArtworkSummaryWithMuseum에 없으므로 mockArtworkDetail에서 조회
  const artworks = mockArtworks
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
    });

  // 미술관명(한/영) 및 도시명 필터링 → SearchMuseumItem 형태로 매핑
  const museums = mockMuseums
    .filter(
      (m) =>
        m.name_ko.toLowerCase().includes(q) ||
        m.name_en.toLowerCase().includes(q) ||
        m.city.toLowerCase().includes(q),
    )
    .map((m) => ({
      id: m.id,
      name_ko: m.name_ko,
      name_en: m.name_en,
      city: m.city,
      country_code: m.country_code,
    }));

  return {
    query,
    page: 1,
    per_page: DEFAULT_PER_PAGE,
    artists_total: artists.length,
    artworks_total: artworks.length,
    museums_total: museums.length,
    artists,
    artworks,
    museums,
  };
}
