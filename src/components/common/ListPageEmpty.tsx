// 빈 리스트 상태 컴포넌트 — 데이터가 없거나 검색 결과가 없을 때 중앙에 안내 문구를 표시한다.

// 기본 안내 메시지 — 컴포넌트 외부 상수로 정의
const DEFAULT_MESSAGE = "표시할 항목이 없습니다";

type ListPageEmptyProps = {
  message?: string;
};

export function ListPageEmpty({ message = DEFAULT_MESSAGE }: ListPageEmptyProps) {
  return (
    <div className="flex items-center justify-center py-20">
      <p className="text-base text-gray-500 dark:text-gray-400">{message}</p>
    </div>
  );
}
