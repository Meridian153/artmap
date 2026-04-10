// GET /api/v1/museums — 미술관 목록 조회
// F-002 (지도 국가 클릭 시 미술관 마커), F-005 (미술관 목록 페이지)
// country / city 필터 + 페이지네이션 지원

import type { NextRequest } from "next/server";
import { NextResponse } from "next/server";
import pool from "@/lib/db";
import { internalServerError, parseIntParam } from "@/lib/api-response";

// ─── DB 행 타입 ───────────────────────────────────────────────────────────────

type MuseumRow = {
  id: string;
  name_ko: string;
  name_en: string;
  institution_type: string;
  country_code: string;
  city: string;
  latitude: number;
  longitude: number;
  artwork_count: number;
  total_count: number;
};

// ─── GET 핸들러 ───────────────────────────────────────────────────────────────

export async function GET(request: NextRequest): Promise<NextResponse> {
  try {
    const sp = request.nextUrl.searchParams;

    const country = sp.get("country") ?? null;
    const city = sp.get("city") ?? null;
    const page = parseIntParam(sp.get("page"), 1, 1, 10000);
    const perPage = parseIntParam(sp.get("per_page"), 20, 1, 100);
    const offset = (page - 1) * perPage;

    // country_code 길이 유효성 검사
    if (country !== null && (country.length < 2 || country.length > 2)) {
      return NextResponse.json({ data: [], total: 0, page, per_page: perPage }, { status: 200 });
    }

    // CTE를 사용해 필터 후 window function으로 total_count 집계
    const { rows } = await pool.query<MuseumRow>(
      `
      WITH base AS (
        SELECT
          i.id,
          i.name_ko,
          i.name_en,
          i.institution_type,
          i.country_code,
          p.city,
          p.latitude,
          p.longitude,
          COUNT(ao.artwork_id)::integer AS artwork_count
        FROM institutions i
        JOIN places p              ON p.institution_id = i.id
        LEFT JOIN artwork_ownerships ao ON ao.institution_id = i.id
        WHERE ($1::text IS NULL OR i.country_code = $1)
          AND ($2::text IS NULL OR p.city ILIKE '%' || $2 || '%')
        GROUP BY
          i.id, i.name_ko, i.name_en, i.institution_type,
          i.country_code, p.city, p.latitude, p.longitude
      )
      SELECT *, COUNT(*) OVER() AS total_count
      FROM   base
      ORDER BY name_en ASC
      LIMIT  $3 OFFSET $4
      `,
      [country, city, perPage, offset],
    );

    const total = rows.length > 0 ? Number(rows[0].total_count) : 0;

    const data = rows.map((row) => ({
      id: row.id,
      name_ko: row.name_ko,
      name_en: row.name_en,
      institution_type: row.institution_type,
      country_code: row.country_code,
      city: row.city,
      latitude: row.latitude,
      longitude: row.longitude,
      artwork_count: row.artwork_count,
    }));

    return NextResponse.json({ data, total, page, per_page: perPage });
  } catch (error) {
    console.error("[GET /api/v1/museums]", error);
    return internalServerError("/api/v1/museums");
  }
}
