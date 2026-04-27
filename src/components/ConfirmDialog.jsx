import React, { useEffect } from "react";

const cn = (...xs) => xs.filter(Boolean).join(" ");

export default function ConfirmDialog({
  open,
  title,
  body,
  confirmLabel = "Confirm",
  cancelLabel = "Cancel",
  destructive = false,
  onConfirm,
  onCancel,
}) {
  useEffect(() => {
    if (!open) return;

    const onKeyDown = (e) => {
      if (e.key === "Escape") {
        e.preventDefault();
        onCancel?.();
      }
    };

    window.addEventListener("keydown", onKeyDown);
    return () => window.removeEventListener("keydown", onKeyDown);
  }, [open, onCancel]);

  if (!open) return null;

  return (
    <div
      className="fixed inset-0 z-[13000] bg-black/60 backdrop-blur-sm flex items-center justify-center px-4 py-6"
      role="dialog"
      aria-modal="true"
      aria-labelledby="confirm-dialog-title"
      onPointerDown={(e) => {
        if (e.target === e.currentTarget) onCancel?.();
      }}
    >
      <div
        className="w-full max-w-md z-card shadow-2xl overflow-hidden"
        onPointerDown={(e) => e.stopPropagation()}
      >
        <div className="p-5 border-b border-white/10">
          <h2 id="confirm-dialog-title" className="z-title text-[18px]">
            {title || "Are you sure?"}
          </h2>
          {body ? (
            <p className="z-subtitle mt-2 whitespace-pre-line">{body}</p>
          ) : null}
        </div>

        <div className="p-5 flex flex-col-reverse sm:flex-row sm:justify-end gap-3">
          <button
            type="button"
            data-press
            className="z-btn z-btn-secondary px-4 py-2 rounded-2xl text-sm"
            onClick={onCancel}
          >
            {cancelLabel}
          </button>
          <button
            type="button"
            data-press
            className={cn(
              "z-btn px-4 py-2 rounded-2xl text-sm font-semibold",
              destructive
                ? "bg-rose-500/15 border border-rose-400/20 text-rose-100 hover:bg-rose-500/20"
                : "bg-emerald-600/90 hover:bg-emerald-500 border border-emerald-300/20 text-black"
            )}
            onClick={onConfirm}
          >
            {confirmLabel}
          </button>
        </div>
      </div>
    </div>
  );
}
