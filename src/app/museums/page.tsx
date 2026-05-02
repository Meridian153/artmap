// 미술관 목록 페이지 — GET /api/v1/museums 를 호출하여 미술관 카드 그리드와 페이지네이션을 렌더링
// 서버 컴포넌트. searchParams.page로 현재 페이지를 수신하고, 로딩 중에는 loading.tsx가 표시된다.

import { getMuseums } from "@/lib/api";
import { MuseumListCard } from "@/components/museum/MuseumListCard";
import { MuseumsPaginationWrapper } from "@/components/museum/MuseumsPaginationWrapper";
import { ListPageEmpty } from "@/components/common/ListPageEmpty";

// 페이지당 카드 수 — 컴포넌트 외부 상수로 정의
const PER_PAGE = 12;

type MuseumsPageProps = {
  searchParams: Promise<{ page?: string }>;
};

export default async function MuseumsPage({ searchParams }: MuseumsPageProps) {
  // Next.js 16 App Router: searchParams는 Promise로 전달됨
  const { page: pageParam } = await searchParams;

  // 유효한 정수로 파싱, 범위 밖이면 1로 고정
  const currentPage = Math.max(1, parseInt(pageParam ?? "1", 10) || 1);

  // TODO: TanStack Query 도입 시 데이터 패칭 로직 리팩토링 검토
  let museums: Awaited<ReturnType<typeof getMuseums>>;
  try {
    museums = await getMuseums({ page: currentPage, per_page: PER_PAGE });
  } catch {
    return (
      <div className="mx-auto max-w-7xl px-4 py-8 sm:px-6 lg:px-8">
        <p className="text-center text-gray-500 dark:text-gray-400">
          미술관 목록을 불러오지 못했습니다. 잠시 후 다시 시도해 주세요.
        </p>
      </div>
    );
  }

  const { data, total, per_page } = museums;
  const totalPages = Math.ceil(total / per_page);

  return (
    <div className="mx-auto max-w-7xl px-4 py-8 sm:px-6 lg:px-8">
      {/* 페이지 헤더 */}
      <div className="mb-8">
        <h1 className="text-3xl font-bold text-gray-900 dark:text-gray-100">미술관</h1>
        <p className="mt-1 text-sm text-gray-500 dark:text-gray-400">
          총 {total.toLocaleString()}곳
        </p>
      </div>

      {/* 빈 결과 처리 */}
      {data.length === 0 ? (
        <ListPageEmpty message="등록된 미술관이 없습니다" />
      ) : (
        <>
          {/* 미술관 카드 그리드 — 모바일 1열 / 태블릿 2열 / 데스크탑 3열 */}
          <div className="grid grid-cols-1 gap-6 md:grid-cols-2 lg:grid-cols-3">
            {data.map((museum) => (
              <MuseumListCard key={museum.id} museum={museum} />
            ))}
          </div>

          {/* 페이지네이션 — 총 페이지가 1 이하이면 Pagination 내부에서 null 반환 */}
          {totalPages > 1 && (
            <div className="mt-10 flex justify-center">
              <MuseumsPaginationWrapper currentPage={currentPage} totalPages={totalPages} />
            </div>
          )}
        </>
      )}
    </div>
  );
}
