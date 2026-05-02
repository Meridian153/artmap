// 화가 목록 로딩 UI — page.tsx 데이터 패칭 중 Next.js가 자동으로 표시하는 스켈레톤
// CardGridSkeleton으로 카드 그리드와 동일한 레이아웃을 유지한다.

import { CardGridSkeleton } from "@/components/common/CardGridSkeleton";

export default function ArtistsLoading() {
  return (
    <div className="mx-auto max-w-7xl px-4 py-8 sm:px-6 lg:px-8">
      {/* 헤더 스켈레톤 */}
      <div className="mb-8 space-y-2">
        <div className="h-8 w-24 animate-pulse rounded bg-gray-200 dark:bg-gray-700" />
        <div className="h-4 w-16 animate-pulse rounded bg-gray-200 dark:bg-gray-700" />
      </div>
      <CardGridSkeleton count={12} />
    </div>
  );
}
