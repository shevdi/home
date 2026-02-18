import { type KeyboardEvent, useEffect } from 'react'
import styled from 'styled-components'
import { useChangePhotoMutation } from '../model'
import { useLocation } from 'react-router'
import z from 'zod'
import { zodResolver } from '@hookform/resolvers/zod'
import { Controller, SubmitHandler, useForm } from 'react-hook-form'
import { Button, Checkbox, ErrMessage, Input, Loader, TagList } from '@/shared/ui'
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
    setValue,
    watch,
    getValues,
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

  const tagInput = watch('tagsInput') ?? ''
  const tags = watch('tags') ?? []
  const country = watch('country') ?? []
  const city = watch('city') ?? []

  const handleCountryKeyDown = (event: KeyboardEvent<HTMLInputElement>) => {
    if (event.key !== 'Enter') return
    event.preventDefault()
    const trimmed = (getValues('countryInput') ?? '').trim()
    if (!trimmed) return
    const countries = [...city]
    countries.unshift(trimmed)
    setValue('country', Array.from(new Set(countries)), { shouldValidate: true, shouldDirty: true })
    setValue('countryInput', '')
  }

  const handleCityKeyDown = (event: KeyboardEvent<HTMLInputElement>) => {
    if (event.key !== 'Enter') return
    event.preventDefault()
    const trimmed = (getValues('cityInput') ?? '').trim()
    if (!trimmed) return
    const cities = [...city]
    cities.unshift(trimmed)
    setValue('city', Array.from(new Set(cities)), { shouldValidate: true, shouldDirty: true })
    setValue('cityInput', '')
  }

  const handleTagKeyDown = (event: KeyboardEvent<HTMLInputElement>) => {
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

  const handleRemoveTag = (tagToRemove: string) => {
    const nextTags = tags.filter((tag) => tag !== tagToRemove)
    setValue('tags', nextTags, { shouldValidate: true, shouldDirty: true })
  }

  const handleRemoveCountry = (toRemove: string) => {
    setValue(
      'country',
      country.filter((c) => c !== toRemove),
      { shouldValidate: true, shouldDirty: true },
    )
  }

  const handleRemoveCity = (toRemove: string) => {
    setValue(
      'city',
      city.filter((c) => c !== toRemove),
      { shouldValidate: true, shouldDirty: true },
    )
  }

  const onSubmit: SubmitHandler<FormFields> = async (data) => {
    try {
      const parsedData = schema.safeParse({
        ...data,
        private: data?.private,
        tags,
        country,
        city,
      } as FormFields)
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
            <Input label='Заголовок' {...register('title')} />
            <Input
              label='Приоритет'
              {...register('priority', {
                valueAsNumber: true,
              })}
              type='number'
            />
            <Input
              label='Страна'
              placeholder='Введите страну и нажмите Enter'
              {...register('countryInput')}
              onKeyDown={handleCountryKeyDown}
            />
            <TagList tags={country} onClick={handleRemoveCountry} />
            <Input
              label='Город'
              placeholder='Введите город и нажмите Enter'
              {...register('cityInput')}
              onKeyDown={handleCityKeyDown}
            />
            <TagList tags={city} onClick={handleRemoveCity} />
            <Input
              label='Теги'
              placeholder='Введите тег и нажмите Enter'
              {...register('tagsInput')}
              onKeyDown={handleTagKeyDown}
            />
            <TagList tags={tags} onClick={handleRemoveTag} />
            <Button display='block' margin='1rem auto' disabled={isSubmitting}>
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
