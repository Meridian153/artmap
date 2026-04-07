// Mock 검색 데이터 — 통합 검색 쿼리에 대한 필터링된 결과 반환

import type { SearchResult } from '@/types/search'
import { mockArtists } from './artists'
import { mockArtworks } from './artworks'
import { mockMuseums } from './museums'

/** 검색어로 필터링된 통합 검색 결과 반환 */
export function mockSearchResults(query: string): SearchResult {
  // 검색어가 없으면 빈 결과 반환
  if (!query.trim()) {
    return { query, artists: [], artworks: [], museums: [] }
  }

  const q = query.toLowerCase()

  // 화가 이름(한/영) 필터링
  const artists = mockArtists
    .filter(
      (a) =>
        a.name_ko.toLowerCase().includes(q) ||
        a.name_en.toLowerCase().includes(q)
    )
    .map((a) => ({
      id: a.id,
      name_ko: a.name_ko,
      name_en: a.name_en,
      nationality_ko: a.nationality_ko,
      nationality_en: a.nationality_en,
      thumbnail_url: a.thumbnail_url,
    }))

  // 작품명(한/영) 및 화가명 필터링
  const artworks = mockArtworks
    .filter(
      (aw) =>
        aw.title_ko.toLowerCase().includes(q) ||
        aw.title_en.toLowerCase().includes(q) ||
        aw.artist.name_ko.toLowerCase().includes(q) ||
        aw.artist.name_en.toLowerCase().includes(q)
    )
    .map((aw) => ({
      id: aw.id,
      title_ko: aw.title_ko,
      title_en: aw.title_en,
      artist_name_ko: aw.artist.name_ko,
      artist_name_en: aw.artist.name_en,
      thumbnail_url: aw.thumbnail_url,
    }))

  // 미술관명(한/영) 및 도시명 필터링
  const museums = mockMuseums
    .filter(
      (m) =>
        m.name_ko.toLowerCase().includes(q) ||
        m.name_en.toLowerCase().includes(q) ||
        m.city_ko.toLowerCase().includes(q) ||
        m.city_en.toLowerCase().includes(q)
    )
    .map((m) => ({
      id: m.id,
      name_ko: m.name_ko,
      name_en: m.name_en,
      city_ko: m.city_ko,
      city_en: m.city_en,
      country_ko: m.country_ko,
      country_en: m.country_en,
      thumbnail_url: m.thumbnail_url,
    }))

  return { query, artists, artworks, museums }
}
