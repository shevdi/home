import styled from 'styled-components'
import { FileMeta, formatBytes, formatDate, formatGps } from '../utils/uploadPhotoMeta'

const FileItem = styled.div`
  padding: 0.5rem 0;
  font-size: 0.9rem;
  color: #333;
`

const renderFileMeta = (meta: FileMeta) => (
  <>
    &nbsp;|&nbsp;
    {meta.type} · {formatBytes(meta.size)}
    {meta.width && meta.height ? ` · ${meta.width} x ${meta.height}` : ''}
    {meta.make || meta.model ? ` · ${[meta.make, meta.model].filter(Boolean).join(' ')}` : ''}
    {meta.takenAt ? ` · ${formatDate(meta.takenAt)}` : ''}
    {formatGps(meta.gps) ? ` · ${formatGps(meta.gps)}` : ''}
  </>
)

type FileDataProps = {
  file: File
  meta?: FileMeta
}

export const FileData = ({ file, meta }: FileDataProps) => (
  <FileItem>
    {file.name}
    {meta && renderFileMeta(meta)}
  </FileItem>
)
