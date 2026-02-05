import { useEffect, useMemo } from 'react'
import { useForm } from 'react-hook-form'
import styled from 'styled-components'
import { useDispatch, useSelector } from 'react-redux'
import { Dropdown, Input, TagList } from '@/shared/ui'
import { setOrderSearch, setDateFromSearch, setDateToSearch, setTagsSearch } from '../model/photosSlice'
import { selectSearch } from '../model'
import { useSearchParams } from 'react-router'

type FormFields = {
  order: 'orderDownByTakenAt' | 'orderUpByTakenAt' | 'orderDownByEdited'
  dateFrom: string
  dateTo: string
  tagInput: string
}

export const Search = () => {
  const dispatch = useDispatch()
  const { dateFrom, dateTo, order, tags = [] } = useSelector(selectSearch)
  const [searchParams, setSearchParams] = useSearchParams()
  const orderParam = searchParams.get('order') as FormFields['order'] | null
  const dateFromParam = searchParams.get('dateFrom')
  const dateToParam = searchParams.get('dateTo')
  const tagsParamValue = searchParams.get('tags')
  const tagsFromParams = useMemo(() => {
    if (!tagsParamValue) return []
    return tagsParamValue
      .split(',')
      .map((tag) => tag.trim())
      .filter(Boolean)
  }, [tagsParamValue])
  const { register, watch, setValue } = useForm<FormFields>({
    defaultValues: {
      order: orderParam ?? order,
      dateFrom: dateFromParam ?? dateFrom ?? '',
      dateTo: dateToParam ?? dateTo ?? '',
      tagInput: '',
    },
  })

  const tagInput = watch('tagInput') ?? ''

  useEffect(() => {
    if (orderParam && orderParam !== order) {
      dispatch(setOrderSearch(orderParam))
    }
    if (searchParams.has('dateFrom')) {
      const normalizedDateFrom = dateFromParam?.trim() ? dateFromParam : null
      if (normalizedDateFrom !== dateFrom) {
        dispatch(setDateFromSearch(normalizedDateFrom))
      }
    }
    if (searchParams.has('dateTo')) {
      const normalizedDateTo = dateToParam?.trim() ? dateToParam : null
      if (normalizedDateTo !== dateTo) {
        dispatch(setDateToSearch(normalizedDateTo))
      }
    }
    if (searchParams.has('tags')) {
      const hasSameTags =
        tags.length === tagsFromParams.length && tags.every((tag, index) => tag === tagsFromParams[index])
      if (!hasSameTags) {
        dispatch(setTagsSearch(tagsFromParams))
      }
    }
  }, [dispatch, order, orderParam, dateFrom, dateFromParam, dateTo, dateToParam, tags, tagsFromParams, searchParams])

  const updateSearchParams = (next: {
    dateFrom: string | null
    dateTo: string | null
    order: FormFields['order']
    tags: string[]
  }) => {
    const params = new URLSearchParams()
    if (next.dateFrom) {
      params.set('dateFrom', next.dateFrom)
    }
    if (next.dateTo) {
      params.set('dateTo', next.dateTo)
    }
    if (next.order) {
      params.set('order', next.order)
    }
    if (next.tags.length > 0) {
      params.set('tags', next.tags.join(','))
    }
    setSearchParams(params)
  }

  const handleDateFromChange = (value: string) => {
    const normalized = value.trim() ? value : null
    dispatch(setDateFromSearch(normalized))
    updateSearchParams({ dateFrom: normalized, dateTo, order, tags })
  }

  const handleDateToChange = (value: string) => {
    const normalized = value.trim() ? value : null
    dispatch(setDateToSearch(normalized))
    updateSearchParams({ dateFrom, dateTo: normalized, order, tags })
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
    updateSearchParams({ dateFrom, dateTo, order, tags: nextTags })
    setValue('tagInput', '')
  }

  const removeTag = (tagToRemove: string) => {
    const nextTags = tags.filter((tag) => tag !== tagToRemove)
    dispatch(setTagsSearch(nextTags))
    updateSearchParams({ dateFrom, dateTo, order, tags: nextTags })
  }

  const handleOrderChange = (event: React.ChangeEvent<HTMLSelectElement>) => {
    const nextOrder = event.target.value as 'orderDownByTakenAt' | 'orderUpByTakenAt' | 'orderDownByEdited'
    dispatch(setOrderSearch(nextOrder))
    updateSearchParams({ dateFrom, dateTo, order: nextOrder, tags })
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
