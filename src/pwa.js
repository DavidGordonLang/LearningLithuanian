// Non-intrusive Service Worker registration
(function registerSW(){
  if ("serviceWorker" in navigator) {
    // Defer registration until the browser is idle and no input is focused
    const go = () => {
      if (document.activeElement && /input|textarea/i.test(document.activeElement.tagName)) {
        // try again shortly if user is typing
        setTimeout(go, 3000);
        return;
      }
      navigator.serviceWorker.register("/sw.js").catch(console.error);
    };
    if (document.readyState === "complete") {
      setTimeout(go, 1500);
    } else {
      window.addEventListener("load", () => setTimeout(go, 1500));
    }
  }
})();

// Install banner (Chrome). Never display while an input is focused.
let deferredPrompt = null;
window.addEventListener("beforeinstallprompt", (e) => {
  e.preventDefault();
  deferredPrompt = e;
  maybeShowInstallBanner();
});

function inputIsFocused() {
  const el = document.activeElement;
  return !!el && (el.tagName === "INPUT" || el.tagName === "TEXTAREA" || el.isContentEditable);
}

function maybeShowInstallBanner() {
  if (!deferredPrompt) return;
  if (inputIsFocused()) {
    // Wait until typing stops
    const onBlurOnce = () => {
      setTimeout(showInstallBanner, 250);
      window.removeEventListener("blur", onBlurOnce, true);
      document.removeEventListener("focusin", onBlurOnce, true);
    };
    window.addEventListener("blur", onBlurOnce, true);
    document.addEventListener("focusin", onBlurOnce, true);
    return;
  }
  showInstallBanner();
}

function showInstallBanner() {
  if (!deferredPrompt) return;

  // Create a non-focus-stealing bottom sheet
  const wrap = document.createElement("div");
  wrap.id = "install-banner";
  wrap.setAttribute("role", "dialog");
  wrap.setAttribute("aria-live", "polite");
  wrap.tabIndex = -1; // do not grab focus
  wrap.className =
    "fixed inset-x-0 bottom-0 z-[70] px-4 pb-[calc(1rem+var(--sab))] pt-3 " +
    "bg-zinc-900/95 backdrop-blur border-t border-white/10";
  wrap.innerHTML = `
    <div class="max-w-5xl mx-auto flex items-center gap-3">
      <div class="flex-1 min-w-0">
        <p class="text-sm text-emerald-400">Install Lithuanian Trainer</p>
        <p class="text-xs text-zinc-300 truncate">Get full-screen, faster launch, and offline basics.</p>
      </div>
      <button id="install-btn"
        class="rounded-xl px-3 py-2 border border-white/10 hover:bg-white/5">
        Install
      </button>
      <button id="install-dismiss"
        class="rounded-xl px-3 py-2 border border-white/10 hover:bg-white/5">
        Later
      </button>
    </div>`;
  document.body.appendChild(wrap);

  const btnInstall = document.getElementById("install-btn");
  const btnDismiss = document.getElementById("install-dismiss");

  btnInstall.addEventListener("click", async () => {
    const e = deferredPrompt;
    deferredPrompt = null;
    try {
      await e.prompt();
      await e.userChoice;
    } finally {
      removeBanner();
    }
  });

  btnDismiss.addEventListener("click", removeBanner);

  function removeBanner() {
    const el = document.getElementById("install-banner");
    if (el) el.remove();
  }
}

// iOS hint (Safari doesn’t fire beforeinstallprompt). Non-intrusive.
(function iosHint(){
  const ua = window.navigator.userAgent || "";
  const isIOS = /iPad|iPhone|iPod/.test(ua);
  const isSafari = /^((?!chrome|android).)*safari/i.test(ua);
  const isStandalone = window.navigator.standalone === true;

  if (isIOS && isSafari && !isStandalone) {
    const hint = document.createElement("div");
    hint.className =
      "fixed inset-x-0 bottom-0 z-[60] px-4 pb-[calc(1rem+var(--sab))] pt-3 " +
      "bg-zinc-900/95 backdrop-blur border-t border-white/10 pointer-events-auto";
    hint.innerHTML = `
      <div class="max-w-5xl mx-auto text-sm text-zinc-200">
        <span class="text-emerald-400">Add to Home Screen:</span>
        tap <span class="inline-block px-2 py-0.5 rounded bg-white/10">Share</span> → 
        <span class="inline-block px-2 py-0.5 rounded bg-white/10">Add to Home Screen</span>.
      </div>`;
    document.body.appendChild(hint);
    setTimeout(() => hint.remove(), 9000);
  }
})();
