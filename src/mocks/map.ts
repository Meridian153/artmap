// Mock 지도 데이터 — 국가별 작품 수 집계 샘플 데이터

import type { CountryMapData } from '@/types/map'

/** 국가별 작품 수 집계 Mock 데이터 */
export const mockCountryMapData: CountryMapData[] = [
  {
    country_code: 'FR',
    country_name_ko: '프랑스',
    country_name_en: 'France',
    artwork_count: 68,
    museum_count: 2,
  },
  {
    country_code: 'NL',
    country_name_ko: '네덜란드',
    country_name_en: 'Netherlands',
    artwork_count: 45,
    museum_count: 1,
  },
  {
    country_code: 'US',
    country_name_ko: '미국',
    country_name_en: 'United States',
    artwork_count: 87,
    museum_count: 1,
  },
  {
    country_code: 'IT',
    country_name_ko: '이탈리아',
    country_name_en: 'Italy',
    artwork_count: 53,
    museum_count: 1,
  },
  {
    country_code: 'KR',
    country_name_ko: '대한민국',
    country_name_en: 'South Korea',
    artwork_count: 22,
    museum_count: 1,
  },
  {
    country_code: 'GB',
    country_name_ko: '영국',
    country_name_en: 'United Kingdom',
    artwork_count: 31,
    museum_count: 0,
  },
  {
    country_code: 'ES',
    country_name_ko: '스페인',
    country_name_en: 'Spain',
    artwork_count: 19,
    museum_count: 0,
  },
  {
    country_code: 'DE',
    country_name_ko: '독일',
    country_name_en: 'Germany',
    artwork_count: 14,
    museum_count: 0,
  },
  {
    country_code: 'RU',
    country_name_ko: '러시아',
    country_name_en: 'Russia',
    artwork_count: 11,
    museum_count: 0,
  },
  {
    country_code: 'AT',
    country_name_ko: '오스트리아',
    country_name_en: 'Austria',
    artwork_count: 8,
    museum_count: 0,
  },
]
