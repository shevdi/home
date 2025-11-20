import { useAppSelector } from '@/store/hooks'
import { selectAuth } from './store/selectors'
import { Logout } from './Logout'
import { useRefreshMutation } from './store/authApiSlice'

export function Auth() {
  useRefreshMutation()
  const { token } = useAppSelector(selectAuth)
  return token ? <Logout /> : null
}
