// GET /api/v1/map/cities — 도시별 미술관 수 집계 (지도 3단 구조 도시 버블 데이터)
// bbox 또는 country_code 파라미터 중 하나 이상 필수
// 결과 상한: LIMIT 200 (렌더링 병목 방지)

import { NextRequest, NextResponse } from "next/server";
import { db } from "@/lib/db";
import { places, institutions } from "@/lib/schema";
import { sql, eq, isNull, and, between, SQL } from "drizzle-orm";
import { badRequest, internalServerError } from "@/lib/api-response";

export const dynamic = "force-dynamic";

const RESULT_CAP = 200;
const INSTANCE = "/api/v1/map/cities";

// ─── 응답 타입 ─────────────────────────────────────────────────────────────────

type CityMapData = {
  city: string;
  country_code: string;
  latitude: number;
  longitude: number;
  museum_count: number;
};

// ─── bbox 파싱 헬퍼 ────────────────────────────────────────────────────────────

type BBox = { west: number; south: number; east: number; north: number };

function parseBBox(raw: string): BBox | null {
  const parts = raw.split(",");
  if (parts.length !== 4) return null;
  const [west, south, east, north] = parts.map(Number);
  if ([west, south, east, north].some(isNaN)) return null;
  if (west >= east || south >= north) return null;
  return { west, south, east, north };
}

// ─── GET 핸들러 ────────────────────────────────────────────────────────────────

export async function GET(request: NextRequest): Promise<NextResponse> {
  const { searchParams } = request.nextUrl;
  const bboxRaw = searchParams.get("bbox");
  const countryCode = searchParams.get("country_code");

  if (!bboxRaw && !countryCode) {
    return badRequest(INSTANCE, "bbox 또는 country_code 파라미터 중 하나 이상 필수입니다.");
  }

  let bbox: BBox | null = null;
  if (bboxRaw) {
    bbox = parseBBox(bboxRaw);
    if (!bbox) {
      return badRequest(
        INSTANCE,
        "bbox 형식이 올바르지 않습니다. 'west,south,east,north' (숫자) 형식으로 입력해주세요.",
      );
    }
  }

  try {
    const filters: SQL[] = [isNull(places.deleted_at), isNull(institutions.deleted_at)];

    if (bbox) {
      filters.push(
        between(places.latitude, sql`${bbox.south}`, sql`${bbox.north}`),
        between(places.longitude, sql`${bbox.west}`, sql`${bbox.east}`),
      );
    }

    if (countryCode) {
      filters.push(eq(institutions.country_code, countryCode));
    }

    const rows = await db
      .select({
        city: places.city,
        country_code: institutions.country_code,
        latitude: sql<number>`AVG(${places.latitude})::float`,
        longitude: sql<number>`AVG(${places.longitude})::float`,
        museum_count: sql<number>`COUNT(DISTINCT ${places.institution_id})::integer`,
      })
      .from(places)
      .innerJoin(institutions, eq(places.institution_id, institutions.id))
      .where(and(...filters))
      .groupBy(places.city, institutions.country_code)
      .having(sql`COUNT(DISTINCT ${places.institution_id}) > 0`)
      .orderBy(sql`COUNT(DISTINCT ${places.institution_id}) DESC`)
      .limit(RESULT_CAP);

    const data: CityMapData[] = rows.map((row) => ({
      city: row.city,
      country_code: row.country_code,
      latitude: row.latitude,
      longitude: row.longitude,
      museum_count: row.museum_count,
    }));

    return NextResponse.json(data);
  } catch (error) {
    console.error("[GET /api/v1/map/cities]", error);
    return internalServerError(INSTANCE);
  }
}
