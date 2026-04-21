// 검색바 컴포넌트 — 화가·작품·미술관 통합 검색 UI
// 입력을 300ms debounce 후 search API에 질의하고, 결과를 하단 드롭다운(SearchDropdown)으로 표시한다.

"use client";

import { useEffect, useRef, useState } from "react";
import { useRouter } from "next/navigation";
import { search } from "@/lib/api";
import { useDebounce } from "@/hooks/useDebounce";
import type { SearchResult } from "@/types/search";
import { SearchDropdown, type SearchStatus } from "@/components/search/SearchDropdown";

// 검색어 최소 길이 — API 규칙과 일치 (route.ts의 2자 검증)
const MIN_QUERY_LENGTH = 2;
// 자동완성 모드 카테고리별 최대 반환 수 — API 기본값과 동일
const AUTOCOMPLETE_LIMIT = 5;

// Props 타입
export type SearchBarProps = {
  className?: string;
};

// 검색바 UI 컴포넌트
export function SearchBar({ className = "" }: SearchBarProps) {
  const router = useRouter();

  // ── 상태 ───────────────────────────────────────────────────────────────
  const [query, setQuery] = useState("");
  const [status, setStatus] = useState<SearchStatus>("idle");
  const [results, setResults] = useState<SearchResult | null>(null);
  const [isOpen, setIsOpen] = useState(false);

  // debounce된 쿼리 — 이 값이 실제 API 호출 트리거가 된다
  const debouncedQuery = useDebounce(query, 300);

  // 이전 in-flight fetch를 취소하기 위한 AbortController 보관
  const abortRef = useRef<AbortController | null>(null);
  // 바깥 클릭 감지를 위한 wrapper ref
  const wrapperRef = useRef<HTMLDivElement | null>(null);

  // ── debouncedQuery 변경 → API 호출 ─────────────────────────────────────
  useEffect(() => {
    // 2자 미만이면 API 호출하지 않고 idle 상태로 리셋
    if (debouncedQuery.length < MIN_QUERY_LENGTH) {
      // 이전 요청이 진행 중이면 취소
      if (abortRef.current) {
        abortRef.current.abort();
        abortRef.current = null;
      }
      setStatus("idle");
      setResults(null);
      return;
    }

    // 이전 요청 취소 — 사용자가 빠르게 타이핑할 때 오래된 응답이 덮어쓰는 것을 방지
    if (abortRef.current) {
      abortRef.current.abort();
    }
    const controller = new AbortController();
    abortRef.current = controller;

    setStatus("loading");

    // 자동완성 모드: page 없이 limit만 전달
    search({ q: debouncedQuery, limit: AUTOCOMPLETE_LIMIT }, controller.signal)
      .then((data) => {
        // 응답 도착 시점에 이미 새 요청이 생겼다면(abort됨) 처리하지 않는다
        if (controller.signal.aborted) {
          return;
        }
        const total = data.artists.length + data.artworks.length + data.museums.length;
        if (total === 0) {
          setStatus("empty");
          setResults(data);
        } else {
          setResults(data);
          setStatus("success");
        }
      })
      .catch((error: unknown) => {
        // AbortError는 정상 취소이므로 무시
        if (error instanceof DOMException && error.name === "AbortError") {
          return;
        }
        // Fetch 중단이 다른 형태로 올 수도 있음 — 안전장치
        if (error instanceof Error && error.name === "AbortError") {
          return;
        }
        console.error("[SearchBar] search failed", error);
        setStatus("error");
      });

    // effect cleanup — 새로운 debouncedQuery로 재실행될 때 이전 요청 취소
    return () => {
      controller.abort();
    };
  }, [debouncedQuery]);

  // ── status → isOpen 동기화 ─────────────────────────────────────────────
  // 결과/에러/로딩 상태가 되면 드롭다운을 자동으로 연다. idle은 닫는다.
  useEffect(() => {
    if (status === "idle") {
      setIsOpen(false);
    } else {
      setIsOpen(true);
    }
  }, [status]);

  // ── 바깥 클릭으로 드롭다운 닫기 ────────────────────────────────────────
  useEffect(() => {
    function handleMouseDown(event: MouseEvent) {
      // wrapper 내부 클릭은 무시, 외부 클릭이면 닫는다
      if (wrapperRef.current && !wrapperRef.current.contains(event.target as Node)) {
        setIsOpen(false);
      }
    }
    document.addEventListener("mousedown", handleMouseDown);
    return () => {
      document.removeEventListener("mousedown", handleMouseDown);
    };
  }, []);

  // ── 입력 핸들러 ────────────────────────────────────────────────────────
  function handleChange(event: React.ChangeEvent<HTMLInputElement>) {
    const next = event.target.value;
    setQuery(next);
    // 입력을 완전히 비우면 즉시 상태·결과를 초기화하고 드롭다운을 닫는다
    if (next.length === 0) {
      setStatus("idle");
      setResults(null);
      setIsOpen(false);
    }
  }

  // ── 포커스 시 재오픈 ───────────────────────────────────────────────────
  // 바깥 클릭으로 닫은 뒤 input을 다시 클릭하면 이전 결과를 다시 보여준다.
  function handleFocus() {
    if (query.length >= MIN_QUERY_LENGTH && results !== null) {
      setIsOpen(true);
    }
  }

  // ── 항목 클릭 → 상세 페이지 이동 ───────────────────────────────────────
  function handleItemClick(path: string) {
    setIsOpen(false);
    router.push(path);
  }

  return (
    <div ref={wrapperRef} className={`relative flex items-center ${className}`}>
      {/* 검색 아이콘 (SVG) */}
      <svg
        className="pointer-events-none absolute left-3 text-gray-400"
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
        value={query}
        onChange={handleChange}
        onFocus={handleFocus}
        placeholder="화가, 작품, 미술관 검색..."
        className="w-full rounded-full border border-transparent bg-gray-100 py-2 pr-4 pl-9 text-sm text-gray-900 transition-colors placeholder:text-gray-400 focus:border-gray-300 focus:bg-white focus:outline-none dark:bg-gray-800 dark:text-gray-100 dark:focus:border-gray-600 dark:focus:bg-gray-700"
      />
      {/* 드롭다운 — isOpen일 때만 렌더링 */}
      {isOpen && <SearchDropdown status={status} results={results} onItemClick={handleItemClick} />}
    </div>
  );
}
