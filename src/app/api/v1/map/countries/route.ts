// GET /api/v1/map/countries — 국가별 작품 수 집계 (홈 지도 버블 마커 데이터)
// F-002: 홈 접속 시 국가 버블 마커 렌더링에 사용됩니다.
// [v1.2.0] Cache-Control: public, max-age=3600 응답 헤더 포함

import { NextResponse } from "next/server";
import pool from "@/lib/db";
import { internalServerError } from "@/lib/api-response";
import { getCountryName } from "@/lib/country-names";
import { createHash } from "crypto";

// ─── DB 행 타입 ───────────────────────────────────────────────────────────────

type CountryRow = {
  country_code: string;
  artwork_count: number;
  latitude: number;
  longitude: number;
};

// ─── GET 핸들러 ───────────────────────────────────────────────────────────────

export async function GET(): Promise<NextResponse> {
  try {
    // institutions.country_code GROUP BY → artwork_ownerships COUNT(DISTINCT artwork_id)
    // places에서 국가 대표 좌표를 AVG로 계산
    const { rows } = await pool.query<CountryRow>(`
      SELECT
        i.country_code,
        COUNT(DISTINCT ao.artwork_id)::integer AS artwork_count,
        AVG(p.latitude)::float                 AS latitude,
        AVG(p.longitude)::float                AS longitude
      FROM institutions i
      JOIN artwork_ownerships ao ON ao.institution_id = i.id
      JOIN places p              ON p.institution_id  = i.id
      GROUP BY i.country_code
      HAVING COUNT(DISTINCT ao.artwork_id) > 0
      ORDER BY artwork_count DESC
    `);

    // 국가 코드 → 한/영 국가명 변환 (정적 매핑)
    const data = rows.map((row) => ({
      country_code: row.country_code,
      country_name_ko: getCountryName(row.country_code).ko,
      country_name_en: getCountryName(row.country_code).en,
      artwork_count: row.artwork_count,
      latitude: row.latitude,
      longitude: row.longitude,
    }));

    // ETag 생성 — 데이터 변경 감지용 (조건부 요청 304 지원)
    const etag = `"${createHash("md5").update(JSON.stringify(data)).digest("hex").slice(0, 12)}"`;

    return NextResponse.json(data, {
      headers: {
        "Cache-Control": "public, max-age=3600",
        ETag: etag,
      },
    });
  } catch (error) {
    console.error("[GET /api/v1/map/countries]", error);
    return internalServerError("/api/v1/map/countries");
  }
}
