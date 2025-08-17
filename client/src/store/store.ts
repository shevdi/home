import type { Action, ThunkAction } from "@reduxjs/toolkit"
import { combineSlices, configureStore } from "@reduxjs/toolkit"
import { setupListeners } from "@reduxjs/toolkit/query"
import themeSlice from "@/features/ThemeSwitch/store/themeSlice"
import { welcomeApi } from '@/pages/welcome/store/welcomeSlice'

console.log('welcomeApi', welcomeApi)

const rootReducer = combineSlices({
  config: themeSlice,
  [welcomeApi.reducerPath]: welcomeApi.reducer
})
export type RootState = ReturnType<typeof rootReducer>

export const makeStore = (preloadedState?: Partial<RootState>) => {
  const store = configureStore({
    reducer: rootReducer,
    preloadedState,
    middleware: (getDefaultMiddleware) =>
      getDefaultMiddleware().concat(welcomeApi.middleware),
  })
  setupListeners(store.dispatch)
  return store
}

export const store = makeStore()

export type AppStore = typeof store
export type AppDispatch = AppStore["dispatch"]
export type AppThunk<ThunkReturnType = void> = ThunkAction<
  ThunkReturnType,
  RootState,
  unknown,
  Action
>
