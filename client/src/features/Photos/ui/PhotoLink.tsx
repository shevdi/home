import styled from 'styled-components'
import { ILink } from '@/shared/types'
import { Link } from 'react-router'

const Image = styled.img`
  display: block;
  width: 100%;
  height: 100%;
`

const Figure = styled.figure<{ featured: boolean }>`
  position: relative;
  display: inline-block;
  margin: 0;
  overflow: hidden;
  border-radius: 4px;
  ${({ featured }) => (featured ? 'grid-row: span 2;' : '')};
  ${({ featured }) => (featured ? 'grid-column: span 2' : '')};
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

export function PhotoLink({ photo }: { photo: ILink }) {
  return (
    <Figure key={photo._id} featured={photo.priority ? photo.priority > 1 : false}>
      <Link to={`/photos/${photo._id}`}>
        <Image
          src={(photo.priority ? photo.priority > 1 : false) ? photo.mdSizeUrl : photo.smSizeUrl}
          alt={photo.title}
        />
      </Link>
      {photo.title && <Figcaption>{photo.title}</Figcaption>}
    </Figure>
  )
}
