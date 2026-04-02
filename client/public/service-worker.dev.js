/**
 * Dev-only SW: runtime cache for same-origin assets (no precache manifest).
 * Lets offline reload work with webpack-dev-server (`main.js`, chunks, `index.html`).
 * Production uses Workbox `service-worker.js` from the prod build instead.
 *
 * First load must be online so assets are cached; after that, reload while offline works.
 * API calls (other origins) are not intercepted.
 */
const RUNTIME_CACHE = 'dev-sw-runtime-v1'

self.addEventListener('install', (event) => {
  self.skipWaiting()
})

self.addEventListener('activate', (event) => {
  event.waitUntil(self.clients.claim())
})

self.addEventListener('fetch', (event) => {
  const { request } = event
  if (request.method !== 'GET') return

  let url
  try {
    url = new URL(request.url)
  } catch {
    return
  }

  if (url.origin !== self.location.origin) {
    return
  }

  event.respondWith(
    caches.open(RUNTIME_CACHE).then((cache) =>
      fetch(request)
        .then((response) => {
          if (response.ok) {
            void cache.put(request, response.clone())
          }
          return response
        })
        .catch(() => cache.match(request)),
    ),
  )
})
