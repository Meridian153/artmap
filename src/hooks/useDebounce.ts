// 입력값을 일정 시간 후에만 반영하는 범용 debounce 훅
// 연속된 값 변경 시 이전 타이머를 취소하고 마지막 값만 delay 경과 후 반환한다.

"use client";

import { useEffect, useState } from "react";

/**
 * 값 변경 시 delay(ms)만큼 지연된 값을 반환한다.
 * - 검색 자동완성처럼 입력 중 과도한 API 호출을 줄이는 용도에 사용.
 * - 값이 연속으로 바뀌면 이전 타이머는 cleanup에서 취소된다.
 */
export function useDebounce<T>(value: T, delay: number = 300): T {
  const [debouncedValue, setDebouncedValue] = useState<T>(value);

  useEffect(() => {
    // delay 경과 후 현재 value를 반영
    const timer = setTimeout(() => {
      setDebouncedValue(value);
    }, delay);

    // value 또는 delay가 바뀌면 이전 타이머 취소 — 가장 최근 값만 반영됨
    return () => {
      clearTimeout(timer);
    };
  }, [value, delay]);

  return debouncedValue;
}
