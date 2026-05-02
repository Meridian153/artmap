# ArtMap — 현재 상태 PRD (Product Requirements Document)

> **작성 시점**: 2026-04-24 **기준 브랜치**: `feat/search` (PR #19 머지 직후)
> **목적**: 의도(아젠다)가 아닌 **현재 코드베이스에 실제로 존재하는** 제품
> 요구사항을 객관적으로 기술

---

## 1. 제품 개요 (현재 상태)

| 항목        | 값                                                                |
| ----------- | ----------------------------------------------------------------- |
| 서비스명    | ArtMap                                                            |
| 한 줄 설명  | 전 세계 미술 작품의 소장 위치를 지도 기반으로 탐색하는 웹 서비스  |
| 단계        | MVP (P0) — 일부 기능 구현, 일부 placeholder                       |
| 데이터 모드 | `NEXT_PUBLIC_USE_MOCK=true` 시 Mock, 미설정 시 실제 Neon Postgres |
| 사용자 인증 | **없음** (전부 비로그인 공개 페이지)                              |
| 결제·과금   | **없음**                                                          |
| 다국어 UI   | 미구현 (UI 텍스트는 한국어 고정) — 데이터 필드만 `_ko`/`_en` 분리 |

**핵심 사용자 의도**: 특정 작품(또는 화가)이 _지금_ 어느 미술관에 있는지를 지도
위에서 확인.

---

## 2. 페이지·기능 구현 매트릭스

OpenAPI Spec v1.3.0 기준 11개 엔드포인트는 **모두 구현**되어 있고, 프론트엔드
페이지는 **4개 본구현 + 5개 placeholder** 상태.

### 2-1. 백엔드 API Routes (11/11 구현)

| 엔드포인트                          | 파일                                            | 비고                                                                  |
| ----------------------------------- | ----------------------------------------------- | --------------------------------------------------------------------- |
| `GET /api/v1/map/countries`         | `src/app/api/v1/map/countries/route.ts`         | `Cache-Control: public, max-age=3600` + ETag                          |
| `GET /api/v1/museums`               | `src/app/api/v1/museums/route.ts`               | `country` / `city` 필터, CTE + window function 페이지네이션           |
| `GET /api/v1/museums/{id}`          | `src/app/api/v1/museums/[id]/route.ts`          | institutions JOIN places                                              |
| `GET /api/v1/museums/{id}/artworks` | `src/app/api/v1/museums/[id]/artworks/route.ts` | **유일하게** `year_label`/`thumbnail_url` 응답 (debt #5)              |
| `GET /api/v1/artists`               | `src/app/api/v1/artists/route.ts`               | `movement` / `nationality` 필터, CTE 기반                             |
| `GET /api/v1/artists/{id}`          | `src/app/api/v1/artists/[id]/route.ts`          | `movements`는 JSON_AGG로 묶음                                         |
| `GET /api/v1/artists/{id}/artworks` | `src/app/api/v1/artists/[id]/artworks/route.ts` | `limit > page` 우선순위 규칙                                          |
| `GET /api/v1/artists/{id}/map-data` | `src/app/api/v1/artists/[id]/map-data/route.ts` | 국가 GROUP BY + AVG(coords)                                           |
| `GET /api/v1/artworks`              | `src/app/api/v1/artworks/route.ts`              | v1.3.0에서 추가, `artist_id`/`movement`/`status` 필터                 |
| `GET /api/v1/artworks/{id}`         | `src/app/api/v1/artworks/[id]/route.ts`         | base + primary_museum + current_location 3-쿼리, 중복 행 시 WARN 로그 |
| `GET /api/v1/search`                | `src/app/api/v1/search/route.ts`                | 자동완성 모드(`limit`만) / 페이지 모드(`page`+`per_page`) 분기        |

오류 응답은 모두 RFC 9457 (`application/problem+json`) 포맷이며
`src/lib/api-response.ts`의 `badRequest` / `notFound` / `tooManyRequests` /
`internalServerError` 헬퍼를 경유한다.

### 2-2. 프론트엔드 페이지

| 라우트                   | 파일                                     | 상태           | 설명                                                                          |
| ------------------------ | ---------------------------------------- | -------------- | ----------------------------------------------------------------------------- |
| `/`                      | `src/app/page.tsx`                       | ✅ 본구현      | 홈 — `HomeMap` (국가 버블 ↔ 미술관 마커, 줌 임계값 4.5)                       |
| `/artists`               | `src/app/artists/page.tsx`               | ⚠️ placeholder | 헤딩만, 목록·필터·정렬 미구현                                                 |
| `/artists/[id]`          | `src/app/artists/[id]/page.tsx`          | ✅ 본구현      | `Promise.allSettled`로 3 API 병렬 호출, Hero / Info / 작품 갤러리 / 국가 지도 |
| `/artists/[id]/artworks` | `src/app/artists/[id]/artworks/page.tsx` | ⚠️ placeholder | 전체 작품 목록 페이지 미구현                                                  |
| `/artworks/[id]`         | `src/app/artworks/[id]/page.tsx`         | ✅ 본구현      | Hero / Curation / 위치 지도                                                   |
| `/museums`               | `src/app/museums/page.tsx`               | ⚠️ placeholder | 미술관 목록·필터 미구현                                                       |
| `/museums/[id]`          | `src/app/museums/[id]/page.tsx`          | ✅ 본구현      | Hero / Info / 위치 지도 / 작품 갤러리                                         |
| `/about`                 | `src/app/about/page.tsx`                 | ⚠️ placeholder | 헤딩만                                                                        |
| `/contact`               | `src/app/contact/page.tsx`               | ⚠️ placeholder | 헤딩만                                                                        |

**부분 구현 카운트**: 페이지 9개 중 **본구현 4개 (44%)**, placeholder 5개 (56%).

---

## 3. PRD 단위 기능별 요구사항 vs 구현

### F-001 — 통합 검색 (✅ 완료)

- **PR #19로 머지 완료** (commits 548e042, b5303b7, cd6dae5)
- 위치: `src/components/SearchBar.tsx` (304줄),
  `src/components/search/SearchDropdown.tsx`
- 동작 사양:
  - 최소 입력 **2자**, 미달 시 즉시 `idle` 리셋 + in-flight `AbortController`
    취소
  - **300ms debounce** (`useDebounce` 훅)
  - 자동완성 모드: 카테고리당 최대 5개 (`AUTOCOMPLETE_LIMIT=5`)
  - 결과 카테고리 순서: **화가 → 작품 → 미술관**
  - 키보드: `↑/↓` 순환 금지, `Enter` 활성 항목 이동, `Escape` 닫기
  - **ARIA combobox** 패턴 (`aria-expanded`, `aria-controls`,
    `aria-activedescendant`, `aria-autocomplete="list"`)
  - 바깥 클릭 시 닫기, 다시 포커스 시 이전 결과 재오픈
- 페이지 모드(`/search?q=...&page=...`) UI는 **미구현** — API는 페이지 모드
  응답을 지원하나 결과 페이지 라우트가 없음

### F-002 — 지도 탐색 (✅ 부분 완료)

- 위치: `src/components/map/HomeMap.tsx`
- 동작:
  - `MUSEUM_ZOOM_THRESHOLD = 4.5` 기준으로 **줌 인 → 미술관 마커 / 줌 아웃 →
    국가 버블** 자동 전환
  - 국가 버블 클릭 시 `flyTo`로 진입
  - `Cache-Control: max-age=3600`된 `/map/countries` 응답 활용
- 클러스터링·검색 결과 지도 동기화는 **미구현**

### F-003 — 화가 상세 (✅ 완료)

- 위치: `src/app/artists/[id]/page.tsx`
- `Promise.allSettled`로 3 API 병렬 호출 (`getArtistById`,
  `getArtistArtworks{limit:12}`, `getArtistMapData`)
- 컴포넌트: `ArtistHero`, `ArtistInfo`, `ArtistArtworkGallery`,
  `ArtistCountryMapWrapper`
- **알려진 부채**: 작품 카드의 미술관 링크 없음(debt #2), 작품 수 표시 없음(debt
  #3)

### F-004 — 작품 상세 (✅ 완료)

- 위치: `src/app/artworks/[id]/page.tsx`,
  `src/components/artwork/ArtworkHero.tsx` (158줄)
- 좌: 이미지 패널 (퍼블릭 도메인이면 `<Image unoptimized>`, 아니면 "저작권 보호
  작품" 안내 카드)
- 우: 4개 상태 배지(`on_display` / `on_loan` / `in_storage` /
  `under_restoration`), 제목·화가·메타·소장처
- **`on_loan` 분기**: 원소장처(`primary_museum`)와 현재
  전시처(`current_location`)를 **둘 다** 표시
- **알려진 부채**: 화가 메타라인이 이름만 — `nationality` / 생몰년 미반환 (debt
  #1)

### F-005 — 미술관 상세 (✅ 완료)

- 위치: `src/app/museums/[id]/page.tsx`
- 단일 API(`getMuseumById`) → `MuseumHero`, `MuseumInfo`,
  `MuseumLocationMapWrapper`, `MuseumArtworkGallery`
- **알려진 부채**: 미술관 보유 작품 수 표시 없음(debt #4), `opening_hours`는
  `Record<string, unknown> \| null`로 비정형 보관(debt #6)

---

## 4. 핵심 도메인 규칙 (실제 적용 상태)

| 규칙                                | 적용 상태    | 비고                                           |
| ----------------------------------- | ------------ | ---------------------------------------------- |
| TypeScript strict, `any` 금지       | ✅ 강제      | ESLint + tsconfig                              |
| 텍스트 필드 `_ko`/`_en` 분리        | ✅ 일관 적용 | 단, UI는 한국어 노출만 사용                    |
| ID = UUID                           | ✅           | API에서 `isValidUUID`로 사전 검증              |
| API 오류 = RFC 9457                 | ✅           | `api-response.ts` 헬퍼                         |
| `react-map-gl/maplibre` 경로 강제   | ✅           | 직접 import 시 Mapbox 유료로 라우팅됨          |
| 컴포넌트 내 `fetch` 직접 호출 금지  | ✅           | 모두 `src/lib/api.ts` 경유                     |
| 검색 debounce 300ms                 | ✅           | `useDebounce`                                  |
| 화가 상세 `Promise.allSettled` 병렬 | ✅           |                                                |
| 429 응답 시 `Retry-After` 처리      | ⚠️ 부분      | API는 발급, 클라이언트는 별도 재시도 로직 없음 |

---

## 5. 데이터 영역 — 8개 테이블 / 3개 Enum

`src/lib/schema.ts` (Drizzle) 기준:

- **테이블**: `art_movements`, `artists`, `artist_movements`, `institutions`,
  `places`, `artworks`, `artwork_artists`, `artwork_ownerships`,
  `artwork_locations`
- **Enum**: `artwork_status` (4값), `location_type`, `institution_type`
- **핵심 인덱스**: `places_lat_lon_idx` (지도 쿼리),
  `artwork_artists_artist_id_idx`, `artwork_locations_place_id_idx`
- 내부 추적 컬럼(`wikidata_id`, `image_source`, `source_api`, `source_id`)은
  스키마에는 존재하나 API 응답에는 노출되지 않음

> `sql/` 폴더는 CLAUDE.md에 언급되어 있으나 **현재 리포지토리에 존재하지 않음**.
> 스키마는 Drizzle(`src/lib/schema.ts`) 단일 정의를 사용 중.

---

## 6. 알려진 기술 부채 (요약)

| #   | 항목                                                                                                       | 영향 영역              |
| --- | ---------------------------------------------------------------------------------------------------------- | ---------------------- |
| 1   | 작품 상세에서 화가 nationality·생몰년 미노출                                                               | `ArtworkHero`          |
| 2   | 화가 상세 작품 카드에 미술관 링크 없음                                                                     | `ArtistArtworkGallery` |
| 3   | 화가 상세에 보유 작품 수 미표시                                                                            | `ArtistInfo`           |
| 4   | 미술관 상세에 보유 작품 수 미표시                                                                          | `MuseumInfo`           |
| 5   | `museums/{id}/artworks`만 `year_label`/`thumbnail_url` 사용 (다른 엔드포인트는 `year_created`/`image_url`) | API 일관성             |
| 6   | `opening_hours` jsonb 구조 미정의                                                                          | `PlaceInfo`            |
| 7   | 국가/도시 i18n 매핑 42개 ISO 코드만 지원                                                                   | `country-names.ts`     |

자세한 내용: `docs/debt/2026-04-18-mvp-deferred-items.md`,
`docs/reports/2026-04-18-spec-v2-audit.md`

---

## 7. 비기능 요구사항 (현재 적용 수준)

| 항목          | 현재 상태                                                                                     |
| ------------- | --------------------------------------------------------------------------------------------- |
| 접근성        | 검색바 ARIA combobox 패턴, 이미지 alt, `aria-hidden` SVG — 그 외 페이지 단위 a11y 감사 미실시 |
| 성능          | `/map/countries`만 명시적 캐싱, Next 16 default 렌더링 외 추가 최적화 없음                    |
| 반응형        | Tailwind `md:` breakpoint 기준, 모바일은 Header 햄버거 메뉴                                   |
| SEO           | App Router 기본 메타데이터만, 페이지별 `generateMetadata` 미정의                              |
| 모니터링·로깅 | API Route 내부 `console.error` / `console.warn`만, 외부 수집 없음                             |
| 테스트        | 자동화 테스트 없음 (단위/통합/E2E 모두)                                                       |

---

## 8. 다음 단계 후보 (현 코드 기반 가능한 작업)

> 이 섹션은 의사결정용 메모일 뿐이며, 약속된 로드맵이 아니다.

1. placeholder 5개 페이지 본구현 (특히 `/artists`, `/museums` 목록)
2. 검색 페이지 모드(`/search` 결과 라우트) UI
3. 부채 #1 — 작품 응답에 화가 메타 포함 (API + Type + UI)
4. 부채 #5 — 응답 필드명 통일 (Spec v1.4.0 후보)
5. 자동화 테스트 도입 (Vitest / Playwright)
