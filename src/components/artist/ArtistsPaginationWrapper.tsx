// 화가 목록 페이지용 페이지네이션 래퍼 — 서버 컴포넌트인 page.tsx와 클라이언트 Pagination 컴포넌트 사이의 어댑터
// onPageChange 콜백을 URL 쿼리 파라미터 변경으로 변환한다.

"use client";

import { useRouter, useSearchParams } from "next/navigation";
import { Pagination } from "@/components/common/Pagination";

type ArtistsPaginationWrapperProps = {
  currentPage: number;
  totalPages: number;
};

export function ArtistsPaginationWrapper({
  currentPage,
  totalPages,
}: ArtistsPaginationWrapperProps) {
  const router = useRouter();
  const searchParams = useSearchParams();

  // 페이지 변경 시 기존 쿼리 파라미터를 유지한 채 page만 갱신 → 서버 컴포넌트 재실행
  const handlePageChange = (page: number) => {
    const params = new URLSearchParams(searchParams.toString());
    params.set("page", String(page));
    router.push(`/artists?${params.toString()}`);
  };

  return (
    <Pagination currentPage={currentPage} totalPages={totalPages} onPageChange={handlePageChange} />
  );
}
