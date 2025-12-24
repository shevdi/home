import styled from 'styled-components'
import { useUploadPhotosMutation } from '../model'
import { ChangeEvent, useState } from 'react'
import { Button, Input } from '@/shared/ui'

const PageContainer = styled.div``

const PageHeader = styled.h1`
  text-align: center;
`

export function UploadPhoto() {
  const [file, setFile] = useState<File | null>(null)

  const [uploadPhoto, { isLoading }] = useUploadPhotosMutation()
  const handleFileChange = (e: ChangeEvent<HTMLInputElement>) => {
    const selected = e.target.files?.[0] || null
    setFile(selected)
  }

  const handleUpload = async () => {
    if (!file) return alert('Please select a file')

    const formData = new FormData()
    formData.append('file', file)

    const response = await uploadPhoto(formData)
    if (response?.data?.ok) {
      setFile(null)
    }
  }

  return (
    <PageContainer>
      <PageHeader>Добавить фото</PageHeader>
      <Input label={file?.name || 'Загрузить фото'} type='file' disabled={isLoading} onChange={handleFileChange} />

      <Button onClick={handleUpload} disabled={isLoading}>
        {isLoading ? 'Загружается...' : 'Загрузить фото'}
      </Button>
    </PageContainer>
  )
}
