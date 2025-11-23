import { createSlice } from '@reduxjs/toolkit'

const storageConfig = localStorage.getItem('config')

const initialState = storageConfig
  ? JSON.parse(storageConfig)
  : {
      theme: 'light',
    }

const themetSlice = createSlice({
  name: 'theme',
  initialState,
  reducers: {
    changeTheme: (state) => {
      const theme = state.theme === 'dark' ? 'light' : 'dark'
      return {
        theme,
      }
    },
  },
})

export const { changeTheme } = themetSlice.actions
export default themetSlice.reducer
