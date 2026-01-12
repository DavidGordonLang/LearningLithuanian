// src/components/Header.jsx
import React, {
  forwardRef,
  useLayoutEffect,
  useMemo,
  useRef,
  useState,
} from "react";

const cn = (...xs) => xs.filter(Boolean).join(" ");

const Header = forwardRef(function Header(
  { T, page, setPage, onLogoClick },
  ref
) {
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

    setIndicator({
      left: bRect.left - wRect.left,
      width: bRect.width,
    });
  };

  useLayoutEffect(() => {
    updateIndicator();
  }, [page]);

  useLayoutEffect(() => {
    const onResize = () => updateIndicator();
    window.addEventListener("resize", onResize);
    window.addEventListener("orientationchange", onResize);
    return () => {
      window.removeEventListener("resize", onResize);
      window.removeEventListener("orientationchange", onResize);
    };
  }, []);

  return (
    <header
      ref={ref}
      className="sticky top-0 z-40 bg-zinc-950/95 backdrop-blur border-b border-zinc-800"
    >
      <div className="max-w-6xl mx-auto px-3 sm:px-4 pt-3 pb-3">
        {/* Brand (logo only; acts like refresh -> home) */}
        <div className="flex items-center justify-center">
          <button
            type="button"
            className="select-none"
            onClick={onLogoClick}
            aria-label="Go to Home and refresh"
            title="Home"
            onMouseDown={(e) => e.preventDefault()}
            onTouchStart={(e) => e.preventDefault()}
            style={{
              WebkitUserSelect: "none",
              userSelect: "none",
              WebkitTouchCallout: "none",
            }}
          >
            <img
              src="/icons/bg-logoc.PNG"
              alt="Žodis logo"
              className="h-14 w-14 sm:h-16 sm:w-16 select-none"
              draggable={false}
            />
          </button>
        </div>

        {/* Navigation */}
        <nav className="flex justify-center mt-3">
          <div
            ref={containerRef}
            className="
              relative inline-flex
              w-full max-w-md
              rounded-full bg-zinc-900/80 border border-zinc-800
              p-1
              text-xs sm:text-sm
            "
          >
            {/* Active pill */}
            <div
              className="
                absolute top-1 bottom-1
                rounded-full bg-emerald-500 shadow
                transition-[transform,width] duration-200 ease-out
              "
              style={{
                width: `${indicator.width}px`,
                transform: `translateX(${indicator.left}px)`,
              }}
            />

            {tabs.map((tab) => {
              const active = page === tab.id;
              return (
                <button
                  key={tab.id}
                  ref={(el) => {
                    if (el) btnRefs.current[tab.id] = el;
                  }}
                  type="button"
                  className={cn(
                    "relative z-10 flex-1 px-4 sm:px-6 py-2 rounded-full font-medium select-none transition",
                    active
                      ? "text-zinc-950"
                      : "text-zinc-300 hover:text-zinc-100"
                  )}
                  onClick={() => setPage(tab.id)}
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
