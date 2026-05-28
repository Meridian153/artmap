// 미술관 상세 페이지 헤더 — 대표 이미지, 이름, 위치를 표시
// 서버 컴포넌트. 차분한 미술관 톤(흰 배경, 검정 텍스트, 넉넉한 여백).

import Image from "next/image";
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
    <header className="border-border border-b pb-8">
      {/* 대표 이미지 — image_url이 있으면 next/image로 렌더, 없으면 placeholder */}
      {museum.image_url ? (
        <div className="relative h-[300px] w-full overflow-hidden rounded-md">
          <Image
            src={museum.image_url}
            alt={`${museum.name_ko} 외관`}
            fill
            priority
            sizes="(min-width: 896px) 896px, 100vw"
            className="object-cover"
          />
        </div>
      ) : (
        <div
          className="bg-muted text-muted-foreground flex h-[300px] w-full items-center justify-center text-sm"
          aria-label="미술관 대표 이미지 없음"
        >
          이미지 준비 중
        </div>
      )}

      {/* 이름 + 위치 */}
      <div className="mt-8">
        <h1 className="text-foreground text-4xl font-semibold tracking-tight">{museum.name_ko}</h1>
        <p className="text-muted-foreground mt-2 text-lg italic">{museum.name_en}</p>
        <p className="text-muted-foreground mt-4 text-base">
          {place.city}, {countryName}
        </p>
      </div>
    </header>
  );
}
