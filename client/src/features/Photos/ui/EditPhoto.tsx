import { useEffect, useState } from 'react'
import styled from 'styled-components'
import { useChangePhotoMutation, useGetPhotoQuery } from '../model'
import { useLocation } from 'react-router'
import z from 'zod'
import { zodResolver } from '@hookform/resolvers/zod'
import { SubmitHandler, useForm } from 'react-hook-form'
import { useDispatch } from 'react-redux'
import { Button, Checkbox, ErrMessage, Input, Loader, TagList } from '@/shared/ui'
import { setPrivateFilter } from '../model/photosSlice'
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
  const dispatch = useDispatch()

  const {
    register,
    handleSubmit,
    setError,
    setValue,
    watch,
    formState: { isSubmitting, errors },
  } = useForm<FormFields>({
    resolver: zodResolver(schema),
    defaultValues: {
      title: data?.title,
      priority: data?.priority || 0,
      private: data?.private,
      tags: data?.tags || [],
      tagsInput: '',
    },
  })

  const [tags, setTags] = useState<string[]>([])
  const [tagsInitialized, setTagsInitialized] = useState(false)
  const tagInput = watch('tagsInput') ?? ''

  useEffect(() => {
    if (tagsInitialized || !data) return
    const initialTags = data.tags || []
    setTags(initialTags)
    setValue('tags', initialTags, { shouldValidate: true })
    setTagsInitialized(true)
  }, [data, setValue, tagsInitialized])

  const addTag = () => {
    const trimmed = tagInput.trim()
    if (!trimmed) return
    if (tags.includes(trimmed)) {
      setValue('tagsInput', '')
      return
    }
    const nextTags = [...tags, trimmed]
    setTags(nextTags)
    setValue('tags', nextTags, { shouldValidate: true, shouldDirty: true })
    setValue('tagsInput', '')
  }

  const removeTag = (tagToRemove: string) => {
    const nextTags = tags.filter((tag) => tag !== tagToRemove)
    setTags(nextTags)
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
      <PageHeader>Редактировать фото</PageHeader>
      <ErrMessage>{errors.root?.message}</ErrMessage>
      {isLoading ? (
        <Loader />
      ) : (
        <>
          <form onSubmit={handleSubmit(onSubmit)}>
            <Checkbox
              checked={!!data?.private}
              onChange={(checked) => dispatch(setPrivateFilter(checked))}
              label='Приватное'
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
              onKeyDown={(event) => {
                if (event.key === 'Enter') {
                  event.preventDefault()
                  addTag()
                }
              }}
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

const PageHeader = styled.h1`
  text-align: center;
`

const Image = styled.img`
  width: 100%;
`
