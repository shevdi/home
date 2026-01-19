import styled from 'styled-components'
import { useUploadPhotosMutation } from '../model'
import { buildMeta, FileMeta, formatBytes, formatDate, formatGps } from '../utils/uploadPhotoMeta'
import { useMemo, useState } from 'react'
import { Button, Checkbox, ErrMessage, Input } from '@/shared/ui'
import { SubmitHandler, useForm, Controller } from 'react-hook-form'
import { z } from 'zod'
import { zodResolver } from '@hookform/resolvers/zod'

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

const FileItem = styled.div`
  padding: 0.5rem 0;
  font-size: 0.9rem;
  color: #333;
`

const CheckboxContainer = styled.div`
  margin: 0.75rem 0;
`

const UploadMessage = styled.div`
  margin-top: 0.5rem;
  font-size: 0.85rem;
  color: #2e7d32;
`

const schema = z.object({
  files: z.array(z.instanceof(File)).min(1, 'Пожалуйста, выберите файлы'),
  private: z.boolean(),
})

type FormFields = z.infer<typeof schema>

export function UploadPhoto() {
  const [uploadPhoto, { isLoading }] = useUploadPhotosMutation()
  const [fileInputKey, setFileInputKey] = useState(0)
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

  const fileLabel = useMemo(() => {
    if (files.length === 0) return 'Загрузить фото'

    if (files.length === 1) return '1 файл выбран'
    if (files.length < 5) return `${files.length} файла выбрано`
    return `${files.length} файлов выбрано`
  }, [files.length])

  const onSubmit: SubmitHandler<FormFields> = async (data) => {
    const parsedData = schema.safeParse(data)
    if (!parsedData.success) {
      setError('files', {
        message: 'Пожалуйста, выберите файлы',
      })
      return
    }

    const metaForSubmit =
      fileMeta.length === parsedData.data.files.length ? fileMeta : await buildMeta(parsedData.data.files)
    if (metaForSubmit.length !== fileMeta.length) {
      setFileMeta(metaForSubmit)
    }

    const formData = new FormData()
    formData.append('private', parsedData.data.private.toString())
    formData.append(
      'meta',
      JSON.stringify(
        metaForSubmit.map((meta) => ({
          gpsLatitude: meta.gps?.lat,
          gpsLongitude: meta.gps?.lon,
          gpsAltitude: meta.gps?.alt,
          make: meta.make,
          model: meta.model,
          takenAt: meta.takenAt,
        })),
      ),
    )
    parsedData.data.files.forEach((file) => {
      formData.append('files', file)
    })

    try {
      const response = await uploadPhoto(formData)
      if (response?.data?.ok) {
        reset({ files: [], private: parsedData.data.private })
        setFileInputKey((prev) => prev + 1)
        setFileMeta([])
      }

      if (response?.data) {
        const { successCount, fileCount, totalCount } = response.data
        if (typeof successCount === 'number' && typeof totalCount === 'number' && typeof fileCount === 'number') {
          setUploadMessage(`Загружено: ${successCount} из ${totalCount}. Ошибок: ${fileCount}`)
        }
      }
      /* eslint @typescript-eslint/no-explicit-any: "off" */
    } catch (error: any) {
      setError('root', {
        message: error?.data?.message || 'Не удалось загрузить файлы',
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
              key={fileInputKey}
              label={fileLabel}
              type='file'
              name={field.name}
              disabled={isLoading || isSubmitting}
              onChange={async (event) => {
                const selected = Array.from(event.target.files || [])
                field.onChange(selected)
                setFileMeta(selected.length ? await buildMeta(selected) : [])
                setUploadMessage('')
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
                disabled={isLoading || isSubmitting}
              />
            )}
          />
        </CheckboxContainer>
        {files.length > 0 && (
          <FileList>
            {files.map((file, index) => {
              const meta = fileMeta[index]
              return (
                <FileItem key={`${file.name}-${index}`}>
                  {file.name}
                  {meta && (
                    <>
                      &nbsp;|&nbsp;
                      {meta.type} · {formatBytes(meta.size)}
                      {meta.width && meta.height ? ` · ${meta.width} x ${meta.height}` : ''}
                      {meta.make || meta.model ? ` · ${[meta.make, meta.model].filter(Boolean).join(' ')}` : ''}
                      {meta.takenAt ? ` · ${formatDate(meta.takenAt)}` : ''}
                      {formatGps(meta.gps) ? ` · ${formatGps(meta.gps)}` : ''}
                    </>
                  )}
                </FileItem>
              )
            })}
          </FileList>
        )}
        <Button type='submit' disabled={isLoading || isSubmitting || files.length === 0}>
          {isLoading || isSubmitting ? 'Загружается...' : `Загрузить ${files.length > 0 ? `${files.length} ` : ''}фото`}
        </Button>
      </form>
    </PageContainer>
  )
}
