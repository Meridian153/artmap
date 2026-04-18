// 작품 상세 Hero — 이미지 패널 + 상세 정보 패널의 2열 레이아웃
// 서버 컴포넌트. 좌: 이미지/저작권 분기, 우: 제목/화가/메타/미술관 정보.
//
// 화가 메타라인은 응답에 nationality/birth_year/death_year가 포함되지 않아
// 이름만 노출합니다 — 기술 부채 #1.

import Link from "next/link";
import Image from "next/image";
import type { ArtworkDetail } from "@/types/artwork";
import { formatYearLabel } from "@/lib/format-year";

export type ArtworkHeroProps = {
  artwork: ArtworkDetail;
};

// 상태 배지 매핑 — 컴포넌트 외부에 정의해 렌더링마다 재생성 방지
const STATUS_BADGE: Record<ArtworkDetail["status"], { bg: string; text: string; label: string }> = {
  on_display: { bg: "bg-emerald-100", text: "text-emerald-700", label: "전시 중" },
  on_loan: { bg: "bg-blue-100", text: "text-blue-700", label: "대여 중" },
  in_storage: { bg: "bg-zinc-100", text: "text-zinc-600", label: "수장고 보관" },
  under_restoration: { bg: "bg-amber-100", text: "text-amber-700", label: "복원 중" },
};

export function ArtworkHero({ artwork }: ArtworkHeroProps) {
  const badge = STATUS_BADGE[artwork.status];
  const yearLabel = formatYearLabel(artwork.year_created, artwork.year_end);

  return (
    <div className="grid grid-cols-1 gap-8 md:grid-cols-2">
      {/* 좌측: 이미지 패널 */}
      <div className="aspect-[3/4] w-full overflow-hidden rounded-lg">
        {artwork.is_public_domain && artwork.image_url !== null ? (
          <Image
            src={artwork.image_url}
            alt={artwork.title_ko}
            width={600}
            height={800}
            className="h-full w-full object-cover"
          />
        ) : artwork.is_public_domain ? (
          <div className="flex h-full w-full flex-col items-center justify-center bg-zinc-100 text-zinc-400">
            <span className="text-sm">이미지 준비 중</span>
          </div>
        ) : (
          <div className="flex h-full w-full flex-col items-center justify-center gap-2 bg-zinc-100 px-6 text-center text-zinc-500">
            <span className="text-base font-medium">저작권 보호 작품</span>
            <span className="text-sm text-zinc-400">미술관 공식 사이트에서 확인하세요</span>
          </div>
        )}
      </div>

      {/* 우측: 상세 정보 패널 */}
      <div className="flex flex-col gap-4">
        {/* (1) 상태 배지 */}
        <div>
          <span
            className={`inline-block rounded-full px-3 py-1 text-xs font-medium ${badge.bg} ${badge.text}`}
          >
            {badge.label}
          </span>
        </div>

        {/* (2) 제목 */}
        <div>
          <h1 className="text-2xl leading-tight font-bold md:text-3xl">{artwork.title_ko}</h1>
          <p className="mt-1 text-lg text-zinc-500">{artwork.title_en}</p>
        </div>

        {/* (3) 화가 정보 — 이름만 표시 (nationality/생몰년 미반환) */}
        {artwork.artist && (
          <div>
            <Link
              href={`/artists/${artwork.artist.id}`}
              className="font-medium text-zinc-900 underline-offset-2 hover:underline"
            >
              {artwork.artist.name_ko ?? artwork.artist.name_en ?? "작가 정보 없음"}
            </Link>
          </div>
        )}

        {/* (4) 작품 메타 정보 */}
        <dl className="space-y-1 text-sm">
          {yearLabel && (
            <div className="flex gap-2">
              <dt className="text-zinc-500">제작 연도</dt>
              <dd className="text-zinc-900">{yearLabel}</dd>
            </div>
          )}
          {artwork.medium_ko && (
            <div className="flex gap-2">
              <dt className="text-zinc-500">재료</dt>
              <dd className="text-zinc-900">{artwork.medium_ko}</dd>
            </div>
          )}
          {artwork.dimensions && (
            <div className="flex gap-2">
              <dt className="text-zinc-500">크기</dt>
              <dd className="text-zinc-900">{artwork.dimensions}</dd>
            </div>
          )}
        </dl>

        {/* (5) 소장 미술관 정보 */}
        <div className="space-y-1 text-sm">
          {artwork.status === "on_loan" ? (
            <>
              <div className="flex gap-2">
                <span className="text-zinc-500">원소장처</span>
                {artwork.primary_museum ? (
                  <Link
                    href={`/museums/${artwork.primary_museum.id}`}
                    className="text-zinc-900 underline-offset-2 hover:underline"
                  >
                    {artwork.primary_museum.name_ko}
                  </Link>
                ) : (
                  <span className="text-zinc-900">소장처 정보 없음</span>
                )}
              </div>
              {artwork.current_location && (
                <div className="flex gap-2">
                  <span className="text-zinc-500">현재 전시처</span>
                  {artwork.current_location.museum_id ? (
                    <Link
                      href={`/museums/${artwork.current_location.museum_id}`}
                      className="text-zinc-900 underline-offset-2 hover:underline"
                    >
                      {artwork.current_location?.museum_name_ko ?? "이름 정보 없음"}
                    </Link>
                  ) : (
                    <span className="text-zinc-900">
                      {artwork.current_location?.museum_name_ko ?? "이름 정보 없음"}
                    </span>
                  )}
                </div>
              )}
            </>
          ) : (
            <div className="flex gap-2">
              <span className="text-zinc-500">소장 미술관</span>
              {artwork.primary_museum ? (
                <Link
                  href={`/museums/${artwork.primary_museum.id}`}
                  className="text-zinc-900 underline-offset-2 hover:underline"
                >
                  {artwork.primary_museum.name_ko}
                </Link>
              ) : (
                <span className="text-zinc-900">소장처 정보 없음</span>
              )}
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
