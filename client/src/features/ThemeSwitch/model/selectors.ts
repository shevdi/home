import { RootState } from '@/app/store/store'

export const selectTheme = (state: RootState) => state.config.theme
