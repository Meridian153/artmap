// 미술관 상세 페이지 — 특정 미술관의 정보와 소장 작품 목록 표시
// 연결 API:
//   GET /museums/{id}
//   GET /museums/{id}/artworks (다음 단계)

import { notFound } from 'next/navigation'
import { getMuseumById } from '@/lib/api'
import { ApiError } from '@/lib/errors'

interface MuseumDetailPageProps {
  params: Promise<{ id: string }>
}

/**
 * 페이지 메타데이터 생성 — 미술관 이름과 설명을 제목/디스크립션으로 반영
 * 미술관이 없으면 404용 제목 반환
 */
export async function generateMetadata({ params }: MuseumDetailPageProps) {
  const { id } = await params
  try {
    const museum = await getMuseumById(id)
    if (!museum) return { title: 'Museum Not Found - ArtMap' }
    return {
      title: `${museum.name_ko} - ArtMap`,
      description: museum.description_ko ?? undefined,
    }
  } catch {
    return { title: 'Museum Not Found - ArtMap' }
  }
}

export default async function MuseumDetailPage({ params }: MuseumDetailPageProps) {
  // Next.js 15+ App Router: params는 Promise로 전달됨
  const { id } = await params

  // 미술관 상세 데이터 로딩
  // - Mock 모드: 존재하지 않으면 null 반환 → notFound()
  // - 실제 API 모드: 404 시 ApiError throw → catch 후 notFound()
  let museum
  try {
    museum = await getMuseumById(id)
  } catch (error) {
    if (error instanceof ApiError) {
      notFound()
    }
    throw error
  }
  if (!museum) {
    notFound()
  }

  const { place } = museum

  return (
    <div className="mx-auto max-w-3xl p-8">
      {/* 미술관 헤더 — 이름(한/영) */}
      <header>
        <h1 className="text-3xl font-bold">{museum.name_ko}</h1>
        <p className="mt-1 text-lg text-zinc-600">{museum.name_en}</p>
      </header>

      {/* 위치 정보 — 도시/국가, 주소 */}
      <section className="mt-6">
        <h2 className="text-xl font-semibold">위치</h2>
        <p className="mt-2">
          {place.city_ko}, {place.country_ko}
        </p>
        {place.address && <p className="mt-1 text-zinc-700">{place.address}</p>}
        {/* 좌표 — 다음 단계에서 미니맵으로 대체 */}
        <p className="mt-1 text-sm text-zinc-500">
          좌표: {place.latitude}, {place.longitude}
        </p>
      </section>

      {/* 소개 — description_ko */}
      {museum.description_ko && (
        <section className="mt-6">
          <h2 className="text-xl font-semibold">소개</h2>
          <p className="mt-2 leading-relaxed">{museum.description_ko}</p>
        </section>
      )}

      {/* 운영시간 — opening_hours 배열을 ul로 */}
      {place.opening_hours && place.opening_hours.length > 0 && (
        <section className="mt-6">
          <h2 className="text-xl font-semibold">운영시간</h2>
          <ul className="mt-2 list-disc pl-5">
            {place.opening_hours.map((line, idx) => (
              <li key={idx}>{line}</li>
            ))}
          </ul>
        </section>
      )}

      {/* 입장료 — adult + 선택적 notes */}
      {place.admission && (
        <section className="mt-6">
          <h2 className="text-xl font-semibold">입장료</h2>
          <p className="mt-2">성인: {place.admission.adult}</p>
          {place.admission.notes && (
            <p className="mt-1 text-sm text-zinc-600">{place.admission.notes}</p>
          )}
        </section>
      )}

      {/* 웹사이트 외부 링크 */}
      {museum.website_url && (
        <section className="mt-6">
          <h2 className="text-xl font-semibold">웹사이트</h2>
          <a
            href={museum.website_url}
            target="_blank"
            rel="noopener noreferrer"
            className="mt-2 inline-block text-blue-600 underline"
          >
            {museum.website_url}
          </a>
        </section>
      )}
    </div>
  )
}
