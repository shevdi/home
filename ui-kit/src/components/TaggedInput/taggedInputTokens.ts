export function addCommittedToken(
  tags: string[],
  raw: string,
  insertAt: 'start' | 'end',
): { next: string[]; duplicate: boolean } {
  const trimmed = raw.trim()
  if (!trimmed) {
    return { next: tags, duplicate: false }
  }
  if (insertAt === 'end') {
    if (tags.includes(trimmed)) {
      return { next: tags, duplicate: true }
    }
    return { next: [...tags, trimmed], duplicate: false }
  }
  return { next: Array.from(new Set([trimmed, ...tags])), duplicate: false }
}

export function splitPaste(text: string): string[] {
  return text
    .split(/[\n,;]+/)
    .map((s) => s.trim())
    .filter(Boolean)
}
