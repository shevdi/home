import { configureStore } from '@reduxjs/toolkit'
import { apiSlice } from '@/app/store/api'
import { photosApiSlice } from '../photosApiSlice'
import { buildSearchParams } from '@/shared/utils'

const defaultMockResponse = (args: { url: string; method?: string; body?: unknown } | string) => {
  const url = typeof args === 'string' ? args : args.url
  const method = typeof args === 'object' ? args.method : 'GET'
  const body = typeof args === 'object' ? args.body : undefined
  return Promise.resolve({ data: { url, method, body } })
}

const mockBaseQuery = jest.fn(defaultMockResponse)

jest.mock('@/app/store/api', () => {
  // eslint-disable-next-line @typescript-eslint/no-require-imports
  const { createApi } = require('@reduxjs/toolkit/query/react')
  const apiSlice = createApi({
    baseQuery: (arg: unknown) =>
      mockBaseQuery(arg as string | { url: string; method?: string; body?: unknown }),
    reducerPath: 'api',
    tagTypes: ['Page', 'Photos'],
    endpoints: () => ({}),
  })
  return {
    apiSlice,
    __esModule: true,
  }
})

jest.mock('@/shared/utils', () => ({
  buildSearchParams: jest.fn((search?: unknown, pageParam?: number) => {
    const actual = jest.requireActual('@/shared/utils').buildSearchParams
    return actual(search, pageParam)
  }),
}))

const mockBuildSearchParams = buildSearchParams as jest.MockedFunction<typeof buildSearchParams>

const createTestStore = () =>
  configureStore({
    reducer: {
      [apiSlice.reducerPath]: apiSlice.reducer,
      auth: (state = { token: null }) => state,
    },
    middleware: (getDefaultMiddleware) =>
      getDefaultMiddleware({
        serializableCheck: {
          ignoredActions: ['api/executeMutation/fulfilled'],
          ignoredPaths: ['api.mutations'],
        },
      }).concat(apiSlice.middleware),
  })

describe('photosApiSlice', () => {
  let store: ReturnType<typeof createTestStore>

  beforeEach(() => {
    jest.clearAllMocks()
    mockBaseQuery.mockImplementation(defaultMockResponse)
    store = createTestStore()
  })

  describe('getPhotos', () => {
    it('builds URL with empty query when no search params', async () => {
      mockBuildSearchParams.mockReturnValue('')

      await store.dispatch(
        photosApiSlice.endpoints.getPhotos.initiate(undefined),
      )

      expect(mockBuildSearchParams).toHaveBeenCalledWith(undefined)
      const urlArg = mockBaseQuery.mock.calls[0][0]
      expect(urlArg).toMatch(/photos$/)
    })

    it('builds URL with search params when provided', async () => {
      mockBuildSearchParams.mockReturnValue('dateFrom=2024-01-01&order=orderDownByTakenAt')

      await store.dispatch(
        photosApiSlice.endpoints.getPhotos.initiate({
          dateFrom: '2024-01-01',
          dateTo: undefined,
          order: 'orderDownByTakenAt',
          page: 1,
          tags: [],
          country: [],
          city: [],
        }),
      )

      expect(mockBuildSearchParams).toHaveBeenCalledWith(
        expect.objectContaining({
          dateFrom: '2024-01-01',
          order: 'orderDownByTakenAt',
        }),
      )
      const urlArg = mockBaseQuery.mock.calls[0][0]
      expect(urlArg).toContain('dateFrom=2024-01-01')
    })
  })

  describe('getPhoto', () => {
    it('requests correct URL for photo by id', async () => {
      const result = await store.dispatch(
        photosApiSlice.endpoints.getPhoto.initiate('photo-123'),
      )

      expect(result.data).toMatchObject({
        url: 'photos/photo-123',
        method: 'GET',
      })
    })
  })

  describe('getInfinitePhotoWithMax', () => {
    const infinitePhotosResponse = {
      photos: [],
      pagination: {
        currentPage: 1,
        totalPages: 3,
        totalCount: 30,
        pageSize: 10,
      },
    }

    beforeEach(() => {
      mockBuildSearchParams.mockImplementation(
        (search?: unknown, pageParam?: number) => {
          const params = new URLSearchParams()
          if (pageParam !== undefined) params.append('page', String(pageParam))
          if (search && typeof search === 'object' && 'dateFrom' in search) {
            params.append('dateFrom', (search as { dateFrom: string }).dateFrom)
          }
          return params.toString()
        },
      )
      mockBaseQuery.mockResolvedValue({ data: infinitePhotosResponse } as never)
    })

    it('passes pageParam to buildSearchParams for query string', async () => {
      await store.dispatch(
        photosApiSlice.endpoints.getInfinitePhotoWithMax.initiate(
          {
            dateFrom: '2024-01-01',
            dateTo: undefined,
            order: undefined,
            page: 1,
            tags: [],
            country: [],
            city: [],
          },
          { pageParam: 2 } as never,
        ),
      )

      expect(mockBuildSearchParams).toHaveBeenCalledWith(
        expect.objectContaining({ dateFrom: '2024-01-01' }),
        expect.any(Number),
      )
    })

    it('getNextPageParam returns next page when more pages exist', () => {
      const getNextPageParam = (
        lastPage: { pagination: { totalPages: number } },
        _allPages: unknown,
        lastPageParam: number,
      ) => {
        if (lastPage.pagination && lastPageParam < lastPage.pagination.totalPages) {
          return lastPageParam + 1
        }
        return undefined
      }

      const lastPage = {
        photos: [],
        pagination: {
          currentPage: 2,
          totalPages: 5,
          totalCount: 50,
          pageSize: 10,
        },
      }

      expect(getNextPageParam(lastPage, [], 2)).toBe(3)
    })

    it('getNextPageParam returns undefined when on last page', () => {
      const getNextPageParam = (
        lastPage: { pagination: { totalPages: number } },
        _allPages: unknown,
        lastPageParam: number,
      ) => {
        if (lastPage.pagination && lastPageParam < lastPage.pagination.totalPages) {
          return lastPageParam + 1
        }
        return undefined
      }

      const lastPage = {
        photos: [],
        pagination: {
          currentPage: 3,
          totalPages: 3,
          totalCount: 30,
          pageSize: 10,
        },
      }

      expect(getNextPageParam(lastPage, [], 3)).toBeUndefined()
    })

    it('getPreviousPageParam returns previous page when page > 1', () => {
      const getPreviousPageParam = (
        _firstPage: unknown,
        _allPages: unknown,
        firstPageParam: number,
      ) => (firstPageParam > 0 ? firstPageParam - 1 : undefined)

      expect(getPreviousPageParam({}, [], 3)).toBe(2)
    })

    it('getPreviousPageParam returns undefined when firstPageParam is 0', () => {
      const getPreviousPageParam = (
        _firstPage: unknown,
        _allPages: unknown,
        firstPageParam: number,
      ) => (firstPageParam > 0 ? firstPageParam - 1 : undefined)

      expect(getPreviousPageParam({}, [], 0)).toBeUndefined()
    })
  })

  describe('uploadPhotos', () => {
    it('sends POST to photos/upload with FormData', async () => {
      const formData = new FormData()
      formData.append(
        'files',
        new File(['x'], 'a.jpg', { type: 'image/jpeg' }),
      )

      const result = await store.dispatch(
        photosApiSlice.endpoints.uploadPhotos.initiate(formData),
      )

      expect(result.data).toMatchObject({
        url: expect.stringContaining('photos/upload'),
        method: 'POST',
      })
      expect((result.data as unknown as { body: FormData }).body).toBe(formData)
    })
  })

  describe('changePhoto', () => {
    it('sends PUT with id and data', async () => {
      const result = await store.dispatch(
        photosApiSlice.endpoints.changePhoto.initiate({
          id: 'photo-456',
          data: { title: 'New title', tags: ['nature'] },
        }),
      )

      expect(result.data).toMatchObject({
        url: expect.stringContaining('photos/photo-456'),
        method: 'PUT',
        body: { title: 'New title', tags: ['nature'] },
      })
    })
  })

  describe('deletePhoto', () => {
    it('sends DELETE to photos/:id', async () => {
      const result = await store.dispatch(
        photosApiSlice.endpoints.deletePhoto.initiate({ id: 'photo-789' }),
      )

      expect(result.data).toMatchObject({
        url: expect.stringContaining('photos/photo-789'),
        method: 'DELETE',
      })
    })
  })

  describe('getGalleryTokens', () => {
    it('requests photos/token URL', async () => {
      const result = await store.dispatch(
        photosApiSlice.endpoints.getGalleryTokens.initiate(),
      )

      expect(result.data).toMatchObject({
        url: expect.stringContaining('photos/token'),
        method: 'GET',
      })
    })
  })
})
