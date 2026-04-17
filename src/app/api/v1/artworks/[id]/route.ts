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
import pool from "@/lib/db";
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
    const baseResult = await pool.query<ArtworkBaseRow>(
      `
      SELECT
        aw.id,
        aw.title_ko,
        aw.title_en,
        aw.year_created,
        aw.year_end,
        aw.medium_ko,
        aw.medium_en,
        aw.dimensions,
        aw.image_url,
        aw.is_public_domain,
        aw.status,
        aw.curation_ko,
        aw.curation_en,
        a.id       AS artist_id,
        a.name_ko  AS artist_name_ko,
        a.name_en  AS artist_name_en
      FROM artworks aw
      LEFT JOIN artwork_artists aa ON aa.artwork_id = aw.id
      LEFT JOIN artists         a  ON a.id          = aa.artist_id
      WHERE aw.id = $1
      ORDER BY a.name_en ASC
      LIMIT 1
      `,
      [id],
    );

    if (baseResult.rows.length === 0) {
      return notFound(instance);
    }

    const base = baseResult.rows[0];

    // ── 2. 원소장처(primary_museum) 조회 ──────────────────────────────────
    // is_primary_owner=true 복수 행 시: 안정적인 결과를 위해 institution_id ASC 기준 1건 선택
    const primaryResult = await pool.query<PrimaryMuseumRow>(
      `
      SELECT
        i.id,
        i.name_ko,
        i.name_en,
        p.city,
        i.country_code,
        p.latitude::float,
        p.longitude::float,
        COUNT(*) OVER() AS row_count
      FROM artwork_ownerships ao
      JOIN institutions i ON i.id             = ao.institution_id
      JOIN places       p ON p.institution_id = i.id
      WHERE ao.artwork_id = $1 AND ao.is_primary_owner = true
      ORDER BY ao.institution_id ASC
      LIMIT 1
      `,
      [id],
    );

    // 복수 행 경고 로그 (Partial Unique Index 미적용 감지)
    if (primaryResult.rows.length > 0 && Number(primaryResult.rows[0].row_count) > 1) {
      console.warn(
        `[WARN] artwork ${id}: artwork_ownerships에 is_primary_owner=true 행이 복수 존재합니다. ` +
          `institution_id ASC 기준 1건만 반환합니다.`,
      );
    }

    // ── 3. 현재 전시 위치(current_location) 조회 ─────────────────────────
    // end_date IS NULL 복수 행 시: start_date 가장 최근 1건 선택
    const locationResult = await pool.query<CurrentLocationRow>(
      `
      SELECT
        i.id        AS museum_id,
        i.name_ko   AS museum_name_ko,
        i.name_en   AS museum_name_en,
        p.city,
        i.country_code,
        p.latitude::float,
        p.longitude::float,
        al.start_date,
        al.end_date,
        COUNT(*) OVER() AS row_count
      FROM artwork_locations al
      JOIN places       p ON p.id             = al.place_id
      LEFT JOIN institutions i ON i.id        = p.institution_id
      WHERE al.artwork_id = $1 AND al.end_date IS NULL
      ORDER BY al.start_date DESC
      LIMIT 1
      `,
      [id],
    );

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
