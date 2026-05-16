# 지도 스타일 교체 — 조사 및 사전 점검 보고서

- 작성일: 2026-05-16
- 브랜치: `perf/map-minimal-style`
- 범위: 조사 및 사전 점검만. 코드 변경 없음.

---

## 1. Home 화면 진입점과 지도 컴포넌트

- Home 진입점: `src/app/page.tsx`
  - `next/dynamic`로 `HomeMap`을 SSR 비활성화(`ssr: false`)하여 로드한다.
  - 렌더하는 지도 컴포넌트: `HomeMap`
- 지도 컴포넌트 파일 경로: **`src/components/map/HomeMap.tsx`**
- `HomeMap`은 다시 공용 래퍼 컴포넌트
  **`src/components/map/MapView.tsx`**(`MapView`)를 사용한다. 실제 MapLibre 지도
  인스턴스는 `MapView`가 보유한다.

구조 요약:

```
src/app/page.tsx
  └── HomeMap (src/components/map/HomeMap.tsx)
        └── MapView (src/components/map/MapView.tsx)  ← MapLibre 지도 본체
              ├── CountryBubble  (국가 버블, 다수)
              └── MuseumBubble   (미술관 버블, 다수)
```

---

## 2. 지도 컴포넌트 내부 분석

조사 대상은 실제 MapLibre를 초기화하는 `src/components/map/MapView.tsx`와,
줌·버블 로직을 가진 `src/components/map/HomeMap.tsx` 두 파일이다.

### (a) MapLibre / react-map-gl/maplibre 초기화

- `src/components/map/MapView.tsx`에서 초기화한다.
  - import: `import { Map, NavigationControl } from "react-map-gl/maplibre";`
    (line 6) — AGENTS.md 규칙대로 `react-map-gl/maplibre` 경로 사용.
  - import: `import "maplibre-gl/dist/maplibre-gl.css";` (line 8)
  - `MapView`는 `forwardRef<MapRef, MapViewProps>`로 정의되어 `mapRef`를 외부에
    노출.
  - `<Map>` 컴포넌트에 전달하는 props (line 46~59):
    - `ref={ref}`
    - `initialViewState` — 기본값 `{ longitude: 0, latitude: 20, zoom: 2 }`
    - `mapStyle={MAP_STYLE}`
    - `style={{ width: "100%", height: "100%" }}`
    - `onMove={onMove}`
    - 인터랙션 props: `dragPan`, `scrollZoom`, `doubleClickZoom`,
      `touchZoomRotate`, `dragRotate`, `keyboard` — 모두 `isInteractive`(기본
      `true`) 값에 연동.
  - `shouldShowNavigationControl`(기본 `true`)이 `true`면
    `<NavigationControl position="top-right" />`를 렌더.
- `HomeMap`은 `MapView`에 `ref={mapRef}`와 `onMove={handleMove}`만 전달하고,
  나머지 props는 기본값을 사용한다. 즉 Home 지도의 `initialViewState`는
  `{ longitude: 0, latitude: 20, zoom: 2 }`.

### (b) 지도 스타일 지정 위치와 값

- 스타일 지정 위치: `src/components/map/MapView.tsx`
  - 상수 선언 (line 29):

    ```ts
    /** OpenFreeMap 타일 스타일 URL */
    const MAP_STYLE = "https://tiles.openfreemap.org/styles/liberty";
    ```

  - 적용 위치 (line 49): `<Map ... mapStyle={MAP_STYLE} ... >`

- `mapStyle`에 들어가는 값의 형태: **URL 문자열**이다. 스타일 객체(JSON
  StyleSpecification)가 아니라, OpenFreeMap이 호스팅하는 스타일 JSON을 가리키는
  문자열 한 줄이다.
- 정확한 값 전체: `"https://tiles.openfreemap.org/styles/liberty"`

### (c) OpenFreeMap 스타일/타일 URL의 정확한 문자열

- 코드에 직접 존재하는 문자열은 스타일 URL 하나뿐이다:
  - `https://tiles.openfreemap.org/styles/liberty`
- 타일(벡터 타일) URL은 코드에 직접 명시되어 있지 않다. 위 스타일 JSON 내부의
  `sources`가 타일 엔드포인트를 가리키며, 브라우저가 스타일 JSON을 받아온 뒤
  타일을 요청한다. (추측) 해당 스타일 JSON은 OpenFreeMap의 벡터 타일 소스 (대략
  `https://tiles.openfreemap.org/...`의 `.pbf` 타일)를 참조할 것으로 보이나,
  코드만으로는 확인 불가하다.
- "liberty"는 OpenStreetMap Liberty 계열 풀(full) 스타일로, 도로·건물·POI
  라벨·심볼을 모두 포함한다. 이번 성능 이슈(라벨까지 모두 렌더링되어 무거움)의
  직접 원인이다.

### (d) 줌 관련 상수

`MUSEUM_ZOOM_THRESHOLD`라는 이름의 상수는 존재하지 않는다. 줌 관련 상수는
`src/components/map/HomeMap.tsx` 상단에 다음 이름으로 정의되어 있다.

| 상수명               | 현재 값 | 위치           | 의미                                                              |
| -------------------- | ------- | -------------- | ----------------------------------------------------------------- |
| `ZOOM_MUSEUM_ENTER`  | `6`     | HomeMap.tsx:17 | 줌이 이 값 이상이면 미술관 버블 모드로 진입                       |
| `ZOOM_COUNTRY_ENTER` | `5`     | HomeMap.tsx:19 | 줌이 이 값 미만이면 국가 버블 모드로 진입                         |
| `FADE_OUT_MS`        | `300`   | HomeMap.tsx:21 | 버블 페이드 아웃 지속 시간(ms). CSS transition 길이와 일치해야 함 |

- `5 ≤ zoom < 6` 구간은 히스테리시스 구간으로, 현재 상태를 그대로 유지한다.
- 그 외 줌 관련 값:
  - `MapView`의 `initialViewState` 기본 줌: `2` (HomeMap이 별도 지정 없이 사용).
  - `HomeMap`의 `viewState` 초기 상태: `{ longitude: 0, latitude: 20, zoom: 2 }`
    (HomeMap.tsx:33).
  - `handleBubbleClick`의 `flyTo` 목표 줌: `5` (HomeMap.tsx:106).
  - `handleResetView`의 `flyTo` 목표 줌: `2` (HomeMap.tsx:117).
  - "전체 지도 보기" 버튼 표시 조건: `viewState.zoom >= 4` (HomeMap.tsx:184).
  - `MapLegend`의 문구 전환 임계값: `zoom >= 6`이 `isMuseumZoom`
    (`src/components/map/MapLegend.tsx:9`) — 이 `6`은 상수가 아닌 하드코딩
    값이며 `ZOOM_MUSEUM_ENTER`과 별개로 존재한다.

### (e) 버블/마커/심볼 레이어 구성과 줌 전환

핵심: ArtMap의 버블·마커는 **MapLibre 네이티브 레이어(Layer/Source)가 아니라
react-map-gl의 `<Marker>` (HTML DOM 마커)** 로 구현되어 있다. 코드 어디에도
`<Source>`, `<Layer>`, symbol layer 등 네이티브 지도 레이어는 없다. 따라서 "심볼
레이어"는 ArtMap 코드가 그리는 것이 아니라, OpenFreeMap "liberty" 스타일 JSON
자체에 들어 있는 라벨/심볼 레이어다 — 이번 성능 문제의 대상.

ArtMap이 그리는 두 종류의 HTML 마커:

- **국가 버블** — `src/components/map/CountryBubble.tsx`
  - `<Marker longitude latitude anchor="center">` 안에 원형 `<button>`.
  - 위치: `COUNTRY_COORDS` 매핑(ISO alpha-2, 10개국 좌표 하드코딩).
  - 크기: `museum_count` 기반 로그 스케일 반지름(`RADIUS_MIN` 18 ~ `RADIUS_MAX`
    48). 버튼에 국가의 미술관 수를 숫자로 표시.
  - 색상: `bg-blue-500/70` (hover `bg-blue-500/90`).
- **미술관 버블** — `src/components/map/MuseumBubble.tsx`
  - `<Marker longitude latitude anchor="center">` 안에 정사각형 `<button>` (고정
    크기 `BUBBLE_SIZE` 56px, `border-radius: 12px`).
  - 대표 작품 썸네일(`featured_artwork.image_url`)을 `next/image`로 표시, 없으면
    `name_ko` 앞 2글자 이니셜 폴백.

줌에 따른 전환 (`src/components/map/HomeMap.tsx`):

- 4상태 머신 `BubbleState`:
  `"country" | "fading-out-country" | "museum" | "fading-out-museum"`.
- `handleMove`(`onMove` 콜백)에서 줌 임계값 교차를 감지해 상태를 전이:
  - `zoom >= 6` & 현재 `country` → `fading-out-country`
  - `zoom < 5` & 현재 `museum` → `fading-out-museum`
  - 페이드 중 반대 방향 줌이 오면 즉시 원복(jitter 방지).
- `fading-out-*` 상태는 `FADE_OUT_MS`(300ms) 후 타이머로 다음 완료 상태로 전이.
- 전환은 DOM 추가/제거가 아니라 **opacity 크로스페이드**다. `CountryBubble`과
  `MuseumBubble`은 항상 렌더링되며(`countries.map`, `allMuseums.map`),
  `countryOpacity` / `museumOpacity`(완료 상태에서만 1, 그 외 0)를 `opacity`
  prop으로 받아 CSS transition으로 페이드. `opacity === 0`일 때는
  `pointerEvents: "none"`으로 클릭 차단.
- 참고: `src/components/map/MuseumMarker.tsx`(건물 아이콘 마커)는 별도로
  존재하지만 `HomeMap`을 비롯해 어디에서도 import되지 않아 현재 화면에는
  렌더되지 않는다.

---

## 3. 지도 데이터 로딩 경로

- 모든 호출은 `src/lib/api.ts`를 경유한다. `HomeMap`은 컴포넌트 내 직접 `fetch`
  없이 `getMapCountries()`와 `getMuseums({ per_page: 100 })`를 import해 사용
  (HomeMap.tsx:12, 51).
- 마운트 시 `useEffect`에서 `Promise.allSettled([...])`로 두 API를 병렬 호출하고
  부분 실패를 허용(둘 다 실패할 때만 에러 화면).
- `NEXT_PUBLIC_USE_MOCK` 분기: `src/lib/api.ts:27`의
  `const USE_MOCK = process.env.NEXT_PUBLIC_USE_MOCK === "true";`
  - `getMapCountries()` (api.ts:102~107): `USE_MOCK`이면 `mockCountryMapData`
    (`@/mocks/map`) 반환, 아니면 `fetchApi<CountryMapData[]>("/map/countries")`.
  - `getMuseums()` (api.ts:122~)도 동일하게 `USE_MOCK` 분기 후 실제 API 호출.
- `/map/countries` 호출 경로: `fetchApi`가 `API_BASE`(`"/api/v1"`)에 endpoint를
  붙여 최종 경로는 **`/api/v1/map/countries`**. 서버 사이드에서는
  `getServerBaseUrl()`로 절대 URL을 구성하지만, `HomeMap`은 클라이언트
  컴포넌트(`"use client"` + dynamic `ssr:false`)이므로 브라우저에서 상대 경로로
  호출된다.
- 이번 스타일 교체 작업과 데이터 로딩 경로는 무관하다(스타일은 타일 서버에서
  직접 받음). 변경 불필요.

---

## 4. 다크 모드와 지도의 관계

- 다크 모드는 `src/app/globals.css`의 `@media (prefers-color-scheme: dark)`로만
  구현되어 있다 — OS 설정을 따르는 자동 전환이며, 앱 내 테마 토글 UI나
  `next-themes` 같은 라이브러리는 없다(`ThemeProvider`/`useTheme` 미사용).
- **지도 스타일/지도 컨테이너에 다크 모드 연동 처리는 없음.**
  - `MapView.tsx`의 `MAP_STYLE`은 고정 URL 한 개로, 라이트/다크와 무관하게 항상
    동일한 "liberty" 스타일을 사용한다.
  - 지도 컨테이너 `<div>`와 `<Map>`의 `style`은 `width/height: 100%`만 지정하며
    `dark:` 변형 클래스나 테마 분기가 없다.
  - 다크 모드에서 지도 위에 겹치는 UI(범례·라벨·버튼 등)는 `dark:` 클래스로
    대응하지만(예: `MapLegend`의 `dark:bg-black/60`, `CountryBubble` 호버 라벨의
    `dark:bg-black/70`), **지도 타일 자체는 다크 모드에서도 라이트 배경 그대로**
    렌더된다.
- 결론: 다크 모드 전환 시 지도에 적용되는 처리는 **없음**. 미니멀 스타일 교체
  시, 다크용 별도 스타일까지 둘지(예: 라이트=positron, 다크=positron 다크 계열)
  여부는 이번 조사 범위 밖의 결정 사항으로 남는다.

---

## 5. 미니멀 스타일 교체 지점

교체는 **단 한 곳**에서 가능하다.

- **파일**: `src/components/map/MapView.tsx`
- **식별자**: 상수 `MAP_STYLE` (line 29)
- **현재 값**: `"https://tiles.openfreemap.org/styles/liberty"`
- **적용 지점**: 같은 파일 line 49의 `<Map ... mapStyle={MAP_STYLE} ... >`

`MAP_STYLE` 한 줄만 바꾸면 적용된다. 교체 방식은 두 가지다.

1. **다른 OpenFreeMap 스타일 URL로 교체** (가장 단순)
   - OpenFreeMap은 `liberty` 외에 `bright`, `positron` 스타일을 제공한다. (추측)
     미니멀 목적에는 라벨·POI가 적은 `positron`
     (`https://tiles.openfreemap.org/styles/positron`)이 적합할 것으로 보인다.
     정확한 라벨 포함 범위와 URL 유효성은 OpenFreeMap 문서 확인이
     필요하다(추측).
2. **커스텀 스타일 객체(JSON StyleSpecification) 전달**
   - `mapStyle`은 URL 문자열뿐 아니라 스타일 객체도 받는다. OpenFreeMap 타일
     소스만 유지하고 `layers` 배열에서 도로/건물/POI/심볼(label) 레이어를
     제거·필터링한 커스텀 스타일을 만들어 `MAP_STYLE` 자리에 객체로 넘기면 라벨
     렌더링 비용을 가장 확실히 줄일 수 있다. 다만 별도 스타일 정의 파일/객체가
     필요하다(이번 작업 범위 밖, 다음 단계 결정 사항).

### 교체 시 영향 범위 (중요)

`MapView`는 공용 래퍼이며 `MAP_STYLE`을 4개 화면이 공유한다. `MAP_STYLE`을
바꾸면 Home뿐 아니라 아래 모든 지도가 함께 바뀐다.

- `src/components/map/HomeMap.tsx` (Home, 본 작업 대상)
- `src/components/artwork/ArtworkLocationMap.tsx`
- `src/components/museum/MuseumLocationMap.tsx`
- `src/components/artist/ArtistCountryMap.tsx`

Home에만 미니멀 스타일을 적용하려면 `MAP_STYLE` 단순 치환으로는 불가능하며,
`MapView`에 스타일을 선택할 수 있는 prop(예: `mapStyle?`)을 추가하고 `HomeMap`만
미니멀 스타일을 넘기는 방식이 필요하다. 전 화면 동시 적용이 의도라면 `MAP_STYLE`
한 줄 치환으로 충분하다. (어느 쪽으로 갈지는 다음 단계 지시 사항으로 남긴다.)

### 교체 시 함께 점검할 부수 항목

- `MapLegend`(`src/components/map/MapLegend.tsx`)와 호버 라벨 등은 반투명
  배경(`bg-white/60`, `dark:bg-black/60` 등)을 쓰므로, 더 밝거나 단색인 미니멀
  타일 위에서 대비가 충분한지 확인 필요(추측).
- 줌 임계값 상수(`ZOOM_MUSEUM_ENTER`, `ZOOM_COUNTRY_ENTER`)와 버블 좌표는 스타일
  교체와 무관 — 변경 불필요.
