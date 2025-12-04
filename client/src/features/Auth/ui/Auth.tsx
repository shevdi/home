import { useAppSelector } from '@/app/store/hooks'
import { selectAuth } from '../model/selectors'
import { useRefreshMutation } from '../model/authApiSlice'
import { Logout } from './Logout'

export function Auth() {
  useRefreshMutation()
  const { token } = useAppSelector(selectAuth)
  return token ? <Logout /> : null
}
