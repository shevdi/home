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
  const { private: privateFilter } = useSelector(
    selectFilter
  )

  const handlePrivateChange = (checked: boolean) => {
    dispatch(setPrivateFilter(checked))
  }

  return (
    <FilterContainer>
      {!isHiddenFilters && (
        <>
          <Checkbox checked={privateFilter} onChange={handlePrivateChange} label='Приватные' />
        </>
      )}
    </FilterContainer>
  )
}

const FilterContainer = styled.div`
  padding: 1rem 0;
  max-width: 480px;
`
