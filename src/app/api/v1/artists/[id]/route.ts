// GET /api/v1/artists/[id] — 화가 상세 정보 조회
// F-003: 이름, 생몰년, 국적, 약력, 화풍
// [v1.2.0] 화가 상세 페이지는 이 API + /artworks?limit=20 + /map-data 를 병렬 호출해야 합니다.

import type { NextRequest } from "next/server";
import { NextResponse } from "next/server";
import pool from "@/lib/db";
import { notFound, internalServerError, isValidUUID } from "@/lib/api-response";

// ─── DB 행 타입 ───────────────────────────────────────────────────────────────

type ArtistDetailRow = {
  id: string;
  name_ko: string;
  name_en: string;
  birth_year: number | null;
  death_year: number | null;
  nationality: string | null;
  bio_ko: string | null;
  bio_en: string | null;
  thumbnail_url: string | null;
  movements: Array<{
    name_ko: string;
    name_en: string;
    period_start: number | null;
    period_end: number | null;
  }> | null;
};

// ─── GET 핸들러 ───────────────────────────────────────────────────────────────

export async function GET(
  _request: NextRequest,
  { params }: { params: Promise<{ id: string }> },
): Promise<NextResponse> {
  const { id } = await params;
  const instance = `/api/v1/artists/${id}`;

  if (!isValidUUID(id)) {
    return notFound(instance);
  }

  try {
    const { rows } = await pool.query<ArtistDetailRow>(
      `
      SELECT
        a.id,
        a.name_ko,
        a.name_en,
        a.birth_year,
        a.death_year,
        a.nationality,
        a.bio_ko,
        a.bio_en,
        a.thumbnail_url,
        JSON_AGG(
          JSON_BUILD_OBJECT(
            'name_ko',      am.name_ko,
            'name_en',      am.name_en,
            'period_start', am.period_start,
            'period_end',   am.period_end
          )
          ORDER BY am.period_start ASC NULLS LAST
        ) FILTER (WHERE am.id IS NOT NULL) AS movements
      FROM artists a
      LEFT JOIN artist_movements arm ON arm.artist_id = a.id
      LEFT JOIN art_movements    am  ON am.id = arm.movement_id
      WHERE a.id = $1
      GROUP BY
        a.id, a.name_ko, a.name_en, a.birth_year, a.death_year,
        a.nationality, a.bio_ko, a.bio_en, a.thumbnail_url
      `,
      [id],
    );

    if (rows.length === 0) {
      return notFound(instance);
    }

    const row = rows[0];

    return NextResponse.json({
      id: row.id,
      name_ko: row.name_ko,
      name_en: row.name_en,
      birth_year: row.birth_year,
      death_year: row.death_year,
      nationality: row.nationality,
      bio_ko: row.bio_ko,
      bio_en: row.bio_en,
      thumbnail_url: row.thumbnail_url,
      movements: row.movements ?? [],
    });
  } catch (error) {
    console.error(`[GET ${instance}]`, error);
    return internalServerError(instance);
  }
}
