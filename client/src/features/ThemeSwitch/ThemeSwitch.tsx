import styled from 'styled-components'
import { Checkbox } from '@/components/Checkbox'
import { selectTheme } from './store/selectors'
import { useSelector } from 'react-redux'
import { useAppDispatch } from '@/store/hooks'
import { changeTheme } from './store/themeSlice'
import { useEffect } from 'react'

const ThemeSwitchContainer = styled.div``

export function ThemeSwitch() {
  const theme = useSelector(selectTheme)
  useEffect(() => {
    localStorage.setItem('config', JSON.stringify({ theme }))
  }, [theme])
  const dispatch = useAppDispatch()
  const onChange = () => {
    dispatch(changeTheme())
  }
  return (
    <ThemeSwitchContainer>
      <Checkbox checked={theme === 'dark'} onChange={onChange} label='Тёмная тема'></Checkbox>
    </ThemeSwitchContainer>
  )
}
