// 미술관 관련 타입 정의 — 목록 카드, 상세 정보, 장소 정보 포함

/** 장소 정보 — MuseumDetail 내부에 포함되는 위치 데이터 */
export interface PlaceInfo {
  /** 위도 */
  latitude: number
  /** 경도 */
  longitude: number
  /** 도시명 (한국어) */
  city_ko: string
  /** 도시명 (영어) */
  city_en: string
  /** 국가명 (한국어) */
  country_ko: string
  /** 국가명 (영어) */
  country_en: string
  /** ISO 3166-1 alpha-2 국가 코드 */
  country_code: string
  /** 도로명 주소 */
  address: string | null
}

/** 미술관 목록 카드 데이터 (GET /museums 응답의 data 항목) */
export interface MuseumSummary {
  /** 미술관 UUID */
  id: string
  /** 미술관명 (한국어) */
  name_ko: string
  /** 미술관명 (영어) */
  name_en: string
  /** 도시명 (한국어) */
  city_ko: string
  /** 도시명 (영어) */
  city_en: string
  /** 국가명 (한국어) */
  country_ko: string
  /** 국가명 (영어) */
  country_en: string
  /** ISO 3166-1 alpha-2 국가 코드 */
  country_code: string
  /** 소장 작품 수 */
  artwork_count: number
  /** 대표 이미지 URL */
  thumbnail_url: string | null
}

/** 미술관 상세 정보 (GET /museums/{id} 응답) */
export interface MuseumDetail {
  /** 미술관 UUID */
  id: string
  /** 미술관명 (한국어) */
  name_ko: string
  /** 미술관명 (영어) */
  name_en: string
  /** 미술관 소개 (한국어) */
  description_ko: string | null
  /** 미술관 소개 (영어) */
  description_en: string | null
  /** 공식 웹사이트 URL */
  website_url: string | null
  /** 소장 작품 수 */
  artwork_count: number
  /** 대표 이미지 URL */
  thumbnail_url: string | null
  /** 장소 정보 */
  place: PlaceInfo
}
