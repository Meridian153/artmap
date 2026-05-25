// 화가 목록 카드 — /artists 페이지 그리드에서 개별 화가를 나타낸다.
// 카드 크기는 항상 고정되며 데이터 유무와 관계없이 레이아웃이 무너지지 않는다.
// 카드 전체가 화가 상세 페이지 링크로 연결된다.

import Image from "next/image";
import Link from "next/link";
import type { ArtistSummary } from "@/types/artist";

export type ArtistListCardProps = {
  artist: ArtistSummary;
};

// 국적·생몰년 텍스트를 조합해 반환한다.
// 둘 다 정보가 없으면 null을 반환해 영역을 비워 둔다.
function buildLifespanText(
  nationality: string | null,
  birthYear: number | null,
  deathYear: number | null,
): string | null {
  const lifespan =
    birthYear !== null
      ? deathYear !== null
        ? `${birthYear} – ${deathYear}`
        : `${birthYear} –`
      : null;

  if (nationality && lifespan) return `${nationality} · ${lifespan}`;
  if (nationality) return nationality;
  if (lifespan) return lifespan;
  return null;
}

export function ArtistListCard({ artist }: ArtistListCardProps) {
  const lifespanText = buildLifespanText(artist.nationality, artist.birth_year, artist.death_year);
  // movements[0]만 뱃지로 표시한다.
  const firstMovement = artist.movements[0] ?? null;

  return (
    <Link
      href={`/artists/${artist.id}`}
      className="flex flex-col overflow-hidden rounded-lg border border-gray-200 bg-white transition-shadow hover:shadow-md dark:border-gray-700 dark:bg-gray-900"
      aria-label={`${artist.name_ko} 상세 보기`}
    >
      {/* 이미지 영역 — h-40 고정으로 모든 카드에서 동일한 높이를 보장 */}
      <div className="relative h-40 w-full shrink-0 overflow-hidden bg-gray-100 dark:bg-gray-800">
        {artist.image_url ? (
          <Image src={artist.image_url} alt={artist.name_ko} fill className="object-cover" />
        ) : (
          <div className="flex h-full w-full items-center justify-center text-sm text-gray-400 dark:text-gray-500">
            이미지 준비 중
          </div>
        )}
      </div>

      <div className="flex flex-1 flex-col gap-2 p-3">
        {/* 이름 — 한국어(굵게 크게) / 영문(작게 회색), 모두 1줄 truncate */}
        <div>
          <p className="truncate text-sm font-semibold text-gray-900 dark:text-gray-100">
            {artist.name_ko}
          </p>
          <p className="truncate text-xs text-gray-500 dark:text-gray-400">{artist.name_en}</p>
        </div>

        {/* 국적·생몰년 — 데이터 없어도 h-4로 높이 확보 */}
        <div className="h-4">
          {lifespanText && (
            <p className="truncate text-xs text-gray-500 dark:text-gray-400">{lifespanText}</p>
          )}
        </div>

        {/* 화풍 뱃지 — movements[0]만 표시, 없어도 h-5로 높이 확보 */}
        <div className="h-5">
          {firstMovement && (
            <span className="inline-block max-w-full truncate rounded-full bg-gray-100 px-2 py-0.5 text-xs text-gray-600 dark:bg-gray-800 dark:text-gray-400">
              {firstMovement.name_ko}
            </span>
          )}
        </div>

        {/* 작품 수 — h-4로 높이 확보 */}
        <div className="h-4">
          <p className="text-xs text-gray-500 dark:text-gray-400">
            작품 {artist.artwork_count.toLocaleString()}점
          </p>
        </div>

        {/* TODO: top_museum_name_ko 필드 추가 시 이 영역을 교체 */}
        {/* 대표 미술관 플레이스홀더 — h-16 고정으로 카드 높이 일관성 유지 */}
        <div className="flex h-16 shrink-0 items-center justify-center rounded bg-gray-100 text-xs text-gray-400 dark:bg-gray-800 dark:text-gray-500">
          대표 미술관 준비 중
        </div>
      </div>
    </Link>
  );
}
