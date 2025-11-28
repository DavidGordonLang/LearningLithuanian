// src/components/UserGuideModal.jsx
import React, { useEffect, useState } from "react";

export default function UserGuideModal({ onClose, firstLaunch = false }) {
  const [slides, setSlides] = useState([]);
  const [index, setIndex] = useState(0);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    async function load() {
      try {
        const res = await fetch("/data/user-guide.json");
        const json = await res.json();
        setSlides(json);
      } catch (err) {
        console.error("Failed to load user guide:", err);
      } finally {
        setLoading(false);
      }
    }
    load();
  }, []);

  function next() {
    if (index < slides.length - 1) {
      setIndex(index + 1);
    }
  }

  function prev() {
    if (index > 0) {
      setIndex(index - 1);
    }
  }

  function finish() {
    // Mark onboarding as completed
    if (firstLaunch) {
      localStorage.setItem("lt_seen_user_guide", "1");
    }
    onClose?.();
  }

  function Icon({ type }) {
    const cls = "w-12 h-12 text-emerald-400 mx-auto mb-4";

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

  return (
    <div
      className="fixed inset-0 z-[200] bg-black/60 backdrop-blur-sm flex items-center justify-center p-4"
      onPointerDown={() => onClose()}
    >
      <div
        className="w-full max-w-2xl max-h-[85vh] overflow-y-auto bg-zinc-900 border border-zinc-800 rounded-2xl p-5"
        onPointerDown={(e) => e.stopPropagation()}
      >
        {/* Header */}
        <div className="flex items-center justify-between mb-4">
          <h2 className="text-xl font-bold">User Guide</h2>
          {!firstLaunch && (
            <button
              className="px-3 py-1 bg-zinc-800 rounded-md hover:bg-zinc-700 select-none"
              onClick={() => onClose()}
            >
              Close
            </button>
          )}
        </div>

        {loading && (
          <div className="text-sm text-zinc-400">Loading…</div>
        )}

        {!loading && slides.length > 0 && (
          <div className="text-center select-none">

            {/* Icon */}
            <Icon type={slides[index].icon} />

            {/* Title */}
            <h3 className="text-lg font-semibold mb-1">
              {slides[index].title}
            </h3>

            {/* Subtitle */}
            <p className="text-sm text-zinc-400 mb-4">
              {slides[index].subtitle}
            </p>

            {/* Bullet Points */}
            <ul className="text-left list-disc list-inside space-y-1 text-sm text-zinc-300 mb-4">
              {slides[index].points.map((p, i) => (
                <li key={i}>{p}</li>
              ))}
            </ul>

            {/* Navigation */}
            <div className="flex items-center justify-between mt-6">
              <button
                className="px-4 py-2 bg-zinc-800 text-zinc-200 rounded-md hover:bg-zinc-700 disabled:opacity-40 select-none"
                onClick={prev}
                disabled={index === 0}
              >
                Prev
              </button>

              {index < slides.length - 1 ? (
                <button
                  className="px-4 py-2 bg-emerald-600 text-black rounded-md hover:bg-emerald-500 select-none"
                  onClick={next}
                >
                  Next
                </button>
              ) : (
                <button
                  className="px-4 py-2 bg-emerald-600 text-black rounded-md hover:bg-emerald-500 select-none"
                  onClick={finish}
                >
                  Finish
                </button>
              )}
            </div>
          </div>
        )}
      </div>
    </div>
  );
}
