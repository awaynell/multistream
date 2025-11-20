"use client";

import { useApp } from "@/contexts/AppContext";
import { LayoutPreset } from "@/types";
import { motion } from "framer-motion";

const PRESETS: { value: LayoutPreset; label: string }[] = [
  { value: "1x1", label: "1x1" },
  { value: "2x2", label: "2x2" },
  { value: "3x3", label: "3x3" },
];

// Общий компонент для выбора лейаута
function LayoutSelectorContent() {
  const { layout, setPresetLayout } = useApp();

  const handlePresetSelect = (preset: LayoutPreset) => {
    setPresetLayout(preset);
  };

  return (
    <div className="flex flex-col gap-4">
      <div className="flex flex-col gap-3">
        <h4 className="text-lg font-semibold text-base-content">
          Предустановленные лейауты
        </h4>
        <div className="flex flex-wrap gap-2">
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
                  className={`btn min-w-[80px] ${
                    isSelected ? "btn-primary" : "btn-outline"
                  }`}
                  onClick={() => handlePresetSelect(preset.value)}
                >
                  {preset.label}
                </button>
              </motion.div>
            );
          })}
        </div>
      </div>

      <div className="card bg-base-200 p-3">
        <p className="text-sm text-base-content">
          Текущий лейаут: {layout.preset}
        </p>
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
        <div className="modal-box max-w-2xl">
          <h3 className="text-2xl font-bold text-base-content mb-4">
            Выбор лейаута
          </h3>
          <div className="mb-4">
            <LayoutSelectorContent />
          </div>
          <div className="modal-action">
            <label htmlFor="layout-modal" className="btn">
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
