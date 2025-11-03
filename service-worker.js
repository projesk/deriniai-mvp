// Simple PWA service worker (stale-while-revalidate)
const CACHE = "deriniai-mvp-v1";
const ASSETS = [
  "./",
  "./index.html",
  "./manifest.webmanifest",
  "./icons/icon-192.png",
  "./icons/icon-512.png"
];

self.addEventListener("install", (e) => {
  e.waitUntil(
    caches.open(CACHE).then((cache) => cache.addAll(ASSETS)).then(() => self.skipWaiting())
  );
});

self.addEventListener("activate", (e) => {
  e.waitUntil(
    caches.keys().then(keys => Promise.all(keys.map(k => k !== CACHE ? caches.delete(k) : null)))
  );
  self.clients.claim();
});

self.addEventListener("fetch", (e) => {
  const req = e.request;
  e.respondWith(
    caches.match(req).then(cached => {
      const fetchPromise = fetch(req).then(networkRes => {
        // Cache a copy if same-origin GET
        try {
          const url = new URL(req.url);
          if (req.method === "GET" && url.origin === location.origin) {
            const resClone = networkRes.clone();
            caches.open(CACHE).then(c => c.put(req, resClone));
          }
        } catch (err) {}
        return networkRes;
      }).catch(() => cached);
      return cached || fetchPromise;
    })
  );
});