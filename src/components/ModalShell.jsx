import React, { useEffect, useId } from "react";

const cn = (...xs) => xs.filter(Boolean).join(" ");

export default function ModalShell({
  open,
  title,
  subtitle,
  onClose,
  closeOnBackdrop = true,
  closeOnEscape = true,
  maxWidth = "max-w-md",
  zIndex = "z-50",
  children,
}) {
  const titleId = useId();

  useEffect(() => {
    if (!open || !closeOnEscape) return;

    const onKeyDown = (e) => {
      if (e.key === "Escape") {
        e.preventDefault();
        onClose?.();
      }
    };

    window.addEventListener("keydown", onKeyDown);
    return () => window.removeEventListener("keydown", onKeyDown);
  }, [open, closeOnEscape, onClose]);

  if (!open) return null;

  return (
    <div
      className={cn("fixed inset-0 bg-black/60 backdrop-blur-sm", zIndex)}
      role="dialog"
      aria-modal="true"
      aria-labelledby={titleId}
      onClick={(e) => {
        if (closeOnBackdrop && e.target === e.currentTarget) onClose?.();
      }}
    >
      <div className="w-full h-full px-3 pb-4 flex justify-center items-center">
        <div
          className={cn("w-full z-card shadow-2xl overflow-hidden", maxWidth)}
          onClick={(e) => e.stopPropagation()}
        >
          <div className="p-5 pb-3 border-b border-white/10">
            <h3 id={titleId} className="z-title">
              {title}
            </h3>
            {subtitle ? (
              <p className="text-sm text-zinc-400 mt-1">{subtitle}</p>
            ) : null}
          </div>

          {children}
        </div>
      </div>
    </div>
  );
}
