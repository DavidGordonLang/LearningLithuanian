// src/components/Header.jsx
import React, { forwardRef, useLayoutEffect, useMemo, useRef, useState } from "react";

const cn = (...xs) => xs.filter(Boolean).join(" ");

const Header = forwardRef(function Header({ T, page, setPage }, ref) {
  const tabs = useMemo(
    () => [
      { id: "home", label: T.navHome },
      { id: "library", label: T.navLibrary },
      { id: "settings", label: T.navSettings },
    ],
    [T]
  );

  const containerRef = useRef(null);
  const btnRefs = useRef({});
  const [indicator, setIndicator] = useState({ left: 0, width: 0 });

  const updateIndicator = () => {
    const wrap = containerRef.current;
    const btn = btnRefs.current?.[page];
    if (!wrap || !btn) return;

    const wRect = wrap.getBoundingClientRect();
    const bRect = btn.getBoundingClientRect();

    const left = Math.max(0, bRect.left - wRect.left);
    const width = Math.max(0, bRect.width);

    setIndicator({ left, width });
  };

  useLayoutEffect(() => {
    updateIndicator();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [page]);

  useLayoutEffect(() => {
    const onResize = () => updateIndicator();
    window.addEventListener("resize", onResize);
    window.addEventListener("orientationchange", onResize);
    return () => {
      window.removeEventListener("resize", onResize);
      window.removeEventListener("orientationchange", onResize);
    };
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  return (
    <header
      ref={ref}
      className={cn(
        "sticky top-0 z-40 bg-zinc-950/95 backdrop-blur border-b border-zinc-800"
      )}
    >
      <div className="max-w-6xl mx-auto px-3 sm:px-4 pt-2 pb-2">
        {/* Brand (centered on all screens) */}
        <div className="flex flex-col items-center justify-center gap-1">
          <img
            src="/icons/bg-logoc.PNG"
            alt="Žodis logo"
            className="h-9 w-9 sm:h-10 sm:w-10 select-none"
            draggable={false}
          />

          <h1 className="text-xl sm:text-2xl font-extrabold tracking-tight leading-none">
            <span className="text-white">{T.appTitle1}</span>
            <span className="text-emerald-500">{T.appTitle2}</span>
          </h1>

          {/* Subtitle: keep it, but subtle and not tall */}
          <div className="text-[11px] sm:text-xs text-zinc-400 leading-tight text-center px-2">
            {T.subtitle}
          </div>
        </div>

        {/* Navigation */}
        <nav className="flex justify-center mt-3">
          <div
            ref={containerRef}
            className="
              relative inline-flex
              rounded-full bg-zinc-900/80 border border-zinc-800
              p-1
              text-xs sm:text-sm
              w-full max-w-md
            "
          >
            {/* Sliding indicator "track" (tap-ready, swipe-ready later) */}
            <div
              className="absolute top-1 bottom-1 rounded-full bg-emerald-500 shadow transition-[transform,width] duration-200 ease-out"
              style={{
                width: `${indicator.width}px`,
                transform: `translateX(${indicator.left}px)`,
              }}
              aria-hidden="true"
            />

            {tabs.map((tab) => {
              const active = page === tab.id;
              return (
                <button
                  key={tab.id}
                  type="button"
                  ref={(el) => {
                    if (el) btnRefs.current[tab.id] = el;
                  }}
                  className={cn(
                    "relative z-10 flex-1 px-4 sm:px-6 py-2 rounded-full font-medium transition select-none",
                    // text only; background handled by indicator
                    active
                      ? "text-zinc-950"
                      : "text-zinc-300 hover:text-zinc-100"
                  )}
                  onClick={() => setPage(tab.id)}
                  // Keep these to avoid focus quirks on mobile/PWA
                  onMouseDown={(e) => e.preventDefault()}
                  onTouchStart={(e) => e.preventDefault()}
                >
                  {tab.label}
                </button>
              );
            })}
          </div>
        </nav>
      </div>
    </header>
  );
});

export default Header;
