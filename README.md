# ArtMap

전 세계 미술 작품의 소장 위치를 지도 기반으로 탐색하는 웹 서비스입니다.

화가를 검색하면 그 작품들이 세계 어디에 있는지 지도에서 한눈에 확인하고, 여행할
도시에 어떤 명작이 있는지 미리 파악할 수 있습니다.

---

## 아키텍처

**풀스택 Next.js** — 프론트엔드와 백엔드 API를 Next.js 하나로 처리합니다.

```
브라우저
  └── Next.js (Vercel)
        ├── App Router  → 화면 렌더링
        └── API Routes  → 데이터 처리 → PostgreSQL / PostGIS (Neon)
```

---

## 기술 스택

| 영역          | 기술                          |
| ------------- | ----------------------------- |
| 프레임워크    | Next.js 16 (App Router)       |
| 언어          | TypeScript 5.x                |
| 스타일링      | Tailwind CSS 4.x              |
| 지도          | MapLibre GL JS + react-map-gl |
| DB 클라이언트 | `pg` (node-postgres, Raw SQL) |
| 데이터베이스  | PostgreSQL + PostGIS (Neon)   |
| 배포          | Vercel                        |

---

## 프로젝트 구조

```
src/
├── app/
│   ├── (pages)/          # 화면 라우트
│   └── api/              # API Routes
├── components/           # 재사용 컴포넌트
├── lib/
│   ├── api.ts            # API 호출 함수 (프론트 → API Routes)
│   └── db/               # DB 클라이언트 (node-postgres)
├── types/                # TypeScript 타입 (OpenAPI 스펙 기반)
└── mocks/                # Mock 데이터

sql/
└── schema.sql            # DB 스키마 및 마이그레이션
```

---

## 관련 문서

- API 명세서: OpenAPI v1.3.0 (프로젝트 내부 문서 참조)
- ERD: 프로젝트 내부 문서 참조

---

## 로컬 개발 셋업

### 1. 저장소 클론 및 의존성 설치

```bash
git clone https://github.com/Meridian153/artmap.git
cd artmap
pnpm install
```

### 2. 환경 변수 설정

프로젝트 루트에 `.env.local` 파일을 생성합니다. `.env.example`을 복사해서
시작하면 됩니다.

```bash
cp .env.example .env.local
```

`.env.local` 내용 (MVP 단계):

```
NEXT_PUBLIC_USE_MOCK=true
```

**MVP 단계에서는 반드시 `NEXT_PUBLIC_USE_MOCK=true`로 설정해야 합니다.** 이 값이
없거나 `false`이면 프론트엔드가 아직 존재하지 않는 실제 API
엔드포인트(`/api/v1/...`)를 호출해 홈 지도가 뜨지 않습니다.

### 3. 개발 서버 실행

```bash
pnpm dev
```

브라우저에서 http://localhost:3000 접속.

---

## 트러블슈팅

### 홈 화면에 지도가 안 보이고 Console에 `/api/v1/map/countries 404` 에러

`.env.local` 파일이 없거나 `NEXT_PUBLIC_USE_MOCK=true`가 설정되지 않은
상태입니다. 위의 "환경 변수 설정" 단계를 확인하세요. `.env.local` 수정 후에는
`pnpm dev`를 재시작해야 합니다 (Ctrl+C 후 다시 실행).

### 커밋 시 "husky" 또는 "prettier" 관련 에러로 거부됨

이 프로젝트는 Husky pre-commit 훅을 통해 커밋 직전 Prettier 포맷 검사를
실행합니다. 포맷이 맞지 않는 파일이 있으면 커밋이 거부됩니다.

해결 방법:

```bash
pnpm prettier --write .
git add -A
git commit
```

또는 IDE의 Prettier 확장에서 formatOnSave를 켜두면 자동으로 포맷됩니다.
