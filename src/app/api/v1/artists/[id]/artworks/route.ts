// GET /api/v1/artists/[id]/artworks — 화가의 작품 목록 조회
// F-003: 대표 작품 갤러리(limit=20), 전체 작품 목록(페이지네이션)
//
// limit/page 우선순위 규칙 (v1.1.0):
//   1) limit 있으면 page/per_page 무시 → year_created ASC 기준 상위 limit개
//   2) limit 없으면 page/per_page 페이지네이션

import type { NextRequest } from "next/server";
import { NextResponse } from "next/server";
import { db } from "@/lib/db";
import { sql } from "drizzle-orm";
import {
  artists,
  artworks,
  artworkArtists,
  artworkLocations,
  places,
  institutions,
} from "@/lib/schema";
import { notFound, internalServerError, isValidUUID, parseIntParam } from "@/lib/api-response";

// ─── DB 행 타입 ───────────────────────────────────────────────────────────────

type ArtworkWithMuseumRow = {
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

// ─── GET 핸들러 ───────────────────────────────────────────────────────────────

export async function GET(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> },
): Promise<NextResponse> {
  const { id } = await params;
  const instance = `/api/v1/artists/${id}/artworks`;

  if (!isValidUUID(id)) {
    return notFound(instance);
  }

  try {
    // 화가 존재 여부 확인
    const artistCheck = await db.execute<{ exists: boolean }>(sql`
      SELECT EXISTS(SELECT 1 FROM ${artists} WHERE ${artists.id} = ${id}) AS exists
    `);
    if (!artistCheck.rows[0].exists) {
      return notFound(instance);
    }

    const sp = request.nextUrl.searchParams;
    const limitParam = sp.get("limit");
    const page = parseIntParam(sp.get("page"), 1, 1, 10000);
    const perPage = parseIntParam(sp.get("per_page"), 20, 1, 100);

    const isLimitMode = limitParam !== null;
    const limit = isLimitMode ? parseIntParam(limitParam, 20, 1, 100) : perPage;
    const offset = isLimitMode ? 0 : (page - 1) * perPage;

    // artwork_locations (end_date IS NULL) → places → institutions 경유 미술관명 조회
    const result = await db.execute<ArtworkWithMuseumRow>(sql`
      SELECT
        ${artworks.id},
        ${artworks.title_ko},
        ${artworks.title_en},
        ${artworks.year_created},
        ${artworks.image_url},
        ${artworks.status},
        MAX(${institutions.name_ko})  AS museum_name_ko,
        MAX(${institutions.name_en})  AS museum_name_en,
        COUNT(*) OVER() AS total_count
      FROM ${artworks}
      JOIN ${artworkArtists}
        ON ${artworkArtists.artwork_id} = ${artworks.id} AND ${artworkArtists.artist_id} = ${id}
      LEFT JOIN ${artworkLocations}
        ON ${artworkLocations.artwork_id} = ${artworks.id} AND ${artworkLocations.end_date} IS NULL
      LEFT JOIN ${places} ON ${places.id} = ${artworkLocations.place_id}
      LEFT JOIN ${institutions} ON ${institutions.id} = ${places.institution_id}
      GROUP BY ${artworks.id}
      ORDER BY ${artworks.year_created} ASC NULLS LAST
      LIMIT ${limit} OFFSET ${offset}
    `);
    const rows = result.rows;

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

    return NextResponse.json({ data, total });
  } catch (error) {
    console.error(`[GET ${instance}]`, error);
    return internalServerError(instance);
  }
}
