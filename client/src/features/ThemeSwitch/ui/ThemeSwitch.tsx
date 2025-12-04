import styled from 'styled-components'
import { useSelector } from 'react-redux'
import { useAppDispatch } from '@/app/store/hooks'
import { Checkbox } from '@/shared/ui'
import { selectTheme } from '../model/selectors'
import { changeTheme } from '../model/themeSlice'
import { useUserConfigPersistance } from '@/shared/hooks/useThemePersistance'

const ThemeSwitchContainer = styled.div``

export function ThemeSwitch() {
  const theme = useSelector(selectTheme)
  useUserConfigPersistance('theme', theme)
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
