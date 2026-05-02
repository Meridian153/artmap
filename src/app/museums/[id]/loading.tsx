// 미술관 상세 페이지 로딩 UI — page.tsx 레이아웃과 동일한 구조의 스켈레톤
// Next.js App Router가 /museums/[id] 데이터 패칭 중 자동으로 표시하며,
// /museums 그리드 스켈레톤(상위 loading.tsx)이 잘못 노출되는 UX 문제를 해결함

const ARTWORK_SKELETON_COUNT = 8;

export default function MuseumDetailLoading() {
  return (
    <div className="mx-auto max-w-4xl animate-pulse px-6 py-8">
      {/* Hero 영역 — MuseumHero 대응 */}
      <header className="border-b border-zinc-200 pb-8">
        {/* 대표 이미지 placeholder */}
        <div className="h-[300px] w-full rounded bg-zinc-200" />

        {/* 이름 + 위치 */}
        <div className="mt-8">
          <div className="h-10 w-2/3 rounded bg-zinc-200" />
          <div className="mt-2 h-6 w-1/2 rounded bg-zinc-100" />
          <div className="mt-4 h-5 w-1/3 rounded bg-zinc-100" />
        </div>
      </header>

      {/* Info 영역 — MuseumInfo 대응 (소개·운영시간 섹션 예시) */}
      <div className="mt-12 space-y-8">
        <div className="rounded-lg border border-zinc-200 p-6">
          <div className="h-4 w-16 rounded bg-zinc-200" />
          <div className="mt-3 space-y-2">
            <div className="h-4 w-full rounded bg-zinc-100" />
            <div className="h-4 w-4/5 rounded bg-zinc-100" />
            <div className="h-4 w-3/5 rounded bg-zinc-100" />
          </div>
        </div>
        <div className="rounded-lg border border-zinc-200 p-6">
          <div className="h-4 w-20 rounded bg-zinc-200" />
          <div className="mt-3 space-y-2">
            <div className="h-4 w-full rounded bg-zinc-100" />
            <div className="h-4 w-2/3 rounded bg-zinc-100" />
          </div>
        </div>
      </div>

      {/* 지도 영역 — MuseumLocationMapWrapper 대응 */}
      <section className="mt-12">
        <div className="h-4 w-12 rounded bg-zinc-200" />
        <div className="mt-3 h-[300px] rounded-lg border border-zinc-200 bg-zinc-100" />
        <div className="mt-3 h-4 w-1/2 rounded bg-zinc-100" />
      </section>

      {/* 소장 작품 갤러리 — MuseumArtworkGallery 대응 */}
      <section className="mt-12">
        <div className="h-4 w-20 rounded bg-zinc-200" />
        <ul className="mt-6 grid grid-cols-2 gap-6 sm:grid-cols-3 lg:grid-cols-4">
          {Array.from({ length: ARTWORK_SKELETON_COUNT }).map((_, i) => (
            <li key={i}>
              <div className="aspect-square w-full rounded bg-zinc-100" />
              <div className="mt-3 space-y-2">
                <div className="h-4 w-4/5 rounded bg-zinc-200" />
                <div className="h-3 w-2/3 rounded bg-zinc-100" />
              </div>
            </li>
          ))}
        </ul>
      </section>
    </div>
  );
}
