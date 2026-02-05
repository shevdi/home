import { RootState } from '@/app/store/store'
import { photosApiSlice } from './photosApiSlice'

export const selectFilter = (state: RootState) => state.photos.filter
export const selectSearch = (state: RootState) => state.photos.search
export const selectIsInitializedInfiniteQuery = (state: RootState) => {
  const search = selectSearch(state)
  const queryState = photosApiSlice.endpoints.getInfinitePhotoWithMax.select(search)(state)
  return queryState?.status !== 'uninitialized'
}
