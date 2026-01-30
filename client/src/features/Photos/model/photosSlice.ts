import { createSlice, PayloadAction } from '@reduxjs/toolkit'

interface PhotosState {
  filter: {
    private: boolean
    dateFrom: string | null
    dateTo: string | null
  }
}

const initialState: PhotosState = {
  filter: {
    private: false,
    dateFrom: null,
    dateTo: null,
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
  },
})

export const { setPrivateFilter, setDateFromFilter, setDateToFilter } = photosSlice.actions
export default photosSlice.reducer
