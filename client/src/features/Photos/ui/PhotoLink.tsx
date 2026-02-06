import styled from 'styled-components'
import { ILink } from '@/shared/types'
import { Link } from 'react-router'
import { formatDate } from '../utils/uploadPhotoMeta'
import { PrivateBadge } from './PrivateBadge'

interface IProps {
  photo: ILink
  disabled?: boolean
}

export function PhotoLink({ photo, disabled }: IProps) {
  const takenAtLabel = photo.meta?.takenAt ? formatDate(photo.meta.takenAt) : ''

  return (
    <Figure key={photo._id} $featured={photo.priority ? photo.priority > 1 : false}>
      {photo.private && <PrivateBadge />}
      <Link
        to={{
          pathname: `/photos/${photo._id}`,
        }}
        onClick={(e) => {
          if (disabled) e.preventDefault()
        }}
        aria-disabled={disabled}
        tabIndex={disabled ? -1 : 0}
        style={disabled ? { pointerEvents: 'none' } : undefined}
      >
        <Image
          src={((photo.priority ? photo.priority > 1 : false) ? photo.mdSizeUrl : photo.smSizeUrl) || photo.mdSizeUrl}
          alt={photo.title}
        />
      </Link>
      {takenAtLabel && <DateCaption>{takenAtLabel}</DateCaption>}
      {photo.title && <Figcaption>{photo.title}</Figcaption>}
    </Figure>
  )
}

const Image = styled.img`
  display: block;
  width: 100%;
  height: 100%;
  object-fit: cover;
`

const DateCaption = styled.figcaption`
  position: absolute;
  top: 0;
  left: 0;
  width: 100%;
  padding: 12px;
  background: rgba(0, 0, 0, 0.6);
  color: #fff;
  font-size: 0.85rem;
  text-align: center;
  opacity: 0;
  transition: opacity 0.2s ease;
  pointer-events: none;
`

const Figure = styled.figure<{ $featured: boolean }>`
  position: relative;
  display: inline-block;
  margin: 0;
  overflow: hidden;
  border-radius: 4px;
  ${({ $featured }) => ($featured ? 'height: 410px;' : 'height: 200px;')};
  ${({ $featured }) => ($featured ? 'grid-row: span 2;' : '')};
  ${({ $featured }) => ($featured ? 'grid-column: span 2' : '')};

  &:hover ${DateCaption}, &:focus-within ${DateCaption} {
    opacity: 1;
  }
`

const Figcaption = styled.figcaption`
  text-align: right;
  position: absolute;
  bottom: 0;
  left: 0;
  width: 100%;
  padding: 12px;
  background: rgba(0, 0, 0, 0.6);
  color: #fff;
  font-size: 0.9rem;
  text-align: center;
`
