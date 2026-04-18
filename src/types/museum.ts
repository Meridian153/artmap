// 미술관 관련 타입 정의 — GET /museums, /museums/{id} 응답 구조와 1:1 일치

/** 기관(미술관) 분류 — institutions.institution_type */
export type InstitutionType = "museum" | "gallery" | "private_collection" | "foundation";

/** 운영시간 — DB의 jsonb 원형. 내부 스키마 미정의로 unknown 처리 */
export type OpeningHours = Record<string, unknown> | null;

/** 입장료 — DB의 jsonb 원형. 내부 스키마 미정의로 unknown 처리 */
export type Admission = Record<string, unknown> | null;

/** 장소 정보 — MuseumDetail.place에 포함됨 (places 테이블) */
export type PlaceInfo = {
  /** 장소 표시명(한국어) — places.name_ko (nullable) */
  name_ko: string | null;
  /** 장소 표시명(영어) — places.name_en (nullable) */
  name_en: string | null;
  /** 국가명 원문 — places.country */
  country: string;
  /** 도시명 — places.city */
  city: string;
  /** 도로명 주소 */
  address: string | null;
  /** 위도 */
  latitude: number;
  /** 경도 */
  longitude: number;
  /** 운영시간 (jsonb 원형) */
  opening_hours: OpeningHours;
  /** 입장료 (jsonb 원형) */
  admission: Admission;
};

/** 미술관 목록 카드 (GET /museums 응답의 data 항목) */
export type MuseumSummary = {
  /** 미술관 UUID */
  id: string;
  /** 미술관명 (한국어) */
  name_ko: string;
  /** 미술관명 (영어) */
  name_en: string;
  /** 기관 분류 */
  institution_type: InstitutionType;
  /** ISO 3166-1 alpha-2 국가 코드 */
  country_code: string;
  /** 도시명 */
  city: string;
  /** 위도 */
  latitude: number;
  /** 경도 */
  longitude: number;
  /** 소장 작품 수 */
  artwork_count: number;
};

/** 미술관 상세 (GET /museums/{id} 응답) */
export type MuseumDetail = {
  /** 미술관 UUID */
  id: string;
  /** 미술관명 (한국어) */
  name_ko: string;
  /** 미술관명 (영어) */
  name_en: string;
  /** 기관 분류 */
  institution_type: InstitutionType;
  /** ISO 3166-1 alpha-2 국가 코드 */
  country_code: string;
  /** 미술관 소개 (한국어) */
  description_ko: string | null;
  /** 미술관 소개 (영어) */
  description_en: string | null;
  /** 공식 웹사이트 URL */
  website: string | null;
  /** 장소 정보 */
  place: PlaceInfo;
};
