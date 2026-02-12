import { createSlice } from '@reduxjs/toolkit'

interface AuthState {
  token: string | null
}

const initialState: AuthState = { token: null }

export const authSlice = createSlice({
  name: 'auth',
  initialState,
  reducers: {
    setCredentials: (state, action) => {
      const { accessToken } = action.payload
      state.token = accessToken
    },
    logOut: (state) => {
      state.token = null
    },
  }
})

export const { setCredentials, logOut } = authSlice.actions

export default authSlice.reducer
