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
  headerAction = null,
  titleClassName = "z-title",
  subtitleClassName = "text-sm text-zinc-400 mt-1",
  containerClassName = "",
  containerStyle,
  panelClassName = "",
  panelStyle,
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
      <div
        className={cn(
          "w-full h-full px-3 pb-4 flex justify-center items-center",
          containerClassName
        )}
        style={containerStyle}
      >
        <div
          className={cn(
            "w-full z-modal-card overflow-hidden",
            maxWidth,
            panelClassName
          )}
          style={panelStyle}
          onClick={(e) => e.stopPropagation()}
        >
          <div className="p-5 pb-3 border-b border-white/10">
            <div className="flex items-start justify-between gap-4">
              <div className="min-w-0">
                <h3 id={titleId} className={titleClassName}>
                  {title}
                </h3>
                {subtitle ? (
                  <div className={subtitleClassName}>{subtitle}</div>
                ) : null}
              </div>
              {headerAction}
            </div>
          </div>

          {children}
        </div>
      </div>
    </div>
  );
}
