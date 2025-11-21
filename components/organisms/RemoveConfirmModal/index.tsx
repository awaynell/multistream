interface RemoveConfirmModalProps {
  streamTitle: string;
  onConfirm: () => void;
  onCancel: () => void;
  checkboxRef: React.RefObject<HTMLInputElement | null>;
}

export const RemoveConfirmModal = ({
  streamTitle,
  onConfirm,
  onCancel,
  checkboxRef,
}: RemoveConfirmModalProps) => {
  // Не рендерим модалку, если нет названия стрима
  if (!streamTitle) {
    return null;
  }

  return (
    <>
      <input
        type="checkbox"
        id="remove-stream-modal"
        className="modal-toggle"
        ref={checkboxRef}
      />
      <div className="modal" role="dialog">
        <div className="modal-box max-w-md">
          <h3 className="text-2xl font-bold text-base-content mb-4">
            Подтверждение удаления
          </h3>
          <p className="text-base-content mb-6">
            Вы уверены, что хотите удалить стрим <strong>{streamTitle}</strong>{" "}
            из сетки?
          </p>
          <div className="modal-action">
            <label
              htmlFor="remove-stream-modal"
              className="btn btn-outline"
              onClick={onCancel}
            >
              Отмена
            </label>
            <label
              htmlFor="remove-stream-modal"
              className="btn btn-error"
              onClick={onConfirm}
            >
              Удалить
            </label>
          </div>
        </div>
        <label
          className="modal-backdrop"
          htmlFor="remove-stream-modal"
          onClick={onCancel}
        >
          Закрыть
        </label>
      </div>
    </>
  );
};
