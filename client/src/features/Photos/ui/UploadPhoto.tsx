import { KeyboardEvent, useCallback, useMemo, useState } from 'react'
import styled from 'styled-components'
import { z } from 'zod'
import { SubmitHandler, useForm, Controller } from 'react-hook-form'
import { useDropzone } from 'react-dropzone'
import { Button, Checkbox, ErrMessage, Input, TagList } from '@/shared/ui'
import { zodResolver } from '@hookform/resolvers/zod'
import { UploadResponse, useUploadPhotosMutation } from '../model'
import { buildMeta, FileMeta } from '../utils/uploadPhotoMeta'
import { FileData } from './FileData'
import { getErrorMessage } from '@/shared/utils'

const getFileLabel = (count: number) => {
  if (count === 0) return 'Загрузить фото'
  if (count === 1) return '1 файл выбран'
  if (count < 5) return `${count} файла выбрано`
  return `${count} файлов выбрано`
}

const buildMetaPayload = ({ gps, make, model, takenAt }: FileMeta) => ({
  gpsLatitude: gps?.lat,
  gpsLongitude: gps?.lon,
  gpsAltitude: gps?.alt,
  make,
  model,
  takenAt,
})

const buildUploadFormData = (
  files: File[],
  isPrivate: boolean,
  meta: FileMeta[],
  country: string[],
  city: string[],
  tags: string[],
) => {
  const formData = new FormData()
  formData.append('private', isPrivate.toString())
  formData.append('meta', JSON.stringify(meta.map(buildMetaPayload)))
  if (country.length > 0) formData.append('country', country.join(','))
  if (city.length > 0) formData.append('city', city.join(','))
  if (tags.length > 0) formData.append('tags', tags.join(','))
  files.forEach((file) => {
    formData.append('files', file)
  })
  return formData
}

const getUploadMessage = (response?: { data?: UploadResponse }) => {
  const data = response?.data
  if (!data) return ''
  const { successCount, errorsCount, totalCount } = data
  if ([successCount, errorsCount, totalCount].some((value) => typeof value !== 'number')) return ''
  return `Загружено: ${successCount} из ${totalCount}. Ошибок: ${errorsCount}`
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
  files: z.array(z.instanceof(File)).min(1, 'Пожалуйста, выберите файлы'),
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
  const [uploadPhoto, { isLoading }] = useUploadPhotosMutation()
  const [fileMeta, setFileMeta] = useState<FileMeta[]>([])
  const [uploadMessage, setUploadMessage] = useState('')

  const {
    control,
    handleSubmit,
    setError,
    setValue,
    watch,
    register,
    getValues,
    formState: { isSubmitting, errors },
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
  const isProcessed = isLoading || isSubmitting

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
      setValue('files', acceptedFiles, { shouldValidate: true })
      setFileMeta(acceptedFiles.length ? await buildMeta(acceptedFiles) : [])
      setUploadMessage('')
    },
    [setValue],
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
    setFileMeta(metaForSubmit)
    const formData = buildUploadFormData(
      data.files,
      data.private,
      metaForSubmit,
      data.country ?? [],
      data.city ?? [],
      data.tags ?? [],
    )

    try {
      const response = await uploadPhoto(formData)

      const nextMessage = getUploadMessage(response)
      if (nextMessage) {
        setUploadMessage(nextMessage)
      }
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
        {uploadMessage && <UploadMessage>{uploadMessage}</UploadMessage>}
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
        {files.length > 0 && (
          <FileList>
            {files.map((file, index) => {
              const meta = fileMeta[index]
              return <FileData key={`${file.name}-${index}`} file={file} meta={meta} />
            })}
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

const FileList = styled.div`
  margin: 1rem 0;
  padding: 1rem;
  background-color: #f5f5f5;
  border-radius: 6px;
  max-height: 200px;
  overflow-y: auto;
`

const CheckboxContainer = styled.div`
  margin: 0.75rem 0;
`

const FieldWrapper = styled.div`
  margin-bottom: 1rem;
`

const UploadMessage = styled.div`
  margin-top: 0.5rem;
  font-size: 0.85rem;
  color: #2e7d32;
`
