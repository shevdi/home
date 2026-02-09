import { type KeyboardEvent } from 'react'
import styled from 'styled-components'
import { useChangePhotoMutation, useGetPhotoQuery } from '../model'
import { useLocation } from 'react-router'
import z from 'zod'
import { zodResolver } from '@hookform/resolvers/zod'
import { Controller, SubmitHandler, useForm } from 'react-hook-form'
import { Button, Checkbox, ErrMessage, Input, Loader, TagList } from '@/shared/ui'
import { getErrorMessage } from '@/shared/utils'
import { DeletePhoto } from './DeletePhoto'

const schema = z.object({
  title: z.string(),
  priority: z.number().optional(),
  private: z.boolean(),
  tags: z.array(z.string()).optional(),
  tagsInput: z.string().optional(),
})

type FormFields = z.infer<typeof schema>

export function EditPhoto() {
  const location = useLocation()
  const photoId = location.pathname.split('/')[2]
  const { data, isLoading } = useGetPhotoQuery(photoId)
  const [changePhoto] = useChangePhotoMutation()

  const {
    register,
    handleSubmit,
    control,
    setError,
    setValue,
    watch,
    formState: { isSubmitting, errors },
  } = useForm<FormFields>({
    resolver: zodResolver(schema),
    values: {
      title: data?.title ?? '',
      priority: data?.priority ?? 0,
      private: data?.private ?? false,
      tags: data?.tags ?? [],
      tagsInput: '',
    },
  })

  const tagInput = watch('tagsInput') ?? ''
  const tags = watch('tags') ?? []

  const addTag = (event: KeyboardEvent<HTMLInputElement>) => {
    if (event.key !== 'Enter') return
    event.preventDefault()
    const trimmed = tagInput.trim()
    if (!trimmed) return
    if (tags.includes(trimmed)) {
      setValue('tagsInput', '')
      return
    }
    const nextTags = [...tags, trimmed]
    setValue('tags', nextTags, { shouldValidate: true, shouldDirty: true })
    setValue('tagsInput', '')
  }

  const removeTag = (tagToRemove: string) => {
    const nextTags = tags.filter((tag) => tag !== tagToRemove)
    setValue('tags', nextTags, { shouldValidate: true, shouldDirty: true })
  }

  const onSubmit: SubmitHandler<FormFields> = async (data) => {
    try {
      const parsedData = schema.safeParse({
        ...data,
        private: data?.private,
        tags,
      })
      if (!parsedData.success) {
        setError('root', {
          message: 'Некорректное значение приватности.',
        })
        return
      }

      const { tags: parsedTags, title, priority, private: privateFilter } = parsedData.data

      await changePhoto({
        id: photoId,
        data: {
          title,
          priority,
          private: privateFilter,
          tags: parsedTags,
        },
      }).unwrap()
    } catch (error: unknown) {
      const message = getErrorMessage(error)
      setError('root', {
        message,
      })
    }
  }

  return (
    <PageContainer>
      <ErrMessage>{errors.root?.message}</ErrMessage>
      {isLoading ? (
        <Loader />
      ) : (
        <>
          <form onSubmit={handleSubmit(onSubmit)}>
            <Controller
              control={control}
              name='private'
              render={({ field }) => (
                <Checkbox
                  checked={!!field.value}
                  onChange={(checked) => {
                    field.onChange(checked)
                    // dispatch(setPrivateFilter(checked))
                  }}
                  label='Приватное'
                />
              )}
            />
            <Input label='Заголовок' {...register('title')} />
            <Input
              label='Приоритет'
              {...register('priority', {
                valueAsNumber: true,
              })}
              type='number'
            />
            <Input
              label='Теги'
              placeholder='Введите тег и нажмите Enter'
              {...register('tagsInput')}
              onKeyDown={addTag}
            />
            <TagList tags={tags} onClick={removeTag} />
            <Button display='block' margin='1rem auto' disabled={isSubmitting}>
              Сохранить
            </Button>
          </form>
          <Image src={data?.mdSizeUrl} />
          <DeletePhoto />
        </>
      )}
    </PageContainer>
  )
}

const PageContainer = styled.div``

const Image = styled.img`
  width: 100%;
`
