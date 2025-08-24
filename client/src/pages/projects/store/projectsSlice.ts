import { IPage } from '@/types/page'
import { apiSlice } from '@/store/api'
import { IProject } from '@/types/project'

export const projectsApi = apiSlice.injectEndpoints({
  endpoints: (build) => ({
    getProjectsPage: build.query<IPage[], void>({
      query: () => `pages/projects`,
      providesTags(result, error, id) {
        console.log('tags', result, error, id)
        return [{ type: 'Page' as never, id: 'getProjectsPage' }]
      }
    }),
    getProjectsList: build.query<IProject[], void>({
      query: () => `projects`,
    }),
  }),
})

export const { useGetProjectsPageQuery, useGetProjectsListQuery } = projectsApi
