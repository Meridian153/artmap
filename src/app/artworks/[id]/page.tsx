// 작품 상세 페이지 — 특정 작품의 이미지, 큐레이션, 소장 미술관 정보 표시
// 연결 API:
//   GET /artworks/{id}

import type { Metadata } from "next";
import { notFound } from "next/navigation";
import { getArtworkById } from "@/lib/api";
import { ApiError } from "@/lib/errors";
import { ArtworkHero } from "@/components/artwork/ArtworkHero";
import { ArtworkCuration } from "@/components/artwork/ArtworkCuration";
import { ArtworkLocationMapWrapper } from "@/components/artwork/ArtworkLocationMapWrapper";

type ArtworkDetailPageProps = {
  params: Promise<{ id: string }>;
};

export async function generateMetadata({ params }: ArtworkDetailPageProps): Promise<Metadata> {
  const { id } = await params;
  try {
    const artwork = await getArtworkById(id);
    if (!artwork) return { title: "작품 상세 - ArtMap" };
    return {
      title: `${artwork.title_ko} - ArtMap`,
      description: artwork.curation_ko ?? undefined,
    };
  } catch {
    return { title: "작품 상세 - ArtMap" };
  }
}

export default async function ArtworkDetailPage({ params }: ArtworkDetailPageProps) {
  // Next.js 15+ App Router: params는 Promise로 전달됨
  const { id } = await params;

  let artwork;
  try {
    artwork = await getArtworkById(id);
  } catch (error) {
    if (error instanceof ApiError && error.status === 404) {
      notFound();
    }
    throw error;
  }

  if (!artwork) {
    notFound();
  }

  return (
    <main className="mx-auto max-w-6xl space-y-8 px-4 py-8">
      <ArtworkHero artwork={artwork} />
      <ArtworkCuration curationKo={artwork.curation_ko} />
      <ArtworkLocationMapWrapper
        primaryMuseum={artwork.primary_museum}
        currentLocation={artwork.current_location}
        isOnLoan={artwork.status === "on_loan"}
      />
    </main>
  );
}
