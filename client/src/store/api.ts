import { createApi, fetchBaseQuery } from '@reduxjs/toolkit/query/react'

/*eslint no-empty-pattern: ["error", { "allowObjectPatternsAsParameters": true }]*/
export const apiSlice = createApi({
  reducerPath: 'api',
  baseQuery: fetchBaseQuery({ baseUrl: `${process.env.BACKEND_URL}` }),
  tagTypes: ['Page'],
  endpoints: () => ({}),
})
