// DB 연결 — Drizzle ORM (신규) + pg Pool (기존 API 라우트 후환성)
//
// 사용 지침:
//   - 신규 코드    → `db` (Drizzle ORM / drizzle-orm/neon-http)
//   - 기존 라우트  → `pool` (pg Pool, 단계적 마이그레이션 후 제거 예정)
//
// Neon 연결: @neondatabase/serverless HTTP 드라이버 사용
//   - 서버리스(Vercel) 환경에 최적화 (TCP 대신 HTTP 요청)
//   - 콜드 스타트 없음, 연결 풀 불필요

import { neon } from "@neondatabase/serverless";
import { drizzle } from "drizzle-orm/neon-http";
import { Pool } from "pg";
import * as schema from "./schema";

// ─── Drizzle db 인스턴스 (신규 코드에서 사용) ────────────────────────────────

const neonClient = neon(process.env.DATABASE_URL!);
export const db = drizzle(neonClient, { schema });

// ─── 레거시 pg Pool (기존 API 라우트 호환용) ─────────────────────────────────
// TODO: 모든 API 라우트를 Drizzle로 마이그레이션 완료 후 제거

const pool = new Pool({
  connectionString: process.env.DATABASE_URL,
  ssl: process.env.NODE_ENV === "production" ? { rejectUnauthorized: false } : undefined,
});

export default pool;
