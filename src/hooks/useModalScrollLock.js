// src/hooks/useModalScrollLock.js
import { useEffect } from "react";

/**
 * useModalScrollLock
 * Locks body/html scrolling while a modal is open.
 * Preserves scroll position and robustly re-applies lock on focus/resize/orientation/pageshow.
 *
 * This is extracted from App.jsx unchanged in behaviour.
 */
export default function useModalScrollLock({ active, disabled }) {
  useEffect(() => {
    if (!active || disabled) return;

    const body = document.body;
    const html = document.documentElement;

    const prevBody = {
      position: body.style.position,
      top: body.style.top,
      left: body.style.left,
      right: body.style.right,
      width: body.style.width,
      overflow: body.style.overflow,
      overscrollBehavior: body.style.overscrollBehavior,
      touchAction: body.style.touchAction,
    };

    const prevHtml = {
      overflow: html.style.overflow,
      overscrollBehavior: html.style.overscrollBehavior,
      height: html.style.height,
    };

    let scrollY = window.scrollY || 0;

    const applyLock = () => {
      scrollY = Number.isFinite(window.scrollY) ? window.scrollY : scrollY;

      body.style.position = "fixed";
      body.style.top = `-${scrollY}px`;
      body.style.left = "0";
      body.style.right = "0";
      body.style.width = "100%";
      body.style.overflow = "hidden";
      body.style.overscrollBehavior = "none";
      body.style.touchAction = "none";

      html.style.overflow = "hidden";
      html.style.overscrollBehavior = "none";
      html.style.height = "100%";
    };

    const reapplyIfNeeded = () => {
      if (!active || disabled) return;
      applyLock();
    };

    applyLock();

    window.addEventListener("pageshow", reapplyIfNeeded);
    window.addEventListener("focus", reapplyIfNeeded);
    window.addEventListener("resize", reapplyIfNeeded);
    window.addEventListener("orientationchange", reapplyIfNeeded);
    document.addEventListener("visibilitychange", reapplyIfNeeded);

    return () => {
      window.removeEventListener("pageshow", reapplyIfNeeded);
      window.removeEventListener("focus", reapplyIfNeeded);
      window.removeEventListener("resize", reapplyIfNeeded);
      window.removeEventListener("orientationchange", reapplyIfNeeded);
      document.removeEventListener("visibilitychange", reapplyIfNeeded);

      body.style.position = prevBody.position;
      body.style.top = prevBody.top;
      body.style.left = prevBody.left;
      body.style.right = prevBody.right;
      body.style.width = prevBody.width;
      body.style.overflow = prevBody.overflow;
      body.style.overscrollBehavior = prevBody.overscrollBehavior;
      body.style.touchAction = prevBody.touchAction;

      html.style.overflow = prevHtml.overflow;
      html.style.overscrollBehavior = prevHtml.overscrollBehavior;
      html.style.height = prevHtml.height;

      window.scrollTo(0, scrollY);
    };
  }, [active, disabled]);
}
