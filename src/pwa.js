// Register service worker
if ("serviceWorker" in navigator) {
  window.addEventListener("load", () => {
    navigator.serviceWorker.register("/sw.js").catch(console.error);
  });
}

// Install banner (Android/desktop Chrome)
let deferredPrompt = null;
window.addEventListener("beforeinstallprompt", (e) => {
  e.preventDefault();
  deferredPrompt = e;
  showInstallBanner();
});

function showInstallBanner() {
  if (!deferredPrompt) return;

  // Create a simple bottom sheet using Tailwind (already loaded)
  const wrap = document.createElement("div");
  wrap.id = "install-banner";
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

  document.getElementById("install-btn").onclick = async () => {
    const e = deferredPrompt;
    deferredPrompt = null;
    await e.prompt();
    await e.userChoice; // result can be used if you care
    removeBanner();
  };
  document.getElementById("install-dismiss").onclick = removeBanner;

  function removeBanner() {
    const el = document.getElementById("install-banner");
    if (el) el.remove();
  }
}

// iOS hint (Safari doesn’t fire beforeinstallprompt)
(function iosHint(){
  const ua = window.navigator.userAgent || "";
  const isIOS = /iPad|iPhone|iPod/.test(ua);
  const isSafari = /^((?!chrome|android).)*safari/i.test(ua);
  const isStandalone = window.navigator.standalone === true;

  if (isIOS && isSafari && !isStandalone) {
    const hint = document.createElement("div");
    hint.className =
      "fixed inset-x-0 bottom-0 z-[60] px-4 pb-[calc(1rem+var(--sab))] pt-3 " +
      "bg-zinc-900/95 backdrop-blur border-t border-white/10";
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