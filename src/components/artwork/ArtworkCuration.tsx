// 작품 큐레이션 — 작품의 미술사적 배경과 의미를 설명하는 텍스트 카드
// 서버 컴포넌트. curationKo가 null이면 렌더 생략.

export type ArtworkCurationProps = {
  curationKo: string | null;
};

export function ArtworkCuration({ curationKo }: ArtworkCurationProps) {
  if (!curationKo) return null;

  return (
    <section className="rounded-lg border border-zinc-200 p-6">
      <h2 className="mb-3 text-xs font-medium tracking-wider text-zinc-500 uppercase">작품 해설</h2>
      <p className="leading-relaxed whitespace-pre-line text-zinc-700">{curationKo}</p>
    </section>
  );
}
