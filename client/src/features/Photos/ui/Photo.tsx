import styled from 'styled-components'
import { useSelector } from 'react-redux'
import { useGetPhotosQuery } from '../model'
import { Link, useLocation } from 'react-router'
import { getNeighbours } from '@/shared/utils'
import { useMemo } from 'react'
import { Loader } from '@/shared/ui'
import { RootState } from '@/app/store'

const PageContainer = styled.div``

const PageHeader = styled.h1`
  text-align: center;
`

const PhotosNavigation = styled.div`
  display: flex;
  justify-content: space-between;
  margin: 1rem 0;
`

const Image = styled.img`
  width: 100%;
`

export function Photo() {
  const location = useLocation()
  const photoId = location.pathname.split('/')[2]
  const privateFilter = useSelector((state: RootState) => state.photos.filter.private)
  // const { data } = useGetPhotoQuery(photoId)
  const { data, isLoading } = useGetPhotosQuery({ private: privateFilter })
  const photos = data?.photos ?? []
  const photo = useMemo(() => photos.find((item) => item._id === photoId), [photos, photoId])
  const neighbours = getNeighbours(photos, photoId, (x) => x._id)

  return (
    <PageContainer>
      <PhotosNavigation>
        <div>{neighbours[0] && <Link to={`../${neighbours[0]._id}`}>Предыдущее фото</Link>}</div>
        <div>
          {photo && (
            <a href={photo?.fullSizeUrl} target='_blank' rel='noreferrer'>
              Полный размер
            </a>
          )}
        </div>
        <div>{neighbours[1] && <Link to={`../${neighbours[1]._id}`}>Следующее фото</Link>}</div>
      </PhotosNavigation>
      {isLoading ? <Loader /> : <Image key={photo?._id} src={photo?.mdSizeUrl} />}
      <PageHeader>{photo?.title}</PageHeader>
    </PageContainer>
  )
}
