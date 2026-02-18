import { useCallback, useEffect, useRef } from 'react'

type UseInfiniteLoaderOptions = {
  hasNextPage: boolean
  isLoading: boolean
  isFetchingNextPage: boolean
  onLoadMore: () => Promise<unknown> | void
  /** When data changes (e.g. after loading more), observer is recreated to re-check intersection */
  dataLength?: number
  rootMargin?: string
  threshold?: number
}

export const useInfiniteLoader = ({
  hasNextPage,
  isLoading,
  isFetchingNextPage,
  onLoadMore,
  dataLength,
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

  // Recreate observer when data changes. IntersectionObserver only fires on state
  // *change*; if the sentinel stays in view after loading, we never get another callback.
  // Recreating when dataLength changes triggers a fresh intersection check.
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
  }, [handleLoadMore, hasNextPage, isFetchingNextPage, dataLength, rootMargin, threshold])

  return sentinelRef
}
