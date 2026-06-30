// GET /api/v1/museums — 미술관 목록 조회
// F-002 (지도 국가 클릭 시 미술관 마커), F-005 (미술관 목록 페이지)
// country / city 필터 + 페이지네이션 지원

import type { NextRequest } from "next/server";
import { NextResponse } from "next/server";
import { db } from "@/lib/db";
import { sql } from "drizzle-orm";
import {
  institutions,
  places,
  artworkOwnerships,
  artworks,
  institutionFeaturedArtworks,
} from "@/lib/schema";
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
  image_url: string | null;
  featured_artwork_id: string | null;
  featured_artwork_title: string | null;
  featured_artwork_image: string | null;
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

    if (country !== null && (country.length < 2 || country.length > 2)) {
      return NextResponse.json({ data: [], total: 0, page, per_page: perPage }, { status: 200 });
    }

    const result = await db.execute<MuseumRow>(sql`
      WITH base AS (
        SELECT
          ${institutions.id},
          ${institutions.name_ko},
          ${institutions.name_en},
          ${institutions.institution_type},
          ${institutions.country_code},
          ${institutions.image_url},
          ${places.city},
          ${places.latitude}::float,
          ${places.longitude}::float,
          COUNT(DISTINCT ao.artwork_id)::integer AS artwork_count
        FROM ${institutions}
        JOIN ${places} ON ${places.institution_id} = ${institutions.id} AND ${places.deleted_at} IS NULL
        LEFT JOIN ${artworkOwnerships} ao ON ao.institution_id = ${institutions.id}
        LEFT JOIN ${artworks} aw ON aw.id = ao.artwork_id AND aw.deleted_at IS NULL
        WHERE ${institutions.deleted_at} IS NULL
          AND (${country}::text IS NULL OR ${institutions.country_code} = ${country})
          AND (${city}::text IS NULL OR ${places.city} ILIKE ${"%" + city + "%"})
        GROUP BY
          ${institutions.id}, ${institutions.name_ko}, ${institutions.name_en}, ${institutions.institution_type},
          ${institutions.country_code}, ${institutions.image_url}, ${places.city}, ${places.latitude}, ${places.longitude}
      ),
      featured AS (
        SELECT DISTINCT ON (ifa.institution_id)
          ifa.institution_id,
          ${artworks.id}        AS artwork_id,
          ${artworks.title_ko}  AS artwork_title,
          ${artworks.image_url} AS artwork_image
        FROM ${institutionFeaturedArtworks} ifa
        JOIN ${artworks} ON ${artworks.id} = ifa.artwork_id AND ${artworks.deleted_at} IS NULL
        ORDER BY ifa.institution_id, ifa.display_order ASC
      )
      SELECT
        b.*,
        f.artwork_id    AS featured_artwork_id,
        f.artwork_title AS featured_artwork_title,
        f.artwork_image AS featured_artwork_image,
        COUNT(*) OVER() AS total_count
      FROM base b
      LEFT JOIN featured f ON f.institution_id = b.id
      ORDER BY b.name_en ASC
      LIMIT  ${perPage} OFFSET ${offset}
    `);
    const rows = result.rows;

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
      image_url: row.image_url ?? null,
      featured_artwork: row.featured_artwork_id
        ? {
            artwork_id: row.featured_artwork_id,
            artwork_title: row.featured_artwork_title,
            image_url: row.featured_artwork_image,
          }
        : null,
    }));

    return NextResponse.json({ data, total, page, per_page: perPage });
  } catch (error) {
    console.error("[GET /api/v1/museums]", error);
    return internalServerError("/api/v1/museums");
  }
}
