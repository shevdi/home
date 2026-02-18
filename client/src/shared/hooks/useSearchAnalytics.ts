import { useEffect } from 'react'
import { reachGoal } from '@/shared/analytics'
import type { PhotoOrder } from '@/shared/types'

interface SearchParams {
  dateFrom?: string
  dateTo?: string
  order?: PhotoOrder
  tags?: string[]
  country?: string[]
  city?: string[]
}

const DEFAULT_ORDER = 'orderDownByTakenAt'

export function useSearchAnalytics(search: SearchParams) {
  useEffect(() => {
    const hasParams =
      search.dateFrom ||
      search.dateTo ||
      (search.order && search.order !== DEFAULT_ORDER) ||
      (search.tags?.length ?? 0) > 0 ||
      (search.country?.length ?? 0) > 0 ||
      (search.city?.length ?? 0) > 0

    if (hasParams) {
      const params: Record<string, string | string[]> = {}
      if (search.dateFrom) params.dateFrom = search.dateFrom
      if (search.dateTo) params.dateTo = search.dateTo
      if (search.order && search.order !== DEFAULT_ORDER) params.order = search.order
      if (search.tags?.length) params.tags = search.tags
      if (search.country?.length) params.country = search.country
      if (search.city?.length) params.city = search.city
      reachGoal('photos_search', params)
    }
  }, [search.dateFrom, search.dateTo, search.order, search.tags, search.country, search.city])
}
