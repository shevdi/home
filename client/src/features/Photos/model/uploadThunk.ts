import { createAsyncThunk } from '@reduxjs/toolkit'
import type { FileMeta } from '../utils/uploadPhotoMeta'
import { uploadPhotosInBatches, type UploadPhotosOptions } from '../services/uploadPhotos'
import type { RootState } from '@/app/store/store'

export interface UploadPhotosThunkArg {
  files: File[]
  meta: FileMeta[]
  options: UploadPhotosOptions
}

export const uploadPhotosThunk = createAsyncThunk<
  void,
  UploadPhotosThunkArg,
  { state: RootState }
>(
  'upload/uploadPhotos',
  async (arg, { dispatch, getState }) => {
    await uploadPhotosInBatches(
      arg.files,
      arg.meta,
      arg.options,
      dispatch,
      getState,
    )
  },
)
