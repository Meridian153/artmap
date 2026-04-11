// 통합 검색 관련 타입 정의 — GET /search 응답에 사용

/** 통합 검색 결과 응답 (GET /search 응답) */
export interface SearchResult {
  /** 검색어 */
  query: string;
  /** 화가 검색 결과 */
  artists: SearchArtistItem[];
  /** 작품 검색 결과 */
  artworks: SearchArtworkItem[];
  /** 미술관 검색 결과 */
  museums: SearchMuseumItem[];
}

/** 검색 결과 내 화가 항목 */
export interface SearchArtistItem {
  /** 화가 UUID */
  id: string;
  /** 화가명 (한국어) */
  name_ko: string;
  /** 화가명 (영어) */
  name_en: string;
  /** 국적 (한국어) */
  nationality_ko: string;
  /** 국적 (영어) */
  nationality_en: string;
  /** 대표 이미지 URL */
  thumbnail_url: string | null;
}

/** 검색 결과 내 작품 항목 */
export interface SearchArtworkItem {
  /** 작품 UUID */
  id: string;
  /** 작품명 (한국어) */
  title_ko: string;
  /** 작품명 (영어) */
  title_en: string;
  /** 화가명 (한국어) */
  artist_name_ko: string;
  /** 화가명 (영어) */
  artist_name_en: string;
  /** 대표 이미지 URL */
  thumbnail_url: string | null;
}

/** 검색 결과 내 미술관 항목 */
export interface SearchMuseumItem {
  /** 미술관 UUID */
  id: string;
  /** 미술관명 (한국어) */
  name_ko: string;
  /** 미술관명 (영어) */
  name_en: string;
  /** 도시명 (한국어) */
  city_ko: string;
  /** 도시명 (영어) */
  city_en: string;
  /** 국가명 (한국어) */
  country_ko: string;
  /** 국가명 (영어) */
  country_en: string;
  /** 대표 이미지 URL */
  thumbnail_url: string | null;
}
