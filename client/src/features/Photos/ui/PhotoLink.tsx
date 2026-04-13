import styled from 'styled-components'
import type { ILink } from '@shevdi-home/shared'
import { Link } from 'react-router'
import { formatDate } from '../utils/uploadPhotoMeta'
import { PrivateBadge } from './PrivateBadge'

interface IProps {
  photo: ILink
  disabled?: boolean
}

export function PhotoLink({ photo, disabled }: IProps) {
  const takenAtLabel = photo.meta?.takenAt ? formatDate(photo.meta.takenAt) : ''
  const city = photo.location?.value?.city?.[0]
  const country = photo.location?.value?.country?.[0]

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
        {takenAtLabel && <DateCaption>{takenAtLabel}</DateCaption>}
      </Link>
      {(country || city) && (
        <Figcaption>
          {city}
          {city && country && ', '}
          {country}
        </Figcaption>
      )}
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
  padding: 0.75rem 1rem;
  background: linear-gradient(to bottom, rgba(0, 0, 0, 0.7), transparent);
  color: #fff;
  font-size: 0.85rem;
  font-weight: 500;
  text-align: left;
  opacity: 0;
  transition: opacity var(--transition-fast);
  pointer-events: none;

  @media (hover: none) {
    opacity: 1;
  }
`

const Figure = styled.figure<{ $featured: boolean }>`
  position: relative;
  display: inline-block;
  margin: 0;
  overflow: hidden;
  border-radius: var(--radius-lg);
  box-shadow:
    0 2px 12px rgba(0, 0, 0, 0.08),
    0 1px 0 rgba(255, 255, 255, 0.15) inset;
  border: 1px solid rgba(0, 0, 0, 0.04);
  ${({ $featured }) => ($featured ? '' : 'height: 250px;')};
  ${({ $featured }) => ($featured ? 'grid-row: span 2;' : '')};
  ${({ $featured }) => ($featured ? 'grid-column: span 2' : '')};
  transition:
    transform var(--transition-normal),
    box-shadow var(--transition-normal);

  &:hover {
    transform: translateY(-4px) scale(1.01);
    box-shadow:
      0 12px 32px rgba(0, 0, 0, 0.12),
      0 1px 0 rgba(255, 255, 255, 0.2) inset;
  }

  &:hover ${DateCaption}, &:focus-within ${DateCaption} {
    opacity: 1;
  }
`

const Figcaption = styled.figcaption`
  position: absolute;
  bottom: 0;
  left: 0;
  width: 100%;
  padding: 0.75rem 1rem;
  background: linear-gradient(to top, rgba(0, 0, 0, 0.75), transparent);
  color: #fff;
  font-size: 0.85rem;
  font-weight: 500;
  text-align: left;
`
