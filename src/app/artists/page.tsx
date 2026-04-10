// 화가 목록 페이지 — 전체 화가를 카드 그리드로 표시
// 향후 연결 API: GET /artists

export default function ArtistsPage() {
  return (
    <div className="p-8">
      <h1 className="text-3xl font-bold">화가 목록</h1>
      <p className="mt-4 text-lg text-zinc-600">
        화가 목록 페이지입니다. 화가 카드 그리드가 여기에 표시됩니다.
      </p>
    </div>
  );
}
