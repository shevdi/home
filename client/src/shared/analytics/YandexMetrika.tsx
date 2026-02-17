import { useEffect, useRef } from 'react'
import { useLocation } from 'react-router'

const counterId = Number(process.env.YANDEX_METRIKA_ID) || 0

function loadScript(id: number): Promise<void> {
  return new Promise((resolve) => {
    if (window.ym) {
      resolve()
      return
    }
    const script = document.createElement('script')
    script.src = `https://mc.yandex.ru/metrika/tag.js?id=${id}`
    script.async = true
    script.onload = () => resolve()
    document.head.appendChild(script)
  })
}

export function YandexMetrika() {
  const location = useLocation()
  const initialized = useRef(false)

  useEffect(() => {
    if (!counterId) return

    loadScript(counterId).then(() => {
      if (!window.ym) return

      if (!initialized.current) {
        window.ym(counterId, 'init', {
          defer: true,
          clickmap: true,
          trackLinks: true,
          accurateTrackBounce: true,
          webvisor: true,
        })
        initialized.current = true
      }

      window.ym(counterId, 'hit', window.location.href, {
        title: document.title,
      })
    })
  }, [location.pathname, location.search])

  return null
}
