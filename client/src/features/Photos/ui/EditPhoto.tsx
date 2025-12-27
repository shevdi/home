import styled from 'styled-components'
import { useChangePhotoMutation, useGetPhotoQuery } from '../model'
import { useLocation } from 'react-router'
import z from 'zod'
import { zodResolver } from '@hookform/resolvers/zod'
import { SubmitHandler, useForm } from 'react-hook-form'
import { Button, ErrMessage, Input } from '@/shared/ui'

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
})

type FormFields = z.infer<typeof schema>

export function EditPhoto() {
  const location = useLocation()
  const photoId = location.pathname.split('/')[2]
  const { data } = useGetPhotoQuery(photoId)
  const [changePhoto] = useChangePhotoMutation()

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
      priority: 0,
    },
  })

  const onSubmit: SubmitHandler<FormFields> = async (data) => {
    try {
      await changePhoto({
        id: photoId,
        data,
      }).unwrap()
      /* eslint @typescript-eslint/no-explicit-any: "off" */
    } catch (error: any) {
      setError('root', {
        message: error?.data?.message,
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
        <Button display='block' margin='1rem auto' disabled={isSubmitting}>
          Сохранить
        </Button>
      </form>
      <Image src={data?.url} />
    </PageContainer>
  )
}
