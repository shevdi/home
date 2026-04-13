import { useEffect, useState } from 'react'
import { useForm } from 'react-hook-form'
import z from 'zod'
import styled from 'styled-components'
import { useDispatch, useSelector } from 'react-redux'
import { DateRangeCalendar } from '@/shared/ui/DateRangeCalendar'
import { Dropdown, Field, RhfTaggedInput } from '@/shared/ui'
import { PhotoOrder } from '@shevdi-home/shared'
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
import { PLACEHOLDER_SAVE_VALUE } from '../utils/formPlaceholders'

const schema = z.object({
  order: z.string(),
  dateFrom: z.string(),
  dateTo: z.string(),
  country: z.array(z.string()),
  city: z.array(z.string()),
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
  const { register, setValue, watch, control, trigger } = useForm<FormFields>({
    resolver: zodResolver(schema),
    values: {
      order: normalizedOrderParamValue ?? order ?? '',
      dateFrom: dateFromParamValue || dateFrom || DEFAULT_DATE_FROM,
      dateTo: dateToParamValue || dateTo || getTodayYMD(),
      countryInput: '',
      cityInput: '',
      tagInput: '',
      tags: (tagsParamValue && tagsParamValue.length > 0 ? tagsParamValue : tags) ?? [],
      country: countryParamValue?.length ? countryParamValue : (country ?? []),
      city: cityParamValue?.length ? cityParamValue : (city ?? []),
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

  const calendarValue: [Date | null, Date | null] =
    dateFrom && dateTo ? [toDate(dateFrom), toDate(dateTo)] : dateFrom ? [toDate(dateFrom), null] : [null, null]

  const shownCalendarValue =
    dateFrom && dateTo
      ? `${toDMY(dateFrom)} — ${toDMY(dateTo)}`
      : dateFrom
        ? `${toDMY(dateFrom)} — ${toDMY(getTodayYMD())}`
        : ''

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
        <DateRangeCalendar
          label='Период'
          inputId='photo-filter-date'
          open={calendarOpen}
          onOpenChange={setCalendarOpen}
          displayValue={shownCalendarValue}
          placeholder='Выберите период'
          calendarValue={calendarValue}
          onCalendarChange={handleCalendarChange}
          onClear={handleClearDates}
        />
        <FieldWrapper>
          <Field label='Страна'>
            <RhfTaggedInput<FormFields>
              control={control}
              trigger={trigger}
              tagsName='country'
              inputName='countryInput'
              id='photo-filter-country'
              placeholder={PLACEHOLDER_SAVE_VALUE}
              insertAt='start'
              onAfterTagsChange={(next) => {
                dispatch(setCountrySearch(next))
                setQueryParams({ dateFrom, dateTo, order, tags, country: next, city })
              }}
            />
          </Field>
        </FieldWrapper>
        <FieldWrapper>
          <Field label='Город'>
            <RhfTaggedInput<FormFields>
              control={control}
              trigger={trigger}
              tagsName='city'
              inputName='cityInput'
              id='photo-filter-city'
              placeholder={PLACEHOLDER_SAVE_VALUE}
              insertAt='start'
              onAfterTagsChange={(next) => {
                dispatch(setCitySearch(next))
                setQueryParams({ dateFrom, dateTo, order, tags, country, city: next })
              }}
            />
          </Field>
        </FieldWrapper>
        <FieldWrapper>
          <Field label='Теги'>
            <RhfTaggedInput<FormFields>
              control={control}
              trigger={trigger}
              tagsName='tags'
              inputName='tagInput'
              id='photo-filter-tags'
              placeholder={PLACEHOLDER_SAVE_VALUE}
              onAfterTagsChange={(next) => {
                dispatch(setTagsSearch(next))
                setQueryParams({ dateFrom, dateTo, order, tags: next, country, city })
              }}
            />
          </Field>
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
