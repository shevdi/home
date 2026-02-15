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
    locationMatch(countries?: string[], cities?: string[]) {
      const countryList = countries?.map((c) => c.trim()).filter(Boolean) ?? []
      const cityList = cities?.map((c) => c.trim()).filter(Boolean) ?? []
      if (countryList.length === 0 && cityList.length === 0) return this
      const andConditions: MongoFilter[] = []
      if (countryList.length > 0) {
        const countryOrConditions = countryList.flatMap((countryTrim) => [
          { 'location.dadata.country': { $regex: countryTrim, $options: 'i' } },
          { 'location.dadata.country_iso_code': { $regex: countryTrim, $options: 'i' } },
          { 'location.nominatim.address.country': { $regex: countryTrim, $options: 'i' } },
          { 'location.nominatim.address.country_code': { $regex: countryTrim, $options: 'i' } },
        ])
        andConditions.push({ $or: countryOrConditions })
      }
      if (cityList.length > 0) {
        const cityOrConditions = cityList.flatMap((cityTrim) => [
          { 'location.dadata.city': { $regex: cityTrim, $options: 'i' } },
          { 'location.dadata.settlement': { $regex: cityTrim, $options: 'i' } },
          { 'location.nominatim.address.city': { $regex: cityTrim, $options: 'i' } },
          { 'location.nominatim.address.town': { $regex: cityTrim, $options: 'i' } },
          { 'location.nominatim.address.village': { $regex: cityTrim, $options: 'i' } },
          { 'location.nominatim.address.municipality': { $regex: cityTrim, $options: 'i' } },
        ])
        andConditions.push({ $or: cityOrConditions })
      }
      if (andConditions.length > 0) {
        filter.$and = (filter.$and as object[] ?? []).concat(andConditions)
      }
      return this
    },
    build(): MongoFilter {
      return filter
    }
  }
}
