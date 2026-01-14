import React from 'react'
import styled from 'styled-components'
import { useDispatch, useSelector } from 'react-redux'
import { Checkbox } from '@/shared/ui'
import { setPrivateFilter } from '../model/photosSlice'
import { RootState } from '@/app/store'

export const Filter: React.FC = () => {
  const dispatch = useDispatch()
  const privateFilter = useSelector((state: RootState) => state.photos.filter.private)

  const handlePrivateChange = (checked: boolean) => {
    dispatch(setPrivateFilter(checked))
  }

  return (
    <FilterContainer>
      <Checkbox checked={privateFilter} onChange={handlePrivateChange} label='Private' />
    </FilterContainer>
  )
}

const FilterContainer = styled.div`
  display: flex;
  align-items: center;
  padding: 1rem;
`
