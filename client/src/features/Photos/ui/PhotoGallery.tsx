import styled from 'styled-components'
import type { ILink } from '@shevdi-home/shared'
import { PhotoLink } from './PhotoLink'
import { Loader } from '@/shared/ui'
import { useInfiniteLoader } from '@/shared/hooks'

export type PhotoGalleryProps = {
  photos: ILink[]
  isLoading: boolean
  isFetching: boolean
  isFetchingNextPage: boolean
  hasNextPage: boolean
  fetchNextPage: () => void
}

export function PhotoGallery({
  photos,
  isLoading,
  isFetching,
  isFetchingNextPage,
  hasNextPage,
  fetchNextPage,
}: PhotoGalleryProps) {
  const sentinelRef = useInfiniteLoader({
    hasNextPage: Boolean(hasNextPage),
    isLoading,
    isFetchingNextPage,
    onLoadMore: fetchNextPage,
    dataLength: photos.length,
  })

  return (
    <PageContainer>
      <PhotoContainer $isLoading={isFetching && !isFetchingNextPage}>
        {photos.map((item) => (
          <PhotoLink key={item._id} photo={item} disabled={isFetching && !isFetchingNextPage} />
        ))}
      </PhotoContainer>
      {hasNextPage && <Sentinel ref={sentinelRef} />}
      {(isLoading || isFetchingNextPage) && (
        <LoaderContainer>
          <Loader inline />
        </LoaderContainer>
      )}
    </PageContainer>
  )
}

const PageContainer = styled.div`
  margin-top: 1rem;
`

const PhotoContainer = styled.div<{ $isLoading: boolean }>`
  display: grid;
  grid-template-columns: repeat(auto-fill, minmax(220px, 1fr));
  grid-auto-rows: 1fr;
  gap: 1rem;
  grid-auto-flow: dense;
  opacity: ${({ $isLoading }) => ($isLoading ? 0.6 : 1)};
  filter: ${({ $isLoading }) => ($isLoading ? 'brightness(0.9)' : 'none')};
  transition:
    opacity var(--transition-normal),
    filter var(--transition-normal);
`

const Sentinel = styled.div`
  height: 1px;
  width: 100%;
`

const LoaderContainer = styled.div`
  display: flex;
  justify-content: center;
  padding: 2rem;
  position: relative;
`
