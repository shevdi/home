import { apiSlice } from '@/app/store/api'
import type { FetchBaseQueryError, FetchBaseQueryMeta, QueryReturnValue } from '@reduxjs/toolkit/query'
import type { ILink, IPhotoAccessGrant, IPhotosResponse, PhotoSearchParams, UploadResponse } from '@shevdi-home/shared'
import { buildSearchParams } from '@/shared/utils'

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


export const photosApiSlice = apiSlice.injectEndpoints({
  endpoints: (builder) => ({
    getPhotos: builder.query<IPhotosResponse, PhotoSearchParams | void>({
      query: (search) => {
        const queryString = buildSearchParams(search)
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
      IPhotosResponse,
      PhotoSearchParams | void,
      number
    >({
      keepUnusedDataFor: 60 * 10,
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
        const queryString = buildSearchParams(search, pageParam)
        const searchKey = buildSearchParams(search)
        const abortController = getInfiniteQueryAbortController(searchKey)
        const result = await baseQuery({
          url: `/photos?${queryString}`,
          signal: abortController.signal,
        })
        return result as QueryReturnValue<
          IPhotosResponse,
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
    changePhoto: builder.mutation<
      ILink,
      {
        id: string
        data: {
          title: string
          priority?: number
          private?: boolean
          tags?: string[]
          location?: ILink['location']
          accessedBy?: IPhotoAccessGrant[]
        }
      }
    >({
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
