import { useSearchParams } from 'react-router'
import { PhotoOrder } from '../types'


interface PhotoSearch {
  dateFrom?: string | null
  dateTo?: string | null
  order?: PhotoOrder
  tags?: string[]
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

  const queryParams = Array.from(searchParams.entries()).reduce((prev, value) => {
    if (value[0] === 'tags') {
      if (!value[1]) {
        return []
      }
      return { ...prev, [value[0]]: value[1].split(',') }
      return value[1].split(',')
    }
    return { ...prev, [value[0]]: value[1] }
  }, {})

  return {
    stringSearchParams: searchParams.toString(),
    queryParams: queryParams as PhotoSearch,
    setQueryParams,
  }
}
