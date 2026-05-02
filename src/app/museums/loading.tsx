// 미술관 목록 페이지 로딩 UI — page.tsx 데이터 패칭 중 Next.js App Router가 자동으로 표시

import { CardGridSkeleton } from "@/components/common/CardGridSkeleton";

export default function MuseumsLoading() {
  return (
    <div className="mx-auto max-w-7xl px-4 py-8 sm:px-6 lg:px-8">
      {/* 헤더 스켈레톤 */}
      <div className="mb-8 animate-pulse">
        <div className="h-8 w-32 rounded bg-gray-200 dark:bg-gray-700" />
        <div className="mt-2 h-4 w-20 rounded bg-gray-100 dark:bg-gray-800" />
      </div>

      <CardGridSkeleton count={12} />
    </div>
  );
}
