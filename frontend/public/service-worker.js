/* eslint-disable array-callback-return */
/* eslint-disable no-restricted-globals */
const CACHE_NAME = 'my-app-cache-v1';
// "scripts": {
//   "start": "react-scripts start",
//   "build": "react-scripts build",
//   "build:dev": "GENERATE_SERVICE_WORKER=false react-scripts build"
// },
// Install event: Cache only essential assets initially
self.addEventListener('install', (event) => {
  event.waitUntil(
    caches.open(CACHE_NAME).then((cache) => {
      console.log('Caching essential files...');
      return cache.addAll([
        '/',
        '/index.html', // Ensure index.html is cached for offline routing
      ]);
    })
  );
});

// Fetch event: Serve from cache and dynamically cache new assets
self.addEventListener('fetch', (event) => {
  event.respondWith(
    caches.match(event.request).then((cachedResponse) => {
      if (cachedResponse) {
        return cachedResponse; // Return cached response if available
      }

      return fetch(event.request)
        .then((networkResponse) => {
          // Only cache GET requests and avoid caching API responses
          if (
            event.request.method === 'GET' &&
            !event.request.url.includes('/api/')
          ) {
            return caches.open(CACHE_NAME).then((cache) => {
              cache.put(event.request, networkResponse.clone());
              return networkResponse;
            });
          }
          return networkResponse;
        })
        .catch(() => caches.match('/index.html')); // Fallback to index.html for offline access
    })
  );
});

// Activate event: Delete old caches
self.addEventListener('activate', (event) => {
  event.waitUntil(
    caches.keys().then((cacheNames) => {
      return Promise.all(
        cacheNames.map((cacheName) => {
          if (cacheName !== CACHE_NAME) {
            console.log('Deleting old cache:', cacheName);
            return caches.delete(cacheName);
          }
        })
      );
    })
  );
});
