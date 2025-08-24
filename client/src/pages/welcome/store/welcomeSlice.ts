import { IPage } from '@/types/page'
import { apiSlice } from '@/store/api'

export const welcomeApi = apiSlice.injectEndpoints({
  endpoints: (build) => ({
    getWelcomePage: build.query<IPage, void>({
      query: () => `pages/welcome`,
      providesTags() {
        return [{ type: 'Page' as never, id: 'welcomePage' }]
      }
    }),
  }),
})

export const { useGetWelcomePageQuery } = welcomeApi
