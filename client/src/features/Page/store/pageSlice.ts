import { apiSlice } from '@/store/api'
import { IPage } from '@/types/page'

export const pagesSlice = apiSlice.injectEndpoints({
  endpoints: (build) => ({
    getPage: build.query<IPage, string>({
      query: (name) => `pages/${name}`,
      providesTags() {
        return [{ type: 'Page' as never, id: 'getPage' }]
      }
    }),
    changePage: build.mutation<IPage, { name: string; data: Partial<IPage> }>({
      query: ({ name, data }) => ({
        url: `pages/${name}`,
        method: 'PUT',
        body: data
      }),
      invalidatesTags: [{ type: 'Page' as never, id: 'getPage' }]
    })
  }),
})

export const { useGetPageQuery, useChangePageMutation } = pagesSlice
