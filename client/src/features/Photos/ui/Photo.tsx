import styled from 'styled-components'
import { useSelector } from 'react-redux'
import {
  selectIsInitializedInfiniteQuery,
  selectSearch,
  useGetInfinitePhotoWithMaxInfiniteQuery,
  useGetPhotoQuery,
} from '../model'
import { Link, useLocation } from 'react-router'
import { buildSearchParams, getNeighbours } from '@/shared/utils'
import { Loader, MapEmbed, TagList } from '@/shared/ui'
import { formatDate } from '../utils/uploadPhotoMeta'

const usePhoto = () => {
  const location = useLocation()
  const photoId = location.pathname.split('/')[2]
  const search = useSelector(selectSearch)
  // if photo is opened by direct link, show just photo. Otherwise, show also neighbours links
  const shouldUseInfinite = useSelector(selectIsInitializedInfiniteQuery)
  const { data: photo, isLoading: isPhotoLoading } = useGetPhotoQuery(photoId, {
    skip: shouldUseInfinite,
  })
  const {
    data: { infinityPhoto, neighbours },
    isLoading: isInfiniteLoading,
  } = useGetInfinitePhotoWithMaxInfiniteQuery(
    { ...search },
    {
      initialPageParam: 1,
      skip: !shouldUseInfinite,
      selectFromResult: ({ data, ...rest }) => {
        const photos = data?.pages.flatMap((pageItem) => pageItem.photos) ?? []
        return {
          data: {
            infinityPhoto: photos.find((item) => item._id === photoId),
            neighbours: getNeighbours(photos, photoId, (x) => x._id),
          },
          ...rest,
        }
      },
    },
  )
  return {
    photo: shouldUseInfinite ? infinityPhoto : photo,
    neighbours,
    isLoading: shouldUseInfinite ? isInfiniteLoading : isPhotoLoading,
  }
}

export function Photo() {
  const search = useSelector(selectSearch)
  const tagsUrl = {
    pathname: '/photos',
    search,
  }
  const { photo, neighbours, isLoading } = usePhoto()

  const takenAt = photo?.meta?.takenAt
  const dateStr = takenAt ? takenAt.split('T')[0] : null
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
      {photo?.tags && photo.tags.length > 0 && <TagList tags={photo.tags} url={tagsUrl} position='right' />}
      {takenAt && dateStr && (
        <PhotoMeta>
          <Link
            to={{
              pathname: '/photos',
              search: buildSearchParams({ dateFrom: dateStr, dateTo: dateStr }),
            }}
          >
            {formatDate(takenAt)}
          </Link>
        </PhotoMeta>
      )}
      {hasGps && gpsLat && gpsLon && <MapEmbed lat={gpsLat} lon={gpsLon} location={photo?.location} />}
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
  a {
    text-decoration: none;
  }
`

const PhotosNavigation = styled.div`
  display: flex;
  justify-content: space-between;
  margin: 1rem 0;
`

const Image = styled.img`
  width: 100%;
`
