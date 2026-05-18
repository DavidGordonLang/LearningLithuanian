import React from "react";

const cn = (...xs) => xs.filter(Boolean).join(" ");

export default function TrainingBackButton({ onClick, className = "" }) {
  return (
    <button
      type="button"
      data-press
      onClick={onClick}
      className={cn(
        "h-10 w-10 rounded-full border flex items-center justify-center shrink-0",
        "bg-white/[0.06] border-white/10 shadow-[0_10px_30px_rgba(0,0,0,0.45)]",
        "text-zinc-200 hover:bg-white/[0.08] active:scale-[0.99] transition",
        className
      )}
      aria-label="Back"
    >
      <span aria-hidden="true" className="text-[22px] leading-none -mt-px">
        &lt;
      </span>
    </button>
  );
}
