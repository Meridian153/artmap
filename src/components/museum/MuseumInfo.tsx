// 미술관 상세 정보 섹션 — 소개, 운영시간, 입장료, 웹사이트를 카드로 표시
// 서버 컴포넌트. 각 필드가 null이면 해당 섹션은 렌더링하지 않음.
//
// opening_hours / admission는 DB의 jsonb 원형(스키마 미정의)이므로 MVP 단계에서는
// 최소 표시(JSON pretty print)만 합니다 — 기술 부채 #6.

import type { MuseumDetail } from "@/types/museum";

export type MuseumInfoProps = {
  museum: MuseumDetail;
};

export function MuseumInfo({ museum }: MuseumInfoProps) {
  const { place } = museum;

  return (
    <div className="mt-12 space-y-8">
      {/* 소개 — description_ko가 있을 때만 */}
      {museum.description_ko && (
        <section className="border-border rounded-lg border p-6">
          <h2 className="text-muted-foreground text-sm font-semibold tracking-wider uppercase">
            소개
          </h2>
          <p className="text-card-foreground mt-3 leading-relaxed">{museum.description_ko}</p>
        </section>
      )}

      {/* 운영 시간 — jsonb 원형을 미니멀하게 표시 (구조 정형화는 MVP 이후) */}
      {place.opening_hours && (
        <section className="border-border rounded-lg border p-6">
          <h2 className="text-muted-foreground text-sm font-semibold tracking-wider uppercase">
            운영 시간
          </h2>
          <pre className="text-card-foreground mt-3 text-sm whitespace-pre-wrap">
            {JSON.stringify(place.opening_hours, null, 2)}
          </pre>
        </section>
      )}

      {/* 입장료 — jsonb 원형을 미니멀하게 표시 (구조 정형화는 MVP 이후) */}
      {place.admission && (
        <section className="border-border rounded-lg border p-6">
          <h2 className="text-muted-foreground text-sm font-semibold tracking-wider uppercase">
            입장료
          </h2>
          <pre className="text-card-foreground mt-3 text-sm whitespace-pre-wrap">
            {JSON.stringify(place.admission, null, 2)}
          </pre>
        </section>
      )}

      {/* 웹사이트 — 외부 링크. 주소/좌표는 MuseumLocationMap에서 표시 */}
      {museum.website && (
        <section className="border-border rounded-lg border p-6">
          <h2 className="text-muted-foreground text-sm font-semibold tracking-wider uppercase">
            웹사이트
          </h2>
          <a
            href={museum.website}
            target="_blank"
            rel="noopener noreferrer"
            className="mt-3 inline-block text-blue-600 underline dark:text-blue-400"
          >
            {museum.website}
          </a>
        </section>
      )}
    </div>
  );
}
