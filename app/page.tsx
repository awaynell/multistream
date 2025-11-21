"use client";

import { MultistreamGrid } from "@/components/MultistreamGrid";
import { StreamerManagerModal } from "@/components/StreamerManager";
import { LayoutSelectorModal } from "@/components/organisms/LayoutSelector";

export default function Home() {
  return (
    <div className="flex flex-col bg-base-100">
      {/* Основной контент - сетка стримов */}
      <MultistreamGrid />

      {/* Модальные окна */}
      <StreamerManagerModal />
      <LayoutSelectorModal />
    </div>
  );
}
