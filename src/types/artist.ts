// 화가 관련 타입 정의 — GET /artists, /artists/{id} 응답 구조와 1:1 일치

/** 사조 항목(목록 응답용) — period 정보 없음 */
export type ArtistMovementSummary = {
  name_ko: string;
  name_en: string;
};

/** 사조 항목(상세 응답용) — period 정보 포함 */
export type ArtistMovementDetail = {
  name_ko: string;
  name_en: string;
  period_start: number | null;
  period_end: number | null;
};

/** 화가 목록 카드 (GET /artists 응답의 data 항목) */
export type ArtistSummary = {
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
  /** 국적 원문 (단일 문자열) */
  nationality: string | null;
  /** 대표 이미지 URL */
  thumbnail_url: string | null;
  /** 작품 수 */
  artwork_count: number;
  /** 소속 사조 목록 */
  movements: ArtistMovementSummary[];
};

/** 화가 상세 (GET /artists/{id} 응답) — artwork_count 미포함 */
export type ArtistDetail = {
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
  /** 국적 원문 */
  nationality: string | null;
  /** 작가 소개 (한국어) */
  bio_ko: string | null;
  /** 작가 소개 (영어) */
  bio_en: string | null;
  /** 대표 이미지 URL */
  thumbnail_url: string | null;
  /** 소속 사조 목록 (period 정보 포함) */
  movements: ArtistMovementDetail[];
};
