"use client";

import { useState, useEffect, useMemo, useCallback, useRef } from "react";
import { AnimatePresence } from "framer-motion";
import { LayoutPreset, Stream } from "@/types";
import { RemoveConfirmModal } from "./organisms/RemoveConfirmModal";
import { TheatreModeView } from "./organisms/TheatreModeView";
import { StreamTile } from "./moleculas/StreamTile";

interface MultistreamGridProps {
  streams: Stream[];
  gridSize?: LayoutPreset;
  className?: string;
  onRemoveStream?: (streamId: string) => void;
  onReorderStreams?: (fromIndex: number, toIndex: number) => void;
}

export function MultistreamGrid({
  streams,
  gridSize = "2x2",
  className = "",
  onRemoveStream,
  onReorderStreams,
}: MultistreamGridProps) {
  const [theatreMode, setTheatreMode] = useState<string | null>(null);
  const [streamToRemove, setStreamToRemove] = useState<string | null>(null);
  const [draggedIndex, setDraggedIndex] = useState<number | null>(null);
  const [dragOverIndex, setDragOverIndex] = useState<number | null>(null);

  useEffect(() => {
    const handleEscape = (e: KeyboardEvent) => {
      if (e.key === "Escape" && theatreMode) {
        setTheatreMode(null);
      }
    };

    window.addEventListener("keydown", handleEscape);
    return () => window.removeEventListener("keydown", handleEscape);
  }, [theatreMode]);

  const gridConfig = useMemo(() => {
    if (gridSize === "1x1") {
      return { cols: 1, rows: 1 };
    } else if (gridSize === "2x2") {
      return { cols: 2, rows: 2 };
    } else if (gridSize === "3x3") {
      return { cols: 3, rows: 3 };
    } else if (gridSize === "3x4") {
      return { cols: 3, rows: 4 };
    } else {
      return { cols: 2, rows: 2 };
    }
  }, [gridSize]);

  // Стабильный список стримов для предотвращения ре-рендеринга
  const displayStreams = useMemo(() => {
    return streams.slice(0, gridConfig.cols * gridConfig.rows);
  }, [streams, gridConfig.cols, gridConfig.rows]);

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

      if (
        draggedIndex !== null &&
        draggedIndex !== dropIndex &&
        onReorderStreams
      ) {
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
    if (streamToRemove && onRemoveStream) {
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

  if (displayStreams.length === 0) {
    return (
      <div
        className={`flex flex-1 items-center justify-center p-8 ${className}`}
      >
        <p className="text-center text-xl text-base-content/60">
          Добавьте стримы, чтобы начать просмотр
        </p>
      </div>
    );
  }

  return (
    <>
      <div className="relative h-full w-full">
        <div
          className={`grid h-full gap-2 p-2 ${className}`}
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
                  <div
                    key={`empty-${index}`}
                    className={`flex min-h-[200px] items-center justify-center rounded-lg bg-base-200 transition-all ${
                      isDragOver ? "ring-2 ring-primary ring-offset-2" : ""
                    }`}
                    onDragOver={(e) => handleDragOver(e, index)}
                    onDragLeave={handleDragLeave}
                    onDrop={(e) => handleDrop(e, index)}
                  >
                    <p className="text-base-content/60">Пусто</p>
                  </div>
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
                  onRemove={
                    onRemoveStream
                      ? () => handleRemoveClick(stream.id)
                      : undefined
                  }
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
