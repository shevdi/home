import { useEffect, useState } from 'react'
import styled from 'styled-components'
import { useChangePhotoMutation, useGetPhotoQuery } from '../model'
import { useLocation } from 'react-router'
import z from 'zod'
import { zodResolver } from '@hookform/resolvers/zod'
import { SubmitHandler, useForm } from 'react-hook-form'
import { useDispatch, useSelector } from 'react-redux'
import { Button, Checkbox, ErrMessage, Input } from '@/shared/ui'
import { RootState } from '@/app/store'
import { setPrivateFilter } from '../model/photosSlice'
import { getErrorMessage } from '@/shared/utils'


const schema = z.object({
  title: z.string(),
  priority: z.number().optional(),
  private: z.boolean(),
  tags: z.array(z.string()).optional(),
})

type FormFields = z.infer<typeof schema>

export function EditPhoto() {
  const location = useLocation()
  const photoId = location.pathname.split('/')[2]
  const { data } = useGetPhotoQuery(photoId)
  const [changePhoto] = useChangePhotoMutation()
  const dispatch = useDispatch()
  const privateFilter = useSelector((state: RootState) => state.photos.filter.private)

  const {
    register,
    handleSubmit,
    setError,
    setValue,
    // getValues,
    formState: { isSubmitting, errors },
  } = useForm<FormFields>({
    resolver: zodResolver(schema),
    defaultValues: {
      title: data?.title,
      priority: data?.priority || 0,
      private: privateFilter,
      tags: data?.tags || [],
    },
  })

  const [tagInput, setTagInput] = useState('')
  const [tags, setTags] = useState<string[]>([])
  const [tagsInitialized, setTagsInitialized] = useState(false)

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
      setTagInput('')
      return
    }
    const nextTags = [...tags, trimmed]
    setTags(nextTags)
    setValue('tags', nextTags, { shouldValidate: true, shouldDirty: true })
    setTagInput('')
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
        private: privateFilter,
        tags,
      })
      if (!parsedData.success) {
        setError('root', {
          message: 'Некорректное значение приватности.',
        })
        return
      }

      const { tags: parsedTags, ...rest } = parsedData.data

      await changePhoto({
        id: photoId,
        data: {
          ...rest,
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
      <form onSubmit={handleSubmit(onSubmit)}>
        <Input label='Заголовок' {...register('title')} />
        <Input
          label='Приоритет'
          {...register('priority', {
            valueAsNumber: true,
          })}
          type='number'
        />
        <Checkbox
          checked={privateFilter}
          onChange={(checked) => dispatch(setPrivateFilter(checked))}
          label='Приватные'
        />
        <Input
          label='Теги'
          name='tagsInput'
          placeholder='Введите тег и нажмите Enter'
          value={tagInput}
          onChange={(event) => setTagInput(event.target.value)}
          onKeyDown={(event) => {
            if (event.key === 'Enter') {
              event.preventDefault()
              addTag()
            }
          }}
        />
        <TagList>
          {tags.map((tag) => (
            <TagChip key={tag}>
              {tag}
              <TagRemoveButton type='button' onClick={() => removeTag(tag)} aria-label={`Удалить тег ${tag}`}>
                x
              </TagRemoveButton>
            </TagChip>
          ))}
        </TagList>
        <Button display='block' margin='1rem auto' disabled={isSubmitting}>
          Сохранить
        </Button>
      </form>
      <Image src={data?.mdSizeUrl} />
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

const TagList = styled.div`
  display: flex;
  flex-wrap: wrap;
  gap: 0.5rem;
  margin: 0.5rem 0 1rem;
`

const TagChip = styled.div`
  display: inline-flex;
  align-items: center;
  gap: 0.4rem;
  padding: 0.3rem 0.6rem;
  border: 1px solid #ccc;
  border-radius: 6px;
  background: #f5f5f5;
  color: #333;
  font-size: 0.9rem;
`

const TagRemoveButton = styled.button`
  border: none;
  background: transparent;
  color: #666;
  font-size: 0.9rem;
  cursor: pointer;
  padding: 0;

  &:hover {
    color: #000;
  }
`