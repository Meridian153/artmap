// 미술관 상세 페이지 — 특정 미술관의 정보와 소장 작품 목록 표시
// 연결 API:
//   GET /museums/{id}
//   GET /museums/{id}/artworks (MuseumArtworkGallery 내부)

import { notFound } from "next/navigation";
import { getMuseumById } from "@/lib/api";
import { ApiError } from "@/lib/errors";
import { MuseumHero } from "@/components/museum/MuseumHero";
import { MuseumInfo } from "@/components/museum/MuseumInfo";
import { MuseumLocationMapWrapper } from "@/components/museum/MuseumLocationMapWrapper";
import { MuseumArtworkGallery } from "@/components/museum/MuseumArtworkGallery";

interface MuseumDetailPageProps {
  params: Promise<{ id: string }>;
}

/**
 * 페이지 메타데이터 생성 — 미술관 이름과 설명을 제목/디스크립션으로 반영
 * 미술관이 없으면 404용 제목 반환
 */
export async function generateMetadata({ params }: MuseumDetailPageProps) {
  const { id } = await params;
  try {
    const museum = await getMuseumById(id);
    if (!museum) return { title: "Museum Not Found - ArtMap" };
    return {
      title: `${museum.name_ko} - ArtMap`,
      description: museum.description_ko ?? undefined,
    };
  } catch {
    return { title: "Museum Not Found - ArtMap" };
  }
}

export default async function MuseumDetailPage({ params }: MuseumDetailPageProps) {
  // Next.js 15+ App Router: params는 Promise로 전달됨
  const { id } = await params;

  // 미술관 상세 데이터 로딩
  // - Mock 모드: 존재하지 않으면 null 반환 → notFound()
  // - 실제 API 모드: 404 시 ApiError throw → catch 후 notFound()
  let museum;
  try {
    museum = await getMuseumById(id);
  } catch (error) {
    if (error instanceof ApiError && error.status === 404) {
      notFound();
    }
    throw error;
  }
  if (!museum) {
    notFound();
  }

  return (
    <div className="mx-auto max-w-4xl px-6 py-8">
      <MuseumHero museum={museum} />
      <MuseumInfo museum={museum} />
      <MuseumLocationMapWrapper
        latitude={museum.place.latitude}
        longitude={museum.place.longitude}
        name={museum.name_ko}
        address={museum.place.address}
      />
      <MuseumArtworkGallery museumId={museum.id} />
    </div>
  );
}
