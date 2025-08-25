import { useGetProjectsListQuery, useGetProjectsPageQuery } from './store/projectsSlice'
import { IProject } from '@/types/project'
import { useQueries } from '@/hooks'

export function ProjectsPage() {
  const queries = useQueries([useGetProjectsListQuery, useGetProjectsPageQuery])
  console.log('rrr', queries)
  const {
    data: [getProjectsListData, getProjectsPageData],
  } = queries
  return (
    <div>
      <h1>{getProjectsPageData?.title}</h1>
      <div></div>
      {getProjectsListData &&
        getProjectsListData.map((item: IProject) => (
          <div key={item._id}>
            <a target='_blank' rel='noreferrer' href={item.url}>
              {item.title}
            </a>
          </div>
        ))}
    </div>
  )
}
