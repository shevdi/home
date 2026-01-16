import styled from 'styled-components'
import { useUploadPhotosMutation } from '../model'
import { ChangeEvent, useState } from 'react'
import { Button, Checkbox, Input } from '@/shared/ui'

const PageContainer = styled.div``

const PageHeader = styled.h1`
  text-align: center;
`

const FileList = styled.div`
  margin: 1rem 0;
  padding: 1rem;
  background-color: #f5f5f5;
  border-radius: 6px;
  max-height: 200px;
  overflow-y: auto;
`

const FileItem = styled.div`
  padding: 0.5rem 0;
  font-size: 0.9rem;
  color: #333;
`

const CheckboxContainer = styled.div`
  margin: 0.75rem 0;
`

export function UploadPhoto() {
  const [files, setFiles] = useState<File[]>([])
  const [isPrivate, setIsPrivate] = useState(false)

  const [uploadPhoto, { isLoading }] = useUploadPhotosMutation()
  const handleFileChange = (e: ChangeEvent<HTMLInputElement>) => {
    const selected = Array.from(e.target.files || [])
    setFiles(selected)
  }

  const handleUpload = async () => {
    if (!files || files.length === 0) return alert('Пожалуйста, выберите файлы')

    const formData = new FormData()
    formData.append('private', isPrivate.toString())
    files.forEach((file) => {
      formData.append('files', file)
    })

    const response = await uploadPhoto(formData)
    if (response?.data?.ok) {
      setFiles([])
      // Reset file input
      const fileInput = document.querySelector('input[type="file"]') as HTMLInputElement
      if (fileInput) {
        fileInput.value = ''
      }
    }

    if (response?.data) {
      const { successCount, fileCount, totalCount } = response.data
      if (fileCount && fileCount > 0) {
        alert(`Загружено: ${successCount} из ${totalCount}. Ошибок: ${fileCount}`)
      }
    }
  }

  const fileLabel =
    files.length > 0
      ? `${files.length} ${files.length === 1 ? 'файл выбран' : files.length < 5 ? 'файла выбрано' : 'файлов выбрано'}`
      : 'Загрузить фото'

  return (
    <PageContainer>
      <PageHeader>Добавить фото</PageHeader>
      <Input label={fileLabel} type='file' disabled={isLoading} onChange={handleFileChange} multiple />
      <CheckboxContainer>
        <Checkbox checked={isPrivate} onChange={setIsPrivate} label='Приватные' />
      </CheckboxContainer>
      {files.length > 0 && (
        <FileList>
          {files.map((file, index) => (
            <FileItem key={index}>{file.name}</FileItem>
          ))}
        </FileList>
      )}
      <Button onClick={handleUpload} disabled={isLoading || files.length === 0}>
        {isLoading ? 'Загружается...' : `Загрузить ${files.length > 0 ? `${files.length} ` : ''}фото`}
      </Button>
    </PageContainer>
  )
}
