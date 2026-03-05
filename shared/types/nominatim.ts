/** Nominatim API address object - keys like country, city, town, etc. */
export type NominatimAddress = Record<string, string>

/** Nominatim reverse geocode API response shape */
export interface NominatimReverseResponse {
  [key: string]: unknown
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
  address?: NominatimAddress
  extratags?: Record<string, string>
}
