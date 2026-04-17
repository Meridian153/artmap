// GET /api/v1/museums/[id] — 미술관 상세 정보 조회
// F-005: 미술관명, 위치, 운영시간, 입장료, 웹사이트 반환
// ERD: institutions + places (institution_id JOIN)

import type { NextRequest } from "next/server";
import { NextResponse } from "next/server";
import pool from "@/lib/db";
import { notFound, internalServerError, isValidUUID } from "@/lib/api-response";

// ─── DB 행 타입 ───────────────────────────────────────────────────────────────

type MuseumDetailRow = {
  id: string;
  name_ko: string;
  name_en: string;
  institution_type: string;
  country_code: string;
  description_ko: string | null;
  description_en: string | null;
  website: string | null;
  place_name_ko: string | null;
  place_name_en: string | null;
  country: string;
  city: string;
  address: string | null;
  latitude: number;
  longitude: number;
  opening_hours: Record<string, unknown> | null;
  admission: Record<string, unknown> | null;
};

// ─── GET 핸들러 ───────────────────────────────────────────────────────────────

export async function GET(
  _request: NextRequest,
  { params }: { params: Promise<{ id: string }> },
): Promise<NextResponse> {
  const { id } = await params;
  const instance = `/api/v1/museums/${id}`;

  // UUID 형식 검증
  if (!isValidUUID(id)) {
    return notFound(instance);
  }

  try {
    const { rows } = await pool.query<MuseumDetailRow>(
      `
      SELECT
        i.id,
        i.name_ko,
        i.name_en,
        i.institution_type,
        i.country_code,
        i.description_ko,
        i.description_en,
        i.website,
        p.name_ko    AS place_name_ko,
        p.name_en    AS place_name_en,
        p.country,
        p.city,
        p.address,
        p.latitude::float,
        p.longitude::float,
        p.opening_hours,
        p.admission
      FROM institutions i
      JOIN places p ON p.institution_id = i.id
      WHERE i.id = $1
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
      institution_type: row.institution_type,
      country_code: row.country_code,
      description_ko: row.description_ko,
      description_en: row.description_en,
      website: row.website,
      place: {
        name_ko: row.place_name_ko,
        name_en: row.place_name_en,
        country: row.country,
        city: row.city,
        address: row.address,
        latitude: row.latitude,
        longitude: row.longitude,
        opening_hours: row.opening_hours,
        admission: row.admission,
      },
    });
  } catch (error) {
    console.error(`[GET ${instance}]`, error);
    return internalServerError(instance);
  }
}
