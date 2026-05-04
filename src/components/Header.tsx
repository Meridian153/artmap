// 글로벌 네비게이션 헤더 컴포넌트 — 모든 페이지 상단에 고정 표시

"use client";

import { useState } from "react";
import Link from "next/link";
import { usePathname } from "next/navigation";
import { SearchBar } from "@/components/SearchBar";

// 네비게이션 링크 정의
const NAV_LINKS = [
  { label: "화가", href: "/artists" },
  { label: "미술관", href: "/museums" },
  { label: "소개", href: "/about" },
];

// 현재 경로가 해당 메뉴와 일치하는지 확인 (하위 경로 포함)
function isActive(pathname: string, href: string): boolean {
  if (href === "/") return pathname === "/";
  return pathname === href || pathname.startsWith(href + "/");
}

// 글로벌 헤더 컴포넌트
export function Header() {
  const pathname = usePathname();
  // 모바일 메뉴 열림/닫힘 상태
  const [menuOpen, setMenuOpen] = useState(false);

  // 메뉴 링크 클릭 시 모바일 메뉴 닫기
  function handleNavClick() {
    setMenuOpen(false);
  }

  return (
    <header className="bg-card/80 sticky top-0 z-50 shadow-sm backdrop-blur-md">
      <div className="mx-auto max-w-7xl px-4">
        {/* 데스크톱/모바일 공통 상단 줄 */}
        <div className="flex h-14 items-center gap-4">
          {/* 로고 */}
          <Link
            href="/"
            className="text-foreground hover:text-muted-foreground shrink-0 text-xl font-bold transition-colors"
          >
            ArtMap
          </Link>

          {/* 데스크톱 검색바 (중앙 영역) */}
          <div className="hidden flex-1 justify-center px-8 lg:flex">
            <SearchBar className="w-full max-w-sm" />
          </div>

          {/* 데스크톱 네비게이션 링크 */}
          <nav className="hidden shrink-0 items-center gap-6 lg:flex">
            {NAV_LINKS.map(({ label, href }) => {
              const active = isActive(pathname, href);
              return (
                <Link
                  key={href}
                  href={href}
                  className={`relative pb-0.5 text-sm transition-colors ${
                    active
                      ? "text-foreground after:bg-foreground font-semibold after:absolute after:right-0 after:bottom-0 after:left-0 after:h-0.5 after:rounded-full"
                      : "text-muted-foreground hover:text-foreground"
                  }`}
                >
                  {label}
                </Link>
              );
            })}
          </nav>

          {/* 모바일: 오른쪽 끝에 햄버거 버튼 */}
          <div className="ml-auto flex lg:hidden">
            <button
              onClick={() => setMenuOpen((prev) => !prev)}
              aria-label={menuOpen ? "메뉴 닫기" : "메뉴 열기"}
              className="text-muted-foreground hover:text-foreground p-2 transition-colors"
            >
              {/* 햄버거 / X 아이콘 (SVG) */}
              {menuOpen ? (
                <svg
                  width={22}
                  height={22}
                  viewBox="0 0 24 24"
                  fill="none"
                  stroke="currentColor"
                  strokeWidth={2}
                  strokeLinecap="round"
                  aria-hidden="true"
                >
                  <line x1="18" y1="6" x2="6" y2="18" />
                  <line x1="6" y1="6" x2="18" y2="18" />
                </svg>
              ) : (
                <svg
                  width={22}
                  height={22}
                  viewBox="0 0 24 24"
                  fill="none"
                  stroke="currentColor"
                  strokeWidth={2}
                  strokeLinecap="round"
                  aria-hidden="true"
                >
                  <line x1="3" y1="6" x2="21" y2="6" />
                  <line x1="3" y1="12" x2="21" y2="12" />
                  <line x1="3" y1="18" x2="21" y2="18" />
                </svg>
              )}
            </button>
          </div>
        </div>

        {/* 모바일 드롭다운 메뉴 */}
        {menuOpen && (
          <div className="border-border flex flex-col gap-4 border-t py-4 lg:hidden">
            {/* 모바일 검색바 */}
            <SearchBar className="w-full" />

            {/* 모바일 네비게이션 링크 */}
            <nav className="flex flex-col gap-1">
              {NAV_LINKS.map(({ label, href }) => {
                const active = isActive(pathname, href);
                return (
                  <Link
                    key={href}
                    href={href}
                    onClick={handleNavClick}
                    className={`rounded-md px-2 py-2 text-sm transition-colors ${
                      active
                        ? "bg-muted text-foreground font-semibold"
                        : "text-muted-foreground hover:bg-muted hover:text-foreground"
                    }`}
                  >
                    {label}
                  </Link>
                );
              })}
            </nav>
          </div>
        )}
      </div>
    </header>
  );
}
