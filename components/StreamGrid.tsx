"use client";

import { useMemo, useCallback, useRef } from "react";
import { useApp } from "@/contexts/AppContext";
import { MultistreamGrid } from "./MultistreamGrid";
import { getTwitchChatEmbedUrl, getTwitchPlayerEmbedUrl } from "@/utils/twitch";
import { Stream } from "@/types";

export function StreamGrid() {
  const {
    layout,
    selectedStreams,
    streamers,
    removeStreamer,
    reorderSelectedStreams,
  } = useApp();

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
      case "3x4":
        return { cols: 3, rows: 4, gridSize: "3x4" as const };
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
  // Показываем только стримеров из selectedStreams
  const displayStreamers = useMemo(() => {
    return selectedStreams
      .map((id) => getStreamerById(id))
      .filter((s): s is NonNullable<typeof s> => s !== undefined)
      .slice(0, gridConfig.cols * gridConfig.rows);
  }, [selectedStreams, getStreamerById, gridConfig]);

  // Кеш для объектов Stream, чтобы переиспользовать их при неизменных данных
  const streamCacheRef = useRef<Map<string, Stream>>(new Map());

  // Преобразуем Streamer[] в Stream[] для MultistreamGrid
  // с кешированием объектов для предотвращения ререндеров
  const streams: Stream[] = useMemo(() => {
    const cache = streamCacheRef.current;
    const result: Stream[] = [];

    for (const streamer of displayStreamers) {
      const embedUrl = getTwitchPlayerEmbedUrl(streamer.username, hostname);
      const chatUrl = getTwitchChatEmbedUrl(streamer.username, hostname);

      // Проверяем, есть ли кешированный объект с теми же данными
      const cached = cache.get(streamer.id);
      if (
        cached &&
        cached.url === embedUrl &&
        cached.chatUrl === chatUrl &&
        cached.title === streamer.username
      ) {
        // Данные не изменились, используем кешированный объект
        result.push(cached);
      } else {
        // Данные изменились, создаём новый объект и кешируем его
        const newStream: Stream = {
          id: streamer.id,
          url: embedUrl,
          title: streamer.username,
          chatUrl,
        };
        cache.set(streamer.id, newStream);
        result.push(newStream);
      }
    }

    // Очищаем кеш от объектов, которые больше не используются
    const usedIds = new Set(displayStreamers.map((s) => s.id));
    for (const [id] of cache) {
      if (!usedIds.has(id)) {
        cache.delete(id);
      }
    }

    return result;
  }, [displayStreamers, hostname]);

  const handleRemoveStream = useCallback(
    (streamId: string) => {
      removeStreamer(streamId);
    },
    [removeStreamer]
  );

  const handleReorderStreams = useCallback(
    (fromIndex: number, toIndex: number) => {
      reorderSelectedStreams(fromIndex, toIndex);
    },
    [reorderSelectedStreams]
  );

  return (
    <>
      <MultistreamGrid
        streams={streams}
        gridSize={gridConfig.gridSize}
        onRemoveStream={handleRemoveStream}
        onReorderStreams={handleReorderStreams}
      />
    </>
  );
}
