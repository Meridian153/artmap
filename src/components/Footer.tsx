// 글로벌 푸터 컴포넌트 — 모든 페이지 하단에 표시

import Link from "next/link";

// 푸터 컴포넌트
export function Footer() {
  // 의도적 다크 푸터 — 라이트/다크 모두에서 어두운 배경을 유지한다.
  // 다크 모드에서는 페이지 배경(#0a0a0a)과 구분되도록 gray-800로 한 단계 밝게.
  return (
    <footer className="bg-gray-900 text-gray-300 dark:bg-gray-800">
      <div className="mx-auto flex max-w-7xl flex-col items-center gap-3 px-4 py-8 text-center text-sm">
        {/* 서비스 설명 */}
        <p>© 2026 ArtMap. 전 세계 미술 작품의 위치를 지도에서 탐색하세요.</p>

        {/* 하단 링크 */}
        <div className="flex items-center gap-4">
          <Link href="/about" className="transition-colors hover:text-gray-200">
            소개
          </Link>
          <span className="text-gray-400">|</span>
          <Link href="/contact" className="transition-colors hover:text-gray-200">
            문의
          </Link>
        </div>
      </div>
    </footer>
  );
}
