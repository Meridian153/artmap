// 글로벌 푸터 컴포넌트 — 모든 페이지 하단에 표시

import Link from 'next/link'

// 푸터 컴포넌트
export function Footer() {
  return (
    <footer className="bg-gray-900 text-gray-400">
      <div className="max-w-7xl mx-auto px-4 py-8 flex flex-col items-center gap-3 text-sm text-center">
        {/* 서비스 설명 */}
        <p>© 2026 ArtMap. 전 세계 미술 작품의 위치를 지도에서 탐색하세요.</p>

        {/* 하단 링크 */}
        <div className="flex items-center gap-4">
          <Link href="/about" className="hover:text-gray-200 transition-colors">
            소개
          </Link>
          <span className="text-gray-600">|</span>
          <Link href="/contact" className="hover:text-gray-200 transition-colors">
            문의
          </Link>
        </div>
      </div>
    </footer>
  )
}
