import { createSlice, PayloadAction } from '@reduxjs/toolkit'

interface PhotosState {
  filter: {
    private: boolean
  }
  search: {
    dateFrom: string | null
    dateTo: string | null
    order: 'orderDownByTakenAt' | 'orderUpByTakenAt' | 'orderDownByEdited'
    tags: string[]
  }
}

const initialState: PhotosState = {
  filter: {
    private: false,
  },
  search: {
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
    setDateFromSearch: (state, action: PayloadAction<string | null>) => {
      state.search.dateFrom = action.payload
    },
    setDateToSearch: (state, action: PayloadAction<string | null>) => {
      state.search.dateTo = action.payload
    },
    setOrderSearch: (
      state,
      action: PayloadAction<'orderDownByTakenAt' | 'orderUpByTakenAt' | 'orderDownByEdited'>,
    ) => {
      state.search.order = action.payload
    },
    setTagsSearch: (state, action: PayloadAction<string[]>) => {
      state.search.tags = action.payload
    },
  },
})

export const { setPrivateFilter, setDateFromSearch, setDateToSearch, setOrderSearch, setTagsSearch } = photosSlice.actions
export default photosSlice.reducer
