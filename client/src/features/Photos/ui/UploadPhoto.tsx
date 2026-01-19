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

export function UploadPhoto() {
  const [uploadPhoto, { isLoading }] = useUploadPhotosMutation()
  const [fileInputKey, setFileInputKey] = useState(0)

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
              onChange={(event) => {
                const selected = Array.from(event.target.files || [])
                field.onChange(selected)
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
            {files.map((file, index) => (
              <FileItem key={`${file.name}-${index}`}>{file.name}</FileItem>
            ))}
          </FileList>
        )}
        <Button type='submit' disabled={isLoading || isSubmitting || files.length === 0}>
          {isLoading || isSubmitting ? 'Загружается...' : `Загрузить ${files.length > 0 ? `${files.length} ` : ''}фото`}
        </Button>
      </form>
    </PageContainer>
  )
}
