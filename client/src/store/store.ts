import { configureStore } from "@reduxjs/toolkit";
import themeSlice from "../features/ThemeSwitch/store/themeSlice";
import formReducer from '../features/form/formSlice';
import { pagesSlice } from "../features/Page/store/pageSlice";
import { authSlice } from "@/features/Auth/store/authSlice";
import { authApiSlice } from "@/features/Auth/store/authApiSlice";

export const store = configureStore({
  reducer: {
    config: themeSlice,
    form: formReducer,
    page: pagesSlice.reducer,
    auth: authSlice.reducer,
    [authApiSlice.reducerPath]: authApiSlice.reducer,
  },
  middleware: (getDefaultMiddleware) =>
    getDefaultMiddleware().concat(authApiSlice.middleware),
});

export type RootState = ReturnType<typeof store.getState>;
export type AppDispatch = typeof store.dispatch;