// DB 연결 — Drizzle ORM / drizzle-orm/neon-http
//
// Neon 연결: @neondatabase/serverless HTTP 드라이버 사용
//   - 서버리스(Vercel) 환경에 최적화 (TCP 대신 HTTP 요청)
//   - 콜드 스타트 없음, 연결 풀 불필요

import { neon } from "@neondatabase/serverless";
import { drizzle } from "drizzle-orm/neon-http";
import * as schema from "./schema";

if (!process.env.DATABASE_URL) {
  throw new Error("DATABASE_URL 환경변수가 설정되지 않았습니다.");
}
const neonClient = neon(process.env.DATABASE_URL);
export const db = drizzle(neonClient, { schema });
