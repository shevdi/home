import styled from 'styled-components'
import { useSelector } from 'react-redux'
import { photosApiSlice, selectSearch, useGetInfinitePhotoWithMaxInfiniteQuery, useGetPhotoQuery } from '../model'
import { Link, useLocation } from 'react-router'
import { getNeighbours } from '@/shared/utils'
import { useMemo } from 'react'
import { Loader, MapEmbed } from '@/shared/ui'
import { formatDate } from '../utils/uploadPhotoMeta'

const usePhoto = () => {
  const location = useLocation()
  const photoId = location.pathname.split('/')[2]
  const search = useSelector(selectSearch)
  const infiniteQueryState = useSelector(photosApiSlice.endpoints.getInfinitePhotoWithMax.select(search))
  const shouldUseInfinite = infiniteQueryState?.status !== 'uninitialized'
  const { data: photo, isLoading: isPhotoLoading } = useGetPhotoQuery(photoId, {
    skip: shouldUseInfinite,
  })
  const { data, isLoading: isInfiniteLoading } = useGetInfinitePhotoWithMaxInfiniteQuery(
    { ...search },
    {
      initialPageParam: 1,
      skip: !shouldUseInfinite,
    },
  )
  const photos = useMemo(() => data?.pages.flatMap((pageItem) => pageItem.photos) ?? [], [data?.pages])
  const foundPhoto = useMemo(() => photos.find((item) => item._id === photoId), [photos, photoId])
  const neighbours = getNeighbours(photos, photoId, (x) => x._id)
  return {
    photo: shouldUseInfinite ? foundPhoto : photo,
    neighbours,
    isLoading: shouldUseInfinite ? isInfiniteLoading : isPhotoLoading,
  }
}

export function Photo() {
  const { photo, neighbours, isLoading } = usePhoto()

  const takenAt = photo?.meta?.takenAt
  const gpsLat = photo?.meta?.gpsLatitude
  const gpsLon = photo?.meta?.gpsLongitude
  const hasGps = Number.isFinite(gpsLat) && Number.isFinite(gpsLon)

  return (
    <PageContainer>
      <PhotosNavigation>
        <div>{neighbours[0] && <Link to={{ pathname: `../${neighbours[0]._id}` }}>Предыдущее фото</Link>}</div>
        <div>
          {photo && (
            <a href={photo?.fullSizeUrl} target='_blank' rel='noreferrer'>
              Полный размер
            </a>
          )}
        </div>
        <div>{neighbours[1] && <Link to={{ pathname: `../${neighbours[1]._id}` }}>Следующее фото</Link>}</div>
      </PhotosNavigation>
      {isLoading ? <Loader /> : <Image key={photo?._id} src={photo?.mdSizeUrl} />}
      <PageHeader>{photo?.title}</PageHeader>
      {photo?.tags && photo.tags.length > 0 && (
        <TagList>
          {photo.tags.map((tag) => (
            <TagChip key={tag}>{tag}</TagChip>
          ))}
        </TagList>
      )}
      {takenAt && <PhotoMeta>{formatDate(takenAt)}</PhotoMeta>}
      {hasGps && gpsLat && gpsLon && <MapEmbed label='Место съемки' lat={gpsLat} lon={gpsLon} />}
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

const PhotoMeta = styled.div`
  text-align: right;
  color: #555;
  font-size: 0.9rem;
  margin-top: 0.25rem;
`

const TagList = styled.div`
  display: flex;
  flex-wrap: wrap;
  gap: 0.5rem;
  justify-content: right;
  margin: 1rem 0;
`

const TagChip = styled.div`
  display: inline-flex;
  align-items: center;
  padding: 0.3rem 0.6rem;
  border: 1px solid #ccc;
  border-radius: 6px;
  background: #f5f5f5;
  color: #333;
  font-size: 0.9rem;
`

const PhotosNavigation = styled.div`
  display: flex;
  justify-content: space-between;
  margin: 1rem 0;
`

const Image = styled.img`
  width: 100%;
`
