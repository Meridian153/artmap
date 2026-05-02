// 페이지네이션 컴포넌트 — /museums, /artists 등 리스트 페이지에서 공통으로 사용하는 페이지 이동 UI
// 현재 페이지 기준 앞뒤 2페이지씩 번호를 표시하고, 이전/다음 버튼을 제공한다.

"use client";

type PaginationProps = {
  currentPage: number;
  totalPages: number;
  onPageChange: (page: number) => void;
};

export function Pagination({ currentPage, totalPages, onPageChange }: PaginationProps) {
  // 총 페이지가 1이하면 페이지네이션 불필요
  if (totalPages <= 1) {
    return null;
  }

  // 현재 페이지 기준 앞뒤 2페이지씩, 최대 5개 번호 계산
  const startPage = Math.max(1, currentPage - 2);
  const endPage = Math.min(totalPages, currentPage + 2);
  const pageNumbers: number[] = [];
  for (let i = startPage; i <= endPage; i++) {
    pageNumbers.push(i);
  }

  const handlePrev = () => {
    if (currentPage > 1) {
      onPageChange(currentPage - 1);
    }
  };

  const handleNext = () => {
    if (currentPage < totalPages) {
      onPageChange(currentPage + 1);
    }
  };

  // 공통 버튼 스타일 — 비활성 버튼과 테두리 버튼에 재사용
  const borderButtonClass =
    "flex h-9 w-9 items-center justify-center rounded-md border border-gray-200 text-sm text-gray-600 transition-colors hover:bg-gray-50 disabled:cursor-not-allowed disabled:opacity-40 dark:border-gray-700 dark:text-gray-400 dark:hover:bg-gray-800";

  return (
    <nav
      role="navigation"
      aria-label="페이지네이션"
      className="flex items-center justify-center gap-1"
    >
      {/* 이전 버튼 — 첫 페이지에서 비활성화 */}
      <button
        onClick={handlePrev}
        disabled={currentPage === 1}
        aria-label="이전 페이지"
        className={borderButtonClass}
      >
        ‹
      </button>

      {/* 페이지 번호 버튼 */}
      {pageNumbers.map((page) => (
        <button
          key={page}
          onClick={() => onPageChange(page)}
          aria-label={`${page}페이지`}
          aria-current={page === currentPage ? "page" : undefined}
          className={
            page === currentPage
              ? "flex h-9 w-9 items-center justify-center rounded-md bg-gray-900 text-sm font-medium text-white dark:bg-gray-100 dark:text-gray-900"
              : borderButtonClass
          }
        >
          {page}
        </button>
      ))}

      {/* 다음 버튼 — 마지막 페이지에서 비활성화 */}
      <button
        onClick={handleNext}
        disabled={currentPage === totalPages}
        aria-label="다음 페이지"
        className={borderButtonClass}
      >
        ›
      </button>
    </nav>
  );
}
