import styled from 'styled-components'
import { useSelector } from 'react-redux'
import { selectSearch } from '../model'
import { Link } from 'react-router'
import { buildSearchParams } from '@/shared/utils'
import { Loader, MapEmbed, TagList } from '@/shared/ui'
import { formatDate } from '../utils/uploadPhotoMeta'
import { PhotosNavigation } from './PhotosNavigation'
import { PhotoNotFound } from './PhotoNotFound'
import { usePhoto } from '../hooks/usePhoto'

export function Photo() {
  const search = useSelector(selectSearch)
  const tagsUrl = {
    pathname: '/photos',
    search,
  }
  const { photo, neighbours, isLoading, isNotFound } = usePhoto()

  if (isNotFound) {
    return <PhotoNotFound />
  }

  const takenAt = photo?.meta?.takenAt
  const dateStr = takenAt ? takenAt.split('T')[0] : null
  const gpsLat = photo?.meta?.gpsLatitude
  const gpsLon = photo?.meta?.gpsLongitude
  const hasGps = Number.isFinite(gpsLat) && Number.isFinite(gpsLon)

  return (
    <PageContainer>
      <PhotosNavigation photo={photo} neighbours={neighbours} />
      {isLoading ? <Loader /> : <Image key={photo?._id} src={photo?.mdSizeUrl} alt={photo?.title} />}
      <PageHeader>{photo?.title}</PageHeader>
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
      {photo?.tags && photo.tags.length > 0 && <TagList tags={photo.tags} url={tagsUrl} position='right' />}
      {(photo?.location?.value?.country?.[0] || photo?.location?.value?.city?.[0] || (hasGps && gpsLat && gpsLon)) && (
        <MapEmbed lat={gpsLat} lon={gpsLon} location={photo?.location} />
      )}
    </PageContainer>
  )
}

const PageContainer = styled.div`
  position: relative;
  height: 100%;
`

const PageHeader = styled.h1`
  text-align: center;
  font-size: 1.5rem;
  margin: 1rem 0 0.5rem;
`

const PhotoMeta = styled.div`
  text-align: right;
  color: var(--text-muted);
  font-size: 0.9rem;
  margin-top: 0.25rem;

  a {
    text-decoration: none;
    color: var(--accent);

    &:hover {
      text-decoration: underline;
    }
  }
`

const Image = styled.img`
  width: 100%;
  border-radius: var(--radius-lg);
  box-shadow: var(--shadow-md);
`
