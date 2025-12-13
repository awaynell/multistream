"use client";

import { useApp } from "@/contexts/AppContext";
import { Users, Grid3x3 } from "lucide-react";
import { Theme } from "@/types";

const themes: Theme[] = [
  "light",
  "dark",
  "cupcake",
  "bumblebee",
  "emerald",
  "corporate",
  "synthwave",
  "retro",
  "cyberpunk",
  "valentine",
  "halloween",
  "garden",
  "forest",
  "aqua",
  "lofi",
  "pastel",
  "fantasy",
  "wireframe",
  "black",
  "luxury",
  "dracula",
  "cmyk",
  "autumn",
  "business",
  "acid",
  "lemonade",
  "night",
  "coffee",
  "winter",
  "dim",
  "nord",
  "sunset",
  "caramellatte",
  "abyss",
  "silk",
];

export function Header() {
  const { theme, setTheme } = useApp();

  return (
    <header className="flex items-center justify-between border-b border-base-300 bg-base-100 px-4 py-2">
      <div className="flex items-center gap-4">
        <h1 className="text-xl font-bold text-base-content">Multistream!</h1>
      </div>

      <div className="flex items-center gap-2">
        <select
          className="select select-primary select-sm select-bordered w-40"
          value={theme}
          onChange={(e) => setTheme(e.target.value as Theme)}
        >
          {themes.map((t) => (
            <option key={t} value={t}>
              {t.charAt(0).toUpperCase() + t.slice(1)}
            </option>
          ))}
        </select>
        <label
          htmlFor="streamer-modal"
          className="btn btn-sm btn-primary gap-2"
        >
          <Users className="h-4 w-4" />
          Стримеры
        </label>
        <label htmlFor="layout-modal" className="btn btn-sm btn-outline gap-2">
          <Grid3x3 className="h-4 w-4" />
          Лейаут
        </label>
      </div>
    </header>
  );
}
