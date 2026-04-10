// GET /api/v1/artists/[id]/map-data — 화가 작품 국가 분포 미니맵 데이터
// F-003: 화가 상세 페이지 분포 미니 지도 (나라별 작품 수)
// 화가 상세 페이지에서 GET /artists/{id}, GET /artists/{id}/artworks 와 병렬 호출됩니다.

import type { NextRequest } from "next/server";
import { NextResponse } from "next/server";
import pool from "@/lib/db";
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
    const artistCheck = await pool.query<{ exists: boolean }>(
      "SELECT EXISTS(SELECT 1 FROM artists WHERE id = $1) AS exists",
      [id],
    );
    if (!artistCheck.rows[0].exists) {
      return notFound(instance);
    }

    // artwork_artists → artwork_ownerships → institutions.country_code GROUP BY
    // places에서 국가 대표 좌표 AVG 계산
    const { rows } = await pool.query<MapDataRow>(
      `
      SELECT
        i.country_code,
        COUNT(DISTINCT ao.artwork_id)::integer AS artwork_count,
        AVG(p.latitude)::float                 AS latitude,
        AVG(p.longitude)::float                AS longitude
      FROM artwork_artists aa
      JOIN artwork_ownerships ao ON ao.artwork_id    = aa.artwork_id
      JOIN institutions       i  ON i.id             = ao.institution_id
      JOIN places             p  ON p.institution_id = i.id
      WHERE aa.artist_id = $1
      GROUP BY i.country_code
      ORDER BY artwork_count DESC
      `,
      [id],
    );

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
