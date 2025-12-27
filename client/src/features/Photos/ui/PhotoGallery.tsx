import styled from 'styled-components'
import { useGetPhotosQuery } from '../model'
import { PhotoLink } from './PhotoLink'

const PageContainer = styled.div``

const PageHeader = styled.h1`
  text-align: center;
`

const PhotoContainer = styled.div`
  display: grid;
  grid-template-columns: repeat(auto-fill, minmax(200px, 1fr));
  grid-auto-rows: 1fr;
  gap: 0.5rem;
  grid-auto-flow: dense;
`

export function PhotoGallery() {
  const { data } = useGetPhotosQuery(undefined, {
    refetchOnMountOrArgChange: 360,
  })
  return (
    <PageContainer>
      <PageHeader>Фотки</PageHeader>
      <PhotoContainer>
        {data?.map((item) => (
          <PhotoLink key={item._id} photo={item} />
        ))}
      </PhotoContainer>
    </PageContainer>
  )
}
