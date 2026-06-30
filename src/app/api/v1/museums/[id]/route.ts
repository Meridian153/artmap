// GET /api/v1/museums/[id] — 미술관 상세 정보 조회
// F-005: 미술관명, 위치, 운영시간, 입장료, 웹사이트 반환
// ERD: institutions + places (institution_id JOIN)

import type { NextRequest } from "next/server";
import { NextResponse } from "next/server";
import { db } from "@/lib/db";
import { sql } from "drizzle-orm";
import { institutions, places, institutionFeaturedArtworks, artworks } from "@/lib/schema";
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
  image_url: string | null;
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

type FeaturedRow = {
  artwork_id: string;
  artwork_title: string;
  artwork_image: string | null;
};

// ─── GET 핸들러 ───────────────────────────────────────────────────────────────

export async function GET(
  _request: NextRequest,
  { params }: { params: Promise<{ id: string }> },
): Promise<NextResponse> {
  const { id } = await params;
  const instance = `/api/v1/museums/${id}`;

  if (!isValidUUID(id)) {
    return notFound(instance);
  }

  try {
    const result = await db.execute<MuseumDetailRow>(sql`
      SELECT
        ${institutions.id},
        ${institutions.name_ko},
        ${institutions.name_en},
        ${institutions.institution_type},
        ${institutions.country_code},
        ${institutions.description_ko},
        ${institutions.description_en},
        ${institutions.website},
        ${institutions.image_url},
        ${places.name_ko}    AS place_name_ko,
        ${places.name_en}    AS place_name_en,
        ${places.country},
        ${places.city},
        ${places.address},
        ${places.latitude}::float,
        ${places.longitude}::float,
        ${places.opening_hours},
        ${places.admission}
      FROM ${institutions}
      JOIN ${places} ON ${places.institution_id} = ${institutions.id} AND ${places.deleted_at} IS NULL
      WHERE ${institutions.id} = ${id} AND ${institutions.deleted_at} IS NULL
    `);
    const rows = result.rows;

    if (rows.length === 0) {
      return notFound(instance);
    }

    const row = rows[0];

    const featuredResult = await db.execute<FeaturedRow>(sql`
      SELECT
        ${artworks.id}        AS artwork_id,
        ${artworks.title_ko}  AS artwork_title,
        ${artworks.image_url} AS artwork_image
      FROM ${institutionFeaturedArtworks}
      JOIN ${artworks} ON ${artworks.id} = ${institutionFeaturedArtworks.artwork_id} AND ${artworks.deleted_at} IS NULL
      WHERE ${institutionFeaturedArtworks.institution_id} = ${id}
      ORDER BY ${institutionFeaturedArtworks.display_order} ASC
      LIMIT 1
    `);
    const featuredRows = featuredResult.rows;

    const featured = featuredRows.length > 0 ? featuredRows[0] : null;

    return NextResponse.json({
      id: row.id,
      name_ko: row.name_ko,
      name_en: row.name_en,
      institution_type: row.institution_type,
      country_code: row.country_code,
      description_ko: row.description_ko,
      description_en: row.description_en,
      website: row.website,
      image_url: row.image_url ?? null,
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
      featured_artwork: featured
        ? {
            artwork_id: featured.artwork_id,
            artwork_title: featured.artwork_title,
            image_url: featured.artwork_image,
          }
        : null,
    });
  } catch (error) {
    console.error(`[GET ${instance}]`, error);
    return internalServerError(instance);
  }
}
