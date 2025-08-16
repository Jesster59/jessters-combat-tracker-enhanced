/**
 * Jesster's Combat Tracker
 * Service Worker
 * Version 2.3.1
 * 
 * This service worker provides offline functionality and caching for the application.
 */

// Cache name with version to enable easy updates
const CACHE_NAME = 'jct-cache-v2.3.1';

// Resources to cache immediately on service worker installation
const PRECACHE_RESOURCES = [
  './',
  './index.html',
  './css/normalize.css',
  './css/main.css',
  './css/components.css',
  './css/tactical.css',
  './css/themes.css',
  './js/app.js',
  './js/stats.js',
  './js/tactical.js',
  './js/templates.js',
  './js/theme.js',
  './js/ui.js',
  './images/logo.svg',
  './images/favicon.ico',
  './images/icon-192x192.png',
  './images/icon-512x512.png',
  './manifest.json'
];

// Resources that should be cached when used but aren't critical for initial load
const RUNTIME_CACHE_PATTERNS = [
  /\.(?:png|jpg|jpeg|svg|gif)$/,
  /\.(?:woff|woff2|ttf|otf)$/
];

// Install event - precache critical resources
self.addEventListener('install', (event) => {
  console.log('Pre-caching resources');
  event.waitUntil(
    caches.open(CACHE_NAME).then((cache) => {
      // Create an array of promises for each resource
      const resourcePromises = [
        './',
        './index.html',
        './css/styles.css',
        // Keep only essential files that you're sure exist
      ].map(url => {
        // Try to cache each resource, but don't fail if one fails
        return cache.add(url).catch(error => {
          console.log(`Failed to cache: ${url}`, error);
          // Continue despite the error
          return Promise.resolve();
        });
      });
      
      // Wait for all promises to resolve
      return Promise.all(resourcePromises);
    })
  );
});

// Activate event - clean up old caches
self.addEventListener('activate', event => {
  event.waitUntil(
    caches.keys()
      .then(cacheNames => {
        return Promise.all(
          cacheNames.filter(cacheName => {
            // Delete any old caches that don't match our current cache name
            return cacheName.startsWith('jct-cache-') && cacheName !== CACHE_NAME;
          }).map(cacheName => {
            console.log('Removing old cache:', cacheName);
            return caches.delete(cacheName);
          })
        );
      })
      .then(() => {
        // Take control of all clients immediately
        return self.clients.claim();
      })
  );
});

// Fetch event - serve from cache or network
self.addEventListener('fetch', event => {
  // Skip cross-origin requests
  if (!event.request.url.startsWith(self.location.origin)) {
    return;
  }

  // Skip non-GET requests
  if (event.request.method !== 'GET') {
    return;
  }

  // Handle API requests differently (don't cache)
  if (event.request.url.includes('/api/')) {
    return;
  }

  event.respondWith(
    caches.match(event.request)
      .then(cachedResponse => {
        if (cachedResponse) {
          // Return cached response
          return cachedResponse;
        }

        // Not in cache, fetch from network
        return fetch(event.request)
          .then(response => {
            // Check if we should cache this response
            if (!response || response.status !== 200 || response.type !== 'basic') {
              return response;
            }

            // Should we cache this resource type?
            const shouldCache = RUNTIME_CACHE_PATTERNS.some(pattern => 
              pattern.test(new URL(event.request.url).pathname)
            );

            if (shouldCache) {
              // Clone the response since it can only be consumed once
              const responseToCache = response.clone();

              caches.open(CACHE_NAME)
                .then(cache => {
                  cache.put(event.request, responseToCache);
                })
                .catch(error => {
                  console.error('Runtime caching failed:', error);
                });
            }

            return response;
          })
          .catch(error => {
            console.error('Fetch failed:', error);
            
            // If the request is for an HTML page, return the offline page
            if (event.request.headers.get('accept').includes('text/html')) {
              return caches.match('./index.html');
            }
            
            // Otherwise, just propagate the error
            throw error;
          });
      })
  );
});

// Background sync for offline data
self.addEventListener('sync', event => {
  if (event.tag === 'jct-sync-data') {
    event.waitUntil(syncData());
  }
});

// Push notification handler
self.addEventListener('push', event => {
  if (!event.data) return;
  
  try {
    const data = event.data.json();
    
    const options = {
      body: data.body || 'New notification from Jesster\'s Combat Tracker',
      icon: './images/icon-192x192.png',
      badge: './images/notification-badge.png',
      data: data.data || {},
      actions: data.actions || []
    };
    
    event.waitUntil(
      self.registration.showNotification(
        data.title || 'Jesster\'s Combat Tracker', 
        options
      )
    );
  } catch (error) {
    console.error('Push notification error:', error);
    
    // Fallback for non-JSON data
    event.waitUntil(
      self.registration.showNotification(
        'Jesster\'s Combat Tracker',
        {
          body: event.data.text(),
          icon: './images/icon-192x192.png',
          badge: './images/notification-badge.png'
        }
      )
    );
  }
});

// Notification click handler
self.addEventListener('notificationclick', event => {
  event.notification.close();
  
  // Handle notification click - open app and focus
  event.waitUntil(
    self.clients.matchAll({ type: 'window' })
      .then(clientList => {
        // If a window client is already open, focus it
        for (const client of clientList) {
          if (client.url.startsWith(self.location.origin) && 'focus' in client) {
            return client.focus();
          }
        }
        
        // Otherwise open a new window
        if (self.clients.openWindow) {
          let url = './index.html';
          
          // Add action data if available
          if (event.action && event.notification.data && event.notification.data.actions) {
            const actionData = event.notification.data.actions.find(a => a.action === event.action);
            if (actionData && actionData.url) {
              url = actionData.url;
            }
          }
          
          return self.clients.openWindow(url);
        }
      })
  );
});

// Helper function for background sync
async function syncData() {
  try {
    // Get all clients
    const clients = await self.clients.matchAll();
    
    // Send message to clients to perform sync
    clients.forEach(client => {
      client.postMessage({
        type: 'SYNC_REQUIRED'
      });
    });
    
    return Promise.resolve();
  } catch (error) {
    console.error('Sync failed:', error);
    return Promise.reject(error);
  }
}

// Log service worker lifecycle events
self.addEventListener('message', event => {
  if (event.data && event.data.type === 'SKIP_WAITING') {
    self.skipWaiting();
  }
});

console.log('Service worker loaded - version 2.3.1');

