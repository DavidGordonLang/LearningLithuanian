// src/components/Header.jsx
import React, { forwardRef } from "react";

const cn = (...xs) => xs.filter(Boolean).join(" ");

const Header = forwardRef(function Header({ T, page, setPage }, ref) {
  const tabs = [
    { id: "home", label: T.navHome },
    { id: "library", label: T.navLibrary },
    { id: "settings", label: T.navSettings },
  ];

  return (
    <header
      ref={ref}
      className={cn(
        "sticky top-0 z-[10000] bg-zinc-950/95 backdrop-blur border-b border-zinc-800"
      )}
    >
      <div className="max-w-6xl mx-auto px-3 sm:px-4 pt-2 pb-1">
        {/* Title */}
        <div className="flex items-baseline gap-3">
          <h1 className="text-xl sm:text-2xl font-extrabold tracking-tight">
            <span className="text-white">{T.appTitle1}</span>
            <span className="text-emerald-500">{T.appTitle2}</span>
          </h1>

          <span className="hidden sm:inline text-xs text-zinc-400">
            {T.subtitle}
          </span>
        </div>

        {/* Navigation */}
        <nav className="flex justify-center sm:justify-start mt-2">
          <div className="inline-flex rounded-full bg-zinc-900 p-1 text-xs sm:text-sm">
            {tabs.map((tab) => {
              const active = page === tab.id;
              return (
                <button
                  key={tab.id}
                  type="button"
                  className={cn(
                    "px-3 sm:px-4 py-1.5 rounded-full font-medium transition select-none",
                    active
                      ? "bg-emerald-500 text-zinc-950 shadow"
                      : "text-zinc-300 hover:bg-zinc-800"
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
