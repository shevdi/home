import styled from 'styled-components'
import { useGetPageQuery } from '../model/pageSlice'
import { useLocation } from 'react-router'

interface IPageProps {
  url?: string
}

const PageContainer = styled.div``

const PageHeader = styled.h1`
  text-align: center;
`

const PageText = styled.div`
  text-align: center;
`

const PageLinks = styled.ul`
  list-style: none;
  padding: 0;
`

const PageLink = styled.li`
  text-align: center;
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
