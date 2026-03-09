import { EditPage } from '@/features'
import { useTitle } from '@/shared/hooks'

export function EditWelcomePage() {
  useTitle('Редактирование главной страницы')
  return <EditPage url='welcome' />
}
