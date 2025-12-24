import styled from 'styled-components'
import { useGetPhotosQuery } from '../model'

const PageContainer = styled.div``

const PageHeader = styled.h1`
  text-align: center;
`

const Image = styled.img`
  /* width: 100%; */
`

export function PhotoGallery() {
  const { data } = useGetPhotosQuery(undefined, {
    refetchOnMountOrArgChange: 60,
  })
  return (
    <PageContainer>
      <PageHeader>Фотки</PageHeader>
      {data?.map((item) => (
        <a key={item._id} href={`/photos/${item._id}`}>
          <Image src={item.url} />
        </a>
      ))}
    </PageContainer>
  )
}
