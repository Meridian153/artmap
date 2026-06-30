// GET /api/v1/artists/[id] — 화가 상세 정보 조회
// F-003: 이름, 생몰년, 국적, 약력, 화풍
// [v1.2.0] 화가 상세 페이지는 이 API + /artworks?limit=20 + /map-data 를 병렬 호출해야 합니다.

import type { NextRequest } from "next/server";
import { NextResponse } from "next/server";
import { db } from "@/lib/db";
import { sql } from "drizzle-orm";
import {
  artists,
  artistMovements,
  artMovements,
  artworkArtists,
  artworkOwnerships,
  institutions,
  artworks,
} from "@/lib/schema";
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

type TopMuseumRow = {
  museum_name_ko: string;
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
    const result = await db.execute<ArtistDetailRow>(sql`
      SELECT
        ${artists.id},
        ${artists.name_ko},
        ${artists.name_en},
        ${artists.birth_year},
        ${artists.death_year},
        ${artists.nationality},
        ${artists.bio_ko},
        ${artists.bio_en},
        ${artists.thumbnail_url},
        JSON_AGG(
          JSON_BUILD_OBJECT(
            'name_ko',      ${artMovements.name_ko},
            'name_en',      ${artMovements.name_en},
            'period_start', ${artMovements.period_start},
            'period_end',   ${artMovements.period_end}
          )
          ORDER BY ${artMovements.period_start} ASC NULLS LAST
        ) FILTER (WHERE ${artMovements.id} IS NOT NULL) AS movements
      FROM ${artists}
      LEFT JOIN ${artistMovements} ON ${artistMovements.artist_id} = ${artists.id}
      LEFT JOIN ${artMovements} ON ${artMovements.id} = ${artistMovements.movement_id}
      WHERE ${artists.id} = ${id} AND ${artists.deleted_at} IS NULL
      GROUP BY
        ${artists.id}, ${artists.name_ko}, ${artists.name_en}, ${artists.birth_year}, ${artists.death_year},
        ${artists.nationality}, ${artists.bio_ko}, ${artists.bio_en}, ${artists.thumbnail_url}
    `);
    const rows = result.rows;

    if (rows.length === 0) {
      return notFound(instance);
    }

    const row = rows[0];

    const museumResult = await db.execute<TopMuseumRow>(sql`
      SELECT ${institutions.name_ko} AS museum_name_ko
      FROM ${artworkArtists}
      JOIN ${artworkOwnerships} ON ${artworkOwnerships.artwork_id} = ${artworkArtists.artwork_id}
      JOIN ${institutions} ON ${institutions.id} = ${artworkOwnerships.institution_id} AND ${institutions.deleted_at} IS NULL
      JOIN ${artworks} ON ${artworks.id} = ${artworkArtists.artwork_id} AND ${artworks.deleted_at} IS NULL
      WHERE ${artworkArtists.artist_id} = ${id}
      GROUP BY ${institutions.id}, ${institutions.name_ko}
      ORDER BY COUNT(*) DESC
      LIMIT 1
    `);
    const museumRows = museumResult.rows;

    const topMuseumNameKo = museumRows.length > 0 ? museumRows[0].museum_name_ko : null;

    return NextResponse.json({
      id: row.id,
      name_ko: row.name_ko,
      name_en: row.name_en,
      birth_year: row.birth_year,
      death_year: row.death_year,
      nationality: row.nationality,
      bio_ko: row.bio_ko,
      bio_en: row.bio_en,
      image_url: row.thumbnail_url,
      movements: row.movements ?? [],
      top_museum_name_ko: topMuseumNameKo,
    });
  } catch (error) {
    console.error(`[GET ${instance}]`, error);
    return internalServerError(instance);
  }
}
