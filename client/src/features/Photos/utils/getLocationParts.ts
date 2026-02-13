import type { ILocation } from '@/shared/types/common/links'

export type LocationParts = { city: string | null; country: string | null }

export function getLocationParts(location?: ILocation): LocationParts {
  if (!location) return { city: null, country: null }

  const dadata = location.dadata as Record<string, string | undefined | null> | undefined
  const nominatim = location.nominatim as { address?: Record<string, string | undefined> } | undefined

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
