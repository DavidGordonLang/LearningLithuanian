import { learningUpdateGuard } from "./lib/learningUpdateGuard.js";

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
      navigator.serviceWorker.register("/sw.js", { updateViaCache: "none" }).catch(console.error);
    };
    if (document.readyState === "complete") {
      setTimeout(go, 1500);
    } else {
      window.addEventListener("load", () => setTimeout(go, 1500));
    }
  }
})();

/*
 * Build freshness check
 *
 * An installed PWA can stay alive in Android's task switcher for a long time.
 * A successful deployment does not replace JavaScript that is already running
 * in that page. When the app becomes visible again, compare the currently
 * loaded Vite entry bundle with the entry bundle referenced by a fresh copy of
 * index.html. If they differ, reload once so the learner gets the new build.
 */
let buildFreshnessCheckInFlight = false;
let lastBuildFreshnessCheckAt = 0;
const BUILD_FRESHNESS_MIN_INTERVAL_MS = 15000;

function currentEntryAssetPath() {
  const scripts = Array.from(document.querySelectorAll('script[type="module"][src]'));
  const asset = scripts
    .map((script) => script.getAttribute("src"))
    .find((src) => src && /\/assets\/index-[^/]+\.js(?:\?|$)/.test(src));

  if (!asset) return null;

  try {
    return new URL(asset, window.location.origin).pathname;
  } catch {
    return asset.split("?")[0];
  }
}

async function checkForNewBuild() {
  if (buildFreshnessCheckInFlight || document.visibilityState === "hidden") return;

  const now = Date.now();
  if (now - lastBuildFreshnessCheckAt < BUILD_FRESHNESS_MIN_INTERVAL_MS) return;

  lastBuildFreshnessCheckAt = now;
  buildFreshnessCheckInFlight = true;

  try {
    const currentAsset = currentEntryAssetPath();
    if (!currentAsset) return;

    const response = await fetch(`/?__zodis_build_check=${now}`, {
      cache: "no-store",
      headers: { "cache-control": "no-cache" },
    });
    if (!response.ok) return;

    const html = await response.text();
    const freshDocument = new DOMParser().parseFromString(html, "text/html");
    const freshAsset = Array.from(
      freshDocument.querySelectorAll('script[type="module"][src]')
    )
      .map((script) => script.getAttribute("src"))
      .find((src) => src && /\/assets\/index-[^/]+\.js(?:\?|$)/.test(src));

    if (!freshAsset) return;

    const freshPath = new URL(freshAsset, window.location.origin).pathname;
    if (freshPath !== currentAsset) {
      learningUpdateGuard.request(() => window.location.reload());
    }
  } catch (error) {
    // Offline or transient network failures should never interrupt the learner.
    console.debug("Build freshness check skipped", error);
  } finally {
    buildFreshnessCheckInFlight = false;
  }
}

window.addEventListener("pageshow", () => {
  setTimeout(checkForNewBuild, 500);
});
window.addEventListener("focus", checkForNewBuild);
document.addEventListener("visibilitychange", () => {
  if (document.visibilityState === "visible") checkForNewBuild();
});

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
