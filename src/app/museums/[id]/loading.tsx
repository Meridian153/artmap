// 미술관 상세 페이지 로딩 UI — page.tsx 레이아웃과 동일한 구조의 스켈레톤
// Next.js App Router가 /museums/[id] 데이터 패칭 중 자동으로 표시하며,
// /museums 그리드 스켈레톤(상위 loading.tsx)이 잘못 노출되는 UX 문제를 해결함

const ARTWORK_SKELETON_COUNT = 8;

export default function MuseumDetailLoading() {
  return (
    <div className="mx-auto max-w-4xl animate-pulse px-6 py-8">
      {/* Hero 영역 — MuseumHero 대응 */}
      <header className="border-border border-b pb-8">
        {/* 대표 이미지 placeholder */}
        <div className="bg-muted h-[300px] w-full rounded" />

        {/* 이름 + 위치 */}
        <div className="mt-8">
          <div className="bg-muted h-10 w-2/3 rounded" />
          <div className="bg-muted/50 mt-2 h-6 w-1/2 rounded" />
          <div className="bg-muted/50 mt-4 h-5 w-1/3 rounded" />
        </div>
      </header>

      {/* Info 영역 — MuseumInfo 대응 (소개·운영시간 섹션 예시) */}
      <div className="mt-12 space-y-8">
        <div className="border-border rounded-lg border p-6">
          <div className="bg-muted h-4 w-16 rounded" />
          <div className="mt-3 space-y-2">
            <div className="bg-muted/50 h-4 w-full rounded" />
            <div className="bg-muted/50 h-4 w-4/5 rounded" />
            <div className="bg-muted/50 h-4 w-3/5 rounded" />
          </div>
        </div>
        <div className="border-border rounded-lg border p-6">
          <div className="bg-muted h-4 w-20 rounded" />
          <div className="mt-3 space-y-2">
            <div className="bg-muted/50 h-4 w-full rounded" />
            <div className="bg-muted/50 h-4 w-2/3 rounded" />
          </div>
        </div>
      </div>

      {/* 지도 영역 — MuseumLocationMapWrapper 대응 */}
      <section className="mt-12">
        <div className="bg-muted h-4 w-12 rounded" />
        <div className="border-border bg-muted/50 mt-3 h-[300px] rounded-lg border" />
        <div className="bg-muted/50 mt-3 h-4 w-1/2 rounded" />
      </section>

      {/* 소장 작품 갤러리 — MuseumArtworkGallery 대응 */}
      <section className="mt-12">
        <div className="bg-muted h-4 w-20 rounded" />
        <ul className="mt-6 grid grid-cols-2 gap-6 sm:grid-cols-3 lg:grid-cols-4">
          {Array.from({ length: ARTWORK_SKELETON_COUNT }).map((_, i) => (
            <li key={i}>
              <div className="bg-muted/50 aspect-square w-full rounded" />
              <div className="mt-3 space-y-2">
                <div className="bg-muted h-4 w-4/5 rounded" />
                <div className="bg-muted/50 h-3 w-2/3 rounded" />
              </div>
            </li>
          ))}
        </ul>
      </section>
    </div>
  );
}
