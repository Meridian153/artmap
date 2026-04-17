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
      <h2 className="text-sm font-semibold tracking-wider text-zinc-500 uppercase">소장 작품</h2>

      {artworks.length === 0 ? (
        <p className="mt-6 text-zinc-500">소장 작품 정보가 없습니다.</p>
      ) : (
        <ul className="mt-6 grid grid-cols-2 gap-6 sm:grid-cols-3 lg:grid-cols-4">
          {artworks.map((artwork) => (
            <li key={artwork.id}>
              <Link href={`/artworks/${artwork.id}`} className="group block">
                {/* 정사각형 썸네일 placeholder — next/image 미사용 */}
                <div className="flex aspect-square w-full items-center justify-center bg-zinc-100 text-xs text-zinc-400">
                  이미지 준비 중
                </div>
                <div className="mt-3">
                  <p className="text-sm font-medium text-zinc-900 group-hover:underline">
                    {artwork.title_ko}
                  </p>
                  <p className="mt-1 text-xs text-zinc-600">
                    {artwork.artist?.name_ko ?? artwork.artist?.name_en ?? "작가 정보 없음"}
                  </p>
                  {artwork.year_label && (
                    <p className="text-xs text-zinc-500">{artwork.year_label}</p>
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
