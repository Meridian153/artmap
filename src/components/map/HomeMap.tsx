// 홈 페이지 전용 지도 컴포넌트 — 국가 버블 클릭 시 미술관 마커로 전환되는 인터랙티브 세계 지도

"use client";

import { useEffect, useRef, useState } from "react";
import type { MapRef, ViewStateChangeEvent } from "react-map-gl/maplibre";
import { MapView } from "@/components/map/MapView";
import { CountryBubble, COUNTRY_COORDS } from "@/components/map/CountryBubble";
import { MuseumMarker } from "@/components/map/MuseumMarker";
import { getMapCountries, getMuseums } from "@/lib/api";
import type { CountryMapData } from "@/types/map";
import type { MuseumSummary } from "@/types/museum";

/** 줌 레벨 임계값 — 이 값 이상이면 미술관 마커, 미만이면 국가 버블 표시 */
const MUSEUM_ZOOM_THRESHOLD = 4.5;

// 홈 지도 컴포넌트 — 국가 클릭 인터랙션 및 줌 레벨 기반 마커 전환
export function HomeMap() {
  // 국가별 버블 데이터
  const [countries, setCountries] = useState<CountryMapData[]>([]);
  // 전 세계 미술관 목록 — 마운트 시 한 번만 로드
  const [allMuseums, setAllMuseums] = useState<MuseumSummary[]>([]);
  // 현재 지도 시점 — 줌 레벨 기반 조건부 렌더링에 사용
  const [viewState, setViewState] = useState({ longitude: 0, latitude: 20, zoom: 2 });
  // 현재 선택된 국가 코드
  const [selectedCountryCode, setSelectedCountryCode] = useState<string | null>(null);
  // 국가 데이터 로딩 상태
  const [loading, setLoading] = useState(true);
  // 국가 데이터 에러 상태
  const [error, setError] = useState(false);

  // 지도 인스턴스 ref — flyTo 등 명령형 API 사용
  const mapRef = useRef<MapRef>(null);

  // 컴포넌트 마운트 시 국가 데이터와 전체 미술관 목록을 병렬 로드
  useEffect(() => {
    Promise.all([getMapCountries(), getMuseums()])
      .then(([countryData, museumData]) => {
        setCountries(countryData);
        setAllMuseums(museumData.data);
        setLoading(false);
      })
      .catch(() => {
        setError(true);
        setLoading(false);
      });
  }, []);

  // 지도 이동/줌 이벤트 — viewState 동기화
  function handleMove(evt: ViewStateChangeEvent) {
    setViewState(evt.viewState);
  }

  // 국가 버블 클릭 핸들러 — flyTo 및 선택 국가 업데이트만 수행 (API 재호출 없음)
  function handleBubbleClick(data: CountryMapData) {
    const coords = COUNTRY_COORDS[data.country_code];
    if (!coords) return;

    // 해당 국가로 부드럽게 줌인
    mapRef.current?.flyTo({
      center: [coords.lng, coords.lat],
      zoom: 5,
      duration: 1500,
    });

    setSelectedCountryCode(data.country_code);
  }

  // "전체 지도 보기" 버튼 핸들러 — 세계 전체 뷰로 복귀 및 선택 해제
  function handleResetView() {
    mapRef.current?.flyTo({
      center: [0, 20],
      zoom: 2,
      duration: 1500,
    });
    setSelectedCountryCode(null);
  }

  // 미술관 마커 클릭 핸들러 (향후 상세 페이지 이동으로 교체 예정)
  function handleMuseumClick(_museum: MuseumSummary) {
    // TODO: 미술관 상세 페이지로 이동
  }

  // 버블 크기 정규화를 위한 최대 작품 수
  const maxCount = Math.max(...countries.map((c) => c.artwork_count), 1);

  // 현재 줌 레벨이 임계값 이상인지 여부
  const isZoomedIn = viewState.zoom >= MUSEUM_ZOOM_THRESHOLD;

  // 로딩 중 표시
  if (loading) {
    return (
      <div className="flex h-full items-center justify-center text-gray-500">
        지도를 불러오는 중...
      </div>
    );
  }

  // 에러 표시
  if (error) {
    return (
      <div className="flex h-full items-center justify-center text-red-500">
        지도 데이터를 불러올 수 없습니다
      </div>
    );
  }

  return (
    <div className="relative h-full w-full">
      <MapView ref={mapRef} onMove={handleMove}>
        {/* 줌 레벨 < 4.5: 국가 버블 표시 */}
        {!isZoomedIn &&
          countries.map((country) => (
            <CountryBubble
              key={country.country_code}
              data={country}
              maxCount={maxCount}
              onClick={handleBubbleClick}
            />
          ))}

        {/* 줌 레벨 >= 4.5: 전 세계 미술관 마커 표시 */}
        {isZoomedIn &&
          allMuseums.map((museum) => (
            <MuseumMarker
              key={museum.id}
              museum={museum}
              onClick={handleMuseumClick}
              highlighted={museum.country_code === selectedCountryCode}
            />
          ))}
      </MapView>

      {/* "전체 지도 보기" 버튼 — zoom >= 4일 때만 표시 */}
      {viewState.zoom >= 4 && (
        <button
          type="button"
          onClick={handleResetView}
          className="absolute top-4 left-4 z-10 cursor-pointer rounded-lg border border-gray-200 bg-white px-3 py-1.5 text-sm font-medium text-gray-700 shadow-md transition-all duration-200 hover:bg-gray-50 hover:shadow-lg"
        >
          전체 지도 보기
        </button>
      )}

      {/* 선택된 국가 표시 레이블 */}
      {selectedCountryCode && (
        <div className="pointer-events-none absolute right-4 bottom-8 z-10 rounded-lg bg-blue-600 px-3 py-1.5 text-sm font-medium text-white shadow-md">
          {countries.find((c) => c.country_code === selectedCountryCode)?.country_name_ko ??
            selectedCountryCode}
        </div>
      )}
    </div>
  );
}
