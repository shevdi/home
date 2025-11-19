import { useAppSelector } from '@/store/hooks'
import { selectAuth } from './store/selectors'
import { Logout } from './Logout'

export function Auth() {
  const { token } = useAppSelector(selectAuth)
  return token ? <Logout /> : null
}
