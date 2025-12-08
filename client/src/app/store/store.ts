import { configureStore } from "@reduxjs/toolkit";
import { themeReducer } from "@/features/ThemeSwitch";
import { pagesSlice } from "@/features/Page";
import { authReducer, authApiSlice } from "@/features/Auth";

export const store = configureStore({
  reducer: {
    config: themeReducer,
    page: pagesSlice.reducer,
    auth: authReducer,
    [authApiSlice.reducerPath]: authApiSlice.reducer,
  },
  middleware: (getDefaultMiddleware) =>
    getDefaultMiddleware().concat(authApiSlice.middleware),
});

export type RootState = ReturnType<typeof store.getState>;
export type AppDispatch = typeof store.dispatch;
