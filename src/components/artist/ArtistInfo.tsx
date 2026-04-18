// 화가 상세 정보 섹션 — 약력, 사조 목록을 카드로 표시
// 서버 컴포넌트. 각 필드가 비어 있으면 해당 카드는 렌더링하지 않음.
//
// 작품 수(artwork_count)는 GET /artists/{id} 응답에 포함되지 않아 표시하지 않습니다 — 기술 부채 #3.

import type { ArtistDetail } from "@/types/artist";

export type ArtistInfoProps = {
  artist: ArtistDetail;
};

export function ArtistInfo({ artist }: ArtistInfoProps) {
  return (
    <div className="mt-12 space-y-8">
      {/* 약력 — bio_ko가 truthy일 때만 */}
      {artist.bio_ko && (
        <section className="rounded-lg border border-zinc-200 p-6">
          <h2 className="text-sm font-semibold tracking-wider text-zinc-500 uppercase">약력</h2>
          <p className="mt-3 leading-relaxed text-zinc-800">{artist.bio_ko}</p>
        </section>
      )}

      {/* 사조 — movements 배열을 리스트로 렌더 */}
      {artist.movements.length > 0 && (
        <section className="rounded-lg border border-zinc-200 p-6">
          <h2 className="text-sm font-semibold tracking-wider text-zinc-500 uppercase">사조</h2>
          <ul className="mt-3 space-y-1 text-zinc-800">
            {artist.movements.map((m) => (
              <li key={`${m.name_en}-${m.period_start ?? "x"}`}>
                {m.name_ko}
                <span className="ml-2 text-sm text-zinc-500">({m.name_en})</span>
              </li>
            ))}
          </ul>
        </section>
      )}
    </div>
  );
}
