# ArtMap API Specification v2.0.0

> **버전**: 2.0.0 **작성일**: 2026-04-18 **이전 버전**: v1.3.0 (2026-03-22)
> **근거 문서**: `docs/reports/2026-04-18-spec-v2-current-state-audit.md` **형식
> 참고**: 본 문서는 OpenAPI 3.0.3 기준 명세의 **Human-readable 초안**입니다.
> 최종 확정 후 YAML 파일로 변환합니다.

---

## 0. v2.0.0의 의미 — Why Major Version Bump

### Semantic Versioning 판단

`MAJOR.MINOR.PATCH`에서 **MAJOR를 올린 이유는 하위 호환을 깨는 변경이
다수**입니다. 기존 v1.x 클라이언트가 v2.0.0 API를 바로 호출하면 **타입 불일치로
동작하지 않는 지점이 있습니다**.

### v2.0.0의 3가지 정체성

1. **현실 기록 (As-Built Specification)** 현재 `src/app/api/v1/**/route.ts`에
   실제 구현된 API 응답을 **진실의 기준**으로 삼고, Spec을 그 현실에 맞춥니다.
   v1.x까지 Spec은 "이상적 설계"였으나, v2.0.0부터 Spec은 **"공식적으로 합의된
   현실의 기록"** 입니다.

2. **단일 진실 원천 복원 (Single Source of Truth)** 지금까지 Spec / 실제 API /
   프론트 Types 세 진실이 갈라져 있었습니다. v2.0.0은 이 셋을 **하나로
   정렬**하는 버전입니다.

3. **향후 변경의 기점 (Baseline)** 이후 모든 변경은 v2.0.0을 기준으로 합니다. PR
   본문 매핑 표 방식의 임시 문서화는 **공식 폐기**되고, 모든 변경은 **Spec
   업데이트 + 버전 증가** 프로세스를 따릅니다.

### 이 문서의 주 사용자

- **종민**: 백엔드 API 수정 작업의 근거 (Part 3의 "API 수정 요청 목록" 참조)
- **현빈**: 프론트 Types 정합 작업의 근거 (Part 4의 "프론트 수정 요청 목록"
  참조)
- **미래의 팀원**: ArtMap의 공식 API 명세

---

## 1. 원칙 (v2.0.0 결정의 근거)

### 원칙 A: "API가 이기지만, Spec이 판사다"

실제 동작하는 API를 현실로 인정하되, 그 현실을 Spec에 명문화합니다. 예외: API가
Spec/ERD 정신을 훼손하는 경우에 한해 API 수정을 요청합니다.

### 원칙 B: "다국어 표기는 표현 계층의 책임"

DB·API는 정규화된 값(`country_code`, `city`, `nationality`)만 반환합니다.
한국어/영어 표시는 프론트 매핑 유틸(`lib/country-names.ts` 확장)이 담당합니다.

### 원칙 C: "실사용 있으면 Spec 편입, 없으면 제거"

UI가 실제로 렌더링하는 확장 필드는 Spec에 편입하여 API와 Types가 함께 지원하도록
합니다. 타입에만 존재하고 컴포넌트에서 참조되지 않는 필드는 제거합니다.

---

## 2. v1.3.0 → v2.0.0 주요 변경 이력

### [BREAKING] 제거·이름 변경

| #   | 대상                            | v1.3.0                                                       | v2.0.0                                                                  | 이유                           |
| --- | ------------------------------- | ------------------------------------------------------------ | ----------------------------------------------------------------------- | ------------------------------ |
| B1  | 작품 이미지 필드명 통일         | `image_url` + 특정 엔드포인트만 `thumbnail_url`              | **전체 `image_url`로 통일**                                             | 섹션 1-4 Spec 충돌 해소        |
| B2  | 작품 연도 필드 통일             | `year_created: int` + 특정 엔드포인트만 `year_label: string` | **전체 `year_created: int?` + `year_end: int?` 유지**                   | 라벨 포매팅은 프론트 유틸 책임 |
| B3  | ArtworkStatus enum 축소         | (프론트 Types에 `"unknown"` 존재)                            | **ERD와 동일한 4개로 엄격 고정**                                        | DB enum 외 값 불허             |
| B4  | `ArtworkSummaryWithMuseum` 구조 | `museum_name_ko` + `museum_name_en` (평면)                   | **`current_museum: {id, name_ko, name_en, country_code}?` (중첩 객체)** | 미술관 상세 링크 생성 가능     |

### [NON-BREAKING] 추가

| #   | 대상                                          | v2.0.0에서 추가                              | 이유                                      |
| --- | --------------------------------------------- | -------------------------------------------- | ----------------------------------------- |
| A1  | `ArtworkDetail.artist` 확장                   | `nationality?`, `birth_year?`, `death_year?` | ArtworkHero 메타 표시용                   |
| A2  | `ArtistDetail.artwork_count`                  | 추가                                         | ArtistInfo 표시용                         |
| A3  | `MuseumDetail.artwork_count`                  | 추가                                         | 향후 상세 페이지 헤더용                   |
| A4  | `opening_hours` / `admission` sub-schema 정의 | 구체 구조 명시                               | 프론트 타입 안정화                        |
| A5  | `PlaceInfo.country_code`                      | 추가                                         | MuseumDetail 상위의 country_code와 일관성 |

### [NON-BREAKING] 문서화

| #   | 대상                             | 변경                                                     |
| --- | -------------------------------- | -------------------------------------------------------- |
| D1  | 다국어 표시 원칙                 | 각 엔드포인트 description에 "프론트 매핑 유틸 사용" 명시 |
| D2  | `movements` 배열 유지 확인       | 단일 문자열로 축소하지 않음을 명시                       |
| D3  | `nationality: string?` 유지 확인 | 페어 분리하지 않음을 명시                                |

---

## 3. 엔드포인트별 변경 사항

### 3-1. GET /map/countries

변경 없음. 기존 v1.3.0 스펙 그대로 유지.

- 단, 프론트가 API가 반환하는 `latitude`/`longitude`를 **실제로 사용하기로**
  결정한 것인지 확인 필요 (Open Question).
- 현재 프론트는 `COUNTRY_COORDS` 하드코딩 사용 중. API 좌표가 버려지고 있음.

**[후속 작업]**: 프론트를 API 좌표 사용으로 전환할지 결정. 전환 시 하드코딩
제거, 유지 시 API 좌표 계산 제거(부하 감소).

---

### 3-2. GET /museums (목록)

#### 응답 스키마: `MuseumSummary`

| 필드             | v1.3.0    | v2.0.0    | 변경 사유                                           |
| ---------------- | --------- | --------- | --------------------------------------------------- |
| id               | uuid      | uuid      | 유지                                                |
| name_ko          | string    | string    | 유지                                                |
| name_en          | string    | string    | 유지                                                |
| institution_type | enum      | enum      | 유지 (Types 누락 → 추가 대상)                       |
| country_code     | string(2) | string(2) | 유지                                                |
| city             | string    | string    | 유지 (Types는 `city_ko/en`으로 분기 중 → 축소 대상) |
| latitude         | float     | float     | 유지                                                |
| longitude        | float     | float     | 유지                                                |
| artwork_count    | integer   | integer   | 유지                                                |

**변경 없음.** Types 쪽이 Spec을 따르도록 수정 필요.

---

### 3-3. GET /museums/{id} (상세)

#### 응답 스키마: `MuseumDetail`

| 필드              | v1.3.0       | v2.0.0       | 변경 사유                                          |
| ----------------- | ------------ | ------------ | -------------------------------------------------- |
| id                | uuid         | uuid         | 유지                                               |
| name_ko           | string       | string       | 유지                                               |
| name_en           | string       | string       | 유지                                               |
| institution_type  | enum         | enum         | 유지                                               |
| country_code      | string(2)    | string(2)    | 유지                                               |
| description_ko    | string?      | string?      | 유지                                               |
| description_en    | string?      | string?      | 유지                                               |
| website           | string(uri)? | string(uri)? | 유지 (Types `website_url` → `website`로 정정 필요) |
| **artwork_count** | —            | **integer**  | **[A3 추가]** ArtistDetail과 일관성, UX 활용       |
| place             | object       | object       | 유지 (sub-schema 강화)                             |

#### 중첩 스키마: `PlaceInfo` (재정의)

| 필드             | v1.3.0  | v2.0.0                        | 변경 사유                                             |
| ---------------- | ------- | ----------------------------- | ----------------------------------------------------- |
| name_ko          | string? | string?                       | 유지                                                  |
| name_en          | string? | string?                       | 유지                                                  |
| country          | string  | string                        | 유지                                                  |
| city             | string  | string                        | 유지                                                  |
| **country_code** | —       | **string(2)**                 | **[A5 추가]** MuseumDetail 상위와 일관성, 프론트 사용 |
| address          | string? | string?                       | 유지                                                  |
| latitude         | float   | float                         | 유지                                                  |
| longitude        | float   | float                         | 유지                                                  |
| opening_hours    | jsonb?  | **object? (sub-schema 명시)** | **[A4]** 구조 정의                                    |
| admission        | jsonb?  | **object? (sub-schema 명시)** | **[A4]** 구조 정의                                    |

#### `opening_hours` sub-schema (신규)

```yaml
opening_hours:
  type: object
  nullable: true
  properties:
    monday: { type: string, nullable: true, example: "10:00-18:00" }
    tuesday: { type: string, nullable: true, example: "10:00-18:00" }
    wednesday: { type: string, nullable: true, example: "10:00-18:00" }
    thursday: { type: string, nullable: true, example: "10:00-21:00" }
    friday: { type: string, nullable: true, example: "10:00-21:00" }
    saturday: { type: string, nullable: true, example: "10:00-18:00" }
    sunday: { type: string, nullable: true, example: null }
    notes: { type: string, nullable: true, example: "월요일 휴관" }
```

- 값이 `null`이면 해당 요일 휴관으로 해석.
- 프론트는 이 객체를 요일 배열로 변환해 렌더링.

#### `admission` sub-schema (신규)

```yaml
admission:
  type: object
  nullable: true
  properties:
    adult: { type: string, example: "€16" }
    concessions: { type: string, nullable: true, example: "€13" }
    free_under: { type: integer, nullable: true, example: 18 }
    notes: { type: string, nullable: true, example: "매달 첫째 일요일 무료" }
```

#### [종민 협의 필요]

- **쟁점**: 기존 DB `places.opening_hours`·`places.admission`이 jsonb 컬럼이지만
  내부 구조가 미정의. 실제 저장된 데이터가 위 스키마와 일치하는지 확인 필요.
- **대응**: 현재 데이터가 다른 형태면 (a) DB 데이터 재구조화 마이그레이션 (b)
  Spec을 실제 형태에 맞게 조정. (a) 권장.

---

### 3-4. GET /museums/{id}/artworks

#### 응답 스키마: `ArtworkSummary`

| 필드         | v1.3.0       | v2.0.0       | 변경 사유                                                                   |
| ------------ | ------------ | ------------ | --------------------------------------------------------------------------- |
| id           | uuid         | uuid         | 유지                                                                        |
| title_ko     | string       | string       | 유지                                                                        |
| title_en     | string       | string       | 유지                                                                        |
| year_created | int?         | int?         | **유지 [B2]** (현재 API가 `year_label: string`으로 변환 중 → API 원복 필요) |
| **year_end** | —            | **int?**     | **[A 추가]** 연작/장기 제작 표기 (ArtworkDetail과 일관성)                   |
| image_url    | string(uri)? | string(uri)? | **유지 [B1]** (현재 API가 `thumbnail_url`로 변환 중 → API 원복 필요)        |
| status       | enum(4개)    | enum(4개)    | **[B3]** `"unknown"` 없음                                                   |
| artist       | object?      | object?      | 유지                                                                        |

**[종민 API 수정 요청 ①]**: `/api/v1/museums/[id]/artworks/route.ts`에서
`year_label`/`thumbnail_url`로의 이름 변환을 제거하고
`year_created`/`image_url`로 반환.

---

### 3-5. GET /artists (목록)

#### 응답 스키마: `ArtistSummary`

| 필드          | v1.3.0                      | v2.0.0                      | 변경 사유                                |
| ------------- | --------------------------- | --------------------------- | ---------------------------------------- |
| id            | uuid                        | uuid                        | 유지                                     |
| name_ko       | string                      | string                      | 유지                                     |
| name_en       | string                      | string                      | 유지                                     |
| birth_year    | int?                        | int?                        | 유지                                     |
| death_year    | int?                        | int?                        | 유지                                     |
| nationality   | string?                     | string?                     | 유지 (`nationality_ko/en` 아님) **[D3]** |
| thumbnail_url | string(uri)?                | string(uri)?                | 유지                                     |
| movements     | `Array<{name_ko, name_en}>` | `Array<{name_ko, name_en}>` | 유지 **[D2]**                            |
| artwork_count | int?                        | int?                        | 유지                                     |

**변경 없음.** Types 쪽이 `nationality_ko/en` → `nationality`, `style_ko/en` →
`movements` 배열로 전환 필요.

---

### 3-6. GET /artists/{id} (상세)

#### 응답 스키마: `ArtistDetail`

| 필드              | v1.3.0                                                  | v2.0.0       | 변경 사유                                         |
| ----------------- | ------------------------------------------------------- | ------------ | ------------------------------------------------- |
| id                | uuid                                                    | uuid         | 유지                                              |
| name_ko           | string                                                  | string       | 유지                                              |
| name_en           | string                                                  | string       | 유지                                              |
| birth_year        | int?                                                    | int?         | 유지                                              |
| death_year        | int?                                                    | int?         | 유지                                              |
| nationality       | string?                                                 | string?      | 유지 **[D3]** (Types `nationality_ko/en` → 축소)  |
| bio_ko            | string?                                                 | string?      | 유지 (Types `biography_ko` → `bio_ko`로 정정)     |
| bio_en            | string?                                                 | string?      | 유지 (Types `biography_en` → `bio_en`로 정정)     |
| thumbnail_url     | string(uri)?                                            | string(uri)? | 유지                                              |
| movements         | `Array<{name_ko, name_en, period_start?, period_end?}>` | 동일         | 유지 **[D2]** (Types `style_ko/en` → 배열로 전환) |
| **artwork_count** | —                                                       | **integer**  | **[A2 추가]** ArtistInfo에서 실사용 중            |

**[종민 API 수정 요청 ②]**: `/api/v1/artists/[id]/route.ts`에 `artwork_count`
집계 SQL 추가.

---

### 3-7. GET /artists/{id}/artworks

#### 응답 스키마: `ArtworkSummaryWithMuseum` (재정의)

| 필드                   | v1.3.0       | v2.0.0                                      | 변경 사유                                |
| ---------------------- | ------------ | ------------------------------------------- | ---------------------------------------- |
| id                     | uuid         | uuid                                        | 유지                                     |
| title_ko               | string       | string                                      | 유지                                     |
| title_en               | string       | string                                      | 유지                                     |
| year_created           | int?         | int?                                        | 유지 **[B2]**                            |
| **year_end**           | —            | **int?**                                    | **[A]** 일관성                           |
| image_url              | string(uri)? | string(uri)?                                | 유지 **[B1]**                            |
| status                 | enum(4개)    | enum(4개)                                   | **[B3]**                                 |
| **~~museum_name_ko~~** | string?      | **제거**                                    | **[B4]**                                 |
| **~~museum_name_en~~** | string?      | **제거**                                    | **[B4]**                                 |
| **current_museum**     | —            | **`{id, name_ko, name_en, country_code}?`** | **[B4 추가]** 미술관 상세 링크 생성 가능 |

**[종민 API 수정 요청 ③]**: 평면 `museum_name_*` 2필드를 `current_museum` 중첩
객체로 재구성. `id` 포함 필수.

---

### 3-8. GET /artists/{id}/map-data

변경 없음. v1.3.0 스펙 유지.

- 다만 `/map/countries`와 동일한 쟁점: API의 `latitude`/`longitude`를 프론트가
  사용하지 않음. 섹션 3-1 후속 작업과 일괄 처리.

---

### 3-9. GET /artworks (목록)

#### 응답 스키마: `ArtworkSummaryWithMuseum`

3-7과 동일 스키마 사용. 같은 변경 적용.

---

### 3-10. GET /artworks/{id} (상세)

#### 응답 스키마: `ArtworkDetail`

| 필드             | v1.3.0       | v2.0.0         | 변경 사유                            |
| ---------------- | ------------ | -------------- | ------------------------------------ |
| id               | uuid         | uuid           | 유지                                 |
| title_ko         | string       | string         | 유지                                 |
| title_en         | string       | string         | 유지                                 |
| year_created     | int?         | int?           | 유지 **[B2]**                        |
| year_end         | int?         | int?           | 유지 (현재 Types 미지원 → 추가 필요) |
| medium_ko        | string?      | string?        | 유지                                 |
| medium_en        | string?      | string?        | 유지                                 |
| dimensions       | string?      | string?        | 유지                                 |
| image_url        | string(uri)? | string(uri)?   | 유지 **[B1]**                        |
| is_public_domain | boolean      | boolean        | 유지                                 |
| status           | enum(4개)    | enum(4개)      | **[B3]**                             |
| curation_ko      | string?      | string?        | 유지                                 |
| curation_en      | string?      | string?        | 유지                                 |
| artist           | object?      | object? (확장) | **[A1]** 아래 참조                   |
| primary_museum   | object?      | object?        | 유지 (중첩 필드는 Spec 기준)         |
| current_location | object?      | object?        | 유지 (중첩 필드는 Spec 기준)         |

#### 중첩: `ArtworkDetail.artist` (확장)

| 필드            | v1.3.0 | v2.0.0      | 변경 사유                       |
| --------------- | ------ | ----------- | ------------------------------- |
| id              | uuid   | uuid        | 유지                            |
| name_ko         | string | string      | 유지                            |
| name_en         | string | string      | 유지                            |
| **nationality** | —      | **string?** | **[A1]** ArtworkHero에서 실사용 |
| **birth_year**  | —      | **int?**    | **[A1]** ArtworkHero에서 실사용 |
| **death_year**  | —      | **int?**    | **[A1]** ArtworkHero에서 실사용 |

**[종민 API 수정 요청 ④]**: `/api/v1/artworks/[id]/route.ts`의 artist JOIN SQL에
`nationality`, `birth_year`, `death_year` 컬럼 추가.

#### 중첩: `primary_museum` / `current_location`

기존 스펙 유지. Types가 `city_ko/en`, `country_ko/en`을 요구하는 것을 원칙 B에
따라 `city`, `country_code`로 축소.

---

### 3-11. GET /search

#### 응답 스키마: `SearchResult`

| 필드           | v1.3.0 | v2.0.0 | 변경 사유                  |
| -------------- | ------ | ------ | -------------------------- |
| query          | string | string | 유지                       |
| page           | int    | int    | 유지 (Types 미지원 → 추가) |
| per_page       | int    | int    | 유지 (Types 미지원 → 추가) |
| artists_total  | int    | int    | 유지                       |
| artworks_total | int    | int    | 유지                       |
| museums_total  | int    | int    | 유지                       |
| artists        | array  | array  | 유지                       |
| artworks       | array  | array  | 유지                       |
| museums        | array  | array  | 유지                       |

#### 중첩: `SearchArtistItem`

| 필드                                 | v1.3.0 | v2.0.0 |
| ------------------------------------ | ------ | ------ |
| id, name_ko, name_en, thumbnail_url? | 유지   | 유지   |

Types가 `nationality_ko/en` 추가 필드를 갖고 있음 → **원칙 B에 따라 제거**
(Types에서 축소).

#### 중첩: `SearchArtworkItem`

| 필드                                    | v1.3.0       | v2.0.0                                                     |
| --------------------------------------- | ------------ | ---------------------------------------------------------- |
| id, title_ko, title_en, artist_name_ko? | 유지         | 유지                                                       |
| image_url?                              | string(uri)? | string(uri)? (**[B1]**, 현재 Types `thumbnail_url` → 정정) |

Types `artist_name_en` 추가 필드 → 원칙 C에 따라 판단. **실사용 없으면 제거**.

#### 중첩: `SearchMuseumItem`

| 필드                 | v1.3.0    | v2.0.0                             |
| -------------------- | --------- | ---------------------------------- |
| id, name_ko, name_en | 유지      | 유지                               |
| city                 | string    | string (Types `city_ko/en` → 축소) |
| country_code         | string(2) | string(2) (Types 미지원 → 추가)    |

**변경 없음.** 프론트 Types 정리만 필요.

---

## 4. 요약: 종민 측 수정 요청 4건

| #   | 파일                                                                    | 작업                                                                                     |
| --- | ----------------------------------------------------------------------- | ---------------------------------------------------------------------------------------- |
| ①   | `/api/v1/museums/[id]/artworks/route.ts`                                | `year_label`/`thumbnail_url` 변환 제거 → `year_created`/`image_url` 반환                 |
| ②   | `/api/v1/artists/[id]/route.ts`                                         | `artwork_count` 집계 SQL 추가                                                            |
| ③   | `/api/v1/artists/[id]/artworks/route.ts` 및 `/api/v1/artworks/route.ts` | `museum_name_*` 평면 → `current_museum: {id, name_ko, name_en, country_code}?` 중첩 객체 |
| ④   | `/api/v1/artworks/[id]/route.ts`                                        | artist JOIN SQL에 `nationality`, `birth_year`, `death_year` 추가                         |

부가: `artwork_status` enum이 DB에서 이미 4개로 확정되어 있는지 확인
(`"unknown"` 존재 불가). 부가: `places.opening_hours`·`admission` jsonb 내부
구조 확인 및 v2.0.0 sub-schema 정렬.

---

## 5. 요약: 현빈 측 Types·컴포넌트 수정 목록

### 자동 적용 (종민 응답 없이 진행 가능) — **다음 PR에서 즉시 반영**

| 대상 파일                  | 수정                                                                                                                                                                                                                                                                                        |
| -------------------------- | ------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------- |
| `src/types/museum.ts`      | `city_ko/en`/`country_ko/en` → `city`/`country`/`country_code`. `website_url` → `website`. `thumbnail_url` 제거. `institution_type` 추가. `opening_hours`/`admission` sub-schema 적용. `PlaceInfo.country_code` 추가.                                                                       |
| `src/types/artist.ts`      | `nationality_ko/en` → `nationality`. `biography_ko/en` → `bio_ko/en`. `style_ko/en` → `movements: Array<{name_ko, name_en, period_start?, period_end?}>`. `ArtistSummary.movements` 추가. `ArtistDetail.artwork_count` 유지.                                                                |
| `src/types/artwork.ts`     | `year_label` → `year_created: int?` + `year_end: int?`. `thumbnail_url` → `image_url`. `ArtworkStatus`에서 `"unknown"` 제거. `artist.nationality_ko/en` → `nationality`. `city_ko/en`/`country_ko/en` → `city`/`country_code`. `MuseumArtworkSummary` 제거 또는 단순화.                     |
| `src/types/search.ts`      | `page`, `per_page`, `artists_total`, `artworks_total`, `museums_total` 5필드 추가. `SearchArtistItem.nationality_ko/en` 제거. `SearchArtworkItem.thumbnail_url` → `image_url`, `artist_name_en` 실사용 검토 후 제거. `SearchMuseumItem.city_ko/en`/`country_ko/en` → `city`/`country_code`. |
| `src/types/map.ts`         | `CountryMapData.latitude/longitude` 추가 (API 반환값 사용 시). `museum_count` 제거. `ArtistCountryDistribution.latitude/longitude` 추가.                                                                                                                                                    |
| `src/lib/country-names.ts` | **확장**. `getCountryName(code, locale)`·`getCityName(city, locale)` 유틸 추가.                                                                                                                                                                                                             |
| 각 컴포넌트                | 새 Types에 따라 필드 접근 경로 수정 (MuseumHero, ArtistHero/Info, ArtworkHero, Gallery 등).                                                                                                                                                                                                 |

### 종민 응답 대기 (Types 구조만 선반영, 실제 API 동작은 후속) — **후속 PR**

| 대상                         | 수정                                                                      |
| ---------------------------- | ------------------------------------------------------------------------- |
| `ArtworkSummaryWithMuseum`   | `museum_name_*` → `current_museum: {id, name_ko, name_en, country_code}?` |
| `ArtworkDetail.artist`       | `nationality`, `birth_year`, `death_year` 추가 반영                       |
| `ArtistDetail.artwork_count` | API 반환 보장 후 필드 활용                                                |
| `opening_hours`/`admission`  | API sub-schema 확정 후 타입 동기화                                        |

---

## 6. Out of Scope (v2.0.0에서 다루지 않음)

- `/map/countries`의 `latitude`/`longitude` 서버 계산 유지 여부 (섹션 3-1 후속)
- 이미지 썸네일 최적화 (`image_url` + 쿼리 파라미터 방식) — next/image 도입 시
- `artist_name_en` 실사용 검토 (검색 결과 UI 결정 후)
- v2.1.0 이후: movements의 대표(`primary_movement`) 파생 필드 도입 여부

---

## 7. 향후 운영 원칙 (v2.0.0 이후)

1. **모든 API 응답 구조 변경은 Spec 업데이트와 동반**. 코드만 바꾸고 Spec을 두지
   않는 변경은 금지.
2. **PATCH** (v2.0.1): 버그 수정, 설명 보완. 필드 변경 없음.
3. **MINOR** (v2.1.0): 하위 호환 유지하며 필드 추가. 기존 클라이언트 영향 없음.
4. **MAJOR** (v3.0.0): 필드 제거·이름 변경·타입 변경. 클라이언트 재작업 필요.
5. **매 릴리스마다** `docs/specs/` 아래 버전별 파일 보관. 변경 이력은 본 문서의
   섹션 2 형식을 따름.
