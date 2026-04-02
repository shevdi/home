import styled from 'styled-components'
import { useGetPageQuery } from '../model/pageSlice'
import { useLocation } from 'react-router'
import { Error, Loader } from '@/shared/ui'

interface IPageProps {
  url?: string
}

const PageContainer = styled.div`
  max-width: 640px;
  margin: 0 auto;
`

const LoadingWrap = styled.div`
  display: flex;
  justify-content: center;
  padding: 3rem 1rem;
`

const PageHeader = styled.h1`
  text-align: center;
  font-size: 1.75rem;
  margin: 0 0 1rem;
`

const PageText = styled.div`
  text-align: center;
  line-height: 1.7;
  color: var(--text-color);
  margin-bottom: 1.5rem;
`

const PageLinks = styled.ul`
  list-style: none;
  padding: 0;
  margin: 0;
  display: flex;
  flex-direction: column;
  align-items: center;
  gap: 0.5rem;
`

const PageLink = styled.li`
  text-align: center;

  a {
    color: var(--accent);
    text-decoration: none;
    font-weight: 500;

    &:hover {
      text-decoration: underline;
    }
  }
`

export function Page({ url }: IPageProps) {
  const location = useLocation()
  const pageName = url || location.pathname.split('/')[1]
  const { data, isLoading, refetch } = useGetPageQuery(pageName)

  /** RTK Query keeps last successful `data` when a refetch fails (e.g. offline); do not treat `isError` as fatal if cache exists. */
  if (isLoading && !data) {
    return (
      <PageContainer>
        <LoadingWrap>
          <Loader inline />
        </LoadingWrap>
      </PageContainer>
    )
  }

  if (!data) {
    return (
      <PageContainer>
        <Error
          title="Ошибка"
          message="Не удалось загрузить страницу"
          onRetry={() => {
            void refetch()
          }}
        />
      </PageContainer>
    )
  }

  const { title, text, links } = data
  return (
    <PageContainer>
      <PageHeader>{title}</PageHeader>
      <PageText>{text}</PageText>
      {links && (
        <PageLinks>
          {links.map((item) => (
            <PageLink key={item._id}>
              <a key={item._id} target='_blank' rel='noreferrer' href={item.url}>
                {item.title}
              </a>
            </PageLink>
          ))}
        </PageLinks>
      )}
    </PageContainer>
  )
}
