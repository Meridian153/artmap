// 화가 관련 타입 정의 — 목록 카드, 상세 정보, 작품 분포 포함

/** 화가 목록 카드 데이터 (GET /artists 응답의 data 항목) */
export interface ArtistSummary {
  /** 화가 UUID */
  id: string;
  /** 화가명 (한국어) */
  name_ko: string;
  /** 화가명 (영어) */
  name_en: string;
  /** 출생 연도 */
  birth_year: number | null;
  /** 사망 연도 (생존 시 null) */
  death_year: number | null;
  /** 국적 (한국어) */
  nationality_ko: string;
  /** 국적 (영어) */
  nationality_en: string;
  /** 작품 수 */
  artwork_count: number;
  /** 대표 이미지 URL */
  thumbnail_url: string | null;
}

/** 화가 상세 정보 (GET /artists/{id} 응답) */
export interface ArtistDetail {
  /** 화가 UUID */
  id: string;
  /** 화가명 (한국어) */
  name_ko: string;
  /** 화가명 (영어) */
  name_en: string;
  /** 출생 연도 */
  birth_year: number | null;
  /** 사망 연도 (생존 시 null) */
  death_year: number | null;
  /** 국적 (한국어) */
  nationality_ko: string;
  /** 국적 (영어) */
  nationality_en: string;
  /** 작가 소개 (한국어) */
  biography_ko: string | null;
  /** 작가 소개 (영어) */
  biography_en: string | null;
  /** 대표 사조/스타일 (한국어) */
  style_ko: string | null;
  /** 대표 사조/스타일 (영어) */
  style_en: string | null;
  /** 작품 수 */
  artwork_count: number;
  /** 대표 이미지 URL */
  thumbnail_url: string | null;
}

/** 화가 작품의 국가별 분포 (GET /artists/{id}/map-data 응답) */
export interface ArtistCountryDistribution {
  /** ISO 3166-1 alpha-2 국가 코드 */
  country_code: string;
  /** 국가명 (한국어) */
  country_name_ko: string;
  /** 국가명 (영어) */
  country_name_en: string;
  /** 해당 국가에 소장된 작품 수 */
  artwork_count: number;
}
