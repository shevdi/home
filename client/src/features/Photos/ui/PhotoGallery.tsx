import { useMemo } from 'react'
import styled from 'styled-components'
import { useSelector } from 'react-redux'
import { selectFilter, selectSearch, useGetInfinitePhotoWithMaxInfiniteQuery } from '../model'
import { PhotoLink } from './PhotoLink'
import { Loader } from '@/shared/ui'
import { useInfiniteLoader } from '@/shared/hooks'
import { Search } from './Search'
import { Filter } from './Filter'

interface IProps {
  isHiddenFilters?: boolean
}

export function PhotoGallery({ isHiddenFilters }: IProps) {
  const filters = useSelector(selectFilter)
  const search = useSelector(selectSearch)
  const { data, isLoading, fetchNextPage, hasNextPage, isFetchingNextPage } = useGetInfinitePhotoWithMaxInfiniteQuery({
    ...search,
  })
  const allResults = useMemo(() => {
    return data?.pages.flatMap((page) => page.photos).filter((item) => (filters.private ? item.private : true)) ?? []
  }, [data, filters.private])
  const sentinelRef = useInfiniteLoader({
    hasNextPage: Boolean(hasNextPage),
    isLoading,
    isFetchingNextPage,
    onLoadMore: fetchNextPage,
  })

  return (
    <PageContainer>
      <PageHeader>Фотки</PageHeader>
      <>
        <Filter isHiddenFilters={isHiddenFilters} />
        <Search />
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
