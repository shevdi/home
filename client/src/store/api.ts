import { useGetProjectsPageQuery } from '@/pages/projects/store/projectsSlice'
import { createSlice } from '@reduxjs/toolkit'
import { createApi, fetchBaseQuery } from '@reduxjs/toolkit/query/react'

export const apiSlice = createApi({
  reducerPath: 'api',
  baseQuery: fetchBaseQuery({ baseUrl: `${process.env.BACKEND_URL}` }),
  tagTypes: ['Page'],
  endpoints: (build) => ({
  }),
})

export const { } = apiSlice
