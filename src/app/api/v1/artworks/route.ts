// GET /api/v1/artworks — 작품 목록 조회
// F-004: /artworks 목록 페이지 및 검색 결과 "작품 더 보기"
// [ADDED v1.3.0] 누락된 작품 목록 엔드포인트 신규 추가
// artist_id / movement / status 필터, sort, 페이지네이션 지원

import type { NextRequest } from "next/server";
import { NextResponse } from "next/server";
import pool from "@/lib/db";
import { internalServerError, parseIntParam } from "@/lib/api-response";

// ─── DB 행 타입 ───────────────────────────────────────────────────────────────

type ArtworkRow = {
  id: string;
  title_ko: string;
  title_en: string;
  year_created: number | null;
  image_url: string | null;
  status: string;
  museum_name_ko: string | null;
  museum_name_en: string | null;
  total_count: number;
};

// ─── 허용된 status 값 ─────────────────────────────────────────────────────────

const VALID_STATUS = new Set(["on_display", "in_storage", "on_loan", "under_restoration"]);

// ─── 정렬 기준 매핑 ───────────────────────────────────────────────────────────

const SORT_MAP: Record<string, string> = {
  year_asc: "aw.year_created ASC NULLS LAST",
  year_desc: "aw.year_created DESC NULLS LAST",
  title_asc: "aw.title_en ASC",
};

// ─── GET 핸들러 ───────────────────────────────────────────────────────────────

export async function GET(request: NextRequest): Promise<NextResponse> {
  try {
    const sp = request.nextUrl.searchParams;

    const artistId = sp.get("artist_id") ?? null;
    const movement = sp.get("movement") ?? null;
    const status = sp.get("status") ?? null;
    const sort = sp.get("sort") ?? "year_asc";
    const page = parseIntParam(sp.get("page"), 1, 1, 10000);
    const perPage = parseIntParam(sp.get("per_page"), 20, 1, 100);
    const offset = (page - 1) * perPage;

    // 유효하지 않은 status 값이면 결과 없이 반환
    const validStatus = status !== null && VALID_STATUS.has(status) ? status : null;
    if (status !== null && validStatus === null) {
      return NextResponse.json({ data: [], total: 0, page, per_page: perPage });
    }

    const orderBy = SORT_MAP[sort] ?? SORT_MAP["year_asc"];

    // movement 필터는 artwork → artwork_artists → artists → artist_movements → art_movements 경유
    // artwork_locations (end_date IS NULL) → places → institutions 경유 미술관명 조회
    const { rows } = await pool.query<ArtworkRow>(
      `
      WITH filtered_ids AS (
        SELECT DISTINCT aw.id
        FROM artworks aw
        LEFT JOIN artwork_artists aa  ON aa.artwork_id  = aw.id
        LEFT JOIN artists         art ON art.id         = aa.artist_id
        LEFT JOIN artist_movements arm ON arm.artist_id = art.id
        LEFT JOIN art_movements   am  ON am.id          = arm.movement_id
        WHERE ($1::uuid IS NULL OR aa.artist_id = $1::uuid)
          AND ($2::text IS NULL OR am.name_en ILIKE $2)
          AND ($3::text IS NULL OR aw.status   = $3)
      )
      SELECT
        aw.id,
        aw.title_ko,
        aw.title_en,
        aw.year_created,
        aw.image_url,
        aw.status,
        i.name_ko  AS museum_name_ko,
        i.name_en  AS museum_name_en,
        COUNT(*) OVER() AS total_count
      FROM artworks aw
      JOIN filtered_ids fi ON fi.id = aw.id
      LEFT JOIN artwork_locations al
        ON al.artwork_id = aw.id AND al.end_date IS NULL
      LEFT JOIN places       p ON p.id             = al.place_id
      LEFT JOIN institutions i ON i.id             = p.institution_id
      ORDER BY ${orderBy}
      LIMIT $4 OFFSET $5
      `,
      [artistId, movement, validStatus, perPage, offset],
    );

    const total = rows.length > 0 ? Number(rows[0].total_count) : 0;

    const data = rows.map((row) => ({
      id: row.id,
      title_ko: row.title_ko,
      title_en: row.title_en,
      year_created: row.year_created,
      image_url: row.image_url,
      status: row.status,
      museum_name_ko: row.museum_name_ko,
      museum_name_en: row.museum_name_en,
    }));

    return NextResponse.json({ data, total, page, per_page: perPage });
  } catch (error) {
    console.error("[GET /api/v1/artworks]", error);
    return internalServerError("/api/v1/artworks");
  }
}
