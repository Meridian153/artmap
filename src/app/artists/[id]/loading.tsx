// 화가 상세 페이지 로딩 UI — page.tsx 레이아웃과 동일한 구조의 스켈레톤
// Next.js App Router가 /artists/[id] 데이터 패칭 중 자동으로 표시하며,
// /artists 그리드 스켈레톤(상위 loading.tsx)이 잘못 노출되는 UX 문제를 해결함

// 대표 작품 갤러리 스켈레톤 수 — page.tsx의 MAX_GALLERY_ITEMS와 동일
const ARTWORK_SKELETON_COUNT = 12;

export default function ArtistDetailLoading() {
  return (
    <div className="mx-auto max-w-4xl animate-pulse px-6 py-8">
      {/* Hero 영역 — ArtistHero 대응 */}
      <header className="border-b border-zinc-200 pb-8">
        {/* 대표 이미지 placeholder */}
        <div className="h-[300px] w-full rounded bg-zinc-200" />

        {/* 이름 + 국적/생몰년 */}
        <div className="mt-8">
          <div className="h-10 w-2/3 rounded bg-zinc-200" />
          <div className="mt-2 h-6 w-1/2 rounded bg-zinc-100" />
          <div className="mt-4 h-5 w-1/3 rounded bg-zinc-100" />
        </div>
      </header>

      {/* Info 영역 — ArtistInfo 대응 (약력·사조 카드) */}
      <div className="mt-12 space-y-8">
        {/* 약력 카드 */}
        <div className="rounded-lg border border-zinc-200 p-6">
          <div className="h-4 w-12 rounded bg-zinc-200" />
          <div className="mt-3 space-y-2">
            <div className="h-4 w-full rounded bg-zinc-100" />
            <div className="h-4 w-4/5 rounded bg-zinc-100" />
            <div className="h-4 w-3/5 rounded bg-zinc-100" />
          </div>
        </div>

        {/* 사조 카드 */}
        <div className="rounded-lg border border-zinc-200 p-6">
          <div className="h-4 w-12 rounded bg-zinc-200" />
          <div className="mt-3 space-y-2">
            <div className="h-4 w-1/2 rounded bg-zinc-100" />
            <div className="h-4 w-2/5 rounded bg-zinc-100" />
          </div>
        </div>
      </div>

      {/* 국가별 작품 분포 지도 — ArtistCountryMapWrapper 대응 */}
      <section className="mt-12">
        <div className="h-4 w-32 rounded bg-zinc-200" />
        <div className="mt-3 h-[300px] rounded-lg border border-zinc-200 bg-zinc-100" />
      </section>

      {/* 대표 작품 갤러리 — ArtistArtworkGallery 대응 */}
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
