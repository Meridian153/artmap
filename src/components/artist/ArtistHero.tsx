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
    <header className="border-border border-b pb-8">
      {/* 썸네일 영역 — 실제 이미지 도입 전까지 placeholder만 렌더. 추후 next/image로 교체 예정 */}
      <div
        className="bg-muted text-muted-foreground flex h-[300px] w-full items-center justify-center text-sm"
        aria-label="화가 대표 이미지 없음"
      >
        이미지 준비 중
      </div>

      {/* 이름 + 국적/생몰년 메타 라인 */}
      <div className="mt-8">
        <h1 className="text-foreground text-4xl font-semibold tracking-tight">{artist.name_ko}</h1>
        <p className="text-muted-foreground mt-2 text-lg italic">{artist.name_en}</p>
        <p className="text-muted-foreground mt-4 text-base">
          {artist.nationality ?? ""}
          {lifeSpan && <span className="text-muted-foreground ml-2">({lifeSpan})</span>}
        </p>
      </div>
    </header>
  );
}
