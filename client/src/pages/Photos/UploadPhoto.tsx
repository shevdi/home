import { UploadPhoto, PhotoNotFound } from '@/features'
import { useTitle } from '@/shared/hooks'
import { useAuth } from '@/shared/hooks/useAuth'
import styled from 'styled-components'

export function UploadPhotoPage() {
  useTitle('Добавить фото')
  const { isAdmin } = useAuth()

  if (!isAdmin) {
    return <PhotoNotFound />
  }

  return (
    <>
      <PageHeader>Добавить фото</PageHeader>
      <UploadPhoto />
    </>
  )
}

const PageHeader = styled.h1`
  text-align: center;
`
