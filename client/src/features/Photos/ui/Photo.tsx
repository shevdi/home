import styled from 'styled-components'
import { useGetPhotoQuery } from '../model'
import { useLocation } from 'react-router'

const PageContainer = styled.div``

const PageHeader = styled.h1`
  text-align: center;
`

const Image = styled.img`
  width: 100%;
`

export function Photo() {
  const location = useLocation()
  const photoId = location.pathname.split('/')[2]
  const { data } = useGetPhotoQuery(photoId)

  return (
    <PageContainer>
      <PageHeader>{data?.title}</PageHeader>
      <Image src={data?.url} />
    </PageContainer>
  )
}
