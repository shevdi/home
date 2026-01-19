import styled from 'styled-components'
import { useUploadPhotosMutation } from '../model'
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
}

export function UploadPhoto() {
  const [uploadPhoto, { isLoading }] = useUploadPhotosMutation()
  const [fileInputKey, setFileInputKey] = useState(0)
  const [fileMeta, setFileMeta] = useState<FileMeta[]>([])

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

  const buildMeta = async (selected: File[]) => {
    const baseMeta = selected.map((file) => ({
      name: file.name,
      size: file.size,
      type: file.type || 'unknown',
      lastModified: file.lastModified,
    }))

    const dimensions = await Promise.all(selected.map((file) => getImageDimensions(file)))
    return baseMeta.map((meta, index) => ({
      ...meta,
      width: dimensions[index]?.width,
      height: dimensions[index]?.height,
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

    const formData = new FormData()
    formData.append('private', parsedData.data.private.toString())
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
        if (fileCount && fileCount > 0) {
          alert(`Загружено: ${successCount} из ${totalCount}. Ошибок: ${fileCount}`)
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
              }}
              onBlur={field.onBlur}
              multiple
              error={errors.files?.message}
            />
          )}
        />
        <CheckboxContainer>
          <Controller
            control={control}
            name='private'
            render={({ field }) => (
              <Checkbox
                checked={field.value}
                onChange={field.onChange}
                label='Скрытые'
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
