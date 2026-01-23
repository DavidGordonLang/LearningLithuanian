import React, { useEffect, useState } from "react";

export default function UserGuideModal({
  onClose,
  firstLaunch = false,
  topOffset = 0,
}) {
  const [slides, setSlides] = useState([]);
  const [index, setIndex] = useState(0);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    async function load() {
      try {
        const res = await fetch("/data/user-guide.json", { cache: "no-store" });
        const json = await res.json();
        setSlides(Array.isArray(json) ? json : []);
      } catch (err) {
        console.error("Failed to load user guide:", err);
      } finally {
        setLoading(false);
      }
    }
    load();
  }, []);

  function next() {
    if (index < slides.length - 1) setIndex(index + 1);
  }

  function prev() {
    if (index > 0) setIndex(index - 1);
  }

  function finish() {
    if (firstLaunch) localStorage.setItem("lt_seen_user_guide", "1");
    onClose?.();
  }

  function Icon({ type }) {
    // keep icons semantic + calm (no glow, no oversized colour)
    const cls = "w-12 h-12 text-emerald-400/90 mx-auto mb-4";

    if (type === "speech") {
      return (
        <svg
          className={cls}
          fill="none"
          stroke="currentColor"
          strokeWidth="1.5"
          viewBox="0 0 24 24"
        >
          <path
            strokeLinecap="round"
            strokeLinejoin="round"
            d="M7 8h10M7 12h6m-6 4h3M5 8a2 2 0 0 1 2-2h10a2 2 0 0 1 2 2v8a2 2 0 0 1-2 2H9l-4 3v-3H7"
          />
        </svg>
      );
    }

    if (type === "speaker") {
      return (
        <svg
          className={cls}
          fill="none"
          stroke="currentColor"
          strokeWidth="1.5"
          viewBox="0 0 24 24"
        >
          <path
            strokeLinecap="round"
            strokeLinejoin="round"
            d="M3 9v6h4l5 5V4L7 9H3z"
          />
          <path
            strokeLinecap="round"
            strokeLinejoin="round"
            d="M16 9c1.333.667 2 1.667 2 3s-.667 2.333-2 3m3-9c2 1.333 3 3.667 3 6s-1 4.667-3 6"
          />
        </svg>
      );
    }

    if (type === "folder") {
      return (
        <svg
          className={cls}
          fill="none"
          stroke="currentColor"
          strokeWidth="1.5"
          viewBox="0 0 24 24"
        >
          <path
            strokeLinecap="round"
            strokeLinejoin="round"
            d="M3 7a2 2 0 0 1 2-2h4l2 2h8a2 2 0 0 1 2 2v8a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2V7z"
          />
        </svg>
      );
    }

    return null;
  }

  const current = slides[index] || null;

  return (
    <div
      className="
        fixed inset-0 z-[11000]
        bg-black/60 backdrop-blur-sm
        flex items-start justify-center px-4
        pb-[calc(env(safe-area-inset-bottom)+12px)]
      "
      style={{
        paddingTop: `calc(env(safe-area-inset-top) + ${topOffset}px + 12px)`,
      }}
      onPointerDown={() => {
        // Prevent accidental dismiss on first launch
        if (!firstLaunch) onClose?.();
      }}
    >
      <div
        className="
          w-full max-w-2xl
          z-card overflow-hidden flex flex-col
        "
        style={{
          maxHeight: `calc(100dvh - env(safe-area-inset-top) - env(safe-area-inset-bottom) - ${topOffset}px - 24px)`,
        }}
        onPointerDown={(e) => e.stopPropagation()}
      >
        {/* Header */}
        <div className="sticky top-0 z-10 z-inset border-b border-white/10">
          <div className="flex items-center justify-between px-5 py-4">
            <div className="min-w-0">
              <h2 className="z-title text-[18px] sm:text-[20px]">User Guide</h2>
              <div className="z-helper mt-0.5">
                {loading
                  ? "Loading…"
                  : slides.length
                  ? `Step ${Math.min(index + 1, slides.length)} of ${slides.length}`
                  : " "}
              </div>
            </div>

            {!firstLaunch && (
              <button
                type="button"
                className="z-btn z-btn-secondary px-4 py-2 text-[13px]"
                onClick={onClose}
                data-press
              >
                Close
              </button>
            )}
          </div>
        </div>

        <div className="p-5 overflow-y-auto">
          {loading && <div className="z-subtitle">Loading…</div>}

          {!loading && slides.length === 0 && (
            <div className="z-subtitle">User guide content not found.</div>
          )}

          {!loading && current && (
            <div className="select-none">
              <div className="text-center">
                <Icon type={current.icon} />

                <h3 className="text-[16px] sm:text-[17px] font-semibold text-zinc-100 mb-1">
                  {current.title}
                </h3>

                {current.subtitle ? (
                  <p className="z-subtitle mb-4">{current.subtitle}</p>
                ) : (
                  <div className="mb-4" />
                )}
              </div>

              <div className="z-inset px-4 py-3">
                <ul className="list-disc list-inside space-y-1 text-[13px] sm:text-[14px] text-zinc-200">
                  {(current.points || []).map((p, i) => (
                    <li key={i}>{p}</li>
                  ))}
                </ul>

                {current.linkUrl && current.linkText && (
                  <div className="pt-4">
                    <a
                      href={current.linkUrl}
                      target="_blank"
                      rel="noopener noreferrer"
                      className="
                        inline-flex items-center justify-center
                        rounded-2xl px-4 py-2 text-[13px] font-semibold
                        bg-emerald-500 text-black
                        hover:bg-emerald-400 active:bg-emerald-300
                        transition select-none
                      "
                      data-press
                    >
                      {current.linkText}
                    </a>
                  </div>
                )}
              </div>

              {/* Navigation */}
              <div className="flex items-center justify-between gap-3 mt-5">
                <button
                  type="button"
                  className="z-btn z-btn-secondary px-5 py-2"
                  onClick={prev}
                  disabled={index === 0}
                  data-press
                >
                  Prev
                </button>

                {index < slides.length - 1 ? (
                  <button
                    type="button"
                    className="
                      rounded-2xl px-5 py-2 text-[14px] font-semibold
                      bg-emerald-500 text-black
                      hover:bg-emerald-400 active:bg-emerald-300
                      transition select-none
                    "
                    onClick={next}
                    data-press
                  >
                    Next
                  </button>
                ) : (
                  <button
                    type="button"
                    className="
                      rounded-2xl px-5 py-2 text-[14px] font-semibold
                      bg-emerald-500 text-black
                      hover:bg-emerald-400 active:bg-emerald-300
                      transition select-none
                    "
                    onClick={finish}
                    data-press
                  >
                    Finish
                  </button>
                )}
              </div>

              {firstLaunch && (
                <p className="z-helper mt-4">
                  You can reopen this anytime from Settings.
                </p>
              )}
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
