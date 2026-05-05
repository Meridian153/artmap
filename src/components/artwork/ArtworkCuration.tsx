// 작품 큐레이션 — 작품의 미술사적 배경과 의미를 설명하는 텍스트 카드
// 서버 컴포넌트. curationKo가 null이면 렌더 생략.

export type ArtworkCurationProps = {
  curationKo: string | null;
};

export function ArtworkCuration({ curationKo }: ArtworkCurationProps) {
  if (!curationKo) return null;

  return (
    <section className="border-border rounded-lg border p-6">
      <h2 className="text-muted-foreground mb-3 text-xs font-medium tracking-wider uppercase">
        작품 해설
      </h2>
      <p className="text-card-foreground leading-relaxed whitespace-pre-line">{curationKo}</p>
    </section>
  );
}
