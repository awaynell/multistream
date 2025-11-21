"use client";

import { useApp } from "@/contexts/AppContext";
import { LayoutPreset } from "@/types";
import { cn } from "@/utils/theme";
import { motion } from "framer-motion";

const PRESETS: { value: LayoutPreset; label: string }[] = [
  { value: "1x1", label: "1x1" },
  { value: "2x2", label: "2x2" },
  { value: "3x3", label: "3x3" },
  { value: "3x4", label: "3x4" },
];

// Общий компонент для выбора лейаута
function LayoutSelectorContent() {
  const { layout, setPresetLayout } = useApp();

  const handlePresetSelect = (preset: LayoutPreset) => {
    setPresetLayout(preset);
  };

  return (
    <div className="flex flex-col gap-4 pt-4 pb-4">
      <div className="flex flex-col gap-3">
        <div className="grid grid-cols-2 gap-2 grid-rows-2">
          {PRESETS.map((preset) => {
            const isSelected =
              layout.type === "preset" && layout.preset === preset.value;

            return (
              <motion.div
                key={preset.value}
                whileHover={{ scale: 1.05 }}
                whileTap={{ scale: 0.95 }}
              >
                <button
                  className={`${cn("btn w-full", {
                    "btn-primary": isSelected,
                    "btn-outline": !isSelected,
                  })}`}
                  onClick={() => handlePresetSelect(preset.value)}
                >
                  {preset.label}
                </button>
              </motion.div>
            );
          })}
        </div>
      </div>
    </div>
  );
}

// Компонент для встраивания в страницу
export function LayoutSelector() {
  return (
    <div className="flex flex-col gap-4">
      <h3 className="text-xl font-bold text-base-content">Выбор лейаута</h3>
      <LayoutSelectorContent />
    </div>
  );
}

// Компонент для модального окна
export function LayoutSelectorModal() {
  return (
    <>
      <input type="checkbox" id="layout-modal" className="modal-toggle" />
      <div className="modal" role="dialog">
        <div className="modal-box max-w-xl">
          <h3 className="text-2xl font-bold text-base-content mb-4">
            Выбор лейаута
          </h3>
          <div className="mb-4">
            <LayoutSelectorContent />
          </div>
          <div className="modal-action">
            <label htmlFor="layout-modal" className="btn bg-primary">
              Закрыть
            </label>
          </div>
        </div>
        <label className="modal-backdrop" htmlFor="layout-modal">
          Закрыть
        </label>
      </div>
    </>
  );
}
