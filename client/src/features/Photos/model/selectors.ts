import { RootState } from '@/app/store/store'

export const selectFilter = (state: RootState) => state.photos.filter
export const selectSearch = (state: RootState) => state.photos.search
