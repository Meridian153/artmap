// 미술관 위치 미니맵 — 미술관 좌표를 중심으로 한 비인터랙티브 지도와 마커
// MapLibre는 브라우저 전용이므로 클라이언트 컴포넌트.

"use client";

import { Marker } from "react-map-gl/maplibre";
import { MapView } from "@/components/map/MapView";

export type MuseumLocationMapProps = {
  /** 미술관 위도 */
  latitude: number;
  /** 미술관 경도 */
  longitude: number;
  /** 미술관 이름 — 마커 title 및 외부 링크 라벨용 */
  name: string;
  /** 미술관 도로명 주소 (선택) */
  address?: string | null;
};

// 미술관 위치를 표시하는 미니맵 컴포넌트
export function MuseumLocationMap({ latitude, longitude, name, address }: MuseumLocationMapProps) {
  // Google Maps에서 보기 링크 — 새 탭으로 열림
  const googleMapsUrl = `https://www.google.com/maps?q=${latitude},${longitude}`;

  return (
    <section className="mt-12">
      <h2 className="text-sm font-semibold tracking-wider text-zinc-500 uppercase">위치</h2>

      {/* 미니맵 컨테이너 — 비인터랙티브, 줌 컨트롤 숨김 */}
      <div className="mt-3 h-[300px] overflow-hidden rounded-lg border border-zinc-200">
        <MapView
          initialViewState={{ longitude, latitude, zoom: 14 }}
          isInteractive={false}
          shouldShowNavigationControl={false}
        >
          {/* 단일 마커 — 빨간 핀 */}
          <Marker longitude={longitude} latitude={latitude} anchor="bottom">
            <div title={name} className="flex flex-col items-center">
              {/* 빨간 핀 SVG */}
              <svg
                xmlns="http://www.w3.org/2000/svg"
                width="32"
                height="32"
                viewBox="0 0 24 24"
                fill="#dc2626"
                stroke="#7f1d1d"
                strokeWidth="1.5"
                strokeLinecap="round"
                strokeLinejoin="round"
                aria-label={name}
              >
                <path d="M12 21s-7-7.58-7-12a7 7 0 1 1 14 0c0 4.42-7 12-7 12z" />
                <circle cx="12" cy="9" r="2.5" fill="#fff" stroke="none" />
              </svg>
            </div>
          </Marker>
        </MapView>
      </div>

      {/* 주소 + Google Maps 외부 링크 */}
      <div className="mt-3 flex flex-col gap-1 text-sm text-zinc-600 sm:flex-row sm:items-center sm:justify-between">
        {address && <p>{address}</p>}
        <a
          href={googleMapsUrl}
          target="_blank"
          rel="noopener noreferrer"
          className="text-blue-600 underline"
        >
          Google Maps에서 보기
        </a>
      </div>
    </section>
  );
}
