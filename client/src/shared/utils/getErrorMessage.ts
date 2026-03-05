function hasData(obj: object): obj is { data: unknown } {
  return 'data' in obj
}

function hasMessage(obj: object): obj is { message: unknown } {
  return 'message' in obj
}

export const getErrorMessage = (error: unknown): string => {
  let message = 'Неизвестная ошибка'
  if (error instanceof Error) {
    message = error.message
  } else if (error && typeof error === 'object' && hasMessage(error)) {
    message = String(error.message)
  } else if (error && typeof error === 'object' && hasData(error)) {
    const data = error.data
    if (data && typeof data === 'object' && hasMessage(data)) {
      message = String(data.message)
    }
  } else if (typeof error === 'string') {
    message = error
  }

  return message
}
