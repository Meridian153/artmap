// 통합 검색 관련 타입 정의 — GET /search 응답 구조와 1:1 일치

/** 검색 결과 내 화가 항목 */
export type SearchArtistItem = {
  /** 화가 UUID */
  id: string;
  /** 화가명 (한국어) */
  name_ko: string;
  /** 화가명 (영어) */
  name_en: string;
  /** 대표 이미지 URL */
  thumbnail_url: string | null;
};

/** 검색 결과 내 작품 항목 */
export type SearchArtworkItem = {
  /** 작품 UUID */
  id: string;
  /** 작품명 (한국어) */
  title_ko: string;
  /** 작품명 (영어) */
  title_en: string;
  /** 화가명 (한국어) — 없으면 null */
  artist_name_ko: string | null;
  /** 대표 이미지 URL */
  image_url: string | null;
};

/** 검색 결과 내 미술관 항목 */
export type SearchMuseumItem = {
  /** 미술관 UUID */
  id: string;
  /** 미술관명 (한국어) */
  name_ko: string;
  /** 미술관명 (영어) */
  name_en: string;
  /** 도시명 — 없으면 null */
  city: string | null;
  /** ISO 3166-1 alpha-2 국가 코드 */
  country_code: string;
};

/** 통합 검색 결과 응답 (GET /search 응답) */
export type SearchResult = {
  /** 검색어 */
  query: string;
  /** 현재 페이지 번호 */
  page: number;
  /** 페이지당 항목 수(또는 autocomplete limit) */
  per_page: number;
  /** 화가 카테고리 전체 매칭 수 */
  artists_total: number;
  /** 작품 카테고리 전체 매칭 수 */
  artworks_total: number;
  /** 미술관 카테고리 전체 매칭 수 */
  museums_total: number;
  /** 화가 검색 결과 */
  artists: SearchArtistItem[];
  /** 작품 검색 결과 */
  artworks: SearchArtworkItem[];
  /** 미술관 검색 결과 */
  museums: SearchMuseumItem[];
};
