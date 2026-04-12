export type PerFileOptions = {
  title: string
  priority: number
  private: boolean
  country: string[]
  city: string[]
  tags: string[]
  accessedBy: string[]
}

export const defaultPerFileOptions: PerFileOptions = {
  title: '',
  priority: 0,
  private: false,
  country: [],
  city: [],
  tags: [],
  accessedBy: [],
}

export type MergedView = {
  title: string | undefined
  priority: number | undefined
  private: boolean | undefined
  country: string[]
  city: string[]
  tags: string[]
  accessedBy: string[]
}

function allSame<T>(values: T[], key: (v: T) => unknown): boolean {
  if (values.length === 0) return true
  const first = key(values[0])
  return values.every((v) => key(v) === first)
}

function intersect(arrays: string[][]): string[] {
  if (arrays.length === 0) return []
  const [first, ...rest] = arrays
  return first.filter((item) => rest.every((arr) => arr.includes(item)))
}

export function computeMergedView(
  fileOptions: Map<string, PerFileOptions>,
  selection: Set<string>,
): MergedView {
  const targetIds =
    selection.size > 0 ? [...selection] : [...fileOptions.keys()]
  const values = targetIds
    .map((id) => fileOptions.get(id))
    .filter((v): v is PerFileOptions => v != null)

  if (values.length === 0) {
    return { ...defaultPerFileOptions }
  }

  return {
    title: allSame(values, (v) => v.title) ? values[0].title : undefined,
    priority: allSame(values, (v) => v.priority)
      ? values[0].priority
      : undefined,
    private: allSame(values, (v) => v.private)
      ? values[0].private
      : undefined,
    country: intersect(values.map((v) => v.country)),
    city: intersect(values.map((v) => v.city)),
    tags: intersect(values.map((v) => v.tags)),
    accessedBy: intersect(values.map((v) => v.accessedBy)),
  }
}

export function getTargetIds(
  fileOptions: Map<string, PerFileOptions>,
  selection: Set<string>,
): string[] {
  return selection.size > 0 ? [...selection] : [...fileOptions.keys()]
}
