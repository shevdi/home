/**
 * Ждёт появления window.ym (до 5 сек). Для вызова из reachGoal.
 */
function waitForYm(): Promise<boolean> {
  if (window.ym) return Promise.resolve(true)
  return new Promise((resolve) => {
    const deadline = Date.now() + 5000
    const check = () => {
      if (window.ym) {
        resolve(true)
        return
      }
      if (Date.now() > deadline) {
        resolve(false)
        return
      }
      setTimeout(check, 100)
    }
    check()
  })
}

/**
 * Отправка достижения цели в Яндекс Метрику.
 * Используйте для событий без смены URL (клики, отправка форм и т.д.)
 * Ждёт загрузки скрипта Метрики до 5 сек.
 */
export function reachGoal(goalName: string, params?: Record<string, unknown>) {
  const counterId = Number(process.env.YANDEX_METRIKA_ID) || 0
  if (!counterId) return

  const send = () => {
    if (!window.ym) return false
    if (params) {
      window.ym(counterId, 'reachGoal', goalName, params)
    } else {
      window.ym(counterId, 'reachGoal', goalName)
    }
    return true
  }

  if (send()) return

  waitForYm().then((ready) => {
    if (ready) send()
  })
}
