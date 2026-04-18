// Mock 지도 데이터 — 국가별 작품 수 집계 샘플 데이터
// 새 Types(latitude/longitude 포함, museum_count 미포함)에 맞춰 정합화됨.

import type { CountryMapData } from "@/types/map";

/** 국가별 작품 수 집계 Mock 데이터 (GET /map/countries) */
export const mockCountryMapData: CountryMapData[] = [
  {
    country_code: "FR",
    country_name_ko: "프랑스",
    country_name_en: "France",
    artwork_count: 68,
    latitude: 46.2276,
    longitude: 2.2137,
  },
  {
    country_code: "NL",
    country_name_ko: "네덜란드",
    country_name_en: "Netherlands",
    artwork_count: 45,
    latitude: 52.1326,
    longitude: 5.2913,
  },
  {
    country_code: "US",
    country_name_ko: "미국",
    country_name_en: "United States",
    artwork_count: 87,
    latitude: 37.0902,
    longitude: -95.7129,
  },
  {
    country_code: "IT",
    country_name_ko: "이탈리아",
    country_name_en: "Italy",
    artwork_count: 53,
    latitude: 41.8719,
    longitude: 12.5674,
  },
  {
    country_code: "KR",
    country_name_ko: "대한민국",
    country_name_en: "South Korea",
    artwork_count: 22,
    latitude: 35.9078,
    longitude: 127.7669,
  },
  {
    country_code: "GB",
    country_name_ko: "영국",
    country_name_en: "United Kingdom",
    artwork_count: 31,
    latitude: 55.3781,
    longitude: -3.436,
  },
  {
    country_code: "ES",
    country_name_ko: "스페인",
    country_name_en: "Spain",
    artwork_count: 19,
    latitude: 40.4637,
    longitude: -3.7492,
  },
  {
    country_code: "DE",
    country_name_ko: "독일",
    country_name_en: "Germany",
    artwork_count: 14,
    latitude: 51.1657,
    longitude: 10.4515,
  },
  {
    country_code: "RU",
    country_name_ko: "러시아",
    country_name_en: "Russia",
    artwork_count: 11,
    latitude: 61.524,
    longitude: 105.3188,
  },
  {
    country_code: "AT",
    country_name_ko: "오스트리아",
    country_name_en: "Austria",
    artwork_count: 8,
    latitude: 47.5162,
    longitude: 14.5501,
  },
];
