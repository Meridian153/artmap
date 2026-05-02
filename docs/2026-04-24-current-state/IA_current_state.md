# ArtMap — IA (Information Architecture)

> **작성 시점**: 2026-04-24 **목적**: 현재 코드베이스에 실제로 구현된
> 라우트·내비게이션·정보 계층을 정리. 의도된 IA가 아닌 **실측 IA**.

---

## 1. 전역 구조

```
브라우저
  └── Next.js (App Router, Vercel)
        ├── 페이지 9개 (본구현 4, placeholder 5)
        ├── API Routes 11개 (전부 구현)
        └── PostgreSQL/PostGIS (Neon)
```

레이아웃 트리:

```
RootLayout (src/app/layout.tsx)
  └── Header (sticky top)
       ├── 로고 / 홈 링크
       ├── 데스크톱 nav: 화가 / 미술관 / 소개
       ├── SearchBar (전역, 모든 페이지)
       └── 모바일 햄버거 메뉴
  └── 페이지별 콘텐츠 (children)
  └── (Footer 컴포넌트 없음 — 현재 미구현)
```

---

## 2. 사이트맵 (실측)

| 라우트                   | 파일                                     | 종류      | 상태                |
| ------------------------ | ---------------------------------------- | --------- | ------------------- |
| `/`                      | `src/app/page.tsx`                       | 홈        | ✅ 본구현 (HomeMap) |
| `/artists`               | `src/app/artists/page.tsx`               | 목록      | ⚠️ placeholder      |
| `/artists/[id]`          | `src/app/artists/[id]/page.tsx`          | 상세      | ✅ 본구현           |
| `/artists/[id]/artworks` | `src/app/artists/[id]/artworks/page.tsx` | 하위 목록 | ⚠️ placeholder      |
| `/artworks/[id]`         | `src/app/artworks/[id]/page.tsx`         | 상세      | ✅ 본구현           |
| `/museums`               | `src/app/museums/page.tsx`               | 목록      | ⚠️ placeholder      |
| `/museums/[id]`          | `src/app/museums/[id]/page.tsx`          | 상세      | ✅ 본구현           |
| `/about`                 | `src/app/about/page.tsx`                 | 정적      | ⚠️ placeholder      |
| `/contact`               | `src/app/contact/page.tsx`               | 정적      | ⚠️ placeholder      |

**검색 결과 페이지 (`/search?q=...`)**: API는 페이지 모드 응답을 지원하나 **UI
라우트가 없음**. 현재 검색은 헤더의 자동완성 드롭다운만 존재.

**404 / 에러**: Next.js 기본 처리. 라우트별 `error.tsx` / `not-found.tsx` 파일
없음.

---

## 3. 내비게이션 모델

### 3-1. 글로벌 (Header)

`src/components/Header.tsx`:

- 좌측: 로고 → `/`
- 중앙(데스크톱) / 햄버거(모바일): **3개 링크** — 화가(`/artists`),
  미술관(`/museums`), 소개(`/about`)
- 우측: SearchBar (`SearchBar.tsx`)

> 모바일에서는 nav가 햄버거로 접히고 SearchBar는 인라인 표시.

### 3-2. 페이지 내 내비게이션

| 페이지             | 인-페이지 링크                                                                              |
| ------------------ | ------------------------------------------------------------------------------------------- |
| `/` (홈)           | 국가 버블 클릭 → `flyTo`(같은 페이지), 미술관 마커 → `/museums/[id]`                        |
| 화가 상세          | 작품 카드 → `/artworks/[id]` (미술관 링크 부재 — debt #2)                                   |
| 작품 상세          | 화가 이름 → `/artists/[id]`, 미술관 이름 → `/museums/[id]` (on_loan 시 두 미술관 모두 링크) |
| 미술관 상세        | 작품 갤러리 → `/artworks/[id]`                                                              |
| SearchBar 자동완성 | 항목 클릭 → 각 카테고리 상세 페이지                                                         |

### 3-3. 누락 내비게이션

- **Footer 미존재** → about/contact 도달 경로가 햄버거 메뉴뿐
- **브레드크럼 없음**
- **검색 결과 전체 보기** 링크 없음 (자동완성 드롭다운에서 종결)
- **하위 목록 페이지** (`/artists/[id]/artworks`)로의 링크 없음

---

## 4. 정보 계층 (페이지별 콘텐츠 블록)

### 4-1. 홈 `/`

```
<HomeMap>
  ├── MapLibre 지도
  ├── 줌 < 4.5: 국가 버블 (작품 수 라벨)
  └── 줌 ≥ 4.5: 미술관 마커
```

### 4-2. 화가 상세 `/artists/[id]`

API 호출:
`Promise.allSettled([getArtistById, getArtistArtworks{limit:12}, getArtistMapData])`

```
<ArtistHero>      ← 이름, 국적, 생몰 연도(lifeSpan)
<ArtistInfo>      ← bio, movements
<ArtistArtworkGallery>  ← 최대 12개 작품 카드 (미술관 링크 없음)
<ArtistCountryMapWrapper>  ← 활동 국가 지도 (map-data API)
```

### 4-3. 작품 상세 `/artworks/[id]`

```
<ArtworkHero>  ← 2열 그리드
  ├── 좌: 이미지 패널
  │   ├── 퍼블릭도메인 + image_url → <Image unoptimized>
  │   ├── 퍼블릭도메인 + URL 없음 → "이미지 준비 중"
  │   └── 비 퍼블릭도메인 → "저작권 보호 작품" 안내
  └── 우: 정보 패널
      ├── (1) 상태 배지 (on_display / on_loan / in_storage / under_restoration)
      ├── (2) 제목 (ko + en)
      ├── (3) 화가 이름 링크 (메타 부족 — debt #1)
      ├── (4) 메타: 제작 연도 / 재료 / 크기
      └── (5) 소장처
          ├── status === "on_loan"
          │   ├── 원소장처: primary_museum
          │   └── 현재 전시처: current_location.museum_*
          └── 그 외: primary_museum

<ArtworkCuration>             ← 큐레이션 영역
<ArtworkLocationMapWrapper>   ← 위치 지도
```

### 4-4. 미술관 상세 `/museums/[id]`

```
<MuseumHero>
<MuseumInfo>                   ← 위치, opening_hours(jsonb 비정형 — debt #6)
<MuseumLocationMapWrapper>     ← 위치 마커
<MuseumArtworkGallery>         ← 보유 작품 (year_label/thumbnail_url 사용 — debt #5)
```

---

## 5. 데이터 모델 (8 테이블 / 3 Enum)

`src/lib/schema.ts` (Drizzle):

```
art_movements ──┐
                ├── artist_movements ──┐
                                       │
                                  artists ──┐
                                            ├── artwork_artists ──┐
                                                                  │
                                                              artworks ──┬── artwork_ownerships ── institutions
                                                                         │
                                                                         └── artwork_locations ──── places
                                                                                                       │
institutions ────────────────── places ─── (1:1 location)                                              │
```

핵심 의도:

- `artworks`는 위치를 직접 갖지 않고 `artwork_locations`(현재 위치) +
  `artwork_ownerships`(소유)로 분리 — IA의 "작품 ↔ 위치" 다대일·시간변화 모델링
- `places`는 `institutions`와 별개 테이블 (지점·분관·임시 전시장 대응)
- `art_movements` ↔ `artists`는 다대다 (`artist_movements`)

Enum:

- `artwork_status`: `on_display` / `on_loan` / `in_storage` /
  `under_restoration`
- `location_type`: 위치 종류
- `institution_type`: 미술관·박물관·갤러리 등

---

## 6. URL 규칙

| 패턴               | 예시                  | 비고                              |
| ------------------ | --------------------- | --------------------------------- |
| `/artworks/{uuid}` | `/artworks/8c1d7f...` | UUID v4, 사전 검증(`isValidUUID`) |
| `/artists/{uuid}`  | 동일                  |                                   |
| `/museums/{uuid}`  | 동일                  |                                   |
| API 베이스         | `/api/v1/...`         | 버전 prefix 고정                  |
| 쿼리 파라미터      | `?country=FR&page=1`  | snake_case                        |

**slug**나 **국가/도시 prefix**는 사용하지 않음 (예: `/fr/paris/louvre` 형태
아님).

---

## 7. 다국어 IA 현황

| 영역                                                          | 한국어                                                 | 영어                                  |
| ------------------------------------------------------------- | ------------------------------------------------------ | ------------------------------------- |
| UI 텍스트 (레이블, 버튼)                                      | ✅                                                     | ❌ 미구현                             |
| 데이터 필드 (`title_ko` 등)                                   | ✅                                                     | ✅ (스키마는 갖추나 일부 데이터 누락) |
| 화가 메타 (`name_ko ?? name_en ?? '작가 정보 없음'` fallback) | ✅                                                     | ✅                                    |
| 국가명                                                        | 42개 ISO 코드 매핑(`country-names.ts`)                 | 동일                                  |
| URL                                                           | 영문 명사(`/artists`, `/museums`) — 한국어 라우트 없음 |                                       |

→ **현재 IA는 사실상 단일 언어(한국어 UI + 다국어 데이터)**. 글로벌 사용자에게
노출되는 IA는 데이터 라벨에 한정됨.

---

## 8. 접근성·SEO IA

- 검색바는 ARIA combobox 패턴(`aria-expanded`, `aria-controls`,
  `aria-activedescendant`, `aria-autocomplete="list"`, `role="combobox"`)
- 결과 listbox: `role="listbox"`, 옵션 `id="search-option-{n}"`
- 그 외 페이지: `<h1>`, `<dl>`, `<Link>` 기본 시맨틱만 사용 — 페이지 단위 a11y
  감사 미실시
- `generateMetadata` 미정의 → 모든 페이지가 RootLayout의 디폴트 메타데이터를
  공유 (페이지별 title·description 분리 안 됨)
- `robots.txt` / `sitemap.xml` 미생성

---

## 9. IA 개선 후보 (관찰 기반)

> 권고가 아닌 **현 IA에서 도드라지는 빈틈**의 객관 기록.

1. `/search` 결과 페이지 — API는 준비, 라우트가 없음
2. Footer 컴포넌트 — about/contact 도달 경로가 햄버거뿐
3. 페이지별 `generateMetadata` — SEO·소셜 카드 무차별
4. 화가 상세 → 작품 카드 → 미술관 직접 이동 (debt #2)
5. 목록 페이지 본구현 (`/artists`, `/museums`) — 검색 외 발견 동선 부재
6. 전체 작품 목록 라우트 (`/artworks`) — API는 v1.3.0에서 추가되었으나 페이지
   부재
