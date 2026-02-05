import { useCallback, useMemo } from 'react'
import { useSelector } from 'react-redux'
import { useSearchParams } from 'react-router'
import { selectSearch } from '@/features/Photos'

export const usePhotoSearchParams = () => {
  const { dateFrom, dateTo, order, tags = [] } = useSelector(selectSearch)
  const [searchParams, setSearchParams] = useSearchParams()

  const photoSearchParams = useMemo(() => {
    const params = new URLSearchParams()
    if (dateFrom) {
      params.set('dateFrom', dateFrom)
    }
    if (dateTo) {
      params.set('dateTo', dateTo)
    }
    if (order) {
      params.set('order', order)
    }
    if (tags.length > 0) {
      params.set('tags', tags.join(','))
    }
    const queryString = params.toString()
    return queryString ? `?${queryString}` : ''
  }, [dateFrom, dateTo, order, tags])

  const setPhotoSearchParams = useCallback(
    (next: { dateFrom: string | null; dateTo: string | null; order: string; tags: string[] }) => {
      const params = new URLSearchParams()
      if (next.dateFrom) {
        params.set('dateFrom', next.dateFrom)
      }
      if (next.dateTo) {
        params.set('dateTo', next.dateTo)
      }
      if (next.order) {
        params.set('order', next.order)
      }
      if (next.tags.length > 0) {
        params.set('tags', next.tags.join(','))
      }
      setSearchParams(params)
    },
    [setSearchParams],
  )

  return { photoSearchParams, searchParams, setPhotoSearchParams }
}
