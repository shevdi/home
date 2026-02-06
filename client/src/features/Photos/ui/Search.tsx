import { useEffect } from 'react'
import { useForm } from 'react-hook-form'
import styled from 'styled-components'
import { useDispatch, useSelector } from 'react-redux'
import { Dropdown, Input, TagList } from '@/shared/ui'
import { PhotoOrder } from '@/shared/types'
import { setOrderSearch, setDateFromSearch, setDateToSearch, setTagsSearch, setSearch } from '../model/photosSlice'
import { selectSearch } from '../model'
import { useQueryParams } from '@/shared/hooks'

type FormFields = {
  order: PhotoOrder
  dateFrom: string
  dateTo: string
  tagInput: string
  tags: string[]
}

const ORDER_PARAMS: PhotoOrder[] = ['orderDownByTakenAt', 'orderUpByTakenAt', 'orderDownByEdited']

export const Search = () => {
  const dispatch = useDispatch()
  const { dateFrom, dateTo, order, tags = [] } = useSelector(selectSearch)
  const { queryParams, setQueryParams } = useQueryParams()
  const {
    dateFrom: dateFromParamValue,
    dateTo: dateToParamValue,
    order: orderParamValue,
    tags: tagsParamValue = [],
  } = queryParams
  const normalizedOrderParamValue = ORDER_PARAMS.includes(orderParamValue as PhotoOrder)
    ? (queryParams.order as PhotoOrder)
    : undefined
  const { register, watch, setValue } = useForm<FormFields>({
    defaultValues: {
      order: normalizedOrderParamValue ?? order ?? '',
      dateFrom: dateFromParamValue ?? dateFrom ?? '',
      dateTo: dateToParamValue ?? dateTo ?? '',
      tagInput: '',
      tags: (tagsParamValue && tagsParamValue.length > 0 ? tagsParamValue : tags) ?? [],
    },
  })

  const tagInput = watch('tagInput') ?? ''

  useEffect(() => {
    dispatch(
      setSearch({
        order: normalizedOrderParamValue ?? order ?? '',
        dateFrom: dateFromParamValue ?? dateFrom ?? '',
        dateTo: dateToParamValue ?? dateTo ?? '',
        tags: tagsParamValue ?? tags ?? [],
      }),
    )
  }, [])

  const handleDateFromChange = (value: string) => {
    dispatch(setDateFromSearch(value))
    setQueryParams({ dateFrom: value, dateTo, order, tags: tags })
  }

  const handleDateToChange = (value: string) => {
    dispatch(setDateToSearch(value))
    setQueryParams({ dateFrom, dateTo: value, order, tags: tags })
  }

  const addTag = () => {
    const trimmed = tagInput.trim()
    if (!trimmed) return
    if (tags.includes(trimmed)) {
      setValue('tagInput', '')
      return
    }
    const nextTags = [...tags, trimmed]
    dispatch(setTagsSearch(nextTags))
    setQueryParams({ dateFrom, dateTo, order, tags: nextTags })
    setValue('tags', nextTags)
    setValue('tagInput', '')
  }

  const removeTag = (tagToRemove: string) => {
    const nextTags = tags.filter((tag) => tag !== tagToRemove)
    dispatch(setTagsSearch(nextTags))
    setQueryParams({ dateFrom, dateTo, order, tags: nextTags })
    setValue('tags', nextTags)
  }

  const handleOrderChange = (event: React.ChangeEvent<HTMLSelectElement>) => {
    const nextOrder = event.target.value as PhotoOrder
    dispatch(setOrderSearch(nextOrder))
    setQueryParams({ dateFrom, dateTo, order: nextOrder, tags: tags })
  }

  return (
    <FilterContainer>
      <Dropdown
        label='Сортировать'
        id='photo-sort-order'
        {...register('order', {
          onChange: handleOrderChange,
        })}
        options={[
          { value: 'orderDownByTakenAt', label: 'Вначале новые' },
          { value: 'orderUpByTakenAt', label: 'Вначале старые' },
          { value: 'orderDownByEdited', label: 'Последние загруженные' },
        ]}
      />
      <DateInputs>
        <Input
          label='Дата с'
          type='date'
          {...register('dateFrom', {
            onChange: (event) => handleDateFromChange(event.target.value),
          })}
        />
        <Input
          label='Дата по'
          type='date'
          {...register('dateTo', {
            onChange: (event) => handleDateToChange(event.target.value),
          })}
        />
      </DateInputs>
      <Input
        label='Теги'
        id='photo-filter-tags'
        placeholder='Введите тег и нажмите Enter'
        {...register('tagInput')}
        onKeyDown={(event) => {
          if (event.key === 'Enter') {
            event.preventDefault()
            addTag()
          }
        }}
      />
      {tags.length > 0 && <TagList tags={tags} onClick={removeTag} />}
    </FilterContainer>
  )
}

const FilterContainer = styled.div`
  padding: 1rem 0;
  max-width: 480px;
`

const DateInputs = styled.div`
  margin-top: 2rem;
  display: grid;
  grid-template-columns: repeat(auto-fit, minmax(180px, 1fr));
  gap: 0.75rem;
  width: min(480px, 100%);
`
