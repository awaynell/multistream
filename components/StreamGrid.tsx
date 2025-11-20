"use client";

import { useMemo, useCallback } from "react";
import { useApp } from "@/contexts/AppContext";
import { MultistreamGrid, Stream } from "./MultistreamGrid";
import { getTwitchEmbedUrl } from "@/utils/twitch";

export function StreamGrid() {
  const { layout, selectedStreams, streamers, removeStreamer } = useApp();

  // Получаем hostname для Twitch embed
  const hostname =
    typeof window !== "undefined" ? window.location.hostname : "localhost";

  // Функция получения конфигурации сетки
  const getGridConfig = useCallback(() => {
    switch (layout.preset) {
      case "1x1":
        return { cols: 1, rows: 1, gridSize: "1x1" as const };
      case "2x2":
        return { cols: 2, rows: 2, gridSize: "2x2" as const };
      case "3x3":
        return { cols: 3, rows: 3, gridSize: "3x3" as const };
      default:
        return { cols: 2, rows: 2, gridSize: "2x2" as const };
    }
  }, [layout]);

  const getStreamerById = useCallback(
    (id: string) => {
      return streamers.find((s) => s.id === id);
    },
    [streamers]
  );

  // Пересчитываем gridConfig при изменении layout
  const gridConfig = useMemo(() => {
    return getGridConfig();
  }, [getGridConfig]);

  // Получаем стримеров для отображения
  const displayStreamers = useMemo(() => {
    const streamsToShow = selectedStreams
      .map((id) => getStreamerById(id))
      .filter((s): s is NonNullable<typeof s> => s !== undefined)
      .slice(0, gridConfig.cols * gridConfig.rows);

    // Если не выбраны стримеры, показываем первые доступные
    return streamsToShow.length > 0
      ? streamsToShow
      : streamers.slice(0, gridConfig.cols * gridConfig.rows);
  }, [selectedStreams, streamers, getStreamerById, gridConfig]);

  // Преобразуем Streamer[] в Stream[] для MultistreamGrid
  const streams: Stream[] = useMemo(() => {
    return displayStreamers.map((streamer) => {
      const embedUrl = getTwitchEmbedUrl(streamer.username, hostname);
      const chatUrl =
        typeof window !== "undefined"
          ? `https://www.twitch.tv/embed/${streamer.username}/chat?parent=${hostname}&darkpopout`
          : undefined;

      return {
        id: streamer.id,
        url: embedUrl,
        title: streamer.username,
        chatUrl,
      };
    });
  }, [displayStreamers, hostname]);

  const handleRemoveStream = useCallback((streamId: string) => {
    removeStreamer(streamId);
  }, [removeStreamer]);

  return (
    <MultistreamGrid
      streams={streams}
      gridSize={gridConfig.gridSize}
      onRemoveStream={handleRemoveStream}
    />
  );
}
