/**
 * Registers a service worker:
 * - **Development:** `public/service-worker.dev.js` — runtime cache of same-origin assets so
 *   offline reload works with webpack-dev-server (no precache manifest; avoids hash mismatch vs prod SW).
 * - **Production:** Workbox-generated `service-worker.js` (precache + photo runtime cache; see webpack.prod).
 *
 * If you previously registered a prod SW on localhost, unregister it once (Application → Service Workers)
 * or hard-refresh after switching dev/prod SW URLs.
 */
export function registerServiceWorker(): void {
  if (process.env.NODE_ENV !== 'production') return
  if (!('serviceWorker' in navigator)) return

  const swUrl =
    process.env.NODE_ENV === 'production' ? '/service-worker.js' : '/service-worker.dev.js'

  window.addEventListener('load', () => {
    void navigator.serviceWorker.register(swUrl, { scope: '/' }).catch(() => {
      /* non-fatal: app works without offline shell */
    })
  })
}
