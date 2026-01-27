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

const PageContainer = styled.div``

const PageHeader = styled.h1`
  text-align: center;
`

const Image = styled.img`
  width: 100%;
`

const schema = z.object({
  title: z.string(),
  priority: z.number().optional(),
  private: z.boolean(),
})

type FormFields = z.infer<typeof schema>

export function EditPhoto() {
  const location = useLocation()
  const photoId = location.pathname.split('/')[2]
  const { data } = useGetPhotoQuery(photoId)
  const [changePhoto] = useChangePhotoMutation()
  const dispatch = useDispatch()
  const privateFilter = useSelector((state: RootState) => state.photos.filter.private)

  // const photoPrivate = (data as (ILink & { private?: boolean }) | undefined)?.private

  const {
    register,
    handleSubmit,
    setError,
    // getValues,
    formState: { isSubmitting, errors },
  } = useForm<FormFields>({
    resolver: zodResolver(schema),
    defaultValues: {
      title: data?.title,
      priority: data?.priority || 0,
      private: privateFilter,
    },
  })

  const onSubmit: SubmitHandler<FormFields> = async (data) => {
    try {
      const parsedData = schema.safeParse({
        ...data,
        private: privateFilter,
      })
      if (!parsedData.success) {
        setError('root', {
          message: 'Некорректное значение приватности.',
        })
        return
      }

      await changePhoto({
        id: photoId,
        data: parsedData.data,
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
        <Button display='block' margin='1rem auto' disabled={isSubmitting}>
          Сохранить
        </Button>
      </form>
      <Image src={data?.mdSizeUrl} />
    </PageContainer>
  )
}
