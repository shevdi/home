import { apiSlice } from '@/app/store/api'
import { ILink } from '@/shared/types'

export interface UploadResponse {
  ok: boolean
  successCount?: number
  errorsCount?: number
  totalCount?: number
  results?: Array<{ ok: boolean; fileName: string; error?: string }>
  error?: string
}

interface PhotosFilter {
  private?: boolean
  dateFrom?: string | null
  dateTo?: string | null
  order?: 'orderDownByTakenAt' | 'orderUpByTakenAt' | 'orderDownByEdited'
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

export const photosApiSlice = apiSlice.injectEndpoints({
  endpoints: (builder) => ({
    getPhotos: builder.query<PhotosResponse, PhotosFilter | void>({
      query: (filter) => {
        const params = new URLSearchParams()
        if (filter?.private !== undefined) {
          params.append('private', filter.private.toString())
        }
        if (filter?.dateFrom) {
          params.append('dateFrom', filter.dateFrom)
        }
        if (filter?.dateTo) {
          params.append('dateTo', filter.dateTo)
        }
        if (filter?.order) {
          params.append('order', filter.order)
        }
        if (filter?.tags && filter.tags.length > 0) {
          params.append('tags', filter.tags.join(','))
        }
        const queryString = params.toString()
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
      { photos: ILink[], pagination: { currentPage: number, totalPages: number, totalCount: number, pageSize: number } },
      PhotosFilter | void,
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
      query(arg: { queryArg: PhotosFilter | void; pageParam: number }) {
        const { queryArg: filter, pageParam } = arg
        const params = new URLSearchParams()
        params.append('page', pageParam.toString())
        if (filter?.private !== undefined) {
          params.append('private', filter.private.toString())
        }
        if (filter?.dateFrom) {
          params.append('dateFrom', filter.dateFrom)
        }
        if (filter?.dateTo) {
          params.append('dateTo', filter.dateTo)
        }
        if (filter?.order) {
          params.append('order', filter.order)
        }
        if (filter?.tags && filter.tags.length > 0) {
          params.append('tags', filter.tags.join(','))
        }
        return `/photos?${params.toString()}`
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
