@AGENTS.md

---

# Claude Code 전용 작업 규칙

## 작업 방식

- 작업 시작 전 관련 파일을 먼저 읽고 현재 상태 파악
- 수정할 파일이 있으면 기존 코드 패턴을 먼저 확인하고, 동일 패턴으로 작성
- 새 파일 생성 시 파일 상단에 이 파일의 역할을 한국어 주석으로 설명
- 모든 함수와 주요 로직 블록에 한국어 주석 포함

---

## 컴포넌트 규칙

- Props 타입을 반드시 `interface`로 별도 정의하고 `export`
- 컴포넌트 파일 하나에 컴포넌트 하나 (단일 책임)
- 컴포넌트 Props에 선택적 속성은 기본값 제공

```tsx
// import 순서: React/Next.js → 외부 라이브러리 → 내부 모듈 → 타입
import { useState } from 'react'
import Link from 'next/link'
import type { ArtistSummary } from '@/types/artist'

// Props 인터페이스는 컴포넌트 바로 위에 정의하고 export
export interface ArtistCardProps {
  artist: ArtistSummary
  showMuseum?: boolean  // 선택적 속성은 기본값 제공
}

// named export 사용 (page.tsx, layout.tsx, route.ts 제외)
export function ArtistCard({ artist, showMuseum = true }: ArtistCardProps) {
  return ( /* JSX */ )
}
```

---

## Mock 데이터 전략

- **환경 변수**: `NEXT_PUBLIC_USE_MOCK=true` 이면 Mock 데이터 사용
- **Mock 데이터 위치**: `src/mocks/`
- **분기 위치**: API 클라이언트(`src/lib/api.ts`)에서 환경 변수 기준으로
  Mock/실제 API 분기
- **Mock 구조**: OpenAPI Spec v1.3.0의 스키마와 동일한 구조 유지

---

## API 호출 패턴

- 모든 API 호출은 `src/lib/api.ts`를 경유
- 컴포넌트 내 직접 `fetch` 호출 금지
- 에러 처리: RFC 9457 ProblemDetail 형식 파싱
- 화가 상세 페이지: `Promise.allSettled`로 3개 API 병렬 호출
- 검색 API: `useDebounce` 훅 적용 (300ms 대기)
- 429 응답 시: `Retry-After` 헤더 확인 후 대기

---

## 지도 관련 규칙

- **라이브러리**: `react-map-gl/maplibre` (이 import 경로를 정확히 사용할 것)
- **타일**: OpenFreeMap (API 키 불필요)
- MapLibre는 브라우저 전용 → 서버 사이드 렌더링 불가
- 지도 컴포넌트는 반드시 `'use client'` 디렉티브 또는
  `dynamic import with { ssr: false }`

```tsx
// ✅ 올바른 방법
import { Map, Marker } from "react-map-gl/maplibre";
import "maplibre-gl/dist/maplibre-gl.css";

// ❌ 잘못된 방법 — Mapbox(유료)로 연결됨
import { Map, Marker } from "react-map-gl";
```

```tsx
// SSR 방지 dynamic import 패턴
import dynamic from "next/dynamic";

const ArtMap = dynamic(() => import("@/components/ArtMap"), {
  ssr: false,
  loading: () => <div>지도를 불러오는 중...</div>,
});
```

---

## 파일 경로 규칙

| 파일 유형      | 경로                                 |
| -------------- | ------------------------------------ |
| 페이지         | `src/app/{route}/page.tsx`           |
| 레이아웃       | `src/app/{route}/layout.tsx`         |
| 로딩 UI        | `src/app/{route}/loading.tsx`        |
| 에러 UI        | `src/app/{route}/error.tsx`          |
| 컴포넌트       | `src/components/{ComponentName}.tsx` |
| 커스텀 훅      | `src/hooks/use{HookName}.ts`         |
| 타입 정의      | `src/types/{domain}.ts`              |
| 유틸 함수      | `src/lib/{utilName}.ts`              |
| API 클라이언트 | `src/lib/api.ts`                     |
| Mock 데이터    | `src/mocks/{domain}.ts`              |

---

## 커밋 메시지 형식

```
feat:     새 기능
fix:      버그 수정
style:    스타일링 변경 (기능 변화 없음)
refactor: 코드 구조 개선
docs:     문서 수정
chore:    설정, 빌드 관련
```

---

## 수정 전 반드시 이유를 먼저 설명해야 하는 파일

- `next.config.ts` — 전체 동작에 영향
- `tsconfig.json` — TypeScript 설정
- `sql/` 하위 파일 — DB 스키마 변경 (마이그레이션 필요)
- `src/app/layout.tsx` — 전체 페이지 레이아웃
- `src/types/` 하위 파일 — 모든 컴포넌트 타입에 영향

---

## 참조 문서

- **API 명세**: OpenAPI Spec v1.3.0 (11개 엔드포인트)
- **데이터 구조**: ERD (8개 테이블, 3개 Enum)
- **페이지 구조**: IA 문서 사이트맵 참조
- **기능 요구사항**: PRD F-001 ~ F-005 (MVP P0)
