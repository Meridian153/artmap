// Mock 지도 데이터 — 국가별 작품 수 집계 샘플 데이터
// PENDING_BE: museum_count 필드 — 실 API 반영 시 이 주석 제거

import type { CountryMapData } from "@/types/map";

/** 국가별 작품 수 집계 Mock 데이터 (GET /map/countries) */
export const mockCountryMapData: CountryMapData[] = [
  {
    country_code: "FR",
    country_name_ko: "프랑스",
    country_name_en: "France",
    artwork_count: 68,
    museum_count: 2,
    latitude: 46.2276,
    longitude: 2.2137,
  },
  {
    country_code: "NL",
    country_name_ko: "네덜란드",
    country_name_en: "Netherlands",
    artwork_count: 45,
    museum_count: 1,
    latitude: 52.1326,
    longitude: 5.2913,
  },
  {
    country_code: "US",
    country_name_ko: "미국",
    country_name_en: "United States",
    artwork_count: 87,
    museum_count: 1,
    latitude: 37.0902,
    longitude: -95.7129,
  },
  {
    country_code: "IT",
    country_name_ko: "이탈리아",
    country_name_en: "Italy",
    artwork_count: 53,
    museum_count: 1,
    latitude: 41.8719,
    longitude: 12.5674,
  },
  {
    country_code: "KR",
    country_name_ko: "대한민국",
    country_name_en: "South Korea",
    artwork_count: 22,
    museum_count: 1,
    latitude: 35.9078,
    longitude: 127.7669,
  },
];
