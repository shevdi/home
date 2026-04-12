import type { ReactNode } from 'react'
import { useEffect, useState } from 'react'
import styled from 'styled-components'
import type { FileMeta } from '../utils/uploadPhotoMeta'
import type { UploadFileStatus } from '../model/uploadSlice'
import { FileMeta as FileMetaComponent } from './FileMeta'
import { Status, OpenLink } from './Status'

type FileDataProps = {
  /** File object - when absent (e.g. after page return), use thumbnailUrl if available */
  file?: File
  name: string
  meta?: FileMeta
  status?: UploadFileStatus
  photoId?: string
  error?: string
  /** Server thumbnail URL - for uploaded photos */
  thumbnailUrl?: string
  /** Data URL thumbnail - for pending/uploading, persists across navigation */
  thumbnailDataUrl?: string
  /** Remove from staged list (e.g. before upload) */
  onRemove?: () => void
  selected?: boolean
  onToggleSelect?: () => void
  /** Extra content rendered below meta (e.g. FileOptionsSummary) */
  children?: ReactNode
}

export const FileData = ({
  file,
  name,
  meta,
  status,
  photoId,
  error,
  thumbnailUrl,
  thumbnailDataUrl,
  onRemove,
  selected,
  onToggleSelect,
  children,
}: FileDataProps) => {
  const [localThumbUrl, setLocalThumbUrl] = useState<string | null>(null)

  useEffect(() => {
    if (!file?.type.startsWith('image/')) return
    if (typeof URL.createObjectURL !== 'function') return
    const url = URL.createObjectURL(file)
    setLocalThumbUrl(url)
    return () => URL.revokeObjectURL(url)
  }, [file])

  const displayStatus = status ?? 'pending'
  const thumbSrc = localThumbUrl ?? thumbnailUrl ?? thumbnailDataUrl

  return (
    <FileItem
      $selected={selected}
      $selectable={!!onToggleSelect}
      onClick={onToggleSelect}
    >
      {onToggleSelect && (
        <SelectIndicator $selected={!!selected} aria-label={selected ? 'Снять выделение' : 'Выбрать'}>
          {selected ? '☑' : '☐'}
        </SelectIndicator>
      )}
      <Thumbnail>
        {thumbSrc ? (
          <img src={thumbSrc} alt='' />
        ) : (
          <div style={{ width: '100%', height: '100%', background: 'var(--input-disabled-color)' }} />
        )}
      </Thumbnail>
      <FileContent>
        <FileNameRow>
          {displayStatus === 'success' && photoId ? (
            <OpenLink to={`/photos/${photoId}`}>{name}</OpenLink>
          ) : (
            <span>{name}</span>
          )}
          <Status status={displayStatus} photoId={photoId} error={error} />
        </FileNameRow>
        {meta && <FileMetaComponent meta={meta} />}
        {children}
      </FileContent>
      {onRemove && (
        <RemoveFileButton
          type='button'
          onClick={(e) => {
            e.stopPropagation()
            onRemove()
          }}
          aria-label={`Удалить файл ${name}`}
        >
          ×
        </RemoveFileButton>
      )}
    </FileItem>
  )
}

const FileItem = styled.div<{ $selected?: boolean; $selectable?: boolean }>`
  display: flex;
  align-items: flex-start;
  gap: 0.75rem;
  padding: 0.5rem;
  font-size: 0.9rem;
  color: var(--text-color);
  border-radius: var(--radius-sm);
  transition: background-color 0.15s;
  ${({ $selectable }) => $selectable && 'cursor: pointer;'}
  ${({ $selected }) => $selected && 'background-color: var(--accent-bg, rgba(76, 175, 80, 0.08));'}

  &:hover {
    ${({ $selectable }) => $selectable && 'background-color: var(--accent-bg, rgba(76, 175, 80, 0.05));'}
  }
`

const SelectIndicator = styled.span<{ $selected: boolean }>`
  flex-shrink: 0;
  font-size: 1.1rem;
  line-height: 1;
  user-select: none;
  color: ${({ $selected }) => ($selected ? 'var(--accent, #4caf50)' : 'var(--text-muted)')};
`

const Thumbnail = styled.div`
  flex-shrink: 0;
  width: 48px;
  height: 48px;
  border-radius: var(--radius-sm);
  overflow: hidden;
  background: var(--input-bg);
  border: 1px solid var(--input-border);

  img {
    width: 100%;
    height: 100%;
    object-fit: cover;
  }
`

const FileContent = styled.div`
  flex: 1;
  min-width: 0;
`

const FileNameRow = styled.div`
  display: flex;
  align-items: center;
  gap: 0.5rem;
  flex-wrap: wrap;
`

const RemoveFileButton = styled.button`
  flex-shrink: 0;
  border: none;
  background: transparent;
  color: var(--text-muted);
  font-size: 1.25rem;
  line-height: 1;
  cursor: pointer;
  padding: 0.15rem 0.25rem;
  opacity: 0.85;

  &:hover {
    opacity: 1;
    color: var(--text-color);
  }
`
