// src/components/WhatsNewModal.jsx
import React, { useEffect, useState } from "react";
import ModalShell from "./ModalShell";

export default function WhatsNewModal({
  version,
  topOffset = 0,
  onClose,
  onViewChangelog,
}) {
  const [entry, setEntry] = useState(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    let alive = true;

    async function load() {
      try {
        const res = await fetch("/data/changelog.json", { cache: "no-store" });
        if (!res.ok) throw new Error("Failed to load changelog");

        const list = await res.json();
        if (!alive || !Array.isArray(list)) return;

        const match = list.find((e) => e?.version === version);
        setEntry(match || list[0] || null);
      } catch {
        if (alive) setEntry(null);
      } finally {
        if (alive) setLoading(false);
      }
    }

    load();
    return () => {
      alive = false;
    };
  }, [version]);

  const changes = Array.isArray(entry?.changes) ? entry.changes : [];
  const date = entry?.date || null;

  const padTop = topOffset ? topOffset + 16 : 16;

  return (
    <ModalShell
      open
      title="What's New"
      subtitle={
        <>
          App Version: <span className="text-zinc-300">{version}</span>
          {date ? <span className="text-zinc-500"> • {date}</span> : null}
        </>
      }
      onClose={onClose}
      zIndex="z-[210]"
      titleClassName="z-title text-[18px] sm:text-[20px]"
      subtitleClassName="z-helper mt-0.5"
      containerClassName="items-start px-4 pb-[calc(env(safe-area-inset-bottom)+12px)]"
      containerStyle={{
        paddingTop: `calc(env(safe-area-inset-top) + ${padTop}px)`,
      }}
      panelClassName="flex flex-col"
      panelStyle={{
        maxHeight: `calc(100dvh - env(safe-area-inset-top) - env(safe-area-inset-bottom) - ${padTop}px - 24px)`,
      }}
      headerAction={
        <button
          type="button"
          className="z-btn z-btn-secondary px-4 py-2 text-[13px]"
          onClick={onClose}
          data-press
        >
          Close
        </button>
      }
    >
        <div className="flex-1 overflow-y-auto p-5">
          <p className="z-subtitle mb-4">
            Here's what changed in the latest update:
          </p>

          {loading ? (
            <div className="z-subtitle mb-4">Loading…</div>
          ) : changes.length > 0 ? (
            <div className="z-inset px-4 py-3 mb-5">
              <ul className="list-disc list-inside space-y-1 text-[13px] sm:text-[14px] text-zinc-200">
                {changes.slice(0, 8).map((c, idx) => (
                  <li key={idx}>{c}</li>
                ))}
              </ul>
            </div>
          ) : (
            <div className="z-inset px-4 py-3 mb-5">
              <div className="z-subtitle">No release notes available.</div>
            </div>
          )}

          <div className="flex gap-3 justify-end flex-wrap">
            <button
              type="button"
              className="z-btn z-btn-secondary px-5 py-2"
              onClick={onClose}
              data-press
            >
              OK
            </button>

            <button
              type="button"
              className="
                inline-flex items-center justify-center
                rounded-2xl px-5 py-2 text-[14px] font-semibold
                bg-emerald-500 text-black
                hover:bg-emerald-400 active:bg-emerald-300
                transition select-none
              "
              onClick={onViewChangelog}
              data-press
            >
              View full changelog
            </button>
          </div>
        </div>
    </ModalShell>
  );
}
