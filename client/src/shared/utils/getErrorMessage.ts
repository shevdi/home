export const getErrorMessage = (error: unknown): string => {
  let message = 'Неизвестная ошибка'
  if (error instanceof Error) {
    message = error.message
  } else if (error && typeof error === 'object' && 'message' in error) {
    message = String(error.message)
  } else if (error && typeof error === 'object' && 'data' in error) {
    const data = (error as { data?: unknown }).data
    if (data && typeof data === 'object' && 'message' in data) {
      message = String(data.message)
    }
  } else if (typeof error === 'string') {
    message = error
  }

  return message
}
