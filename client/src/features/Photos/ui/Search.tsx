import { KeyboardEvent, useEffect, useRef, useState } from 'react'
import { useForm } from 'react-hook-form'
import z from 'zod'
import styled from 'styled-components'
import { useDispatch, useSelector } from 'react-redux'
import { CalendarPopover, Dropdown, Input, TagList } from '@/shared/ui'
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
import { useQueryParams, useSearchAnalytics } from '@/shared/hooks'
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

const DEFAULT_DATE_FROM = '2016-03-26'

const getTodayYMD = () => {
  const d = new Date()
  return `${d.getFullYear()}-${String(d.getMonth() + 1).padStart(2, '0')}-${String(d.getDate()).padStart(2, '0')}`
}

const toDate = (str: string): Date | null => (str ? new Date(str + 'T12:00:00') : null)
const toYMD = (d: Date): string => {
  const y = d.getFullYear()
  const m = String(d.getMonth() + 1).padStart(2, '0')
  const day = String(d.getDate()).padStart(2, '0')
  return `${y}-${m}-${day}`
}
const toDMY = (ymd: string): string => {
  if (!ymd) return ''
  const [y, m, d] = ymd.split('-')
  return d && m && y ? `${d}-${m}-${y}` : ymd
}

export const Search = () => {
  const dispatch = useDispatch()
  const { dateFrom, dateTo, order, tags = [], country = [], city = [] } = useSelector(selectSearch)
  const { queryParams, setQueryParams } = useQueryParams()

  useSearchAnalytics({ dateFrom, dateTo, order, tags, country, city })
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
      dateFrom: dateFromParamValue || dateFrom || DEFAULT_DATE_FROM,
      dateTo: dateToParamValue || dateTo || getTodayYMD(),
      countryInput: '',
      cityInput: '',
      tagInput: '',
      tags: (tagsParamValue && tagsParamValue.length > 0 ? tagsParamValue : tags) ?? [],
    },
  })

  useEffect(() => {
    dispatch(
      setSearch({
        dateFrom: dateFromParamValue || dateFrom || DEFAULT_DATE_FROM,
        dateTo: dateToParamValue || dateTo || getTodayYMD(),
        order: (normalizedOrderParamValue ?? order ?? 'orderDownByTakenAt') as PhotoOrder,
        tags: tagsParamValue ?? tags ?? [],
        country: countryParamValue?.length ? countryParamValue : (country ?? []),
        city: cityParamValue?.length ? cityParamValue : (city ?? []),
      }),
    )
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [])

  const [calendarOpen, setCalendarOpen] = useState(false)
  const calendarRef = useRef<HTMLDivElement>(null)

  const calendarValue: [Date | null, Date | null] =
    dateFrom && dateTo ? [toDate(dateFrom), toDate(dateTo)] : dateFrom ? [toDate(dateFrom), null] : [null, null]

  const shownCalendarValue =
    dateFrom && dateTo
      ? `${toDMY(dateFrom)} — ${toDMY(dateTo)}`
      : dateFrom
        ? `${toDMY(dateFrom)} — ${toDMY(getTodayYMD())}`
        : ''

  const handleCountryKeyDown = (event: KeyboardEvent<HTMLInputElement>) => {
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

  const handleRemoveCountry = (toRemove: string) => {
    const nextCountries = country.filter((c) => c !== toRemove)
    dispatch(setCountrySearch(nextCountries))
    setQueryParams({ dateFrom, dateTo, order, tags, country: nextCountries, city })
  }

  const handleCityKeyDown = (event: KeyboardEvent<HTMLInputElement>) => {
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

  const handleRemoveCity = (toRemove: string) => {
    const nextCities = city.filter((c) => c !== toRemove)
    dispatch(setCitySearch(nextCities))
    setQueryParams({ dateFrom, dateTo, order, tags, country, city: nextCities })
  }

  const handleCalendarChange = (value: Date | [Date | null, Date | null] | null) => {
    const range = Array.isArray(value) ? value : value ? [value, value] : [null, null]
    const [from, to] = range
    const fromStr = from ? toYMD(from) : ''
    const toStr = to ? toYMD(to) : ''
    dispatch(setDateFromSearch(fromStr))
    dispatch(setDateToSearch(toStr))
    setQueryParams({ dateFrom: fromStr, dateTo: toStr, order, tags, country, city })
    setValue('dateFrom', fromStr)
    setValue('dateTo', toStr)
    if (fromStr && toStr) setCalendarOpen(false)
  }

  const handleClearDates = () => {
    dispatch(setDateFromSearch(''))
    dispatch(setDateToSearch(''))
    setQueryParams({ dateFrom: '', dateTo: '', order, tags, country, city })
    setValue('dateFrom', '')
    setValue('dateTo', '')
    setCalendarOpen(false)
  }

  useEffect(() => {
    const handleClickOutside = (e: MouseEvent) => {
      if (calendarRef.current && !calendarRef.current.contains(e.target as Node)) {
        setCalendarOpen(false)
      }
    }
    if (calendarOpen) document.addEventListener('mousedown', handleClickOutside)
    return () => document.removeEventListener('mousedown', handleClickOutside)
  }, [calendarOpen])

  const handleTagKeyDown = (event: KeyboardEvent<HTMLInputElement>) => {
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

  const handleRemoveTag = (tagToRemove: string) => {
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
        <DateRangeWrapper ref={calendarRef}>
          <DateRangeLabel htmlFor='photo-filter-date'>Период</DateRangeLabel>
          <DateRangeInput
            id='photo-filter-date'
            type='text'
            readOnly
            value={shownCalendarValue}
            placeholder='Выберите период'
            onClick={() => setCalendarOpen((o) => !o)}
            aria-expanded={calendarOpen}
          />
          {calendarOpen && (
            <CalendarPopover value={calendarValue} onChange={handleCalendarChange} onClear={handleClearDates} />
          )}
        </DateRangeWrapper>
        <FieldWrapper>
          <Input
            label='Страна'
            id='photo-filter-country'
            placeholder='Введите страну и нажмите Enter'
            {...register('countryInput')}
            onKeyDown={handleCountryKeyDown}
          />
          <TagList tags={country} onClick={handleRemoveCountry} />
        </FieldWrapper>
        <FieldWrapper>
          <Input
            label='Город'
            id='photo-filter-city'
            placeholder='Введите город и нажмите Enter'
            {...register('cityInput')}
            onKeyDown={handleCityKeyDown}
          />
          <TagList tags={city} onClick={handleRemoveCity} />
        </FieldWrapper>
        <FieldWrapper>
          <Input
            label='Теги'
            id='photo-filter-tags'
            placeholder='Введите тег и нажмите Enter'
            {...register('tagInput')}
            onKeyDown={handleTagKeyDown}
          />
          <TagList tags={tags} onClick={handleRemoveTag} />
        </FieldWrapper>
      </SearchCard>
    </SearchContainer>
  )
}

const SearchContainer = styled.div`
  position: relative;
  z-index: 110;
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

const DateRangeWrapper = styled.div`
  position: relative;
  margin-bottom: 1rem;
`

const DateRangeLabel = styled.label`
  display: block;
  margin-bottom: 0.5rem;
  font-weight: 500;
  font-size: 0.9rem;
  color: var(--text-muted);
`

const DateRangeInput = styled.input`
  width: 100%;
  padding: 0.65rem 1rem;
  border: 1px solid var(--input-border);
  border-radius: var(--radius-md);
  font-size: 0.95rem;
  font-family: inherit;
  color: var(--text-color);
  background-color: var(--input-bg);
  cursor: pointer;
  transition:
    border-color var(--transition-fast),
    box-shadow var(--transition-fast);

  &::placeholder {
    color: var(--text-muted);
  }

  &:focus {
    outline: none;
    border-color: var(--input-focus);
    box-shadow: 0 0 0 3px var(--input-focus-shadow);
  }

  &:hover {
    border-color: var(--text-muted);
  }
`
