# ArtMap OpenAPI Spec Authoring Guide

Version: 2.0.0 Last updated: 2026-05-15

본 가이드는 ArtMap OpenAPI 명세서 작성 규칙을 정의한다. 명세서는 인터페이스
계약(파라미터, 응답 스키마, 에러)만을 다루며, 배경·의사결정·이력은 별도 노션
페이지(ArtMap API Reference Notes)에서 관리한다.

본 문서에서 "OpenAPI 스키마"는 spec의 `components/schemas` 정의를 의미하며, DB
스키마(PostgreSQL namespace)나 ERD와는 다른 개념이다.

API spec 작성·확장 시 따르는 규칙. spec과 본 가이드가 충돌하면 가이드를 우선해
spec을 수정한다.

## 1. 엔드포인트 description 작성

모든 엔드포인트의 `description`은 아래 템플릿 순서를 따른다. 해당 없는 블록은
생략하되, 존재하는 블록 간 순서는 변경 금지.

```
한 줄 요약 (자유 텍스트)

[규칙]  (선택)
API 동작 분기, 파라미터 우선순위 등

[참고]  (선택)
다른 엔드포인트와의 관계 등
```

- **한 줄 요약**: 필수. 엔드포인트의 동작을 한 줄로 요약한다.
- **`[규칙]`**: 선택. API 동작 분기, 파라미터 우선순위 등 인터페이스 계약 자체에
  속하는 규칙만 기술한다. 설계 배경, 캐싱·인덱스 구현 가이드, 성능 최적화 DDL,
  데이터 정합성 보장 정책 등 인터페이스 계약 외 정보는 포함하지 않는다.
- **`[참고]`**: 선택. 다른 엔드포인트와의 관계, 병렬 호출 패턴 등
- 위 2개 라벨(`[규칙]`, `[참고]`) 외 사용 금지

## 2. 네이밍 규칙

### 2.1 필드명

| 규칙                           | 예시                                                             | 비고                                                                                                       |
| ------------------------------ | ---------------------------------------------------------------- | ---------------------------------------------------------------------------------------------------------- |
| snake_case                     | `artwork_count`, `country_code`                                  | camelCase 금지                                                                                             |
| 이중 언어 접미사 `_ko` / `_en` | `name_ko`, `title_en`                                            | 한/영 분리 필요 텍스트 필드에 적용                                                                         |
| 이미지 URL                     | 모든 도메인에서 `image_url` 사용                                 | `thumbnail_url`, `image_small` 등 변형 추가 금지. 크기 변형은 query param이나 image CDN URL param으로 처리 |
| 연도                           | 인물: `birth_year`/`death_year`, 작품: `year_created`/`year_end` | 도메인별 의미 명확화                                                                                       |
| ID 참조                        | `artist_id`, `museum_id`                                         | `{entity}_id` 형태, `format: uuid`                                                                         |
| 집계                           | `artwork_count`, `artists_total`                                 | `_count`(목록 집계), `_total`(검색 전체 매칭)                                                              |
| 좌표                           | `latitude`, `longitude`                                          | `lat`/`lon` 약어 금지                                                                                      |
| 날짜                           | `start_date`, `end_date`                                         | `format: date`                                                                                             |
| 타임스탬프                     | `created_at`, `updated_at`                                       | `format: date-time`                                                                                        |

### 2.2 operationId

| 패턴             | 형식                    | 예시                                     |
| ---------------- | ----------------------- | ---------------------------------------- |
| 목록 조회        | `get{Entities}`         | `getMuseums`, `getArtworks`              |
| 상세 조회        | `get{Entity}ById`       | `getMuseumById`, `getArtistById`         |
| 하위 리소스 목록 | `get{Parent}{Children}` | `getMuseumArtworks`, `getArtistArtworks` |
| 특수 데이터      | `get{Parent}{DataType}` | `getArtistMapData`                       |
| 검색             | `search`                | 단일 통합 검색                           |

camelCase 사용. 동사는 `get`/`create`/`update`/`delete`로 통일.

### 2.3 path 파라미터

- 리소스 식별자는 `{id}`를 사용한다 (`{museumId}` 아님).
- 하위 리소스 경로: `/{parents}/{id}/{children}` (예: `/museums/{id}/artworks`)

### 2.4 query 파라미터

#### 2.4-A 공통 쿼리 파라미터

반드시 이 이름·형식을 사용한다.

| 파라미터   | 용도                  | 비고                                  |
| ---------- | --------------------- | ------------------------------------- |
| `page`     | 페이지 번호           | minimum: 1, default: 1                |
| `per_page` | 페이지당 건수         | minimum: 1, maximum: 100, default: 20 |
| `limit`    | 미리보기 최대 반환 수 | page와 공존 시 limit 우선             |
| `sort`     | 정렬 기준             | enum으로 허용 값 제한                 |
| `q`        | 검색어                | minLength: 2                          |

#### 2.4-B 도메인별 필터 파라미터

아래는 명명 패턴 예시. 도메인 확장에 따라 자유롭게 추가 가능.

| 파라미터  | 용도               | 비고                                       |
| --------- | ------------------ | ------------------------------------------ |
| `country` | 국가 코드 필터     | ISO 3166-1 alpha-2, minLength/maxLength: 2 |
| `type`    | 검색 카테고리 필터 | enum: all, artist, artwork, museum         |

### 2.5 OpenAPI 스키마명

| 패턴                        | 설명                               | 예시                                          |
| --------------------------- | ---------------------------------- | --------------------------------------------- |
| `{Entity}`                  | 상세 페이지용 전체 스키마 (기본형) | `Museum`, `Artwork`                           |
| `{Entity}Summary`           | 목록 카드용 경량 스키마            | `MuseumSummary`, `ArtistSummary`              |
| `{Entity}SummaryWith{확장}` | Summary에 추가 필드 포함           | `ArtworkSummaryWithMuseum`                    |
| `{도메인}{용도}`            | 특수 목적 스키마                   | `CountryMapData`, `ArtistCountryDistribution` |

## 3. 스키마 설계

1. **required 명시** — 반드시 존재하는 필드는 `required` 배열에 나열. 최소한
   `id`와 도메인 핵심 필드는 required.
2. **nullable 명시** — 값이 없을 수 있는 필드에는 `nullable: true` 필수. 생략 =
   not nullable.
3. **ERD 주석** — 모든 property description에 `"ERD: table.column"` 형식 명시.
   파생 필드는 `"ERD 직접 대응 없음. {변환 방식}."`.
4. **format 지정** — UUID: `format: uuid`, URL: `format: uri`, 날짜:
   `format: date`.
5. **enum 고정** — 닫힌 집합은 반드시 `enum` 정의. 새 값 추가 시
   [섹션 7](#7-enum--어휘-사전) 먼저 갱신.
6. **enum 의미 명시** — enum을 정의하는 모든 스키마 property에서 `description`
   필드에 각 값의 의미를 직접 기술한다. 동일 enum이 여러 스키마에서 재사용되는
   경우, `components/schemas`에 별도 정의 후 `$ref`로 참조한다.

```yaml
# 권장 패턴
institution_type:
  type: string
  description: |
    ERD: institutions.institution_type
    - museum: 미술관
    - gallery: 갤러리
    - private_collection: 개인 소장
    - foundation: 재단
  enum: [museum, gallery, private_collection, foundation]
```

**인라인 vs $ref**: 재사용 스키마는 `components/schemas`에 정의 후 `$ref` 참조.
단일 엔드포인트 전용 중첩 객체만 인라인 허용. 동일 구조가 2개 이상
엔드포인트에서 반복되면 즉시 추출.

## 4. 목록·페이지네이션 응답

페이지네이션 목록 엔드포인트는 아래 래퍼 사용. 4개 필드 모두 필수.

```yaml
type: object
properties:
  data:
    type: array
    items:
      $ref: "#/components/schemas/{Schema}"
  total:
    type: integer
  page:
    type: integer
    nullable: true
    description: "limit 모드에서는 null"
  per_page:
    type: integer
    nullable: true
    description: "limit 모드에서는 null"
```

**예외**: 집계 전용 엔드포인트(예: `/map/countries`, `/artists/{id}/map-data`)는
래퍼 없이 `type: array` 허용.

**limit/page 우선순위**:

1. `limit` 존재 → `page`/`per_page` 무시, 상위 N건 반환. 응답의
   `page`/`per_page`는 `null`
2. `limit` 없음 → `page`/`per_page` 기준 페이지네이션
3. 동시 전달 → `limit`만 적용

적용 대상: `/museums/{id}/artworks`, `/artists/{id}/artworks`

**`/search` 특수 규칙**: `limit`만 사용 → 자동완성 모드(카테고리별 상위 N건).
`page` 사용 → 더 보기 모드(`limit` 무시, `type`으로 카테고리 지정).

## 5. 에러 응답

### 5.1 RFC 9457 (Problem Details)

모든 에러 응답은 `application/problem+json` Content-Type으로 `ProblemDetail`
스키마를 반환한다.

```yaml
ProblemDetail:
  type: object
  properties:
    type: # URI — 에러 종류 식별자 (고정값)
    title: # 에러 종류 제목 (고정값)
    status: # HTTP 상태 코드
    detail: # 이번 발생의 구체적 설명 (가변값)
    instance: # 에러 발생 요청 URI (가변값)
```

### 5.2 에러 URI 네이밍

| 패턴                                     | 예시                                  |
| ---------------------------------------- | ------------------------------------- |
| `https://artmap.com/errors/{error-type}` | `https://artmap.com/errors/not-found` |

error-type은 kebab-case, HTTP 상태 텍스트와 일치.

### 5.3 공통 에러 응답 (components/responses)

| 이름                  | 상태코드 | 적용 범위                                        |
| --------------------- | -------- | ------------------------------------------------ |
| `NotFound`            | 404      | `{id}` path 파라미터가 있는 모든 상세 엔드포인트 |
| `InternalServerError` | 500      | **모든** 엔드포인트에 필수 포함                  |
| `TooManyRequests`     | 429      | Rate Limiting 적용 엔드포인트 (현재: `/search`)  |

### 5.4 에러 응답 포함 규칙

| 엔드포인트 유형                | 필수 에러 응답              |
| ------------------------------ | --------------------------- |
| 목록 조회 (필터 없는 경우)     | 500                         |
| 목록 조회 (path에 `{id}` 포함) | 404, 500                    |
| 상세 조회                      | 404, 500                    |
| 검색                           | 400 (검색어 검증), 429, 500 |

### 5.5 인라인 에러 vs $ref 에러

- 공통 에러(404, 429, 500)는 반드시 `$ref: "#/components/responses/{Name}"`으로
  참조.
- 엔드포인트 고유 에러(예: `/search`의 400)만 인라인 허용. `ProblemDetail`
  스키마는 `$ref`, `example`만 인라인.

## 6. 변경 마커와 버전

### 6.1 변경 마커

변경 마커는 다음 5개만 허용한다. 적용 위치에 관계없이 동일 형식.

| 마커                  | 의미                               | 사용 시점                     |
| --------------------- | ---------------------------------- | ----------------------------- |
| `[ADDED vX.Y.Z]`      | 신규 엔드포인트/스키마/필드 추가   | 이전 버전에 없던 항목         |
| `[UPDATED vX.Y.Z]`    | 기존 항목의 동작·규칙·필드 변경    | 의미가 바뀌는 변경            |
| `[DEPRECATED vX.Y.Z]` | 폐기 예고                          | 다음 major 버전에서 제거 예정 |
| `[REMOVED vX.Y.Z]`    | 제거                               | major 버전에서 실제 제거      |
| `[FIXED vX.Y.Z]`      | 기존 부정합을 가이드 기준으로 정리 | 다른 변경과 함께 정리 시      |

**적용 위치별 형식**:

- path 주석: `# [ADDED v1.4.0]` 또는 `# [UPDATED v1.4.0]`
- description 본문: `[UPDATED v1.4.0 — 변경 제목]` (제목 한 줄, 본문에 이유와
  구현 가이드)
- schema 주석: `# [UPDATED v1.4.0]` (단독 버전 표기 금지, 반드시 마커명 명시)

### 6.2 semver 규칙

| 변경 유형                            | 버전 변경 |
| ------------------------------------ | --------- |
| 신규 엔드포인트 추가                 | minor     |
| 기존 엔드포인트에 파라미터/필드 추가 | minor     |
| description 보강, 오타 수정          | patch     |
| 하위 호환 깨지는 변경                | major     |

## 7. enum / 어휘 사전

spec에서 사용하는 모든 enum 값과 고정 어휘의 마스터 사전. 새 enum 추가 시 이
섹션을 먼저 갱신하고, spec yaml에서는 각 property의 description에 의미를 직접
명시해야 한다([섹션 3](#3-스키마-설계) 참조).

### 7.1 artworks.status

| 값                  | 의미        |
| ------------------- | ----------- |
| `on_display`        | 전시 중     |
| `in_storage`        | 수장고 보관 |
| `on_loan`           | 대여 중     |
| `under_restoration` | 복원 중     |

### 7.2 institutions.institution_type

| 값                   | 의미      |
| -------------------- | --------- |
| `museum`             | 미술관    |
| `gallery`            | 갤러리    |
| `private_collection` | 개인 소장 |
| `foundation`         | 재단      |

### 7.3 search type

| 값        | 의미                   |
| --------- | ---------------------- |
| `all`     | 전체 카테고리 (기본값) |
| `artist`  | 화가만                 |
| `artwork` | 작품만                 |
| `museum`  | 미술관만               |

### 7.4 sort 파라미터 값

| 엔드포인트      | 허용 값                                            | 기본값     |
| --------------- | -------------------------------------------------- | ---------- |
| `GET /artists`  | `name_asc`, `birth_year_asc`, `artwork_count_desc` | `name_asc` |
| `GET /artworks` | `year_asc`, `year_desc`, `title_asc`               | `year_asc` |

> **네이밍 규칙**: `{기준필드}_{방향}` 형식. 방향은 `asc` 또는 `desc`.

### 7.5 에러 type URI

| 에러                      | URI                                               |
| ------------------------- | ------------------------------------------------- |
| 400 Bad Request           | `https://artmap.com/errors/bad-request`           |
| 404 Not Found             | `https://artmap.com/errors/not-found`             |
| 429 Too Many Requests     | `https://artmap.com/errors/too-many-requests`     |
| 500 Internal Server Error | `https://artmap.com/errors/internal-server-error` |
