"use client";

import { useState, useCallback } from "react";
import { useForm } from "react-hook-form";
import { motion, AnimatePresence } from "framer-motion";
import { useApp } from "@/contexts/AppContext";
import { X, Eye, EyeOff, GripVertical, BadgeX } from "lucide-react";
import { parseTwitchInput } from "@/utils/twitch";
import { cn } from "@/utils/theme";

interface FormData {
  username: string;
}

// Общий компонент для управления стримерами
function StreamerManagerContent() {
  const {
    streamers,
    addStreamer,
    removeStreamer,
    selectedStreams,
    reorderSelectedStreams,
    toggleStreamVisibility,
    updateSelectedStreams,
  } = useApp();
  const [draggedIndex, setDraggedIndex] = useState<number | null>(null);
  const [dragOverIndex, setDragOverIndex] = useState<number | null>(null);
  const {
    register,
    handleSubmit,
    formState: { errors, isSubmitting },
    reset,
    setError,
  } = useForm<FormData>({
    defaultValues: {
      username: "",
    },
  });

  const onSubmit = async (data: FormData) => {
    const trimmedValue = data.username.trim();

    // Валидация через parseTwitchInput
    const username = parseTwitchInput(trimmedValue);
    if (!username) {
      setError("username", {
        type: "manual",
        message: "Неверный формат имени пользователя или URL",
      });
      return;
    }

    // Проверяем, не добавлен ли уже этот стример
    if (
      streamers.some((s) => s.username === username && s.platform === "twitch")
    ) {
      setError("username", {
        type: "manual",
        message: "Этот стример уже добавлен",
      });
      return;
    }

    try {
      addStreamer(trimmedValue);
      reset();
    } catch (err) {
      setError("username", {
        type: "manual",
        message:
          err instanceof Error ? err.message : "Ошибка при добавлении стримера",
      });
    }
  };

  // Получаем порядок стримеров на основе selectedStreams, затем добавляем остальных
  const orderedStreamers = useCallback(() => {
    const ordered: typeof streamers = [];
    const addedIds = new Set<string>();

    // Сначала добавляем стримеров в порядке selectedStreams
    selectedStreams.forEach((id) => {
      const streamer = streamers.find((s) => s.id === id);
      if (streamer) {
        ordered.push(streamer);
        addedIds.add(streamer.id);
      }
    });

    // Затем добавляем остальных стримеров
    streamers.forEach((streamer) => {
      if (!addedIds.has(streamer.id)) {
        ordered.push(streamer);
      }
    });

    return ordered;
  }, [streamers, selectedStreams]);

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
        const ordered = orderedStreamers();
        const fromId = ordered[draggedIndex].id;
        const toId = ordered[dropIndex].id;

        // Находим индексы в selectedStreams
        const fromSelectedIndex = selectedStreams.indexOf(fromId);
        const toSelectedIndex = selectedStreams.indexOf(toId);

        // Если оба стримера в selectedStreams - меняем порядок
        if (fromSelectedIndex !== -1 && toSelectedIndex !== -1) {
          reorderSelectedStreams(fromSelectedIndex, toSelectedIndex);
        }
        // Если перетаскиваем видимого стримера на невидимого - добавляем невидимого в selectedStreams
        else if (fromSelectedIndex !== -1 && toSelectedIndex === -1) {
          // Добавляем toId в selectedStreams после fromId
          const newSelected = [...selectedStreams];
          const insertIndex = fromSelectedIndex + 1;
          newSelected.splice(insertIndex, 0, toId);
          updateSelectedStreams(newSelected);
        }
        // Если перетаскиваем невидимого на видимого - добавляем невидимого в selectedStreams
        else if (fromSelectedIndex === -1 && toSelectedIndex !== -1) {
          const newSelected = [...selectedStreams];
          newSelected.splice(toSelectedIndex, 0, fromId);
          updateSelectedStreams(newSelected);
        }
      }

      setDraggedIndex(null);
      setDragOverIndex(null);
    },
    [
      draggedIndex,
      orderedStreamers,
      selectedStreams,
      reorderSelectedStreams,
      updateSelectedStreams,
    ]
  );

  const handleDragEnd = useCallback(() => {
    setDraggedIndex(null);
    setDragOverIndex(null);
  }, []);

  return (
    <div className="flex flex-col gap-4">
      <form onSubmit={handleSubmit(onSubmit)} className="flex gap-2">
        <div className="flex-1">
          <input
            type="text"
            {...register("username", {
              required: "Введите имя пользователя или URL",
              validate: (value) => {
                const trimmed = value.trim();
                if (!trimmed) {
                  return "Введите имя пользователя или URL";
                }
                return true;
              },
            })}
            className={`${cn("input input-bordered w-full", {
              "input-error": errors.username,
            })}`}
            placeholder="Имя пользователя Twitch или URL"
            disabled={isSubmitting}
          />
          {errors.username && (
            <label className="label">
              <span className="label-text-alt text-error">
                {errors.username.message}
              </span>
            </label>
          )}
        </div>
        <button
          type="submit"
          className="btn btn-primary"
          disabled={isSubmitting}
        >
          {isSubmitting ? (
            <span className="loading loading-spinner loading-sm" />
          ) : (
            "Добавить"
          )}
        </button>
      </form>

      <div className="flex flex-col gap-2">
        <h4 className="text-lg font-semibold text-base-content">
          Добавленные стримеры ({streamers.length})
        </h4>

        <div className="max-h-[400px] overflow-y-auto pt-2">
          <AnimatePresence>
            {orderedStreamers().map((streamer, index) => {
              const isVisible = selectedStreams.includes(streamer.id);
              const isDragged = draggedIndex === index;
              const isDragOver = dragOverIndex === index;

              return (
                <motion.div
                  key={streamer.id}
                  initial={{ opacity: 0, height: 0 }}
                  animate={{ opacity: 1, height: "auto" }}
                  exit={{ opacity: 0, height: 0 }}
                  transition={{ duration: 0.2 }}
                >
                  <div
                    draggable
                    onDragStart={(e) => {
                      e.dataTransfer.effectAllowed = "move";
                      e.dataTransfer.setData("text/plain", streamer.id);
                      handleDragStart(index);
                    }}
                    onDragOver={(e) => handleDragOver(e, index)}
                    onDragLeave={handleDragLeave}
                    onDrop={(e) => handleDrop(e, index)}
                    onDragEnd={handleDragEnd}
                    className={`${cn(
                      "card p-3 bg-base-200 mb-2 transition-all cursor-move",
                      {
                        "opacity-75 scale-95": isDragged,
                      },
                      { "ring-4  ring-offset-[1] ring-primary": isDragOver }
                    )}`}
                  >
                    <div className="flex items-center justify-between gap-2">
                      <GripVertical className="h-4 w-4 text-base-content/40 shrink-0" />
                      <span
                        className={`${cn("flex-1 text-base-content", {
                          "opacity-50 line-through": !isVisible,
                        })}`}
                      >
                        {streamer.username}
                      </span>
                      <button
                        type="button"
                        className="btn btn-circle btn-sm btn-ghost"
                        onClick={() => toggleStreamVisibility(streamer.id)}
                        title={
                          isVisible ? "Скрыть из сетки" : "Показать в сетке"
                        }
                      >
                        {isVisible ? (
                          <Eye className="h-5 w-5" />
                        ) : (
                          <EyeOff className="h-5 w-5" />
                        )}
                      </button>
                      <button
                        type="button"
                        className="btn btn-circle btn-sm hover:scale-110 transition-all duration-200"
                        onClick={() => removeStreamer(streamer.id)}
                      >
                        <BadgeX className="h-5 w-5" />
                      </button>
                    </div>
                  </div>
                </motion.div>
              );
            })}
          </AnimatePresence>

          {streamers.length === 0 && (
            <p className="italic text-base-content/60 text-center py-4">
              Нет добавленных стримеров
            </p>
          )}
        </div>
      </div>
    </div>
  );
}

// Компонент для встраивания в страницу
export function StreamerManager() {
  return (
    <div className="flex flex-col gap-4">
      <h3 className="text-xl font-bold text-base-content">
        Управление стримерами
      </h3>
      <StreamerManagerContent />
    </div>
  );
}

// Компонент для модального окна
export function StreamerManagerModal() {
  return (
    <>
      <input type="checkbox" id="streamer-modal" className="modal-toggle" />
      <div className="modal" role="dialog">
        <div className="modal-box max-w-2xl">
          <h3 className="text-2xl font-bold text-base-content mb-4">
            Управление стримерами
          </h3>
          <StreamerManagerContent />
          <div className="modal-action">
            <label htmlFor="streamer-modal" className="btn">
              Закрыть
            </label>
          </div>
        </div>
        <label className="modal-backdrop" htmlFor="streamer-modal">
          Закрыть
        </label>
      </div>
    </>
  );
}
