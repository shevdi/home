import { KeyboardEvent, useCallback, useMemo, useState } from 'react'
import styled, { keyframes } from 'styled-components'
import { z } from 'zod'
import { SubmitHandler, useForm, Controller } from 'react-hook-form'
import { useDropzone } from 'react-dropzone'
import { Button, Checkbox, ErrMessage, Input, TagList } from '@/shared/ui'
import { zodResolver } from '@hookform/resolvers/zod'
import { useAppDispatch, useAppSelector } from '@/app/store'
import { buildMeta, FileMeta } from '../utils/uploadPhotoMeta'
import { getFileId, resetUpload, uploadPhotosThunk } from '../model'
import { FileData } from './FileData'
import { getErrorMessage } from '@/shared/utils'

const dotPulse = keyframes`
  0%, 80%, 100% { opacity: 0.3; }
  40% { opacity: 1; }
`

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

const schema = z.object({
  files: z.array(z.instanceof(File)).min(1, { error: 'Пожалуйста, выберите файлы' }),
  private: z.boolean(),
  country: z.array(z.string()),
  city: z.array(z.string()),
  tags: z.array(z.string()),
  countryInput: z.string().optional(),
  cityInput: z.string().optional(),
  tagInput: z.string().optional(),
})

type FormFields = z.infer<typeof schema>

export function UploadPhoto() {
  const dispatch = useAppDispatch()
  const [fileMeta, setFileMeta] = useState<FileMeta[]>([])
  const { files: uploadFiles, isUploading } = useAppSelector((state) => state.upload)

  const uploadStatusById = useMemo(() => {
    const map = new Map<string, { status: 'pending' | 'uploading' | 'success' | 'error'; photoId?: string; error?: string }>()
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
    watch,
    register,
    getValues,
    formState: { errors },
  } = useForm<FormFields>({
    resolver: zodResolver(schema),
    defaultValues: {
      files: [],
      private: false,
      country: [],
      city: [],
      tags: [],
      countryInput: '',
      cityInput: '',
      tagInput: '',
    },
  })

  const files = watch('files') || []
  const country = watch('country') || []
  const city = watch('city') || []
  const tags = watch('tags') || []
  const isProcessed = isUploading

  const fileLabel = useMemo(() => getFileLabel(files.length), [files.length])

  const handleCountryKeyDown = (event: KeyboardEvent<HTMLInputElement>) => {
    if (event.key === 'Enter') {
      event.preventDefault()
      const trimmed = (getValues('countryInput') ?? '').trim()
      if (!trimmed) return
      const countries = [...country]
      countries.unshift(trimmed)
      setValue('country', Array.from(new Set(countries)), { shouldValidate: true, shouldDirty: true })
      setValue('countryInput', '')
    }
  }

  const handleCityKeyDown = (event: KeyboardEvent<HTMLInputElement>) => {
    if (event.key === 'Enter') {
      event.preventDefault()
      const trimmed = (getValues('cityInput') ?? '').trim()
      if (!trimmed) return
      const cities = [...city]
      cities.unshift(trimmed)
      setValue('city', Array.from(new Set(cities)), { shouldValidate: true, shouldDirty: true })
      setValue('cityInput', '')
    }
  }

  const handleTagKeyDown = (event: KeyboardEvent<HTMLInputElement>) => {
    if (event.key === 'Enter') {
      event.preventDefault()
      const trimmed = (getValues('tagInput') ?? '').trim()
      if (!trimmed || tags.includes(trimmed)) return
      setValue('tags', [...tags, trimmed])
      setValue('tagInput', '')
    }
  }

  const handleDrop = useCallback(
    async (acceptedFiles: File[]) => {
      dispatch(resetUpload())
      setValue('files', acceptedFiles, { shouldValidate: true })
      setFileMeta(acceptedFiles.length ? await buildMeta(acceptedFiles) : [])
    },
    [dispatch, setValue],
  )

  const { getRootProps, getInputProps, isDragActive } = useDropzone({
    onDrop: (acceptedFiles) => void handleDrop(acceptedFiles),
    accept: IMAGE_ACCEPT,
    disabled: isProcessed,
    multiple: true,
  })

  const onSubmit: SubmitHandler<FormFields> = async (submitData) => {
    const { success, data } = schema.safeParse(submitData)
    if (!success) {
      setError('files', {
        message: 'Пожалуйста, выберите файлы',
      })
      return
    }

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
        <DropzoneWrapper>
          <DropzoneArea
            {...getRootProps()}
            $isDragActive={isDragActive}
            $disabled={isProcessed}
            data-disabled={isProcessed}
          >
            <input {...getInputProps()} />
            {fileLabel}
          </DropzoneArea>
          {errors.files?.message && <ErrorText>{errors.files?.message}</ErrorText>}
        </DropzoneWrapper>
        {isUploading && (
          <ProgressIndicator>
            <DotsAnimation>
              <span>.</span>
              <span>.</span>
              <span>.</span>
            </DotsAnimation>
          </ProgressIndicator>
        )}
        <CheckboxContainer>
          <Controller
            control={control}
            name='private'
            render={({ field }) => (
              <Checkbox checked={field.value} onChange={field.onChange} label='Скрыть' disabled={isProcessed} />
            )}
          />
        </CheckboxContainer>
        <FieldWrapper>
          <Input
            label='Страна'
            id='upload-photo-country'
            placeholder='Введите страну и нажмите Enter'
            disabled={isProcessed}
            {...register('countryInput')}
            onKeyDown={handleCountryKeyDown}
          />
          <Controller
            control={control}
            name='country'
            render={({ field }) => (
              <TagList
                tags={field.value ?? []}
                onClick={(t) => field.onChange((field.value ?? []).filter((c) => c !== t))}
              />
            )}
          />
        </FieldWrapper>
        <FieldWrapper>
          <Input
            label='Город'
            id='upload-photo-city'
            placeholder='Введите город и нажмите Enter'
            disabled={isProcessed}
            {...register('cityInput')}
            onKeyDown={handleCityKeyDown}
          />
          <Controller
            control={control}
            name='city'
            render={({ field }) => (
              <TagList
                tags={field.value ?? []}
                onClick={(t) => field.onChange((field.value ?? []).filter((c) => c !== t))}
              />
            )}
          />
        </FieldWrapper>
        <FieldWrapper>
          <Input
            label='Теги'
            id='upload-photo-tags'
            placeholder='Введите тег и нажмите Enter'
            disabled={isProcessed}
            {...register('tagInput')}
            onKeyDown={handleTagKeyDown}
          />
          <Controller
            control={control}
            name='tags'
            render={({ field }) => (
              <TagList
                tags={field.value ?? []}
                onClick={(t) => field.onChange((field.value ?? []).filter((tag) => tag !== t))}
              />
            )}
          />
        </FieldWrapper>
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
                  />
                ))}
          </FileList>
        )}
        <Button
          type='submit'
          disabled={isProcessed || (files.length === 0 && uploadFiles.length === 0)}
        >
          {getSubmitLabel(Math.max(files.length, uploadFiles.length), isProcessed)}
        </Button>
      </form>
    </PageContainer>
  )
}

const PageContainer = styled.div``

const DropzoneWrapper = styled.div`
  margin-bottom: 1rem;
`

const DropzoneArea = styled.div<{ $isDragActive?: boolean; $disabled?: boolean }>`
  display: flex;
  align-items: center;
  justify-content: center;
  padding: 1rem 1.5rem;
  border-radius: var(--radius-md);
  cursor: ${({ $disabled }) => ($disabled ? 'not-allowed' : 'pointer')};
  user-select: none;
  border: 2px dashed
    ${({ $isDragActive, $disabled }) => ($isDragActive || $disabled ? 'var(--accent)' : 'var(--input-border)')};
  background: ${({ $isDragActive, $disabled }) =>
    $isDragActive || $disabled ? 'var(--input-disabled-color)' : 'var(--input-bg)'};
  color: var(--text-color);
  font-weight: 500;
  transition: all var(--transition-fast);

  &:hover:not([data-disabled='true']) {
    border-color: var(--accent);
    background: rgba(199, 107, 57, 0.08);
  }
`

const ErrorText = styled.div`
  margin-top: 0.4rem;
  font-size: 0.8rem;
  color: var(--error-color);
  min-height: 1rem;
`

const ProgressIndicator = styled.div`
  margin: 0.5rem 0;
  font-size: 0.9rem;
  color: var(--text-muted);
`

const DotsAnimation = styled.span`
  display: inline-flex;
  gap: 2px;

  span {
    animation: ${dotPulse} 1.4s ease-in-out infinite both;
  }
  span:nth-child(1) {
    animation-delay: 0s;
  }
  span:nth-child(2) {
    animation-delay: 0.2s;
  }
  span:nth-child(3) {
    animation-delay: 0.4s;
  }
`

const FileList = styled.div`
  margin: 1rem 0;
  padding: 1rem;
  background-color: var(--input-bg);
  border-radius: var(--radius-md);
  max-height: 300px;
  overflow-y: auto;
  border: 1px solid var(--input-border);
`

const CheckboxContainer = styled.div`
  margin: 0.75rem 0;
`

const FieldWrapper = styled.div`
  margin-bottom: 1rem;
`
