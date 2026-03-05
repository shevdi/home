import type { PhotoSearchParams } from '@shevdi-home/shared'

/** Input for buildSearchParams - accepts partial search with optional null for dates */
export type BuildSearchParamsInput = Partial<Omit<PhotoSearchParams, 'dateFrom' | 'dateTo'>> & {
  dateFrom?: string
  dateTo?: string
}

export const buildSearchParams = (search?: BuildSearchParamsInput | void, pageParam?: number) => {
  const params = new URLSearchParams()
  if (pageParam !== undefined) {
    params.append('page', pageParam.toString())
  }
  if (search?.dateFrom) {
    params.append('dateFrom', search.dateFrom)
  }
  if (search?.dateTo) {
    params.append('dateTo', search.dateTo)
  }
  if (search?.order) {
    params.append('order', search.order)
  }
  if (search?.tags && search.tags.length > 0) {
    params.append('tags', search.tags.join(','))
  }
  if (search?.country && search.country.length > 0) {
    params.append('country', search.country.join(','))
  }
  if (search?.city && search.city.length > 0) {
    params.append('city', search.city.join(','))
  }
  return params.toString()
}
