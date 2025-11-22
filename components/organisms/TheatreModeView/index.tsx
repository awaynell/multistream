import { StreamChat } from "@/components/moleculas/StreamChat";
import { StreamPlayer } from "@/components/StreamPlayer";
import { useLocalStorage } from "@/hooks/useLocalStorage";
import { useTheaterWidth } from "@/hooks/useTheaterWidth";
import { Stream } from "@/types";
import { cn } from "@/utils/theme";
import { motion } from "framer-motion";
import { BadgeX } from "lucide-react";
import { useRef, useState, useEffect, useCallback, memo } from "react";

interface TheatreModeViewProps {
  stream: Stream;
  onClose: () => void;
}

const TheatreModeViewComponent = ({
  stream,
  onClose,
}: TheatreModeViewProps) => {
  const playerRef = useRef<HTMLDivElement>(null);
  const containerRef = useRef<HTMLDivElement>(null);
  const [maskStyle, setMaskStyle] = useState<React.CSSProperties>({});
  const [isDragging, setIsDragging] = useState(false);
  const [isInitialized, setIsInitialized] = useState(false);

  const { playerWidthRatio, chatWidthRatio, setPlayerWidthRatio } =
    useTheaterWidth();

  const [helpAlertShown, setHelpAlertShown] = useLocalStorage(
    "help_alert_shown",
    false
  );
  // Блокируем скролл body при открытии театрального режима
  useEffect(() => {
    document.body.style.overflow = "hidden";
    // Используем requestAnimationFrame для плавного перехода размеров
    // Это позволяет браузеру сначала отрендерить элемент с начальными размерами,
    // а затем применить transition
    requestAnimationFrame(() => {
      requestAnimationFrame(() => {
        setIsInitialized(true);
      });
    });
    return () => {
      document.body.style.overflow = "";
    };
  }, []);

  // Cleanup для восстановления pointer-events iframe при размонтировании во время перетаскивания
  useEffect(() => {
    return () => {
      if (isDragging) {
        const iframeContainer = document.getElementById("iframe-container");
        if (iframeContainer) {
          const iframes = iframeContainer.querySelectorAll("iframe");
          iframes.forEach((iframe) => {
            (iframe as HTMLElement).style.pointerEvents = "auto";
          });
        }
        document.body.style.userSelect = "";
        document.body.style.cursor = "";
      }
    };
  }, [isDragging]);

  // Обработчик перетаскивания для изменения ширины
  const handleMouseDown = useCallback(
    (e: React.MouseEvent) => {
      e.preventDefault();
      e.stopPropagation();

      if (!containerRef.current) return;

      setIsDragging(true);

      // Отключаем выделение текста и меняем курсор во время перетаскивания
      document.body.style.userSelect = "none";
      document.body.style.cursor = "col-resize";

      // Отключаем pointer-events для всех iframe в контейнере iframe-container
      // Это нужно, чтобы iframe плеера не перехватывал события мыши
      const iframeContainer = document.getElementById("iframe-container");
      if (iframeContainer) {
        const iframes = iframeContainer.querySelectorAll("iframe");
        iframes.forEach((iframe) => {
          (iframe as HTMLElement).style.pointerEvents = "none";
        });
      }

      const handleMouseMove = (e: MouseEvent) => {
        e.preventDefault();
        e.stopPropagation();
        if (!containerRef.current) return;

        const containerRect = containerRef.current.getBoundingClientRect();
        const containerWidth = containerRect.width;
        const mouseX = e.clientX - containerRect.left;

        // Вычисляем новую долю ширины плеера
        const newRatio = mouseX / containerWidth;

        // Устанавливаем новую ширину с ограничениями
        setPlayerWidthRatio(newRatio);
      };

      const handleMouseUp = (e: MouseEvent) => {
        e.preventDefault();
        e.stopPropagation();
        setIsDragging(false);
        document.body.style.userSelect = "";
        document.body.style.cursor = "";

        // Включаем обратно pointer-events для всех iframe
        const iframeContainer = document.getElementById("iframe-container");
        if (iframeContainer) {
          const iframes = iframeContainer.querySelectorAll("iframe");
          iframes.forEach((iframe) => {
            (iframe as HTMLElement).style.pointerEvents = "auto";
          });
        }

        // Удаляем обработчики после завершения перетаскивания
        window.removeEventListener("mousemove", handleMouseMove, true);
        window.removeEventListener("mouseup", handleMouseUp, true);
      };

      // Используем capture phase для перехвата событий до дочерних элементов
      // Используем window вместо document для более надежного перехвата
      window.addEventListener("mousemove", handleMouseMove, true);
      window.addEventListener("mouseup", handleMouseUp, true);
    },
    [setPlayerWidthRatio]
  );

  // Вычисляем позицию и размеры плеера для маски
  useEffect(() => {
    const updateMask = () => {
      if (!playerRef.current) return;

      const rect = playerRef.current.getBoundingClientRect();

      // Вычисляем позицию относительно viewport (так как overlay fixed)
      const left = rect.left;
      const top = rect.top;
      const width = rect.width;
      const height = rect.height;

      // Создаем маску с вырезом для плеера используя clip-path
      // Покрываем всё кроме области плеера
      const clipPath = `polygon(
        0% 0%, 
        0% 100%, 
        ${left}px 100%, 
        ${left}px ${top}px, 
        ${left + width}px ${top}px, 
        ${left + width}px ${top + height}px, 
        ${left}px ${top + height}px, 
        ${left}px 100%, 
        100% 100%, 
        100% 0%
      )`;

      setMaskStyle((prevStyle) => {
        if (prevStyle.clipPath === clipPath) {
          return prevStyle; // Тот же объект = нет ререндера
        }
        return { clipPath }; // Новый объект только при реальном изменении
      });
    };

    updateMask();
    const interval = setInterval(updateMask, 100);
    window.addEventListener("resize", updateMask);
    window.addEventListener("scroll", updateMask);

    const timeout = setTimeout(updateMask, 100);

    return () => {
      clearInterval(interval);
      window.removeEventListener("resize", updateMask);
      window.removeEventListener("scroll", updateMask);
      clearTimeout(timeout);
    };
  }, [stream.chatUrl, playerWidthRatio]);

  return (
    <>
      {!helpAlertShown && (
        <div
          role="alert"
          className="alert alert-vertical sm:alert-horizontal z-999 fixed bottom-0 left-0 w-full flex gap-4 align-center justify-center"
        >
          <span>Выйти из театрального режима можно нажатием кнопки Escape</span>
          <div>
            <button
              className="btn btn-sm btn-primary"
              onClick={() => setHelpAlertShown(true)}
            >
              Закрыть
            </button>
          </div>
        </div>
      )}

      {/* Overlay с блюром для сетки, исключающий область плеера */}
      <motion.div
        initial={{ opacity: 0, backdropFilter: "blur(0px)" }}
        animate={{ opacity: 1, backdropFilter: "blur(12px)" }}
        exit={{ opacity: 0, backdropFilter: "blur(0px)" }}
        transition={{ duration: 0.5, ease: [0.4, 0, 0.2, 1] }}
        className="fixed inset-0 bg-base-300/10 pointer-events-none"
        style={{
          zIndex: 50,
          ...maskStyle,
        }}
      />

      {/* Контейнер театрального режима - pointer-events разрешены для дочерних элементов */}
      <div className="absolute inset-0 flex items-center justify-center overflow-hidden pointer-events-none">
        {/* Контент театрального режима */}
        <div
          ref={containerRef}
          className="relative flex items-center justify-center w-full h-full max-w-[1920px] max-h-[1080px] pointer-events-none"
        >
          {/* Плеер - отдельное окно, БЕЗ z-index чтобы не создавать контекст стекирования */}
          <motion.div
            ref={playerRef}
            initial={{ opacity: 0, scale: 0.9, y: 20 }}
            animate={{ opacity: 1, scale: 1, y: 0 }}
            exit={{ opacity: 0, scale: 0.95, y: 10 }}
            transition={{
              duration: 0.5,
              ease: [0.16, 1, 0.3, 1],
              opacity: { duration: 0.4 },
              scale: { duration: 0.5, ease: [0.16, 1, 0.3, 1] },
              y: { duration: 0.5, ease: [0.16, 1, 0.3, 1] },
            }}
            className={cn(
              "relative shrink-0 h-full shadow-2xl pointer-events-auto",
              { "pointer-events-none": isDragging }
            )}
            style={{
              width: stream.chatUrl
                ? `calc(${playerWidthRatio * 100}%)`
                : "calc(100% - 2rem)",
              maxWidth: stream.chatUrl
                ? `calc(${playerWidthRatio * 100}%)`
                : "calc(100% - 2rem)",
              maxHeight: "100vh",
              transition: isInitialized
                ? "width 0.5s cubic-bezier(0.16, 1, 0.3, 1), max-width 0.5s cubic-bezier(0.16, 1, 0.3, 1)"
                : "none",
              willChange: "width, max-width",
            }}
          >
            <StreamPlayer
              streamId={stream.id}
              url={stream.url}
              isActive={true}
              isTheatreMode={true}
            />
          </motion.div>

          {/* Разделитель для изменения ширины */}
          {stream.chatUrl && (
            <motion.div
              key="resizer"
              initial="hidden"
              animate="visible"
              exit="hidden"
              variants={{
                visible: {
                  opacity: 1,
                  transition: {
                    duration: 0.4,
                    delay: 0.2,
                    ease: [0.16, 1, 0.3, 1],
                  },
                },
                hidden: {
                  opacity: 0,
                  transition: {
                    duration: 0, // Мгновенное исчезновение при выходе
                  },
                },
              }}
              onMouseDown={handleMouseDown}
              className={cn(
                "relative h-full rounded-full w-2 cursor-col-resize pointer-events-auto transition-colors",
                {
                  "bg-primary mx-2": isDragging,
                  "bg-[#18181b]": !isDragging,
                }
              )}
              style={{ zIndex: 9999 }}
            >
              <div className="flex items-center justify-center bg-red-500">
                <div className="w-1 rounded-full" />
              </div>
            </motion.div>
          )}

          {/* Чат - отдельное окно */}
          {stream.chatUrl && (
            <motion.div
              initial={{ opacity: 0, x: 30, scale: 0.95 }}
              animate={{ opacity: 1, x: 0, scale: 1 }}
              exit={{ opacity: 0, x: 20, scale: 0.95 }}
              transition={{
                duration: 0.5,
                delay: 0.1,
                ease: [0.16, 1, 0.3, 1],
                opacity: { duration: 0.4 },
                x: { duration: 0.5, ease: [0.16, 1, 0.3, 1] },
                scale: { duration: 0.5, ease: [0.16, 1, 0.3, 1] },
              }}
              className={cn(
                "relative shrink-0 h-full bg-base-100 shadow-2xl overflow-hidden transition-opacity pointer-events-auto",
                { "pointer-events-none": isDragging }
              )}
              style={{
                width: `calc(${chatWidthRatio * 100}%)`,
                maxWidth: `calc(${chatWidthRatio * 100}%)`,
                maxHeight: "100vh",
                zIndex: 106, // Чат поверх фона
              }}
              onClick={(e) => e.stopPropagation()}
            >
              <StreamChat url={stream.chatUrl} />
            </motion.div>
          )}

          {/* Кнопка закрытия - поверх всего */}
          <motion.button
            initial={{ opacity: 0, scale: 0.8, rotate: -90 }}
            animate={{ opacity: 1, scale: 1, rotate: 0 }}
            exit={{ opacity: 0, scale: 0.8, rotate: -90 }}
            transition={{
              duration: 0.4,
              delay: 0.3,
              ease: [0.16, 1, 0.3, 1],
            }}
            onClick={onClose}
            className="absolute btn-alert right-2 top-2 btn btn-circle btn-sm pointer-events-auto hover:scale-125 transition-all duration-200"
            style={{ zIndex: 107 }}
            aria-label="Закрыть театральный режим"
          >
            <BadgeX className="h-5 w-5" />
          </motion.button>
        </div>
      </div>
    </>
  );
};

// Мемоизируем компонент, чтобы предотвратить ререндеры при неизменных пропсах
export const TheatreModeView = memo(
  TheatreModeViewComponent,
  (prevProps, nextProps) => {
    // Сравниваем только ID стрима, так как остальные поля могут пересоздаваться
    // но фактически не меняться
    return (
      prevProps.stream.id === nextProps.stream.id &&
      prevProps.stream.url === nextProps.stream.url &&
      prevProps.stream.chatUrl === nextProps.stream.chatUrl &&
      prevProps.stream.title === nextProps.stream.title &&
      prevProps.onClose === nextProps.onClose
    );
  }
);
