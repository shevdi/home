import type { ReactNode } from 'react'
import type { ILink } from '@shevdi-home/shared'
import { FileData } from './FileData'

type BulkEditPhotoRowProps = {
  photo: ILink
  selected: boolean
  onToggleSelect: () => void
  onRemove: () => void
  rowError?: string
  children?: ReactNode
}

export function BulkEditPhotoRow({
  photo,
  selected,
  onToggleSelect,
  onRemove,
  rowError,
  children,
}: BulkEditPhotoRowProps) {
  const photoId = photo._id
  if (!photoId) return null

  const thumb = photo.smSizeUrl || photo.mdSizeUrl
  const name = photo.title?.trim() ? photo.title : 'Без названия'

  return (
    <FileData
      name={name}
      thumbnailUrl={thumb}
      status='success'
      photoId={photoId}
      error={rowError}
      selected={selected}
      onToggleSelect={onToggleSelect}
      onRemove={onRemove}
    >
      {children}
    </FileData>
  )
}
