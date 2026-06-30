// GET /api/v1/artists/[id]/map-data — 화가 작품 국가 분포 미니맵 데이터
// F-003: 화가 상세 페이지 분포 미니 지도 (나라별 작품 수)
// 화가 상세 페이지에서 GET /artists/{id}, GET /artists/{id}/artworks 와 병렬 호출됩니다.

import type { NextRequest } from "next/server";
import { NextResponse } from "next/server";
import { db } from "@/lib/db";
import { sql } from "drizzle-orm";
import { artists, artworkArtists, artworkOwnerships, institutions, places } from "@/lib/schema";
import { notFound, internalServerError, isValidUUID } from "@/lib/api-response";
import { getCountryName } from "@/lib/country-names";

// ─── DB 행 타입 ───────────────────────────────────────────────────────────────

type MapDataRow = {
  country_code: string;
  artwork_count: number;
  latitude: number;
  longitude: number;
};

// ─── GET 핸들러 ───────────────────────────────────────────────────────────────

export async function GET(
  _request: NextRequest,
  { params }: { params: Promise<{ id: string }> },
): Promise<NextResponse> {
  const { id } = await params;
  const instance = `/api/v1/artists/${id}/map-data`;

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

    // artwork_artists → artwork_ownerships → institutions.country_code GROUP BY
    // places에서 국가 대표 좌표 AVG 계산
    const result = await db.execute<MapDataRow>(sql`
      SELECT
        ${institutions.country_code},
        COUNT(DISTINCT ${artworkOwnerships.artwork_id})::integer AS artwork_count,
        AVG(${places.latitude})::float                 AS latitude,
        AVG(${places.longitude})::float                AS longitude
      FROM ${artworkArtists}
      JOIN ${artworkOwnerships} ON ${artworkOwnerships.artwork_id}    = ${artworkArtists.artwork_id}
      JOIN ${institutions}       ON ${institutions.id}             = ${artworkOwnerships.institution_id}
      JOIN ${places}             ON ${places.institution_id} = ${institutions.id}
      WHERE ${artworkArtists.artist_id} = ${id}
      GROUP BY ${institutions.country_code}
      ORDER BY artwork_count DESC
    `);
    const rows = result.rows;

    const data = rows.map((row) => ({
      country_code: row.country_code,
      country_name_ko: getCountryName(row.country_code).ko,
      country_name_en: getCountryName(row.country_code).en,
      artwork_count: row.artwork_count,
      latitude: row.latitude,
      longitude: row.longitude,
    }));

    return NextResponse.json(data);
  } catch (error) {
    console.error(`[GET ${instance}]`, error);
    return internalServerError(instance);
  }
}
