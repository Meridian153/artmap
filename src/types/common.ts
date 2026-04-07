// 공통 제네릭 타입 정의 — 페이지네이션 응답 등 여러 엔드포인트에서 공유하는 구조

/** 페이지네이션이 적용된 목록 응답 공통 구조 */
export interface PaginatedResponse<T> {
  data: T[]
  total: number
  page: number
  per_page: number
}
