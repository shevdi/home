import { useCallback, useMemo, useState } from 'react'
import styled from 'styled-components'
import { z } from 'zod'
import { SubmitHandler, useForm, useWatch } from 'react-hook-form'
import { useDropzone } from 'react-dropzone'
import { Button, DotsProgressIndicator, ErrMessage, FileDropzone } from '@/shared/ui'
import { zodResolver } from '@hookform/resolvers/zod'
import { useAppDispatch, useAppSelector } from '@/app/store'
import { buildMeta, FileMeta } from '../utils/uploadPhotoMeta'
import { photoCommonFormDefaults, photoCommonFormSchema } from '../utils/photoCommonForm'
import { getFileId, removeUploadFile, resetUpload, uploadPhotosThunk } from '../model'
import { FileData } from './FileData'
import { getErrorMessage } from '@/shared/utils'
import { PhotoCommonFields } from './PhotoCommonFields'

const getFileLabel = (count: number) => {
  if (count === 0) return 'Загрузить фото'
  if (count === 1) return '1 файл выбран'
  if (count < 5) return `${count} файла выбрано`
  return `${count} файлов выбрано`
}

const getSubmitLabel = (count: number, isProcessed: boolean) => {
  if (isProcessed) return 'Загружается...'
  return `Загрузить ${count > 0 ? `${count} ` : ''}фото`
}

const IMAGE_ACCEPT = {
  'image/jpeg': ['.jpeg', '.jpg'],
  'image/png': ['.png'],
  'image/gif': ['.gif'],
  'image/webp': ['.webp'],
} as const

const schema = photoCommonFormSchema.extend({
  files: z.array(z.instanceof(File)).min(1, { error: 'Пожалуйста, выберите файлы' }),
})

type FormFields = z.infer<typeof schema>

export function UploadPhoto() {
  const dispatch = useAppDispatch()
  const [fileMeta, setFileMeta] = useState<FileMeta[]>([])
  const { files: uploadFiles, isUploading } = useAppSelector((state) => state.upload)

  const uploadStatusById = useMemo(() => {
    const map = new Map<
      string,
      { status: 'pending' | 'uploading' | 'success' | 'error'; photoId?: string; error?: string }
    >()
    for (const f of uploadFiles) {
      map.set(f.id, { status: f.status, photoId: f.photoId, error: f.error })
    }
    return map
  }, [uploadFiles])

  const {
    control,
    handleSubmit,
    setError,
    setValue,
    register,
    trigger,
    formState: { errors },
  } = useForm<FormFields>({
    resolver: zodResolver(schema),
    defaultValues: {
      ...photoCommonFormDefaults,
      files: [],
    },
  })

  const files = useWatch({ control, name: 'files', defaultValue: [] })
  const isProcessed = isUploading

  const fileLabel = useMemo(() => getFileLabel(files.length), [files.length])

  const handleDrop = useCallback(
    async (acceptedFiles: File[]) => {
      dispatch(resetUpload())
      setValue('files', acceptedFiles, { shouldValidate: true })
      setFileMeta(acceptedFiles.length ? await buildMeta(acceptedFiles) : [])
    },
    [dispatch, setValue],
  )

  const removeFileAt = useCallback(
    (index: number) => {
      if (isUploading) return
      const next = files.filter((_, i) => i !== index)
      setValue('files', next, { shouldValidate: true, shouldDirty: true })
      setFileMeta((prev) => prev.filter((_, i) => i !== index))
      if (next.length === 0) dispatch(resetUpload())
    },
    [dispatch, files, isUploading, setValue],
  )

  const { getRootProps, getInputProps, isDragActive } = useDropzone({
    onDrop: (acceptedFiles) => void handleDrop(acceptedFiles),
    accept: IMAGE_ACCEPT,
    disabled: isProcessed,
    multiple: true,
  })

  const onSubmit: SubmitHandler<FormFields> = async (data) => {
    const metaForSubmit = await buildMeta(data.files)

    try {
      await dispatch(
        uploadPhotosThunk({
          files: data.files,
          meta: metaForSubmit,
          options: {
            isPrivate: data.private,
            country: data.country ?? [],
            city: data.city ?? [],
            tags: data.tags ?? [],
            title: data.title,
            priority: data.priority,
          },
        }),
      ).unwrap()
    } catch (error: unknown) {
      const message = getErrorMessage(error)
      setError('root', {
        message: message || 'Не удалось загрузить файлы',
      })
    }
  }

  return (
    <PageContainer>
      <ErrMessage>{errors.root?.message}</ErrMessage>
      <form onSubmit={handleSubmit(onSubmit)}>
        <FileDropzone
          getRootProps={getRootProps}
          getInputProps={getInputProps}
          isDragActive={isDragActive}
          disabled={isProcessed}
          error={errors.files?.message}
        >
          {fileLabel}
        </FileDropzone>
        {isUploading && <DotsProgressIndicator />}
        <PhotoCommonFields<FormFields>
          control={control}
          register={register}
          trigger={trigger}
          disabled={isProcessed}
          privateLabel='Скрыть'
        />
        {(files.length > 0 || uploadFiles.length > 0) && (
          <FileList>
            {files.length > 0
              ? files.map((file, index) => {
                  const fileId = getFileId(file)
                  const statusInfo = uploadStatusById.get(fileId)
                  return (
                    <FileData
                      key={fileId}
                      file={file}
                      name={file.name}
                      meta={fileMeta[index]}
                      status={statusInfo?.status}
                      photoId={statusInfo?.photoId}
                      error={statusInfo?.error}
                      onRemove={isProcessed ? undefined : () => removeFileAt(index)}
                    />
                  )
                })
              : uploadFiles.map((entry) => (
                  <FileData
                    key={entry.id}
                    name={entry.name}
                    meta={entry.meta}
                    status={entry.status}
                    photoId={entry.photoId}
                    error={entry.error}
                    thumbnailUrl={entry.thumbnailUrl}
                    thumbnailDataUrl={entry.thumbnailDataUrl}
                    onRemove={isProcessed ? undefined : () => dispatch(removeUploadFile(entry.id))}
                  />
                ))}
          </FileList>
        )}
        <Button type='submit' disabled={isProcessed || files.length === 0}>
          {getSubmitLabel(files.length, isProcessed)}
        </Button>
      </form>
    </PageContainer>
  )
}

const PageContainer = styled.div``

const FileList = styled.div`
  margin: 1rem 0;
  padding: 1rem;
  background-color: var(--input-bg);
  border-radius: var(--radius-md);
  max-height: 300px;
  overflow-y: auto;
  border: 1px solid var(--input-border);
`