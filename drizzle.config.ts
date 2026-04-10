// Drizzle Kit 설정 — 마이그레이션 생성 및 스키마 관리
// npx drizzle-kit generate  → SQL 마이그레이션 파일 생성
// npx drizzle-kit push      → DB에 직접 스키마 반영 (개발용)
// npx drizzle-kit studio    → Drizzle Studio(GUI) 실행

import type { Config } from "drizzle-kit";

export default {
  schema: "./src/lib/schema.ts",
  out: "./drizzle",
  dialect: "postgresql",
  dbCredentials: {
    url: process.env.DATABASE_URL!,
  },
} satisfies Config;
