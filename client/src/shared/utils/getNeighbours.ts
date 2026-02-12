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
