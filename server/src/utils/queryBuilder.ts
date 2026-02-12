export type MongoFilter = Record<string, unknown>

type ArrayNormalizer = (value: unknown) => string[] | undefined

const defaultArrayNormalizer: ArrayNormalizer = (v) =>
  Array.isArray(v) ? v.map(String).filter(Boolean) : undefined

export const queryBuilder = () => {
  const filter: MongoFilter = {}
  return {
    excludeWhere(field: string, value: unknown) {
      filter.$nor = (filter.$nor as object[] ?? []).concat({ [field]: value })
      return this
    },
    dateRange(field: string, dateFrom?: string, dateTo?: string) {
      const from = dateFrom?.trim() || undefined
      const to = dateTo?.trim() || undefined
      if (from || to) {
        const range: Record<string, string> = {}
        // TODO make search by proper date
        if (from) range.$gte = `${from}T00:00:00Z`
        if (to) range.$lte = `${to}T59:59:59Z`
        filter[field] = range
      }
      return this
    },
    allIn(field: string, raw: unknown, normalizer: ArrayNormalizer = defaultArrayNormalizer) {
      const values = normalizer(raw) ?? []
      if (values.length > 0) {
        filter[field] = { $all: values }
      }
      return this
    },
    build(): MongoFilter {
      return filter
    }
  }
}
