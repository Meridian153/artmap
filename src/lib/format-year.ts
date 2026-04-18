// 작품 연도 표시용 포매터 — ArtworkDetail의 year_created/year_end 필드를 라벨화합니다.

/**
 * 작품 제작 연도를 표시용 라벨로 포매팅합니다.
 *
 * - year_created가 null/undefined이면 null 반환
 * - year_end가 없거나 year_created와 같으면 단일 연도 문자열
 * - 그 외에는 `${year_created}–${year_end}` 형태의 범위 문자열
 */
export function formatYearLabel(
  yearCreated: number | null | undefined,
  yearEnd: number | null | undefined,
): string | null {
  if (yearCreated == null) {
    return null;
  }
  if (yearEnd == null || yearEnd === yearCreated) {
    return String(yearCreated);
  }
  return `${yearCreated}–${yearEnd}`;
}
