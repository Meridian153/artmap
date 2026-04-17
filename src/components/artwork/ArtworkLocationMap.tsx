// 작품 소장 미술관 미니맵 — 원소장처와 대여 전시처 위치를 지도에 표시
// MapLibre는 브라우저 전용이므로 클라이언트 컴포넌트.

"use client";

import { Marker } from "react-map-gl/maplibre";
import { MapView } from "@/components/map/MapView";
import type { ArtworkDetail } from "@/types/artwork";

export type ArtworkLocationMapProps = {
  primaryMuseum: ArtworkDetail["primary_museum"];
  currentLocation: ArtworkDetail["current_location"];
  isOnLoan: boolean;
};

// 핀 SVG — fill/stroke를 주입해 빨간/파란 마커 재사용
function PinIcon({ fill, stroke, label }: { fill: string; stroke: string; label: string }) {
  return (
    <svg
      xmlns="http://www.w3.org/2000/svg"
      width="32"
      height="32"
      viewBox="0 0 24 24"
      fill={fill}
      stroke={stroke}
      strokeWidth="1.5"
      strokeLinecap="round"
      strokeLinejoin="round"
      aria-label={label}
    >
      <path d="M12 21s-7-7.58-7-12a7 7 0 1 1 14 0c0 4.42-7 12-7 12z" />
      <circle cx="12" cy="9" r="2.5" fill="#fff" stroke="none" />
    </svg>
  );
}

export function ArtworkLocationMap({
  primaryMuseum,
  currentLocation,
  isOnLoan,
}: ArtworkLocationMapProps) {
  if (!primaryMuseum) return null;

  const primaryLabel = isOnLoan ? `원소장처: ${primaryMuseum.name_ko}` : primaryMuseum.name_ko;

  return (
    <section className="rounded-lg border border-zinc-200 p-6">
      <h2 className="mb-3 text-xs font-medium tracking-wider text-zinc-500 uppercase">소장 위치</h2>
      <div className="h-64 overflow-hidden rounded-lg md:h-80">
        <MapView
          initialViewState={{
            longitude: primaryMuseum.longitude,
            latitude: primaryMuseum.latitude,
            zoom: 4,
          }}
          isInteractive={false}
          shouldShowNavigationControl={false}
        >
          {/* 빨간 마커 — 원소장처 */}
          <Marker
            longitude={primaryMuseum.longitude}
            latitude={primaryMuseum.latitude}
            anchor="bottom"
          >
            <div title={primaryLabel} className="flex flex-col items-center">
              <PinIcon fill="#dc2626" stroke="#7f1d1d" label={primaryLabel} />
            </div>
          </Marker>

          {/* 파란 마커 — 현재 전시처 (on_loan일 때만) */}
          {isOnLoan && currentLocation && (
            <Marker
              longitude={currentLocation.longitude}
              latitude={currentLocation.latitude}
              anchor="bottom"
            >
              <div
                title={`현재 전시: ${currentLocation.museum_name_ko}`}
                className="flex flex-col items-center"
              >
                <PinIcon
                  fill="#3b82f6"
                  stroke="#1e40af"
                  label={`현재 전시: ${currentLocation.museum_name_ko}`}
                />
              </div>
            </Marker>
          )}
        </MapView>
      </div>
    </section>
  );
}
