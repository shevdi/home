import { ChangeEvent, Dispatch, SetStateAction, useMemo, useState } from 'react'
import styled from 'styled-components'
import { z } from 'zod'
import { SubmitHandler, useForm, Controller } from 'react-hook-form'
import { Button, Checkbox, ErrMessage, Input } from '@/shared/ui'
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

const buildUploadFormData = (files: File[], isPrivate: boolean, meta: FileMeta[]) => {
  const formData = new FormData()
  formData.append('private', isPrivate.toString())
  formData.append('meta', JSON.stringify(meta.map(buildMetaPayload)))
  files.forEach((file) => {
    formData.append('files', file)
  })
  return formData
}

const getUploadMessage = (response?: { data?: UploadResponse}) => {
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

const handleFileInputChange = async (
  event: ChangeEvent<HTMLInputElement>,
  onChange: (value: File[]) => void,
  setFileMeta: Dispatch<SetStateAction<FileMeta[]>>,
  setUploadMessage: Dispatch<SetStateAction<string>>,
) => {
  const selected = Array.from(event.target.files || [])
  onChange(selected)
  setFileMeta(selected.length ? await buildMeta(selected) : [])
  setUploadMessage('')
}

const schema = z.object({
  files: z.array(z.instanceof(File)).min(1, 'Пожалуйста, выберите файлы'),
  private: z.boolean(),
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
    reset,
    watch,
    formState: { isSubmitting, errors },
  } = useForm<FormFields>({
    resolver: zodResolver(schema),
    defaultValues: {
      files: [],
      private: false,
    },
  })

  const files = watch('files') || []
  const isProcessed = isLoading || isSubmitting

  const fileLabel = useMemo(() => {
    return getFileLabel(files.length)
  }, [files.length])

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
    const formData = buildUploadFormData(data.files, data.private, metaForSubmit)

    try {
      const response = await uploadPhoto(formData)
      if (response?.data?.ok) {
        reset({ files: [], private: data.private })
        setFileMeta([])
      }

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
      <PageHeader>Добавить фото</PageHeader>
      <ErrMessage>{errors.root?.message}</ErrMessage>
      <form onSubmit={handleSubmit(onSubmit)}>
        <Controller
          control={control}
          name='files'
          render={({ field }) => (
            <Input
              label={fileLabel}
              type='file'
              name={field.name}
              disabled={isProcessed}
              onChange={(event) => {
                void handleFileInputChange(event, field.onChange, setFileMeta, setUploadMessage)
              }}
              onBlur={field.onBlur}
              multiple
              error={errors.files?.message}
            />
          )}
        />
        {uploadMessage && <UploadMessage>{uploadMessage}</UploadMessage>}
        <CheckboxContainer>
          <Controller
            control={control}
            name='private'
            render={({ field }) => (
              <Checkbox
                checked={field.value}
                onChange={field.onChange}
                label='Скрыть'
                disabled={isProcessed}
              />
            )}
          />
        </CheckboxContainer>
        {files.length > 0 && (
          <FileList>
            {files.map((file, index) => {
              const meta = fileMeta[index]
              return (
                <FileData key={`${file.name}-${index}`} file={file} meta={meta} />
              )
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

const PageHeader = styled.h1`
  text-align: center;
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

const UploadMessage = styled.div`
  margin-top: 0.5rem;
  font-size: 0.85rem;
  color: #2e7d32;
`
