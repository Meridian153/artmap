// 국가별 버블 마커 컴포넌트 — 작품 수에 비례하는 원형 버블을 지도 위에 표시

"use client";

import { Marker } from "react-map-gl/maplibre";
import type { CountryMapData } from "@/types/map";

// Props 인터페이스
export interface CountryBubbleProps {
  /** 국가별 작품 수 데이터 */
  data: CountryMapData;
  /** 전체 데이터 중 최대 작품 수 (버블 크기 정규화용) */
  maxCount: number;
  /** 클릭 시 콜백 (향후 국가 줌인용) */
  onClick?: (data: CountryMapData) => void;
}

/** 국가별 중심 좌표 매핑 (ISO 3166-1 alpha-2) — HomeMap에서 flyTo에도 사용 */
export const COUNTRY_COORDS: Record<string, { lng: number; lat: number }> = {
  FR: { lng: 2.35, lat: 46.86 },
  NL: { lng: 5.29, lat: 52.13 },
  US: { lng: -98.58, lat: 39.83 },
  IT: { lng: 12.57, lat: 41.87 },
  KR: { lng: 127.77, lat: 35.91 },
  GB: { lng: -1.17, lat: 52.36 },
  ES: { lng: -3.75, lat: 40.46 },
  DE: { lng: 10.45, lat: 51.17 },
  RU: { lng: 37.62, lat: 55.75 },
  AT: { lng: 14.55, lat: 47.52 },
};

/** 버블 최소/최대 크기(px) */
const BUBBLE_MIN = 30;
const BUBBLE_MAX = 80;

/** 작품 수 기반 버블 크기 계산 */
function calcBubbleSize(count: number, maxCount: number): number {
  if (maxCount <= 0) return BUBBLE_MIN;
  const ratio = count / maxCount;
  return BUBBLE_MIN + ratio * (BUBBLE_MAX - BUBBLE_MIN);
}

// 국가별 버블 마커 컴포넌트
export function CountryBubble({ data, maxCount, onClick }: CountryBubbleProps) {
  const coords = COUNTRY_COORDS[data.country_code];
  // 좌표가 없는 국가는 렌더링하지 않음
  if (!coords) return null;

  const size = calcBubbleSize(data.artwork_count, maxCount);

  return (
    <Marker longitude={coords.lng} latitude={coords.lat} anchor="center">
      <button
        type="button"
        onClick={() => onClick?.(data)}
        title={`${data.country_name_ko} (${data.country_name_en})`}
        className="flex cursor-pointer items-center justify-center rounded-full bg-blue-500/70 font-semibold text-white transition-all duration-200 hover:scale-110 hover:bg-blue-500/90"
        style={{ width: size, height: size, fontSize: size * 0.3 }}
      >
        {data.artwork_count}
      </button>
    </Marker>
  );
}
