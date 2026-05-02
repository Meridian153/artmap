// 카드 그리드 스켈레톤 — 리스트 페이지 로딩 중 표시하는 플레이스홀더 UI
// animate-pulse 효과로 세로가 가로보다 긴 카드(이미지 + 텍스트 영역)를 그리드로 나열한다.

// 기본 스켈레톤 카드 수 — 컴포넌트 외부 상수로 정의하여 리렌더링마다 재생성되지 않도록 함
const DEFAULT_COUNT = 12;
// 기본 그리드 클래스 — 페이지별로 className prop으로 재정의 가능
const DEFAULT_GRID_CLASS = "grid-cols-1 md:grid-cols-2 lg:grid-cols-3";

type CardGridSkeletonProps = {
  count?: number;
  /** 그리드 컨테이너에 적용할 Tailwind 클래스. 미지정 시 1→2→3열 기본값 사용 */
  className?: string;
};

export function CardGridSkeleton({ count = DEFAULT_COUNT, className }: CardGridSkeletonProps) {
  return (
    <div className={`grid gap-6 ${className ?? DEFAULT_GRID_CLASS}`}>
      {Array.from({ length: count }).map((_, i) => (
        // 스켈레톤 카드는 동일한 더미 요소이므로 인덱스를 key로 사용 (재정렬 없음)
        <div
          key={i}
          className="animate-pulse overflow-hidden rounded-lg bg-gray-100 dark:bg-gray-800"
        >
          {/* 이미지 영역 — 세로가 가로보다 긴 4:5 비율 */}
          <div className="aspect-[4/5] w-full bg-gray-200 dark:bg-gray-700" />
          {/* 텍스트 영역 */}
          <div className="space-y-2 p-3">
            <div className="h-3 w-3/4 rounded bg-gray-200 dark:bg-gray-700" />
            <div className="h-3 w-1/2 rounded bg-gray-200 dark:bg-gray-700" />
          </div>
        </div>
      ))}
    </div>
  );
}
