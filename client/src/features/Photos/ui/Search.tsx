import { useForm } from 'react-hook-form'
import styled from 'styled-components'
import { useDispatch, useSelector } from 'react-redux'
import { Dropdown, Input, TagList } from '@/shared/ui'
import { setOrderSearch, setDateFromSearch, setDateToSearch, setTagsSearch } from '../model/photosSlice'
import { selectSearch } from '../model'

type FormFields = {
  order: 'orderDownByTakenAt' | 'orderUpByTakenAt' | 'orderDownByEdited'
  dateFrom: string
  dateTo: string
  tagInput: string
}

export const Search = () => {
  const dispatch = useDispatch()
  const { dateFrom, dateTo, order, tags = [] } = useSelector(selectSearch)
  const { register, watch, setValue } = useForm<FormFields>({
    defaultValues: {
      order,
      dateFrom: dateFrom ?? '',
      dateTo: dateTo ?? '',
      tagInput: '',
    },
  })

  const tagInput = watch('tagInput') ?? ''

  const handleDateFromChange = (value: string) => {
    dispatch(setDateFromSearch(value.trim() ? value : null))
  }

  const handleDateToChange = (value: string) => {
    dispatch(setDateToSearch(value.trim() ? value : null))
  }

  const addTag = () => {
    const trimmed = tagInput.trim()
    if (!trimmed) return
    if (tags.includes(trimmed)) {
      setValue('tagInput', '')
      return
    }
    dispatch(setTagsSearch([...tags, trimmed]))
    setValue('tagInput', '')
  }

  const removeTag = (tagToRemove: string) => {
    dispatch(setTagsSearch(tags.filter((tag) => tag !== tagToRemove)))
  }

  return (
    <FilterContainer>
      <Dropdown
        label='Сортировать'
        id='photo-sort-order'
        {...register('order', {
          onChange: (event) => {
            dispatch(
              setOrderSearch(event.target.value as 'orderDownByTakenAt' | 'orderUpByTakenAt' | 'orderDownByEdited'),
            )
          },
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
