const CACHE = 'r2-v1';
const R2_RE = /\.r2\.dev/;

self.addEventListener('install', () => self.skipWaiting());

self.addEventListener('activate', (e) => {
  e.waitUntil(
    caches.keys().then((keys) =>
      Promise.all(keys.filter((k) => k !== CACHE).map((k) => caches.delete(k)))
    ).then(() => self.clients.claim())
  );
});

self.addEventListener('fetch', (e) => {
  if (!R2_RE.test(e.request.url)) return;
  e.respondWith(
    caches.open(CACHE).then((cache) =>
      cache.match(e.request).then((hit) => hit || fetch(e.request).then((r) => {
        if (r.ok) cache.put(e.request, r.clone());
        return r;
      }))
    )
  );
});
