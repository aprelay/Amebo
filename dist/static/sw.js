// Service Worker for PWA
const CACHE_NAME = 'securechat-v1';
const urlsToCache = [
  '/',
  '/static/app-v3.js',
  '/static/crypto-v2.js',
  '/static/manifest.json'
  // Don't cache CDN resources - they cause CORS errors
];

// Install service worker
self.addEventListener('install', (event) => {
  event.waitUntil(
    caches.open(CACHE_NAME)
      .then((cache) => {
        console.log('Opened cache');
        return cache.addAll(urlsToCache);
      })
  );
  self.skipWaiting();
});

// Fetch from cache, fallback to network
self.addEventListener('fetch', (event) => {
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

// Activate and clean up old caches
self.addEventListener('activate', (event) => {
  const cacheWhitelist = [CACHE_NAME];
  
  event.waitUntil(
    caches.keys().then((cacheNames) => {
      return Promise.all(
        cacheNames.map((cacheName) => {
          if (cacheWhitelist.indexOf(cacheName) === -1) {
            return caches.delete(cacheName);
          }
        })
      );
    })
  );
  self.clients.claim();
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
