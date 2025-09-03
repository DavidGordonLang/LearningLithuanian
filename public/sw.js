/* Simple SW for Vite app */
const VERSION = "v1.0.0";
const STATIC_CACHE = `static-${VERSION}`;
const STATIC_ASSETS = [
  "/", "/index.html", "/manifest.webmanifest",
  "/icons/192.png", "/icons/512.png", "/icons/maskable-512.png"
];

self.addEventListener("install", (e) => {
  self.skipWaiting();
  e.waitUntil(
    caches.open(STATIC_CACHE).then((c) => c.addAll(STATIC_ASSETS))
  );
});

self.addEventListener("activate", (e) => {
  e.waitUntil(
    caches.keys().then((keys) =>
      Promise.all(keys.filter(k => k !== STATIC_CACHE).map(k => caches.delete(k)))
    ).then(() => self.clients.claim())
  );
});

/* Network-first for navigations, cache-first for static assets */
self.addEventListener("fetch", (e) => {
  const { request } = e;
  if (request.method !== "GET") return;

  // SPA navigations
  if (request.mode === "navigate") {
    e.respondWith(
      fetch(request).catch(() => caches.match("/index.html"))
    );
    return;
  }

  // Same-origin static assets
  const url = new URL(request.url);
  if (url.origin === self.location.origin) {
    e.respondWith(
      caches.match(request).then((cached) => {
        const fetchPromise = fetch(request).then((res) => {
          const copy = res.clone();
          caches.open(STATIC_CACHE).then((c) => c.put(request, copy));
          return res;
        }).catch(() => cached);
        return cached || fetchPromise;
      })
    );
  }
});