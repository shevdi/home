/**
 * Отправка достижения цели в Яндекс Метрику.
 * Используйте для событий без смены URL (клики, отправка форм и т.д.)
 */
export function reachGoal(goalName: string, params?: Record<string, unknown>) {
  const counterId = Number(process.env.YANDEX_METRIKA_ID) || 0
  if (!counterId || !window.ym) return

  if (params) {
    window.ym(counterId, 'reachGoal', goalName, params)
  } else {
    window.ym(counterId, 'reachGoal', goalName)
  }
}
