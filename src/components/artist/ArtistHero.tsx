// 화가 상세 페이지 헤더 — 대표 이미지 placeholder, 이름, 국적, 생몰년을 표시
// 서버 컴포넌트. MuseumHero와 동일한 시각 구조(흰 배경, 차분한 톤)를 따른다.

import type { ArtistDetail } from "@/types/artist";

export type ArtistHeroProps = {
  artist: ArtistDetail;
};

export function ArtistHero({ artist }: ArtistHeroProps) {
  // 생몰년 표기 — death_year가 null이면 "현재"로 표시
  const lifeSpan =
    artist.birth_year !== null ? `${artist.birth_year}~${artist.death_year ?? "현재"}` : null;

  return (
    <header className="border-b border-zinc-200 pb-8">
      {/* 썸네일 영역 — 실제 이미지 도입 전까지 placeholder만 렌더. 추후 next/image로 교체 예정 */}
      <div
        className="flex h-[300px] w-full items-center justify-center bg-zinc-100 text-sm text-zinc-400"
        aria-label="화가 대표 이미지 없음"
      >
        이미지 준비 중
      </div>

      {/* 이름 + 국적/생몰년 메타 라인 */}
      <div className="mt-8">
        <h1 className="text-4xl font-semibold tracking-tight text-zinc-900">{artist.name_ko}</h1>
        <p className="mt-2 text-lg text-zinc-500 italic">{artist.name_en}</p>
        <p className="mt-4 text-base text-zinc-700">
          {artist.nationality_ko}
          {lifeSpan && <span className="ml-2 text-zinc-500">({lifeSpan})</span>}
        </p>
      </div>
    </header>
  );
}
