// 국가 코드 → 국가명 변환 테이블
// ERD에 countries 테이블이 없으므로 백엔드에서 정적 매핑으로 처리합니다.
// API 명세 설명: "ERD 직접 대응 없음. 백엔드 변환."

type CountryName = { ko: string; en: string };

// ISO 3166-1 alpha-2 코드 기준 — 미술 주요 소장국 중심
export const COUNTRY_NAMES: Record<string, CountryName> = {
  AD: { ko: "안도라", en: "Andorra" },
  AE: { ko: "아랍에미리트", en: "United Arab Emirates" },
  AR: { ko: "아르헨티나", en: "Argentina" },
  AT: { ko: "오스트리아", en: "Austria" },
  AU: { ko: "호주", en: "Australia" },
  BE: { ko: "벨기에", en: "Belgium" },
  BR: { ko: "브라질", en: "Brazil" },
  CA: { ko: "캐나다", en: "Canada" },
  CH: { ko: "스위스", en: "Switzerland" },
  CN: { ko: "중국", en: "China" },
  CZ: { ko: "체코", en: "Czech Republic" },
  DE: { ko: "독일", en: "Germany" },
  DK: { ko: "덴마크", en: "Denmark" },
  EG: { ko: "이집트", en: "Egypt" },
  ES: { ko: "스페인", en: "Spain" },
  FI: { ko: "핀란드", en: "Finland" },
  FR: { ko: "프랑스", en: "France" },
  GB: { ko: "영국", en: "United Kingdom" },
  GR: { ko: "그리스", en: "Greece" },
  HR: { ko: "크로아티아", en: "Croatia" },
  HU: { ko: "헝가리", en: "Hungary" },
  IE: { ko: "아일랜드", en: "Ireland" },
  IL: { ko: "이스라엘", en: "Israel" },
  IN: { ko: "인도", en: "India" },
  IT: { ko: "이탈리아", en: "Italy" },
  JP: { ko: "일본", en: "Japan" },
  KR: { ko: "한국", en: "South Korea" },
  MX: { ko: "멕시코", en: "Mexico" },
  NL: { ko: "네덜란드", en: "Netherlands" },
  NO: { ko: "노르웨이", en: "Norway" },
  NZ: { ko: "뉴질랜드", en: "New Zealand" },
  PE: { ko: "페루", en: "Peru" },
  PL: { ko: "폴란드", en: "Poland" },
  PT: { ko: "포르투갈", en: "Portugal" },
  RO: { ko: "루마니아", en: "Romania" },
  RU: { ko: "러시아", en: "Russia" },
  SE: { ko: "스웨덴", en: "Sweden" },
  TR: { ko: "터키", en: "Turkey" },
  UA: { ko: "우크라이나", en: "Ukraine" },
  US: { ko: "미국", en: "United States" },
  VA: { ko: "바티칸", en: "Vatican City" },
  ZA: { ko: "남아프리카공화국", en: "South Africa" },
};

/** 국가 코드로 한/영 국가명을 반환. 매핑 없을 경우 코드 그대로 반환 */
export function getCountryName(code: string): CountryName {
  return COUNTRY_NAMES[code] ?? { ko: code, en: code };
}
