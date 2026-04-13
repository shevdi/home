function hasData(obj: object): obj is { data: unknown } {
  return 'data' in obj
}

function hasMessage(obj: object): obj is { message: unknown } {
  return 'message' in obj
}

function nestedDataMessage(data: unknown): string | null {
  if (data && typeof data === 'object' && hasMessage(data)) {
    const m = (data as { message: unknown }).message
    if (m == null) return null
    const s = String(m)
    return s ? s : null
  }
  return null
}

/** RTK Query fetchBaseQuery errors include `status` plus JSON body under `data.message`. */
function isRtkFetchError(obj: object): boolean {
  if (!('status' in obj)) return false
  const status = (obj as { status: unknown }).status
  return typeof status === 'number' || typeof status === 'string'
}

export const getErrorMessage = (error: unknown): string => {
  let message = 'Неизвестная ошибка'
  if (error instanceof Error) {
    message = error.message
  } else if (error && typeof error === 'object') {
    const nested = hasData(error) ? nestedDataMessage(error.data) : null
    if (isRtkFetchError(error) && nested) {
      message = nested
    } else if (hasMessage(error)) {
      message = String(error.message)
    } else if (hasData(error) && nested) {
      message = nested
    }
  } else if (typeof error === 'string') {
    message = error
  }

  return message
}
