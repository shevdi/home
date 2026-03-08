import type { ILocation } from '@shevdi-home/shared'

export type LocationParts = { city: string | null; country: string | null }

export function getLocationParts(location?: ILocation): LocationParts {
  if (!location) return { city: null, country: null }

  const { dadata, nominatim } = location

  const fromDadata = (): LocationParts | null => {
    if (!dadata) return null
    const country = dadata.country ?? null
    const city = dadata.city ?? dadata.settlement ?? dadata.region ?? null
    return country || city ? { city, country } : null
  }

  const fromNominatim = (): LocationParts | null => {
    const address = nominatim?.address
    if (!address) return null
    const country = address.country ?? null
    const city = address.city ?? address.town ?? address.village ?? address.hamlet ?? null
    return country || city ? { city, country } : null
  }

  return fromDadata() ?? fromNominatim() ?? { city: null, country: null }
}
