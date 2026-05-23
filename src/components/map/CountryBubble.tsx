// 국가별 버블 마커 컴포넌트 — 미술관 수에 비례하는 원형 버블을 지도 위에 표시

"use client";

import { useRef, useState } from "react";
import { Marker } from "react-map-gl/maplibre";
import type { CountryMapData } from "@/types/map";

type CountryBubbleProps = {
  data: CountryMapData;
  maxCount: number; // museum_count 기준 최대값
  zoom?: number; // 줌 레벨 — Step 6 통합에서 실제 값 전달 예정
  opacity?: number; // 크로스페이드 제어 (기본값 1)
  onClick?: (data: CountryMapData) => void;
};

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

/** 버블 최소/최대 반지름 (px) — width/height = radius * 2 (36~96px) */
const RADIUS_MIN = 18;
const RADIUS_MAX = 48;

/** 폰트 크기 계산 전용 반지름 범위 — 버블 크기 변경과 독립적으로 유지 */
const FONT_RADIUS_MIN = 24;
const FONT_RADIUS_MAX = 64;

/** museum_count 기반 로그 스케일 반지름 계산 */
function calcBubbleRadius(count: number, maxCount: number): number {
  if (maxCount <= 0 || count <= 0) return RADIUS_MIN;
  const ratio = Math.log(count + 1) / Math.log(maxCount + 1);
  return RADIUS_MIN + ratio * (RADIUS_MAX - RADIUS_MIN);
}

/** 폰트 크기 전용 반지름 계산 — 버블 크기와 독립 */
function calcFontRadius(count: number, maxCount: number): number {
  if (maxCount <= 0 || count <= 0) return FONT_RADIUS_MIN;
  const ratio = Math.log(count + 1) / Math.log(maxCount + 1);
  return FONT_RADIUS_MIN + ratio * (FONT_RADIUS_MAX - FONT_RADIUS_MIN);
}

// 국가별 버블 마커 컴포넌트
export function CountryBubble({ data, maxCount, opacity = 1, onClick }: CountryBubbleProps) {
  const buttonRef = useRef<HTMLButtonElement>(null);
  const [isHovered, setIsHovered] = useState(false);
  const [isLabelAbove, setIsLabelAbove] = useState(true);

  const coords = COUNTRY_COORDS[data.country_code];
  // 좌표가 없는 국가는 렌더링하지 않음
  if (!coords) return null;

  const museumCount = data.museum_count ?? 0;

  const radius = calcBubbleRadius(
    museumCount, // PENDING_BE: museum_count — GET /api/v1/map/countries
    maxCount,
  );
  const size = radius * 2;
  const fontRadius = calcFontRadius(museumCount, maxCount);

  const handleMouseEnter = () => {
    if (buttonRef.current) {
      const rect = buttonRef.current.getBoundingClientRect();
      // 라벨 예상 높이(≈20px)와 gap(10px)을 더해 뷰포트 상단 초과 여부 판별
      setIsLabelAbove(rect.top - radius - 10 - 20 >= 0);
    }
    setIsHovered(true);
  };

  const handleMouseLeave = () => {
    setIsHovered(false);
  };

  return (
    <Marker longitude={coords.lng} latitude={coords.lat} anchor="center">
      <div className="relative flex items-center justify-center">
        <button
          ref={buttonRef}
          type="button"
          onClick={() => onClick?.(data)}
          onMouseEnter={handleMouseEnter}
          onMouseLeave={handleMouseLeave}
          title={`${data.country_name_ko ?? data.country_code} (${data.country_name_en ?? ""})`}
          className="flex cursor-pointer items-center justify-center rounded-full bg-blue-500/70 font-semibold text-white hover:scale-110 hover:bg-blue-500/90"
          style={{
            width: size,
            height: size,
            fontSize: fontRadius * 0.35,
            opacity,
            // 등장(opacity=1): transform만 200ms / 퇴장(opacity=0): opacity 300ms 페이드 아웃 추가
            transition:
              opacity === 1
                ? "transform 200ms ease-out"
                : "transform 200ms ease-out, opacity 300ms ease-out",
            pointerEvents: opacity === 0 ? "none" : "auto",
            ...(isHovered && {
              boxShadow: "0 0 12px 4px rgba(59,130,246,0.5)",
            }),
          }}
        >
          {museumCount || data.artwork_count /* PENDING_BE: museum_count fallback */}
        </button>

        {/* 호버 라벨 — 데스크톱 hover 전용, 모바일 대응은 별도 PR */}
        <div
          className="text-foreground pointer-events-none absolute left-1/2 -translate-x-1/2 rounded-full bg-white/85 px-2 py-1 text-xs whitespace-nowrap backdrop-blur-md dark:bg-black/70"
          style={{
            ...(isLabelAbove ? { bottom: "calc(100% + 10px)" } : { top: "calc(100% + 10px)" }),
            zIndex: 10,
            opacity: isHovered ? 1 : 0,
            transition: isHovered ? "opacity 100ms ease-in" : "none",
          }}
        >
          {data.country_name_ko ?? data.country_code}
        </div>
      </div>
    </Marker>
  );
}
