// 작품 관련 타입 정의 — GET /artworks, /artworks/{id}, /museums/{id}/artworks,
// /artists/{id}/artworks 응답 구조와 1:1 일치

/** 작품 전시 상태 — DB의 enum 값 4종 */
export type ArtworkStatus = "on_display" | "in_storage" | "on_loan" | "under_restoration";

/** 작품 카드의 화가 중첩 (목록 응답에서 사용) */
export type ArtworkArtistRef = {
  id: string;
  name_ko: string | null;
  name_en: string | null;
};

/**
 * 미술관 소장 목록 카드 (GET /museums/{id}/artworks 응답의 data 항목)
 *
 * 이 엔드포인트만 year_label, thumbnail_url 명칭으로 응답하므로 별도 타입을 유지함.
 */
export type MuseumArtworkSummary = {
  /** 작품 UUID */
  id: string;
  /** 작품명 (한국어) */
  title_ko: string;
  /** 작품명 (영어) */
  title_en: string;
  /** 제작 연도 표시용 문자열 — API가 year_created를 문자열로 직렬화 */
  year_label: string | null;
  /** 대표 이미지 URL — API가 image_url을 thumbnail_url 명칭으로 반환 */
  thumbnail_url: string | null;
  /** 전시 상태 */
  status: ArtworkStatus;
  /** 화가 정보 (없으면 null) */
  artist: ArtworkArtistRef | null;
};

/**
 * 작품 카드 공통 형태 — 화가/미술관 정보를 포함하지 않는 최소 골격
 *
 * 어떤 엔드포인트도 이 형태 그대로 반환하지는 않으며, ArtworkSummaryWithMuseum의
 * 베이스 구조로만 사용됨.
 */
export type ArtworkSummary = {
  /** 작품 UUID */
  id: string;
  /** 작품명 (한국어) */
  title_ko: string;
  /** 작품명 (영어) */
  title_en: string;
  /** 제작 시작 연도 */
  year_created: number | null;
  /** 대표 이미지 URL */
  image_url: string | null;
  /** 전시 상태 */
  status: ArtworkStatus;
};

/**
 * 미술관명을 함께 반환하는 작품 카드
 * (GET /artworks, GET /artists/{id}/artworks 응답의 data 항목)
 *
 * museum_id는 반환되지 않으므로 미술관 링크는 불가능 (기술 부채 #2).
 */
export type ArtworkSummaryWithMuseum = ArtworkSummary & {
  /** 현재 소장 미술관명 (한국어) */
  museum_name_ko: string | null;
  /** 현재 소장 미술관명 (영어) */
  museum_name_en: string | null;
};

/** 작품 상세의 화가 중첩 — 최소 정보만 반환 */
export type ArtworkDetailArtist = {
  id: string;
  name_ko: string | null;
  name_en: string | null;
};

/** 작품 상세의 원소장처(primary_museum) 중첩 */
export type ArtworkPrimaryMuseum = {
  id: string;
  name_ko: string;
  name_en: string;
  city: string;
  country_code: string;
  latitude: number;
  longitude: number;
};

/** 작품 상세의 현재 전시 위치(current_location) 중첩 */
export type ArtworkCurrentLocation = {
  museum_id: string | null;
  museum_name_ko: string | null;
  museum_name_en: string | null;
  city: string | null;
  country_code: string | null;
  latitude: number | null;
  longitude: number | null;
  start_date: string;
  end_date: string | null;
};

/** 작품 상세 (GET /artworks/{id} 응답) */
export type ArtworkDetail = {
  /** 작품 UUID */
  id: string;
  /** 작품명 (한국어) */
  title_ko: string;
  /** 작품명 (영어) */
  title_en: string;
  /** 제작 시작 연도 */
  year_created: number | null;
  /** 제작 종료 연도 (단일 연도면 null) */
  year_end: number | null;
  /** 제작 기법/재료 (한국어) */
  medium_ko: string | null;
  /** 제작 기법/재료 (영어) */
  medium_en: string | null;
  /** 크기 정보 (예: "73.7 × 92.1 cm") */
  dimensions: string | null;
  /** 대표 이미지 URL */
  image_url: string | null;
  /** 퍼블릭 도메인 여부 */
  is_public_domain: boolean;
  /** 전시 상태 */
  status: ArtworkStatus;
  /** 큐레이터 설명 (한국어) */
  curation_ko: string | null;
  /** 큐레이터 설명 (영어) */
  curation_en: string | null;
  /** 화가 정보 (없으면 null) */
  artist: ArtworkDetailArtist | null;
  /** 원소장처 미술관 (없으면 null) */
  primary_museum: ArtworkPrimaryMuseum | null;
  /** 현재 전시 위치 (없으면 null) */
  current_location: ArtworkCurrentLocation | null;
};
