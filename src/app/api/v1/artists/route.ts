// GET /api/v1/artists — 화가 목록 조회
// F-003: 화가 카드 그리드 (사진, 이름, 화풍, 생몰년)
// movement / nationality 필터, sort, 페이지네이션 지원

import type { NextRequest } from "next/server";
import { NextResponse } from "next/server";
import { db } from "@/lib/db";
import { sql, type SQL } from "drizzle-orm";
import {
  artists,
  artistMovements,
  artMovements,
  artworks,
  artworkArtists,
  artworkOwnerships,
  institutions,
} from "@/lib/schema";
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
  top_museum_name_ko: string | null;
  total_count: number;
};

// ─── 정렬 기준 매핑 ───────────────────────────────────────────────────────────

const ORDER_BY_SQL: Record<string, SQL> = {
  name_asc: sql`${artists.name_en} ASC`,
  birth_year_asc: sql`${artists.birth_year} ASC NULLS LAST`,
  artwork_count_desc: sql`artwork_count DESC NULLS LAST`,
};
const DEFAULT_ORDER_BY = ORDER_BY_SQL["name_asc"]!;

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

    const orderBySql = ORDER_BY_SQL[sort] ?? DEFAULT_ORDER_BY;

    const result = await db.execute<ArtistRow>(sql`
      WITH filtered_ids AS (
        SELECT DISTINCT ${artists.id}
        FROM ${artists}
        LEFT JOIN ${artistMovements} arm ON arm.artist_id = ${artists.id}
        LEFT JOIN ${artMovements}   am  ON am.id = arm.movement_id
        WHERE ${artists.deleted_at} IS NULL
          AND (${movement}::text IS NULL OR am.name_en ILIKE ${movement})
          AND (${nationality}::text IS NULL OR ${artists.nationality} ILIKE ${"%" + nationality + "%"})
      ),
      artist_data AS (
        SELECT
          ${artists.id},
          ${artists.name_ko},
          ${artists.name_en},
          ${artists.birth_year},
          ${artists.death_year},
          ${artists.nationality},
          ${artists.thumbnail_url},
          COUNT(DISTINCT aa.artwork_id)::integer AS artwork_count
        FROM ${artists}
        JOIN filtered_ids fi ON fi.id = ${artists.id}
        LEFT JOIN ${artworkArtists} aa ON aa.artist_id = ${artists.id}
        LEFT JOIN ${artworks} aw ON aw.id = aa.artwork_id AND aw.deleted_at IS NULL
        GROUP BY
          ${artists.id}, ${artists.name_ko}, ${artists.name_en}, ${artists.birth_year}, ${artists.death_year},
          ${artists.nationality}, ${artists.thumbnail_url}
      ),
      movements_agg AS (
        SELECT
          arm.artist_id,
          JSON_AGG(
            JSON_BUILD_OBJECT('name_ko', am.name_ko, 'name_en', am.name_en)
            ORDER BY am.name_en
          ) FILTER (WHERE am.id IS NOT NULL) AS movements
        FROM ${artistMovements} arm
        JOIN ${artMovements} am ON am.id = arm.movement_id
        WHERE arm.artist_id IN (SELECT id FROM filtered_ids)
        GROUP BY arm.artist_id
      ),
      top_museum AS (
        SELECT DISTINCT ON (aa.artist_id)
          aa.artist_id,
          ${institutions.name_ko} AS museum_name_ko
        FROM ${artworkArtists} aa
        JOIN ${artworkOwnerships} ao ON ao.artwork_id = aa.artwork_id
        JOIN ${institutions} ON ${institutions.id} = ao.institution_id AND ${institutions.deleted_at} IS NULL
        JOIN ${artworks} aw ON aw.id = aa.artwork_id AND aw.deleted_at IS NULL
        WHERE aa.artist_id IN (SELECT id FROM filtered_ids)
        GROUP BY aa.artist_id, ${institutions.id}, ${institutions.name_ko}
        ORDER BY aa.artist_id, COUNT(*) DESC
      )
      SELECT
        ad.*,
        COALESCE(ma.movements, '[]'::json) AS movements,
        tm.museum_name_ko                  AS top_museum_name_ko,
        COUNT(*) OVER()                    AS total_count
      FROM artist_data ad
      LEFT JOIN movements_agg ma ON ma.artist_id = ad.id
      LEFT JOIN top_museum tm ON tm.artist_id = ad.id
      ORDER BY ${orderBySql}
      LIMIT ${perPage} OFFSET ${offset}
    `);
    const rows = result.rows;

    const total = rows.length > 0 ? Number(rows[0].total_count) : 0;

    const data = rows.map((row) => ({
      id: row.id,
      name_ko: row.name_ko,
      name_en: row.name_en,
      birth_year: row.birth_year,
      death_year: row.death_year,
      nationality: row.nationality,
      image_url: row.thumbnail_url,
      artwork_count: row.artwork_count,
      movements: row.movements ?? [],
      top_museum_name_ko: row.top_museum_name_ko ?? null,
    }));

    return NextResponse.json({ data, total, page, per_page: perPage });
  } catch (error) {
    console.error("[GET /api/v1/artists]", error);
    return internalServerError("/api/v1/artists");
  }
}
