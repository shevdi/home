import { useCallback, useEffect, useRef } from 'react'

type UseInfiniteLoaderOptions = {
  hasNextPage: boolean
  isLoading: boolean
  isFetchingNextPage: boolean
  onLoadMore: () => Promise<unknown> | void
  rootMargin?: string
  threshold?: number
}

export const useInfiniteLoader = ({
  hasNextPage,
  isLoading,
  isFetchingNextPage,
  onLoadMore,
  rootMargin = '500px',
  threshold = 0.1,
}: UseInfiniteLoaderOptions) => {
  const sentinelRef = useRef<HTMLDivElement>(null)
  const isLoadingRef = useRef(false)

  const handleLoadMore = useCallback(async () => {
    if (isLoadingRef.current || isLoading || isFetchingNextPage || !hasNextPage) {
      return
    }

    isLoadingRef.current = true
    try {
      await onLoadMore()
    } finally {
      isLoadingRef.current = false
    }
  }, [hasNextPage, isLoading, isFetchingNextPage, onLoadMore])

  useEffect(() => {
    const sentinel = sentinelRef.current
    if (!sentinel || !hasNextPage) {
      return
    }

    const observer = new IntersectionObserver(
      (entries) => {
        const [entry] = entries
        if (entry.isIntersecting) {
          handleLoadMore()
        }
      },
      { rootMargin, threshold },
    )

    observer.observe(sentinel)

    return () => {
      observer.disconnect()
    }
  }, [handleLoadMore, hasNextPage, rootMargin, threshold])

  return sentinelRef
}
