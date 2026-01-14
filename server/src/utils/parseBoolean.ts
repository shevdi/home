/**
 * Parses a boolean value from a query parameter string
 * @param value - The string value from the query parameter (e.g., "true", "false", undefined)
 * @returns true if value is "true", false if value is "false", undefined otherwise
 */
export function parseBoolean(value: string | undefined): boolean | undefined {
  if (value === undefined || value === null) {
    return undefined
  }
  if (value.toLowerCase() === 'true') {
    return true
  }
  if (value.toLowerCase() === 'false') {
    return false
  }
  return undefined
}
