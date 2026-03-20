import { useEffect, useRef } from 'react'
import { useLocation } from 'react-router'

const SCRIPT_URL = 'https://mc.yandex.ru/metrika/tag.js'

function loadScript(): void {
  if (typeof document === 'undefined') return
  for (let j = 0; j < document.scripts.length; j++) {
    if (document.scripts[j].src === SCRIPT_URL) return
  }
  const script = document.createElement('script')
  script.async = true
  script.src = SCRIPT_URL
  const first = document.getElementsByTagName('script')[0]
  first?.parentNode?.insertBefore(script, first)
}

export function YandexMetrika() {
  const location = useLocation()
  const prevUrlRef = useRef<string | null>(null)

  const counterId = Number(process.env.YANDEX_METRIKA_ID) || 0

  useEffect(() => {
    if (!counterId) return

    // Initialize dataLayer for ecommerce
    if (typeof window !== 'undefined') {
      ;(window as Window & { dataLayer?: unknown[] }).dataLayer =
        (window as Window & { dataLayer?: unknown[] }).dataLayer || []
    }

    // Load script and init queue
    ;(window as Window & { ym?: (id: number, method: string, ...args: unknown[]) => void }).ym =
      (window as Window & { ym?: (id: number, method: string, ...args: unknown[]) => void }).ym ||
      function (...args: unknown[]) {
        ;((window as Window & { ym?: { a?: unknown[] } }).ym as { a?: unknown[] }).a =
          ((window as Window & { ym?: { a?: unknown[] } }).ym as { a?: unknown[] }).a || []
        ;((window as Window & { ym?: { a?: unknown[] } }).ym as { a?: unknown[] }).a!.push(args)
      }
    ;(window as Window & { ym?: { a?: unknown[] } }).ym!.a = []
    ;(window as Window & { ym?: { l?: number } }).ym!.l = Date.now()

    loadScript()

    window.ym?.(counterId, 'init', {
      defer: true,
      webvisor: true,
      clickmap: true,
      trackLinks: true,
      accurateTrackBounce: true,
      ecommerce: 'dataLayer',
      referrer: document.referrer,
      url: window.location.href,
    })

    const url = location.pathname + location.search
    prevUrlRef.current = url
    window.ym?.(counterId, 'hit', url)
    // eslint-disable-next-line react-hooks/exhaustive-deps -- init only on mount
  }, [counterId])

  useEffect(() => {
    if (!counterId || !window.ym) return

    const url = location.pathname + location.search
    if (prevUrlRef.current !== url) {
      prevUrlRef.current = url
      window.ym(counterId, 'hit', url)
    }
  }, [counterId, location.pathname, location.search])

  return null
}
