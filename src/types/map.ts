// 지도 관련 타입 정의 — GET /map/countries, GET /artists/{id}/map-data 응답 구조와 1:1 일치

/** 국가별 작품 수 집계 (GET /map/countries 응답의 항목) */
export type CountryMapData = {
  /** ISO 3166-1 alpha-2 국가 코드 */
  country_code: string;
  /** 국가명 (한국어) */
  country_name_ko: string;
  /** 국가명 (영어) */
  country_name_en: string;
  /** 해당 국가에 소장된 작품 수 */
  artwork_count: number;
  /** 국가 대표 위도 */
  latitude: number;
  /** 국가 대표 경도 */
  longitude: number;
};

/** 화가의 국가별 작품 분포 (GET /artists/{id}/map-data 응답의 항목) */
export type ArtistCountryDistribution = {
  /** ISO 3166-1 alpha-2 국가 코드 */
  country_code: string;
  /** 국가명 (한국어) */
  country_name_ko: string;
  /** 국가명 (영어) */
  country_name_en: string;
  /** 해당 국가에 소장된 작품 수 */
  artwork_count: number;
  /** 국가 대표 위도 */
  latitude: number;
  /** 국가 대표 경도 */
  longitude: number;
};
