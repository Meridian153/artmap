// 작품 상세 페이지 — 특정 작품의 이미지, 설명, 소장 미술관 정보 표시
// 향후 연결 API: GET /artworks/{id}

interface ArtworkDetailPageProps {
  params: Promise<{ id: string }>
}

export default async function ArtworkDetailPage({ params }: ArtworkDetailPageProps) {
  // Next.js 15+ App Router: params는 Promise로 전달됨
  const { id } = await params

  return (
    <div className="p-8">
      <h1 className="text-3xl font-bold">작품 상세</h1>
      <p className="mt-4 text-lg text-zinc-600">
        작품 상세 페이지입니다. 작품 ID: {id}
      </p>
    </div>
  )
}
