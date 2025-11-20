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
        setStreamers(JSON.parse(savedStreamers));
      }
      if (savedSelected) {
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
  }, []);

  const removeStreamer = useCallback((id: string) => {
    setStreamers((prev) => prev.filter((s) => s.id !== id));
    setSelectedStreams((prev) => prev.filter((sid) => sid !== id));
  }, []);

  const updateSelectedStreams = useCallback((streamIds: string[]) => {
    setSelectedStreams(streamIds);
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
    }),
    [
      layout,
      setPresetLayout,
      streamers,
      addStreamer,
      removeStreamer,
      selectedStreams,
      updateSelectedStreams,
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
