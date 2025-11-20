"use client";

import { useState, useEffect, useMemo, useCallback, useRef } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { X } from "lucide-react";
import { StreamPlayer } from "./StreamPlayer";
import { StreamChat } from "./StreamChat";

export type Stream = {
  id: string;
  url: string;
  title: string;
  chatUrl?: string;
};

interface MultistreamGridProps {
  streams: Stream[];
  gridSize?: "2x2" | "3x3";
  className?: string;
  onRemoveStream?: (streamId: string) => void;
}

export function MultistreamGrid({
  streams,
  gridSize = "2x2",
  className = "",
  onRemoveStream,
}: MultistreamGridProps) {
  const [theatreMode, setTheatreMode] = useState<string | null>(null);
  const [streamToRemove, setStreamToRemove] = useState<string | null>(null);

  // Обработка Escape для закрытия театрального режима
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
    if (gridSize === "2x2") {
      return { cols: 2, rows: 2 };
    } else {
      return { cols: 3, rows: 3 };
    }
  }, [gridSize]);

  const displayStreams = useMemo(() => {
    return streams.slice(0, gridConfig.cols * gridConfig.rows);
  }, [streams, gridConfig]);

  const selectedStream = useMemo(() => {
    return theatreMode ? streams.find((s) => s.id === theatreMode) : null;
  }, [theatreMode, streams]);

  const handleTheatreToggle = useCallback((streamId: string) => {
    setTheatreMode((prev) => (prev === streamId ? null : streamId));
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

            if (!stream) {
              return (
                <div
                  key={`empty-${index}`}
                  className="flex min-h-[200px] items-center justify-center rounded-lg bg-base-200"
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
                onTheatreModeToggle={() => handleTheatreToggle(stream.id)}
                onRemove={
                  onRemoveStream
                    ? () => handleRemoveClick(stream.id)
                    : undefined
                }
              />
            );
          }
        )}
      </div>

      <AnimatePresence mode="sync">
        {theatreMode && selectedStream && (
          <TheatreModeView
            key={`theatre-${selectedStream.id}`}
            stream={selectedStream}
            onClose={() => setTheatreMode(null)}
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

interface StreamTileProps {
  stream: Stream;
  isTheatreMode: boolean;
  onTheatreModeToggle: () => void;
  onRemove?: () => void;
}

const StreamTile = ({
  stream,
  isTheatreMode,
  onTheatreModeToggle,
  onRemove,
}: StreamTileProps) => {
  // Критически важно: НЕ удаляем плитку из DOM в театральном режиме
  // Это гарантирует, что iframe останется в DOM и не перезагрузится
  return (
    <div
      className={`relative min-h-[200px] h-full w-full rounded-lg overflow-hidden bg-base-200 group transition-opacity duration-200 ${
        isTheatreMode ? "pointer-events-none opacity-0" : "opacity-100"
      }`}
      style={
        isTheatreMode
          ? {
              position: "absolute",
              zIndex: -1,
              visibility: "hidden" as const,
            }
          : {}
      }
    >
      <StreamPlayer
        streamId={stream.id}
        url={stream.url}
        isActive={!isTheatreMode}
      />
      {/* Кнопки управления - только в углу, не блокируют взаимодействие с плеером */}
      {!isTheatreMode && (
        <div className="absolute top-2 right-2 z-10 pointer-events-none flex gap-2">
          <button
            onClick={(e) => {
              e.preventDefault();
              e.stopPropagation();
              onTheatreModeToggle();
            }}
            className="opacity-0 group-hover:opacity-100 transition-opacity duration-200 btn btn-sm btn-primary shadow-lg pointer-events-auto"
            aria-label="Открыть театральный режим"
            title="Театральный режим"
          >
            <svg
              xmlns="http://www.w3.org/2000/svg"
              width="16"
              height="16"
              viewBox="0 0 24 24"
              fill="none"
              stroke="currentColor"
              strokeWidth="2"
              strokeLinecap="round"
              strokeLinejoin="round"
            >
              <path d="M8 3H5a2 2 0 0 0-2 2v3m18 0V5a2 2 0 0 0-2-2h-3m0 18h3a2 2 0 0 0 2-2v-3M3 16v3a2 2 0 0 0 2 2h3" />
            </svg>
            <span className="hidden sm:inline ml-1">Театр</span>
          </button>
          {onRemove && (
            <button
              onClick={(e) => {
                e.preventDefault();
                e.stopPropagation();
                onRemove();
              }}
              className="opacity-0 group-hover:opacity-100 transition-opacity duration-200 btn btn-sm btn-error shadow-lg pointer-events-auto"
              aria-label="Удалить стрим"
              title="Удалить стрим"
            >
              <X className="h-4 w-4" />
            </button>
          )}
        </div>
      )}
    </div>
  );
};

interface TheatreModeViewProps {
  stream: Stream;
  onClose: () => void;
}

const TheatreModeView = ({ stream, onClose }: TheatreModeViewProps) => {
  // Блокируем скролл body при открытии театрального режима
  useEffect(() => {
    document.body.style.overflow = "hidden";
    return () => {
      document.body.style.overflow = "";
    };
  }, []);

  return (
    <motion.div
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      exit={{ opacity: 0 }}
      transition={{ duration: 0.2 }}
      className="fixed inset-0 bg-base-100/95 flex items-center justify-center p-4 gap-4 overflow-hidden"
      style={{ zIndex: 0 }}
      onClick={onClose}
    >
      {/* Плеер - отдельное окно */}
      <motion.div
        initial={{ opacity: 0, scale: 0.95 }}
        animate={{ opacity: 1, scale: 1 }}
        exit={{ opacity: 0, scale: 0.95 }}
        transition={{ duration: 0.3, ease: [0.4, 0, 0.2, 1] }}
        className="relative shrink-0 h-full rounded-lg overflow-hidden shadow-2xl"
        style={{
          width: stream.chatUrl ? "calc(70% - 0.5rem)" : "calc(100% - 2rem)",
          maxWidth: stream.chatUrl ? "calc(70% - 0.5rem)" : "calc(100% - 2rem)",
          maxHeight: "calc(100vh - 2rem)",
        }}
        onClick={(e) => e.stopPropagation()}
      >
        <StreamPlayer streamId={stream.id} url={stream.url} isActive={true} />
      </motion.div>

      {/* Чат - отдельное окно */}
      {stream.chatUrl && (
        <motion.div
          initial={{ opacity: 0, x: 20 }}
          animate={{ opacity: 1, x: 0 }}
          exit={{ opacity: 0, x: 20 }}
          transition={{ duration: 0.3, ease: [0.4, 0, 0.2, 1] }}
          className="shrink-0 h-full bg-base-100 rounded-lg shadow-2xl overflow-hidden"
          style={{
            width: "calc(30% - 0.5rem)",
            maxWidth: "calc(30% - 0.5rem)",
            maxHeight: "calc(100vh - 2rem)",
          }}
          onClick={(e) => e.stopPropagation()}
        >
          <StreamChat url={stream.chatUrl} />
        </motion.div>
      )}

      {/* Кнопка закрытия - поверх всего */}
      <motion.button
        initial={{ opacity: 0, scale: 0.8 }}
        animate={{ opacity: 1, scale: 1 }}
        exit={{ opacity: 0, scale: 0.8 }}
        transition={{ duration: 0.2, delay: 0.1 }}
        onClick={onClose}
        className="absolute right-8 top-8 btn btn-circle btn-sm btn-error"
        aria-label="Закрыть театральный режим"
      >
        <X className="h-5 w-5" />
      </motion.button>
    </motion.div>
  );
};

interface RemoveConfirmModalProps {
  streamTitle: string;
  onConfirm: () => void;
  onCancel: () => void;
  checkboxRef: React.RefObject<HTMLInputElement | null>;
}

const RemoveConfirmModal = ({
  streamTitle,
  onConfirm,
  onCancel,
  checkboxRef,
}: RemoveConfirmModalProps) => {
  // Не рендерим модалку, если нет названия стрима
  if (!streamTitle) {
    return null;
  }

  return (
    <>
      <input
        type="checkbox"
        id="remove-stream-modal"
        className="modal-toggle"
        ref={checkboxRef}
      />
      <div className="modal" role="dialog">
        <div className="modal-box max-w-md">
          <h3 className="text-2xl font-bold text-base-content mb-4">
            Подтверждение удаления
          </h3>
          <p className="text-base-content mb-6">
            Вы уверены, что хотите удалить стрим <strong>{streamTitle}</strong>{" "}
            из сетки?
          </p>
          <div className="modal-action">
            <label
              htmlFor="remove-stream-modal"
              className="btn btn-outline"
              onClick={onCancel}
            >
              Отмена
            </label>
            <label
              htmlFor="remove-stream-modal"
              className="btn btn-error"
              onClick={onConfirm}
            >
              Удалить
            </label>
          </div>
        </div>
        <label
          className="modal-backdrop"
          htmlFor="remove-stream-modal"
          onClick={onCancel}
        >
          Закрыть
        </label>
      </div>
    </>
  );
};
