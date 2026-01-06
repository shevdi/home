import styled from 'styled-components'
import { useGetPhotosQuery } from '../model'
import { PhotoLink } from './PhotoLink'
import { Loader } from '@/shared/ui'

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
  const { data, isLoading } = useGetPhotosQuery(undefined, {
    // refetc,hOnMountOrArgChange: 360,
  })
  return (
    <PageContainer>
      <PageHeader>Фотки</PageHeader>
      {isLoading ? (
        <Loader />
      ) : (
        <PhotoContainer>
          {data?.map((item) => (
            <PhotoLink key={item._id} photo={item} />
          ))}
        </PhotoContainer>
      )}
    </PageContainer>
  )
}
