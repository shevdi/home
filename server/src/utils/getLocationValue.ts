import type { ReverseGeocodeResponse } from '../services/nominatim'
import type { DaDataGeolocateResponse } from '../services/dadata'

export type LocationValue = {
  country: string[]
  city: string[]
}

const CYRILLIC_REGEX = /[\u0400-\u04FF]/
const LATIN_REGEX = /[a-zA-Z]/

function getScriptPriority(value: string): number {
  if (CYRILLIC_REGEX.test(value)) return 0 // Russian first
  if (LATIN_REGEX.test(value)) return 1 // English second
  return 2 // Other languages last
}

function buildUniqueOrderedArray(values: string[]): string[] {
  const seen = new Set<string>()
  const result: string[] = []

  for (const v of values) {
    const trimmed = v?.trim()
    if (!trimmed || seen.has(trimmed)) continue
    seen.add(trimmed)
    result.push(trimmed)
  }

  return result.sort((a, b) => getScriptPriority(a) - getScriptPriority(b))
}

function extractNominatimCountry(nominatim: ReverseGeocodeResponse | null | undefined): string[] {
  const values: string[] = []
  const addr = nominatim?.address
  if (!addr) return values

  const country = addr.country
  if (country) values.push(country)

  return values
}

function extractNominatimCity(nominatim: ReverseGeocodeResponse | null | undefined): string[] {
  const values: string[] = []
  const addr = nominatim?.address
  if (!addr) return values

  const cityKeys = ['city', 'town', 'village', 'municipality', 'county'] as const
  for (const key of cityKeys) {
    const val = addr[key]
    if (val) values.push(val)
  }

  return values
}

function extractDaDataCountry(dadata: DaDataGeolocateResponse | null | undefined): string[] {
  const values: string[] = []
  const suggestion = dadata?.suggestions?.[0]
  const data = suggestion?.data as Record<string, unknown> | undefined
  if (!data) return values

  const country = data.country
  if (typeof country === 'string' && country) values.push(country)

  return values
}

function extractDaDataCity(dadata: DaDataGeolocateResponse | null | undefined): string[] {
  const values: string[] = []
  const suggestion = dadata?.suggestions?.[0]
  const data = suggestion?.data as Record<string, unknown> | undefined
  if (!data) return values

  const cityKeys = ['city', 'settlement', 'region'] as const
  for (const key of cityKeys) {
    const val = data[key]
    if (typeof val === 'string' && val) values.push(val)
  }

  return values
}

export function getLocationValue(sources: [
  ReverseGeocodeResponse | null | undefined,
  DaDataGeolocateResponse | null | undefined
]): LocationValue {
  const [nominatim, dadata] = sources

  const countryValues = [
    ...extractNominatimCountry(nominatim),
    ...extractDaDataCountry(dadata),
  ]
  const cityValues = [
    ...extractNominatimCity(nominatim),
    ...extractDaDataCity(dadata),
  ]

  return {
    country: buildUniqueOrderedArray(countryValues),
    city: buildUniqueOrderedArray(cityValues),
  }
}
