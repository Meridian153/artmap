// 미술관 마커 컴포넌트 — 지도 위에 개별 미술관 위치를 아이콘 마커로 표시

'use client'

import { useState } from 'react'
import { Marker } from 'react-map-gl/maplibre'
import type { MuseumSummary } from '@/types/museum'

// Props 인터페이스
export interface MuseumMarkerProps {
  /** 미술관 요약 데이터 */
  museum: MuseumSummary
  /** 클릭 시 콜백 */
  onClick?: (museum: MuseumSummary) => void
}

// 미술관 마커 컴포넌트
export function MuseumMarker({ museum, onClick }: MuseumMarkerProps) {
  // 호버 상태 관리
  const [hovered, setHovered] = useState(false)

  return (
    <Marker longitude={museum.longitude} latitude={museum.latitude} anchor="bottom">
      <div className="relative flex flex-col items-center">
        {/* 호버 시 미술관 이름 툴팁 */}
        {hovered && (
          <div
            className="absolute bottom-full mb-2 px-2 py-1 bg-gray-900 text-white text-xs
              rounded whitespace-nowrap pointer-events-none z-10 shadow-lg"
          >
            {museum.name_ko}
            {/* 툴팁 꼬리 */}
            <div className="absolute top-full left-1/2 -translate-x-1/2 border-4 border-transparent border-t-gray-900" />
          </div>
        )}

        {/* 마커 버튼 */}
        <button
          type="button"
          onClick={() => {
            console.log('미술관 클릭:', museum.name_ko)
            onClick?.(museum)
          }}
          onMouseEnter={() => setHovered(true)}
          onMouseLeave={() => setHovered(false)}
          title={museum.name_ko}
          className="flex items-center justify-center w-8 h-8 rounded-full
            bg-white border-2 border-blue-700 shadow-md cursor-pointer
            transition-all duration-200
            hover:scale-125 hover:shadow-xl hover:border-blue-900"
        >
          {/* 건물 아이콘 SVG (인라인) */}
          <svg
            xmlns="http://www.w3.org/2000/svg"
            width="16"
            height="16"
            viewBox="0 0 24 24"
            fill="none"
            stroke="#1d4ed8"
            strokeWidth="2"
            strokeLinecap="round"
            strokeLinejoin="round"
            aria-hidden="true"
          >
            {/* 건물 외벽 */}
            <rect x="3" y="7" width="18" height="14" rx="1" />
            {/* 지붕 삼각형 */}
            <polyline points="3 7 12 2 21 7" />
            {/* 문 */}
            <rect x="9" y="14" width="6" height="7" />
            {/* 창문 왼쪽 */}
            <rect x="5" y="10" width="3" height="3" />
            {/* 창문 오른쪽 */}
            <rect x="16" y="10" width="3" height="3" />
          </svg>
        </button>
      </div>
    </Marker>
  )
}
