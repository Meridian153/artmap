# ArtMap

전 세계 미술 작품의 소장 위치를 지도 기반으로 탐색하는 웹 서비스입니다.

화가를 검색하면 그 작품들이 세계 어디에 있는지 지도에서 한눈에 확인하고,
여행할 도시에 어떤 명작이 있는지 미리 파악할 수 있습니다.

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

| 영역 | 기술 |
|---|---|
| 프레임워크 | Next.js 16 (App Router) |
| 언어 | TypeScript 5.x |
| 스타일링 | Tailwind CSS 4.x |
| 지도 | MapLibre GL JS + react-map-gl |
| DB 클라이언트 | `pg` (node-postgres, Raw SQL) |
| 데이터베이스 | PostgreSQL + PostGIS (Neon) |
| 배포 | Vercel |

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
