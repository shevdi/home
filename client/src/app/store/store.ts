import { configureStore } from "@reduxjs/toolkit";
import { themeReducer } from "@/features/ThemeSwitch";
import { pagesSlice } from "@/features/Page";
import { authReducer } from "@/features";
import { apiSlice } from './api'

export const store = configureStore({
  reducer: {
    config: themeReducer,
    page: pagesSlice.reducer,
    auth: authReducer,
    [apiSlice.reducerPath]: apiSlice.reducer,
  },
  middleware: (getDefaultMiddleware) =>
    getDefaultMiddleware().concat(apiSlice.middleware),
});

export type RootState = ReturnType<typeof store.getState>;
export type AppDispatch = typeof store.dispatch;
