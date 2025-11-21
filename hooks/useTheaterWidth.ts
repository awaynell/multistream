import { useLocalStorage } from "./useLocalStorage";
import { useMemo, useCallback } from "react";

// Сохраняем долю ширины плеера (от 0 до 1)
// По умолчанию 0.8 (80%)
export function useTheaterWidth() {
  const [playerWidthRatio, setPlayerWidthRatio] = useLocalStorage<number>(
    "theater-player-width-ratio",
    0.8
  );

  // Ограничиваем значение между 0.2 и 0.95 (20% - 95% ширины экрана)
  const clampedRatio = useMemo(
    () => Math.max(0.2, Math.min(0.95, playerWidthRatio)),
    [playerWidthRatio]
  );

  const setWidth = useCallback(
    (ratio: number) => {
      const clamped = Math.max(0.2, Math.min(0.95, ratio));
      setPlayerWidthRatio(clamped);
    },
    [setPlayerWidthRatio]
  );

  const chatWidthRatio = useMemo(() => 1 - clampedRatio, [clampedRatio]);

  return useMemo(
    () => ({
      playerWidthRatio: clampedRatio,
      chatWidthRatio,
      setPlayerWidthRatio: setWidth,
    }),
    [clampedRatio, chatWidthRatio, setWidth]
  );
}
