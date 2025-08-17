import { createSlice } from '@reduxjs/toolkit'

import { IConfig } from '../../../types/config'

const initialState: IConfig = { theme: 'light' }

const themetSlice = createSlice({
  name: 'theme',
  initialState,
  reducers: {
    changeTheme: (state) => {
      return {
        theme: state.theme === 'dark' ? 'light' : 'dark',
      }
    },
  },
})

export const { changeTheme } = themetSlice.actions
export default themetSlice.reducer
