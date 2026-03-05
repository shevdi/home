import {
  photoSearchParamsSchema,
  uploadBodySchema,
  uploadMetaSchema,
} from '@shevdi-home/shared'

export const photosQuerySchema = photoSearchParamsSchema
export type PhotosQuery = import('@shevdi-home/shared').PhotoSearchParams

export { uploadBodySchema, uploadMetaSchema }
export type UploadBody = import('@shevdi-home/shared').UploadBody
