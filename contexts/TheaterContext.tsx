"use client";

import { createContext, useContext, useState, ReactNode } from "react";

interface TheaterContextType {
  theaterUsername: string | null;
  setTheaterUsername: (username: string | null) => void;
}

const TheaterContext = createContext<TheaterContextType | undefined>(undefined);

export function TheaterProvider({ children }: { children: ReactNode }) {
  const [theaterUsername, setTheaterUsername] = useState<string | null>(null);

  return (
    <TheaterContext.Provider value={{ theaterUsername, setTheaterUsername }}>
      {children}
    </TheaterContext.Provider>
  );
}

export function useTheater() {
  const context = useContext(TheaterContext);
  if (!context) {
    throw new Error("useTheater must be used within TheaterProvider");
  }
  return context;
}
