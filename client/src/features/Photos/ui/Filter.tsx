import styled from 'styled-components'
import { useDispatch, useSelector } from 'react-redux'
import { Checkbox, Dropdown, Input } from '@/shared/ui'
import { setPrivateFilter, setDateFromFilter, setDateToFilter, setOrderFilter } from '../model/photosSlice'
import { RootState } from '@/app/store'

interface IProps {
  isHiddenFilters?: boolean
}

export const Filter = ({ isHiddenFilters }: IProps) => {
  const dispatch = useDispatch()
  const { private: privateFilter, dateFrom, dateTo, order } = useSelector((state: RootState) => state.photos.filter)

  const handlePrivateChange = (checked: boolean) => {
    dispatch(setPrivateFilter(checked))
  }

  const handleDateFromChange = (value: string) => {
    dispatch(setDateFromFilter(value.trim() ? value : null))
  }

  const handleDateToChange = (value: string) => {
    dispatch(setDateToFilter(value.trim() ? value : null))
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
        </>
      )}
    </FilterContainer>
  )
}

const FilterContainer = styled.div`
  padding: 1rem;
`

const DateInputs = styled.div`
  margin-top: 2rem;
  display: grid;
  grid-template-columns: repeat(auto-fit, minmax(180px, 1fr));
  gap: 0.75rem;
  width: min(480px, 100%);
`
