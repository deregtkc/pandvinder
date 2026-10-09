// Stale-while-revalidate: open instantly from cache, refresh in the background.
// When the page itself changed, tell open pages so they can offer a reload.
// ponytail: same-origin GETs only (Supabase/fonts/ads pass through); no cache versioning,
// the revalidate step overwrites entries on every visit.
const CACHE = "pv-shell";
const SHELL = ["./", "index.html", "config.js", "version.js", "manifest.webmanifest", "favicon.svg",
  "mutua-fides-bottle.png", "icon-192.png", "icon-512.png", "apple-touch-icon.png"];

self.addEventListener("install", e => e.waitUntil(
  caches.open(CACHE).then(c => c.addAll(SHELL)).then(() => self.skipWaiting())
));
self.addEventListener("activate", e => e.waitUntil(self.clients.claim()));

self.addEventListener("fetch", e => {
  const { request } = e;
  if (request.method !== "GET" || new URL(request.url).origin !== location.origin) return;
  e.respondWith((async () => {
    const cache = await caches.open(CACHE);
    const cached = await cache.match(request, { ignoreSearch: true });
    const network = fetch(request).then(async res => {
      if (res.ok) {
        if (cached && request.mode === "navigate" && await res.clone().text() !== await cached.clone().text()) {
          (await self.clients.matchAll()).forEach(c => c.postMessage({ type: "update" }));
        }
        cache.put(request, res.clone());
      }
      return res;
    }).catch(() => cached);
    return cached || network;
  })());
});
