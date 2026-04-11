// 화가 상세 정보 섹션 — 약력, 화풍, 등록된 작품 수를 카드로 표시
// 서버 컴포넌트. 각 필드가 비어 있으면 해당 카드는 렌더링하지 않음.

import type { ArtistDetail } from "@/types/artist";

export type ArtistInfoProps = {
  artist: ArtistDetail;
};

export function ArtistInfo({ artist }: ArtistInfoProps) {
  return (
    <div className="mt-12 space-y-8">
      {/* 약력 — biography_ko가 truthy일 때만 */}
      {artist.biography_ko && (
        <section className="rounded-lg border border-zinc-200 p-6">
          <h2 className="text-sm font-semibold tracking-wider text-zinc-500 uppercase">약력</h2>
          <p className="mt-3 leading-relaxed text-zinc-800">{artist.biography_ko}</p>
        </section>
      )}

      {/* 화풍 — style_ko가 truthy일 때만 */}
      {artist.style_ko && (
        <section className="rounded-lg border border-zinc-200 p-6">
          <h2 className="text-sm font-semibold tracking-wider text-zinc-500 uppercase">화풍</h2>
          <p className="mt-3 leading-relaxed text-zinc-800">{artist.style_ko}</p>
        </section>
      )}

      {/* 등록된 작품 수 — number 타입일 때만 */}
      {typeof artist.artwork_count === "number" && (
        <section className="rounded-lg border border-zinc-200 p-6">
          <h2 className="text-sm font-semibold tracking-wider text-zinc-500 uppercase">
            등록된 작품 수
          </h2>
          <p className="mt-3 text-lg font-semibold text-zinc-900">{`${artist.artwork_count}점`}</p>
        </section>
      )}
    </div>
  );
}
