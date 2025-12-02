// Service Worker for Offline Support
const CACHE_NAME = 'rathmullan-sailing-v3';
const urlsToCache = [
    '/',
    '/instructors.html',
    '/style.css',
    // Intentionally excluding '/js/instructors.js' so it is always fetched fresh
    '/images/image.png'
];

// Install event - cache resources
self.addEventListener('install', event => {
    // Force the waiting service worker to become the active service worker
    self.skipWaiting();

    event.waitUntil(
        caches.open(CACHE_NAME)
            .then(cache => {
                console.info('Opened cache');
                return cache.addAll(urlsToCache.filter(url => url !== '/'));
            })
            .catch(err => console.error('Cache install error:', err))
    );
});

// Fetch event - serve from cache when offline
self.addEventListener('fetch', event => {
    // Only handle http/https requests, skip chrome-extension and other schemes
    if (!event.request.url.startsWith('http')) {
        return;
    }

    // Always bypass SW caching for instructors.html to avoid stale overlay issues
    // But handle network failures gracefully so the SW doesn't throw unhandled errors
    if (event.request.url.endsWith('/instructors.html')) {
        event.respondWith(
            fetch(event.request).catch(() => {
                // Try to serve a cached copy if available
                return caches.match('/instructors.html').then(cached => {
                    if (cached) return cached;
                    // Otherwise return a minimal offline HTML response so navigation still works
                    return new Response('<!doctype html><meta charset="utf-8"><title>Offline</title><body><h1>Offline</h1><p>Unable to load page (offline).</p></body>', {
                        status: 503,
                        statusText: 'Service Unavailable',
                        headers: { 'Content-Type': 'text/html' }
                    });
                });
            })
        );
        return;
    }

    // Always network-fetch latest instructors.js (no caching) to prevent stale logic
    if (event.request.url.endsWith('/js/instructors.js')) {
        event.respondWith(
            fetch(event.request).catch(() => caches.match(event.request))
        );
        return;
    }

    // Network-first for other HTML pages
    if (event.request.mode === 'navigate' || event.request.destination === 'document') {
        event.respondWith(
            fetch(event.request)
                .then(response => {
                    // Cache the fresh response
                    if (response && response.status === 200 && response.type === 'basic') {
                        // Only cache GET requests — Cache.put rejects POST/PUT/DELETE requests
                        if (event.request.method === 'GET') {
                            const responseToCache = response.clone();
                            caches.open(CACHE_NAME).then(cache => {
                                cache.put(event.request, responseToCache);
                            });
                        }
                    }
                    return response;
                })
                .catch(() => {
                    // Fallback to cache if offline
                    return caches.match(event.request);
                })
        );
        return;
    }

    // Cache-first for other resources (CSS, JS, images)
    event.respondWith(
        caches.match(event.request)
            .then(response => {
                if (response) {
                    return response;
                }

                const fetchRequest = event.request.clone();

                return fetch(fetchRequest).then(response => {
                    // Check if valid response
                    if (!response || response.status !== 200) {
                        return response;
                    }

                    // Only cache basic responses (same-origin)
                    if (response.type === 'basic') {
                        // Only cache GET requests to avoid "Request method 'POST' is unsupported" errors
                        if (event.request.method === 'GET') {
                            const responseToCache = response.clone();
                            caches.open(CACHE_NAME).then(cache => {
                                cache.put(event.request, responseToCache);
                            });
                        }
                    }

                    return response;
                }).catch(() => {
                    // No fallback for non-document requests
                    return new Response('Offline - resource not cached', {
                        status: 503,
                        statusText: 'Service Unavailable'
                    });
                });
            })
    );
});

// Activate event - clean up old caches
self.addEventListener('activate', event => {
    // Take control of all pages immediately
    event.waitUntil(clients.claim());

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

// Handle notification clicks: focus existing tab or open a new one
// Notification click handler removed (no push notifications)
