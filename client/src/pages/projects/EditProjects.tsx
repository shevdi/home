import { EditPage } from '@/features'
import { useTitle } from '@/hooks'

export function EditProjectsPage() {
  useTitle('Редактирование страницы с проектами')
  return <EditPage url='projects' />
}
