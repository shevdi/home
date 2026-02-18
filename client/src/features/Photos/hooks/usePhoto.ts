import { useSelector } from 'react-redux'
import { useLocation } from 'react-router'
import {
  selectIsInitializedInfiniteQuery,
  selectSearch,
  useGetInfinitePhotoWithMaxInfiniteQuery,
  useGetPhotoQuery,
} from '../model'
import { getNeighbours } from '@/shared/utils'

export const usePhoto = () => {
  const location = useLocation()
  const photoId = location.pathname.split('/')[2]
  const search = useSelector(selectSearch)
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
