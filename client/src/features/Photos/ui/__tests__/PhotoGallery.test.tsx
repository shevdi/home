import { act, render, screen } from '@testing-library/react'
import { PhotoGallery } from '../PhotoGallery'
import { useSelector } from 'react-redux'
import { useGetInfinitePhotoWithMaxInfiniteQuery } from '../../model'

jest.mock('react-redux', () => ({
  useSelector: jest.fn(),
}))

jest.mock('../../model', () => ({
  useGetInfinitePhotoWithMaxInfiniteQuery: jest.fn(),
}))

jest.mock('../PhotoLink', () => ({
  PhotoLink: ({ photo }: { photo: { _id: string; title?: string } }) => (
    <div data-testid="photo-link">{photo.title ?? photo._id}</div>
  ),
}))

jest.mock('../Filter', () => ({
  Filter: ({ isHiddenFilters }: { isHiddenFilters?: boolean }) => (
    <div data-testid="filter">{isHiddenFilters ? 'hidden' : 'visible'}</div>
  ),
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
})

afterEach(() => {
  jest.clearAllMocks()
})

const basePhotos = [
  { _id: 'photo-1', title: 'Photo One' },
  { _id: 'photo-2', title: 'Photo Two' },
]

describe('PhotoGallery', () => {
  it('renders header, filter, and photo links', () => {
    mockUseSelector.mockReturnValue(false)
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
    expect(screen.getAllByTestId('photo-link')).toHaveLength(2)
  })

  it('shows loader when fetching', () => {
    mockUseSelector.mockReturnValue(false)
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
    mockUseSelector.mockReturnValue(false)
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
