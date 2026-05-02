// 구글맵 URL 생성 유틸리티 — 미술관명과 도시명으로 구글맵 검색 URL을 조합한다.
// TODO: google_place_id 도입 시 Place ID 방식으로 교체
// 예: buildGoogleMapsUrl("Louvre Museum", "Paris")
//  → "https://www.google.com/maps/search/?api=1&query=Louvre+Museum+Paris"

/**
 * 미술관 영문명과 도시명을 조합한 구글맵 검색 URL을 반환한다.
 * URLSearchParams를 사용해 쿼리 문자열 인코딩을 자동 처리한다.
 */
export function buildGoogleMapsUrl(nameEn: string, city: string): string {
  const query = `${nameEn} ${city}`.trim();
  const params = new URLSearchParams({ api: "1", query });
  return `https://www.google.com/maps/search/?${params.toString()}`;
}
