# 코드 리뷰 가이드 (Frontend)

## 1. 리뷰 원칙

리뷰 시 아래 가이드라인을 준수하여 **한국어**로 작성해줘.

- **형식**: 구체적인 코드 수정이 필요할 경우 반드시 GitHub의 **`Suggested changes`** 기능을 사용하여 직접 코드를 제안해줘.
- **논리적 근거**: 수정을 요청할 때는 반드시 **"왜(Why)"** 그렇게 해야 하는지 이유를 설명해줘. (예: 불필요한 리렌더링 방지, 번들 크기 최소화, XSS 방지 등)
- **태도**: 결함은 단호하게 지적하되, 구체적인 장애 시나리오를 함께 설명해줘. 훌륭한 설계나 패턴에는 구체적인 칭찬을 아끼지 말아줘.

---

## 2. 아키텍처 및 폴더 구조 규칙

이 프로젝트는 **Next.js 16 App Router** 기반으로 아래 폴더 구조를 따라. 각 레이어의 책임을 확인하고 위반 시 지적해줘.

| 폴더          | 역할                                                                                                                      |
| ------------- | ------------------------------------------------------------------------------------------------------------------------- |
| `app/`        | Next.js App Router 라우트 및 페이지. 레이아웃(`layout.tsx`), 페이지(`page.tsx`)만 위치. 비즈니스 로직은 hooks/api로 위임. |
| `components/` | 재사용 가능한 UI 컴포넌트. `ui/`(shadcn 기본), `common/`(프로젝트 공통), `card/`, `layout/` 등으로 분류.                  |
| `lib/api/`    | 서버 API 호출 함수. 순수 함수로만 구성. 컴포넌트 의존성 금지.                                                             |
| `lib/hooks/`  | TanStack Query 기반 훅. 서버 상태 관리. `use-` 접두사 필수.                                                               |
| `lib/utils/`  | 순수 유틸리티 함수. 사이드 이펙트 없이 입력 → 출력만 담당.                                                                |
| `types/`      | TypeScript 타입 정의 파일. API 응답 타입, 도메인 타입 등.                                                                 |

- `app/` 페이지에서 직접 `fetch`나 `apiClient`를 호출하는 것을 지적해줘. 반드시 `lib/hooks/` 또는 `lib/api/`를 통해야 해.
- `lib/api/`에 React 관련 코드(`useState`, `useEffect` 등)가 포함되면 지적해줘.
- `types/`에 컴포넌트 Props 타입이 정의되면 지적해줘. Props 타입은 해당 컴포넌트 파일 내에 정의해야 해.

---

## 3. 코딩 컨벤션

[CODING_CONVENTIONS.md](../CODING_CONVENTIONS.md)를 기준으로 아래 사항을 집중 리뷰해줘.

### 3-1. 네이밍 규칙

- **컴포넌트 파일**: `PascalCase` (예: `BudgetCandidateCard.tsx`)
- **훅/유틸 파일**: `kebab-case` (예: `use-block-detail.ts`, `date.ts`)
- **컴포넌트 함수**: `PascalCase` (예: `const MyComponent = () => {}`)
- **훅 함수**: `camelCase` + `use` 접두사 (예: `const useBlockDetail = () => {}`)
- **이벤트 핸들러 Props**: `on` 접두사 (예: `onSelectClick`, `onOpenChange`)
- **컴포넌트 내부 핸들러**: `handle` 접두사 (예: `const handleClick = () => {}`)
- **상수 (모듈 스코프)**: `UPPER_SNAKE_CASE` (예: `const MAX_RETRY_COUNT = 3`)

### 3-2. TypeScript 규칙

- **`interface` 사용 금지**: `declare global` 블록 외에는 반드시 `type`을 사용해야 해. `interface`가 발견되면 지적해줘.

  ```ts
  // ❌ Bad
  interface UserProps {
    name: string;
  }

  // ✅ Good
  type UserProps = { name: string };
  ```

- **`import type` 필수**: 타입만 임포트할 때는 반드시 `import type`을 사용해야 해. 누락 시 지적해줘.

  ```ts
  // ❌ Bad
  import { ReactNode } from "react";

  // ✅ Good
  import type { ReactNode } from "react";
  import { useState, type ReactNode } from "react";
  ```

- **`any` 타입 금지**: `any` 사용은 `types/svg.d.ts` 같은 불가피한 모듈 선언 외에는 지적해줘. 대안(`unknown`, 구체적 타입)을 제시해줘.

- **타입 단언(`as`) 남용 금지**: `as`를 사용할 경우 이유가 주석으로 설명되어 있는지 확인해줘. `as any`는 무조건 지적해줘.

- **미사용 변수**: 사용하지 않는 변수, 함수 파라미터는 `_` 접두사를 붙이거나 제거해야 해.

### 3-3. 포매팅

- 세미콜론, 따옴표(큰따옴표), trailing comma, 들여쓰기(2스페이스)가 `.prettierrc` 기준과 다르면 지적해줘.
- Tailwind 클래스 순서가 공식 권장 순서([Prettier 플러그인 기준](https://github.com/tailwindlabs/prettier-plugin-tailwindcss))와 다르면 지적해줘.

---

## 4. Next.js 버그 및 보안 이슈

### 4-1. Server / Client 컴포넌트 경계

- `"use client"` 지시어가 없는 파일에서 `useState`, `useEffect`, `useRef`, 브라우저 API(`window`, `document`, `localStorage`)를 사용하면 지적해줘. 서버 컴포넌트에서는 실행 시 에러가 발생해.
- 반대로 `"use client"`가 불필요하게 붙어 있어 서버 컴포넌트로 유지할 수 있는 경우도 지적해줘. 클라이언트 번들이 커지는 원인이 돼.
- `"use client"` 컴포넌트에서 `async/await`를 직접 사용해 데이터를 fetch하면 지적해줘. 클라이언트 컴포넌트에서의 비동기 데이터 패칭은 TanStack Query를 통해야 해.

### 4-2. 환경변수 보안

- `NEXT_PUBLIC_` 접두사가 없는 환경변수를 클라이언트 컴포넌트에서 참조하면 지적해줘. 런타임에 `undefined`가 되어 조용히 실패해.
- `NEXT_PUBLIC_` 접두사가 붙은 환경변수에 **API 시크릿 키, DB 접속 정보** 등 민감 정보를 담으면 반드시 지적해줘. 브라우저에 노출돼.
- 환경변수를 사용할 때 `process.env.VARIABLE`가 `undefined`일 경우에 대한 방어 코드가 없으면 지적해줘.

### 4-3. XSS 및 보안

- `dangerouslySetInnerHTML`을 사용하는 경우, 입력값에 대한 sanitize 처리가 없으면 XSS 취약점으로 지적해줘.
- 외부 URL을 그대로 `<a href>`나 `<Link href>`에 사용하면서 `rel="noopener noreferrer"` 처리가 없으면 지적해줘. Tabnabbing 공격에 취약해.
- 사용자 입력을 URL 파라미터에 그대로 사용하면서 인코딩(`encodeURIComponent`)이 없으면 지적해줘.

### 4-4. Next.js Image 컴포넌트

- `<img>` 태그를 직접 사용하면 Next.js `<Image>` 컴포넌트로 교체를 권장해줘. 자동 최적화(lazy loading, WebP 변환, 크기 조정)를 받지 못해.
- `<Image>`에 `alt`가 비어 있거나 없으면 접근성 이슈로 지적해줘.
- `<Image>`에 `width`/`height` 또는 `fill`이 없으면 레이아웃 시프트(CLS) 원인으로 지적해줘.

### 4-5. 잠재적 런타임 에러

- 옵셔널 체이닝(`?.`) 없이 API 응답 객체를 중첩 접근하면 `undefined` 에러 가능성으로 지적해줘. 구체적으로 "만약 `data.user`가 null이면 `data.user.name`에서 TypeError가 발생합니다"처럼 시나리오를 설명해줘.
- `Array.map()` 등 배열 메서드 호출 전에 배열 여부 확인이 없으면 지적해줘.
- `useRouter`의 `push`/`replace`를 비동기 처리 완료 전에 호출하면 경쟁 상태(race condition) 가능성으로 지적해줘.

---

## 5. 성능 및 효율성

### 5-1. 불필요한 리렌더링

- 컴포넌트 바깥에 정의해야 할 객체나 배열을 컴포넌트 내부 최상단에 정의하면 리렌더링마다 재생성되므로 지적해줘.

  ```tsx
  // ❌ Bad — 렌더링마다 새 배열 생성
  const MyComponent = () => {
    const OPTIONS = ["a", "b", "c"];
    ...
  }

  // ✅ Good
  const OPTIONS = ["a", "b", "c"];
  const MyComponent = () => { ... }
  ```

- Props로 인라인 객체나 함수를 전달하면 자식 컴포넌트가 매번 리렌더링되므로 지적해줘. `useCallback`, `useMemo` 사용이나 컴포넌트 외부로 분리를 제안해줘.

- `key` prop에 배열 `index`를 사용하면 리스트 재정렬 시 DOM 재생성 문제가 발생하므로 안정적인 고유 ID 사용을 권장해줘.

### 5-2. TanStack Query 사용

- 동일한 데이터를 여러 컴포넌트에서 각각 `fetch`로 중복 호출하면 지적해줘. TanStack Query의 캐싱을 활용해야 해.
- `useQuery`에서 `enabled` 옵션 없이 필수 파라미터가 `undefined`일 수 있는 경우 지적해줘. `enabled: !!planId` 같은 방어 처리가 필요해.
- `queryKey`가 일관성 없이 정의되면 캐시 무효화 문제로 이어지므로 `queryKey` 팩토리 함수 사용을 권장해줘.
- `useMutation`의 성공/실패 처리(`onSuccess`, `onError`)가 없으면 사용자 피드백 누락으로 지적해줘.

### 5-3. 번들 크기

- 라이브러리 전체를 import하고 일부만 사용하면 번들 크기 낭비로 지적해줘. Named import 사용을 권장해줘.

  ```ts
  // ❌ Bad
  import _ from "lodash";
  const result = _.pick(obj, ["a", "b"]);

  // ✅ Good
  import pick from "lodash/pick";
  ```

- 큰 컴포넌트나 라이브러리를 초기 로딩 시 불러올 필요가 없다면 `next/dynamic`으로 지연 로딩을 권장해줘.

### 5-4. useEffect 올바른 사용

- `useEffect` 내부에서 직접 `setState`를 동기 호출하면 cascading render가 발생하므로 지적해줘. 파생 상태는 `useMemo` 또는 렌더링 중 계산으로 대체를 제안해줘.

  ```tsx
  // ❌ Bad — 불필요한 추가 렌더링 발생
  useEffect(() => {
    setFullName(`${firstName} ${lastName}`);
  }, [firstName, lastName]);

  // ✅ Good
  const fullName = `${firstName} ${lastName}`;
  ```

- `useEffect` 의존성 배열에 사용하는 값이 누락되면 stale closure 버그로 지적해줘. 의도적으로 제외할 경우 이유를 주석으로 남기도록 권고해줘.

---

## 6. React 컴포넌트 패턴

### 6-1. Props 설계

- 필수 Props에 `?`(옵셔널)를 잘못 붙이거나, 옵셔널 Props에 기본값(`defaultProps` 또는 구조분해 기본값)이 없으면 지적해줘.
- Props가 5개를 초과하면 컴포넌트 분리 또는 Props 그루핑을 고려하도록 제안해줘.
- boolean Props 이름에 `is`, `has`, `should` 접두사가 없으면 가독성 문제로 지적해줘. (예: `loading` → `isLoading`)

### 6-2. 접근성(a11y)

- `onClick` 핸들러가 `<div>`, `<span>` 같은 비-인터랙티브 요소에 붙어 있으면 `<button>`으로 교체를 권장해줘. 키보드 접근이 불가능해.
- `<button>`에 텍스트 없이 아이콘만 있으면 `aria-label`이 있는지 확인해줘.
- 폼 `<input>`에 연결된 `<label>`이 없으면 스크린 리더 접근성 문제로 지적해줘.

### 6-3. 에러 처리

- API 호출 실패 시 사용자에게 피드백을 주는 처리(`onError`, toast, 에러 UI)가 없으면 지적해줘.
- `try/catch`에서 에러를 catch하고 아무 처리도 하지 않으면 반드시 지적해줘. 로그라도 남겨야 해.
