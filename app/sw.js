/* KangTukang Demo — Service worker sederhana (cache asset statis) */
const CACHE = "kt-app-v4";
const ASSETS = [
  "./index.html",
  "./css/app.css",
  "./js/app.js",
  "./js/ui.js",
  "./js/data.js",
  "./js/sim.js",
  "./js/store.js",
  "./js/map.js",
  "./js/screens-order.js",
  "./js/screens-live.js",
  "./js/screens-extra.js",
  "./manifest.webmanifest",
  "../assets/img/logo.png",
];

self.addEventListener("install", (e) => {
  e.waitUntil(caches.open(CACHE).then((c) => c.addAll(ASSETS)).catch(() => {}));
  self.skipWaiting();
});

self.addEventListener("activate", (e) => {
  e.waitUntil(
    caches.keys().then((keys) => Promise.all(keys.filter((k) => k !== CACHE).map((k) => caches.delete(k))))
  );
  self.clients.claim();
});

/* Strategi: network-first, fallback ke cache (agar update mudah saat expo) */
self.addEventListener("fetch", (e) => {
  if (e.request.method !== "GET") return;
  e.respondWith(
    fetch(e.request)
      .then((res) => {
        const copy = res.clone();
        caches.open(CACHE).then((c) => c.put(e.request, copy)).catch(() => {});
        return res;
      })
      .catch(() => caches.match(e.request))
  );
});
