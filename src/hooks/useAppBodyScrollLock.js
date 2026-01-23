// src/hooks/useAppBodyScrollLock.js
import { useEffect } from "react";

/**
 * useAppBodyScrollLock
 * Locks BODY/HTML scrolling while overlays/modals are active,
 * so only the intended panels scroll (native-feel).
 *
 * Supports both call styles:
 *   useAppBodyScrollLock(true)
 *   useAppBodyScrollLock({ active: true })
 */
export default function useAppBodyScrollLock(activeOrOpts) {
  const active =
    typeof activeOrOpts === "boolean"
      ? activeOrOpts
      : !!activeOrOpts?.active;

  useEffect(() => {
    if (!active) return;

    const body = document.body;
    const html = document.documentElement;

    const prev = {
      bodyOverflow: body.style.overflow,
      bodyHeight: body.style.height,
      htmlOverflow: html.style.overflow,
      htmlHeight: html.style.height,
    };

    body.style.overflow = "hidden";
    body.style.height = "100%";
    html.style.overflow = "hidden";
    html.style.height = "100%";

    return () => {
      body.style.overflow = prev.bodyOverflow;
      body.style.height = prev.bodyHeight;
      html.style.overflow = prev.htmlOverflow;
      html.style.height = prev.htmlHeight;
    };
  }, [active]);
}