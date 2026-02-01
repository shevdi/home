
export const normalizeTags = (value: unknown): string[] | undefined => {
  if (value === undefined || value === null) return undefined
  if (Array.isArray(value)) {
    return value.map(String).map((tag) => tag.trim()).filter(Boolean)
  }
  if (typeof value === 'string') {
    const raw = value.trim()
    if (!raw) return []
    try {
      const parsed = JSON.parse(raw)
      if (Array.isArray(parsed)) {
        return parsed.map(String).map((tag) => tag.trim()).filter(Boolean)
      }
    } catch {
      // fall through to comma split
    }
    return raw.split(',').map((tag) => tag.trim()).filter(Boolean)
  }
  return undefined
}
