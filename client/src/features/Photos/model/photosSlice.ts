import { createSlice, PayloadAction } from '@reduxjs/toolkit'
import { PhotoOrder } from '@/shared/types'

interface PhotosState {
  filter: {
    private: boolean
  }
  search: {
    dateFrom: string
    dateTo: string
    order: PhotoOrder
    tags: string[]
  }
}

const initialState: PhotosState = {
  filter: {
    private: false,
  },
  search: {
    dateFrom: '',
    dateTo: '',
    order: 'orderDownByTakenAt',
    tags: [],
  },
}

const photosSlice = createSlice({
  name: 'photos',
  initialState,
  reducers: {
    setPrivateFilter: (state, action: PayloadAction<boolean>) => {
      state.filter.private = action.payload
    },
    setSearch: (
      state,
      action: PayloadAction<{ dateFrom: string; dateTo: string; order: PhotoOrder; tags: string[] }>,
    ) => {
      state.search = action.payload
    },
    setDateFromSearch: (state, action: PayloadAction<string>) => {
      state.search.dateFrom = action.payload
    },
    setDateToSearch: (state, action: PayloadAction<string>) => {
      state.search.dateTo = action.payload
    },
    setOrderSearch: (
      state,
      action: PayloadAction<PhotoOrder>,
    ) => {
      state.search.order = action.payload
    },
    setTagsSearch: (state, action: PayloadAction<string[]>) => {
      state.search.tags = action.payload
    },
  },
})

export const { setPrivateFilter, setSearch, setDateFromSearch, setDateToSearch, setOrderSearch, setTagsSearch } =
  photosSlice.actions
export default photosSlice.reducer
