// 홈 페이지 전용 지도 컴포넌트 — 국가별 버블 마커를 포함한 세계 지도

'use client'

import { useEffect, useState } from 'react'
import { MapView } from '@/components/map/MapView'
import { CountryBubble } from '@/components/map/CountryBubble'
import { getMapCountries } from '@/lib/api'
import type { CountryMapData } from '@/types/map'

// 홈 지도 컴포넌트 — 데이터 로딩 및 버블 마커 렌더링
export function HomeMap() {
  const [countries, setCountries] = useState<CountryMapData[]>([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState(false)

  // 컴포넌트 마운트 시 국가별 작품 수 데이터 로딩
  useEffect(() => {
    getMapCountries()
      .then((data) => {
        setCountries(data)
        setLoading(false)
      })
      .catch(() => {
        setError(true)
        setLoading(false)
      })
  }, [])

  // 로딩 중 표시
  if (loading) {
    return (
      <div className="flex items-center justify-center h-full text-gray-500">
        지도를 불러오는 중...
      </div>
    )
  }

  // 에러 표시
  if (error) {
    return (
      <div className="flex items-center justify-center h-full text-red-500">
        지도 데이터를 불러올 수 없습니다
      </div>
    )
  }

  // 버블 크기 정규화를 위한 최대 작품 수
  const maxCount = Math.max(...countries.map((c) => c.artwork_count), 1)

  // 버블 클릭 핸들러 (향후 국가 줌인 기능으로 교체 예정)
  function handleBubbleClick(_data: CountryMapData) {
    // TODO: 국가 클릭 시 해당 국가로 지도 줌인
  }

  return (
    <MapView>
      {countries.map((country) => (
        <CountryBubble
          key={country.country_code}
          data={country}
          maxCount={maxCount}
          onClick={handleBubbleClick}
        />
      ))}
    </MapView>
  )
}
