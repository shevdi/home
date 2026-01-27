export const getNeighbours = <T, K>(
  arr: readonly T[] | undefined,
  value: K | undefined,
  getKey: (item: T) => K,
): [T | undefined, T | undefined] => {
  if (!arr || value === undefined) return [undefined, undefined]

  const index = arr.findIndex((item) => getKey(item) === value)
  if (index === -1) return [undefined, undefined]

  return [index > 0 ? arr[index - 1] : undefined, index < arr.length - 1 ? arr[index + 1] : undefined]
}

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
