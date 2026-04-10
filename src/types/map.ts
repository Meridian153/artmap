// 지도 관련 타입 정의 — 국가별 작품 수 집계 등 지도 시각화에 사용

/** 국가별 작품 수 집계 데이터 (GET /map/countries 응답) */
export interface CountryMapData {
  /** ISO 3166-1 alpha-2 국가 코드 */
  country_code: string;
  /** 국가명 (한국어) */
  country_name_ko: string;
  /** 국가명 (영어) */
  country_name_en: string;
  /** 해당 국가에 소장된 작품 수 */
  artwork_count: number;
  /** 해당 국가 내 미술관 수 */
  museum_count: number;
}
