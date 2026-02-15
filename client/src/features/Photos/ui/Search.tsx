import { KeyboardEvent, useEffect, type ChangeEvent } from 'react'
import { useForm } from 'react-hook-form'
import z from 'zod'
import styled from 'styled-components'
import { useDispatch, useSelector } from 'react-redux'
import { Dropdown, Input, TagList } from '@/shared/ui'
import { PhotoOrder } from '@/shared/types'
import {
  setSearch,
  setOrderSearch,
  setDateFromSearch,
  setDateToSearch,
  setTagsSearch,
  setCountrySearch,
  setCitySearch,
} from '../model/photosSlice'
import { selectSearch } from '../model'
import { useQueryParams } from '@/shared/hooks'
import { zodResolver } from '@hookform/resolvers/zod'

const schema = z.object({
  order: z.string(),
  dateFrom: z.string(),
  dateTo: z.string(),
  countryInput: z.string().optional(),
  cityInput: z.string().optional(),
  priority: z.number().optional(),
  tags: z.array(z.string()).optional(),
  tagInput: z.string().optional(),
})

type FormFields = z.infer<typeof schema>

const ORDER_PARAMS: PhotoOrder[] = ['orderDownByTakenAt', 'orderUpByTakenAt', 'orderDownByEdited']

const ORDER_OPTIONS: { value: string; label: string }[] = [
  { value: 'orderDownByTakenAt', label: 'Вначале новые' },
  { value: 'orderUpByTakenAt', label: 'Вначале старые' },
  { value: 'orderDownByEdited', label: 'Последние загруженные' },
]

export const Search = () => {
  const dispatch = useDispatch()
  const { dateFrom, dateTo, order, tags = [], country = [], city = [] } = useSelector(selectSearch)
  const { queryParams, setQueryParams } = useQueryParams()
  const {
    dateFrom: dateFromParamValue,
    dateTo: dateToParamValue,
    order: orderParamValue,
    tags: tagsParamValue = [],
    country: countryParamValue = [],
    city: cityParamValue = [],
  } = queryParams
  const normalizedOrderParamValue = ORDER_PARAMS.includes(orderParamValue as PhotoOrder)
    ? (queryParams.order as PhotoOrder)
    : undefined
  const { register, setValue, getValues, watch } = useForm<FormFields>({
    resolver: zodResolver(schema),
    values: {
      order: normalizedOrderParamValue ?? order ?? '',
      dateFrom: dateFromParamValue ?? dateFrom ?? '',
      dateTo: dateToParamValue ?? dateTo ?? '',
      countryInput: '',
      cityInput: '',
      tagInput: '',
      tags: (tagsParamValue && tagsParamValue.length > 0 ? tagsParamValue : tags) ?? [],
    },
  })

  useEffect(() => {
    dispatch(
      setSearch({
        dateFrom: dateFromParamValue ?? dateFrom ?? '',
        dateTo: dateToParamValue ?? dateTo ?? '',
        order: (normalizedOrderParamValue ?? order ?? 'orderDownByTakenAt') as PhotoOrder,
        tags: tagsParamValue ?? tags ?? [],
        country: countryParamValue?.length ? countryParamValue : (country ?? []),
        city: cityParamValue?.length ? cityParamValue : (city ?? []),
      }),
    )
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [])

  const addCountry = (event: KeyboardEvent<HTMLInputElement>) => {
    if (event.key === 'Enter') {
      event.preventDefault()
      const trimmed = (getValues('countryInput') ?? '').trim()
      if (!trimmed) return
      if (country.includes(trimmed)) {
        setValue('countryInput', '')
        return
      }
      const nextCountries = [...country, trimmed]
      dispatch(setCountrySearch(nextCountries))
      setQueryParams({ dateFrom, dateTo, order, tags, country: nextCountries, city })
      setValue('countryInput', '')
    }
  }

  const removeCountry = (toRemove: string) => {
    const nextCountries = country.filter((c) => c !== toRemove)
    dispatch(setCountrySearch(nextCountries))
    setQueryParams({ dateFrom, dateTo, order, tags, country: nextCountries, city })
  }

  const addCity = (event: KeyboardEvent<HTMLInputElement>) => {
    if (event.key === 'Enter') {
      event.preventDefault()
      const trimmed = (getValues('cityInput') ?? '').trim()
      if (!trimmed) return
      if (city.includes(trimmed)) {
        setValue('cityInput', '')
        return
      }
      const nextCities = [...city, trimmed]
      dispatch(setCitySearch(nextCities))
      setQueryParams({ dateFrom, dateTo, order, tags, country, city: nextCities })
      setValue('cityInput', '')
    }
  }

  const removeCity = (toRemove: string) => {
    const nextCities = city.filter((c) => c !== toRemove)
    dispatch(setCitySearch(nextCities))
    setQueryParams({ dateFrom, dateTo, order, tags, country, city: nextCities })
  }

  const handleDateFromChange = (event: ChangeEvent<HTMLInputElement>) => {
    const value = event.target.value
    dispatch(setDateFromSearch(value))
    setQueryParams({ dateFrom: value, dateTo, order, tags, country, city })
  }

  const handleDateToChange = (event: ChangeEvent<HTMLInputElement>) => {
    const value = event.target.value
    dispatch(setDateToSearch(value))
    setQueryParams({ dateFrom, dateTo: value, order, tags, country, city })
  }

  const addTag = (event: KeyboardEvent<HTMLInputElement>) => {
    if (event.key === 'Enter') {
      event.preventDefault()
      const trimmed = (getValues('tagInput') ?? '').trim()
      if (!trimmed) return
      if (tags.includes(trimmed)) {
        setValue('tagInput', '')
        return
      }
      const nextTags = [...tags, trimmed]
      dispatch(setTagsSearch(nextTags))
      setQueryParams({ dateFrom, dateTo, order, tags: nextTags, country, city })
      setValue('tags', nextTags)
      setValue('tagInput', '')
    }
  }

  const removeTag = (tagToRemove: string) => {
    const nextTags = tags.filter((tag) => tag !== tagToRemove)
    dispatch(setTagsSearch(nextTags))
    setQueryParams({ dateFrom, dateTo, order, tags: nextTags, country, city })
    setValue('tags', nextTags)
  }

  const handleOrderChange = (event: React.ChangeEvent<HTMLSelectElement>) => {
    const nextOrder = event.target.value as PhotoOrder
    dispatch(setOrderSearch(nextOrder))
    setQueryParams({ dateFrom, dateTo, order: nextOrder, tags, country, city })
  }

  return (
    <SearchContainer>
      <SearchCard>
        <FieldWrapper>
          <Dropdown
            label='Сортировать'
            id='photo-sort-order'
            value={watch('order')}
            {...register('order', {
              onChange: handleOrderChange,
            })}
            options={ORDER_OPTIONS}
          />
        </FieldWrapper>
        <DateInputs>
          <Input
            label='Дата с'
            type='date'
            {...register('dateFrom', {
              onChange: handleDateFromChange,
            })}
          />
          <Input
            label='Дата по'
            type='date'
            {...register('dateTo', {
              onChange: handleDateToChange,
            })}
          />
        </DateInputs>
        <FieldWrapper>
          <Input
            label='Страна'
            id='photo-filter-country'
            placeholder='Введите страну и нажмите Enter'
            {...register('countryInput')}
            onKeyDown={addCountry}
          />
          <TagList tags={country} onClick={removeCountry} />
        </FieldWrapper>
        <FieldWrapper>
          <Input
            label='Город'
            id='photo-filter-city'
            placeholder='Введите город и нажмите Enter'
            {...register('cityInput')}
            onKeyDown={addCity}
          />
          <TagList tags={city} onClick={removeCity} />
        </FieldWrapper>
        <FieldWrapper>
          <Input
            label='Теги'
            id='photo-filter-tags'
            placeholder='Введите тег и нажмите Enter'
            {...register('tagInput')}
            onKeyDown={addTag}
          />
          <TagList tags={tags} onClick={removeTag} />
        </FieldWrapper>
      </SearchCard>
    </SearchContainer>
  )
}

const SearchContainer = styled.div`
  padding-bottom: 1.5rem;
`

const SearchCard = styled.div`
  display: grid;
  grid-template-columns: repeat(auto-fit, minmax(280px, 1fr));
  gap: 1rem 1.5rem;
  padding: 1.5rem;
  background: var(--glass-bg);
  backdrop-filter: blur(12px);
  -webkit-backdrop-filter: blur(12px);
  border-radius: var(--radius-lg);
  box-shadow: var(--glass-shadow);
  border: 1px solid var(--glass-border);
`

const FieldWrapper = styled.div``

const DateInputs = styled.div`
  display: grid;
  grid-template-columns: repeat(auto-fit, minmax(160px, 1fr));
  gap: 0 0.75rem;
`
