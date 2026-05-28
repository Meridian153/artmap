// 미술관 소장 작품 갤러리 — 작품 목록을 props로 받아 상태 필터 칩과 카드 그리드로 표시
// 클라이언트 컴포넌트. 상태별 필터링은 클라이언트 사이드에서 처리. 작품이 0개면 placeholder 메시지.

"use client";

import { useMemo, useState } from "react";
import Image from "next/image";
import Link from "next/link";
import { STATUS_BADGE } from "@/lib/artwork-status";
import type { ArtworkStatus, ArtworkSummary } from "@/types/artwork";

export type MuseumArtworkGalleryProps = {
  artworks: ArtworkSummary[];
};

// 선택 가능한 필터 값 — "전체"(all) + 4개 상태
type FilterValue = "all" | ArtworkStatus;

// 필터 칩 메타데이터 — 값/라벨/선택 시 색상. 정적이므로 모듈 스코프에 정의해 렌더링마다 재생성 방지.
// "전체"는 중립 색상(secondary 토큰), 4개 상태는 STATUS_BADGE 색상을 선택 시 적용한다.
const FILTER_CHIPS: ReadonlyArray<{ value: FilterValue; label: string; selectedClass: string }> = [
  { value: "all", label: "전체", selectedClass: "bg-secondary text-secondary-foreground" },
  {
    value: "on_display",
    label: STATUS_BADGE.on_display.label,
    selectedClass: `${STATUS_BADGE.on_display.bg} ${STATUS_BADGE.on_display.text}`,
  },
  {
    value: "on_loan",
    label: STATUS_BADGE.on_loan.label,
    selectedClass: `${STATUS_BADGE.on_loan.bg} ${STATUS_BADGE.on_loan.text}`,
  },
  {
    value: "in_storage",
    label: STATUS_BADGE.in_storage.label,
    selectedClass: `${STATUS_BADGE.in_storage.bg} ${STATUS_BADGE.in_storage.text}`,
  },
  {
    value: "under_restoration",
    label: STATUS_BADGE.under_restoration.label,
    selectedClass: `${STATUS_BADGE.under_restoration.bg} ${STATUS_BADGE.under_restoration.text}`,
  },
];

// 작품 카드 썸네일 — image_url 부재 또는 로드 실패 시 "이미지 준비 중" 폴백 표시
// 각 카드가 독립된 hasImageError 상태를 갖도록 서브컴포넌트로 분리
type ArtworkThumbProps = { artwork: ArtworkSummary };

function ArtworkThumb({ artwork }: ArtworkThumbProps) {
  // image_url 로드 실패 여부 — onError 발생 시 폴백 UI로 전환
  const [hasImageError, setHasImageError] = useState(false);

  // image_url이 없거나 로드에 실패한 경우 일관된 폴백 UI 표시
  if (!artwork.image_url || hasImageError) {
    return (
      <div className="bg-muted text-muted-foreground flex aspect-square w-full items-center justify-center text-xs">
        이미지 준비 중
      </div>
    );
  }

  return (
    <div className="relative aspect-square w-full overflow-hidden rounded-md">
      <Image
        src={artwork.image_url}
        alt={artwork.title_ko || artwork.title_en}
        fill
        sizes="(min-width: 1024px) 25vw, (min-width: 640px) 33vw, 50vw"
        className="object-cover"
        onError={() => setHasImageError(true)}
      />
    </div>
  );
}

export function MuseumArtworkGallery({ artworks }: MuseumArtworkGalleryProps) {
  // 선택된 필터 상태 — 기본값은 "전체"
  const [selectedStatus, setSelectedStatus] = useState<FilterValue>("all");

  // 상태별 카운트 계산 — 전체 + 4개 상태. artworks가 바뀔 때만 재계산.
  const counts = useMemo<Record<FilterValue, number>>(() => {
    const result: Record<FilterValue, number> = {
      all: artworks.length,
      on_display: 0,
      on_loan: 0,
      in_storage: 0,
      under_restoration: 0,
    };
    for (const artwork of artworks) {
      result[artwork.status] += 1;
    }
    return result;
  }, [artworks]);

  // 선택된 필터에 해당하는 작품만 추출 — "전체"면 원본 그대로
  const filteredArtworks = useMemo(() => {
    if (selectedStatus === "all") {
      return artworks;
    }
    return artworks.filter((artwork) => artwork.status === selectedStatus);
  }, [artworks, selectedStatus]);

  return (
    <section className="mt-12">
      <h2 className="text-muted-foreground text-sm font-semibold tracking-wider uppercase">
        소장 작품
      </h2>

      {artworks.length === 0 ? (
        <p className="text-muted-foreground mt-6">소장 작품 정보가 없습니다.</p>
      ) : (
        <>
          {/* 상태 필터 칩 — 카운트 0이면 비활성화, 선택된 칩은 색상으로 강조 */}
          <div className="mt-6 flex flex-wrap gap-2">
            {FILTER_CHIPS.map((chip) => {
              const isSelected = selectedStatus === chip.value;
              const count = counts[chip.value];
              const isDisabled = count === 0;
              const className = [
                "rounded-full px-3 py-1.5 text-sm font-medium transition-colors",
                isSelected ? chip.selectedClass : "bg-muted text-muted-foreground",
                !isSelected && !isDisabled ? "hover:bg-muted/80" : "",
                isDisabled ? "cursor-not-allowed opacity-40" : "",
              ]
                .filter(Boolean)
                .join(" ");

              return (
                <button
                  key={chip.value}
                  type="button"
                  onClick={() => setSelectedStatus(chip.value)}
                  disabled={isDisabled}
                  aria-pressed={isSelected}
                  className={className}
                >
                  {chip.label} ({count})
                </button>
              );
            })}
          </div>

          <ul className="mt-6 grid grid-cols-2 gap-6 sm:grid-cols-3 lg:grid-cols-4">
            {filteredArtworks.map((artwork) => (
              <li key={artwork.id}>
                <Link href={`/artworks/${artwork.id}`} className="group block">
                  <ArtworkThumb artwork={artwork} />
                  <div className="mt-3">
                    <p className="text-foreground text-sm font-medium group-hover:underline">
                      {artwork.title_ko}
                    </p>
                    <p className="text-muted-foreground mt-1 text-xs">
                      {artwork.artist?.name_ko ?? artwork.artist?.name_en ?? "작가 정보 없음"}
                    </p>
                    {artwork.year_created !== null && (
                      <p className="text-muted-foreground text-xs">{artwork.year_created}</p>
                    )}
                  </div>
                </Link>
              </li>
            ))}
          </ul>
        </>
      )}
    </section>
  );
}
