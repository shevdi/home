import { createSlice, PayloadAction } from '@reduxjs/toolkit'

interface PhotosState {
  filter: {
    private: boolean
  }
}

const initialState: PhotosState = {
  filter: {
    private: false,
  },
}

const photosSlice = createSlice({
  name: 'photos',
  initialState,
  reducers: {
    setPrivateFilter: (state, action: PayloadAction<boolean>) => {
      state.filter.private = action.payload
    },
  },
})

export const { setPrivateFilter } = photosSlice.actions
export default photosSlice.reducer
