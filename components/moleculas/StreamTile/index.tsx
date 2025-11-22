import { StreamPlayer } from "@/components/StreamPlayer";
import { Stream } from "@/types";
import { cn } from "@/utils/theme";
import { BadgeX, Scan } from "lucide-react";

interface StreamTileProps {
  stream: Stream;
  isTheatreMode: boolean;
  isAnyTheatreModeActive: boolean;
  onTheatreModeToggle: () => void;
  onRemove?: () => void;
}

export const StreamTile = ({
  stream,
  isTheatreMode,
  isAnyTheatreModeActive,
  onTheatreModeToggle,
  onRemove,
}: StreamTileProps) => {
  const shouldBlur = isAnyTheatreModeActive && !isTheatreMode;

  return (
    <div
      draggable={!isTheatreMode}
      className={cn(
        "relative h-full w-full overflow-hidden bg-base-200 group transition-all duration-200",
        {
          "blur-md": shouldBlur,
          "pointer-events-none opacity-0": isTheatreMode,
          "opacity-100 cursor-move": !isTheatreMode,
        }
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
            className="opacity-0 group-hover:opacity-100 btn btn-sm btn-primary btn-circle shadow-lg hover:scale-125 transition-all duration-200"
            aria-label="Открыть театральный режим"
            title="Театральный режим"
          >
            <Scan className="h-4 w-4" />
          </button>
          {onRemove && (
            <button
              onClick={(e) => {
                e.preventDefault();
                e.stopPropagation();
                onRemove();
              }}
              className="opacity-0 group-hover:opacity-100 btn btn-sm btn-error btn-circle shadow-lg hover:scale-125 transition-all duration-200"
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
