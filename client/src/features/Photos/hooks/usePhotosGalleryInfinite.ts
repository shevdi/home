import { useSelector } from 'react-redux'
import { selectFilter, selectSearch, useGetInfinitePhotoWithMaxInfiniteQuery } from '../model'

export function usePhotosGalleryInfinite() {
  const filters = useSelector(selectFilter)
  const search = useSelector(selectSearch)
  return useGetInfinitePhotoWithMaxInfiniteQuery(
    {
      ...search,
      page: 1,
    },
    {
      refetchOnMountOrArgChange: true,
      selectFromResult: ({ data, ...rest }) => ({
        photos:
          data?.pages.flatMap((page) => page.photos).filter((item) => (filters.private ? item.private : true)) ?? [],
        ...rest,
      }),
    },
  )
}
