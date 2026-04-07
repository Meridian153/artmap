// 검색바 컴포넌트 — 화가, 작품, 미술관 통합 검색 UI (현재는 껍데기)

// Props 인터페이스
export interface SearchBarProps {
  className?: string
}

// 검색바 UI 컴포넌트 (실제 검색 기능은 추후 구현)
export function SearchBar({ className = '' }: SearchBarProps) {
  return (
    <div className={`relative flex items-center ${className}`}>
      {/* 검색 아이콘 (SVG) */}
      <svg
        className="absolute left-3 text-gray-400 pointer-events-none"
        width={16}
        height={16}
        viewBox="0 0 24 24"
        fill="none"
        stroke="currentColor"
        strokeWidth={2}
        strokeLinecap="round"
        strokeLinejoin="round"
        aria-hidden="true"
      >
        <circle cx="11" cy="11" r="8" />
        <line x1="21" y1="21" x2="16.65" y2="16.65" />
      </svg>
      {/* 검색 입력 필드 */}
      <input
        type="search"
        placeholder="화가, 작품, 미술관 검색..."
        className="w-full pl-9 pr-4 py-2 text-sm bg-gray-100 border border-transparent rounded-full
          focus:outline-none focus:border-gray-300 focus:bg-white transition-colors
          placeholder:text-gray-400"
      />
    </div>
  )
}
