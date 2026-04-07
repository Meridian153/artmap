// 재사용 가능한 지도 기본 컴포넌트 — react-map-gl/maplibre 래퍼

'use client'

import { Map, NavigationControl } from 'react-map-gl/maplibre'
import 'maplibre-gl/dist/maplibre-gl.css'

// Props 인터페이스
export interface MapViewProps {
  /** 초기 지도 위치. 기본값: 세계 전체 */
  initialViewState?: { longitude: number; latitude: number; zoom: number }
  /** 지도 컨테이너 스타일 */
  style?: React.CSSProperties
  /** 마커 등 자식 컴포넌트 */
  children?: React.ReactNode
  /** 추가 Tailwind 클래스 */
  className?: string
}

/** OpenFreeMap 타일 스타일 URL */
const MAP_STYLE = 'https://tiles.openfreemap.org/styles/liberty'

// 재사용 가능한 지도 래퍼 컴포넌트
export function MapView({
  initialViewState = { longitude: 0, latitude: 20, zoom: 2 },
  style = { width: '100%', height: '100%' },
  children,
  className,
}: MapViewProps) {
  return (
    <div className={className} style={style}>
      <Map
        initialViewState={initialViewState}
        mapStyle={MAP_STYLE}
        style={{ width: '100%', height: '100%' }}
      >
        {/* 줌 버튼 */}
        <NavigationControl position="top-right" />
        {children}
      </Map>
    </div>
  )
}
