// 화가의 전체 작품 목록 페이지 — 특정 화가의 작품을 페이지네이션으로 표시
// 향후 연결 API: GET /artists/{id}/artworks (페이지네이션)

interface ArtistArtworksPageProps {
  params: Promise<{ id: string }>
}

export default async function ArtistArtworksPage({ params }: ArtistArtworksPageProps) {
  // Next.js 15+ App Router: params는 Promise로 전달됨
  const { id } = await params

  return (
    <div className="p-8">
      <h1 className="text-3xl font-bold">화가의 전체 작품</h1>
      <p className="mt-4 text-lg text-zinc-600">
        화가의 전체 작품 목록입니다. 화가 ID: {id}
      </p>
    </div>
  )
}
