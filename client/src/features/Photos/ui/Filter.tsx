import styled from 'styled-components'
import { useDispatch, useSelector } from 'react-redux'
import { Checkbox } from '@/shared/ui'
import { setPrivateFilter } from '../model/photosSlice'
import { RootState } from '@/app/store'

interface IProps {
  isHiddenFilters?: boolean
}

export const Filter = ({ isHiddenFilters }: IProps) => {
  const dispatch = useDispatch()
  const privateFilter = useSelector((state: RootState) => state.photos.filter.private)

  const handlePrivateChange = (checked: boolean) => {
    dispatch(setPrivateFilter(checked))
  }

  return (
    <FilterContainer>
      {!isHiddenFilters && <Checkbox checked={privateFilter} onChange={handlePrivateChange} label='Приватная' />}
    </FilterContainer>
  )
}

const FilterContainer = styled.div`
  display: flex;
  align-items: center;
  padding: 1rem;
`
