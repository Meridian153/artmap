# ArtMap — TEG (Technical Execution Guide)

> **작성 시점**: 2026-04-24 **목적**: 현재 코드베이스의 기술 실행 방식을
> 객관적으로 정리. 신규 기여자가 PR을 안전하게 만들 수 있도록 **실측된 패턴**을
> 문서화.

---

## 1. 기술 스택 (실측 버전)

`package.json` 기준:

| 영역                   | 기술                       | 버전        |
| ---------------------- | -------------------------- | ----------- |
| 프레임워크             | Next.js (App Router)       | 16.2.1      |
| 런타임                 | React                      | 19.2.4      |
| 언어                   | TypeScript (strict)        | 5.x         |
| 스타일링               | Tailwind CSS               | 4.x         |
| 지도 라이브러리        | MapLibre GL JS             | 5.22.0      |
| 지도 React 래퍼        | `react-map-gl/maplibre`    | 8.1.0       |
| ORM (신규)             | Drizzle ORM                | 0.45.2      |
| DB 클라이언트 (레거시) | `pg` (node-postgres)       | 8.20.0      |
| 서버리스 DB 드라이버   | `@neondatabase/serverless` | 1.0.2       |
| 데이터베이스           | PostgreSQL + PostGIS       | Neon 호스팅 |
| 패키지 매니저          | pnpm                       | 10.33.0     |
| 코드 품질              | ESLint, Prettier, Husky    | —           |
| 배포                   | Vercel                     | 단일 배포   |

**중요 import 규칙**: `react-map-gl` 직접 import는 Mapbox(유료)로 라우팅됨.
**반드시 `react-map-gl/maplibre`** 경유.

---

## 2. 디렉토리 구조

```
src/
├── app/                  → 페이지 + API Routes
│   ├── api/v1/           → 11개 엔드포인트
│   ├── artists/, artworks/, museums/, about/, contact/
│   ├── layout.tsx, page.tsx
├── components/
│   ├── search/           → SearchDropdown 등
│   ├── map/              → HomeMap, ArtistCountryMap, MuseumLocationMap, ArtworkLocationMap
│   ├── artist/, artwork/, museum/
│   ├── Header.tsx, SearchBar.tsx, ...
├── lib/
│   ├── api.ts            → 클라이언트 API (USE_MOCK 분기)
│   ├── api-response.ts   → RFC 9457 헬퍼
│   ├── db.ts             → Drizzle + pg Pool 듀얼
│   ├── schema.ts         → Drizzle 스키마 (8 테이블, 3 enum)
│   ├── country-names.ts, format-year.ts
├── hooks/                → useDebounce 등
├── types/                → artist, artwork, museum, search, map, common, error
└── mocks/                → Mock 데이터
docs/
├── specs/                → OpenAPI v1.3.0
├── reports/              → 감사 리포트
└── debt/                 → 부채 추적
```

> CLAUDE.md에 언급된 `sql/` 폴더는 **존재하지 않음**. DB 스키마는
> `src/lib/schema.ts` Drizzle 단일 정의를 사용.

---

## 3. 아키텍처

```
브라우저
  ├── 정적 페이지(SSR/SSG) ← App Router
  ├── 클라이언트 컴포넌트 (use client) ← 지도, 검색
  │   └── fetch → /api/v1/...
  └── 직접 API 호출 (Mock 모드)
        ↓
Next.js API Routes (Vercel Serverless)
  ├── api-response.ts (RFC 9457)
  └── db.ts → @neondatabase/serverless (HTTP)
        ↓
PostgreSQL + PostGIS (Neon)
```

**별도 백엔드 서버 없음.** 프론트와 API가 한 Next.js 프로젝트에서 단일 Vercel
배포.

---

## 4. 코딩 스타일 (단일 진실 원천)

`.gemini/styleguide.md`가 단일 진실 원천. 핵심만 발췌:

- **TypeScript strict**, `any` 금지 (`unknown` 또는 구체 타입)
- `interface` 대신 **`type`** 사용
- `import type {...}` (타입-only import 분리)
- 파일 네이밍: 컴포넌트는 PascalCase, 훅·유틸은 kebab-case
- Boolean 식별자는 `is*` / `has*` / `should*` prefix
- 모든 함수·주요 로직 블록에 **한국어 주석**
- 새 파일 상단에 **파일 역할** 한국어 주석

코드 작성 전 항상 styleguide 우선. CLAUDE.md/AGENTS.md와 충돌 시 styleguide가
우선.

---

## 5. 데이터 모드: Mock vs 실제 API

```ts
// src/lib/api.ts
const USE_MOCK = process.env.NEXT_PUBLIC_USE_MOCK === "true";
```

- 모든 클라이언트 API 함수가 `USE_MOCK`로 분기
- Mock 데이터: `src/mocks/{domain}.ts`, OpenAPI v1.3.0 스키마와 동일 구조 유지
- README 기준 **MVP는 `NEXT_PUBLIC_USE_MOCK=true`** 필요 — 실 데이터 시드는
  미공개

**컴포넌트 내 직접 `fetch` 호출 금지.** 반드시 `src/lib/api.ts` 경유.

---

## 6. API 레이어

### 6-1. 11개 엔드포인트 일람

| Method | Path                            | 응답 캐싱                                    | 비고                                                         |
| ------ | ------------------------------- | -------------------------------------------- | ------------------------------------------------------------ |
| GET    | `/api/v1/map/countries`         | `Cache-Control: public, max-age=3600` + ETag |                                                              |
| GET    | `/api/v1/museums`               | —                                            | `country` / `city` 필터, 페이지네이션                        |
| GET    | `/api/v1/museums/{id}`          | —                                            | institutions JOIN places                                     |
| GET    | `/api/v1/museums/{id}/artworks` | —                                            | `year_label`/`thumbnail_url` 응답 (debt #5)                  |
| GET    | `/api/v1/artists`               | —                                            | CTE 기반 필터                                                |
| GET    | `/api/v1/artists/{id}`          | —                                            | JSON_AGG로 movements                                         |
| GET    | `/api/v1/artists/{id}/artworks` | —                                            | `limit > page` 우선순위                                      |
| GET    | `/api/v1/artists/{id}/map-data` | —                                            | 국가 GROUP BY + AVG 좌표                                     |
| GET    | `/api/v1/artworks`              | —                                            | `artist_id`/`movement`/`status` 필터                         |
| GET    | `/api/v1/artworks/{id}`         | —                                            | base + primary_museum + current_location 3-쿼리              |
| GET    | `/api/v1/search`                | —                                            | 자동완성 모드(`limit`) / 페이지 모드(`page`+`per_page`) 분기 |

### 6-2. 응답 패턴

**성공**: `Response.json(payload, { status: 200 })`

**실패 (RFC 9457 `application/problem+json`)**:

```ts
import {
  badRequest,
  notFound,
  tooManyRequests,
  internalServerError,
  isValidUUID,
  parseIntParam,
} from "@/lib/api-response";

if (!isValidUUID(id)) {
  return badRequest("invalid_id", "ID는 UUID 형식이어야 합니다.");
}
```

ProblemDetail 형식 (`type`, `title`, `status`, `detail`, `instance`)으로 일관
응답.

### 6-3. SQL 작성 패턴

- `pg` Pool: `await pool.query<RowType>(sqlText, [params])`
- Drizzle: `db.select().from(...).where(...)` (신규 코드)
- 페이지네이션: `COUNT(*) OVER()` window function으로 단일 쿼리에서 total 계산
- 다중 행 결과: `JSON_AGG`로 nested 구조 만들 것
- 중복 행 발견 시 `console.warn`으로 데이터 정합성 신호
  (`/artworks/[id]/route.ts` 패턴)

### 6-4. 클라이언트 호출 규칙

- **검색**: `useDebounce` 300ms, `AbortController`로 in-flight 취소
- **화가 상세**: `Promise.allSettled`로 3 API 병렬 호출 — 일부 실패해도 부분
  렌더 가능
- **429 응답**: 서버는 `Retry-After` 헤더 발급, 클라이언트 재시도 로직은 미구현
  (필요 시 추가)
- **Mock 모드**: `USE_MOCK` 분기에서
  `await new Promise(r => setTimeout(r, n))`로 인위적 지연 부여

---

## 7. 데이터베이스

### 7-1. 연결

```ts
// src/lib/db.ts
// 신규 코드
export const db = drizzle(neon(process.env.DATABASE_URL!), { schema });

// 레거시 라우트
export const pool = new Pool({ connectionString: process.env.DATABASE_URL });
```

`@neondatabase/serverless`의 HTTP 드라이버를 사용해 Vercel Serverless Function
콜드 스타트 시 TCP 핸드셰이크 비용을 회피한다.

### 7-2. 스키마

`src/lib/schema.ts` (Drizzle):

- 테이블 8: `art_movements`, `artists`, `artist_movements`, `institutions`,
  `places`, `artworks`, `artwork_artists`, `artwork_ownerships`,
  `artwork_locations`
- Enum 3: `artwork_status`, `location_type`, `institution_type`
- 핵심 인덱스:
  - `places_lat_lon_idx` — 지도 영역 쿼리
  - `artwork_artists_artist_id_idx` — 화가별 작품 조회
  - `artwork_locations_place_id_idx` — 위치별 작품 조회

### 7-3. 마이그레이션

- 마이그레이션 파일/도구 별도 정착 안 됨 (`drizzle-kit` 명령은 `package.json`에
  존재하나 마이그레이션 폴더 없음)
- 스키마 변경 시 **사유 사전 설명** 필수 (CLAUDE.md 규칙)

---

## 8. 지도 구현

### 8-1. 라이브러리

```ts
// 올바른 import
import { Map, Marker } from "react-map-gl/maplibre";
// 잘못된 import — Mapbox(유료)로 라우팅됨
import { Map } from "react-map-gl";
```

### 8-2. SSR 회피

MapLibre는 브라우저 전용 → 서버 사이드 렌더링 불가. 반드시:

- `"use client"` 디렉티브, 또는
- `dynamic(() => import('...'), { ssr: false })`

### 8-3. 타일

- **OpenFreeMap** — API 키 불필요, 무료
- 스타일 URL은 컴포넌트 레벨에서 직접 지정

### 8-4. 줌 임계값

`HomeMap.tsx`: `MUSEUM_ZOOM_THRESHOLD = 4.5` 기준으로 국가 버블 ↔ 미술관 마커
자동 전환.

---

## 9. 타입 정의 (`src/types/`)

| 파일         | 핵심 타입                                                                                                                          |
| ------------ | ---------------------------------------------------------------------------------------------------------------------------------- |
| `artist.ts`  | `ArtistSummary`, `ArtistDetail`, `ArtistMovement{Summary,Detail}`                                                                  |
| `artwork.ts` | `ArtworkStatus` (4값 union), `ArtworkSummary`, `ArtworkSummaryWithMuseum`, `ArtworkDetail` (`primary_museum` + `current_location`) |
| `museum.ts`  | `MuseumSummary`, `MuseumDetail`, `PlaceInfo` (`OpeningHours = Record<string, unknown> \| null`)                                    |
| `search.ts`  | `SearchResult` (`page`, `per_page`, `total*`)                                                                                      |
| `map.ts`     | `CountryMapData`, `ArtistCountryDistribution`                                                                                      |
| `common.ts`  | `PaginatedResponse<T>`                                                                                                             |
| `error.ts`   | `ProblemDetail`                                                                                                                    |

> 타입 정의와 API 실제 응답 사이에 **약 60건의 필드 불일치**가 추적되고 있다.
> 상세는 `docs/reports/2026-04-18-spec-v2-audit.md` 참조.

---

## 10. 환경변수

| 변수                   | 용도                  | 비고             |
| ---------------------- | --------------------- | ---------------- |
| `NEXT_PUBLIC_USE_MOCK` | `true` 시 Mock 데이터 | MVP 필수         |
| `DATABASE_URL`         | Neon Postgres 연결    | 실 모드에서 필수 |

`NEXT_PUBLIC_*` prefix만 클라이언트 노출. 그 외는 서버 전용.

---

## 11. 빌드·개발·배포

### 11-1. 로컬

```bash
pnpm install
pnpm dev          # http://localhost:3000
pnpm build        # 프로덕션 빌드
pnpm start        # 빌드 결과 실행
pnpm lint         # ESLint
pnpm typecheck    # TypeScript 검사 (있는 경우)
```

### 11-2. Git 훅

- Husky + lint-staged: 커밋 전 ESLint + Prettier 자동 적용
- 커밋 메시지 prefix: `feat:` / `fix:` / `style:` / `refactor:` / `docs:` /
  `chore:`

### 11-3. 배포

- Vercel 단일 배포 (App Router 페이지 + API Routes 통합)
- Neon Postgres는 별도 호스팅, `DATABASE_URL` 주입

### 11-4. PR 리뷰

- Gemini Code Assist가 자동 리뷰 (`.gemini/styleguide.md`를 컨텍스트로 사용)
- 사람 이름 직접 언급 금지 (역할/위치로 대체)

---

## 12. 테스트

**자동화 테스트 없음** — 단위/통합/E2E 모두 미설치. 변경 검증은:

- `pnpm dev`로 수동 브라우저 확인
- `pnpm typecheck`/`pnpm lint`로 정적 검증
- Mock 모드에서 시나리오 재현

UI/프론트엔드 변경 시 골든 패스와 엣지 케이스를 브라우저에서 확인 후 보고
(CLAUDE 가이드).

---

## 13. 모니터링·로깅

- API Route 내부 `console.error` / `console.warn`만 사용
- 외부 수집 시스템(Sentry, Datadog 등) 없음
- 데이터 정합성 의심 케이스(중복 행 등)는 `console.warn`으로 신호

---

## 14. 알려진 기술 부채 요약

`docs/debt/2026-04-18-mvp-deferred-items.md`:

| #   | 항목                                                                | 영향                     |
| --- | ------------------------------------------------------------------- | ------------------------ |
| 1   | 작품 응답에 화가 nationality·생몰년 누락                            | UI: ArtworkHero          |
| 2   | 화가 상세 작품 카드의 미술관 링크 부재                              | UI: ArtistArtworkGallery |
| 3   | 화가 상세에 보유 작품 수 미표시                                     | UI: ArtistInfo           |
| 4   | 미술관 상세에 보유 작품 수 미표시                                   | UI: MuseumInfo           |
| 5   | `museums/{id}/artworks`만 다른 필드명(`year_label`/`thumbnail_url`) | API 일관성               |
| 6   | `opening_hours` jsonb 비정형                                        | 타입·UI                  |
| 7   | 국가/도시 i18n 매핑 42개 ISO 코드만                                 | i18n                     |

`docs/reports/2026-04-18-spec-v2-audit.md`: Spec ↔ API ↔ Types 약 60건 필드
불일치 (네이밍 차이, 타입 차이, 누락, 확장 필드, 중첩 구조 차이).

### 듀얼 DB 클라이언트

- 신규 코드: Drizzle ORM
- 레거시 라우트: `pg` Pool
- 점진 마이그레이션 중 — 신규 라우트는 Drizzle, 기존 SQL이 복잡한 경우 `pg` 유지

---

## 15. 수정 시 주의 파일

다음 파일은 **사전에 사유를 설명한 뒤** 수정:

- `next.config.ts` — 전체 동작
- `tsconfig.json` — TS 설정
- `src/app/layout.tsx` — 전체 페이지 레이아웃
- `src/types/` 하위 — 다수 컴포넌트 영향
- `.gemini/styleguide.md` — 단일 스타일 진실 원천 (사용자 명시 승인 없이는 변경
  금지)
- `sql/` — 현재 폴더 부재이지만 추가될 경우 마이그레이션 검토

---

## 16. 신규 기여자 체크리스트

신규 기능 추가 시:

1. `.gemini/styleguide.md` 관련 섹션 확인
2. 기존 유사 라우트/컴포넌트 패턴 확인 후 재사용
3. 새 파일은 상단 한국어 역할 주석
4. 클라이언트 fetch는 `src/lib/api.ts`에만 작성
5. API 라우트 오류는 `api-response.ts` 헬퍼 사용
6. 타입 정의는 `src/types/`에서 import
7. 지도 코드는 `react-map-gl/maplibre` 경유 + `"use client"`
8. Mock 분기 빠뜨리지 않기 (`USE_MOCK`)
9. 커밋 메시지 prefix 준수
10. 사람 이름 직접 언급 금지 (역할로 대체)
