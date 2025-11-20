"use client";

import { useForm } from "react-hook-form";
import { motion, AnimatePresence } from "framer-motion";
import { useApp } from "@/contexts/AppContext";
import { X } from "lucide-react";
import { parseTwitchInput } from "@/utils/twitch";

interface FormData {
  username: string;
}

// Общий компонент для управления стримерами
function StreamerManagerContent() {
  const { streamers, addStreamer, removeStreamer } = useApp();
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
            className={`input input-bordered w-full ${
              errors.username ? "input-error" : ""
            }`}
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
            <span className="loading loading-spinner loading-sm"></span>
          ) : (
            "Добавить"
          )}
        </button>
      </form>

      <div className="flex flex-col gap-2">
        <h4 className="text-lg font-semibold text-base-content">
          Добавленные стримеры ({streamers.length})
        </h4>

        <div className="max-h-[400px] overflow-y-auto">
          <AnimatePresence>
            {streamers.map((streamer) => (
              <motion.div
                key={streamer.id}
                initial={{ opacity: 0, height: 0 }}
                animate={{ opacity: 1, height: "auto" }}
                exit={{ opacity: 0, height: 0 }}
                transition={{ duration: 0.2 }}
              >
                <div className="card bg-base-200 p-3 mb-2">
                  <div className="flex items-center justify-between gap-2">
                    <span className="flex-1 text-base-content">
                      {streamer.username}
                    </span>
                    <button
                      type="button"
                      className="btn btn-circle btn-sm btn-error"
                      onClick={() => removeStreamer(streamer.id)}
                    >
                      <X className="h-4 w-4" />
                    </button>
                  </div>
                </div>
              </motion.div>
            ))}
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
