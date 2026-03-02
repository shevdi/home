export type DaDataSuggestion = {
  value: string
  unrestricted_value: string
  data: Record<string, unknown>
}

export type DaDataGeolocateResponse = {
  suggestions: DaDataSuggestion[]
}

export async function dadataReverseGeocode(
  lat: number,
  lon: number,
  apiKey?: string
): Promise<DaDataGeolocateResponse | null> {
  if (!Number.isFinite(lat) || !Number.isFinite(lon)) {
    return null
  }

  const token = apiKey ?? process.env.DADATA_API_KEY
  if (!token) {
    return null
  }

  try {
    const baseUrl = process.env.DADATA_URL || 'https://suggestions.dadata.ru'
    const response = await fetch(`${baseUrl}/suggestions/api/4_1/rs/geolocate/address`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        Accept: 'application/json',
        Authorization: `Token ${token}`,
      },
      body: JSON.stringify({ lat, lon }),
    })

    if (!response.ok) {
      return null
    }

    const data: DaDataGeolocateResponse = await response.json()
    return data
  } catch {
    return null
  }
}
