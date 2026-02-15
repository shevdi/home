import { Button } from '@/shared/ui'
import { useSendLogoutMutation } from '../model'

export function Logout() {
  const [sendLogout] = useSendLogoutMutation()

  return (
    <Button margin='1rem 0 0 0' backgroundColor='var(--warning-color)' onClick={sendLogout}>
      Выйти
    </Button>
  )
}
