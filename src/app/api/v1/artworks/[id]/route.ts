// GET /api/v1/artworks/[id] — 작품 상세 정보 조회
// F-004: 이미지, 제목, 화가, 연도, 매체, 크기, 소장처, 상태, 큐레이션
// 비즈니스 규칙: 대여 중이면 현재 전시처(current_location)와 원소장처(primary_museum) 모두 표시
//
// [v1.1.0] current_location / primary_museum 복수 행 처리:
//   - current_location: start_date 가장 최근 1건, 복수 시 WARN 로그
//   - primary_museum  : created_at 가장 오래된 1건, 복수 시 WARN 로그
// [v1.2.0] current_location에 museum_id 추가
// [v1.2.0] Partial Unique Index 필수 적용 (DDL은 OpenAPI spec 참조)

import type { NextRequest } from "next/server";
import { NextResponse } from "next/server";
import { db } from "@/lib/db";
import { sql } from "drizzle-orm";
import {
  artworks,
  artworkArtists,
  artists,
  artworkOwnerships,
  institutions,
  places,
  artworkLocations,
} from "@/lib/schema";
import { notFound, internalServerError, isValidUUID } from "@/lib/api-response";

// ─── DB 행 타입 ───────────────────────────────────────────────────────────────

type ArtworkBaseRow = {
  id: string;
  title_ko: string;
  title_en: string;
  year_created: number | null;
  year_end: number | null;
  medium_ko: string | null;
  medium_en: string | null;
  dimensions: string | null;
  image_url: string | null;
  is_public_domain: boolean;
  status: string;
  curation_ko: string | null;
  curation_en: string | null;
  artist_id: string | null;
  artist_name_ko: string | null;
  artist_name_en: string | null;
};

type PrimaryMuseumRow = {
  id: string;
  name_ko: string;
  name_en: string;
  city: string;
  country_code: string;
  latitude: number;
  longitude: number;
  row_count: number;
};

type CurrentLocationRow = {
  museum_id: string | null;
  museum_name_ko: string | null;
  museum_name_en: string | null;
  city: string | null;
  country_code: string | null;
  latitude: number | null;
  longitude: number | null;
  start_date: string;
  end_date: string | null;
  row_count: number;
};

// ─── GET 핸들러 ───────────────────────────────────────────────────────────────

export async function GET(
  _request: NextRequest,
  { params }: { params: Promise<{ id: string }> },
): Promise<NextResponse> {
  const { id } = await params;
  const instance = `/api/v1/artworks/${id}`;

  if (!isValidUUID(id)) {
    return notFound(instance);
  }

  try {
    // ── 1. 작품 기본 정보 + 대표 화가 조회 ─────────────────────────────────
    const baseResult = await db.execute<ArtworkBaseRow>(sql`
      SELECT
        ${artworks.id},
        ${artworks.title_ko},
        ${artworks.title_en},
        ${artworks.year_created},
        ${artworks.year_end},
        ${artworks.medium_ko},
        ${artworks.medium_en},
        ${artworks.dimensions},
        ${artworks.image_url},
        ${artworks.is_public_domain},
        ${artworks.status},
        ${artworks.curation_ko},
        ${artworks.curation_en},
        ${artists.id}       AS artist_id,
        ${artists.name_ko}  AS artist_name_ko,
        ${artists.name_en}  AS artist_name_en
      FROM ${artworks}
      LEFT JOIN ${artworkArtists} ON ${artworkArtists.artwork_id} = ${artworks.id}
      LEFT JOIN ${artists}         ON ${artists.id}          = ${artworkArtists.artist_id}
      WHERE ${artworks.id} = ${id}
      ORDER BY ${artists.name_en} ASC
      LIMIT 1
    `);

    if (baseResult.rows.length === 0) {
      return notFound(instance);
    }

    const base = baseResult.rows[0];

    // ── 2. 원소장처(primary_museum) 조회 ──────────────────────────────────
    // is_primary_owner=true 복수 행 시: 안정적인 결과를 위해 institution_id ASC 기준 1건 선택
    const primaryResult = await db.execute<PrimaryMuseumRow>(sql`
      SELECT
        ${institutions.id},
        ${institutions.name_ko},
        ${institutions.name_en},
        ${places.city},
        ${institutions.country_code},
        ${places.latitude}::float,
        ${places.longitude}::float,
        COUNT(*) OVER() AS row_count
      FROM ${artworkOwnerships}
      JOIN ${institutions} ON ${institutions.id}             = ${artworkOwnerships.institution_id}
      JOIN ${places}       ON ${places.institution_id} = ${institutions.id}
      WHERE ${artworkOwnerships.artwork_id} = ${id} AND ${artworkOwnerships.is_primary_owner} = true
      ORDER BY ${artworkOwnerships.institution_id} ASC
      LIMIT 1
    `);

    // 복수 행 경고 로그 (Partial Unique Index 미적용 감지)
    if (primaryResult.rows.length > 0 && Number(primaryResult.rows[0].row_count) > 1) {
      console.warn(
        `[WARN] artwork ${id}: artwork_ownerships에 is_primary_owner=true 행이 복수 존재합니다. ` +
          `institution_id ASC 기준 1건만 반환합니다.`,
      );
    }

    // ── 3. 현재 전시 위치(current_location) 조회 ─────────────────────────
    // end_date IS NULL 복수 행 시: start_date 가장 최근 1건 선택
    const locationResult = await db.execute<CurrentLocationRow>(sql`
      SELECT
        ${institutions.id}        AS museum_id,
        ${institutions.name_ko}   AS museum_name_ko,
        ${institutions.name_en}   AS museum_name_en,
        ${places.city},
        ${institutions.country_code},
        ${places.latitude}::float,
        ${places.longitude}::float,
        ${artworkLocations.start_date},
        ${artworkLocations.end_date},
        COUNT(*) OVER() AS row_count
      FROM ${artworkLocations}
      JOIN ${places}       ON ${places.id}             = ${artworkLocations.place_id}
      LEFT JOIN ${institutions} ON ${institutions.id}        = ${places.institution_id}
      WHERE ${artworkLocations.artwork_id} = ${id} AND ${artworkLocations.end_date} IS NULL
      ORDER BY ${artworkLocations.start_date} DESC
      LIMIT 1
    `);

    // 복수 행 경고 로그 (Partial Unique Index 미적용 감지)
    if (locationResult.rows.length > 0 && Number(locationResult.rows[0].row_count) > 1) {
      console.warn(
        `[WARN] artwork ${id}: artwork_locations에 end_date IS NULL 행이 복수 존재합니다. ` +
          `start_date 가장 최근 1건만 반환합니다.`,
      );
    }

    // ── 4. 응답 조립 ─────────────────────────────────────────────────────
    const pm = primaryResult.rows[0] ?? null;
    const loc = locationResult.rows[0] ?? null;

    return NextResponse.json({
      id: base.id,
      title_ko: base.title_ko,
      title_en: base.title_en,
      year_created: base.year_created,
      year_end: base.year_end,
      medium_ko: base.medium_ko,
      medium_en: base.medium_en,
      dimensions: base.dimensions,
      image_url: base.image_url,
      is_public_domain: base.is_public_domain,
      status: base.status,
      curation_ko: base.curation_ko,
      curation_en: base.curation_en,
      artist:
        base.artist_id !== null
          ? {
              id: base.artist_id,
              name_ko: base.artist_name_ko,
              name_en: base.artist_name_en,
            }
          : null,
      primary_museum:
        pm !== null
          ? {
              id: pm.id,
              name_ko: pm.name_ko,
              name_en: pm.name_en,
              city: pm.city,
              country_code: pm.country_code,
              latitude: pm.latitude,
              longitude: pm.longitude,
            }
          : null,
      current_location:
        loc !== null
          ? {
              museum_id: loc.museum_id,
              museum_name_ko: loc.museum_name_ko,
              museum_name_en: loc.museum_name_en,
              city: loc.city,
              country_code: loc.country_code,
              latitude: loc.latitude,
              longitude: loc.longitude,
              start_date: loc.start_date,
              end_date: loc.end_date,
            }
          : null,
    });
  } catch (error) {
    console.error(`[GET ${instance}]`, error);
    return internalServerError(instance);
  }
}
