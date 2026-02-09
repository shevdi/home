import { EditPhoto } from '@/features/Photos'
import { useTitle } from '@/shared/hooks'
import styled from 'styled-components'

export function EditPhotoPage() {
  useTitle('Редактирование фото')
  return (
    <>
      <PageHeader>Редактировать фото</PageHeader>
      <EditPhoto />
    </>
  )
}

const PageHeader = styled.h1`
  text-align: center;
`
