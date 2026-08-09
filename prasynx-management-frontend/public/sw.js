const CACHE = 'prasynx-management-v1';
const urlsToCache = [
  '/',
  '/manifest.json',
];

self.addEventListener('install', (event) => {
  event.waitUntil(
    caches.open(CACHE).then((cache) => cache.addAll(urlsToCache))
  );
});

self.addEventListener('fetch', (event) => {
  const { request } = event;
  if (request.method !== 'GET') return;

  const url = new URL(request.url);

  // Skip Next.js internal assets — they have versioned URLs and are handled by the framework
  if (url.pathname.startsWith('/_next/')) return;

  // Skip non-GET and non-local requests
  if (url.origin !== location.origin) return;

  event.respondWith(
    caches.match(request).then((cached) => {
      const fetchPromise = fetch(request).then((response) => {
        if (response && response.status === 200) {
          const clone = response.clone();
          caches.open(CACHE).then((cache) => cache.put(request, clone));
        }
        return response;
      }).catch(() => cached);
      return cached || fetchPromise;
    })
  );
});

self.addEventListener('activate', (event) => {
  const cacheWhitelist = [CACHE];
  event.waitUntil(
    caches.keys().then((names) =>
      Promise.all(names.map((n) => {
        if (!cacheWhitelist.includes(n)) return caches.delete(n);
      }))
    )
  );
});
