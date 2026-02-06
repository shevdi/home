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
  console.log('searchParams', searchParams)
  console.log('searchParams', searchParams.entries())

  // Helper function for updating multiple params
  const setQueryParams = (updates: Record<string, string | string[] | null | undefined>, replace = true) => {
    setSearchParams(
      (searchParams) => {
        Object.entries(updates).forEach(([key, value]) => {
          if (value) {
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

  const queryParams = Array.from(searchParams.entries()).reduce((prev, value) => ({ ...prev, [value[0]]: value[0] === 'tags' ? value[1].split(',') : value[1] }), {})

  return {
    stringSearchParams: searchParams.toString(),
    queryParams: queryParams as PhotoSearch,
    setQueryParams,
  }
}
