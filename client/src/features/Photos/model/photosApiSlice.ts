import { apiSlice } from '@/app/store/api'
import { ILink } from '@/shared/types'

interface UploadResponse {
  ok: boolean
}

export const photosApiSlice = apiSlice.injectEndpoints({
  endpoints: (builder) => ({
    getPhotos: builder.query<ILink[], void>({
      query: () => `photos`,
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
    uploadPhotos: builder.mutation<UploadResponse, FormData>({
      query: (formData) => ({
        url: "photos/upload",
        method: "POST",
        body: formData,
      }),
    }),
    changePhoto: builder.mutation<UploadResponse, { id: string; data: { title: string } }>({
      query: ({ id, data }) => ({
        url: `photos/${id}`,
        method: "PUT",
        body: data,
      }),
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

export const { useGetPhotoQuery, useGetPhotosQuery, useGetGalleryTokensQuery, useChangePhotoMutation, useDeletePhotoMutation, useUploadPhotosMutation } = photosApiSlice
