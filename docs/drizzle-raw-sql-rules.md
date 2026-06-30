# Drizzle + Raw SQL 사용 규칙

기존 `pg Pool` 기반 API Route를 Drizzle로 마이그레이션할 때 사용한다.  
Drizzle의 쿼리 빌더를 강제하지 않고, SQL 본문을 최대한 유지하면서 스키마 객체로
타입 보호를 받는 방식을 따른다.

---

## 1. SQL은 그대로, Drizzle은 실행/타입 보호용으로 사용한다

- 쿼리 본문은 기존 SQL을 최대한 살린다.
- Drizzle은 DB 실행 주체와 스키마 기반 타입 체크 용도로만 사용한다.

### Good

```ts
import { db } from "@/lib/db";
import { sql } from "drizzle-orm";
import { artworks } from "@/lib/schema";

const rows = await db.execute(sql`
  SELECT ${artworks.id}, ${artworks.name_ko}
  FROM ${artworks}
  WHERE ${artworks.museum_id} = ${museumId}
`);
```

### Bad

```ts
// SQL을 굳이 Drizzle 빌더로 바꾸지 않는다.
const rows = await db
  .select({ id: artworks.id, name_ko: artworks.name_ko })
  .from(artworks);
```

---

## 2. 컬럼과 테이블은 스키마 객체로 참조한다

- `SELECT`, `FROM`, `WHERE`, `JOIN`, `ORDER BY` 등에 쓰이는 컬럼과 테이블은 모두
  `src/lib/schema.ts`에 정의된 객체를 사용한다.
- 문자열로 직접 쓰는 경우는 오타나 리팩터링 시 런타임 에러로 이어진다.

### Good

```ts
sql`SELECT ${artworks.id}, ${artworks.name_ko} FROM ${artworks}`;
```

### Bad

```ts
sql`SELECT id, name_ko FROM artworks`;
```

---

## 3. SQL 전용 기능은 문자열로 그대로 작성한다

- `COUNT(*)`, `AVG`, `SUM`, `DISTINCT`, `AS` 별칭, CTE, 윈도우 함수, PostGIS
  함수는 문자열로 유지한다.
- 스키마 객체로 표현할 수 없는 것을 억지로 객체로 만들지 않는다.

### Good

```ts
sql`
  SELECT ${artworks.id}, COUNT(*) AS view_count
  FROM ${artworks}
  GROUP BY ${artworks.id}
`;
```

### Bad

```ts
// COUNT(*) AS view_count 를 객체로 표현하려 하지 않는다.
```

---

## 4. 조인 테이블도 스키마에 정의하면 객체로 사용한다

- `artwork_artists`, `artwork_movements` 등 연결 테이블이 `schema.ts`에 정의되어
  있으면 스키마 객체로 참조한다.
- 아직 정의되지 않은 테이블은 문자열로 작성하고, 별도 PR에서 스키마 추가를
  검토한다.

### Good

```ts
import { artworks, artists, artwork_artists } from "@/lib/schema";

sql`
  SELECT ${artworks.id}, ${artists.name_ko}
  FROM ${artworks}
  JOIN ${artwork_artists} ON ${artworks.id} = ${artwork_artists.artwork_id}
  JOIN ${artists} ON ${artwork_artists.artist_id} = ${artists.id}
`;
```

### Bad

```ts
sql`
  SELECT a.id, ar.name_ko
  FROM artworks a
  JOIN artwork_artists aa ON a.id = aa.artwork_id
  JOIN artists ar ON aa.artist_id = ar.id
`;
```

---

## 5. 조건과 파라미터는 템플릿 리터럴 변수로 바인딩한다

- `${value}` 형태로 변수를 주입하면 Drizzle이 자동으로 파라미터 바인딩한다.
- 문자열 연결(`"WHERE id = " + id`)이나 `sql.raw()`는 SQL 인젝션 위험이 있으므로
  사용하지 않는다.

### Good

```ts
sql`WHERE ${artworks.id} = ${artworkId}`;
```

### Bad

```ts
sql.raw(`WHERE "artworks"."id" = '${artworkId}'`);
```

---

## 6. 결과 타입은 반드시 DTO로 지정한다

- `db.execute()`는 결과 타입을 자동으로 추론하지 않는다.
- `sql<T>` 또는 `db.execute<T>` 형태로 응답 DTO를 명시한다.

### Good

```ts
type ArtworkRow = {
  id: string;
  name_ko: string;
};

const rows = await db.execute<ArtworkRow>(sql`...`);
```

### Bad

```ts
const rows = await db.execute(sql`...`); // 타입이 unknown/any
```

---

## 7. 기존 라우트 마이그레이션은 SQL을 그대로 두고 실행 주체만 바꾼다

- 마이그레이션 첫 단계에서는 SQL 본문을 수정하지 않는다.
- `pool.query()` → `db.execute(sql\`...\`)`로만 변경한다.
- SQL 구조를 개선하는 리팩터링은 별도 커밋/PR로 분리한다.

---

## 8. `pool`과 `db`를 같은 라우트에서 혼용하지 않는다

- 하나의 라우트 안에서는 `pool`만 또는 `db`만 사용한다.
- 마이그레이션 중인 라우트는 `db`로 완전히 전환 후 커밋한다.

---

## 9. `db.execute()`의 반환 형태에 주의한다

- `pool.query<T>()`는 `{ rows }`를 반환한다.
- `db.execute<T>()`는 `@neondatabase/serverless` HTTP 드라이버 기준으로
  `NeonHttpQueryResult<T>` 객체를 반환한다.
- 실제 데이터 배열은 객체의 `.rows` 속성에 담겨 있으므로, 마이그레이션 시 반환
  구조를 확인하고 호출부를 수정한다.

### Good

```ts
const result = await db.execute<ArtworkRow>(sql`...`);
const rows = result.rows;
// rows[0] 사용
```

### Bad

```ts
const rows = await db.execute<ArtworkRow>(sql`...`);
// rows[0] 사용
// Neon HTTP 환경에서는 rows가 객체에 감싸져 있어 직접 인덱싱하면 타입/런타임 에러
```

---

## 10. 복잡한 쿼리는 하이브리드로 처리한다

- 단순한 부분은 Drizzle 빌더로, 복잡한 집계/PostGIS/CTE는 SQL 문자열로 섞어 쓸
  수 있다.
- 단, 한 라우트 안에서 두 스타일을 섞을 때는 가독성을 우선으로 판단한다.

### 예시

```ts
const rows = await db
  .select({
    id: artworks.id,
    name_ko: artworks.name_ko,
    view_count: sql<number>`COUNT(*)`,
  })
  .from(artworks)
  .groupBy(artworks.id)
  .where(sql`${artworks.museum_id} = ${museumId}`);
```

---

## 11. `any`와 `sql.raw()`는 금지한다

- `any` 타입 사용 금지. 결과 타입은 DTO로 명시한다.
- `sql.raw()`는 SQL 인젝션 위험이 있으므로 사용 금지. 정말 필요한 경우는 리드
  리뷰에서 합의한다.

---

## 12. 마이그레이션 완료 후 `pool` 제거를 별도 이슈로 관리한다

- 모든 라우트가 `db`로 전환된 후 `src/lib/db.ts`의 `pool` 객체와 `pg` 의존성을
  제거한다.
- `pool` 제거는 전환 완료 시점에 한 번에 처리한다.
