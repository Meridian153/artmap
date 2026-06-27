---
name: "Feature Implementation"
description: "Next.js 풀스택 기능 개발"
title: "[Feat] "
labels: ["enhancement"]
---

## 완료 조건 (Definition of Done)

### 기능 범위

- [ ] 구현할 기능: [간단한 설명]
- [ ] API가 필요한 경우: `/api/v1/...`
- [ ] UI/지도가 필요한 경우: `src/components/...` 또는 `src/app/...`

### API 개발 (해당 시)

- [ ] 신규 Route Handler는 Drizzle ORM 기반으로 작성
- [ ] 필요한 경우 `src/lib/schema.ts`에 스키마 정의 추가
- [ ] DB 집계/인덱스를 활용해 대량 데이터를 Node.js 메모리로 끌어오지 않음
- [ ] API 오류 응답은 `application/problem+json` 형식 준수
- [ ] `process.env.NEXT_PUBLIC_*`로 민감한 값이 노출되지 않음

### UI/지도 개발 (해당 시)

- [ ] 지도 관련 코드는 `react-map-gl/maplibre` 경로 사용
- [ ] 백엔드 응답 스키마/타입 변경이 프론트엔드 타입 체인에 영향을 주지 않거나
      함께 반영
- [ ] Tailwind CSS 유틸리티 클래스만 사용
- [ ] 로딩, 에러, 엣지 케이스 대응

### 검증

- [ ] `pnpm run build` 통과
- [ ] `pnpm run lint` 통과
- [ ] TypeScript strict 모드 준수 (`any` 타입 사용 금지)
- [ ] 기존에 해당 API/타입을 의존하던 코드에 영향이 없는지 확인

## 기술 고려사항

### 백엔드

- 데이터베이스는 PostgreSQL + PostGIS (Neon)를 사용합니다.
- DB 스키마의 단일 정의 원천은 `src/lib/schema.ts`입니다.
- 마이그레이션이 필요한 경우 `drizzle-kit`을 사용합니다.

### 프론트엔드

- 지도: MapLibre GL JS + `react-map-gl/maplibre`
- 스타일링: Tailwind CSS
- 타입: `src/types/` 및 `src/lib/schema.ts` 기준

## 테스트 계획

- [ ] API 응답 및 상태 코드 검증
- [ ] UI/기능 회귀 검증 (스키마 변경 영향도 포함)
- [ ] 빌드 및 린트 통과

## 의존성 및 참고 자료

- 관련 파일:
  - API: `src/app/api/v1/...`
  - 스키마: `src/lib/schema.ts`
  - 컴포넌트: `src/components/...`
  - 타입: `src/types/...`
- 선행 작업 이슈: #
