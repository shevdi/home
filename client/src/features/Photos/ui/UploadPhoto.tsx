import styled from 'styled-components'
import { useUploadPhotosMutation } from '../model'
import { useMemo, useState } from 'react'
import { Button, Checkbox, ErrMessage, Input } from '@/shared/ui'
import { SubmitHandler, useForm, Controller } from 'react-hook-form'
import { z } from 'zod'
import { zodResolver } from '@hookform/resolvers/zod'
import exifr from 'exifr'

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

type FileMeta = {
  name: string
  size: number
  type: string
  lastModified: number
  width?: number
  height?: number
  make?: string
  model?: string
  takenAt?: string
  gps?: {
    lat: number
    lon: number
    alt?: number
  }
}

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

  const formatBytes = (bytes: number) => {
    if (!bytes) return '0 B'
    const sizes = ['B', 'KB', 'MB', 'GB']
    const index = Math.min(Math.floor(Math.log(bytes) / Math.log(1024)), sizes.length - 1)
    const value = bytes / Math.pow(1024, index)
    return `${value.toFixed(value >= 10 || index === 0 ? 0 : 1)} ${sizes[index]}`
  }

  const formatGps = (gps?: FileMeta['gps']) => {
    if (!gps) return ''
    const lat = Number.isFinite(gps.lat) ? gps.lat.toFixed(6) : ''
    const lon = Number.isFinite(gps.lon) ? gps.lon.toFixed(6) : ''
    if (!lat || !lon) return ''
    return `${lat}, ${lon}${Number.isFinite(gps.alt) ? ` · ${gps.alt}m` : ''}`
  }

  const formatDate = (value?: string) => {
    if (!value) return ''
    const date = new Date(value)
    if (Number.isNaN(date.getTime())) return value
    return date.toLocaleString()
  }

  const getImageDimensions = (file: File) =>
    new Promise<{ width: number; height: number } | undefined>((resolve) => {
      if (!file.type.startsWith('image/')) {
        resolve(undefined)
        return
      }

      const url = URL.createObjectURL(file)
      const img = new Image()
      img.onload = () => {
        const result = { width: img.width, height: img.height }
        URL.revokeObjectURL(url)
        resolve(result)
      }
      img.onerror = () => {
        URL.revokeObjectURL(url)
        resolve(undefined)
      }
      img.src = url
    })

  const getExifMeta = async (file: File) => {
    if (!file.type.startsWith('image/')) return {}
    try {
      const [gps, exif] = await Promise.all([
        exifr.gps(file).catch(() => null),
        exifr.parse(file, true).catch(() => null),
      ])

      const safeExif = (exif || {}) as Record<string, unknown>
      const make = typeof safeExif.Make === 'string' ? safeExif.Make : undefined
      const model = typeof safeExif.Model === 'string' ? safeExif.Model : undefined
      const takenAtValue = safeExif.DateTimeOriginal || safeExif.CreateDate || safeExif.ModifyDate
      const takenAt =
        takenAtValue instanceof Date
          ? takenAtValue.toISOString()
          : typeof takenAtValue === 'string'
            ? takenAtValue
            : undefined

      const safeGps = (gps || {}) as { latitude?: number; longitude?: number; altitude?: number }
      const lat = typeof safeGps.latitude === 'number' ? safeGps.latitude : undefined
      const lon = typeof safeGps.longitude === 'number' ? safeGps.longitude : undefined
      const alt = typeof safeGps.altitude === 'number' ? safeGps.altitude : undefined

      return {
        make,
        model,
        takenAt,
        gps: lat !== undefined && lon !== undefined ? { lat, lon, alt } : undefined,
      }
    } catch {
      return {}
    }
  }

  const buildMeta = async (selected: File[]) => {
    const baseMeta = selected.map((file) => ({
      name: file.name,
      size: file.size,
      type: file.type || 'unknown',
      lastModified: file.lastModified,
    }))

    const [dimensions, exifMeta] = await Promise.all([
      Promise.all(selected.map((file) => getImageDimensions(file))),
      Promise.all(selected.map((file) => getExifMeta(file))),
    ])
    return baseMeta.map((meta, index) => ({
      ...meta,
      width: dimensions[index]?.width,
      height: dimensions[index]?.height,
      ...exifMeta[index],
    }))
  }

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
