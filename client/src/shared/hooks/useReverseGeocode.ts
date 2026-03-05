import { useEffect, useState } from 'react'
import type { NominatimReverseResponse } from '@shevdi-home/shared'

const buildAddressLabel = (data: NominatimReverseResponse): string | null => {
  const address = data.address
  if (!address) {
    return data.display_name ?? data.name ?? null
  }

  const city = address.city ?? address.town ?? address.village ?? address.hamlet
  const street = address.street ?? address.road
  const parts = [address.country, city, street, address.house_number].filter(Boolean)
  return parts.length > 0 ? parts.join(', ') : data.display_name ?? data.name ?? null
}

export const useReverseGeocode = (lat: number, lon: number, enabled = true) => {
  const [label, setLabel] = useState<string | null>(null)

  useEffect(() => {
    if (!enabled) {
      setLabel(null)
      return
    }
    if (!Number.isFinite(lat) || !Number.isFinite(lon)) {
      setLabel(null)
      return
    }

    const controller = new AbortController()
    const resolveLocation = async () => {
      try {
        const url = new URL('https://nominatim.openstreetmap.org/reverse')
        url.searchParams.set('format', 'jsonv2')
        url.searchParams.set('lat', String(lat))
        url.searchParams.set('lon', String(lon))
        url.searchParams.set('zoom', '14')
        url.searchParams.set('addressdetails', '1')

        const response = await fetch(url.toString(), { signal: controller.signal })
        if (!response.ok) {
          setLabel(null)
          return
        }
        const data: NominatimReverseResponse = await response.json()
        setLabel(buildAddressLabel(data))
      } catch (error) {
        if (error instanceof DOMException && error.name === 'AbortError') {
          return
        }
        setLabel(null)
      }
    }

    resolveLocation()
    return () => controller.abort()
  }, [enabled, lat, lon])

  return label
}
