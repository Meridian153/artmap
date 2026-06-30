// GET /api/v1/search — 통합 검색 (화가·작품·미술관)
// F-001: 검색어 2자 이상, 우선순위 화가→작품→미술관, 부분 일치
//
// [v1.2.0] page/per_page 파라미터 추가 (더 보기 기능)
// [v1.2.0] 429 Rate Limit 응답 정의 (실제 적용은 Redis 등 외부 저장소 필요 — TODO)
//
// page 파라미터가 있으면 limit은 무시됩니다.
// type 파라미터에 따라 해당 카테고리만 페이지네이션, 나머지는 limit개만 반환합니다.

import type { NextRequest } from "next/server";
import { NextResponse } from "next/server";
import { db } from "@/lib/db";
import { sql } from "drizzle-orm";
import { artists, artworks, artworkArtists, institutions, places } from "@/lib/schema";
import { badRequest, internalServerError, parseIntParam } from "@/lib/api-response";

// ─── DB 행 타입 ───────────────────────────────────────────────────────────────

type ArtistSearchRow = {
  id: string;
  name_ko: string;
  name_en: string;
  thumbnail_url: string | null;
  total_count: number;
};

type ArtworkSearchRow = {
  id: string;
  title_ko: string;
  title_en: string;
  artist_name_ko: string | null;
  image_url: string | null;
  total_count: number;
};

type MuseumSearchRow = {
  id: string;
  name_ko: string;
  name_en: string;
  city: string | null;
  country_code: string;
  total_count: number;
};

// ─── 카테고리별 페이지네이션 파라미터 계산 ───────────────────────────────────

type PaginationParams = { limit: number; offset: number };

function getCategoryPagination(
  category: "artist" | "artwork" | "museum",
  type: string,
  isPaginated: boolean,
  page: number,
  perPage: number,
  autocompleteLimit: number,
): PaginationParams {
  // page 파라미터가 있고 type이 해당 카테고리(또는 all)이면 페이지네이션 적용
  if (isPaginated && (type === "all" || type === category)) {
    return { limit: perPage, offset: (page - 1) * perPage };
  }
  // 그 외에는 autocomplete 모드 — limit개만 반환
  return { limit: autocompleteLimit, offset: 0 };
}

// ─── GET 핸들러 ───────────────────────────────────────────────────────────────

export async function GET(request: NextRequest): Promise<NextResponse> {
  const instance = "/api/v1/search";

  try {
    const sp = request.nextUrl.searchParams;

    const q = sp.get("q") ?? "";

    // 검색어 최소 2자 검증
    if (q.length < 2) {
      return badRequest(instance, "검색어는 2자 이상이어야 합니다.");
    }

    const type = sp.get("type") ?? "all";
    const pageRaw = sp.get("page");
    const isPaginated = pageRaw !== null;
    const page = parseIntParam(pageRaw, 1, 1, 10000);
    const perPage = parseIntParam(sp.get("per_page"), 5, 1, 20);
    const limitParam = sp.get("limit");
    // page가 있으면 limit 무시 — autocomplete 시 limit 적용
    const autocompleteLimit = isPaginated ? perPage : parseIntParam(limitParam, 5, 1, 20);

    // type 유효성 검사
    const validTypes = new Set(["all", "artist", "artwork", "museum"]);
    const resolvedType = validTypes.has(type) ? type : "all";

    // ── 화가 검색 ──────────────────────────────────────────────────────────
    const artistPg = getCategoryPagination(
      "artist",
      resolvedType,
      isPaginated,
      page,
      perPage,
      autocompleteLimit,
    );
    const artistResult = await db.execute<ArtistSearchRow>(sql`
      SELECT
        ${artists.id},
        ${artists.name_ko},
        ${artists.name_en},
        ${artists.thumbnail_url},
        COUNT(*) OVER() AS total_count
      FROM ${artists}
      WHERE ${artists.name_ko} ILIKE ${"%" + q + "%"}
         OR ${artists.name_en} ILIKE ${"%" + q + "%"}
      ORDER BY ${artists.name_en} ASC
      LIMIT ${artistPg.limit} OFFSET ${artistPg.offset}
    `);

    // ── 작품 검색 ──────────────────────────────────────────────────────────
    const artworkPg = getCategoryPagination(
      "artwork",
      resolvedType,
      isPaginated,
      page,
      perPage,
      autocompleteLimit,
    );
    const artworkResult = await db.execute<ArtworkSearchRow>(sql`
      SELECT
        ${artworks.id},
        ${artworks.title_ko},
        ${artworks.title_en},
        ${artists.name_ko}   AS artist_name_ko,
        ${artworks.image_url},
        COUNT(*) OVER() AS total_count
      FROM ${artworks}
      LEFT JOIN ${artworkArtists} aa ON aa.artwork_id = ${artworks.id}
      LEFT JOIN ${artists}         ON ${artists.id}          = aa.artist_id
      WHERE ${artworks.title_ko} ILIKE ${"%" + q + "%"}
         OR ${artworks.title_en} ILIKE ${"%" + q + "%"}
      ORDER BY ${artworks.title_en} ASC
      LIMIT ${artworkPg.limit} OFFSET ${artworkPg.offset}
    `);

    // ── 미술관 검색 ────────────────────────────────────────────────────────
    const museumPg = getCategoryPagination(
      "museum",
      resolvedType,
      isPaginated,
      page,
      perPage,
      autocompleteLimit,
    );
    const museumResult = await db.execute<MuseumSearchRow>(sql`
      SELECT
        ${institutions.id},
        ${institutions.name_ko},
        ${institutions.name_en},
        ${places.city},
        ${institutions.country_code},
        COUNT(*) OVER() AS total_count
      FROM ${institutions}
      LEFT JOIN ${places} ON ${places.institution_id} = ${institutions.id}
      WHERE ${institutions.name_ko} ILIKE ${"%" + q + "%"}
         OR ${institutions.name_en} ILIKE ${"%" + q + "%"}
      ORDER BY ${institutions.name_en} ASC
      LIMIT ${museumPg.limit} OFFSET ${museumPg.offset}
    `);

    // ── 각 카테고리 전체 매칭 수 추출 ──────────────────────────────────────
    const artistsTotal =
      artistResult.rows.length > 0 ? Number(artistResult.rows[0].total_count) : 0;
    const artworksTotal =
      artworkResult.rows.length > 0 ? Number(artworkResult.rows[0].total_count) : 0;
    const museumsTotal =
      museumResult.rows.length > 0 ? Number(museumResult.rows[0].total_count) : 0;

    return NextResponse.json({
      query: q,
      page: isPaginated ? page : 1,
      per_page: isPaginated ? perPage : autocompleteLimit,
      artists_total: artistsTotal,
      artworks_total: artworksTotal,
      museums_total: museumsTotal,
      artists: artistResult.rows.map((row) => ({
        id: row.id,
        name_ko: row.name_ko,
        name_en: row.name_en,
        thumbnail_url: row.thumbnail_url,
      })),
      artworks: artworkResult.rows.map((row) => ({
        id: row.id,
        title_ko: row.title_ko,
        title_en: row.title_en,
        artist_name_ko: row.artist_name_ko,
        image_url: row.image_url,
      })),
      museums: museumResult.rows.map((row) => ({
        id: row.id,
        name_ko: row.name_ko,
        name_en: row.name_en,
        city: row.city,
        country_code: row.country_code,
      })),
    });
  } catch (error) {
    console.error("[GET /api/v1/search]", error);
    return internalServerError(instance);
  }
}
