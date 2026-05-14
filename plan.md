# 홈 지도 2단계 버블 시스템 재설계 — 구현 계획

> 브랜치: `feat/home-map-bubbles` 작성일: 2026-05-14

---

## 1. 작업 목표

홈 페이지 지도(`HomeMap`)의 버블 시스템을 줌 레벨 기반 2단계로 재설계한다. 줌
아웃 상태(z < 5)에서는 국가별 미술관 수를 나타내는 원형 버블을, 줌 인 상태(z
≥ 6)에서는 미술관별 대표 작품 썸네일을 보여주는 사각형 버블을 표시하며, 두 단계
사이(5 ≤ z < 6)는 크로스페이드로 부드럽게 전환한다. 신규 `MapLegend` 컴포넌트를
지도 하단 중앙에 고정하여 현재 줌 레벨에 맞는 안내 문구를 제공한다.

---

## 2. 확정된 결정사항 요약

| 항목                    | 결정                                                                                  |
| ----------------------- | ------------------------------------------------------------------------------------- |
| 줌 임계값               | z < 5: 국가 버블 / 5 ≤ z < 6: 크로스페이드 / z ≥ 6: 미술관 버블                       |
| 버블 크기 스케일        | Log + min/max clamp, 반지름 18~48px (CSS width/height: 36~96px)                       |
| 크기 보간               | 줌 변화 시 실시간 보간 (5≤z<6 구간에서도 크기 유지)                                   |
| 국가 버블 라벨          | `museum_count` 숫자만 표시                                                            |
| 미술관 버블 라벨        | `featured_artwork.image_url` 썸네일 이미지                                            |
| 미술관 버블 형태        | 정사각형 + border-radius 12px                                                         |
| Hover 효과              | box-shadow soft glow                                                                  |
| 전환 애니메이션         | opacity + scale                                                                       |
| 미술관 버블 클릭        | `/museums/[id]` 이동                                                                  |
| MapLegend 위치          | bottom-center, bottom: 20px                                                           |
| MapLegend 스타일        | pill + backdrop-filter blur(12px) + 반투명, 다크 모드 대응                            |
| 데이터 페치 전략        | `getMuseums({ per_page: 100 })` 마운트 시 일괄 페치, bbox 없음                        |
| 캐싱 정책               | `useState + useEffect` 유지 (TanStack Query 도입은 별도 TODO)                         |
| 호버 라벨 (국가 버블)   | hover 시 `country.country_name_ko ?? country.country_code`를 버블 위 pill 라벨로 표시 |
| 호버 라벨 (미술관 버블) | hover 시 `museum.name_ko`를 버블 위 pill 라벨로 표시                                  |

---

## 3. 데이터 계약

### 3-1. `CountryMapData` 변경 (`src/types/map.ts`)

```typescript
// 변경 전
type CountryMapData = {
  country_code: string;
  country_name_ko: string;
  country_name_en: string;
  artwork_count: number;
  latitude: number;
  longitude: number;
};

// 변경 후 — museum_count 추가
type CountryMapData = {
  country_code: string;
  country_name_ko?: string;
  country_name_en?: string;
  artwork_count: number;
  museum_count: number; // minimum: 1 (서버 HAVING 조건으로 0인 국가는 응답에 미포함) — PENDING_BE: GET /api/v1/map/countries
  latitude: number;
  longitude: number;
};
```

**변경 근거**: 버블 라벨 및 크기 계산 기준을 artwork_count → museum_count로
변경. 백엔드와 합의 완료, 필드 추가 대기 중.

---

### 3-2. `MuseumSummary` 변경 (`src/types/museum.ts`)

```typescript
// 신규 보조 타입 — museum.ts 내부에 정의
type FeaturedArtwork = {
  artwork_id: string;
  artwork_title: string;
  image_url: string;
};

// MuseumSummary 변경: image_url, featured_artwork 필드 추가
type MuseumSummary = {
  id: string;
  name_ko: string;
  name_en: string;
  institution_type: InstitutionType;
  country_code: string;
  city: string;
  latitude: number;
  longitude: number;
  artwork_count: number;
  image_url: string | null; // PENDING_BE: GET /api/v1/museums
  featured_artwork: FeaturedArtwork | null; // PENDING_BE: GET /api/v1/museums
};
```

**변경 근거**: `MuseumBubble`이 썸네일 이미지를 표시하기 위해 필요. 기존 코드
(`MuseumListCard`, `MuseumsPaginationWrapper` 등)는 신규 필드에 접근하지
않으므로 타입 확장은 하위 호환 안전.

---

## 4. 파일별 변경 명세

### 4-1. `src/types/map.ts` — 수정

**책임**: `CountryMapData`에 `museum_count` 필드 추가.

변경 사항:

- `CountryMapData` 타입에 `museum_count: number` 추가
- `// PENDING_BE: museum_count — GET /api/v1/map/countries` 주석 첨부

---

### 4-2. `src/types/museum.ts` — 수정

**책임**: `FeaturedArtwork` 신규 타입 정의 및 `MuseumSummary`에 썸네일 필드
추가.

변경 사항:

- 파일 상단에 `FeaturedArtwork` 타입 추가 (내보내기)
- `MuseumSummary`에 `image_url: string | null`,
  `featured_artwork: FeaturedArtwork | null` 추가
- 각 필드에 `// PENDING_BE` 주석 첨부

---

### 4-3. `src/mocks/map.ts` — 수정

**책임**: `mockCountryMapData`의 각 항목에 `museum_count` 값 추가.

변경 사항:

- 5개 국가 항목만 포함 (Mock에 미술관이 1개 이상 존재하는 국가만)
  - FR: 2, NL: 1, US: 1, IT: 1, KR: 1
  - GB/ES/DE/RU/AT 5개 국가는 Mock 응답에서 제거.
  - Mock 국가는 미술관이 1개 이상인 5개(FR, NL, US, IT, KR)로만 구성한다. 실
    API의 `museum_count > 0` 서버 필터(HAVING 조건)와 동일한 응답 형태를
    재현하기 위함. 0개 국가를 Mock에 포함하면 Mock 모드와 실 API 모드의 화면
    결과가 달라지므로 사용 환경 전환 시 디버깅 혼선이 발생한다.
- 파일 상단에 `// PENDING_BE: museum_count 필드 — 실 API 반영 시 이 주석 제거`
  추가

---

### 4-4. `src/mocks/museums.ts` — 수정

**책임**: `mockMuseums` 각 항목에 `image_url`, `featured_artwork` 필드 추가.

변경 사항:

- 6개 미술관 항목 모두 `image_url: null` (미술관 외관 이미지 미확보)
- `featured_artwork` 항목별 샘플 데이터 추가:
  - museum-001(오르세): 모네 〈수련〉계열 Met 이미지 활용
  - museum-002(반 고흐): 〈별이 빛나는 밤〉 이미지
  - museum-003(메트): 베르메르 〈물 항아리를 든 여인〉 이미지
    (images.metmuseum.org 활용)
  - museum-004(루브르): 다 빈치 〈모나리자〉 — 퍼블릭 도메인 wikimedia 이미지
  - museum-005(국립현대미술관): 한국 현대미술 대표작 wikimedia 이미지
  - museum-006(우피치): 보티첼리 〈비너스의 탄생〉 wikimedia 이미지
- `image_url` 필드에 `// PENDING_BE: image_url — GET /api/v1/museums` 주석
- `featured_artwork` 필드에
  `// PENDING_BE: featured_artwork — GET /api/v1/museums` 주석
- `import type`에 `FeaturedArtwork` 추가

---

### 4-5. `src/components/map/CountryBubble.tsx` — 수정

**책임**: 국가별 미술관 수 기반 원형 버블 — 로그 스케일, 줌 보간 크기,
크로스페이드 opacity 지원.

주요 변경:

- `interface CountryBubbleProps` → `type CountryBubbleProps` (styleguide 준수)
- Props 추가:
  ```typescript
  type CountryBubbleProps = {
    data: CountryMapData;
    maxCount: number; // museum_count 기준 최대값
    zoom: number; // 줌 레벨 — 실시간 크기 보간 및 크로스페이드용
    opacity?: number; // 크로스페이드 제어 (기본값 1)
    onClick?: (data: CountryMapData) => void;
  };
  ```
- 버블 크기 계산 함수 교체:

  ```typescript
  // 기존: 선형 스케일, min 30px / max 80px
  // 신규: 로그 스케일, 반지름 18~48px
  const RADIUS_MIN = 18;
  const RADIUS_MAX = 48;

  function calcBubbleRadius(count: number, maxCount: number): number {
    if (maxCount <= 0 || count <= 0) return RADIUS_MIN;
    const ratio = Math.log(count + 1) / Math.log(maxCount + 1);
    return RADIUS_MIN + ratio * (RADIUS_MAX - RADIUS_MIN);
  }
  // width = height = radius * 2 (36~96px)
  ```

- 라벨 변경: `data.artwork_count` → `data.museum_count` +
  `// PENDING_BE: museum_count`
- 크기 변경: `size` → `radius * 2`, fontSize = `radius * 0.35`
- Hover glow 추가:
  `style={{ boxShadow: "0 0 12px 4px rgba(59,130,246,0.5)" }}`는 hover state로만
  적용 (인라인 style과 className 조합)
- opacity prop을 버튼 래퍼 `<button style={{ opacity }}>` 에 적용
- transition 클래스 추가: `transition-[opacity,transform] duration-200`

호버 라벨 (BubbleLabel — 인라인):

- 표시 조건: 마우스 mouseenter ~ mouseleave 동안만 (데스크톱 호버 전용. 모바일
  대응은 §8-6 후속 PR)
- 내용: `country.country_name_ko ?? country.country_code` (폴백) · 예: "프랑스"
  또는 (한글명이 없으면) "FR"
- 위치: 버블 위쪽 10px (`transform: translateY(-bubble_radius - 10px)`)
- Flip 규칙: 라벨 상단이 지도 컨테이너 상단보다 위로 나가면 아래쪽으로 표시
- 스타일: · pill 형태 (`border-radius: 999px`) · `backdrop-filter: blur(12px)` ·
  배경: 라이트모드 white/85%, 다크모드 black/70% · 폰트 12px, padding 4px 8px ·
  `pointer-events: none` (마우스 이벤트를 잡지 않음 — 클릭 영역 보호) · z-index:
  인접 버블보다 위
- 애니메이션: · 나타남: opacity 0 → 1, 100ms fade-in · 사라짐: 즉시 (delay 없음)
- 폴백 처리: `country_name_ko`가 undefined면 `country_code` 표시 (대문자 2자,
  예: "FR")

---

### 4-6. `src/components/map/MuseumBubble.tsx` — 신규

**책임**: 미술관별 대표 작품 썸네일을 정사각형 버블로 표시하며 클릭 시 상세
페이지로 이동.

```typescript
// 미술관 버블 컴포넌트 — 대표 작품 썸네일을 정사각형(border-radius 12px) 버블로 표시
// 줌 레벨 6 이상에서 HomeMap이 렌더링. 클릭 시 /museums/[id] 이동.

"use client";

import Image from "next/image";
import { Marker } from "react-map-gl/maplibre";
import type { MuseumSummary } from "@/types/museum";

type MuseumBubbleProps = {
  museum: MuseumSummary;
  opacity?: number; // 크로스페이드 제어 (기본값 1)
  onClick: (museum: MuseumSummary) => void;
};

export function MuseumBubble({
  museum,
  opacity = 1,
  onClick,
}: MuseumBubbleProps);
```

렌더링 구조:

- `Marker` longitude/latitude = museum.longitude/latitude, anchor="center"
- 내부 `<button>` — 크기 고정 56×56px, border-radius: 12px
- `featured_artwork` 존재 시: `<Image>` next/image, objectFit="cover" —
  `// PENDING_BE: featured_artwork.image_url`
- `featured_artwork === null` 폴백: `bg-muted` 배경 위 미술관명 이니셜 2글자
  표시 (`text-muted-foreground`)
- Hover glow: `hover:shadow-[0_0_12px_4px_rgba(99,102,241,0.5)]` (indigo 계열)
- transition: `transition-[opacity,transform,box-shadow] duration-200`
- opacity는 `style={{ opacity }}` 적용

호버 라벨 (BubbleLabel — 인라인):

- 표시 조건: 마우스 mouseenter ~ mouseleave 동안만 (데스크톱 호버 전용. 모바일
  대응은 §8-6 후속 PR)
- 내용: `museum.name_ko`
- 위치: 버블 위쪽 10px
- Flip 규칙: 라벨 상단이 지도 컨테이너 상단보다 위로 나가면 아래쪽으로 표시
- 스타일: §4-5 CountryBubble 호버 라벨과 동일 (pill `border-radius: 999px`,
  `backdrop-filter: blur(12px)`, 라이트모드 white/85% · 다크모드 black/70%, 폰트
  12px, padding 4px 8px, `pointer-events: none`, z-index 인접 버블보다 위)
- 애니메이션: §4-5와 동일 (100ms fade-in, 즉시 fade-out)
- 긴 이름 처리: 16자 초과 시 ellipsis (예: "솔로몬 R. 구겐하임 미...")
- 컴포넌트 분리 안 함: `MuseumBubble` 안에 인라인 구현. 패턴이 추가로 발생하면
  그때 `BubbleLabel` 컴포넌트로 추출 검토.

---

### 4-7. `src/components/map/MapLegend.tsx` — 신규

**책임**: 줌 레벨에 따라 달라지는 버블 안내 문구를 지도 하단 중앙에 고정 표시.

```typescript
// 지도 범례 컴포넌트 — 현재 줌 레벨에 맞는 버블 설명 문구를 하단 중앙에 표시
// pill 형태, backdrop-blur, 다크 모드 대응

type MapLegendProps = {
  zoom: number;
};

export function MapLegend({ zoom }: MapLegendProps);
```

렌더링 구조:

- 위치: `absolute bottom-5 left-1/2 -translate-x-1/2 z-10 pointer-events-none`
- 스타일: `rounded-full px-4 py-1.5 text-[13px] leading-snug max-sm:text-[12px]`
  - `bg-white/60 dark:bg-black/60 backdrop-blur-[12px]`
  - `text-foreground border border-border shadow-sm`
- `zoom < 6`:
  `"각 버블의 숫자는 해당 국가에 ArtMap이 수록한 미술관의 개수입니다."`
- `zoom >= 6`: `"각 버블의 이미지는 해당 미술관의 대표 작품입니다."`
- 텍스트 전환: `transition-opacity duration-300` (줌 임계값 교차 시 페이드)

---

### 4-8. `src/components/map/HomeMap.tsx` — 수정

**책임**: 2단계 버블 시스템 통합 — 줌 임계값 변경, 크로스페이드, MuseumBubble
전환, MapLegend 추가.

주요 변경:

1. **임포트 변경**
   - `MuseumMarker` 제거 → `MuseumBubble` 추가
   - `MapLegend` 추가

2. **줌 임계값 상수 변경**

   ```typescript
   // 기존: const MUSEUM_ZOOM_THRESHOLD = 4.5;
   // 신규:
   const ZOOM_CROSSFADE_START = 5; // 국가 버블 페이드 아웃 시작
   const ZOOM_CROSSFADE_END = 6; // 미술관 버블 페이드 인 완료
   ```

3. **크로스페이드 opacity 계산 함수 추가**

   ```typescript
   // 국가 버블 불투명도 — z<5: 1, 5≤z<6: 선형 감소, z≥6: 0
   function calcCountryOpacity(zoom: number): number {
     if (zoom < ZOOM_CROSSFADE_START) return 1;
     if (zoom >= ZOOM_CROSSFADE_END) return 0;
     return (
       1 -
       (zoom - ZOOM_CROSSFADE_START) /
         (ZOOM_CROSSFADE_END - ZOOM_CROSSFADE_START)
     );
   }

   // 미술관 버블 불투명도 — z<5: 0, 5≤z<6: 선형 증가, z≥6: 1
   function calcMuseumOpacity(zoom: number): number {
     if (zoom < ZOOM_CROSSFADE_START) return 0;
     if (zoom >= ZOOM_CROSSFADE_END) return 1;
     return (
       (zoom - ZOOM_CROSSFADE_START) /
       (ZOOM_CROSSFADE_END - ZOOM_CROSSFADE_START)
     );
   }
   ```

4. **maxCount 계산 변경**

   ```typescript
   // 기존: Math.max(...countries.map(c => c.artwork_count), 1)
   // 신규:
   const maxMuseumCount = Math.max(
     ...countries.map((c) => c.museum_count ?? 0), // PENDING_BE: museum_count
     1,
   );
   ```

   - `?? 0` 방어 처리: 실 API 응답에 아직 필드가 없을 때 런타임 에러 방지

5. **getMuseums 호출 파라미터 추가**

   ```typescript
   // 기존: getMuseums()
   // 신규:
   getMuseums({ per_page: 100 });
   // 이유: 기존 호출은 첫 페이지(per_page 기본값 20, spec 일치)만 반환.
   //       홈 지도는 전 세계 미술관 전체를 렌더링해야 하므로 spec 최대값(per_page: 100)으로 일괄 요청.
   //       미술관 수가 100을 초과하면 페이지네이션 루프 또는 전용 엔드포인트 신설 필요.
   ```

6. **렌더링 로직 변경**

   ```tsx
   // 기존: isZoomedIn boolean 분기
   // 신규: opacity 분기 (크로스페이드 구간에서 두 레이어 동시 렌더링)

   const countryOpacity = calcCountryOpacity(viewState.zoom);
   const museumOpacity = calcMuseumOpacity(viewState.zoom);

   // 국가 버블: opacity > 0 일 때만 렌더링
   {
     countryOpacity > 0 &&
       countries.map((country) => (
         <CountryBubble
           key={country.country_code}
           data={country}
           maxCount={maxMuseumCount}
           zoom={viewState.zoom}
           opacity={countryOpacity}
           onClick={handleBubbleClick}
         />
       ));
   }

   // 미술관 버블: opacity > 0 일 때만 렌더링
   {
     museumOpacity > 0 &&
       allMuseums.map((museum) => (
         <MuseumBubble
           key={museum.id}
           museum={museum}
           opacity={museumOpacity}
           onClick={handleMuseumClick}
         />
       ));
   }
   ```

7. **MapLegend 추가**

   ```tsx
   // MapView 바깥, 지도 래퍼 <div> 내부에 추가
   <MapLegend zoom={viewState.zoom} />
   ```

8. **기존 `selectedCountryCode` 라벨 유지**
   - 우측 하단 파란 배지는 변경 없이 유지 (MapLegend 위치와 겹치지 않음)
   - `handleBubbleClick` flyTo zoom=5 유지 (크로스페이드 진입)

---

## 5. 단계별 작업 순서

### Step 1 — 타입 확장

대상: `src/types/map.ts`, `src/types/museum.ts`

- `CountryMapData`에 `museum_count: number` 추가 + PENDING_BE 주석
- `FeaturedArtwork` 타입 신규 정의 + export
- `MuseumSummary`에 `image_url`, `featured_artwork` 추가 + PENDING_BE 주석

---

### Step 2 — Mock 데이터 보강

대상: `src/mocks/map.ts`, `src/mocks/museums.ts`

- 10개 국가 항목 `museum_count` 추가
- 6개 미술관 항목 `image_url: null`, `featured_artwork` 추가 (퍼블릭 도메인 또는
  메트 API 이미지 URL 사용)

---

### Step 3 — CountryBubble 개선

대상: `src/components/map/CountryBubble.tsx`

- `interface` → `type` 변환
- Props에 `zoom: number`, `opacity?: number` 추가
- 크기 계산 로그 스케일로 교체
- 라벨 `artwork_count` → `museum_count`
- Hover glow, opacity 적용

---

### Step 4 — MuseumBubble 신규 작성

대상: `src/components/map/MuseumBubble.tsx` (신규)

- 썸네일 이미지 + 폴백 UI 구현
- opacity, hover glow, transition 처리

---

### Step 5 — MapLegend 신규 작성

대상: `src/components/map/MapLegend.tsx` (신규)

- pill 스타일, backdrop-blur, 줌 기반 텍스트 전환

---

### Step 6 — HomeMap 통합

대상: `src/components/map/HomeMap.tsx`

- 상수 변경, 크로스페이드 함수 추가
- `getMuseums({ per_page: 100 })` 수정
- `MuseumBubble` + `MapLegend` 통합
- `maxMuseumCount` 계산 교체

---

## 6. 단계별 검증 기준

| Step   | 검증 방법                                             | 합격 기준                                                                                                                                                                                                                                                                                                                      |
| ------ | ----------------------------------------------------- | ------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------ |
| Step 1 | TypeScript 컴파일 (`pnpm build` 또는 에디터 타입체크) | `museum_count`, `image_url`, `featured_artwork` 누락 시 타입 에러 발생해야 함 → Mock 업데이트 전 의도적 에러 확인                                                                                                                                                                                                              |
| Step 2 | TypeScript 컴파일 재실행                              | 타입 에러 0건, Mock 데이터 구조가 타입과 일치                                                                                                                                                                                                                                                                                  |
| Step 3 | 개발 서버 실행 (`pnpm dev`), 홈 화면 확인             | 줌 아웃 상태에서 국가 버블이 museum_count 숫자로 표시됨, 로그 스케일 크기 차이 육안 확인, 호버 시 glow 효과 확인                                                                                                                                                                                                               |
| Step 4 | 개발 서버, 줌 인(z≥6) 상태 확인                       | 미술관 위치에 썸네일 버블 표시, featured_artwork null인 경우 이니셜 폴백 표시, 호버 glow 확인                                                                                                                                                                                                                                  |
| Step 5 | 개발 서버, 줌 변경 시 하단 텍스트 확인                | z<6 국가 안내 문구, z≥6 미술관 안내 문구, 다크 모드에서 가독성 확인                                                                                                                                                                                                                                                            |
| Step 6 | 개발 서버 전체 통합 테스트                            | (1) z=2 상태: 국가 버블만 표시, (2) z=5~6 크로스페이드: 두 버블 동시 보임 + 부드러운 전환, (3) z=6+: 미술관 버블만 표시, (4) 국가 버블 클릭 → flyTo zoom=5 진입 → 크로스페이드 진행 → z=6+ 후 미술관 버블 완전 표시, (5) 미술관 버블 클릭 → `/museums/[id]` 이동, (6) "전체 지도 보기" 버튼 클릭 → z=2 복귀 + 국가 버블 재표시 |

---

## 7. PENDING_BE 항목 목록

| 파일                                   | 위치                                                        | 필드                            | 관련 API                    |
| -------------------------------------- | ----------------------------------------------------------- | ------------------------------- | --------------------------- |
| `src/types/map.ts`                     | `CountryMapData` 타입 내 `museum_count` 필드 선언부         | `museum_count`                  | `GET /api/v1/map/countries` |
| `src/types/museum.ts`                  | `MuseumSummary` 타입 내 `image_url` 필드 선언부             | `image_url`                     | `GET /api/v1/museums`       |
| `src/types/museum.ts`                  | `MuseumSummary` 타입 내 `featured_artwork` 필드 선언부      | `featured_artwork`              | `GET /api/v1/museums`       |
| `src/mocks/map.ts`                     | 파일 상단 주석 + 각 항목 `museum_count` 값                  | `museum_count`                  | `GET /api/v1/map/countries` |
| `src/mocks/museums.ts`                 | 파일 상단 주석 + 각 항목 `image_url`, `featured_artwork` 값 | `image_url`, `featured_artwork` | `GET /api/v1/museums`       |
| `src/components/map/CountryBubble.tsx` | `data.museum_count` 사용 지점                               | `museum_count`                  | `GET /api/v1/map/countries` |
| `src/components/map/MuseumBubble.tsx`  | `museum.featured_artwork?.image_url` 사용 지점              | `featured_artwork.image_url`    | `GET /api/v1/museums`       |
| `src/components/map/HomeMap.tsx`       | `c.museum_count ?? 0` 사용 지점                             | `museum_count`                  | `GET /api/v1/map/countries` |

> **추적 방법**: 백엔드 필드 구현 완료 후 `grep -r "PENDING_BE" src/` 로 일괄
> 확인. Mock 분기 제거(NEXT_PUBLIC_USE_MOCK=false)와 동시에 각 주석 및 Mock 보완
> 데이터도 정리.

---

## 8. 회귀 위험 분석

### 8-1. CountryBubble 변경에 따른 영향

| 항목                                               | 위험도 | 대응                                                                                 |
| -------------------------------------------------- | ------ | ------------------------------------------------------------------------------------ |
| Props에 `zoom`, `opacity` 추가                     | 낮음   | `opacity`는 기본값 `1`이므로 기존 호출처에서 생략해도 동작. `zoom`은 필수 추가 필요. |
| `interface` → `type` 변환                          | 없음   | TypeScript 동작 동일                                                                 |
| `artwork_count` → `museum_count` 라벨 변경         | 낮음   | CountryBubble 사용처는 `HomeMap.tsx` 단독. 변경 범위 한정.                           |
| 버블 크기 범위 변경 (30~80px → 36~96px)            | 낮음   | 홈 화면 UI만 영향. 시각적 크기 조정은 의도된 변경.                                   |
| `BUBBLE_MIN/MAX` 상수 → `RADIUS_MIN/MAX` 이름 변경 | 없음   | 파일 내부 상수, 외부 임포트 없음.                                                    |

**CountryBubble을 사용하는 파일**: `HomeMap.tsx` 단독. 외부 임포트 없음.

---

### 8-2. MuseumSummary 타입 확장에 따른 영향

`image_url: string | null` 및 `featured_artwork: FeaturedArtwork | null` 추가는
**기존 코드에 영향을 미치지 않는 additive 변경**이다. 단, Mock 데이터에 해당
필드를 추가하지 않으면 TypeScript 컴파일 에러가 발생한다.

영향 받는 파일 (타입 변경으로 인한 컴파일 에러 가능성):

| 파일                                                 | 현재 사용 필드                                                | 영향                          |
| ---------------------------------------------------- | ------------------------------------------------------------- | ----------------------------- |
| `src/components/museum/MuseumListCard.tsx`           | `name_ko`, `name_en`, `country_code`, `city`, `artwork_count` | 없음 (신규 필드 미접근)       |
| `src/components/museum/MuseumsPaginationWrapper.tsx` | `MuseumSummary[]` 전달                                        | 없음                          |
| `src/components/map/MuseumMarker.tsx`                | `museum.name_ko`, `museum.latitude`, `museum.longitude`       | 없음                          |
| `src/app/museums/page.tsx`                           | `MuseumSummary[]` 반복 렌더링                                 | 없음                          |
| `src/mocks/museums.ts`                               | `mockMuseums: MuseumSummary[]`                                | **Step 2에서 필드 추가 필수** |

---

### 8-3. MuseumMarker 컴포넌트

`MuseumMarker`는 HomeMap에서 `MuseumBubble`로 교체되지만 **파일 자체는 삭제하지
않는다**. 다른 페이지(예: 미술관 상세 지도)에서 사용 중인 `MuseumLocationMap`
등이 있을 수 있으며, 현재 HomeMap 이외의 사용처를 확인해 삭제 여부를 별도
결정해야 한다.

---

### 8-4. getMuseums 호출 파라미터 변경

`getMuseums()` → `getMuseums({ per_page: 100 })` 변경은 `src/lib/api.ts`의
`getMuseums` 함수 시그니처 내 `params?: object` 형태를 확인 후 진행한다. 현재
`api.ts`에서 `per_page` 파라미터가 지원되는지 확인 필요 (Mock 모드에서는
파라미터 무시 가능성 있음 — Mock 확인 후 필요시 Mock 함수도 보강).

---

### 8-5. 크로스페이드 구간 마커 수 증가

5 ≤ z < 6 구간에서 국가 버블(최대 10개)과 미술관 버블(현재 Mock 6개)이 동시
렌더링된다. 실 데이터 기준 미술관 수가 늘어날 경우 성능에 영향을 줄 수 있다.
현재 단계에서는 클라이언트 viewport 필터가 없으므로, 미술관 수가 100개 이상으로
증가할 경우 viewport 기반 가시성 필터 또는 별도 bbox 엔드포인트 신설을 검토할
것.

---

### 8-6. 호버 라벨의 모바일 대응 (후속 PR)

- 모바일에는 hover가 없으므로 별도 인터랙션 필요.
- 표준 패턴: 첫 탭 → 라벨 표시, 두 번째 탭 → `/museums/[id]` 이동 (Google Maps
  패턴).
- 구현 요소: 탭 횟수 추적 상태, 외부 클릭 시 라벨 닫기, 라벨 사라지는 timeout.
- 본 PR 범위 외. 데스크톱 호버 안정화 후 별도 PR로 진행.
