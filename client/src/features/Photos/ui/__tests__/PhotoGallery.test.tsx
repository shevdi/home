import { act, render, screen } from '@testing-library/react'
import { MemoryRouter } from 'react-router'
import { PhotoGallery } from '../PhotoGallery'
import { useSelector } from 'react-redux'
import { selectFilter, selectSearch, useGetInfinitePhotoWithMaxInfiniteQuery } from '../../model'

jest.mock('react-redux', () => ({
  useSelector: jest.fn(),
}))

jest.mock('../../model', () => ({
  useGetInfinitePhotoWithMaxInfiniteQuery: jest.fn(),
}))

jest.mock('../PhotoLink', () => ({
  PhotoLink: ({ photo }: { photo: { _id: string; title?: string } }) => (
    <div data-testid='photo-link'>{photo.title ?? photo._id}</div>
  ),
}))

jest.mock('../Search', () => ({
  Search: () => <div data-testid='search'>search</div>,
}))

jest.mock('@/shared/ui', () => ({
  Loader: ({ inline }: { inline?: boolean }) => <div data-testid='loader'>{inline ? 'inline' : 'block'}</div>,
}))

type ObserverCallback = IntersectionObserverCallback

let observerCallback: ObserverCallback | null = null

const mockUseSelector = useSelector as unknown as jest.Mock
const mockUseGetInfinitePhotoWithMaxInfiniteQuery = useGetInfinitePhotoWithMaxInfiniteQuery as unknown as jest.Mock

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

const buildHookResult = (
  overrides: Partial<{
    data: { pages: Array<{ photos: typeof basePhotos }> }
    isLoading: boolean
    fetchNextPage: jest.Mock
    hasNextPage: boolean
    isFetchingNextPage: boolean
  }> = {},
) => ({
  data: { pages: [{ photos: basePhotos }] },
  isLoading: false,
  fetchNextPage: jest.fn(),
  hasNextPage: false,
  isFetchingNextPage: false,
  ...overrides,
})

const mockInfiniteQuery = (overrides?: Parameters<typeof buildHookResult>[0]) => {
  mockUseGetInfinitePhotoWithMaxInfiniteQuery.mockImplementation((_params, options) => {
    const result = buildHookResult(overrides)
    if (options?.selectFromResult) {
      return options.selectFromResult(result)
    }
    return result
  })
}

describe('PhotoGallery', () => {
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
    mockInfiniteQuery({ isLoading: true, hasNextPage: true })

    render(
      <MemoryRouter>
        <PhotoGallery />
      </MemoryRouter>,
    )

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
    mockInfiniteQuery({ fetchNextPage, hasNextPage: true })

    render(
      <MemoryRouter>
        <PhotoGallery />
      </MemoryRouter>,
    )

    expect(MockIntersectionObserver.lastInstance?.observe).toHaveBeenCalledTimes(1)

    await act(async () => {
      observerCallback?.([{ isIntersecting: true } as IntersectionObserverEntry], {} as IntersectionObserver)
      await Promise.resolve()
    })

    expect(fetchNextPage).toHaveBeenCalledTimes(1)
  })
})
