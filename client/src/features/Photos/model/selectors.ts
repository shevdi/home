import { RootState } from '@/app/store/store'

export const selectFilters = (state: RootState) => state.photos.filter
