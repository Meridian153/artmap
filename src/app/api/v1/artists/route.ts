// GET /api/v1/artists — 화가 목록 조회
// F-003: 화가 카드 그리드 (사진, 이름, 화풍, 생몰년)
// movement / nationality 필터, sort, 페이지네이션 지원

import type { NextRequest } from "next/server";
import { NextResponse } from "next/server";
import pool from "@/lib/db";
import { internalServerError, parseIntParam } from "@/lib/api-response";

// ─── DB 행 타입 ───────────────────────────────────────────────────────────────

type ArtistRow = {
  id: string;
  name_ko: string;
  name_en: string;
  birth_year: number | null;
  death_year: number | null;
  nationality: string | null;
  thumbnail_url: string | null;
  artwork_count: number;
  movements: Array<{ name_ko: string; name_en: string }> | null;
  total_count: number;
};

// ─── 정렬 기준 매핑 ───────────────────────────────────────────────────────────

// SQL 인젝션 방지를 위해 허용 값만 매핑
const SORT_MAP: Record<string, string> = {
  name_asc: "ad.name_en ASC",
  birth_year_asc: "ad.birth_year ASC NULLS LAST",
  artwork_count_desc: "ad.artwork_count DESC NULLS LAST",
};

// ─── GET 핸들러 ───────────────────────────────────────────────────────────────

export async function GET(request: NextRequest): Promise<NextResponse> {
  try {
    const sp = request.nextUrl.searchParams;

    const movement = sp.get("movement") ?? null;
    const nationality = sp.get("nationality") ?? null;
    const sort = sp.get("sort") ?? "name_asc";
    const page = parseIntParam(sp.get("page"), 1, 1, 10000);
    const perPage = parseIntParam(sp.get("per_page"), 20, 1, 100);
    const offset = (page - 1) * perPage;

    // 허용된 sort 값이 아니면 기본값으로 대체
    const orderBy = SORT_MAP[sort] ?? SORT_MAP["name_asc"];

    // 1단계: 필터 조건에 맞는 화가 ID 추출 (movement 필터 포함)
    // 2단계: 해당 화가의 artwork_count, movements 집계
    const { rows } = await pool.query<ArtistRow>(
      `
      WITH filtered_ids AS (
        SELECT DISTINCT a.id
        FROM artists a
        LEFT JOIN artist_movements arm ON arm.artist_id = a.id
        LEFT JOIN art_movements   am  ON am.id = arm.movement_id
        WHERE ($1::text IS NULL OR am.name_en ILIKE $1)
          AND ($2::text IS NULL OR a.nationality ILIKE '%' || $2 || '%')
      ),
      artist_data AS (
        SELECT
          a.id,
          a.name_ko,
          a.name_en,
          a.birth_year,
          a.death_year,
          a.nationality,
          a.thumbnail_url,
          COUNT(DISTINCT aa.artwork_id)::integer AS artwork_count
        FROM artists a
        JOIN filtered_ids fi ON fi.id = a.id
        LEFT JOIN artwork_artists aa ON aa.artist_id = a.id
        GROUP BY
          a.id, a.name_ko, a.name_en, a.birth_year, a.death_year,
          a.nationality, a.thumbnail_url
      ),
      movements_agg AS (
        SELECT
          arm.artist_id,
          JSON_AGG(
            JSON_BUILD_OBJECT('name_ko', am.name_ko, 'name_en', am.name_en)
            ORDER BY am.name_en
          ) AS movements
        FROM artist_movements arm
        JOIN art_movements am ON am.id = arm.movement_id
        WHERE arm.artist_id IN (SELECT id FROM filtered_ids)
        GROUP BY arm.artist_id
      )
      SELECT
        ad.*,
        COALESCE(ma.movements, '[]'::json) AS movements,
        COUNT(*) OVER()                    AS total_count
      FROM artist_data ad
      LEFT JOIN movements_agg ma ON ma.artist_id = ad.id
      ORDER BY ${orderBy}
      LIMIT $3 OFFSET $4
      `,
      [movement, nationality, perPage, offset],
    );

    const total = rows.length > 0 ? Number(rows[0].total_count) : 0;

    const data = rows.map((row) => ({
      id: row.id,
      name_ko: row.name_ko,
      name_en: row.name_en,
      birth_year: row.birth_year,
      death_year: row.death_year,
      nationality: row.nationality,
      thumbnail_url: row.thumbnail_url,
      artwork_count: row.artwork_count,
      movements: row.movements ?? [],
    }));

    return NextResponse.json({ data, total, page, per_page: perPage });
  } catch (error) {
    console.error("[GET /api/v1/artists]", error);
    return internalServerError("/api/v1/artists");
  }
}
