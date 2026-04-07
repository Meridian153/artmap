// RFC 9457 기반 에러 응답 타입 정의 — API 에러 처리 시 사용

/** RFC 9457 ProblemDetail 에러 응답 형식 */
export interface ProblemDetail {
  /** 에러 유형을 식별하는 URI */
  type: string
  /** HTTP 상태 코드 */
  status: number
  /** 사람이 읽을 수 있는 에러 제목 */
  title: string
  /** 에러 상세 설명 */
  detail: string
  /** 에러가 발생한 요청 URI */
  instance?: string | null
}
