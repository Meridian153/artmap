# ArtMap 기술 부채 기록 — MVP 단계에서 연기된 항목

> **작성일**: 2026-04-18 **재평가 시점**: MVP 출시 후 (PRD 성공 지표 기준 재검토
> 예정) **근거 문서**: `docs/reports/2026-04-18-spec-v2-current-state-audit.md`

## 배경

MVP 구현 속도를 우선하기 위해, 현재 프론트엔드가 정의한 확장 필드 중 **실제
API가 반환하지 않는 항목**은 일괄 제거하기로 결정했습니다. 이로 인해 일부 UX
요소가 MVP 단계에서 간소화됩니다.

본 문서는 해당 간소화 사항을 투명하게 기록하여, MVP 출시 후 사용자 피드백을
기반으로 재평가할 근거를 남기는 것이 목적입니다.

## 결정 원칙

- **지금**: 현행 API 반환값을 절대적 기준으로 삼아 프론트를 정합합니다.
- **MVP 이후**: 사용자 피드백을 기반으로 각 항목의 필요성을 재평가하고, 필요한
  경우 Spec 확장과 API 수정을 병행 진행합니다.

## 연기된 항목 목록

### 부채 #1 — 작품 상세에서 화가 메타 정보 미표시

**현황**: `/api/v1/artworks/{id}` 응답의 `artist` 중첩 객체가
`{id, name_ko, name_en}`만 반환합니다.

**연기된 UX**: 작품 상세 페이지의 화가 메타라인(예: "네덜란드, 1853–1890")은
구현하지 않습니다. 화가 이름만 표시되며, 상세 정보는 화가 이름 클릭 시 이동하는
화가 상세 페이지에서 확인할 수 있습니다.

**해소 조건**: `/artworks/{id}` API의 artist 중첩 객체에 `nationality`,
`birth_year`, `death_year` 필드 추가.

**영향 범위**: `src/components/artwork/ArtworkHero.tsx`

---

### 부채 #2 — 작품 목록에서 미술관 직접 링크 불가

**현황**: `/api/v1/artists/{id}/artworks`, `/api/v1/artworks` 응답이
`museum_name_ko`, `museum_name_en` 평면 필드만 반환하며 `museum_id`를 포함하지
않습니다.

**연기된 UX**: 작품 카드에서 소장 미술관명을 클릭하여 미술관 상세 페이지로 직접
이동하는 링크는 구현하지 않습니다. 사용자는 작품 카드 클릭 → 작품 상세 → 미술관
링크의 2단계 흐름으로 이동합니다 (작품 상세의 `primary_museum`에는 `id`가
포함되므로 가능).

**해소 조건**: 해당 엔드포인트 응답 구조를
`current_museum: {id, name_ko, name_en, country_code}` 중첩 객체로 재구성.

**영향 범위**: `src/components/artist/ArtistArtworkGallery.tsx`, 기타 작품 카드
컴포넌트

---

### 부채 #3 — 화가 상세에서 작품 수 미표시

**현황**: `/api/v1/artists/{id}` 응답이 `artwork_count` 필드를 반환하지
않습니다.

**연기된 UX**: 화가 상세 페이지의 "등록된 작품 N점" 표시는 구현하지 않습니다.
작품 갤러리 섹션 자체는 정상 표시되므로 사용자가 실제 작품을 보는 데에는 영향이
없습니다.

**해소 조건**: `/artists/{id}` API에 `artwork_count` 집계 컬럼 추가.

**영향 범위**: `src/components/artist/ArtistInfo.tsx`

---

### 부채 #4 — 미술관 상세에서 작품 수 미표시

**현황**: `/api/v1/museums/{id}` 응답이 `artwork_count` 필드를 반환하지
않습니다.

**연기된 UX**: 미술관 상세 페이지의 "소장 작품 N점" 상단 요약 표시는 구현하지
않습니다.

**해소 조건**: `/museums/{id}` API에 `artwork_count` 집계 컬럼 추가.

**영향 범위**: `src/components/museum/MuseumInfo.tsx`, `MuseumHero.tsx`

---

### 부채 #5 — 엔드포인트 간 필드명 불일치

**현황**: `/api/v1/museums/{id}/artworks` 엔드포인트만 `year_label: string`,
`thumbnail_url`로 변환하여 반환합니다. 다른 작품 관련 엔드포인트는
`year_created: int`, `image_url`을 그대로 반환합니다.

**임시 대응**: 프론트엔드 Types를 두 종류로 분리 유지합니다.

- `MuseumArtworkSummary`: `year_label`, `thumbnail_url` 수용
- `ArtworkSummary`, `ArtworkSummaryWithMuseum`, `ArtworkDetail`:
  `year_created` + `year_end`, `image_url`

**해소 조건**: `/museums/{id}/artworks` API의 필드명 변환을 원복하여 전
엔드포인트 통일. 이후 프론트 Types 통합.

**영향 범위**: `src/types/artwork.ts`,
`src/components/museum/MuseumArtworkGallery.tsx`

---

### 부채 #6 — `opening_hours` / `admission` jsonb 구조 미정의

**현황**: DB의 `places.opening_hours`와 `places.admission`은 jsonb 컬럼이나 내부
구조가 공식 정의되어 있지 않습니다. API는 이 jsonb 값을 그대로 반환합니다.

**임시 대응**: 프론트 Types에서 해당 필드를 `Record<string, unknown> | null`
형태로 느슨하게 정의하고, 렌더링 시 방어적 처리합니다. 데이터가 없으면 해당
섹션을 숨깁니다.

**해소 조건**: DB 데이터 표준 구조 합의 및 Spec에 sub-schema 명시. 기존 데이터
마이그레이션.

**영향 범위**: `src/types/museum.ts`, `src/components/museum/MuseumInfo.tsx`

---

### 부채 #7 — 다국어 표기 매핑 유틸의 범위 제한

**현황**: 국가명 한국어 표시를 위해 `src/lib/country-names.ts`의 매핑 테이블을
사용합니다. 테이블에 없는 국가 코드가 들어오면 코드 자체를 반환합니다.

**임시 대응**: MVP 범위 미술관 30곳이 속한 국가(약 15개)만 매핑 테이블에
포함합니다. 도시명은 매핑 없이 API 반환값(영문) 그대로 표시합니다.

**해소 조건**: 다국어 컬럼을 DB 레벨에서 지원할지, 매핑 테이블을 확장할지에 대한
제품 방향 결정.

**영향 범위**: `src/lib/country-names.ts`, 미술관·작품·화가 전 도메인 UI

---

## 재평가 프로세스

MVP 출시 이후 아래 시점 중 가장 먼저 도래하는 시점에 본 문서를 재검토합니다:

- MAU 500명 도달 시점 (PRD 성공 지표)
- MVP 출시 후 1개월 경과 시점
- 사용자 피드백에서 특정 부채 관련 불만이 반복 제기되는 시점

재평가 결과에 따라 각 항목은 다음 중 하나로 분류됩니다:

- **해소 진행**: Spec v2.1.0 또는 v3.0.0 협의 대상
- **유지**: 실제 사용자 니즈가 확인되지 않아 현 상태 유지
- **폐기**: 대체 UX로 해결되어 원래 계획 폐기

---

## 본 문서의 위상

본 문서는 "MVP 단계에서 의도적으로 연기된 항목의 공식 기록"입니다. 누락이나
오류가 아니며, **품질 저하가 아닌 범위 관리의 결과**입니다.

본 문서에 기록되지 않은 추가 부채가 개발 중 발견되면 본 문서에 항목을
추가합니다.
