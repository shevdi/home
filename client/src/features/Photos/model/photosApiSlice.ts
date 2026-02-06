import { apiSlice } from '@/app/store/api'
import type { FetchBaseQueryError, FetchBaseQueryMeta, QueryReturnValue } from '@reduxjs/toolkit/query'
import { ILink, PhotoOrder } from '@/shared/types'

export interface UploadResponse {
  ok: boolean
  successCount?: number
  errorsCount?: number
  totalCount?: number
  results?: Array<{ ok: boolean; fileName: string; error?: string }>
  error?: string
}

interface PhotoSearch {
  dateFrom?: string | null
  dateTo?: string | null
  order?: PhotoOrder
  tags?: string[]
}

interface PhotosResponse {
  photos: ILink[]
  pagination: {
    currentPage: number
    totalPages: number
    totalCount: number
    pageSize: number
  }
}

type InfinitePhotosResponse = {
  photos: ILink[]
  pagination: {
    currentPage: number
    totalPages: number
    totalCount: number
    pageSize: number
  }
}

let lastInfiniteSearchKey: string | null = null
let lastInfiniteAbortControllers: AbortController[] = []

const getInfiniteQueryAbortController = (searchKey: string) => {
  if (lastInfiniteSearchKey !== searchKey) {
    lastInfiniteAbortControllers.forEach((controller) => controller.abort())
    lastInfiniteAbortControllers = []
    lastInfiniteSearchKey = searchKey
  }
  const controller = new AbortController()
  lastInfiniteAbortControllers.push(controller)
  return controller
}

const buildPhotoSearchParams = (search?: PhotoSearch | void, pageParam?: number) => {
  const params = new URLSearchParams()
  if (pageParam !== undefined) {
    params.append('page', pageParam.toString())
  }
  if (search?.dateFrom) {
    params.append('dateFrom', search.dateFrom)
  }
  if (search?.dateTo) {
    params.append('dateTo', search.dateTo)
  }
  if (search?.order) {
    params.append('order', search.order)
  }
  if (search?.tags && search.tags.length > 0) {
    params.append('tags', search.tags.join(','))
  }
  return params.toString()
}

export const photosApiSlice = apiSlice.injectEndpoints({
  endpoints: (builder) => ({
    getPhotos: builder.query<PhotosResponse, PhotoSearch | void>({
      query: (search) => {
        const queryString = buildPhotoSearchParams(search)
        return `photos${queryString ? `?${queryString}` : ''}`
      },
      providesTags() {
        return [{ type: 'Photos' as never, id: 'getPhotos' }]
      }
    }),
    getPhoto: builder.query<ILink, string>({
      query: (id) => `photos/${id}`,
      providesTags() {
        return [{ type: 'Photos' as never, id: 'getPhoto' }]
      }
    }),
    getInfinitePhotoWithMax: builder.infiniteQuery<
      InfinitePhotosResponse,
      PhotoSearch | void,
      number
    >({
      infiniteQueryOptions: {
        initialPageParam: 1,
        getNextPageParam: (
          lastPage,
          allPages,
          lastPageParam,
        ) => {
          // Use pagination metadata to determine if there are more pages
          if (lastPage.pagination && lastPageParam < lastPage.pagination.totalPages) {
            return lastPageParam + 1
          }
          return undefined
        },
        // Optionally provide a `getPreviousPageParam` function
        getPreviousPageParam: (
          firstPage,
          allPages,
          firstPageParam,
        ) => {
          return firstPageParam > 0 ? firstPageParam - 1 : undefined
        },
      },
      async queryFn(arg, api, extraOptions, baseQuery) {
        const { queryArg: search, pageParam } = arg
        const queryString = buildPhotoSearchParams(search, pageParam)
        const searchKey = buildPhotoSearchParams(search)
        const abortController = getInfiniteQueryAbortController(searchKey)
        const result = await baseQuery({
          url: `/photos?${queryString}`,
          signal: abortController.signal,
        })
        return result as QueryReturnValue<
          InfinitePhotosResponse,
          FetchBaseQueryError,
          FetchBaseQueryMeta | undefined
        >
      },
      providesTags() {
        return [{ type: 'Photos' as never, id: 'getInfinitePhotos' }]
      },
    }),
    uploadPhotos: builder.mutation<UploadResponse, FormData>({
      query: (formData) => ({
        url: "photos/upload",
        method: "POST",
        body: formData,
      }),
      invalidatesTags: [{ type: 'Photos' as never, id: 'getPhotos' }],
    }),
    changePhoto: builder.mutation<ILink, { id: string; data: { title: string, priority?: number, private?: boolean, tags?: string[] } }>({
      query: ({ id, data }) => ({
        url: `photos/${id}`,
        method: "PUT",
        body: data,
      }),
      invalidatesTags: [{ type: 'Photos' as never, id: 'getInfinitePhotos' }],
    }),
    deletePhoto: builder.mutation<UploadResponse, { id: string }>({
      query: ({ id }) => ({
        url: `photos/${id}`,
        method: "DELETE",
      }),
    }),
    getGalleryTokens: builder.query<string, void>({
      query: () => `photos/token`,
      providesTags() {
        return [{ type: 'Photos' as never, id: 'getGalleryToken' }]
      }
    }),
  }),
})

export const { useGetPhotoQuery, useGetPhotosQuery, useGetInfinitePhotoWithMaxInfiniteQuery, useGetGalleryTokensQuery, useChangePhotoMutation, useDeletePhotoMutation, useUploadPhotosMutation } = photosApiSlice
