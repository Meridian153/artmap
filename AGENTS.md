# ArtMap 프로젝트 — AI 에이전트 공통 규칙

## 프로젝트 개요

- **서비스명**: ArtMap
- **설명**: 전 세계 미술 작품의 소장 위치를 지도 기반으로 탐색하는 웹 서비스
- **아키텍처**: 풀스택 Next.js — 프론트엔드(App Router)와 백엔드(API Routes)를
  하나의 Next.js 프로젝트로 처리. 별도 백엔드 서버 없음
- **배포**: Vercel 단일 배포

```
브라우저
  └── Next.js (Vercel)
        ├── App Router  → 화면 렌더링
        └── API Routes  → 데이터 처리 → PostgreSQL / PostGIS (Neon)
```

---

## 기술 스택

| 영역          | 기술                          | 비고                            |
| ------------- | ----------------------------- | ------------------------------- |
| 프레임워크    | Next.js (App Router)          | 프론트 + 백엔드 통합            |
| 언어          | TypeScript strict 모드        | any 타입 사용 금지              |
| 스타일링      | Tailwind CSS                  | 유틸리티 클래스만 사용          |
| 지도          | MapLibre GL JS + react-map-gl | OpenFreeMap 타일, API 키 불필요 |
| DB 클라이언트 | `pg` (node-postgres)          | Raw SQL, ORM 없음               |
| 데이터베이스  | PostgreSQL (Neon 호스팅)      | PostGIS 확장                    |
| 배포          | Vercel                        | 프론트 + API Routes 통합        |

> **지도 import 경로 주의**: 반드시 `react-map-gl/maplibre` 사용. `react-map-gl`
> 직접 import 시 Mapbox(유료)로 연결됨.

---

## 디렉토리 구조

```
src/
├── app/          → 페이지 라우팅 (App Router)
├── components/   → 재사용 컴포넌트
├── lib/          → 유틸리티, API 클라이언트
├── hooks/        → 커스텀 React 훅
├── types/        → TypeScript 타입 정의
└── mocks/        → Mock 데이터
sql/              → SQL 스키마 및 마이그레이션
```

---

## 코딩 컨벤션

- **TypeScript**: strict 모드. `any` 타입 사용 금지 (`unknown` 또는 구체적 타입
  사용)
- **스타일링**: Tailwind CSS만 사용. 별도 CSS 파일 생성 금지
- **컴포넌트**: 함수형 컴포넌트 + React Hooks. class 컴포넌트 금지
- **파일 네이밍**: 컴포넌트 PascalCase, 유틸/훅 camelCase
- **import 순서**: React/Next.js → 외부 라이브러리 → 내부 모듈 → 타입
- **다국어**: 모든 텍스트 필드는 한/영 분리 (`_ko`, `_en` 접미사)
- **ID**: UUID 형식
- **API 에러 응답**: RFC 9457 (`application/problem+json`) 형식

---

## 금지 사항

- `any` 타입 사용
- `console.log` 커밋 (디버깅 후 반드시 제거)
- 하드코딩된 API URL (환경 변수 사용)
- CSS Modules, styled-components 등 Tailwind 외 스타일링
- `react-map-gl` 직접 import (반드시 `react-map-gl/maplibre` 경유)
