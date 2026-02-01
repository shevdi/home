import { createSlice, PayloadAction } from '@reduxjs/toolkit'

interface PhotosState {
  filter: {
    private: boolean
    dateFrom: string | null
    dateTo: string | null
    order: 'orderDownByTakenAt' | 'orderUpByTakenAt' | 'orderDownByEdited'
    tags: string[]
  }
}

const initialState: PhotosState = {
  filter: {
    private: false,
    dateFrom: null,
    dateTo: null,
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
    setDateFromFilter: (state, action: PayloadAction<string | null>) => {
      state.filter.dateFrom = action.payload
    },
    setDateToFilter: (state, action: PayloadAction<string | null>) => {
      state.filter.dateTo = action.payload
    },
    setOrderFilter: (
      state,
      action: PayloadAction<'orderDownByTakenAt' | 'orderUpByTakenAt' | 'orderDownByEdited'>,
    ) => {
      state.filter.order = action.payload
    },
    setTagsFilter: (state, action: PayloadAction<string[]>) => {
      state.filter.tags = action.payload
    },
  },
})

export const { setPrivateFilter, setDateFromFilter, setDateToFilter, setOrderFilter, setTagsFilter } = photosSlice.actions
export default photosSlice.reducer
