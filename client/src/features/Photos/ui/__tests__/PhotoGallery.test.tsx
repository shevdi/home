import { act, render, screen } from '@testing-library/react'
import { PhotoGallery } from '../PhotoGallery'
import { useSelector } from 'react-redux'
import { selectFilter, selectSearch, useGetInfinitePhotoWithMaxInfiniteQuery } from '../../model'

jest.mock('react-redux', () => ({
  useSelector: jest.fn(),
}))

jest.mock('../../model', () => ({
  selectFilter: jest.fn(),
  selectSearch: jest.fn(),
  useGetInfinitePhotoWithMaxInfiniteQuery: jest.fn(),
}))

jest.mock('../PhotoLink', () => ({
  PhotoLink: ({ photo }: { photo: { _id: string; title?: string } }) => (
    <div data-testid="photo-link">{photo.title ?? photo._id}</div>
  ),
}))

const mockFilter = jest.fn(({ isHiddenFilters }: { isHiddenFilters?: boolean }) => (
  <div data-testid="filter">{isHiddenFilters ? 'hidden' : 'visible'}</div>
))

jest.mock('../Filter', () => ({
  Filter: (props: { isHiddenFilters?: boolean }) => mockFilter(props),
}))

jest.mock('../Search', () => ({
  Search: () => <div data-testid="search">search</div>,
}))

jest.mock('@/shared/ui', () => ({
  Loader: ({ inline }: { inline?: boolean }) => <div data-testid="loader">{inline ? 'inline' : 'block'}</div>,
}))

type ObserverCallback = IntersectionObserverCallback

let observerCallback: ObserverCallback | null = null

const mockUseSelector = useSelector as unknown as jest.Mock
const mockUseGetInfinitePhotoWithMaxInfiniteQuery =
  useGetInfinitePhotoWithMaxInfiniteQuery as unknown as jest.Mock

class MockIntersectionObserver {
  static lastInstance: MockIntersectionObserver | null = null
  observe = jest.fn()
  disconnect = jest.fn()
  unobserve = jest.fn()

  constructor(callback: ObserverCallback) {
    observerCallback = callback
    MockIntersectionObserver.lastInstance = this
  }
}

beforeEach(() => {
  observerCallback = null
  MockIntersectionObserver.lastInstance = null
  global.IntersectionObserver = MockIntersectionObserver as unknown as typeof IntersectionObserver
  mockFilter.mockClear()
})

afterEach(() => {
  jest.clearAllMocks()
})

const baseSearch = {
  dateFrom: null,
  dateTo: null,
  order: 'orderDownByTakenAt',
  tags: [],
}

const basePhotos = [
  { _id: 'photo-1', title: 'Photo One', private: false },
  { _id: 'photo-2', title: 'Photo Two', private: true },
]

describe('PhotoGallery', () => {
  it('renders header, filter, search, and photo links', () => {
    mockUseSelector.mockImplementation((selector) => {
      if (selector === selectFilter) {
        return { private: false }
      }
      if (selector === selectSearch) {
        return baseSearch
      }
      return undefined
    })
    mockUseGetInfinitePhotoWithMaxInfiniteQuery.mockReturnValue({
      data: { pages: [{ photos: basePhotos }] },
      isLoading: false,
      fetchNextPage: jest.fn(),
      hasNextPage: false,
      isFetchingNextPage: false,
    })

    render(<PhotoGallery />)

    expect(screen.getByText('Фотки')).toBeInTheDocument()
    expect(screen.getByTestId('filter')).toHaveTextContent('visible')
    expect(screen.getByTestId('search')).toBeInTheDocument()
    expect(screen.getAllByTestId('photo-link')).toHaveLength(2)
  })

  it('passes isHiddenFilters to Filter', () => {
    mockUseSelector.mockImplementation((selector) => {
      if (selector === selectFilter) {
        return { private: false }
      }
      if (selector === selectSearch) {
        return baseSearch
      }
      return undefined
    })
    mockUseGetInfinitePhotoWithMaxInfiniteQuery.mockReturnValue({
      data: { pages: [{ photos: basePhotos }] },
      isLoading: false,
      fetchNextPage: jest.fn(),
      hasNextPage: false,
      isFetchingNextPage: false,
    })

    render(<PhotoGallery isHiddenFilters />)

    expect(mockFilter).toHaveBeenCalledWith({ isHiddenFilters: true })
    expect(screen.getByTestId('filter')).toHaveTextContent('hidden')
  })

  it('filters out non-private photos when private filter enabled', () => {
    mockUseSelector.mockImplementation((selector) => {
      if (selector === selectFilter) {
        return { private: true }
      }
      if (selector === selectSearch) {
        return baseSearch
      }
      return undefined
    })
    mockUseGetInfinitePhotoWithMaxInfiniteQuery.mockReturnValue({
      data: { pages: [{ photos: basePhotos }] },
      isLoading: false,
      fetchNextPage: jest.fn(),
      hasNextPage: false,
      isFetchingNextPage: false,
    })

    render(<PhotoGallery />)

    expect(screen.getAllByTestId('photo-link')).toHaveLength(1)
    expect(screen.getByText('Photo Two')).toBeInTheDocument()
  })

  it('shows loader when fetching', () => {
    mockUseSelector.mockImplementation((selector) => {
      if (selector === selectFilter) {
        return { private: false }
      }
      if (selector === selectSearch) {
        return baseSearch
      }
      return undefined
    })
    mockUseGetInfinitePhotoWithMaxInfiniteQuery.mockReturnValue({
      data: { pages: [{ photos: basePhotos }] },
      isLoading: true,
      fetchNextPage: jest.fn(),
      hasNextPage: true,
      isFetchingNextPage: false,
    })

    render(<PhotoGallery />)

    expect(screen.getByTestId('loader')).toHaveTextContent('inline')
  })

  it('observes sentinel and loads more when intersecting', async () => {
    const fetchNextPage = jest.fn().mockResolvedValue(undefined)
    mockUseSelector.mockImplementation((selector) => {
      if (selector === selectFilter) {
        return { private: false }
      }
      if (selector === selectSearch) {
        return baseSearch
      }
      return undefined
    })
    mockUseGetInfinitePhotoWithMaxInfiniteQuery.mockReturnValue({
      data: { pages: [{ photos: basePhotos }] },
      isLoading: false,
      fetchNextPage,
      hasNextPage: true,
      isFetchingNextPage: false,
    })

    render(<PhotoGallery />)

    expect(MockIntersectionObserver.lastInstance?.observe).toHaveBeenCalledTimes(1)

    await act(async () => {
      observerCallback?.([{ isIntersecting: true } as IntersectionObserverEntry], {} as IntersectionObserver)
      await Promise.resolve()
    })

    expect(fetchNextPage).toHaveBeenCalledTimes(1)
  })
})
