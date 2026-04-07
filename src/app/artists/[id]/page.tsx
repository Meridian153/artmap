// 화가 상세 페이지 — 특정 화가의 프로필, 약력, 작품 목록 및 지도 데이터 표시
// 향후 연결 API:
//   GET /artists/{id}
//   GET /artists/{id}/artworks
//   GET /artists/{id}/map-data

interface ArtistDetailPageProps {
  params: Promise<{ id: string }>
}

export default async function ArtistDetailPage({ params }: ArtistDetailPageProps) {
  // Next.js 15+ App Router: params는 Promise로 전달됨
  const { id } = await params

  return (
    <div className="p-8">
      <h1 className="text-3xl font-bold">화가 상세</h1>
      <p className="mt-4 text-lg text-zinc-600">
        화가 상세 페이지입니다. 화가 ID: {id}
      </p>
    </div>
  )
}
