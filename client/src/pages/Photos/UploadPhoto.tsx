import { UploadPhoto } from '@/features'
import { useTitle } from '@/shared/hooks'

export function UploadPhotoPage() {
  useTitle('Добавить фото')
  return (
    <>
      <UploadPhoto />
    </>
  )
}
