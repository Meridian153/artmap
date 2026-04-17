// 작품 관련 타입 정의 — 목록 카드(미술관용/공통), 상세 정보 포함

/** 작품 전시 상태 */
export type ArtworkStatus =
  | "on_display"
  | "on_loan"
  | "in_storage"
  | "under_restoration"
  | "unknown";

/** 작품 목록 카드 — 미술관 소장 목록용 (GET /museums/{id}/artworks 응답) */
export type ArtworkSummary = {
  /** 작품 UUID */
  id: string;
  /** 작품명 (한국어) */
  title_ko: string;
  /** 작품명 (영어) */
  title_en: string;
  /** 제작 연도 (표시용 문자열, 예: "1889", "c.1865–1870") */
  year_label: string | null;
  /** 화가 정보 */
  artist: {
    id: string;
    name_ko: string;
    name_en: string;
  };
  /** 전시 상태 */
  status: ArtworkStatus;
  /** 대표 이미지 URL */
  thumbnail_url: string | null;
};

/** 작품 목록 카드 — 미술관명 포함 (GET /artists/{id}/artworks, GET /artworks 응답) */
export type ArtworkSummaryWithMuseum = ArtworkSummary & {
  /** 현재 소장 미술관 정보 */
  current_museum: {
    id: string;
    name_ko: string;
    name_en: string;
    city_ko: string;
    city_en: string;
    country_ko: string;
    country_en: string;
    country_code: string;
  } | null;
};

/** 작품 상세 정보 (GET /artworks/{id} 응답) */
export type ArtworkDetail = {
  /** 작품 UUID */
  id: string;
  /** 작품명 (한국어) */
  title_ko: string;
  /** 작품명 (영어) */
  title_en: string;
  /** 제작 연도 (표시용 문자열) */
  year_label: string | null;
  /** 제작 기법/재료 (한국어) */
  medium_ko: string | null;
  /** 제작 기법/재료 (영어) */
  medium_en: string | null;
  /** 크기 정보 (예: "73.7 × 92.1 cm") */
  dimensions: string | null;
  /** 큐레이터 설명 (한국어) */
  curation_ko: string | null;
  /** 큐레이터 설명 (영어) */
  curation_en: string | null;
  /** 전시 상태 */
  status: ArtworkStatus;
  /** 대표 이미지 URL */
  image_url: string | null;
  /** 퍼블릭 도메인 여부 */
  is_public_domain: boolean;
  /** 화가 정보 */
  artist: {
    id: string;
    name_ko: string;
    name_en: string;
    nationality_ko: string;
    nationality_en: string;
    birth_year: number | null;
    death_year: number | null;
  };
  /** 원소장처 미술관 정보 */
  primary_museum: {
    id: string;
    name_ko: string;
    name_en: string;
    city_ko: string;
    city_en: string;
    country_ko: string;
    country_en: string;
    country_code: string;
    latitude: number;
    longitude: number;
  } | null;
  /** 현재 전시 위치 — on_loan 상태일 때만 존재 */
  current_location: {
    museum_id: string | null;
    museum_name_ko: string;
    museum_name_en: string;
    city_ko: string;
    city_en: string;
    country_ko: string;
    country_en: string;
    country_code: string;
    latitude: number;
    longitude: number;
    start_date: string;
    end_date: string | null;
  } | null;
};
