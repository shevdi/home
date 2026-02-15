import { RootState } from '@/app/store/store'
import { photosApiSlice } from './photosApiSlice'

export const selectFilter = (state: RootState) => state.photos.filter
export const selectSearch = (state: RootState) => state.photos.search
export const selectSearchOrder = (state: RootState) => state.photos.search.order
export const selectSearchDateFrom = (state: RootState) => state.photos.search.dateFrom
export const selectSearchDateTo = (state: RootState) => state.photos.search.dateTo
export const selectSearchTags = (state: RootState) => state.photos.search.tags
export const selectSearchCountry = (state: RootState) => state.photos.search.country
export const selectSearchCity = (state: RootState) => state.photos.search.city
export const selectIsInitializedInfiniteQuery = (state: RootState) => {
  const search = selectSearch(state)
  const queryState = photosApiSlice.endpoints.getInfinitePhotoWithMax.select(search)(state)
  return queryState?.status !== 'uninitialized'
}
