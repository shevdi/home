import { RootState } from '@/app/store/store'

export const selectAuth = (state: RootState) => state.auth

export const selectCurrentToken = (state: RootState) => state.auth.token
