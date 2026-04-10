// API 에러 처리 클래스 — RFC 9457 ProblemDetail 기반 커스텀 에러

import type { ProblemDetail } from "@/types/error";

/** RFC 9457 ProblemDetail 기반 API 에러 클래스 */
export class ApiError extends Error {
  /** HTTP 상태 코드 */
  readonly status: number;
  /** 에러 유형 URI */
  readonly type: string;
  /** 에러 상세 설명 */
  readonly detail: string;
  /** 에러가 발생한 요청 URI */
  readonly instance?: string;

  constructor(problem: ProblemDetail) {
    super(problem.title);
    this.name = "ApiError";
    this.status = problem.status;
    this.type = problem.type;
    this.detail = problem.detail;
    this.instance = problem.instance ?? undefined;
  }
}
