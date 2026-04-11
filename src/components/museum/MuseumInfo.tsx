// 미술관 상세 정보 섹션 — 소개, 운영시간, 입장료, 기본 정보를 카드로 표시
// 서버 컴포넌트. 각 필드가 null이면 해당 줄/섹션은 렌더링하지 않음.

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
        <section className="rounded-lg border border-zinc-200 p-6">
          <h2 className="text-sm font-semibold tracking-wider text-zinc-500 uppercase">소개</h2>
          <p className="mt-3 leading-relaxed text-zinc-800">{museum.description_ko}</p>
        </section>
      )}

      {/* 운영 시간 — opening_hours 배열을 ul로 */}
      {place.opening_hours && place.opening_hours.length > 0 && (
        <section className="rounded-lg border border-zinc-200 p-6">
          <h2 className="text-sm font-semibold tracking-wider text-zinc-500 uppercase">
            운영 시간
          </h2>
          <ul className="mt-3 space-y-1 text-zinc-800">
            {place.opening_hours.map((line) => (
              <li key={line}>{line}</li>
            ))}
          </ul>
        </section>
      )}

      {/* 입장료 — adult는 굵게, notes는 보조 텍스트 */}
      {place.admission && (
        <section className="rounded-lg border border-zinc-200 p-6">
          <h2 className="text-sm font-semibold tracking-wider text-zinc-500 uppercase">입장료</h2>
          <p className="mt-3 text-lg font-semibold text-zinc-900">성인 {place.admission.adult}</p>
          {place.admission.notes && (
            <p className="mt-1 text-sm text-zinc-600">{place.admission.notes}</p>
          )}
        </section>
      )}

      {/* 웹사이트 — 외부 링크. 주소/좌표는 MuseumLocationMap에서 표시 */}
      {museum.website_url && (
        <section className="rounded-lg border border-zinc-200 p-6">
          <h2 className="text-sm font-semibold tracking-wider text-zinc-500 uppercase">웹사이트</h2>
          <a
            href={museum.website_url}
            target="_blank"
            rel="noopener noreferrer"
            className="mt-3 inline-block text-blue-600 underline"
          >
            {museum.website_url}
          </a>
        </section>
      )}
    </div>
  );
}
