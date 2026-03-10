import { setCredentials } from '@/features/Auth/model/authSlice';
import { createApi, fetchBaseQuery } from '@reduxjs/toolkit/query/react'
import type { BaseQueryFn, BaseQueryApi } from '@reduxjs/toolkit/query'
import type { RootState } from './store'
import { getBackendUrl } from '@/shared/utils/getBackendUrl'

const baseQuery = fetchBaseQuery({
  baseUrl: getBackendUrl(),
  mode: "cors",
  credentials: "include",
  cache: "no-store",
  prepareHeaders: (headers, { getState }) => {
    const token = (getState() as RootState).auth?.token;
    if (token) {
      headers.set('authorization', `Bearer ${token}`);
    }
    return headers;
  },
})

const baseQueryWithReauth: BaseQueryFn = async (args, api, extraOptions) => {
  let result = await baseQuery(args, api as BaseQueryApi, extraOptions)

  if (result?.error?.status === 403) {
    const refreshResult = await baseQuery('/auth/refresh', api as BaseQueryApi, extraOptions)

    if (refreshResult?.data) {
      api.dispatch(setCredentials({ ...refreshResult.data }))
      result = await baseQuery(args, api as BaseQueryApi, extraOptions)
    } else {
      if (refreshResult?.error?.status === 403) {
        const err = refreshResult.error as { data?: { message?: string } };
        if (err?.data) err.data.message = 'Ваш токен истек'
      }
      return refreshResult
    }
  }

  return result
}

export const apiSlice = createApi({
  reducerPath: 'api',
  baseQuery: baseQueryWithReauth,
  tagTypes: ['Page', 'Photos'],
  endpoints: () => ({}),
})

export default apiSlice.reducer
