import { useState } from 'react'
import styled from 'styled-components'
import { useDispatch, useSelector } from 'react-redux'
import { Checkbox, Dropdown, Input } from '@/shared/ui'
import { setPrivateFilter, setDateFromFilter, setDateToFilter, setOrderFilter, setTagsFilter } from '../model/photosSlice'
import { selectFilters } from '../model'

interface IProps {
  isHiddenFilters?: boolean
}

export const Filter = ({ isHiddenFilters }: IProps) => {
  const dispatch = useDispatch()
  const { private: privateFilter, dateFrom, dateTo, order, tags = [] } = useSelector(
    selectFilters
  )
  const [tagInput, setTagInput] = useState('')

  const handlePrivateChange = (checked: boolean) => {
    dispatch(setPrivateFilter(checked))
  }

  const handleDateFromChange = (value: string) => {
    dispatch(setDateFromFilter(value.trim() ? value : null))
  }

  const handleDateToChange = (value: string) => {
    dispatch(setDateToFilter(value.trim() ? value : null))
  }

  const addTag = () => {
    const trimmed = tagInput.trim()
    if (!trimmed) return
    if (tags.includes(trimmed)) {
      setTagInput('')
      return
    }
    dispatch(setTagsFilter([...tags, trimmed]))
    setTagInput('')
  }

  const removeTag = (tagToRemove: string) => {
    dispatch(setTagsFilter(tags.filter((tag) => tag !== tagToRemove)))
  }

  return (
    <FilterContainer>
      {!isHiddenFilters && (
        <>
          <Checkbox checked={privateFilter} onChange={handlePrivateChange} label='Приватные' />
          <Dropdown
            label='Сортировать'
            name='photo-sort-order'
            value={order}
            onChange={(event) =>
              dispatch(
                setOrderFilter(
                  event.target.value as 'orderDownByTakenAt' | 'orderUpByTakenAt' | 'orderDownByEdited',
                ),
              )
            }
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
              value={dateFrom ?? ''}
              onChange={(event) => handleDateFromChange(event.target.value)}
            />
            <Input
              label='Дата по'
              type='date'
              value={dateTo ?? ''}
              onChange={(event) => handleDateToChange(event.target.value)}
            />
          </DateInputs>
          <Input
            label='Теги'
            name='photo-filter-tags'
            placeholder='Введите тег и нажмите Enter'
            value={tagInput}
            onChange={(event) => setTagInput(event.target.value)}
            onKeyDown={(event) => {
              if (event.key === 'Enter') {
                event.preventDefault()
                addTag()
              }
            }}
          />
          {tags.length > 0 && (
            <TagList>
              {tags.map((tag) => (
                <TagChip key={tag}>
                  {tag}
                  <TagRemoveButton
                    type='button'
                    onClick={() => removeTag(tag)}
                    aria-label={`Удалить тег ${tag}`}
                  >
                    x
                  </TagRemoveButton>
                </TagChip>
              ))}
            </TagList>
          )}
        </>
      )}
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

const TagList = styled.div`
  display: flex;
  flex-wrap: wrap;
  gap: 0.5rem;
  margin-top: 0.5rem;
`

const TagChip = styled.div`
  display: inline-flex;
  align-items: center;
  gap: 0.4rem;
  padding: 0.3rem 0.6rem;
  border: 1px solid #ccc;
  border-radius: 6px;
  background: #f5f5f5;
  color: #333;
  font-size: 0.9rem;
`

const TagRemoveButton = styled.button`
  border: none;
  background: transparent;
  color: #666;
  font-size: 0.9rem;
  cursor: pointer;
  padding: 0;

  &:hover {
    color: #000;
  }
`
