// API 응답 헬퍼 — RFC 9457 (Problem Details for HTTP APIs) 표준 에러 응답 생성
// 모든 에러 응답은 Content-Type: application/problem+json 을 사용합니다.

import { NextResponse } from "next/server";

// ─── RFC 9457 ProblemDetail 타입 ─────────────────────────────────────────────

type ProblemDetail = {
  type: string;
  title: string;
  status: number;
  detail: string;
  instance?: string;
};

// ─── 공통 problem+json 응답 생성 ─────────────────────────────────────────────

/** RFC 9457 ProblemDetail 형식으로 에러 응답을 생성합니다 */
function problemJson(detail: ProblemDetail): NextResponse {
  return NextResponse.json(detail, {
    status: detail.status,
    headers: { "Content-Type": "application/problem+json" },
  });
}

// ─── 개별 에러 응답 헬퍼 ─────────────────────────────────────────────────────

/** 400 Bad Request */
export function badRequest(instance: string, detail: string): NextResponse {
  return problemJson({
    type: "https://artmap.com/errors/bad-request",
    title: "Bad Request",
    status: 400,
    detail,
    instance,
  });
}

/** 404 Not Found */
export function notFound(
  instance: string,
  detail = "요청한 리소스를 찾을 수 없습니다.",
): NextResponse {
  return problemJson({
    type: "https://artmap.com/errors/not-found",
    title: "Not Found",
    status: 404,
    detail,
    instance,
  });
}

/** 429 Too Many Requests */
export function tooManyRequests(instance: string, retryAfterSeconds = 30): NextResponse {
  return NextResponse.json(
    {
      type: "https://artmap.com/errors/too-many-requests",
      title: "Too Many Requests",
      status: 429,
      detail: `요청 횟수가 초과되었습니다. ${retryAfterSeconds}초 후 다시 시도해주세요.`,
      instance,
    } satisfies ProblemDetail,
    {
      status: 429,
      headers: {
        "Content-Type": "application/problem+json",
        "Retry-After": String(retryAfterSeconds),
        "X-RateLimit-Limit": "60",
        "X-RateLimit-Remaining": "0",
        "X-RateLimit-Reset": String(Math.floor(Date.now() / 1000) + retryAfterSeconds),
      },
    },
  );
}

/** 500 Internal Server Error */
export function internalServerError(instance: string): NextResponse {
  return problemJson({
    type: "https://artmap.com/errors/internal-server-error",
    title: "Internal Server Error",
    status: 500,
    detail: "서버 내부 오류가 발생했습니다. 잠시 후 다시 시도해주세요.",
    instance,
  });
}

// ─── UUID 검증 헬퍼 ──────────────────────────────────────────────────────────

const UUID_REGEX = /^[0-9a-f]{8}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{12}$/i;

/** UUID 형식 유효성 검사 */
export function isValidUUID(value: string): boolean {
  return UUID_REGEX.test(value);
}

// ─── 쿼리 파라미터 파싱 헬퍼 ─────────────────────────────────────────────────

/** 정수 파라미터를 파싱하고 범위를 제한합니다 */
export function parseIntParam(
  value: string | null,
  defaultVal: number,
  min: number,
  max: number,
): number {
  if (value === null) return defaultVal;
  const parsed = parseInt(value, 10);
  if (isNaN(parsed)) return defaultVal;
  return Math.min(max, Math.max(min, parsed));
}
