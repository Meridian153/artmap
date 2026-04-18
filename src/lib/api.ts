// API 클라이언트 — 모든 API 호출의 중앙 진입점
// NEXT_PUBLIC_USE_MOCK=true 이면 Mock 데이터 반환, false 이면 실제 API 호출

import type { CountryMapData, ArtistCountryDistribution } from "@/types/map";
import type { MuseumSummary, MuseumDetail } from "@/types/museum";
import type { ArtistSummary, ArtistDetail } from "@/types/artist";
import type {
  ArtworkDetail,
  ArtworkSummaryWithMuseum,
  MuseumArtworkSummary,
} from "@/types/artwork";
import type { SearchResult } from "@/types/search";
import type { PaginatedResponse } from "@/types/common";
import type { ProblemDetail } from "@/types/error";
import { ApiError } from "@/lib/errors";

import { mockCountryMapData } from "@/mocks/map";
import { mockMuseums, mockMuseumDetail } from "@/mocks/museums";
import { mockArtists, mockArtistDetail, mockArtistMapData } from "@/mocks/artists";
import { mockArtworks, mockArtworkDetail } from "@/mocks/artworks";
import { mockSearchResults } from "@/mocks/search";
import { getCountryName } from "@/lib/country-names";

// ─── 설정 ────────────────────────────────────────────────────────────────────

/** Mock 모드 여부 — true이면 실제 API 대신 Mock 데이터 사용 */
const USE_MOCK = process.env.NEXT_PUBLIC_USE_MOCK === "true";

/** 실제 API 기본 경로 */
const API_BASE = "/api/v1";

function getServerBaseUrl(): string {
  const explicit = process.env.NEXT_PUBLIC_SITE_URL;
  if (explicit && explicit.length > 0) return explicit;

  const vercelUrl = process.env.VERCEL_URL;
  if (vercelUrl && vercelUrl.length > 0) return `https://${vercelUrl}`;

  throw new Error(
    "Server-side fetch requires an absolute URL. Set NEXT_PUBLIC_SITE_URL (e.g. http://localhost:3000) in your environment.",
  );
}

// ─── 공통 fetch 헬퍼 ─────────────────────────────────────────────────────────

/** undefined가 아닌 값만 쿼리 파라미터로 변환하는 헬퍼 */
function buildSearchParams(params?: object): string {
  if (!params) return "";
  const sp = new URLSearchParams();
  for (const [key, value] of Object.entries(params)) {
    if (value !== undefined && value !== null) {
      sp.set(key, String(value));
    }
  }
  const query = sp.toString();
  return query ? `?${query}` : "";
}

/**
 * 실제 API 엔드포인트에 fetch 요청을 보내는 헬퍼
 * - RFC 9457 에러 응답(application/problem+json)을 ApiError로 변환
 * - 정상 응답은 JSON 파싱 후 T 타입으로 반환
 * - signal을 전달하면 요청 취소 가능 (자동완성 등 경쟁 요청 방지)
 */
async function fetchApi<T>(endpoint: string, params?: object, signal?: AbortSignal): Promise<T> {
  const path = `${API_BASE}${endpoint}${buildSearchParams(params)}`;
  const url = typeof window === "undefined" ? new URL(path, getServerBaseUrl()).toString() : path;
  const response = await fetch(url, signal !== undefined ? { signal } : undefined);

  // 에러 응답 처리
  if (!response.ok) {
    const contentType = response.headers.get("Content-Type") ?? "";
    if (contentType.includes("application/problem+json")) {
      const problem = (await response.json()) as ProblemDetail;
      throw new ApiError(problem);
    }
    throw new Error(`HTTP ${response.status}: ${response.statusText}`);
  }

  return response.json() as Promise<T>;
}

// ─── 페이지네이션 헬퍼 ────────────────────────────────────────────────────────

/** 배열을 PaginatedResponse 형태로 래핑하는 Mock 전용 헬퍼 */
function paginate<T>(items: T[], page: number = 1, perPage: number = 20): PaginatedResponse<T> {
  const start = (page - 1) * perPage;
  return {
    data: items.slice(start, start + perPage),
    total: items.length,
    page,
    per_page: perPage,
  };
}

// ─── 지도 API ────────────────────────────────────────────────────────────────

/**
 * 국가별 작품 수 집계 조회
 * GET /api/v1/map/countries
 */
export async function getMapCountries(): Promise<CountryMapData[]> {
  if (USE_MOCK) {
    return mockCountryMapData;
  }
  return fetchApi<CountryMapData[]>("/map/countries");
}

// ─── 미술관 API ──────────────────────────────────────────────────────────────

export interface GetMuseumsParams {
  country?: string;
  city?: string;
  page?: number;
  per_page?: number;
}

/**
 * 미술관 목록 조회
 * GET /api/v1/museums
 */
export async function getMuseums(
  params?: GetMuseumsParams,
): Promise<PaginatedResponse<MuseumSummary>> {
  if (USE_MOCK) {
    let filtered = mockMuseums;
    // 국가 필터: country_code 일치 또는 한/영 국가명을 country-names 사전으로 조회해 부분 매칭
    if (params?.country) {
      const needle = params.country.toLowerCase();
      filtered = filtered.filter((m) => {
        if (m.country_code.toLowerCase() === needle) return true;
        const name = getCountryName(m.country_code);
        return name.ko.includes(params.country!) || name.en.toLowerCase().includes(needle);
      });
    }
    // 도시 필터: city는 단일 문자열이므로 대소문자 무시 부분 매칭
    if (params?.city) {
      const needle = params.city.toLowerCase();
      filtered = filtered.filter((m) => m.city.toLowerCase().includes(needle));
    }
    return paginate(filtered, params?.page, params?.per_page);
  }
  return fetchApi<PaginatedResponse<MuseumSummary>>("/museums", params);
}

/**
 * 미술관 상세 조회
 * GET /api/v1/museums/{id}
 */
export async function getMuseumById(id: string): Promise<MuseumDetail | null> {
  if (USE_MOCK) {
    return mockMuseumDetail[id] ?? null;
  }
  return fetchApi<MuseumDetail>(`/museums/${id}`);
}

export interface GetMuseumArtworksParams {
  page?: number;
  per_page?: number;
  limit?: number;
}

/**
 * 미술관 소장 작품 목록 조회
 * GET /api/v1/museums/{id}/artworks
 * limit이 있으면 page/per_page는 무시됩니다 (OpenAPI Spec v1.3.0 우선순위 규칙)
 */
export async function getMuseumArtworks(
  id: string,
  params?: GetMuseumArtworksParams,
): Promise<{ data: MuseumArtworkSummary[]; total: number }> {
  if (USE_MOCK) {
    // ArtworkSummaryWithMuseum에는 museum_id가 없으므로 mockArtworkDetail.primary_museum.id로 매칭
    // 결과는 MuseumArtworkSummary 형태(year_label/thumbnail_url)로 변환
    const filtered = mockArtworks.filter(
      (aw) => mockArtworkDetail[aw.id]?.primary_museum?.id === id,
    );
    const toMuseumSummary = (aw: (typeof mockArtworks)[number]): MuseumArtworkSummary => {
      const detail = mockArtworkDetail[aw.id];
      return {
        id: aw.id,
        title_ko: aw.title_ko,
        title_en: aw.title_en,
        year_label: aw.year_created !== null ? String(aw.year_created) : null,
        thumbnail_url: aw.image_url,
        status: aw.status,
        artist: detail?.artist
          ? {
              id: detail.artist.id,
              name_ko: detail.artist.name_ko,
              name_en: detail.artist.name_en,
            }
          : null,
      };
    };
    if (params?.limit !== undefined) {
      return { data: filtered.slice(0, params.limit).map(toMuseumSummary), total: filtered.length };
    }
    const paged = paginate(filtered, params?.page, params?.per_page);
    return { data: paged.data.map(toMuseumSummary), total: paged.total };
  }
  return fetchApi<{ data: MuseumArtworkSummary[]; total: number }>(
    `/museums/${id}/artworks`,
    params,
  );
}

// ─── 화가 API ────────────────────────────────────────────────────────────────

export interface GetArtistsParams {
  movement?: string;
  nationality?: string;
  sort?: string;
  page?: number;
  per_page?: number;
}

/**
 * 화가 목록 조회
 * GET /api/v1/artists
 */
export async function getArtists(
  params?: GetArtistsParams,
): Promise<PaginatedResponse<ArtistSummary>> {
  if (USE_MOCK) {
    let filtered = mockArtists;
    // nationality는 단일 문자열(영문 원문)이므로 대소문자 무시 부분 매칭
    if (params?.nationality) {
      const needle = params.nationality.toLowerCase();
      filtered = filtered.filter((a) => (a.nationality ?? "").toLowerCase().includes(needle));
    }
    // movement 필터: movements 배열에서 한/영 사조명을 부분 매칭
    if (params?.movement) {
      const needle = params.movement.toLowerCase();
      filtered = filtered.filter((a) =>
        a.movements.some(
          (m) => m.name_ko.includes(params.movement!) || m.name_en.toLowerCase().includes(needle),
        ),
      );
    }
    return paginate(filtered, params?.page, params?.per_page);
  }
  return fetchApi<PaginatedResponse<ArtistSummary>>("/artists", params);
}

/**
 * 화가 상세 조회
 * GET /api/v1/artists/{id}
 */
export async function getArtistById(id: string): Promise<ArtistDetail | null> {
  if (USE_MOCK) {
    return mockArtistDetail[id] ?? null;
  }
  return fetchApi<ArtistDetail>(`/artists/${id}`);
}

export interface GetArtistArtworksParams {
  page?: number;
  per_page?: number;
  limit?: number;
}

/**
 * 화가 작품 목록 조회
 * GET /api/v1/artists/{id}/artworks
 * limit이 있으면 page/per_page는 무시됩니다 (OpenAPI Spec v1.3.0 우선순위 규칙)
 */
export async function getArtistArtworks(
  id: string,
  params?: GetArtistArtworksParams,
): Promise<{ data: ArtworkSummaryWithMuseum[]; total: number }> {
  if (USE_MOCK) {
    // ArtworkSummaryWithMuseum에는 artist_id가 없으므로 mockArtworkDetail.artist.id로 매칭
    const filtered = mockArtworks.filter((aw) => mockArtworkDetail[aw.id]?.artist?.id === id);
    if (params?.limit !== undefined) {
      return { data: filtered.slice(0, params.limit), total: filtered.length };
    }
    const paged = paginate(filtered, params?.page, params?.per_page);
    return { data: paged.data, total: paged.total };
  }
  return fetchApi<{ data: ArtworkSummaryWithMuseum[]; total: number }>(
    `/artists/${id}/artworks`,
    params,
  );
}

/**
 * 화가 작품 국가 분포 조회
 * GET /api/v1/artists/{id}/map-data
 */
export async function getArtistMapData(id: string): Promise<ArtistCountryDistribution[]> {
  if (USE_MOCK) {
    return mockArtistMapData[id] ?? [];
  }
  return fetchApi<ArtistCountryDistribution[]>(`/artists/${id}/map-data`);
}

// ─── 작품 API ────────────────────────────────────────────────────────────────

export interface GetArtworksParams {
  artist_id?: string;
  movement?: string;
  status?: string;
  sort?: string;
  page?: number;
  per_page?: number;
}

/**
 * 작품 목록 조회
 * GET /api/v1/artworks
 */
export async function getArtworks(
  params?: GetArtworksParams,
): Promise<PaginatedResponse<ArtworkSummaryWithMuseum>> {
  if (USE_MOCK) {
    let filtered = mockArtworks;
    // artist_id 필터: ArtworkSummaryWithMuseum에 artist_id가 없으므로 detail에서 조회
    if (params?.artist_id) {
      filtered = filtered.filter((aw) => mockArtworkDetail[aw.id]?.artist?.id === params.artist_id);
    }
    if (params?.status) {
      filtered = filtered.filter((aw) => aw.status === params.status);
    }
    return paginate(filtered, params?.page, params?.per_page);
  }
  return fetchApi<PaginatedResponse<ArtworkSummaryWithMuseum>>("/artworks", params);
}

/**
 * 작품 상세 조회
 * GET /api/v1/artworks/{id}
 */
export async function getArtworkById(id: string): Promise<ArtworkDetail | null> {
  if (USE_MOCK) {
    return mockArtworkDetail[id] ?? null;
  }
  return fetchApi<ArtworkDetail>(`/artworks/${id}`);
}

// ─── 검색 API ────────────────────────────────────────────────────────────────

// interface → type 변환: styleguide §3-2 준수
export type SearchParams = {
  q: string;
  type?: string;
  /** 자동완성 모드 카테고리별 최대 반환 수 (1–20, 기본 5). page와 함께 사용하지 않는다. */
  limit?: number;
  page?: number;
  per_page?: number;
};

/**
 * 통합 검색
 * GET /api/v1/search
 */
export async function search(params: SearchParams, signal?: AbortSignal): Promise<SearchResult> {
  if (USE_MOCK) {
    return mockSearchResults(params.q, {
      type: params.type,
      limit: params.limit,
      page: params.page,
      per_page: params.per_page,
    });
  }
  return fetchApi<SearchResult>("/search", params, signal);
}
