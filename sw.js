const CACHE_NAME = 'budget-app-cache-v1';
const urlsToCache = [
    './',
    './index.html',
    './manifest.json',
    // Note: We don't cache external resources like Tailwind or Google Fonts,
    // as the browser and service worker will handle them efficiently.
];

// Install the service worker and cache the app shell
self.addEventListener('install', event => {
    event.waitUntil(
        caches.open(CACHE_NAME)
            .then(cache => {
                console.log('Opened cache');
                return cache.addAll(urlsToCache);
            })
    );
});

// Intercept fetch requests
self.addEventListener('fetch', event => {
    // --- FIX ---
    // If the request is for the Gemini API, bypass the service worker entirely.
    // This is an online-only feature and should always go directly to the network.
    if (event.request.url.startsWith('https://generativelanguage.googleapis.com')) {
        return fetch(event.request);
    }

    // For all other requests, use a "cache-first" strategy.
    // This makes the app load instantly and work offline.
    event.respondWith(
        caches.match(event.request)
            .then(response => {
                // If the request is in the cache, return it.
                if (response) {
                    return response;
                }
                // Otherwise, fetch it from the network.
                return fetch(event.request);
            })
    );
});

// Clean up old caches
self.addEventListener('activate', event => {
    const cacheWhitelist = [CACHE_NAME];
    event.waitUntil(
        caches.keys().then(cacheNames => {
            return Promise.all(
                cacheNames.map(cacheName => {
                    if (cacheWhitelist.indexOf(cacheName) === -1) {
                        return caches.delete(cacheName);
                    }
                })
            );
        })
    );
});

