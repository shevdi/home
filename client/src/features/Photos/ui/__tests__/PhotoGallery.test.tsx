import { act, render, screen } from '@testing-library/react'
import type { ILink } from '@shevdi-home/shared'
import { MemoryRouter } from 'react-router'
import { PhotoGallery } from '../PhotoGallery'

jest.mock('../PhotoLink', () => ({
  PhotoLink: ({ photo }: { photo: { _id: string; title?: string } }) => (
    <div data-testid='photo-link'>{photo.title ?? photo._id}</div>
  ),
}))

jest.mock('@/shared/ui', () => ({
  Loader: ({ inline }: { inline?: boolean }) => <div data-testid='loader'>{inline ? 'inline' : 'block'}</div>,
}))

type ObserverCallback = IntersectionObserverCallback

let observerCallback: ObserverCallback | null = null

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
  { _id: 'photo-1', title: 'Photo One', private: false, location: { value: { country: [], city: [] } } },
  { _id: 'photo-2', title: 'Photo Two', private: true, location: { value: { country: [], city: [] } } },
] as unknown as ILink[]

const defaultProps = {
  photos: basePhotos,
  isLoading: false,
  isFetching: false,
  isFetchingNextPage: false,
  hasNextPage: false,
  fetchNextPage: jest.fn(),
}

describe('PhotoGallery', () => {
  it('shows loader when fetching', () => {
    render(
      <MemoryRouter>
        <PhotoGallery {...defaultProps} isLoading />
      </MemoryRouter>,
    )

    expect(screen.getByTestId('loader')).toHaveTextContent('inline')
  })

  it('observes sentinel and loads more when intersecting', async () => {
    const fetchNextPage = jest.fn().mockResolvedValue(undefined)

    render(
      <MemoryRouter>
        <PhotoGallery {...defaultProps} fetchNextPage={fetchNextPage} hasNextPage />
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
