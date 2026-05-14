// 지도 범례 컴포넌트 — 현재 줌 레벨에 맞는 버블 설명 문구를 하단 중앙에 표시
// pill 형태, backdrop-blur, 다크 모드 대응

type MapLegendProps = {
  zoom?: number;
};

export function MapLegend({ zoom = 3 }: MapLegendProps) {
  const isMuseumZoom = zoom >= 6;

  return (
    <div
      role="status"
      className="pointer-events-none absolute bottom-5 left-1/2 z-10 -translate-x-1/2"
    >
      {/* grid 스태킹 — 두 텍스트를 같은 셀에 겹쳐 크로스페이드 구현 */}
      <div className="border-border grid rounded-full border bg-white/60 px-4 py-1.5 text-[13px] leading-snug shadow-sm backdrop-blur-[12px] max-sm:text-[12px] dark:bg-black/60">
        <span
          className="text-foreground col-start-1 row-start-1 whitespace-nowrap transition-opacity duration-300"
          style={{ opacity: isMuseumZoom ? 0 : 1 }}
          aria-hidden={isMuseumZoom}
        >
          각 버블의 숫자는 해당 국가에 ArtMap이 수록한 미술관의 개수입니다.
        </span>
        <span
          className="text-foreground col-start-1 row-start-1 whitespace-nowrap transition-opacity duration-300"
          style={{ opacity: isMuseumZoom ? 1 : 0 }}
          aria-hidden={!isMuseumZoom}
        >
          각 버블의 이미지는 해당 미술관의 대표 작품입니다.
        </span>
      </div>
    </div>
  );
}
