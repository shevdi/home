import { useEffect } from 'react'
import styled from 'styled-components'
import { useChangePhotoMutation } from '../model'
import { useLocation } from 'react-router'
import type { z } from 'zod'
import { zodResolver } from '@hookform/resolvers/zod'
import type { SubmitHandler} from 'react-hook-form';
import { useForm } from 'react-hook-form'
import { Button, ErrMessage, Loader } from '@/shared/ui'
import { getErrorMessage } from '@/shared/utils'
import { DeletePhoto } from './DeletePhoto'
import { PhotosNavigation } from './PhotosNavigation'
import { usePhoto } from '../hooks/usePhoto'
import { photoCommonFormSchema } from '../utils/photoCommonForm'
import { PhotoCommonFields } from './PhotoCommonFields'

const schema = photoCommonFormSchema

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
      tagInput: '',
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
        tagInput: '',
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
            <PhotoCommonFields<FormFields>
              control={control}
              register={register}
              trigger={trigger}
              disabled={isSubmitting}
              privateLabel='Приватное'
            />
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
