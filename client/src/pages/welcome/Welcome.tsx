import { Page } from '@/features'
import { useTitle } from '@/hooks'

export function WelcomePage() {
  useTitle('Главная')
  return <Page url='welcome' />
}
