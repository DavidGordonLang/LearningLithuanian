/* Simple, versioned Service Worker for Žodis (PWA-safe) */

const CACHE_VERSION = "zodis-container-fix3"; // 🔁 CHANGE THIS ON EVERY UI CHANGE
const CACHE_NAME = `zodis-static-${CACHE_VERSION}`;

const STATIC_ASSETS = [
  "/",
  "/index.html",
  "/manifest.webmanifest",
  "/icons/192.png",
  "/icons/512.png",
  "/icons/maskable-512.png",
];

/* INSTALL */
self.addEventListener("install", (event) => {
  self.skipWaiting();

  event.waitUntil(
    caches.open(CACHE_NAME).then((cache) => {
      return cache.addAll(STATIC_ASSETS);
    })
  );
});

/* ACTIVATE — CLEAN OLD CACHES */
self.addEventListener("activate", (event) => {
  event.waitUntil(
    caches.keys().then((keys) =>
      Promise.all(
        keys
          .filter((key) => key !== CACHE_NAME)
          .map((key) => caches.delete(key))
      )
    ).then(() => self.clients.claim())
  );
});

/* FETCH STRATEGY
   - Network-first for navigation (SPA correctness)
   - Cache-first for same-origin static assets
*/
self.addEventListener("fetch", (event) => {
  const { request } = event;

  if (request.method !== "GET") return;

  // SPA navigations
  if (request.mode === "navigate") {
    event.respondWith(
      fetch(request).catch(() => caches.match("/index.html"))
    );
    return;
  }

  const url = new URL(request.url);

  // Same-origin assets
  if (url.origin === self.location.origin) {
    event.respondWith(
      caches.match(request).then((cached) => {
        if (cached) return cached;

        return fetch(request).then((response) => {
          const responseClone = response.clone();
          caches.open(CACHE_NAME).then((cache) => {
            cache.put(request, responseClone);
          });
          return response;
        });
      })
    );
  }
});
