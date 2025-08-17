import { createApi, fetchBaseQuery } from '@reduxjs/toolkit/query/react'
import { IWelcome } from '@/types/welcome'

export const welcomeApi = createApi({
  reducerPath: 'welcomeApi',
  baseQuery: fetchBaseQuery({ baseUrl: `${process.env.BACKEND_URL}` }),
  endpoints: (build) => ({
    getWelcomePage: build.query<IWelcome, void>({
      query: () => 'title',
    }),
  }),
})

export const { useGetWelcomePageQuery } = welcomeApi