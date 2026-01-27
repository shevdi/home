import styled from 'styled-components'
import { useSelector } from 'react-redux'
import { useGetInfinitePhotoWithMaxInfiniteQuery, useGetPhotoQuery } from '../model'
import { Link, useLocation, useSearchParams } from 'react-router'
import { getNeighbours } from '@/shared/utils'
import { useMemo } from 'react'
import { Loader } from '@/shared/ui'
import { RootState } from '@/app/store'


const usePhoto = () => {
  const location = useLocation()
  const [searchParams] = useSearchParams()
  const page = searchParams.get('page')
  const initialPage = page ? Number(page) || 1 : 1
  const photoId = location.pathname.split('/')[2]
  const privateFilter = useSelector((state: RootState) => state.photos.filter.private)
  const shouldUseInfinite = Boolean(page)
  const { data: photo, isLoading: isPhotoLoading } = useGetPhotoQuery(photoId, {
    skip: shouldUseInfinite
  })
  const { data, isLoading: isInfiniteLoading } = useGetInfinitePhotoWithMaxInfiniteQuery(
    { private: privateFilter },
    {
      initialPageParam: initialPage,
      skip: !shouldUseInfinite
    }
  )
  const photos = useMemo(() => data?.pages.flatMap((pageItem) => pageItem.photos) ?? [], [data?.pages])
  const foundPhoto = useMemo(() => photos.find((item) => item._id === photoId), [photos, photoId])
  const neighbours = getNeighbours(photos, photoId, (x) => x._id)
  return {
    photo: shouldUseInfinite ? foundPhoto : photo,
    neighbours,
    isLoading: shouldUseInfinite ? isInfiniteLoading : isPhotoLoading
  }
} 

export function Photo() {
  const {
    photo,
    neighbours,
    isLoading
  } = usePhoto()
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

const PageContainer = styled.div`
  position: relative;
  height: 100%;
`

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
