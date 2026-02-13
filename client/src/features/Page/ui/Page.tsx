import styled from 'styled-components'
import { useGetPageQuery } from '../model/pageSlice'
import { useLocation } from 'react-router'

interface IPageProps {
  url?: string
}

const PageContainer = styled.div`
  max-width: 640px;
  margin: 0 auto;
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
  const { data: { title, text, links } = {} } = useGetPageQuery(url || location.pathname.split('/')[1])
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
