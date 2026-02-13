import { useSearchParams } from 'react-router'
import { PhotoOrder } from '../types'


interface PhotoSearch {
  dateFrom?: string | null
  dateTo?: string | null
  order?: PhotoOrder
  tags?: string[]
  country?: string[]
  city?: string[]
}

export const useQueryParams = () => {
  const [searchParams, setSearchParams] = useSearchParams()

  // Helper function for updating multiple params
  const setQueryParams = (updates: Record<string, string | string[] | null | undefined>, replace = true) => {
    setSearchParams(
      (searchParams) => {
        Object.entries(updates).forEach(([key, value]) => {
          if (value && value.length > 0) {
            let normalized = value
            if (Array.isArray(value)) {
              normalized = value.join(',')
            }
            searchParams.set(key, normalized.toString())
          } else {
            searchParams.delete(key)
          }
        })
        return searchParams
      },
      { replace },
    )
  }

  const arrayParams = ['tags', 'country', 'city']
  const queryParams = Array.from(searchParams.entries()).reduce((prev, [key, val]) => {
    if (arrayParams.includes(key) && val) {
      return { ...prev, [key]: val.split(',').filter(Boolean) }
    }
    return { ...prev, [key]: val }
  }, {} as Record<string, string | string[]>)

  return {
    stringSearchParams: searchParams.toString(),
    queryParams: queryParams as PhotoSearch,
    setQueryParams,
  }
}
