import styled from 'styled-components'
import { useDispatch, useSelector } from 'react-redux'
import { Checkbox } from '@/shared/ui'
import { setPrivateFilter } from '../model/photosSlice'
import { selectFilter } from '../model'

interface IProps {
  isHiddenFilters?: boolean
}

export const Filter = ({ isHiddenFilters }: IProps) => {
  const dispatch = useDispatch()
  const { private: privateFilter } = useSelector(selectFilter)

  const handlePrivateChange = (checked: boolean) => {
    dispatch(setPrivateFilter(checked))
  }

  return (
    <FilterContainer>
      {!isHiddenFilters && (
        <FilterRow>
          <Checkbox checked={privateFilter} onChange={handlePrivateChange} label='Приватные' color='var(--accent)' />
        </FilterRow>
      )}
    </FilterContainer>
  )
}

const FilterContainer = styled.div`
  margin-bottom: 1rem;
`

const FilterRow = styled.div`
  display: flex;
  align-items: center;
  gap: 0.5rem;
`
