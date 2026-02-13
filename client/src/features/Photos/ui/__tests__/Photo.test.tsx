import { render } from '@testing-library/react'
import { MemoryRouter } from 'react-router'
import { Photo } from '../Photo'
import { useSelector } from 'react-redux'
import {
  selectIsInitializedInfiniteQuery,
  selectSearch,
  useGetPhotoQuery,
  useGetInfinitePhotoWithMaxInfiniteQuery,
} from '../../model'

jest.mock('react-redux', () => ({
  useSelector: jest.fn(),
  useDispatch: jest.fn(() => jest.fn()),
  useStore: jest.fn(),
}))

jest.mock('../../model', () => {
  const actual = jest.requireActual('../../model')
  return {
    ...actual,
    useGetPhotoQuery: jest.fn(),
    useGetInfinitePhotoWithMaxInfiniteQuery: jest.fn(),
  }
})

jest.mock('@/shared/ui', () => ({
  Loader: () => <div data-testid='loader'>loader</div>,
  MapEmbed: ({ lat, lon }: { lat: number; lon: number }) => (
    <div data-testid='map-embed'>
      map:{lat},{lon}
    </div>
  ),
  TagList: ({ tags }: { tags?: string[] }) => (
    <div data-testid='tag-list'>
      {tags?.map((tag) => (
        <span key={tag}>{tag}</span>
      ))}
    </div>
  ),
}))

jest.mock('../../utils/uploadPhotoMeta', () => ({
  formatDate: (value: string) => (value ? `formatted:${value}` : ''),
}))

const mockUseSelector = useSelector as unknown as jest.Mock
const mockUseGetPhotoQuery = useGetPhotoQuery as unknown as jest.Mock
const mockUseGetInfinitePhotoWithMaxInfiniteQuery = useGetInfinitePhotoWithMaxInfiniteQuery as unknown as jest.Mock

const baseSearch = {
  dateFrom: null,
  dateTo: null,
  order: 'orderDownByTakenAt',
  tags: [],
  country: [],
  city: [],
}

const basePhoto = {
  _id: 'photo-1',
  title: 'Test Photo',
  mdSizeUrl: '/photo-md.jpg',
  fullSizeUrl: '/photo-full.jpg',
}

const renderWithPath = (path: string) =>
  render(
    <MemoryRouter initialEntries={[path]}>
      <Photo />
    </MemoryRouter>,
  )

describe('Photo', () => {
  beforeEach(() => {
    mockUseSelector.mockImplementation((selector: (state: unknown) => unknown) => {
      if (selector === selectSearch) {
        return baseSearch
      }
      if (selector === selectIsInitializedInfiniteQuery) {
        return false
      }
      return undefined
    })
  })

  afterEach(() => {
    jest.clearAllMocks()
  })

  it('renders loader when loading', () => {
    mockUseGetPhotoQuery.mockReturnValue({ data: undefined, isLoading: true })
    mockUseGetInfinitePhotoWithMaxInfiniteQuery.mockReturnValue({
      data: { infinityPhoto: undefined, neighbours: [undefined, undefined] },
      isLoading: false,
    })

    const { container } = renderWithPath('/photos/photo-1')

    expect(container).toMatchSnapshot()
  })

  it('renders photo with basic info', () => {
    mockUseGetPhotoQuery.mockReturnValue({ data: basePhoto, isLoading: false })
    mockUseGetInfinitePhotoWithMaxInfiniteQuery.mockReturnValue({
      data: { infinityPhoto: undefined, neighbours: [undefined, undefined] },
      isLoading: false,
    })

    const { container } = renderWithPath('/photos/photo-1')

    expect(container).toMatchSnapshot()
  })

  it('renders photo with tags', () => {
    const photoWithTags = { ...basePhoto, tags: ['nature', 'sunset'] }
    mockUseGetPhotoQuery.mockReturnValue({ data: photoWithTags, isLoading: false })
    mockUseGetInfinitePhotoWithMaxInfiniteQuery.mockReturnValue({
      data: { infinityPhoto: undefined, neighbours: [undefined, undefined] },
      isLoading: false,
    })

    const { container } = renderWithPath('/photos/photo-1')

    expect(container).toMatchSnapshot()
  })

  it('renders photo with takenAt date', () => {
    const photoWithDate = {
      ...basePhoto,
      meta: { takenAt: '2024-01-15T10:30:00Z' },
    }
    mockUseGetPhotoQuery.mockReturnValue({ data: photoWithDate, isLoading: false })
    mockUseGetInfinitePhotoWithMaxInfiniteQuery.mockReturnValue({
      data: { infinityPhoto: undefined, neighbours: [undefined, undefined] },
      isLoading: false,
    })

    const { container } = renderWithPath('/photos/photo-1')

    expect(container).toMatchSnapshot()
  })

  it('renders photo with GPS coordinates and MapEmbed', () => {
    const photoWithGps = {
      ...basePhoto,
      meta: {
        gpsLatitude: 55.7558,
        gpsLongitude: 37.6173,
      },
    }
    mockUseGetPhotoQuery.mockReturnValue({ data: photoWithGps, isLoading: false })
    mockUseGetInfinitePhotoWithMaxInfiniteQuery.mockReturnValue({
      data: { infinityPhoto: undefined, neighbours: [undefined, undefined] },
      isLoading: false,
    })

    const { container } = renderWithPath('/photos/photo-1')

    expect(container).toMatchSnapshot()
  })

  it('renders photo with neighbours navigation', () => {
    const prevPhoto = { _id: 'photo-0', title: 'Prev' }
    const nextPhoto = { _id: 'photo-2', title: 'Next' }
    mockUseGetPhotoQuery.mockReturnValue({ data: basePhoto, isLoading: false })
    mockUseGetInfinitePhotoWithMaxInfiniteQuery.mockReturnValue({
      data: {
        infinityPhoto: undefined,
        neighbours: [prevPhoto, nextPhoto],
      },
      isLoading: false,
    })

    const { container } = renderWithPath('/photos/photo-1')

    expect(container).toMatchSnapshot()
  })

  it('renders full photo with all elements when using infinite query', () => {
    mockUseSelector.mockImplementation((selector: (state: unknown) => unknown) => {
      if (selector === selectSearch) {
        return baseSearch
      }
      if (selector === selectIsInitializedInfiniteQuery) {
        return true
      }
      return undefined
    })

    const photoWithAll = {
      ...basePhoto,
      tags: ['landscape'],
      meta: {
        takenAt: '2024-01-15T10:30:00Z',
        gpsLatitude: 55.7558,
        gpsLongitude: 37.6173,
      },
    }
    const prevPhoto = { _id: 'photo-0', title: 'Prev' }
    const nextPhoto = { _id: 'photo-2', title: 'Next' }

    mockUseGetPhotoQuery.mockReturnValue({ data: undefined, isLoading: false })
    mockUseGetInfinitePhotoWithMaxInfiniteQuery.mockImplementation((_params, options) => {
      const result = {
        data: {
          pages: [
            {
              photos: [prevPhoto, photoWithAll, nextPhoto],
            },
          ],
        },
      }
      if (options?.selectFromResult) {
        return options.selectFromResult(result)
      }
      return result
    })

    const { container } = renderWithPath('/photos/photo-1')

    expect(container).toMatchSnapshot()
  })
})
