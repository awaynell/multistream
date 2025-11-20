"use client";

import { useApp } from "@/contexts/AppContext";
import { Users, Grid3x3 } from "lucide-react";

export function Header() {
  const { streamers, layout } = useApp();

  const layoutText =
    layout.type === "preset"
      ? layout.preset
      : `${layout.custom?.cols}x${layout.custom?.rows}`;

  return (
    <header className="flex items-center justify-between border-b border-base-300 bg-base-100 px-4 py-2">
      <div className="flex items-center gap-4">
        <h1 className="text-xl font-bold text-base-content">Multistream</h1>
        <div className="text-sm text-base-content/60">
          {streamers.length} стример{streamers.length !== 1 ? "ов" : ""}
        </div>
        <div className="text-sm text-base-content/60">
          Лейаут: {layoutText}
        </div>
      </div>

      <div className="flex items-center gap-2">
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

