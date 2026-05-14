// 홈 페이지 전용 지도 컴포넌트 — 줌 임계값에 따라 국가 버블과 미술관 버블이 크로스페이드되는 세계 지도

"use client";

import { useEffect, useRef, useState } from "react";
import { useRouter } from "next/navigation";
import type { MapRef, ViewStateChangeEvent } from "react-map-gl/maplibre";
import { MapView } from "@/components/map/MapView";
import { CountryBubble, COUNTRY_COORDS } from "@/components/map/CountryBubble";
import { MuseumBubble } from "@/components/map/MuseumBubble";
import { MapLegend } from "@/components/map/MapLegend";
import { getMapCountries, getMuseums } from "@/lib/api";
import type { CountryMapData } from "@/types/map";
import type { MuseumSummary } from "@/types/museum";

/** 줌 임계값 — 국가 버블 페이드 아웃 시작 */
const ZOOM_CROSSFADE_START = 5;
/** 줌 임계값 — 미술관 버블 페이드 인 완료 */
const ZOOM_CROSSFADE_END = 6;

/** 국가 버블 불투명도 — z<5: 1, 5≤z<6: 선형 감소, z≥6: 0 */
function calcCountryOpacity(zoom: number): number {
  if (zoom < ZOOM_CROSSFADE_START) return 1;
  if (zoom >= ZOOM_CROSSFADE_END) return 0;
  return 1 - (zoom - ZOOM_CROSSFADE_START) / (ZOOM_CROSSFADE_END - ZOOM_CROSSFADE_START);
}

/** 미술관 버블 불투명도 — z<5: 0, 5≤z<6: 선형 증가, z≥6: 1 */
function calcMuseumOpacity(zoom: number): number {
  if (zoom < ZOOM_CROSSFADE_START) return 0;
  if (zoom >= ZOOM_CROSSFADE_END) return 1;
  return (zoom - ZOOM_CROSSFADE_START) / (ZOOM_CROSSFADE_END - ZOOM_CROSSFADE_START);
}

// 홈 지도 컴포넌트 — 크로스페이드 기반 2단계 버블 시스템
export function HomeMap() {
  // 국가별 버블 데이터
  const [countries, setCountries] = useState<CountryMapData[]>([]);
  // 전 세계 미술관 목록 — 마운트 시 한 번만 로드
  const [allMuseums, setAllMuseums] = useState<MuseumSummary[]>([]);
  // 현재 지도 시점 — 줌 레벨 기반 크로스페이드에 사용
  const [viewState, setViewState] = useState({ longitude: 0, latitude: 20, zoom: 2 });
  // 현재 선택된 국가 코드 — 우측 하단 배지 표시용
  const [selectedCountryCode, setSelectedCountryCode] = useState<string | null>(null);
  // 데이터 로딩 상태
  const [loading, setLoading] = useState(true);
  // 데이터 에러 상태 — 국가·미술관 둘 다 실패할 때만 true
  const [error, setError] = useState(false);

  // 지도 인스턴스 ref — flyTo 등 명령형 API 사용
  const mapRef = useRef<MapRef>(null);

  // Next.js 라우터 — 미술관 클릭 시 상세 페이지 이동에 사용
  const router = useRouter();

  // 컴포넌트 마운트 시 국가/미술관 데이터를 병렬 로드 — 부분 실패 허용
  useEffect(() => {
    Promise.allSettled([getMapCountries(), getMuseums({ per_page: 100 })]).then(
      ([countriesResult, museumsResult]) => {
        if (countriesResult.status === "fulfilled") {
          setCountries(countriesResult.value);
        }
        if (museumsResult.status === "fulfilled") {
          setAllMuseums(museumsResult.value.data);
        }
        // 둘 다 실패한 경우에만 에러 화면 표시
        if (countriesResult.status === "rejected" && museumsResult.status === "rejected") {
          setError(true);
        }
        setLoading(false);
      },
    );
  }, []);

  // 지도 이동/줌 이벤트 — viewState 동기화
  function handleMove(evt: ViewStateChangeEvent) {
    setViewState(evt.viewState);
  }

  // 국가 버블 클릭 핸들러 — flyTo 및 선택 국가 업데이트만 수행 (API 재호출 없음)
  function handleBubbleClick(data: CountryMapData) {
    const coords = COUNTRY_COORDS[data.country_code];
    if (!coords) return;

    // 해당 국가로 부드럽게 줌인 — 크로스페이드 구간 진입
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

  // 미술관 버블 클릭 핸들러 — 해당 미술관 상세 페이지로 이동
  function handleMuseumClick(museum: MuseumSummary) {
    router.push(`/museums/${museum.id}`);
  }

  // 버블 크기 정규화를 위한 최대 미술관 수 — ?? 0 방어 처리: 실 API 응답에 museum_count 누락 시 런타임 에러 방지
  const maxMuseumCount = Math.max(
    ...countries.map((c) => c.museum_count ?? 0), // PENDING_BE: museum_count
    1,
  );

  // 현재 줌 레벨 기반 크로스페이드 불투명도
  const countryOpacity = calcCountryOpacity(viewState.zoom);
  const museumOpacity = calcMuseumOpacity(viewState.zoom);

  // 로딩 중 표시
  if (loading) {
    return (
      <div className="text-muted-foreground flex h-full items-center justify-center">
        지도를 불러오는 중...
      </div>
    );
  }

  // 에러 표시 — 국가·미술관 모두 실패한 경우에만
  if (error) {
    return (
      <div className="flex h-full items-center justify-center text-red-500 dark:text-red-400">
        지도 데이터를 불러올 수 없습니다
      </div>
    );
  }

  return (
    <div className="relative h-full w-full">
      <MapView ref={mapRef} onMove={handleMove}>
        {/* 국가 버블 — opacity > 0 일 때만 렌더링 (클릭 영역 방지) */}
        {countryOpacity > 0 &&
          countries.map((country) => (
            <CountryBubble
              key={country.country_code}
              data={country}
              maxCount={maxMuseumCount}
              zoom={viewState.zoom}
              opacity={countryOpacity}
              onClick={handleBubbleClick}
            />
          ))}

        {/* 미술관 버블 — opacity > 0 일 때만 렌더링 (클릭 영역 방지) */}
        {museumOpacity > 0 &&
          allMuseums.map((museum) => (
            <MuseumBubble
              key={museum.id}
              museum={museum}
              opacity={museumOpacity}
              onClick={handleMuseumClick}
            />
          ))}
      </MapView>

      {/* "전체 지도 보기" 버튼 — zoom >= 4일 때만 표시 */}
      {viewState.zoom >= 4 && (
        <button
          type="button"
          onClick={handleResetView}
          className="border-border bg-card text-card-foreground hover:bg-muted absolute top-4 left-4 z-10 cursor-pointer rounded-lg border px-3 py-1.5 text-sm font-medium shadow-md transition-all duration-200 hover:shadow-lg"
        >
          전체 지도 보기
        </button>
      )}

      {/* 선택된 국가 표시 레이블 — 우측 하단 (MapLegend 위치와 겹치지 않음) */}
      {selectedCountryCode && (
        <div className="pointer-events-none absolute right-4 bottom-8 z-10 rounded-lg bg-blue-600 px-3 py-1.5 text-sm font-medium text-white shadow-md">
          {countries.find((c) => c.country_code === selectedCountryCode)?.country_name_ko ??
            selectedCountryCode}
        </div>
      )}

      {/* 줌 레벨에 따라 텍스트가 바뀌는 범례 — 하단 중앙 */}
      <MapLegend zoom={viewState.zoom} />
    </div>
  );
}
