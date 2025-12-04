import { EditPage } from '@/features'
import { useTitle } from '@/shared/hooks'

export function EditProjectsPage() {
  useTitle('Редактирование страницы с проектами')
  return <EditPage url='projects' />
}
