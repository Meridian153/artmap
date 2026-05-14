// 홈 페이지 전용 지도 컴포넌트 — 줌 임계값에 따라 국가 버블과 미술관 버블이 순차 페이드로 전환되는 세계 지도

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

/** 줌 임계값 — 이상이면 미술관 버블 모드 진입 */
const ZOOM_MUSEUM_ENTER = 6;
/** 줌 임계값 — 미만이면 국가 버블 모드 진입 (5≤z<6 구간은 히스테리시스로 현재 상태 유지) */
const ZOOM_COUNTRY_ENTER = 5;
/** 페이드 아웃 지속 시간 (ms) — CountryBubble·MuseumBubble의 opacity transition 길이와 동일해야 함 */
const FADE_OUT_MS = 300;

/** 버블 표시 4상태 머신 — country ↔ fading-out-country → museum ↔ fading-out-museum → country */
type BubbleState = "country" | "fading-out-country" | "museum" | "fading-out-museum";

// 홈 지도 컴포넌트 — 크로스페이드 기반 2단계 버블 시스템
export function HomeMap() {
  // 국가별 버블 데이터
  const [countries, setCountries] = useState<CountryMapData[]>([]);
  // 전 세계 미술관 목록 — 마운트 시 한 번만 로드
  const [allMuseums, setAllMuseums] = useState<MuseumSummary[]>([]);
  // 현재 지도 시점 — 줌 레벨 기반 상태 전이 트리거
  const [viewState, setViewState] = useState({ longitude: 0, latitude: 20, zoom: 2 });
  // 버블 표시 상태 — 순차 페이드 동작 제어
  const [bubbleState, setBubbleState] = useState<BubbleState>("country");
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

  // 페이드 아웃 완료 타이머 — fading-out-* 상태에서 300ms 후 다음 완료 상태로 전이
  // 별도 effect로 분리하여 상태 변경 시 cleanup이 타이머를 정확히 cancel하도록 보장 (timer pitfall 회피)
  useEffect(() => {
    if (bubbleState === "fading-out-country") {
      const t = setTimeout(() => setBubbleState("museum"), FADE_OUT_MS);
      return () => clearTimeout(t);
    }
    if (bubbleState === "fading-out-museum") {
      const t = setTimeout(() => setBubbleState("country"), FADE_OUT_MS);
      return () => clearTimeout(t);
    }
  }, [bubbleState]);

  // 지도 이동/줌 이벤트 — viewState 동기화 및 줌 임계값 교차 시 버블 상태 전이 트리거
  // 페이드 중 반대 방향 줌이 들어오면 즉시 원래 상태로 복귀하여 jitter 방지
  // setState-in-effect 안티패턴 회피를 위해 effect 대신 이벤트 핸들러에서 상태 전이 처리
  function handleMove(evt: ViewStateChangeEvent) {
    setViewState(evt.viewState);
    const z = evt.viewState.zoom;
    setBubbleState((prev) => {
      if (z >= ZOOM_MUSEUM_ENTER && prev === "country") return "fading-out-country";
      if (z < ZOOM_COUNTRY_ENTER && prev === "museum") return "fading-out-museum";
      // 페이드 중 줌 아웃 → 국가 화면으로 즉시 복귀
      if (z < ZOOM_COUNTRY_ENTER && prev === "fading-out-country") return "country";
      // 페이드 중 줌 인 → 미술관 화면으로 즉시 복귀
      if (z >= ZOOM_MUSEUM_ENTER && prev === "fading-out-museum") return "museum";
      return prev;
    });
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

  // 버블 표시 상태 기반 불투명도 — 완료 상태에서만 1, 그 외엔 0
  // 페이드 아웃은 CSS transition이 opacity 1→0을 부드럽게 보간하여 처리
  const countryOpacity = bubbleState === "country" ? 1 : 0;
  const museumOpacity = bubbleState === "museum" ? 1 : 0;

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
        {/* 국가 버블 — 항상 렌더링하여 페이드 아웃 동안 DOM에 유지 (클릭은 opacity=0일 때 pointer-events:none으로 차단) */}
        {countries.map((country) => (
          <CountryBubble
            key={country.country_code}
            data={country}
            maxCount={maxMuseumCount}
            zoom={viewState.zoom}
            opacity={countryOpacity}
            onClick={handleBubbleClick}
          />
        ))}

        {/* 미술관 버블 — 항상 렌더링하여 페이드 아웃 동안 DOM에 유지 */}
        {allMuseums.map((museum) => (
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
