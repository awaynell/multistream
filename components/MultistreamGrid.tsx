"use client";

import { useState, useEffect, useMemo, useCallback, useRef } from "react";
import { AnimatePresence } from "framer-motion";
import { Stream, ELayoutPreset } from "@/types";
import { RemoveConfirmModal } from "./organisms/RemoveConfirmModal";
import { TheatreModeView } from "./organisms/TheatreModeView";
import { StreamTile } from "./moleculas/StreamTile";
import { useApp } from "@/contexts/AppContext";
import { getTwitchChatEmbedUrl, getTwitchPlayerEmbedUrl } from "@/utils/twitch";
import { cn } from "@/utils/theme";
import { InfoIcon } from "lucide-react";

interface MultistreamGridProps {
  className?: string;
}

export function MultistreamGrid({ className = "" }: MultistreamGridProps) {
  const {
    layout,
    selectedStreams,
    streamers,
    removeStreamer,
    reorderSelectedStreams,
  } = useApp();

  const [theatreMode, setTheatreMode] = useState<string | null>(null);
  const [streamToRemove, setStreamToRemove] = useState<string | null>(null);
  const [draggedIndex, setDraggedIndex] = useState<number | null>(null);
  const [dragOverIndex, setDragOverIndex] = useState<number | null>(null);

  // Получаем hostname для Twitch embed
  const hostname =
    typeof window !== "undefined" ? window.location.hostname : "localhost";

  const canHScreen = useMemo(() => {
    return layout.preset !== ELayoutPreset["3x4"];
  }, [layout]);

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

  const gridConfig = useMemo(() => {
    return getGridConfig();
  }, [getGridConfig]);

  const displayStreamers = useMemo(() => {
    return selectedStreams
      .map((id) => getStreamerById(id))
      .filter((s): s is NonNullable<typeof s> => s !== undefined)
      .slice(0, gridConfig.cols * gridConfig.rows);
  }, [selectedStreams, getStreamerById, gridConfig]);

  const streams: Stream[] = useMemo(() => {
    const result: Stream[] = [];

    for (const streamer of displayStreamers) {
      const embedUrl = getTwitchPlayerEmbedUrl(streamer.username, hostname);
      const chatUrl = getTwitchChatEmbedUrl(streamer.username, hostname);

      const newStream: Stream = {
        id: streamer.id,
        url: embedUrl,
        title: streamer.username,
        chatUrl,
      };
      result.push(newStream);
    }

    return result;
  }, [displayStreamers, hostname]);

  useEffect(() => {
    const handleEscape = (e: KeyboardEvent) => {
      if (e.key === "Escape" && theatreMode) {
        setTheatreMode(null);
      }
    };

    window.addEventListener("keydown", handleEscape);
    return () => window.removeEventListener("keydown", handleEscape);
  }, [theatreMode]);

  const displayStreams = useMemo(() => {
    return streams.slice(0, gridConfig.cols * gridConfig.rows);
  }, [streams, gridConfig.cols, gridConfig.rows]);

  const onRemoveStream = useCallback(
    (streamId: string) => {
      removeStreamer(streamId);
    },
    [removeStreamer]
  );

  const onReorderStreams = useCallback(
    (fromIndex: number, toIndex: number) => {
      reorderSelectedStreams(fromIndex, toIndex);
    },
    [reorderSelectedStreams]
  );

  const handleDragStart = useCallback((index: number) => {
    setDraggedIndex(index);
  }, []);

  const handleDragOver = useCallback(
    (e: React.DragEvent, index: number) => {
      e.preventDefault();
      e.stopPropagation();
      if (draggedIndex !== null && draggedIndex !== index) {
        setDragOverIndex(index);
      }
    },
    [draggedIndex]
  );

  const handleDragLeave = useCallback(() => {
    setDragOverIndex(null);
  }, []);

  const handleDrop = useCallback(
    (e: React.DragEvent, dropIndex: number) => {
      e.preventDefault();
      e.stopPropagation();

      if (draggedIndex !== null && draggedIndex !== dropIndex) {
        onReorderStreams(draggedIndex, dropIndex);
      }

      setDraggedIndex(null);
      setDragOverIndex(null);
    },
    [draggedIndex, onReorderStreams]
  );

  const handleDragEnd = useCallback(() => {
    setDraggedIndex(null);
    setDragOverIndex(null);
  }, []);

  // Мемоизируем selectedStream, создавая стабильную ссылку на объект
  // Используем предыдущее значение из замыкания для сравнения
  const selectedStream = useMemo(() => {
    if (!theatreMode) return null;

    const found = streams.find((s) => s.id === theatreMode);
    if (!found) return null;

    return found;
  }, [theatreMode, streams]);

  const handleTheatreToggle = useCallback((streamId: string) => {
    setTheatreMode((prev) => (prev === streamId ? null : streamId));
  }, []);

  const handleTheatreClose = useCallback(() => {
    setTheatreMode(null);
  }, []);

  const removeModalCheckboxRef = useRef<HTMLInputElement>(null);

  const handleRemoveClick = useCallback((streamId: string) => {
    setStreamToRemove(streamId);
  }, []);

  // Открываем модалку когда streamToRemove установлен и streamTitle доступен
  useEffect(() => {
    if (streamToRemove && removeModalCheckboxRef.current) {
      const streamTitle = streams.find((s) => s.id === streamToRemove)?.title;
      if (streamTitle) {
        removeModalCheckboxRef.current.checked = true;
      }
    }
  }, [streamToRemove, streams]);

  const handleConfirmRemove = useCallback(() => {
    if (streamToRemove) {
      onRemoveStream(streamToRemove);
      // Если удаляемый стрим был в театральном режиме, закрываем его
      if (theatreMode === streamToRemove) {
        setTheatreMode(null);
      }
    }
    setStreamToRemove(null);
    // Закрываем модалку через checkbox
    if (removeModalCheckboxRef.current) {
      removeModalCheckboxRef.current.checked = false;
    }
  }, [streamToRemove, onRemoveStream, theatreMode]);

  const handleCancelRemove = useCallback(() => {
    setStreamToRemove(null);
    // Закрываем модалку через checkbox
    if (removeModalCheckboxRef.current) {
      removeModalCheckboxRef.current.checked = false;
    }
  }, []);

  // if (displayStreams.length === 0) {
  //   return (
  //     <div
  //       className={`flex flex-1 items-center justify-center p-8 ${className}`}
  //     >
  //       <p className="text-center text-xl text-base-content/60">
  //         Добавьте стримы, чтобы начать просмотр
  //       </p>
  //     </div>
  //   );
  // }

  return (
    <>
      <div className="relative h-full w-full flex flex-col">
        {displayStreams.length === 0 && (
          <div className="gap-2 m-2 flex items-center justify-center">
            <InfoIcon className="h-4 w-4 text-primary/80" />
            <label
              htmlFor="streamer-modal"
              className="text-center text-md text-base-content/60 cursor-pointer hover:text-primary"
            >
              Добавьте стримы, чтобы начать просмотр
            </label>
          </div>
        )}

        <div
          className={cn(
            "grid gap-2 px-2 py-4 h-full w-full",
            {
              "h-[calc(100vh-49px)]": canHScreen,
            },
            className
          )}
          style={{
            gridTemplateColumns: `repeat(${gridConfig.cols}, 1fr)`,
            gridTemplateRows: `repeat(${gridConfig.rows}, 1fr)`,
          }}
        >
          {Array.from({ length: gridConfig.cols * gridConfig.rows }).map(
            (_, index) => {
              const stream = displayStreams[index];
              const isDragged = draggedIndex === index;
              const isDragOver = dragOverIndex === index;

              if (!stream) {
                return (
                  <label
                    htmlFor="streamer-modal"
                    key={`empty-${index}`}
                    className={`${cn(
                      "group relative flex items-center justify-center rounded-lg bg-base-300 transition-all w-full h-full min-h-[200px] cursor-pointer hover:bg-base-300/80",
                      {
                        "ring-2 ring-primary ring-offset-2": isDragOver,
                      }
                    )}`}
                    onDragOver={(e) => handleDragOver(e, index)}
                    onDragLeave={handleDragLeave}
                    onDrop={(e) => handleDrop(e, index)}
                  >
                    <p className="absolute text-base-content/60 transition-opacity duration-200 group-hover:opacity-0">
                      Пусто
                    </p>
                    <p className="absolute text-primary transition-opacity duration-200 opacity-0 group-hover:opacity-100">
                      Добавить стримера
                    </p>
                  </label>
                );
              }

              // Всегда рендерим StreamTile, даже в театральном режиме
              // чтобы iframe не размонтировался
              return (
                <StreamTile
                  key={stream.id}
                  stream={stream}
                  isTheatreMode={theatreMode === stream.id}
                  isAnyTheatreModeActive={!!theatreMode}
                  onTheatreModeToggle={() => handleTheatreToggle(stream.id)}
                  onRemove={() => handleRemoveClick(stream.id)}
                  isDragged={isDragged}
                  isDragOver={isDragOver}
                  onDragStart={() => handleDragStart(index)}
                  onDragOver={(e) => handleDragOver(e, index)}
                  onDragLeave={handleDragLeave}
                  onDrop={(e) => handleDrop(e, index)}
                  onDragEnd={handleDragEnd}
                />
              );
            }
          )}
        </div>
      </div>

      <AnimatePresence mode="sync">
        {theatreMode && selectedStream && (
          <TheatreModeView
            key={`theatre-${selectedStream.id}`}
            stream={selectedStream}
            onClose={handleTheatreClose}
          />
        )}
      </AnimatePresence>

      {/* Модальное окно подтверждения удаления */}
      <RemoveConfirmModal
        streamTitle={
          streamToRemove
            ? streams.find((s) => s.id === streamToRemove)?.title || "стрим"
            : ""
        }
        onConfirm={handleConfirmRemove}
        onCancel={handleCancelRemove}
        checkboxRef={removeModalCheckboxRef}
      />
    </>
  );
}
