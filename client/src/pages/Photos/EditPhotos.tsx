import { EditPhotos, PhotoNotFound } from '@/features/Photos'
import { useTitle } from '@/shared/hooks'
import { useAuth } from '@/shared/hooks/useAuth'
import styled from 'styled-components'

export function EditPhotosPage() {
  useTitle('Редактирование фото')
  const { isAdmin } = useAuth()

  if (!isAdmin) {
    return <PhotoNotFound />
  }

  return (
    <>
      <PageHeader>Редактирование фото</PageHeader>
      <EditPhotos />
    </>
  )
}

const PageHeader = styled.h1`
  text-align: center;
`
