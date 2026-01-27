import { useEffect, useRef, useCallback } from 'react'
import styled from 'styled-components'
import { useSelector } from 'react-redux'
import { useGetInfinitePhotoWithMaxInfiniteQuery } from '../model'
import { PhotoLink } from './PhotoLink'
import { Loader } from '@/shared/ui'
import { Filter } from './Filter'
import { RootState } from '@/app/store'

interface IProps {
  isHiddenFilters?: boolean
}

export function PhotoGallery({ isHiddenFilters }: IProps) {
  const privateFilter = useSelector((state: RootState) => state.photos.filter.private)
  const { data, isLoading, fetchNextPage, hasNextPage, isFetchingNextPage } = useGetInfinitePhotoWithMaxInfiniteQuery({
    private: privateFilter,
  })
  const allResults = data?.pages.flatMap((page) => page.photos) ?? []
  const sentinelRef = useRef<HTMLDivElement>(null)
  const isLoadingRef = useRef(false)

  // Ensure sequential loading - prevent multiple simultaneous requests
  const handleLoadMore = useCallback(async () => {
    if (isLoadingRef.current || isLoading || isFetchingNextPage || !hasNextPage) {
      return
    }

    isLoadingRef.current = true
    try {
      await fetchNextPage()
    } finally {
      isLoadingRef.current = false
    }
  }, [fetchNextPage, hasNextPage, isLoading, isFetchingNextPage])

  useEffect(() => {
    const sentinel = sentinelRef.current
    if (!sentinel || !hasNextPage) {
      return
    }

    const observer = new IntersectionObserver(
      (entries) => {
        const [entry] = entries
        if (entry.isIntersecting && !isLoadingRef.current && !isLoading && !isFetchingNextPage) {
          handleLoadMore()
        }
      },
      {
        rootMargin: '500px',
        threshold: 0.1,
      },
    )

    observer.observe(sentinel)

    return () => {
      observer.disconnect()
    }
  }, [handleLoadMore, hasNextPage, isLoading, isFetchingNextPage])

  return (
    <PageContainer>
      <PageHeader>Фотки</PageHeader>
        <>
          <Filter isHiddenFilters={isHiddenFilters} />
          <PhotoContainer>
            {allResults?.map((item) => (
              <PhotoLink key={item._id} photo={item} />
            ))}
          </PhotoContainer>
          {hasNextPage && <Sentinel ref={sentinelRef} />}
          {(isLoading || isFetchingNextPage) && (
            <LoaderContainer>
              <Loader inline />
            </LoaderContainer>
          )}
        </>
    </PageContainer>
  )
}

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

const Sentinel = styled.div`
  height: 1px;
  width: 100%;
`

const LoaderContainer = styled.div`
  display: flex;
  justify-content: center;
  padding: 1rem;
  position: relative;
`