/* DMRX Farmer Calculator - Service Worker v3 */
var CACHE_NAME = 'dmrx-farm-v3';

var FILES_TO_CACHE = [
  './',
  './index.html',
  './manifest.json',
  './icon-192.png',

  /* Google Fonts */
  'https://fonts.googleapis.com/css2?family=Poppins:wght@300;400;500;600;700;800;900&display=swap',

  /* Font Awesome CSS */
  'https://cdnjs.cloudflare.com/ajax/libs/font-awesome/6.5.0/css/all.min.css',

  /* Font Awesome — Solid icons (woff2) */
  'https://cdnjs.cloudflare.com/ajax/libs/font-awesome/6.5.0/webfonts/fa-solid-900.woff2',

  /* Font Awesome — Brands icons (woff2) */
  'https://cdnjs.cloudflare.com/ajax/libs/font-awesome/6.5.0/webfonts/fa-brands-400.woff2',

  /* Font Awesome — Regular icons (woff2) */
  'https://cdnjs.cloudflare.com/ajax/libs/font-awesome/6.5.0/webfonts/fa-regular-400.woff2'
];

/* ── INSTALL: saari files cache karo ── */
self.addEventListener('install', function(e) {
  e.waitUntil(
    caches.open(CACHE_NAME).then(function(cache) {
      return Promise.allSettled(
        FILES_TO_CACHE.map(function(url) {
          return cache.add(url).catch(function(err) {
            console.warn('Cache miss (skip):', url, err);
          });
        })
      );
    })
  );
  self.skipWaiting();
});

/* ── ACTIVATE: purane caches delete karo ── */
self.addEventListener('activate', function(e) {
  e.waitUntil(
    caches.keys().then(function(keys) {
      return Promise.all(
        keys
          .filter(function(k) { return k !== CACHE_NAME; })
          .map(function(k) { return caches.delete(k); })
      );
    })
  );
  self.clients.claim();
});

/* ── FETCH: cache-first, network fallback ── */
self.addEventListener('fetch', function(e) {
  /* Tailwind CDN — hamesha network se lo (cache mat karo) */
  if (e.request.url.includes('cdn.tailwindcss.com')) {
    e.respondWith(
      fetch(e.request).catch(function() {
        return new Response('', { status: 503 });
      })
    );
    return;
  }

  e.respondWith(
    caches.match(e.request).then(function(cached) {
      if (cached) return cached;

      return fetch(e.request).then(function(response) {
        /* Sirf valid responses cache karo */
        if (
          response &&
          response.status === 200 &&
          response.type !== 'opaque'
        ) {
          var clone = response.clone();
          caches.open(CACHE_NAME).then(function(cache) {
            cache.put(e.request, clone);
          });
        }
        return response;
      });
    }).catch(function() {
      /* Offline fallback */
      return caches.match('./index.html');
    })
  );
});
