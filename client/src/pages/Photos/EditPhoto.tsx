import { DeletePhoto, EditPhoto } from '@/features/Photos'
import { useTitle } from '@/shared/hooks'

export function EditPhotoPage() {
  useTitle('Редактирование фото')
  return (
    <>
      <EditPhoto />
      <DeletePhoto />
    </>
  )
}
