import { configureStore } from "@reduxjs/toolkit";
import { themeReducer } from "@/features/ThemeSwitch/model";
import { pagesSlice } from "@/features/Page/model";
import { authReducer } from "@/features/Auth/model";
import { photosReducer, uploadReducer } from "@/features/Photos/model";
import { apiSlice } from './api'

export const store = configureStore({
  reducer: {
    config: themeReducer,
    page: pagesSlice.reducer,
    auth: authReducer,
    photos: photosReducer,
    upload: uploadReducer,
    [apiSlice.reducerPath]: apiSlice.reducer,
  },
  middleware: (getDefaultMiddleware) =>
    getDefaultMiddleware().concat(apiSlice.middleware),
});

export type RootState = ReturnType<typeof store.getState>;
export type AppDispatch = typeof store.dispatch;
