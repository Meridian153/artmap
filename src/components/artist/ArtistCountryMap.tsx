// 화가 국가 분포 미니맵 — 작품 수에 비례하는 버블과 캡션 리스트를 함께 표시
// MapLibre는 브라우저 전용이므로 클라이언트 컴포넌트.

"use client";

import { Marker } from "react-map-gl/maplibre";
import { MapView } from "@/components/map/MapView";
import { COUNTRY_COORDS } from "@/components/map/CountryBubble";
import type { ArtistCountryDistribution } from "@/types/artist";

export type ArtistCountryMapProps = {
  /** 화가 작품의 국가별 분포 (Wrapper에서 null/empty 분기 처리됨) */
  distribution: ArtistCountryDistribution[];
};

/** 버블 최소/최대 크기(px) — CountryBubble과 동일한 시각 톤 유지 */
const BUBBLE_MIN = 30;
const BUBBLE_MAX = 80;

/** 작품 수 기반 버블 크기 계산 — maxCount 0일 때 0 나누기 방지 */
function calcBubbleSize(count: number, maxCount: number): number {
  if (maxCount === 0) return BUBBLE_MIN;
  const ratio = count / maxCount;
  return BUBBLE_MIN + ratio * (BUBBLE_MAX - BUBBLE_MIN);
}

/**
 * 분포 국가들의 평균 좌표 계산 — 미니맵 초기 중심 결정용
 * 좌표가 매핑된 국가만 평균에 포함하며, 매핑된 좌표가 없으면 안전한 기본값 반환
 */
function calcMapCenter(distribution: ArtistCountryDistribution[]): {
  longitude: number;
  latitude: number;
} {
  const validCoords = distribution
    .map((item) => COUNTRY_COORDS[item.country_code])
    .filter((c): c is { lng: number; lat: number } => c !== undefined);

  if (validCoords.length === 0) {
    // 좌표가 있는 국가가 하나도 없으면 안전한 기본값
    return { longitude: 0, latitude: 20 };
  }

  const sumLng = validCoords.reduce((sum, c) => sum + c.lng, 0);
  const sumLat = validCoords.reduce((sum, c) => sum + c.lat, 0);
  return {
    longitude: sumLng / validCoords.length,
    latitude: sumLat / validCoords.length,
  };
}

// 화가의 국가별 작품 분포를 비인터랙티브 미니맵 + 캡션 리스트로 표시
export function ArtistCountryMap({ distribution }: ArtistCountryMapProps) {
  // 버블 정규화 기준이 되는 최댓값
  const maxCount = distribution.reduce(
    (max, item) => (item.artwork_count > max ? item.artwork_count : max),
    0,
  );

  // 미니맵 초기 중심 — 분포 국가 좌표의 평균 (300px 컨테이너에서 마커가 가시 영역에 들어오도록)
  const center = calcMapCenter(distribution);

  // 캡션 리스트는 작품 수 내림차순 정렬 (원본 배열 보존)
  const sortedDistribution = [...distribution].sort((a, b) => b.artwork_count - a.artwork_count);

  return (
    <section className="mt-12">
      <h2 className="text-sm font-semibold tracking-wider text-zinc-500 uppercase">
        국가별 작품 분포
      </h2>

      {/* 미니맵 컨테이너 — 비인터랙티브, 줌 컨트롤 숨김 */}
      <div className="mt-3 h-[300px] overflow-hidden rounded-lg border border-zinc-200">
        <MapView
          initialViewState={{
            longitude: center.longitude,
            latitude: center.latitude,
            zoom: 1,
          }}
          isInteractive={false}
          shouldShowNavigationControl={false}
        >
          {distribution.map((item) => {
            // 좌표가 없는 국가는 마커 렌더에서 silently skip (캡션 리스트에는 표시됨)
            const coords = COUNTRY_COORDS[item.country_code];
            if (!coords) return null;

            const size = calcBubbleSize(item.artwork_count, maxCount);

            return (
              <Marker
                key={item.country_code}
                longitude={coords.lng}
                latitude={coords.lat}
                anchor="center"
              >
                <div
                  title={`${item.country_name_ko} (${item.country_name_en})`}
                  aria-label={`${item.country_name_ko} ${item.artwork_count}점`}
                  className="flex items-center justify-center rounded-full bg-blue-500/70 font-semibold text-white"
                  style={{ width: size, height: size, fontSize: size * 0.3 }}
                >
                  {item.artwork_count}
                </div>
              </Marker>
            );
          })}
        </MapView>
      </div>

      {/* 캡션 리스트 — 좌표 누락 국가까지 모두 표시하여 텍스트 fallback 역할 */}
      <ul className="mt-3 flex flex-col gap-1 text-sm text-zinc-600">
        {sortedDistribution.map((item) => (
          <li key={item.country_code}>
            {item.country_name_ko} ({item.country_name_en}) — {item.artwork_count}점
          </li>
        ))}
      </ul>
    </section>
  );
}
