// 미술관 목록 페이지 — 전체 미술관을 카드 리스트로 표시
// 향후 연결 API: GET /museums

export default function MuseumsPage() {
  return (
    <div className="p-8">
      <h1 className="text-3xl font-bold">미술관 목록</h1>
      <p className="mt-4 text-lg text-zinc-600">
        미술관 목록 페이지입니다. 미술관 카드 리스트가 여기에 표시됩니다.
      </p>
    </div>
  );
}
