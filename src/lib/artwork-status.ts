// 작품 전시 상태(ArtworkStatus)의 표시 정보 공통 모듈
// 상태별 배지 색상·라벨을 단일 정의로 두어 작품 상세·미술관 갤러리 등에서 재사용한다.

import type { ArtworkStatus } from "@/types/artwork";

// 상태 배지 매핑 — 모듈 스코프에 정의해 렌더링마다 재생성 방지
// 상태 의미가 강한 색이므로 시맨틱 토큰 대신 고정 색상 클래스 + dark: 짝 사용
export const STATUS_BADGE: Record<ArtworkStatus, { bg: string; text: string; label: string }> = {
  on_display: {
    bg: "bg-emerald-100 dark:bg-emerald-900/30",
    text: "text-emerald-800 dark:text-emerald-300",
    label: "전시 중",
  },
  on_loan: {
    bg: "bg-blue-100 dark:bg-blue-900/30",
    text: "text-blue-800 dark:text-blue-300",
    label: "대여 중",
  },
  in_storage: {
    bg: "bg-zinc-100 dark:bg-zinc-800",
    text: "text-zinc-800 dark:text-zinc-300",
    label: "수장고 보관",
  },
  under_restoration: {
    bg: "bg-amber-100 dark:bg-amber-900/30",
    text: "text-amber-800 dark:text-amber-300",
    label: "복원 중",
  },
};
