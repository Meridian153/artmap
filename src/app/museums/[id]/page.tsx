// 미술관 상세 페이지 — 특정 미술관의 정보와 소장 작품 목록 표시
// 향후 연결 API:
//   GET /museums/{id}
//   GET /museums/{id}/artworks

interface MuseumDetailPageProps {
  params: Promise<{ id: string }>
}

export default async function MuseumDetailPage({ params }: MuseumDetailPageProps) {
  // Next.js 15+ App Router: params는 Promise로 전달됨
  const { id } = await params

  return (
    <div className="p-8">
      <h1 className="text-3xl font-bold">미술관 상세</h1>
      <p className="mt-4 text-lg text-zinc-600">
        미술관 상세 페이지입니다. 미술관 ID: {id}
      </p>
    </div>
  )
}
