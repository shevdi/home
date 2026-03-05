import type { NominatimReverseResponse } from '@shevdi-home/shared'

export async function nominatimReverseGeocode(lat: number, lon: number): Promise<NominatimReverseResponse | null> {
  if (!Number.isFinite(lat) || !Number.isFinite(lon)) {
    return null
  }

  try {
    const baseUrl = process.env.NOMINATIM_URL || 'https://nominatim.openstreetmap.org'
    const url = new URL(`${baseUrl}/reverse`)
    url.searchParams.set('format', 'jsonv2')
    url.searchParams.set('lat', String(lat))
    url.searchParams.set('lon', String(lon))
    url.searchParams.set('zoom', '14')
    url.searchParams.set('addressdetails', '1')

    const response = await fetch(url.toString(), {
      headers: {
        'User-Agent': 'home-auth-photo-service/1.0',
        'Accept-Language': 'ru, en;q=0.9',
      },
    })

    if (!response.ok) {
      return null
    }

    const data: NominatimReverseResponse = await response.json()
    return data
  } catch {
    return null
  }
}
