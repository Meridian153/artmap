// 미술관 목록 페이지용 페이지네이션 래퍼 — 서버 컴포넌트인 page.tsx와 클라이언트 Pagination 컴포넌트 사이의 어댑터
// onPageChange 콜백을 URL 쿼리 파라미터 변경으로 변환한다.

"use client";

import { useRouter } from "next/navigation";
import { Pagination } from "@/components/common/Pagination";

type MuseumsPaginationWrapperProps = {
  currentPage: number;
  totalPages: number;
};

export function MuseumsPaginationWrapper({
  currentPage,
  totalPages,
}: MuseumsPaginationWrapperProps) {
  const router = useRouter();

  // 페이지 변경 시 URL 쿼리 파라미터 갱신 → 서버 컴포넌트 재실행
  const handlePageChange = (page: number) => {
    router.push(`/museums?page=${page}`);
  };

  return (
    <Pagination currentPage={currentPage} totalPages={totalPages} onPageChange={handlePageChange} />
  );
}
