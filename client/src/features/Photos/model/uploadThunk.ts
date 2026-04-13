import { createAsyncThunk } from '@reduxjs/toolkit'
import type { FileMeta } from '../utils/uploadPhotoMeta'
import { uploadPhotosInBatches } from '../services/uploadPhotos'
import type { RootState } from '@/app/store/store'
import type { PerFileOptions } from '../utils/perFileOptions'

export interface UploadPhotosThunkArg {
  files: File[]
  meta: FileMeta[]
  perFileOptions: PerFileOptions[]
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
      arg.perFileOptions,
      dispatch,
      getState,
    )
  },
)
