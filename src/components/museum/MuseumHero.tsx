// 미술관 상세 페이지 헤더 — 대표 이미지 placeholder, 이름, 위치를 표시
// 서버 컴포넌트. 차분한 미술관 톤(흰 배경, 검정 텍스트, 넉넉한 여백).

import type { MuseumDetail } from "@/types/museum";
import { getCountryName } from "@/lib/country-names";

export type MuseumHeroProps = {
  museum: MuseumDetail;
};

export function MuseumHero({ museum }: MuseumHeroProps) {
  const { place } = museum;
  // 국가명은 country_code → 한국어 매핑. 매핑이 없으면 코드 그대로 노출됨
  const countryName = getCountryName(museum.country_code, "ko");

  return (
    <header className="border-b border-zinc-200 pb-8">
      {/* 썸네일 영역 — 실제 이미지 도입 전까지 placeholder만 렌더. 추후 next/image로 교체 예정 */}
      <div
        className="flex h-[300px] w-full items-center justify-center bg-zinc-100 text-sm text-zinc-400"
        aria-label="미술관 대표 이미지 없음"
      >
        이미지 준비 중
      </div>

      {/* 이름 + 위치 */}
      <div className="mt-8">
        <h1 className="text-4xl font-semibold tracking-tight text-zinc-900">{museum.name_ko}</h1>
        <p className="mt-2 text-lg text-zinc-500 italic">{museum.name_en}</p>
        <p className="mt-4 text-base text-zinc-700">
          {place.city}, {countryName}
        </p>
      </div>
    </header>
  );
}
