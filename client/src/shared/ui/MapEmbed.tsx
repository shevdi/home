import styled from 'styled-components'

type MapEmbedProps = {
  lat: number
  lon: number
  label?: string
  zoom?: number
  height?: number
  linkText?: string
}

export const MapEmbed = ({
  lat,
  lon,
  label,
  zoom = 14,
  height = 280,
  linkText = 'Открыть в Google Maps',
}: MapEmbedProps) => {
  const mapQuery = `${lat},${lon}`
  const encodedQuery = encodeURIComponent(mapQuery)

  return (
    <MapSection>
      {label && <MapLabel>{label}</MapLabel>}
      <MapFrame
        title='Map location'
        loading='lazy'
        referrerPolicy='no-referrer-when-downgrade'
        src={`https://maps.google.com/maps?q=${encodedQuery}&z=${zoom}&output=embed`}
        $height={height}
        allowFullScreen
      />
      <MapLink
        href={`https://www.google.com/maps/search/?api=1&query=${encodedQuery}`}
        target='_blank'
        rel='noreferrer'
      >
        {linkText}
      </MapLink>
    </MapSection>
  )
}

const MapSection = styled.div`
  margin-top: 1rem;
`

const MapLabel = styled.div`
  color: #555;
  font-size: 0.9rem;
  margin-bottom: 0.5rem;
  text-align: center;
`

const MapFrame = styled.iframe<{ $height: number }>`
  width: 100%;
  height: ${({ $height }) => `${$height}px`};
  border: 0;
  border-radius: 8px;
`

const MapLink = styled.a`
  display: block;
  margin-top: 0.5rem;
  text-align: center;
`
