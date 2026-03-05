import { useSearchParams } from 'react-router'
import { photoSearchParamsSchema } from '@shevdi-home/shared'

export type PhotoSearch = import('@shevdi-home/shared').PhotoSearchParams

const DEFAULT_PARAMS = {
  page: 1,
  dateFrom: undefined as string | undefined,
  dateTo: undefined as string | undefined,
  order: undefined as import('@shevdi-home/shared').PhotoOrder | undefined,
  tags: [] as string[],
  country: [] as string[],
  city: [] as string[],
}

function parsePhotoSearch(raw: Record<string, string | string[]>): PhotoSearch {
  const result = photoSearchParamsSchema.safeParse(raw)
  return result.success ? result.data : DEFAULT_PARAMS
}

export const useQueryParams = () => {
  const [searchParams, setSearchParams] = useSearchParams()

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
  const queryParams = Array.from(searchParams.entries()).reduce<Record<string, string | string[]>>(
    (prev, [key, val]) => {
      if (arrayParams.includes(key) && val) {
        return { ...prev, [key]: val.split(',').filter(Boolean) }
      }
      return { ...prev, [key]: val }
    },
    {},
  )

  return {
    stringSearchParams: searchParams.toString(),
    queryParams: parsePhotoSearch(queryParams),
    setQueryParams,
  }
}
