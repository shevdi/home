import { RootState } from 'src/store/store'

export const selectTheme = (state: RootState) => state.config.theme
