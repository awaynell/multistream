"use client";

import { useEffect, useRef, memo } from "react";

interface StreamPlayerProps {
  streamId: string;
  url: string;
  isActive?: boolean; // true = этот плеер активен и должен управлять iframe
  isTheatreMode?: boolean; // true = этот плеер в театральном режиме
}

// Глобальный контейнер для всех iframe
let iframeContainer: HTMLDivElement | null = null;
const iframes = new Map<string, HTMLIFrameElement>();

// Получаем или создаем глобальный контейнер
const getIframeContainer = () => {
  if (!iframeContainer && typeof document !== "undefined") {
    iframeContainer = document.getElementById(
      "iframe-container"
    ) as HTMLDivElement;
    if (!iframeContainer) {
      iframeContainer = document.createElement("div");
      iframeContainer.id = "iframe-container";
      iframeContainer.style.position = "fixed";
      iframeContainer.style.top = "0";
      iframeContainer.style.left = "0";
      iframeContainer.style.width = "0";
      iframeContainer.style.height = "0";
      iframeContainer.style.overflow = "visible";
      iframeContainer.style.pointerEvents = "none"; // Контейнер не перехватывает события, iframe внутри управляют своими событиями
      // НЕ устанавливаем z-index для контейнера, чтобы не создавать контекст стекирования
      // Каждый iframe управляет своим z-index индивидуально
      document.body.appendChild(iframeContainer);
    }
  }
  return iframeContainer;
};

export const StreamPlayer = memo(function StreamPlayer({
  streamId,
  url,
  isActive = true, // По умолчанию активен
  isTheatreMode = false, // По умолчанию не в театральном режиме
}: StreamPlayerProps) {
  const anchorRef = useRef<HTMLDivElement>(null);
  const positionUpdateRef = useRef<number>(0);

  useEffect(() => {
    const container = getIframeContainer();
    if (!container) return;

    // Получаем или создаем iframe
    let iframe = iframes.get(streamId);
    if (!iframe) {
      iframe = document.createElement("iframe");
      iframe.src = url;
      iframe.allow = "autoplay; fullscreen; picture-in-picture";
      iframe.style.position = "fixed";
      iframe.style.border = "none";
      iframe.style.width = "100%";
      iframe.style.height = "100%";
      iframe.style.pointerEvents = "auto";
      iframe.style.transition = "all 0.25s cubic-bezier(0.4, 0, 0.2, 1)"; // Плавный переход
      // iframe.style.borderRadius = "8px"; // Округление границ (rounded-lg)
      container.appendChild(iframe);
      iframes.set(streamId, iframe);
    }

    // Устанавливаем z-index и pointer-events для iframe в зависимости от режима
    // Каждый iframe управляет своим z-index индивидуально
    iframe.style.pointerEvents = "auto"; // Всегда разрешаем события для iframe
    if (isTheatreMode) {
      iframe.style.zIndex = "105"; // Выше фона, но ниже чата (106) и кнопок (107)
    } else {
      iframe.style.zIndex = "2"; // В сетке
    }

    // ТОЛЬКО АКТИВНЫЙ плеер управляет позицией iframe
    if (!isActive) {
      // Скрываем iframe, если он неактивен, но не удаляем его
      iframe.style.opacity = "0";
      iframe.style.visibility = "hidden";
      return; // Неактивный плеер ничего не делает
    }

    // Делаем iframe видимым
    iframe.style.opacity = "1";
    iframe.style.visibility = "visible";

    // Функция позиционирования iframe
    const updatePosition = (instant = false) => {
      if (!anchorRef.current || !iframe) return;

      const rect = anchorRef.current.getBoundingClientRect();

      // Проверяем, что элемент видим
      if (rect.width === 0 || rect.height === 0) return;

      // Для мгновенного обновления - убираем transition
      if (instant) {
        iframe.style.transition = "none";
      }

      iframe.style.left = `${rect.left}px`;
      iframe.style.top = `${rect.top}px`;
      iframe.style.width = `${rect.width}px`;
      iframe.style.height = `${rect.height}px`;

      // Возвращаем transition после мгновенного обновления
      if (instant) {
        // Форсируем reflow для применения изменений
        void iframe.offsetHeight;
        iframe.style.transition = "all 0.25s cubic-bezier(0.4, 0, 0.2, 1)";
      }
    };

    // Немедленное обновление БЕЗ анимации (мгновенное перемещение)
    // Это важно для бесшовного переключения между режимами
    updatePosition(true);

    // Цикл анимации для плавного следования за изменениями
    const animate = () => {
      updatePosition(false);
      positionUpdateRef.current = requestAnimationFrame(animate);
    };
    positionUpdateRef.current = requestAnimationFrame(animate);

    // Дополнительное обновление через небольшую задержку
    const fallbackTimeout = setTimeout(() => updatePosition(true), 50);

    // Обработчики событий
    const handleResize = () => updatePosition(false);
    const handleScroll = () => updatePosition(false);

    // Слушаем изменения размера окна
    window.addEventListener("resize", handleResize);
    window.addEventListener("scroll", handleScroll);

    return () => {
      clearTimeout(fallbackTimeout);
      if (positionUpdateRef.current) {
        cancelAnimationFrame(positionUpdateRef.current);
      }
      window.removeEventListener("resize", handleResize);
      window.removeEventListener("scroll", handleScroll);

      // Проверяем, есть ли еще активные компоненты StreamPlayer с таким streamId
      // Если есть элементы в DOM с data-stream-id, значит компонент все еще используется
      const activeAnchors = document.querySelectorAll(
        `[data-stream-id="${streamId}"]`
      );

      // Удаляем iframe только если нет активных компонентов StreamPlayer
      if (activeAnchors.length === 0) {
        const iframeToRemove = iframes.get(streamId);
        if (iframeToRemove) {
          // Скрываем iframe перед удалением
          iframeToRemove.style.opacity = "0";
          iframeToRemove.style.visibility = "hidden";

          // Проверяем, что iframe все еще в DOM перед удалением
          if (iframeToRemove.parentNode) {
            iframeToRemove.parentNode.removeChild(iframeToRemove);
          }
          iframes.delete(streamId);
        }
      }
    };
  }, [streamId, url, isActive, isTheatreMode]);

  return (
    <div className="relative w-full h-full rounded-lg translate-y-0">
      <div
        ref={anchorRef}
        className="w-full h-full rounded-lg"
        data-stream-id={streamId}
        style={{ pointerEvents: "none" }}
      />
    </div>
  );
});
