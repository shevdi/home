import { apiSlice } from '@/store/api'
import { IPage } from '@/types/page'

export const projectsApi = apiSlice.injectEndpoints({
  endpoints: (build) => ({
    getPage: build.query<IPage, string>({
      query: (name) => `pages/${name}`,
      providesTags() {
        return [{ type: 'Page' as never, id: 'getPage' }]
      }
    }),
  }),
})

export const { useGetPageQuery } = projectsApi
