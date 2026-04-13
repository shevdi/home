import styled from 'styled-components'
import type { FileMeta as FileMetaType} from '../utils/uploadPhotoMeta';
import { formatBytes, formatDate, formatGps } from '../utils/uploadPhotoMeta'

const MetaText = styled.span`
  color: var(--text-muted);
  font-size: 0.85em;
`

type FileMetaProps = {
  meta: FileMetaType
}

export const FileMeta = ({ meta }: FileMetaProps) => (
  <MetaText>
    {meta.type} · {formatBytes(meta.size)}
    {meta.width && meta.height ? ` · ${meta.width} x ${meta.height}` : ''}
    {meta.make || meta.model ? ` · ${[meta.make, meta.model].filter(Boolean).join(' ')}` : ''}
    {meta.takenAt ? ` · ${formatDate(meta.takenAt)}` : ''}
    {formatGps(meta.gps) ? ` · ${formatGps(meta.gps)}` : ''}
  </MetaText>
)
