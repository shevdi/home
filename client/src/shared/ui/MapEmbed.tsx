import { Link } from 'react-router'
import styled from 'styled-components'
import type { ILocation } from '@/shared/types/common/links'
import { buildSearchParams } from '@/shared/utils'

type MapEmbedProps = {
  lat: number
  lon: number
  location?: ILocation
  zoom?: number
  height?: number
  linkText?: string
}

export const MapEmbed = ({
  lat,
  lon,
  location,
  zoom = 14,
  height = 280,
  linkText = 'Открыть в Google Maps',
}: MapEmbedProps) => {
  const mapQuery = `${lat},${lon}`
  const encodedQuery = encodeURIComponent(mapQuery)
  const city = location?.value?.city?.[0]
  const country = location?.value?.country?.[0]
  const hasLocation = city || country

  return (
    <MapSection>
      {hasLocation && (
        <MapLabel>
          {city && (
            <LocationLink to={{ pathname: '/photos', search: buildSearchParams({ city: [city] }) }}>
              {city}
            </LocationLink>
          )}
          {city && country && ', '}
          {country && (
            <LocationLink to={{ pathname: '/photos', search: buildSearchParams({ country: [country] }) }}>
              {country}
            </LocationLink>
          )}
        </MapLabel>
      )}
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
  margin-bottom: 0.5rem;
  text-align: center;
`

const LocationLink = styled(Link)`
  text-align: right;
  margin-top: 0.25rem;
  text-decoration: none;
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
