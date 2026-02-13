export type ReverseGeocodeAddress = Record<string, string>

export type ReverseGeocodeResponse = {
  place_id?: number
  licence?: string
  osm_type?: string
  osm_id?: string
  boundingbox?: string[]
  lat?: string
  lon?: string
  display_name?: string
  name?: string
  category?: string
  type?: string
  place_rank?: number
  importance?: number
  icon?: string
  address?: ReverseGeocodeAddress
  extratags?: Record<string, string>
}

export async function nominatimReverseGeocode(lat: number, lon: number): Promise<ReverseGeocodeResponse | null> {
  if (!Number.isFinite(lat) || !Number.isFinite(lon)) {
    return null
  }

  try {
    const url = new URL('https://nominatim.openstreetmap.org/reverse')
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

    console.log(response)

    if (!response.ok) {
      return null
    }

    const data: ReverseGeocodeResponse = await response.json()
    return data
  } catch {
    return null
  }
}
