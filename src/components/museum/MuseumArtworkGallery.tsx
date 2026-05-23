// 미술관 소장 작품 갤러리 — getMuseumArtworks를 호출해 작품 카드 그리드로 표시
// async 서버 컴포넌트. 작품이 0개면 placeholder 메시지.

import Link from "next/link";
import { getMuseumArtworks } from "@/lib/api";

export type MuseumArtworkGalleryProps = {
  museumId: string;
};

export async function MuseumArtworkGallery({ museumId }: MuseumArtworkGalleryProps) {
  // 최대 12개까지 로딩 (API 시그니처상 per_page 사용)
  const { data: artworks } = await getMuseumArtworks(museumId, { per_page: 12 });

  return (
    <section className="mt-12">
      <h2 className="text-muted-foreground text-sm font-semibold tracking-wider uppercase">
        소장 작품
      </h2>

      {artworks.length === 0 ? (
        <p className="text-muted-foreground mt-6">소장 작품 정보가 없습니다.</p>
      ) : (
        <ul className="mt-6 grid grid-cols-2 gap-6 sm:grid-cols-3 lg:grid-cols-4">
          {artworks.map((artwork) => (
            <li key={artwork.id}>
              <Link href={`/artworks/${artwork.id}`} className="group block">
                {/* 정사각형 썸네일 placeholder — next/image 미사용 */}
                <div className="bg-muted text-muted-foreground flex aspect-square w-full items-center justify-center text-xs">
                  이미지 준비 중
                </div>
                <div className="mt-3">
                  <p className="text-foreground text-sm font-medium group-hover:underline">
                    {artwork.title_ko}
                  </p>
                  <p className="text-muted-foreground mt-1 text-xs">
                    {artwork.artist?.name_ko ?? artwork.artist?.name_en ?? "작가 정보 없음"}
                  </p>
                  {artwork.year_created && (
                    <p className="text-muted-foreground text-xs">{artwork.year_created}</p>
                  )}
                </div>
              </Link>
            </li>
          ))}
        </ul>
      )}
    </section>
  );
}
