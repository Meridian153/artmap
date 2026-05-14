// 미술관 버블 컴포넌트 — 대표 작품 썸네일을 정사각형(border-radius 12px) 버블로 표시
// 줌 레벨 6 이상에서 HomeMap이 렌더링. 클릭 시 /museums/[id] 이동.

"use client";

import { useRef, useState } from "react";
import Image from "next/image";
import { useRouter } from "next/navigation";
import { Marker } from "react-map-gl/maplibre";
import type { MuseumSummary } from "@/types/museum";

type MuseumBubbleProps = {
  museum: MuseumSummary;
  opacity?: number; // 크로스페이드 제어 (기본값 1)
  onClick?: (museum: MuseumSummary) => void;
};

/** 버블 고정 크기 (px) */
const BUBBLE_SIZE = 56;

export function MuseumBubble({ museum, opacity = 1, onClick }: MuseumBubbleProps) {
  const router = useRouter();
  const buttonRef = useRef<HTMLButtonElement>(null);
  const [isHovered, setIsHovered] = useState(false);
  const [isLabelAbove, setIsLabelAbove] = useState(true);

  const handleMouseEnter = () => {
    if (buttonRef.current) {
      const rect = buttonRef.current.getBoundingClientRect();
      // 라벨 예상 높이(≈20px)와 gap(10px)을 더해 뷰포트 상단 초과 여부 판별
      setIsLabelAbove(rect.top - 10 - 20 >= 0);
    }
    setIsHovered(true);
  };

  const handleMouseLeave = () => {
    setIsHovered(false);
  };

  const handleClick = () => {
    onClick?.(museum);
    router.push(`/museums/${museum.id}`);
  };

  // 이니셜 폴백: name_ko 앞 2글자
  const initials = museum.name_ko.slice(0, 2);
  // 16자 초과 시 ellipsis 처리
  const labelText = museum.name_ko.length > 16 ? `${museum.name_ko.slice(0, 16)}…` : museum.name_ko;

  return (
    <Marker longitude={museum.longitude} latitude={museum.latitude} anchor="center">
      <div className="relative flex items-center justify-center">
        <button
          ref={buttonRef}
          type="button"
          onClick={handleClick}
          onMouseEnter={handleMouseEnter}
          onMouseLeave={handleMouseLeave}
          title={museum.name_ko}
          className="relative cursor-pointer overflow-hidden hover:scale-105 hover:shadow-[0_0_12px_4px_rgba(99,102,241,0.5)]"
          style={{
            width: BUBBLE_SIZE,
            height: BUBBLE_SIZE,
            borderRadius: 12,
            opacity,
            // 등장(opacity=1): transform/box-shadow만 200ms / 퇴장(opacity=0): opacity 300ms 페이드 아웃 추가
            transition:
              opacity === 1
                ? "transform 200ms ease-out, box-shadow 200ms ease-out"
                : "transform 200ms ease-out, box-shadow 200ms ease-out, opacity 300ms ease-out",
            pointerEvents: opacity === 0 ? "none" : "auto",
          }}
        >
          {museum.featured_artwork ? (
            <Image
              src={museum.featured_artwork.image_url} // PENDING_BE: featured_artwork.image_url
              alt={museum.featured_artwork.artwork_title}
              fill
              className="object-cover"
              sizes="56px"
            />
          ) : (
            <div className="bg-muted text-muted-foreground absolute inset-0 flex items-center justify-center text-sm font-semibold">
              {initials}
            </div>
          )}
        </button>

        {/* 호버 라벨 — 데스크톱 hover 전용, 모바일 대응은 별도 PR */}
        <div
          className="text-foreground pointer-events-none absolute left-1/2 -translate-x-1/2 rounded-full bg-white/85 px-2 py-1 text-xs whitespace-nowrap backdrop-blur-md dark:bg-black/70"
          style={{
            ...(isLabelAbove ? { bottom: "calc(100% + 10px)" } : { top: "calc(100% + 10px)" }),
            zIndex: 10,
            opacity: isHovered ? 1 : 0,
            transition: isHovered ? "opacity 100ms ease-in" : "none",
          }}
        >
          {labelText}
        </div>
      </div>
    </Marker>
  );
}
