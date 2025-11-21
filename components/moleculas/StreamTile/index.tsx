import { StreamPlayer } from "@/components/StreamPlayer";
import { Stream } from "@/types";
import { cn } from "@/utils/theme";
import { BadgeX } from "lucide-react";

interface StreamTileProps {
  stream: Stream;
  isTheatreMode: boolean;
  isAnyTheatreModeActive: boolean;
  onTheatreModeToggle: () => void;
  onRemove?: () => void;
  isDragged?: boolean;
  isDragOver?: boolean;
  onDragStart: () => void;
  onDragOver: (e: React.DragEvent) => void;
  onDragLeave: () => void;
  onDrop: (e: React.DragEvent) => void;
  onDragEnd: () => void;
}

export const StreamTile = ({
  stream,
  isTheatreMode,
  isAnyTheatreModeActive,
  onTheatreModeToggle,
  onRemove,
  isDragged = false,
  isDragOver = false,
  onDragStart,
  onDragOver,
  onDragLeave,
  onDrop,
  onDragEnd,
}: StreamTileProps) => {
  // Критически важно: НЕ удаляем плитку из DOM в театральном режиме
  // Это гарантирует, что iframe останется в DOM и не перезагрузится

  // Применяем блюр только к элементам, которые НЕ в театральном режиме,
  // когда какой-то другой элемент в театральном режиме
  const shouldBlur = isAnyTheatreModeActive && !isTheatreMode;

  return (
    <div
      draggable={!isTheatreMode}
      onDragStart={(e) => {
        if (!isTheatreMode) {
          e.dataTransfer.effectAllowed = "move";
          e.dataTransfer.setData("text/plain", stream.id);
          onDragStart();
        }
      }}
      onDragOver={onDragOver}
      onDragLeave={onDragLeave}
      onDrop={onDrop}
      onDragEnd={onDragEnd}
      className={cn(
        "relative min-h-[200px] h-full w-full rounded-lg overflow-hidden bg-base-200 group transition-all duration-200",
        isTheatreMode
          ? "pointer-events-none opacity-0"
          : "opacity-100 cursor-move",
        isDragged && "opacity-50 scale-95",
        isDragOver && "ring-2 ring-primary ring-offset-2 scale-105",
        shouldBlur && "blur-md"
      )}
    >
      <StreamPlayer
        streamId={stream.id}
        url={stream.url}
        isActive={!isTheatreMode}
        isTheatreMode={false}
      />
      {/* Кнопки управления - появляются при наведении на тайл */}
      {!isTheatreMode && (
        <div
          className="absolute top-2 right-2 flex gap-2"
          style={{ zIndex: 20 }}
        >
          <button
            onClick={(e) => {
              e.preventDefault();
              e.stopPropagation();
              onTheatreModeToggle();
            }}
            className="opacity-0 group-hover:opacity-100 transition-opacity duration-200 btn btn-sm btn-primary shadow-lg"
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
          </button>
          {onRemove && (
            <button
              onClick={(e) => {
                e.preventDefault();
                e.stopPropagation();
                onRemove();
              }}
              className="opacity-0 group-hover:opacity-100 transition-opacity duration-200 btn btn-sm btn-error shadow-lg text-white"
              aria-label="Удалить стрим"
              title="Удалить стрим"
            >
              <BadgeX className="h-4 w-4" />
            </button>
          )}
        </div>
      )}
    </div>
  );
};
