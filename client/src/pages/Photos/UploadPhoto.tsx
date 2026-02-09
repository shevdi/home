import { UploadPhoto } from '@/features'
import { useTitle } from '@/shared/hooks'
import styled from 'styled-components'

export function UploadPhotoPage() {
  useTitle('Добавить фото')
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
