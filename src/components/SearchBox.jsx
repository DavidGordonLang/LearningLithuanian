// src/components/SearchBox.jsx
import React, {
  forwardRef,
  memo,
  useEffect,
  useImperativeHandle,
  useRef,
  startTransition,
} from "react";

import { searchStore } from "../searchStore";

const SearchBox = memo(
  forwardRef(function SearchBox({ placeholder = "Search…" }, ref) {
    const composingRef = useRef(false);
    const inputRef = useRef(null);

    useImperativeHandle(ref, () => inputRef.current);

    useEffect(() => {
      const el = inputRef.current;
      const raw = searchStore.getRaw();
      if (el && raw && el.value !== raw) el.value = raw;
    }, []);

    return (
      <div className="relative flex-1">
        <input
          id="main-search"
          ref={inputRef}
          type="text"
          placeholder={placeholder}
          defaultValue=""
          className="z-input pr-10"
          onCompositionStart={() => {
            composingRef.current = true;
          }}
          onCompositionEnd={(e) => {
            composingRef.current = false;
            startTransition(() => searchStore.setRaw(e.currentTarget.value));
          }}
          onInput={(e) => {
            if (!composingRef.current)
              startTransition(() => searchStore.setRaw(e.currentTarget.value));
          }}
        />

        <button
          type="button"
          data-press
          className="
            absolute right-2 top-1/2 -translate-y-1/2
            h-8 w-8 rounded-xl
            text-zinc-400 hover:text-zinc-200
            hover:bg-white/5 active:bg-white/10
            flex items-center justify-center
          "
          onClick={() => {
            const el = inputRef.current;
            if (el) {
              el.value = "";
              el.focus();
              startTransition(() => searchStore.clear());
            }
          }}
          aria-label="Clear search"
          title="Clear"
        >
          <span className="text-lg leading-none">×</span>
        </button>
      </div>
    );
  })
);

export default SearchBox;