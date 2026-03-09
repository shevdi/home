import { useEffect, useState } from 'react'
import styled from 'styled-components'
import { FileMeta } from '../utils/uploadPhotoMeta'
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
    <FileItem>
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
      </FileContent>
    </FileItem>
  )
}

const FileItem = styled.div`
  display: flex;
  align-items: flex-start;
  gap: 0.75rem;
  padding: 0.5rem 0;
  font-size: 0.9rem;
  color: var(--text-color);
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
