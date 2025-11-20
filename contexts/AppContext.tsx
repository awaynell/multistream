"use client";

import {
  createContext,
  useContext,
  useState,
  useEffect,
  useCallback,
  useMemo,
  ReactNode,
} from "react";
import { Layout, LayoutPreset, Streamer } from "@/types";
import { parseTwitchInput } from "@/utils/twitch";

interface AppContextType {
  // Layout
  layout: Layout;
  setPresetLayout: (preset: LayoutPreset) => void;

  // Streamers
  streamers: Streamer[];
  addStreamer: (input: string) => void;
  removeStreamer: (id: string) => void;

  // Selected streams
  selectedStreams: string[];
  updateSelectedStreams: (streamIds: string[]) => void;
  reorderSelectedStreams: (fromIndex: number, toIndex: number) => void;
  toggleStreamVisibility: (streamId: string) => void;
}

const AppContext = createContext<AppContextType | undefined>(undefined);

const defaultLayout: Layout = {
  type: "preset",
  preset: "2x2",
};

interface AppProviderProps {
  children: ReactNode;
}

export function AppProvider({ children }: AppProviderProps) {
  const [layout, setLayout] = useState<Layout>(defaultLayout);
  const [streamers, setStreamers] = useState<Streamer[]>([]);
  const [selectedStreams, setSelectedStreams] = useState<string[]>([]);
  const [isInitialized, setIsInitialized] = useState(false);

  // Загрузка из localStorage при монтировании
  useEffect(() => {
    try {
      const savedLayout = localStorage.getItem("multistream_layout");
      const savedStreamers = localStorage.getItem("multistream_streamers");
      const savedSelected = localStorage.getItem(
        "multistream_selected_streams"
      );

      if (savedLayout) {
        // eslint-disable-next-line react-hooks/set-state-in-effect
        setLayout(JSON.parse(savedLayout));
      }
      if (savedStreamers) {
        const parsedStreamers = JSON.parse(savedStreamers);
        setStreamers(parsedStreamers);

        // Если selectedStreams пустой, но есть стримеры, добавляем всех в selectedStreams
        if (savedSelected) {
          const parsedSelected = JSON.parse(savedSelected);
          setSelectedStreams(parsedSelected);
        } else if (parsedStreamers.length > 0) {
          // Если нет сохраненных selectedStreams, но есть стримеры, добавляем всех
          setSelectedStreams(parsedStreamers.map((s: Streamer) => s.id));
        }
      } else if (savedSelected) {
        setSelectedStreams(JSON.parse(savedSelected));
      }
    } catch (error) {
      console.error("Error loading from localStorage:", error);
    }
    setIsInitialized(true);
  }, []);

  // Синхронизация layout с localStorage
  useEffect(() => {
    if (isInitialized) {
      localStorage.setItem("multistream_layout", JSON.stringify(layout));
    }
  }, [layout, isInitialized]);

  // Синхронизация streamers с localStorage
  useEffect(() => {
    if (isInitialized) {
      localStorage.setItem("multistream_streamers", JSON.stringify(streamers));
    }
  }, [streamers, isInitialized]);

  // Синхронизация selectedStreams с localStorage
  useEffect(() => {
    if (isInitialized) {
      localStorage.setItem(
        "multistream_selected_streams",
        JSON.stringify(selectedStreams)
      );
    }
  }, [selectedStreams, isInitialized]);

  const setPresetLayout = useCallback((preset: LayoutPreset) => {
    setLayout({
      type: "preset",
      preset,
    });
  }, []);

  const addStreamer = useCallback((input: string) => {
    const username = parseTwitchInput(input);

    if (!username) {
      throw new Error("Неверный формат имени пользователя или URL");
    }

    // Генерируем ID с использованием crypto.randomUUID если доступно, иначе Date.now()
    const generateId = () => {
      if (typeof window !== "undefined" && window.crypto?.randomUUID) {
        return window.crypto.randomUUID();
      }
      return `${Date.now()}-${Math.random().toString(36).substring(2, 9)}`;
    };

    const newStreamer: Streamer = {
      id: `twitch-${username}-${generateId()}`,
      username,
      platform: "twitch",
    };

    setStreamers((prev) => [...prev, newStreamer]);

    // Автоматически добавляем новый стример в selectedStreams, если его там еще нет
    setSelectedStreams((prev) => {
      if (!prev.includes(newStreamer.id)) {
        return [...prev, newStreamer.id];
      }
      return prev;
    });
  }, []);

  const removeStreamer = useCallback((id: string) => {
    setStreamers((prev) => prev.filter((s) => s.id !== id));
    setSelectedStreams((prev) => prev.filter((sid) => sid !== id));
  }, []);

  const updateSelectedStreams = useCallback((streamIds: string[]) => {
    setSelectedStreams(streamIds);
  }, []);

  const reorderSelectedStreams = useCallback(
    (fromIndex: number, toIndex: number) => {
      setSelectedStreams((prev) => {
        const newOrder = [...prev];
        const [removed] = newOrder.splice(fromIndex, 1);
        newOrder.splice(toIndex, 0, removed);
        return newOrder;
      });
    },
    []
  );

  const toggleStreamVisibility = useCallback((streamId: string) => {
    setSelectedStreams((prev) => {
      if (prev.includes(streamId)) {
        // Скрываем стримера
        return prev.filter((id) => id !== streamId);
      } else {
        // Показываем стримера (добавляем в конец)
        return [...prev, streamId];
      }
    });
  }, []);

  const value: AppContextType = useMemo(
    () => ({
      layout,
      setPresetLayout,
      streamers,
      addStreamer,
      removeStreamer,
      selectedStreams,
      updateSelectedStreams,
      reorderSelectedStreams,
      toggleStreamVisibility,
    }),
    [
      layout,
      setPresetLayout,
      streamers,
      addStreamer,
      removeStreamer,
      selectedStreams,
      updateSelectedStreams,
      reorderSelectedStreams,
      toggleStreamVisibility,
    ]
  );

  return <AppContext.Provider value={value}>{children}</AppContext.Provider>;
}

export function useApp() {
  const context = useContext(AppContext);
  if (context === undefined) {
    throw new Error("useApp must be used within an AppProvider");
  }
  return context;
}
