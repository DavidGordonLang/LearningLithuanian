/* Simple, versioned Service Worker for Žodis (PWA-safe) */

const CACHE_VERSION = "zodis-merge11"; // 🔁 bump this on every UI change
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
  // Activate immediately and pre-cache static assets
  self.skipWaiting();
  event.waitUntil(
    caches.open(CACHE_NAME).then((cache) => cache.addAll(STATIC_ASSETS))
  );
});

/* ACTIVATE — CLEAN OLD CACHES + TAKE CONTROL */
self.addEventListener("activate", (event) => {
  event.waitUntil(
    (async () => {
      const keys = await caches.keys();
      await Promise.all(
        keys.filter((key) => key !== CACHE_NAME).map((key) => caches.delete(key))
      );

      // Take control of any open pages immediately
      await self.clients.claim();
    })()
  );
});

/* FETCH STRATEGY
   - Navigations: HARD network (bypass HTTP cache + SW caches) to avoid stale app after auth redirects
   - Static same-origin: cache-first, then fetch & cache
*/
self.addEventListener("fetch", (event) => {
  const { request } = event;

  if (request.method !== "GET") return;

  // SPA navigations (index.html). Force network + bypass caches.
  // This is the critical fix for "Google sign-in -> app reverts to old UI".
  if (request.mode === "navigate") {
    event.respondWith(
      fetch(request, { cache: "no-store" }).catch(() =>
        // If truly offline, fall back to cached index.html (best-effort)
        caches.match("/index.html")
      )
    );
    return;
  }

  const url = new URL(request.url);

  // Same-origin assets: serve from cache, fetch and cache if missing
  if (url.origin === self.location.origin) {
    event.respondWith(
      caches.match(request).then((cached) => {
        if (cached) return cached;

        return fetch(request).then((response) => {
          // Only cache successful basic/cors responses
          if (!response || response.status !== 200) return response;

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

/* OPTIONAL: allow the page to tell the SW to activate immediately */
self.addEventListener("message", (event) => {
  if (event?.data?.type === "SKIP_WAITING") {
    self.skipWaiting();
  }
});
