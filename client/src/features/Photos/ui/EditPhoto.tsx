import { useEffect } from 'react'
import styled from 'styled-components'
import { useChangePhotoMutation } from '../model'
import { useLocation } from 'react-router'
import z from 'zod'
import { zodResolver } from '@hookform/resolvers/zod'
import { Controller, SubmitHandler, useForm } from 'react-hook-form'
import { Button, Checkbox, ErrMessage, Field, Input, Loader, RhfTaggedInput } from '@/shared/ui'
import { getErrorMessage } from '@/shared/utils'
import { DeletePhoto } from './DeletePhoto'
import { PhotosNavigation } from './PhotosNavigation'
import { usePhoto } from '../hooks/usePhoto'

const schema = z.object({
  title: z.string(),
  priority: z.number().optional(),
  private: z.boolean(),
  country: z.array(z.string()),
  city: z.array(z.string()),
  tags: z.array(z.string()).optional(),
  countryInput: z.string().optional(),
  cityInput: z.string().optional(),
  tagsInput: z.string().optional(),
})

type FormFields = z.infer<typeof schema>

export function EditPhoto() {
  const location = useLocation()
  const photoId = location.pathname.split('/')[2]
  const { photo, neighbours, isLoading } = usePhoto()
  const [changePhoto] = useChangePhotoMutation()

  const {
    register,
    handleSubmit,
    control,
    reset,
    setError,
    trigger,
    formState: { isSubmitting, errors },
  } = useForm<FormFields>({
    resolver: zodResolver(schema),
    values: {
      title: photo?.title ?? '',
      priority: photo?.priority ?? 0,
      private: photo?.private ?? false,
      country: photo?.location?.value?.country ?? [],
      city: photo?.location?.value?.city ?? [],
      tags: photo?.tags ?? [],
      countryInput: '',
      cityInput: '',
      tagsInput: '',
    },
  })

  useEffect(() => {
    if (photo) {
      reset({
        title: photo.title ?? '',
        priority: photo.priority ?? 0,
        private: photo.private ?? false,
        country: photo.location?.value?.country ?? [],
        city: photo.location?.value?.city ?? [],
        tags: photo.tags ?? [],
        countryInput: '',
        cityInput: '',
        tagsInput: '',
      })
    }
  }, [photo, reset])

  const onSubmit: SubmitHandler<FormFields> = async (data) => {
    try {
      const parsedData = schema.safeParse(data)
      if (!parsedData.success) {
        setError('root', {
          message: 'Некорректное значение приватности.',
        })
        return
      }

      const {
        tags: parsedTags,
        title,
        priority,
        private: privateFilter,
        country: parsedCountry,
        city: parsedCity,
      } = parsedData.data

      await changePhoto({
        id: photoId,
        data: {
          title,
          priority,
          private: privateFilter,
          tags: parsedTags,
          location: {
            ...photo?.location,
            value: {
              country: parsedCountry ?? [],
              city: parsedCity ?? [],
            },
          },
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
      <PhotosNavigation photo={photo} neighbours={neighbours} pathSuffix='/edit' />
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
            <Field label='Заголовок'>
              <Input {...register('title')} />
            </Field>
            <Field label='Приоритет'>
              <Input
                {...register('priority', {
                  valueAsNumber: true,
                })}
                type='number'
              />
            </Field>
            <Field label='Страна'>
              <RhfTaggedInput<FormFields>
                control={control}
                trigger={trigger}
                tagsName='country'
                inputName='countryInput'
                placeholder='Введите страну и нажмите Enter'
                insertAt='start'
              />
            </Field>
            <Field label='Город'>
              <RhfTaggedInput<FormFields>
                control={control}
                trigger={trigger}
                tagsName='city'
                inputName='cityInput'
                placeholder='Введите город и нажмите Enter'
                insertAt='start'
              />
            </Field>
            <Field label='Теги'>
              <RhfTaggedInput<FormFields>
                control={control}
                trigger={trigger}
                tagsName='tags'
                inputName='tagsInput'
                placeholder='Введите тег и нажмите Enter'
              />
            </Field>
            <Button type='submit' display='block' margin='1rem auto' disabled={isSubmitting}>
              Сохранить
            </Button>
          </form>
          <Image src={photo?.mdSizeUrl} />
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
