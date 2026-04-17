// GET /api/v1/museums/[id]/artworks — 미술관 소장 작품 목록 조회
// F-005 (소장 작품 갤러리), F-002 (사이드패널 미리보기)
//
// limit/page 우선순위 규칙 (v1.1.0):
//   1) limit 파라미터가 있으면 page/per_page 무시 → 최신작 limit개 반환
//   2) limit 없으면 page/per_page로 페이지네이션

import type { NextRequest } from "next/server";
import { NextResponse } from "next/server";
import pool from "@/lib/db";
import { notFound, internalServerError, isValidUUID, parseIntParam } from "@/lib/api-response";

// ─── DB 행 타입 ───────────────────────────────────────────────────────────────

type ArtworkRow = {
  id: string;
  title_ko: string;
  title_en: string;
  year_created: number | null;
  image_url: string | null;
  status: string;
  artist_id: string | null;
  artist_name_ko: string | null;
  artist_name_en: string | null;
  total_count: number;
};

// ─── GET 핸들러 ───────────────────────────────────────────────────────────────

export async function GET(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> },
): Promise<NextResponse> {
  const { id } = await params;
  const instance = `/api/v1/museums/${id}/artworks`;

  if (!isValidUUID(id)) {
    return notFound(instance);
  }

  try {
    // 미술관 존재 여부 확인
    const museumCheck = await pool.query<{ exists: boolean }>(
      "SELECT EXISTS(SELECT 1 FROM institutions WHERE id = $1) AS exists",
      [id],
    );
    if (!museumCheck.rows[0].exists) {
      return notFound(instance);
    }

    const sp = request.nextUrl.searchParams;
    const limitParam = sp.get("limit");
    const page = parseIntParam(sp.get("page"), 1, 1, 10000);
    const perPage = parseIntParam(sp.get("per_page"), 20, 1, 100);

    // limit 우선 모드 vs 페이지네이션 모드
    const isLimitMode = limitParam !== null;
    const limit = isLimitMode ? parseIntParam(limitParam, 20, 1, 100) : perPage;
    const offset = isLimitMode ? 0 : (page - 1) * perPage;

    // artwork_artists를 ROW_NUMBER로 중복 제거 (작품당 대표 화가 1명 선택)
    const { rows } = await pool.query<ArtworkRow>(
      `
      WITH artist_ranked AS (
        SELECT
          aa.artwork_id,
          a.id        AS artist_id,
          a.name_ko   AS artist_name_ko,
          a.name_en   AS artist_name_en,
          ROW_NUMBER() OVER (
            PARTITION BY aa.artwork_id ORDER BY a.name_en ASC
          ) AS rn
        FROM artwork_artists aa
        JOIN artists a ON a.id = aa.artist_id
      ),
      owned AS (
        SELECT aw.*
        FROM artworks aw
        JOIN artwork_ownerships ao
          ON ao.artwork_id = aw.id AND ao.institution_id = $1
      )
      SELECT
        ow.id,
        ow.title_ko,
        ow.title_en,
        ow.year_created,
        ow.image_url,
        ow.status,
        ar.artist_id,
        ar.artist_name_ko,
        ar.artist_name_en,
        COUNT(*) OVER() AS total_count
      FROM owned ow
      LEFT JOIN artist_ranked ar
        ON ar.artwork_id = ow.id AND ar.rn = 1
      ORDER BY ow.year_created DESC NULLS LAST
      LIMIT $2 OFFSET $3
      `,
      [id, limit, offset],
    );

    const total = rows.length > 0 ? Number(rows[0].total_count) : 0;

    const data = rows.map((row) => ({
      id: row.id,
      title_ko: row.title_ko,
      title_en: row.title_en,
      year_label: row.year_created !== null ? String(row.year_created) : null,
      thumbnail_url: row.image_url,
      status: row.status,
      artist:
        row.artist_id !== null
          ? {
              id: row.artist_id,
              name_ko: row.artist_name_ko,
              name_en: row.artist_name_en,
            }
          : null,
    }));

    return NextResponse.json({ data, total });
  } catch (error) {
    console.error(`[GET ${instance}]`, error);
    return internalServerError(instance);
  }
}
