import { setCredentials } from '@/features/Auth/model/authSlice';
import { createApi, fetchBaseQuery } from '@reduxjs/toolkit/query/react'

const baseQuery = fetchBaseQuery({
  baseUrl: `${process.env.BACKEND_URL}`,
  mode: "cors",
  credentials: "include",
  prepareHeaders: (headers, { getState }) => {
    /* eslint @typescript-eslint/no-explicit-any: "off" */
    const token = (getState() as any).auth?.token;
    if (token) {
      headers.set('authorization', `Bearer ${token}`);
    }
    return headers;
  },
})

const baseQueryWithReauth = async (args: any, api: any, extraOptions: any) => {

  let result = await baseQuery(args, api, extraOptions)

  if (result?.error?.status === 403) {
    console.log('sending refresh token')

    const refreshResult = await baseQuery('/auth/refresh', api, extraOptions)

    if (refreshResult?.data) {
      api.dispatch(setCredentials({ ...refreshResult.data }))
      result = await baseQuery(args, api, extraOptions)
    } else {
      if (refreshResult?.error?.status === 403) {
        (refreshResult.error as any).data.message = 'Ваш токен истек'
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
