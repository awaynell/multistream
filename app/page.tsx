"use client";

import { StreamGrid } from "@/components/StreamGrid";
import { StreamerManagerModal } from "@/components/StreamerManager";
import { LayoutSelectorModal } from "@/components/LayoutSelector";
import { AppProvider } from "@/contexts/AppContext";

export default function Home() {
  return (
    <AppProvider>
      <div className="flex h-screen flex-col bg-base-100">
        {/* Компактный header */}
        <header className="flex items-center justify-between border-b border-base-300 bg-base-100 px-4 py-2">
          <h1 className="text-xl font-bold text-base-content">Multistream</h1>
          <div className="flex gap-2">
            <label htmlFor="streamer-modal" className="btn btn-sm btn-primary">
              Стримеры
            </label>
            <label htmlFor="layout-modal" className="btn btn-sm btn-outline">
              Лейаут
            </label>
          </div>
        </header>

        {/* Основной контент - сетка стримов */}
        <div className="flex-1 overflow-hidden">
          <StreamGrid />
        </div>

        {/* Модальные окна */}
        <StreamerManagerModal />
        <LayoutSelectorModal />
      </div>
    </AppProvider>
  );
}
