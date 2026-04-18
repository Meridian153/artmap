# Step A 전수 조사 보고서 — Spec v2.0.0 재정비

> 작성일: 2026-04-18 범위: OpenAPI Spec v1.3.0 vs 실제 API 구현(백엔드
> `src/app/api/v1/`) vs 프론트 타입(`src/types/`)의 세 진실 대조 성격: 읽기 전용
> 감사. 본 보고서는 근거 자료이며 코드 수정 지시를 포함하지 않는다.

## 섹션 0 — 전체 요약

- **구현 개수**: 11/11 엔드포인트 모두 `src/app/api/v1/` 아래 `route.ts` 존재.
  백엔드 미구현 없음.
- **필드 불일치 총 개수**: 약 **60여 개** (섹션 2 집계 기준). 타입/API/Spec 중
  둘 이상이 어긋나는 필드만 헤아림.
- **가장 심각한 불일치 Top 3**:
  1. **프론트 타입이 요구하는 `*_ko`/`*_en` 페어 필드를 API는 하나도 반환하지
     않음.** `city_ko/city_en`, `country_ko/country_en`,
     `nationality_ko/nationality_en` 등이 모든 도메인(museum, artist, artwork,
     search)에 퍼져 있음. API는 `city`(단일), `country_code`,
     `nationality`(단일)만 반환.
  2. **`ArtworkDetail`의 `year_label`/`ArtworkSummary`의
     `year_label`·`thumbnail_url` 필드명 미스매치.** Spec과 API는
     `year_created: integer`, `image_url`. 프론트 타입은 `year_label: string`,
     `thumbnail_url`. `museums/[id]/artworks` route.ts만 유일하게
     `year_label`/`thumbnail_url`로 변환해서 반환함 (의도된 것인지 불명).
  3. **`ArtistDetail.movements` vs `ArtistDetail.style_ko/style_en`.**
     Spec·API는 `movements: []` 배열(사조 다대다)을 반환. 프론트 타입은
     `style_ko/style_en`(단일 문자열). 완전 별개의 모델링.

---

## 섹션 1 — 엔드포인트별 상세

### 1. GET /map/countries

구현 상태:

- Spec 정의: 있음 (`CountryMapData`)
- API Route: 있음 — `src/app/api/v1/map/countries/route.ts`
- 프론트 타입: 있음 — `src/types/map.ts` (`CountryMapData`)

필드 비교:

| 필드명          | Spec    | API 반환 | Types  | 실사용                                   | 라벨                    |
| --------------- | ------- | -------- | ------ | ---------------------------------------- | ----------------------- |
| country_code    | string  | string   | string | HomeMap, CountryBubble, ArtistCountryMap | 일치                    |
| country_name_ko | string  | string   | string | CountryBubble title, HomeMap 선택 레이블 | 일치                    |
| country_name_en | string  | string   | string | CountryBubble title                      | 일치                    |
| artwork_count   | integer | integer  | number | CountryBubble 크기/라벨                  | 일치                    |
| latitude        | float   | float    | —      | (COUNTRY_COORDS 하드코딩 사용)           | 타입 누락 (유형 C)      |
| longitude       | float   | float    | —      | (COUNTRY_COORDS 하드코딩 사용)           | 타입 누락 (유형 C)      |
| museum_count    | —       | —        | number | (미사용)                                 | 타입에만 존재 (유형 D') |

주요 불일치:

- API는 `latitude`/`longitude`를 `AVG(p.latitude/longitude)`로 계산해 반환하지만
  Types는 이를 정의하지 않음. 프론트는 대신 `CountryBubble.tsx`의
  `COUNTRY_COORDS` 하드코딩 매핑을 사용. API의 좌표 값은 현재 버려지고 있음.
- `museum_count`는 Types에만 존재하고 API는 반환하지 않으며, 실사용도 확인되지
  않음.

### 2. GET /museums

구현 상태:

- Spec 정의: 있음 (`MuseumSummary`)
- API Route: 있음 — `src/app/api/v1/museums/route.ts`
- 프론트 타입: 있음 — `src/types/museum.ts` (`MuseumSummary`)

필드 비교:

| 필드명           | Spec    | API     | Types   | 실사용                 | 라벨                    |
| ---------------- | ------- | ------- | ------- | ---------------------- | ----------------------- |
| id               | uuid    | string  | string  | HomeMap key/라우팅     | 일치                    |
| name_ko          | string  | string  | string  | MuseumMarker title     | 일치                    |
| name_en          | string  | string  | string  | -                      | 일치                    |
| institution_type | enum    | string  | —       | -                      | 타입 누락 (유형 C)      |
| country_code     | string  | string  | string  | HomeMap highlight 비교 | 일치                    |
| city             | string  | string  | —       | -                      | 타입 누락 (유형 A)      |
| city_ko          | —       | —       | string  | Mock 필터링            | 타입에만 존재 (유형 A)  |
| city_en          | —       | —       | string  | Mock 필터링            | 타입에만 존재 (유형 A)  |
| country_ko       | —       | —       | string  | Mock 필터링            | 타입에만 존재 (유형 A)  |
| country_en       | —       | —       | string  | Mock 필터링            | 타입에만 존재 (유형 A)  |
| latitude         | float   | float   | number  | MuseumMarker           | 일치                    |
| longitude        | float   | float   | number  | MuseumMarker           | 일치                    |
| artwork_count    | integer | integer | number  | -                      | 일치                    |
| thumbnail_url    | —       | —       | string? | (미사용)               | 타입에만 존재 (유형 D') |

주요 불일치:

- API는 `city` 단일 필드를 반환, Types는 `city_ko/city_en/country_ko/country_en`
  4필드를 요구. 완전 다른 모델.
- `institution_type`은 API가 반환하지만 Types가 선언하지 않음.
- `thumbnail_url`은 Spec/API 모두 없으나 Types에 존재.

### 3. GET /museums/{id}

구현 상태:

- Spec 정의: 있음 (`MuseumDetail`, `PlaceInfo`)
- API Route: 있음 — `src/app/api/v1/museums/[id]/route.ts`
- 프론트 타입: 있음 — `src/types/museum.ts` (`MuseumDetail`, `PlaceInfo`)

필드 비교 (상위 객체):

| 필드명           | Spec    | API     | Types   | 실사용             | 라벨                    |
| ---------------- | ------- | ------- | ------- | ------------------ | ----------------------- |
| id               | uuid    | string  | string  | 페이지 라우팅      | 일치                    |
| name_ko          | string  | string  | string  | MuseumHero/Gallery | 일치                    |
| name_en          | string  | string  | string  | MuseumHero         | 일치                    |
| institution_type | enum    | string  | —       | -                  | 타입 누락 (유형 C)      |
| country_code     | string  | string  | —       | -                  | 타입 누락 (유형 C)      |
| description_ko   | string? | string? | string? | MuseumInfo         | 일치                    |
| description_en   | string? | string? | string? | -                  | 일치                    |
| website          | string? | string? | —       | -                  | 이름 다름 (유형 A)      |
| website_url      | —       | —       | string? | MuseumInfo (href)  | 이름 다름 (유형 A)      |
| artwork_count    | —       | —       | number  | (미사용)           | 타입에만 존재 (유형 D') |
| thumbnail_url    | —       | —       | string? | (미사용)           | 타입에만 존재 (유형 D') |
| place            | object  | object  | object  | MuseumHero/Map     | 하위 구조 상이 (유형 E) |

필드 비교 (place 중첩):

| 필드명        | Spec       | API        | Types             | 실사용                | 라벨                   |
| ------------- | ---------- | ---------- | ----------------- | --------------------- | ---------------------- |
| name_ko       | string?    | string?    | —                 | -                     | 타입 누락 (유형 C)     |
| name_en       | string?    | string?    | —                 | -                     | 타입 누락 (유형 C)     |
| country       | string     | string     | —                 | -                     | 타입 누락 (유형 A)     |
| city          | string     | string     | —                 | -                     | 타입 누락 (유형 A)     |
| city_ko       | —          | —          | string            | MuseumHero            | 타입에만 존재 (유형 A) |
| city_en       | —          | —          | string            | -                     | 타입에만 존재 (유형 A) |
| country_ko    | —          | —          | string            | MuseumHero            | 타입에만 존재 (유형 A) |
| country_en    | —          | —          | string            | -                     | 타입에만 존재 (유형 A) |
| country_code  | —          | —          | string            | -                     | 타입에만 존재          |
| address       | string?    | string?    | string?           | MuseumLocationMap     | 일치                   |
| latitude      | float      | float      | number            | MuseumLocationMap     | 일치                   |
| longitude     | float      | float      | number            | MuseumLocationMap     | 일치                   |
| opening_hours | jsonb obj? | jsonb obj? | string[]?         | MuseumInfo (map line) | 타입 다름 (유형 B)     |
| admission     | jsonb obj? | jsonb obj? | `{adult,notes?}?` | MuseumInfo            | 타입 다름 (유형 B)     |

주요 불일치:

- **`website` vs `website_url`** — 프론트는 `museum.website_url`을 사용, API는
  `website`로 반환. 현재 실제 API 모드에서 링크가 렌더되지 않음.
- **`place.opening_hours`**: Spec/API는 `jsonb object`, Types는 `string[]`.
  프론트는 `place.opening_hours.map(...)`로 배열 가정.
- **`place.admission`**: Spec/API는 자유 `jsonb`, Types는 `{adult, notes?}` 고정
  구조. 실제 DB 필드 형상에 따라 매칭 실패 가능.
- **`city`·`country` 페어 누락**: Types는 `city_ko/en` 4필드를 요구, API는
  `city` 단일·`country`만.

### 4. GET /museums/{id}/artworks

구현 상태:

- Spec 정의: 있음 (`ArtworkSummary`)
- API Route: 있음 — `src/app/api/v1/museums/[id]/artworks/route.ts`
- 프론트 타입: 있음 — `src/types/artwork.ts` (`MuseumArtworkSummary`,
  `ArtworkSummary`)

필드 비교 (data 항목):

| 필드명        | Spec    | API                           | Types (MuseumArtworkSummary) | 실사용             | 라벨                                    |
| ------------- | ------- | ----------------------------- | ---------------------------- | ------------------ | --------------------------------------- |
| id            | uuid    | string                        | string                       | Gallery key/href   | 일치                                    |
| title_ko      | string  | string                        | string                       | Gallery            | 일치                                    |
| title_en      | string  | string                        | string                       | -                  | 일치                                    |
| year_created  | int?    | — (year_label로 변환)         | —                            | -                  | 이름 다름 (유형 A)                      |
| year_label    | —       | string? (year_created→String) | string?                      | Gallery 표시       | 이름 다름 (유형 A)                      |
| image_url     | string? | — (thumbnail_url로 변환)      | —                            | -                  | 이름 다름 (유형 A)                      |
| thumbnail_url | —       | string?                       | string?                      | (본 컴포는 미사용) | 이름 다름 (유형 A)                      |
| status        | enum    | string                        | ArtworkStatus                | -                  | 일치 (enum에 `unknown` 추가됨, 유형 D') |
| artist        | obj?    | obj?                          | obj?                         | Gallery            | 하위 일치                               |

주요 불일치:

- **이 엔드포인트만** API가 `year_label`/`thumbnail_url`로 리네이밍해 반환.
  `year_created !== null ? String(year_created) : null` (route.ts:108) 식 변환.
  그러나 Spec은 `ArtworkSummary`에서 `year_created: integer`, `image_url` 고정.
- Types `ArtworkStatus`에 `"unknown"`이 추가되어 있으나 Spec/DB enum에는 없음.

### 5. GET /artists

구현 상태:

- Spec 정의: 있음 (`ArtistSummary`)
- API Route: 있음 — `src/app/api/v1/artists/route.ts`
- 프론트 타입: 있음 — `src/types/artist.ts` (`ArtistSummary`)

필드 비교:

| 필드명         | Spec    | API     | Types   | 실사용      | 라벨                   |
| -------------- | ------- | ------- | ------- | ----------- | ---------------------- |
| id             | uuid    | string  | string  | -           | 일치                   |
| name_ko        | string  | string  | string  | -           | 일치                   |
| name_en        | string  | string  | string  | -           | 일치                   |
| birth_year     | int?    | int?    | int?    | -           | 일치                   |
| death_year     | int?    | int?    | int?    | -           | 일치                   |
| nationality    | string? | string? | —       | -           | 타입 누락 (유형 A)     |
| nationality_ko | —       | —       | string  | Mock 필터링 | 타입에만 존재 (유형 A) |
| nationality_en | —       | —       | string  | Mock 필터링 | 타입에만 존재 (유형 A) |
| thumbnail_url  | string? | string? | string? | -           | 일치                   |
| movements      | array   | array   | —       | -           | 타입 누락 (유형 C)     |
| artwork_count  | int?    | int     | number  | -           | 일치                   |

주요 불일치:

- API는 `nationality` 단일, Types는 `nationality_ko/en` 페어.
- `movements` 배열을 API가 반환하지만 Types에 없음. 실제로 아티스트 카드
  목록에서 사조를 표시할 수 없음.

### 6. GET /artists/{id}

구현 상태:

- Spec 정의: 있음 (`ArtistDetail`)
- API Route: 있음 — `src/app/api/v1/artists/[id]/route.ts`
- 프론트 타입: 있음 — `src/types/artist.ts` (`ArtistDetail`)

필드 비교:

| 필드명         | Spec                                             | API     | Types   | 실사용                       | 라벨                    |
| -------------- | ------------------------------------------------ | ------- | ------- | ---------------------------- | ----------------------- |
| id             | uuid                                             | string  | string  | 페이지 라우팅                | 일치                    |
| name_ko        | string                                           | string  | string  | ArtistHero, 메타             | 일치                    |
| name_en        | string                                           | string  | string  | ArtistHero                   | 일치                    |
| birth_year     | int?                                             | int?    | int?    | ArtistHero lifeSpan          | 일치                    |
| death_year     | int?                                             | int?    | int?    | ArtistHero lifeSpan          | 일치                    |
| nationality    | string?                                          | string? | —       | -                            | 타입 누락 (유형 A)      |
| nationality_ko | —                                                | —       | string  | ArtistHero                   | 타입에만 존재 (유형 A)  |
| nationality_en | —                                                | —       | string  | -                            | 타입에만 존재 (유형 A)  |
| bio_ko         | string?                                          | string? | —       | -                            | 이름 다름 (유형 A)      |
| bio_en         | string?                                          | string? | —       | -                            | 이름 다름 (유형 A)      |
| biography_ko   | —                                                | —       | string? | ArtistInfo, generateMetadata | 이름 다름 (유형 A)      |
| biography_en   | —                                                | —       | string? | -                            | 이름 다름 (유형 A)      |
| thumbnail_url  | string?                                          | string? | string? | -                            | 일치                    |
| movements      | array<{name_ko,name_en,period_start,period_end}> | array   | —       | -                            | 타입 누락 (유형 C, E)   |
| style_ko       | —                                                | —       | string? | ArtistInfo                   | 타입에만 존재 (유형 E)  |
| style_en       | —                                                | —       | string? | -                            | 타입에만 존재 (유형 E)  |
| artwork_count  | —                                                | —       | number  | ArtistInfo                   | 타입에만 존재 (유형 D') |

주요 불일치:

- **`bio_ko` vs `biography_ko`** 이름 차이. 실제 API 모드 시 `biography_ko`가
  undefined이므로 `ArtistInfo`의 약력 섹션이 렌더되지 않음.
- **`movements` 배열(다대다) vs `style_ko` 단일 문자열** — 개념 레벨에서 다름.
  프론트가 사조를 단일 스타일로 취급하고 있음.
- **`artwork_count`**: 프론트가 상세에서 기대하지만 API
  `artists/[id]/route.ts`는 반환하지 않음. 이 엔드포인트의 Spec도 정의하지 않음.

### 7. GET /artists/{id}/artworks

구현 상태:

- Spec 정의: 있음 (`ArtworkSummaryWithMuseum`)
- API Route: 있음 — `src/app/api/v1/artists/[id]/artworks/route.ts`
- 프론트 타입: 있음 — `src/types/artwork.ts` (`ArtworkSummaryWithMuseum`)

필드 비교 (data 항목):

| 필드명         | Spec    | API                   | Types (base `ArtworkSummary`)                                              | 실사용                     | 라벨               |
| -------------- | ------- | --------------------- | -------------------------------------------------------------------------- | -------------------------- | ------------------ |
| id             | uuid    | string                | string                                                                     | Gallery key/href           | 일치               |
| title_ko       | string  | string                | string                                                                     | Gallery                    | 일치               |
| title_en       | string  | string                | string                                                                     | Gallery                    | 일치               |
| year_created   | int?    | int?                  | —                                                                          | -                          | 이름 다름 (유형 A) |
| year_label     | —       | —                     | string?                                                                    | (Gallery에서 미사용)       | 이름 다름 (유형 A) |
| image_url      | string? | string?               | —                                                                          | -                          | 이름 다름 (유형 A) |
| thumbnail_url  | —       | —                     | string?                                                                    | -                          | 이름 다름 (유형 A) |
| status         | enum    | string                | ArtworkStatus                                                              | -                          | 일치               |
| museum_name_ko | string? | string?               | —                                                                          | -                          | 구조 다름 (유형 E) |
| museum_name_en | string? | string?               | —                                                                          | -                          | 구조 다름 (유형 E) |
| artist         | —       | — (이 route는 미반환) | object                                                                     | -                          | API 누락 (유형 C)  |
| current_museum | —       | —                     | `{id,name_ko,name_en,city_ko,city_en,country_ko,country_en,country_code}?` | Gallery name_ko/country_ko | 구조 다름 (유형 E) |

주요 불일치:

- Spec·API는 `museum_name_ko`/`museum_name_en` 평면 필드. 프론트 Types는
  `current_museum` 객체로 묶고 그 안에 `id`·`city_*`·`country_*` 등 API가 전혀
  반환하지 않는 필드 요구.
- `ArtworkSummary` 기반 타입이 `artist: { id, name_ko, name_en }`(필수)를
  요구하는데 이 route의 API는 artist 객체 자체를 반환하지 않음.
- 프론트 실사용은 `current_museum?.name_ko` 등으로 옵셔널 체이닝되어 있어 렌더는
  되지만 값이 비어버리는 상태.

### 8. GET /artists/{id}/map-data

구현 상태:

- Spec 정의: 있음 (`ArtistCountryDistribution`)
- API Route: 있음 — `src/app/api/v1/artists/[id]/map-data/route.ts`
- 프론트 타입: 있음 — `src/types/artist.ts` (`ArtistCountryDistribution`)

필드 비교:

| 필드명          | Spec   | API    | Types  | 실사용                                 | 라벨               |
| --------------- | ------ | ------ | ------ | -------------------------------------- | ------------------ |
| country_code    | string | string | string | ArtistCountryMap (COUNTRY_COORDS 조회) | 일치               |
| country_name_ko | string | string | string | 툴팁/캡션                              | 일치               |
| country_name_en | string | string | string | 툴팁                                   | 일치               |
| artwork_count   | int    | int    | number | 버블 크기/캡션                         | 일치               |
| latitude        | float  | float  | —      | -                                      | 타입 누락 (유형 C) |
| longitude       | float  | float  | —      | -                                      | 타입 누락 (유형 C) |

주요 불일치:

- API가 `latitude/longitude`를 계산해 반환하지만 Types가 정의하지 않음. 프론트는
  `COUNTRY_COORDS` 하드코딩 사용(`/map/countries`와 동일 이슈).

### 9. GET /artworks

구현 상태:

- Spec 정의: 있음 (`ArtworkSummaryWithMuseum`)
- API Route: 있음 — `src/app/api/v1/artworks/route.ts`
- 프론트 타입: 있음 — `src/types/artwork.ts` (`ArtworkSummaryWithMuseum`)
- API 클라이언트: `getArtworks` 존재

필드 비교는 **#7과 동일**한 응답 스키마(`ArtworkSummaryWithMuseum`)를 사용.
API는 `museum_name_ko/en` 평면 반환, Types는 `current_museum` 객체 요구. 불일치
패턴 동일.

주요 불일치:

- `museum_name_*` 평면 vs `current_museum` 중첩 구조 (유형 E).
- `year_created` vs `year_label`, `image_url` vs `thumbnail_url` (유형 A).
- `artist` 객체는 API가 미반환, Types 필수 (유형 C).

### 10. GET /artworks/{id}

구현 상태:

- Spec 정의: 있음 (`ArtworkDetail`)
- API Route: 있음 — `src/app/api/v1/artworks/[id]/route.ts`
- 프론트 타입: 있음 — `src/types/artwork.ts` (`ArtworkDetail`)

필드 비교 (상위):

| 필드명           | Spec    | API     | Types          | 실사용                    | 라벨                                   |
| ---------------- | ------- | ------- | -------------- | ------------------------- | -------------------------------------- |
| id               | uuid    | string  | string         | -                         | 일치                                   |
| title_ko         | string  | string  | string         | ArtworkHero               | 일치                                   |
| title_en         | string  | string  | string         | ArtworkHero               | 일치                                   |
| year_created     | int?    | int?    | —              | -                         | 이름 다름 (유형 A)                     |
| year_end         | int?    | int?    | —              | -                         | 타입 누락 (유형 C)                     |
| year_label       | —       | —       | string?        | ArtworkHero 표시          | 이름 다름 (유형 A)                     |
| medium_ko        | string? | string? | string?        | ArtworkHero               | 일치                                   |
| medium_en        | string? | string? | string?        | -                         | 일치                                   |
| dimensions       | string? | string? | string?        | ArtworkHero               | 일치                                   |
| image_url        | string? | string? | string?        | ArtworkHero `<Image>`     | 일치                                   |
| is_public_domain | bool    | bool    | bool           | ArtworkHero               | 일치                                   |
| status           | enum    | string  | ArtworkStatus  | ArtworkHero badge         | 일치 (+`unknown` 추가됨)               |
| curation_ko      | string? | string? | string?        | ArtworkCuration, metadata | 일치                                   |
| curation_en      | string? | string? | string?        | -                         | 일치                                   |
| artist           | obj?    | obj?    | obj (non-null) | ArtworkHero               | 구조 다름 (유형 E, 유형 B nullability) |
| primary_museum   | obj?    | obj?    | obj?           | ArtworkHero Link, Map     | 하위 상이 (유형 E)                     |
| current_location | obj?    | obj?    | obj?           | ArtworkHero, Map          | 하위 상이 (유형 E)                     |

필드 비교 (artist 중첩):

| 필드명         | Spec   | API    | Types  | 실사용                 | 라벨                    |
| -------------- | ------ | ------ | ------ | ---------------------- | ----------------------- |
| id             | uuid   | string | string | Link href              | 일치                    |
| name_ko        | string | string | string | ArtworkHero name       | 일치                    |
| name_en        | string | string | string | -                      | 일치                    |
| nationality_ko | —      | —      | string | ArtworkHero artistMeta | 타입에만 존재 (유형 A)  |
| nationality_en | —      | —      | string | -                      | 타입에만 존재 (유형 A)  |
| birth_year     | —      | —      | int?   | ArtworkHero artistMeta | 타입에만 존재 (유형 D') |
| death_year     | —      | —      | int?   | ArtworkHero artistMeta | 타입에만 존재 (유형 D') |

필드 비교 (primary_museum 중첩):

| 필드명       | Spec   | API    | Types  | 실사용      | 라벨                   |
| ------------ | ------ | ------ | ------ | ----------- | ---------------------- |
| id           | uuid   | string | string | Link href   | 일치                   |
| name_ko      | string | string | string | ArtworkHero | 일치                   |
| name_en      | string | string | string | -           | 일치                   |
| city         | string | string | —      | -           | 타입 누락 (유형 A)     |
| city_ko      | —      | —      | string | -           | 타입에만 존재 (유형 A) |
| city_en      | —      | —      | string | -           | 타입에만 존재 (유형 A) |
| country_ko   | —      | —      | string | -           | 타입에만 존재 (유형 A) |
| country_en   | —      | —      | string | -           | 타입에만 존재 (유형 A) |
| country_code | string | string | string | -           | 일치                   |
| latitude     | float  | float  | number | LocationMap | 일치                   |
| longitude    | float  | float  | number | LocationMap | 일치                   |

필드 비교 (current_location 중첩):

| 필드명         | Spec   | API     | Types   | 실사용      | 라벨                   |
| -------------- | ------ | ------- | ------- | ----------- | ---------------------- |
| museum_id      | uuid?  | string? | string? | Link href   | 일치 (유형 E)          |
| museum_name_ko | string | string? | string  | ArtworkHero | 일치                   |
| museum_name_en | string | string? | string  | -           | 일치                   |
| city           | string | string? | —       | -           | 타입 누락 (유형 A)     |
| city_ko/en     | —      | —       | string  | -           | 타입에만 존재 (유형 A) |
| country_ko/en  | —      | —       | string  | -           | 타입에만 존재 (유형 A) |
| country_code   | string | string? | string  | -           | 일치                   |
| latitude       | float  | float?  | number  | LocationMap | 일치                   |
| longitude      | float  | float?  | number  | LocationMap | 일치                   |
| start_date     | date   | string  | string  | -           | 일치                   |
| end_date       | date?  | string? | string? | -           | 일치                   |

주요 불일치:

- **`year_end` 누락**: API는 반환하는데 Types에 없음. Types는 반대로
  `year_label`만 가짐.
- **`artist.nationality_*`, `artist.birth_year`, `artist.death_year`**: 프론트
  `ArtworkHero`가 실제로 렌더링하는 필드인데 Spec·API 모두 미반환. 실제 API
  모드에서는 `undefined` 렌더.
- **primary_museum/current_location의 `city_ko/en`·`country_ko/en`**도 동일
  유형.
- **artist nullable 차이**: Spec/API는 `nullable: true`, Types는 non-nullable.
  `ArtworkHero`는 `artwork.artist.id`를 옵셔널 체이닝 없이 사용해 artist null 시
  크래시 가능.

### 11. GET /search

구현 상태:

- Spec 정의: 있음 (`SearchResult`)
- API Route: 있음 — `src/app/api/v1/search/route.ts`
- 프론트 타입: 있음 — `src/types/search.ts` (`SearchResult`)
- 실사용: `SearchBar.tsx`는 정적 UI만 — search API 실사용 없음.

필드 비교 (상위):

| 필드명         | Spec   | API    | Types  | 실사용 | 라벨               |
| -------------- | ------ | ------ | ------ | ------ | ------------------ |
| query          | string | string | string | -      | 일치               |
| page           | int    | int    | —      | -      | 타입 누락 (유형 C) |
| per_page       | int    | int    | —      | -      | 타입 누락 (유형 C) |
| artists_total  | int    | int    | —      | -      | 타입 누락 (유형 C) |
| artworks_total | int    | int    | —      | -      | 타입 누락 (유형 C) |
| museums_total  | int    | int    | —      | -      | 타입 누락 (유형 C) |
| artists        | array  | array  | array  | -      | 하위 상이          |
| artworks       | array  | array  | array  | -      | 하위 상이          |
| museums        | array  | array  | array  | -      | 하위 상이          |

필드 비교 (artists 항목):

| 필드명         | Spec    | API     | Types   | 실사용 | 라벨                   |
| -------------- | ------- | ------- | ------- | ------ | ---------------------- |
| id             | uuid    | string  | string  | -      | 일치                   |
| name_ko        | string  | string  | string  | -      | 일치                   |
| name_en        | string  | string  | string  | -      | 일치                   |
| thumbnail_url  | string? | string? | string? | -      | 일치                   |
| nationality_ko | —       | —       | string  | -      | 타입에만 존재 (유형 A) |
| nationality_en | —       | —       | string  | -      | 타입에만 존재 (유형 A) |

필드 비교 (artworks 항목):

| 필드명         | Spec    | API     | Types   | 실사용 | 라벨                    |
| -------------- | ------- | ------- | ------- | ------ | ----------------------- |
| id             | uuid    | string  | string  | -      | 일치                    |
| title_ko       | string  | string  | string  | -      | 일치                    |
| title_en       | string  | string  | string  | -      | 일치                    |
| artist_name_ko | string? | string? | string  | -      | 일치 (nullability 차이) |
| artist_name_en | —       | —       | string  | -      | 타입에만 존재           |
| image_url      | string? | string? | —       | -      | 이름 다름 (유형 A)      |
| thumbnail_url  | —       | —       | string? | -      | 이름 다름 (유형 A)      |

필드 비교 (museums 항목):

| 필드명        | Spec   | API     | Types   | 실사용 | 라벨                    |
| ------------- | ------ | ------- | ------- | ------ | ----------------------- |
| id            | uuid   | string  | string  | -      | 일치                    |
| name_ko       | string | string  | string  | -      | 일치                    |
| name_en       | string | string  | string  | -      | 일치                    |
| city          | string | string? | —       | -      | 타입 누락 (유형 A)      |
| city_ko/en    | —      | —       | string  | -      | 타입에만 존재 (유형 A)  |
| country_code  | string | string  | —       | -      | 타입 누락               |
| country_ko/en | —      | —       | string  | -      | 타입에만 존재 (유형 A)  |
| thumbnail_url | —      | —       | string? | -      | 타입에만 존재 (유형 D') |

주요 불일치:

- Types가 `page`/`per_page`/`*_total` 5필드 전부 누락 — "더 보기" UI는 타입
  레벨에서 불가능.
- `artworks` 항목에서 Spec/API는 `image_url`, Types는 `thumbnail_url`. 이름
  일관성 없음.
- Search용 Types는 artist/museum 항목마다
  `nationality_ko/en`·`country_ko/en`·`thumbnail_url`을 요구하나 API는 어느 것도
  반환하지 않음.

---

## 섹션 2 — 불일치 유형별 집계

**유형 A. 필드명 차이**

- `website` (Spec/API) ↔ `website_url` (Types) — MuseumDetail
- `bio_ko`/`bio_en` (Spec/API) ↔ `biography_ko`/`biography_en` (Types) —
  ArtistDetail
- `year_created` (Spec 전반, API 대부분) ↔ `year_label` (Types
  `ArtworkSummary`/`ArtworkDetail`, API `museums/[id]/artworks`만) — 작품 전반
- `image_url` (Spec/API) ↔ `thumbnail_url` (Types
  `ArtworkSummary`/`MuseumArtworkSummary`, Search `artworks`, API
  `museums/[id]/artworks`) — 작품/검색
- `nationality` (Spec/API) ↔ `nationality_ko`/`nationality_en` (Types) —
  ArtistSummary/Detail, ArtworkDetail.artist, SearchArtistItem
- `city` (Spec/API) ↔ `city_ko`/`city_en` (Types) — MuseumSummary, PlaceInfo,
  ArtworkDetail.primary_museum/current_location, SearchMuseumItem
- `country`/`country_code` (Spec/API) ↔ `country_ko`/`country_en` (Types 추가) —
  PlaceInfo, MuseumSummary, ArtworkDetail.\*, SearchMuseumItem

**유형 B. 타입 차이**

- `place.opening_hours`: Spec/API `jsonb object` ↔ Types `string[]`
- `place.admission`: Spec/API `jsonb object` (구조 자유) ↔ Types
  `{adult: string, notes?: string | null}`
- `ArtworkDetail.artist`: Spec/API `nullable: true` ↔ Types non-nullable
- `SearchArtworkItem.artist_name_ko`: Spec/API `nullable` ↔ Types non-nullable

**유형 C. Spec·API에 있으나 Types에 없음 (타입 누락)**

- `CountryMapData.latitude/longitude`
- `MuseumSummary.institution_type`, `MuseumSummary.city` (page 필드)
- `MuseumDetail.institution_type`, `MuseumDetail.country_code`
- `PlaceInfo.name_ko/name_en/country/city`
- `ArtistSummary.nationality`, `ArtistSummary.movements`
- `ArtistDetail.nationality`, `ArtistDetail.bio_ko/en`, `ArtistDetail.movements`
- `ArtistCountryDistribution.latitude/longitude`
- `ArtworkDetail.year_created`, `ArtworkDetail.year_end`
- `ArtworkDetail.primary_museum.city`, `ArtworkDetail.current_location.city`
- `SearchResult.page/per_page/artists_total/artworks_total/museums_total`
- `SearchMuseumItem.city`, `SearchMuseumItem.country_code`

**유형 D. API 반환하나 Spec에 없음 (Spec 누락)**

- `museums/[id]/artworks` API의 `year_label`, `thumbnail_url` (Spec은
  `year_created`/`image_url` 고수) — Spec과 API 정면 충돌
- `search` API의 `artists_total` 등은 Spec·API 모두 존재하므로 여기엔 해당 없음.

**유형 D'. Types에만 존재 (Spec·API 모두 미정의, 확장 필드)** — 섹션 4에서
자세히

- `CountryMapData.museum_count`
- `MuseumSummary.thumbnail_url`
- `MuseumDetail.artwork_count`, `MuseumDetail.thumbnail_url`
- `ArtistDetail.artwork_count`, `ArtistDetail.style_ko/en`
- `ArtworkStatus`의 `"unknown"` 리터럴
- `ArtworkDetail.artist.birth_year/death_year`
- `SearchArtistItem.nationality_ko/en`
- `SearchArtworkItem.artist_name_en`, `thumbnail_url`
- `SearchMuseumItem.thumbnail_url`

**유형 E. 중첩 구조 차이**

- `ArtworkSummaryWithMuseum`: Spec/API `museum_name_ko` + `museum_name_en`
  (평면) ↔ Types
  `current_museum: {id,name_ko,name_en,city_*,country_*,country_code}?` (객체)
- `ArtistDetail.movements: Array<{name_ko,name_en,period_start,period_end}>`
  (Spec/API) ↔ `style_ko/style_en: string?` (Types)
- `ArtistSummary.movements: Array<{name_ko,name_en}>` (Spec/API) ↔ Types 미정의
- `ArtworkDetail.artist` 객체 형상: Spec/API `{id,name_ko,name_en}` ↔ Types
  `{id,name_ko,name_en,nationality_ko,nationality_en,birth_year,death_year}`
- `ArtworkDetail.primary_museum`·`current_location`의 city/country 플랫 vs
  `_ko/_en` 분해
- `museums/[id]/artworks` API의 artist 객체는 존재, Types는
  `MuseumArtworkSummary.artist`에서 name_ko/name_en을 `string | null`로
  허용(하지만 `ArtworkSummary`에서는 non-null)

---

## 섹션 3 — Spec v2.0.0 의사결정 필요 쟁점

**쟁점 1 — 다국어 위치 표기 (city/country)**

- 엔드포인트·필드: MuseumSummary, MuseumDetail.place,
  ArtworkDetail.primary_museum/current_location, SearchMuseumItem
- 세 진실 상태:
  - Spec: `city: string`, `country: string` (단일)
  - API: Spec과 동일 (단일, ERD의 `places.city` 그대로)
  - Types: `city_ko/city_en`, `country_ko/country_en` 페어
- 옵션:
  - (a) Spec에 `city_ko/en`·`country_ko/en` 페어 도입 → DB에 다국어 컬럼 신설
    (ERD 변경, 데이터 수집 부담)
  - (b) Types를 단일 필드로 축소 → 프론트 UI에서 한국어/영어 표시 로직 제거,
    다국어 일관성 저하
  - (c) Spec은 `city`·`country_code` 유지, 프론트는
    `country_code→country_name_ko` 정적 매핑(`getCountryName`과 동일 방식) 사용
    → ERD 무변, 프론트 표시 계층에 책임
- 영향 범위:
  - (a) ERD·백엔드 API 5곳·Mock·프론트 컴포넌트 10개 내외
  - (b) 프론트 타입·컴포넌트 10개 내외 (MuseumHero, ArtistArtworkGallery,
    ArtworkHero 등)
  - (c) 프론트 타입·Mock 축소 + 신규 city_ko 매핑 유틸 (현재
    `lib/country-names.ts` 존재)

**쟁점 2 — 화가 국적 (nationality)**

- 엔드포인트: /artists, /artists/{id}, /search (artists), /artworks/{id} (artist
  중첩)
- 세 진실:
  - Spec/API: `nationality: string?` (단일, `artists.nationality` varchar)
  - Types: `nationality_ko`, `nationality_en`
- 옵션: 쟁점 1과 동일 구조.

**쟁점 3 — 사조 모델링 (movements vs style)**

- 엔드포인트: /artists, /artists/{id}
- 세 진실:
  - Spec/API: `movements: Array<{name_ko,name_en,period_start,period_end}>`
    (다대다, `artist_movements` 테이블 경유)
  - Types: `style_ko/style_en: string?` (단일 문자열)
- 옵션:
  - (a) Types·프론트 UI를 `movements` 배열로 전환 → 여러 사조 태그 표시,
    ArtistInfo 섹션 리스트화
  - (b) Spec/API를 단일 대표 사조 문자열로 축소 → ERD의 다대다 활용 포기
  - (c) 둘 다 유지: 상세는 배열, 카드는 대표 하나 — `primary_movement` 파생
    필드를 Spec에 명시
- 영향 범위: (a) `ArtistInfo.tsx` 1개, (b) 백엔드 route 2개 + ERD 단순화, (c)
  API route 2개·Types·컴포넌트 전부 소소 수정.

**쟁점 4 — `year_created: int` vs `year_label: string`**

- 엔드포인트: `/museums/{id}/artworks`(현재 API가 유일하게 label로 변환 반환),
  /artists/{id}/artworks, /artworks, /artworks/{id}
- 세 진실:
  - Spec: `year_created: integer?`
  - API: `museums/[id]/artworks`만 `year_label: string?`, 나머지는
    `year_created: integer?`
  - Types: 전부 `year_label: string?`
- 옵션:
  - (a) Spec 전체를 `year_label: string?`으로 통일 → "c. 1865–1870" 같은 라벨
    지원 가능, 정렬은 `year_created` 내부 필드 별도 제공
  - (b) Types를 `year_created: int?`로 통일 → 기존 `ArtworkDetail.year_end`와
    조합해 프론트가 라벨 포매팅
  - (c) 혼재 유지 — 하지만 API 3곳과 1곳이 어긋난 채 방치되는 셈
- 영향 범위: (a) Spec·API 3곳·Types 유지, (b) Types 2개(artwork.ts)·컴포넌트
  2개(MuseumArtworkGallery, ArtworkHero) 수정.

**쟁점 5 — 썸네일/이미지 필드명 (`image_url` vs `thumbnail_url`)**

- 엔드포인트: artworks 전반, search.artworks
- 세 진실:
  - Spec/API: `image_url`
  - Types: 목록용은 `thumbnail_url`, 상세는 `image_url`
  - 단, API `museums/[id]/artworks`만 `thumbnail_url` 반환 (Spec과 충돌)
- 옵션:
  - (a) Spec에 썸네일용 별도 필드(`thumbnail_url`)와 원본(`image_url`) 둘 다
    정의
  - (b) Spec은 `image_url` 하나만 유지, Types와 변환 엔드포인트를 정렬
- 영향 범위: (a) 이미지 가공 파이프라인 필요, (b) Types 3곳·route.ts
  1곳·컴포넌트 2곳.

**쟁점 6 — MuseumDetail 추가 필드 (`artwork_count`, `thumbnail_url`,
`institution_type`, `country_code`)**

- Types에는 `artwork_count`, `thumbnail_url` 정의되나 실사용 없음. 반면 Spec이
  정의한 `institution_type`, `country_code`는 Types에 없음.
- 옵션:
  - (a) Types에서 미사용 `artwork_count`/`thumbnail_url` 삭제 +
    `institution_type`/`country_code` 추가
  - (b) Spec 쪽에 `artwork_count`·`thumbnail_url` 추가하여 상세 페이지 헤더에서
    실제 사용
- 영향 범위: (a) `src/types/museum.ts`만 수정, (b) `museums/[id]/route.ts` SQL
  수정.

**쟁점 7 — SearchResult 페이지네이션 필드**

- Spec/API: `page`, `per_page`, `artists_total`, `artworks_total`,
  `museums_total` 존재
- Types: 5개 전부 없음
- 옵션: Types에 추가하는 것 외의 대안 없음 (Spec의 "더 보기" 기능 자체를
  폐기하지 않는 한).
- 영향 범위: `src/types/search.ts` 1개, SearchBar에서 추후 사용.

**쟁점 8 — `ArtworkSummaryWithMuseum` 중첩 vs 평면**

- Spec/API: `museum_name_ko`·`museum_name_en` 평면 2필드
- Types: `current_museum: {id,name_ko,name_en,city_*,country_*,country_code}`
  객체 (특히 `id`로 미술관 상세 링크 가능)
- 옵션:
  - (a) Spec에 `current_museum: {id,name_ko,name_en,country_code}?` 중첩 객체
    도입 → ArtistArtworkGallery에서 미술관 클릭 가능
  - (b) 평면 유지 + `current_museum_id` 평면 필드 추가
  - (c) 현상 유지 (미술관 링크 기능 포기)
- 영향 범위: (a) route.ts 2곳(/artists/{id}/artworks, /artworks), Types,
  컴포넌트 1곳. (b) 더 최소.

**쟁점 9 — `ArtworkDetail.artist`에 nationality/birth/death 포함 여부**

- `ArtworkHero`의 `artistMeta`가 이미 실제 렌더함.
- 세 진실: Spec/API 미반환, Types 요구.
- 옵션:
  - (a) Spec에 `ArtworkDetail.artist`를 `ArtistSummary`와 동일 스키마로 확장
  - (b) Types에서 이 필드들 제거, `ArtworkHero`의 메타라인은 nationality 단일만
    쓰거나 제거
- 영향 범위: (a) route.ts 1곳 SQL에 artists join 확장, (b) 컴포넌트 1곳.

**쟁점 10 — `ArtistDetail.artwork_count`**

- Spec·API 모두 미정의. Types만 보유. `ArtistInfo`가 렌더.
- 옵션: (a) Spec·API에 추가, (b) Types·컴포넌트에서 제거.

**쟁점 11 — `CountryMapData.museum_count`**

- Types만 보유. 실사용 없음. 옵션: 제거 권장.

**쟁점 12 — `ArtworkStatus`에 `"unknown"` 추가 여부**

- DB enum/Spec은 4개(`on_display`, `in_storage`, `on_loan`,
  `under_restoration`). Types는 5개 (`unknown` 추가).
- 옵션: (a) `unknown`을 Spec enum에 추가하고 DB 마이그레이션 (b) Types에서 제거.

**쟁점 13 — `place.opening_hours`/`place.admission` 구조**

- Spec/API: 자유 `jsonb object`. Types: `string[]` / `{adult, notes?}`. DB jsonb
  내부 스키마가 미정의.
- 옵션: Spec에 구체적 sub-schema 명시 (`opening_hours: {monday: string, ...}`
  등) + 백엔드 변환 계층.

**쟁점 14 — `website` vs `website_url`**

- 단순 네이밍 문제. (a) Spec에 맞춰 Types `website`로 변경 (b) API를
  `website_url`로 변경 (ERD 컬럼명은 `website`이므로 변환 층 필요).

**쟁점 15 — `bio_*` vs `biography_*`**

- 쟁점 14와 동일 성격. ERD가 `bio_ko/en`이므로 Types 측 교정이 자연스러움.

---

## 섹션 4 — 프론트 확장 필드 목록

| 필드명                                  | 속하는 타입                                                                               | 추정 용도                         | v2.0.0 편입 권장            |
| --------------------------------------- | ----------------------------------------------------------------------------------------- | --------------------------------- | --------------------------- |
| `museum_count`                          | CountryMapData                                                                            | 국가 버블 보조 수치 (현재 미사용) | 제거                        |
| `thumbnail_url`                         | MuseumSummary                                                                             | 목록 카드 썸네일 (현재 미사용)    | 보류 (UX 결정 필요)         |
| `thumbnail_url`                         | MuseumDetail                                                                              | 상세 헤더 이미지 (현재 미사용)    | 보류                        |
| `artwork_count`                         | MuseumDetail                                                                              | 상세 페이지 표시 (현재 미사용)    | 권장 (UX 확인 후 Spec 편입) |
| `nationality_ko/nationality_en`         | ArtistSummary, ArtistDetail, SearchArtistItem, ArtworkDetail.artist                       | 국적 한/영 표기                   | 쟁점 2로 일괄 결정          |
| `biography_ko/biography_en`             | ArtistDetail                                                                              | 약력 (실사용 O)                   | 쟁점 15로 일괄 결정         |
| `style_ko/style_en`                     | ArtistDetail                                                                              | 화풍 한 줄 요약 (실사용 O)        | 쟁점 3로 일괄 결정          |
| `artwork_count`                         | ArtistDetail                                                                              | "등록된 작품 수" 표시 (실사용 O)  | 권장 (Spec 편입)            |
| `year_label`                            | ArtworkSummary, ArtworkDetail, MuseumArtworkSummary                                       | 라벨 포매팅                       | 쟁점 4로 일괄 결정          |
| `thumbnail_url`                         | ArtworkSummary, MuseumArtworkSummary, SearchArtworkItem                                   | 목록 카드 썸네일                  | 쟁점 5로 일괄 결정          |
| `ArtworkStatus: "unknown"`              | ArtworkStatus                                                                             | 상태 미상 표기                    | 보류 (DB enum 변경 필요)    |
| `city_ko/city_en/country_ko/country_en` | PlaceInfo, MuseumSummary, ArtworkDetail.primary_museum/current_location, SearchMuseumItem | 위치 한/영 표기                   | 쟁점 1로 일괄 결정          |
| `country_code`                          | PlaceInfo                                                                                 | (Spec엔 MuseumDetail 상위에 존재) | 권장 (Spec 위치 통일)       |
| `current_museum` 객체                   | ArtworkSummaryWithMuseum                                                                  | 미술관 링크 구성 (실사용 O)       | 쟁점 8로 일괄 결정          |
| `artist.birth_year/death_year`          | ArtworkDetail                                                                             | "나라, 1853–1890" 메타 (실사용 O) | 쟁점 9로 일괄 결정          |
| `website_url`                           | MuseumDetail                                                                              | 링크 href (실사용 O)              | 쟁점 14로 일괄 결정         |

---

## 섹션 5 — API Route 미구현 목록

없음. 11개 엔드포인트 모두 `src/app/api/v1/` 하위에 `route.ts` 구현됨.

---

## 섹션 6 — drizzle schema와 Spec의 관계

`src/lib/schema.ts` 기준 테이블별 대조:

**artists** — Spec `ArtistDetail`과 대조:

- schema:
  `id, name_en, name_ko, birth_year, death_year, nationality, bio_en, bio_ko, thumbnail_url, wikidata_id, created_at, updated_at`
- Spec 필수·옵션:
  `id, name_ko, name_en, birth_year?, death_year?, nationality?, bio_ko?, bio_en?, thumbnail_url?, movements[]`
- 일치 여부: 기본 컬럼 모두 일대일 대응. `wikidata_id`는 Spec에 미노출(내부
  필드), `movements`는 `artist_movements`+`art_movements` 조인으로 구성.
- 불일치: 프론트 타입 `biography_*`·`style_*`·`nationality_ko/en` 모두 schema에
  존재하지 않음 → Types 측 괴리.

**artworks** — Spec `ArtworkDetail`과 대조:

- schema:
  `id, title_en, title_ko, year_created, year_end, medium_en, medium_ko, dimensions, image_url, image_source, status, curation_en, curation_ko, source_api, source_id, is_public_domain, created_at, updated_at`
- Spec:
  `id, title_*, year_created?, year_end?, medium_*?, dimensions?, image_url?, is_public_domain, status, curation_*?`
- 일치 여부: Spec 필드는 schema 컬럼과 모두 대응.
  `image_source`/`source_api`/`source_id`는 Spec에 없음(내부 필드).
- 불일치: Types의 `year_label`은 schema에 없음 → API가 변환해야 함. Types
  `ArtworkStatus`의 `"unknown"`은 `artworkStatusEnum`에 없음.

**institutions** — Spec `MuseumDetail`과 대조:

- schema:
  `id, institution_type, country_code, name_en, name_ko, website, description_en, description_ko, wikidata_id, created_at, updated_at`
- Spec:
  `id, name_ko, name_en, institution_type, country_code, description_ko?, description_en?, website?, place{...}`
- 일치 여부: 전부 대응.
- 불일치: Types의 `website_url`은 schema `website` 컬럼과 불일치 (유형 A). Types
  `artwork_count`·`thumbnail_url`은 schema에 없음.

**places** — Spec `PlaceInfo`와 대조:

- schema:
  `id, institution_id, name_en, name_ko, country, city, address, latitude(decimal), longitude(decimal), opening_hours(jsonb), admission(jsonb), created_at, updated_at`
- Spec:
  `name_ko?, name_en?, country, city, address?, latitude, longitude, opening_hours?, admission?`
- 일치 여부: 전부 대응. `latitude`/`longitude`는 decimal이지만
  `p.latitude::float` 캐스팅으로 float 반환 (일관성 OK).
- 불일치: Types `city_ko/en`·`country_ko/en`은 schema에 없음 → 다국어 컬럼
  미존재가 가장 큰 갭.

---

## 섹션 7 — 후속 검토 후보 (수정 금지, 기록만)

1. `lib/api-response.ts`, `lib/country-names.ts`, `lib/db.ts`는 본 조사 범위에
   명시되지 않아 열람하지 않았음. API Response
   헬퍼(`internalServerError`/`notFound`/`badRequest`/`parseIntParam`/`isValidUUID`)의
   ProblemDetail 포맷 준수 여부는 별도 검증 필요.
2. `GET /map/countries` API의 좌표를 `AVG(p.latitude/longitude)`로 계산하지만
   프론트는 좌표를 무시하고 `COUNTRY_COORDS` 하드코딩 사용. 서버 계산을
   제거하거나 프론트를 서버 값으로 교체할지 결정 필요.
3. `museums/[id]/artworks` route만 `year_label`·`thumbnail_url`로 리네이밍 변환.
   다른 artwork 엔드포인트와 일관성 없음. v1.3.0 Spec과도 정면 충돌.
4. `ArtworkStatus`에 `"unknown"` 리터럴 추가 — UI fallback 의도로 보이나 DB
   enum과 불일치. 누가 `"unknown"` 값을 공급할 주체인지 불명.
5. `getArtworkById` 호출 시 실패 경로가 `ApiError` 변환을 통해 404를
   `notFound()`로 처리. `getArtistById`의 경우 Mock 모드에서 null 반환 패턴
   공존. 일관성 확보 여지.
6. `ArtworkHero`에서 `artwork.artist.id`를 null 체크 없이 사용. Spec/API가
   `artist: nullable` 이라 런타임 크래시 가능성.
7. `MuseumInfo.tsx`의 `place.opening_hours.map(...)` — jsonb object가 오면 타입
   런타임 오류.
8. `src/mocks/` 파일은 본 보고서에서 구조만 확인했으며 상세 필드 대조는 진행하지
   않음. Mock이 Spec 기준인지 Types 기준인지 별도 확인 필요.
9. `ArtworkDetail.year_end`를 API는 반환하는데 Types/UI는 활용하지 않음.
   연작·장기 제작 작품 표기 설계 미정.
10. `/search`의 페이지네이션 응답 5필드가 Types에 전부 없어 더 보기 UI는 타입
    레벨에서 구현 불가.
11. `/artists/[id]/artworks`와 `/artworks`는 현재 `artist` 객체를 응답에
    포함하지 않음. Types `ArtworkSummaryWithMuseum`은 `ArtworkSummary` 확장으로
    `artist`(필수)를 요구. 타입 체커는 통과해도 런타임에 `undefined`.

---

## 섹션 8 — Open Questions

1. `src/mocks/` 파일들이 Spec과 Types 중 어느 쪽을 기준으로 작성되었는지 내용
   확인 미수행(열람 범위엔 있었으나 보고서 길이 제약으로 생략). Mock이 Spec
   기반이면 개발 중 Mock 모드에서만 작동하고 실제 API 모드에서 깨지는 패턴 다수
   의심.
2. `place.opening_hours`가 DB에 실제 `string[]` 형태로 저장된 레코드가
   있는지(또는 object인지) 파일만으로는 판단 불가. seed/마이그레이션 파일 확인
   필요.
3. `ArtworkStatus: "unknown"`이 어느 레이어에서 주입되는지 근거 없음. 예외 처리
   기본값인지 실제 DB 값인지 모름.
4. Types의 `nationality_ko/nationality_en` 같은 분기 필드는 백엔드 변환(예:
   `getCountryName` 같은) 매핑 준비가 되어 있는지 파일만으로 판단 불가.
5. `drizzle.config.ts`는 파일 목록에만 있고 내용 미열람. 마이그레이션 경로·DB
   접속 설정이 ERD와 맞는지는 확인 못함.
6. `/map/countries`의 공동 소장 집계 시 `COUNT(DISTINCT ao.artwork_id)`는 Spec이
   명시한 "각 국가에 각각 1건 집계"와 일치하는지 — DISTINCT가 들어가 있어 오히려
   중복 제거가 일어남. 설계 의도 확인 필요.
7. `v2.0.0`이 다국어 컬럼을 ERD에 실제 추가할 계획인지 아니면 presentation
   변환에 머물 것인지 방향성 결정 필요.

---

## 자기 검증

- [x] 모든 파일 수정 없이 읽기만 수행
- [x] 11개 엔드포인트 모두 조사 (지도·미술관 목록/상세/작품·화가
      목록/상세/작품/맵·작품 목록/상세·검색)
- [x] 세 진실(Spec / API 실제 반환 / Types) 각각 별도 컬럼으로 비교
- [x] 삼중 백틱 없음
- [x] 추측 서술 없이 파일 근거만 사용 (단, 섹션 8에 파일로 판단 불가한 항목
      기재)
