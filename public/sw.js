// Service Worker for PWA - Auto-Update Version
// Increment this version number when you want to force an update
const CACHE_VERSION = 27; // Change this number to force update
const CACHE_NAME = `amebo-v${CACHE_VERSION}`;
const urlsToCache = [
  '/',
  '/static/app-v3.js',
  '/static/crypto-v2.js',
  '/static/manifest.json'
  // Don't cache CDN resources - they cause CORS errors
];

// Install service worker - activates immediately
self.addEventListener('install', (event) => {
  console.log('[SW] Installing new service worker version:', CACHE_VERSION);
  event.waitUntil(
    caches.open(CACHE_NAME)
      .then((cache) => {
        console.log('[SW] Caching app shell');
        return cache.addAll(urlsToCache);
      })
      .then(() => {
        console.log('[SW] ✅ Install complete');
        // Skip waiting to activate immediately
        return self.skipWaiting();
      })
  );
});

// Fetch from cache, fallback to network
self.addEventListener('fetch', (event) => {
  // Only cache GET requests
  if (event.request.method !== 'GET') {
    event.respondWith(fetch(event.request));
    return;
  }
  
  event.respondWith(
    caches.match(event.request)
      .then((response) => {
        // Cache hit - return response
        if (response) {
          return response;
        }

        return fetch(event.request).then((response) => {
          // Check if valid response
          // Allow 'opaque' responses for CDN resources (don't cache them)
          if (!response || response.status !== 200) {
            return response;
          }
          
          // Don't cache external CDN resources
          if (response.type === 'opaque' || event.request.url.includes('cdn.')) {
            return response;
          }
          
          // Only cache 'basic' responses (same-origin)
          if (response.type !== 'basic') {
            return response;
          }

          // ✅ CRITICAL FIX: Only cache GET requests (POST/PUT/DELETE not allowed)
          if (event.request.method !== 'GET') {
            console.log('[SW] Skipping cache for non-GET request:', event.request.method, event.request.url);
            return response;
          }

          // Clone the response
          const responseToCache = response.clone();

          caches.open(CACHE_NAME)
            .then((cache) => {
              cache.put(event.request, responseToCache);
            });

          return response;
        });
      })
  );
});

// Activate and clean up old caches - takes control immediately
self.addEventListener('activate', (event) => {
  console.log('[SW] Activating new service worker version:', CACHE_VERSION);
  const cacheWhitelist = [CACHE_NAME];
  
  event.waitUntil(
    caches.keys().then((cacheNames) => {
      return Promise.all(
        cacheNames.map((cacheName) => {
          if (cacheWhitelist.indexOf(cacheName) === -1) {
            console.log('[SW] Deleting old cache:', cacheName);
            return caches.delete(cacheName);
          }
        })
      );
    })
    .then(() => {
      console.log('[SW] ✅ Activation complete');
      // Take control of all pages immediately
      return self.clients.claim();
    })
    .then(() => {
      // Notify all clients that an update is ready
      return self.clients.matchAll({ type: 'window' }).then(clients => {
        clients.forEach(client => {
          client.postMessage({
            type: 'SW_UPDATED',
            version: CACHE_VERSION
          });
        });
      });
    })
  );
});

// Handle push notifications
self.addEventListener('push', (event) => {
  let data = { title: 'SecureChat', body: 'New message' };
  
  if (event.data) {
    try {
      data = event.data.json();
    } catch (e) {
      data.body = event.data.text();
    }
  }

  const options = {
    body: data.body,
    icon: '/static/icon-192.svg',
    badge: '/static/icon-192.svg',
    vibrate: [200, 100, 200],
    tag: 'securechat-message',
    requireInteraction: false,
    actions: [
      { action: 'open', title: 'Open Chat', icon: '/static/icon-192.svg' },
      { action: 'close', title: 'Dismiss', icon: '/static/icon-192.svg' }
    ],
    data: data.data || {
      dateOfArrival: Date.now(),
      primaryKey: 1
    }
  };

  event.waitUntil(
    self.registration.showNotification(data.title || 'SecureChat', options)
  );
});

// Handle notification clicks
self.addEventListener('notificationclick', (event) => {
  event.notification.close();

  if (event.action === 'open' || !event.action) {
    event.waitUntil(
      clients.matchAll({ type: 'window', includeUncontrolled: true })
        .then((clientList) => {
          // If app is already open, focus it
          for (let client of clientList) {
            if (client.url.includes(self.location.origin) && 'focus' in client) {
              return client.focus();
            }
          }
          // Otherwise open new window
          if (clients.openWindow) {
            return clients.openWindow('/');
          }
        })
    );
  }
});

// Background sync (for offline message sending)
self.addEventListener('sync', (event) => {
  if (event.tag === 'sync-messages') {
    event.waitUntil(syncMessages());
  }
});

async function syncMessages() {
  // Get pending messages from IndexedDB
  // Send them when back online
  console.log('Syncing offline messages...');
}

// Badge notifications for iOS PWA (shows unread count on app icon)
self.addEventListener('message', async (event) => {
  if (event.data && event.data.type === 'UPDATE_BADGE') {
    const count = event.data.count || 0;
    
    console.log('[SW] Updating app badge:', count);
    
    // Set app badge (shows on home screen icon)
    if ('setAppBadge' in self.navigator) {
      try {
        if (count > 0) {
          await self.navigator.setAppBadge(count);
          console.log('[SW] ✅ Badge set to:', count);
        } else {
          await self.navigator.clearAppBadge();
          console.log('[SW] ✅ Badge cleared');
        }
      } catch (error) {
        console.error('[SW] Badge error:', error);
      }
    } else {
      console.log('[SW] ⚠️ Badge API not supported');
    }
  }
});
